// backend/controllers/fileController.js
const File = require("../models/File");
const Folder = require("../models/Folder");

// @desc    Create a file
// @route   POST /api/files/:workspaceId
// @access  Private
exports.createFile = async (req, res) => {
  try {
    const { name, content = "", folderId } = req.body;
    const workspaceId = req.params.workspaceId;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "File name is required" });
    }

    const existingFile = await File.findOne({
      workspace: workspaceId,
      folder: folderId || null,
      name: name.trim(),
    });

    if (existingFile) {
      return res.status(400).json({ message: "File already exists" });
    }

    const fileData = {
      name: name.trim(),
      content: content || "",
      folder: folderId || null,
      workspace: workspaceId,
      owner: req.user._id,
    };

    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (folder) {
        fileData.path = `${folder.path}/${name.trim()}`;
      } else {
        fileData.path = `/${name.trim()}`;
      }
    } else {
      fileData.path = `/${name.trim()}`;
    }

    const file = new File(fileData);
    await file.save();

    res.status(201).json({
      message: "File created successfully",
      file,
    });
  } catch (error) {
    console.error("Create file error:", error);
    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          message: "A file with this name already exists in this location",
        });
    }
    res.status(500).json({ message: "Failed to create file" });
  }
};

// @desc    Get file content
// @route   GET /api/files/:id
// @access  Private
exports.getFileContent = async (req, res) => {
  try {
    const file = await File.findById(req.params.id)
      .populate("folder", "name path")
      .populate("workspace", "name");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ file });
  } catch (error) {
    console.error("Get file error:", error);
    res.status(500).json({ message: "Failed to fetch file" });
  }
};

// @desc    Update file content
// @route   PUT /api/files/:id
// @access  Private
exports.updateFileContent = async (req, res) => {
  try {
    const { content } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    file.content = content;
    file.isSaved = true;
    file.lastModified = new Date();
    await file.save();

    res.json({
      message: "File saved successfully",
      file,
    });
  } catch (error) {
    console.error("Update file error:", error);
    res.status(500).json({ message: "Failed to update file" });
  }
};

// ✅ @desc    Rename file
// @route   PATCH /api/files/:id/rename
// @access  Private
exports.renameFile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "File name is required" });
    }

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if another file with same name exists in same folder
    const existingFile = await File.findOne({
      workspace: file.workspace,
      folder: file.folder,
      name: name.trim(),
      _id: { $ne: file._id },
    });

    if (existingFile) {
      return res
        .status(400)
        .json({ message: "A file with this name already exists" });
    }

    file.name = name.trim();
    await file.save();

    res.json({
      message: "File renamed successfully",
      file,
    });
  } catch (error) {
    console.error("Rename file error:", error);
    res.status(500).json({ message: "Failed to rename file" });
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ message: "Failed to delete file" });
  }
};

// @desc    Autosave file
// @route   POST /api/files/:id/autosave
// @access  Private
exports.autosaveFile = async (req, res) => {
  try {
    const { content } = req.body;

    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    file.content = content;
    file.isSaved = true;
    file.lastModified = new Date();
    await file.save();

    res.json({
      message: "File autosaved",
      file: {
        id: file._id,
        size: file.size,
        lastModified: file.lastModified,
      },
    });
  } catch (error) {
    console.error("Autosave error:", error);
    res.status(500).json({ message: "Failed to autosave file" });
  }
};
