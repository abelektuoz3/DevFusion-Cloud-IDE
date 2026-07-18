// backend/controllers/folderController.js
const Folder = require("../models/Folder");
const File = require("../models/File");

// @desc    Create a folder
// @route   POST /api/folders/:workspaceId
// @access  Private
exports.createFolder = async (req, res) => {
  try {
    const { name, parentFolderId } = req.body;
    const workspaceId = req.params.workspaceId;

    const existingFolder = await Folder.findOne({
      workspace: workspaceId,
      parentFolder: parentFolderId || null,
      name,
    });

    if (existingFolder) {
      return res.status(400).json({ message: "Folder already exists" });
    }

    const folder = await Folder.create({
      name,
      workspace: workspaceId,
      parentFolder: parentFolderId || null,
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Folder created successfully",
      folder,
    });
  } catch (error) {
    console.error("Create folder error:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

// @desc    Get folder with children
// @route   GET /api/folders/:id
// @access  Private
exports.getFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).populate(
      "workspace",
      "name owner",
    );

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const children = await Folder.find({ parentFolder: folder._id });
    const files = await File.find({ folder: folder._id });

    res.json({
      folder,
      children,
      files,
    });
  } catch (error) {
    console.error("Get folder error:", error);
    res.status(500).json({ message: "Failed to fetch folder" });
  }
};

// @desc    Update folder
// @route   PUT /api/folders/:id
// @access  Private
exports.updateFolder = async (req, res) => {
  try {
    const { name } = req.body;

    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    folder.name = name;
    await folder.save();

    res.json({
      message: "Folder updated successfully",
      folder,
    });
  } catch (error) {
    console.error("Update folder error:", error);
    res.status(500).json({ message: "Failed to update folder" });
  }
};

// ✅ @desc    Rename folder
// @route   PATCH /api/folders/:id/rename
// @access  Private
exports.renameFolder = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if another folder with same name exists in same parent
    const existingFolder = await Folder.findOne({
      workspace: folder.workspace,
      parentFolder: folder.parentFolder,
      name: name.trim(),
      _id: { $ne: folder._id },
    });

    if (existingFolder) {
      return res
        .status(400)
        .json({ message: "A folder with this name already exists" });
    }

    folder.name = name.trim();
    await folder.save();

    res.json({
      message: "Folder renamed successfully",
      folder,
    });
  } catch (error) {
    console.error("Rename folder error:", error);
    res.status(500).json({ message: "Failed to rename folder" });
  }
};

// @desc    Delete folder
// @route   DELETE /api/folders/:id
// @access  Private
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await File.deleteMany({ folder: folder._id });
    const children = await Folder.find({ parentFolder: folder._id });
    for (const child of children) {
      await File.deleteMany({ folder: child._id });
      await child.deleteOne();
    }
    await folder.deleteOne();

    res.json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Delete folder error:", error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};
