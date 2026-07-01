const Project = require("../models/Project");

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, language, code, description, isPublic } = req.body;

    const project = new Project({
      title,
      language: language || "javascript",
      code: code || "// Write your code here",
      description,
      isPublic: isPublic || false,
      owner: req.user._id,
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
};

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user._id })
      .sort({ createdAt: -1 })
      .select("-code"); // Don't send code for list view

    res.json(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

// @desc    Get a single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { title, language, code, description, isPublic } = req.body;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title, language, code, description, isPublic },
      { new: true, runValidators: true },
    );

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
