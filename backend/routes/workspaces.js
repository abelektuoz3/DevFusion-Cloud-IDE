// backend/routes/workspaces.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const workspaceController = require("../controllers/workspaceController");

// Debug middleware to log all requests to this router
router.use((req, res, next) => {
  console.log(`📝 Workspace route hit: ${req.method} ${req.path}`);
  next();
});

// @route   POST /api/workspaces
// @desc    Create a workspace
// @access  Private
router.post("/", protect, workspaceController.createWorkspace);

// @route   GET /api/workspaces
// @desc    Get all workspaces for a user
// @access  Private
router.get("/", protect, workspaceController.getWorkspaces);

// @route   GET /api/workspaces/:id
// @desc    Get a single workspace by ID
// @access  Private
router.get("/:id", protect, workspaceController.getWorkspaceById);

// @route   PUT /api/workspaces/:id
// @desc    Update a workspace
// @access  Private
router.put("/:id", protect, workspaceController.updateWorkspace);

// @route   DELETE /api/workspaces/:id
// @desc    Delete a workspace
// @access  Private
router.delete("/:id", protect, workspaceController.deleteWorkspace);

module.exports = router;
