// backend/controllers/workspaceController.js
const Workspace = require("../models/Workspace");
const Folder = require("../models/Folder");
const File = require("../models/File");
const Notification = require("../models/Notification");

// @desc    Create workspace
// @route   POST /api/workspaces
// @access  Private
exports.createWorkspace = async (req, res) => {
  console.log("📝 Create workspace called");
  console.log("📝 Request body:", req.body);
  console.log("📝 User:", req.user?._id);

  try {
    const { name, description, isPublic } = req.body;

    // Validate name
    if (!name || name.trim() === "") {
      console.log("❌ Name validation failed");
      return res.status(400).json({ message: "Workspace name is required" });
    }

    console.log("✅ Creating workspace with name:", name);

    // Create workspace
    const workspace = await Workspace.create({
      name: name.trim(),
      description: description || "",
      owner: req.user._id,
      isPublic: isPublic || false,
    });

    console.log("✅ Workspace created:", workspace._id);

    // ✅ Create root folder with explicit path
    const rootFolder = new Folder({
      name: "root",
      workspace: workspace._id,
      parentFolder: null,
      owner: req.user._id,
      path: `/${workspace._id}/root`, // Explicitly set path
    });

    await rootFolder.save();
    console.log("✅ Root folder created:", rootFolder._id);

    // Update workspace with root folder
    workspace.rootFolder = rootFolder._id;
    await workspace.save();

    // Create welcome notification
    await Notification.create({
      userId: req.user._id,
      type: "success",
      title: "Workspace Created! 🎉",
      message: `Your workspace "${name}" has been created successfully.`,
      link: `/workspace/${workspace._id}`,
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace: {
        ...workspace.toJSON(),
        rootFolder: rootFolder,
      },
    });
  } catch (error) {
    console.error("❌ Create workspace error:", error);
    console.error("❌ Error stack:", error.stack);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Workspace with this name already exists" });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({
      message: "Failed to create workspace",
      error: error.message,
    });
  }
};

// @desc    Get all workspaces
// @route   GET /api/workspaces
// @access  Private
exports.getWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .sort({ lastAccessed: -1 })
      .populate("owner", "username email avatar");

    res.json({ workspaces: workspaces || [] });
  } catch (error) {
    console.error("Get workspaces error:", error);
    res.status(500).json({ message: "Failed to fetch workspaces" });
  }
};

// @desc    Get workspace by ID with full tree
// @route   GET /api/workspaces/:id
// @access  Private
exports.getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate("owner", "username email avatar")
      .populate("members", "username email avatar");

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const isOwner = workspace.owner._id.toString() === req.user._id.toString();
    const isMember = workspace.members.some(
      (m) => m._id.toString() === req.user._id.toString(),
    );

    if (!isOwner && !isMember && !workspace.isPublic) {
      return res.status(403).json({ message: "Access denied" });
    }

    const folderTree = await getFolderTree(workspace.rootFolder);
    const files = await File.find({ workspace: workspace._id }).select(
      "name path folder language size updatedAt",
    );

    workspace.lastAccessed = new Date();
    await workspace.save();

    res.json({
      workspace,
      folderTree,
      files: files || [],
    });
  } catch (error) {
    console.error("Get workspace error:", error);
    res.status(500).json({ message: "Failed to fetch workspace" });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private
exports.updateWorkspace = async (req, res) => {
  try {
    const { name, description, isPublic, icon, starred } = req.body;

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (isPublic !== undefined) workspace.isPublic = isPublic;
    if (icon) workspace.icon = icon;
    if (starred !== undefined) workspace.starred = starred;

    await workspace.save();

    res.json({
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (error) {
    console.error("Update workspace error:", error);
    res.status(500).json({ message: "Failed to update workspace" });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
exports.deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await File.deleteMany({ workspace: workspace._id });
    await deleteFolderTree(workspace.rootFolder);
    await workspace.deleteOne();

    res.json({ message: "Workspace deleted successfully" });
  } catch (error) {
    console.error("Delete workspace error:", error);
    res.status(500).json({ message: "Failed to delete workspace" });
  }
};

// ==================== Helper Functions ====================

async function getFolderTree(folderId) {
  if (!folderId) return null;

  const folder = await Folder.findById(folderId);
  if (!folder) return null;

  const children = await Folder.find({ parentFolder: folderId });
  const files = await File.find({ folder: folderId }).select(
    "name path language size updatedAt",
  );

  const tree = {
    ...folder.toJSON(),
    children: [],
    files: files || [],
  };

  for (const child of children) {
    const childTree = await getFolderTree(child._id);
    if (childTree) {
      tree.children.push(childTree);
    }
  }

  return tree;
}

async function deleteFolderTree(folderId) {
  if (!folderId) return;

  const children = await Folder.find({ parentFolder: folderId });
  for (const child of children) {
    await deleteFolderTree(child._id);
  }
  await Folder.findByIdAndDelete(folderId);
}
