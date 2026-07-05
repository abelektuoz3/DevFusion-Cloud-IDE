// backend/routes/workspaces.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const workspaceController = require("../controllers/workspaceController");

// Debug middleware
router.use((req, res, next) => {
  console.log(`📝 Workspace route: ${req.method} ${req.path}`);
  next();
});

// Routes - POST must be first
router.post("/", protect, workspaceController.createWorkspace);
router.get("/", protect, workspaceController.getWorkspaces);
router.get("/:id", protect, workspaceController.getWorkspaceById);
router.put("/:id", protect, workspaceController.updateWorkspace);
router.delete("/:id", protect, workspaceController.deleteWorkspace);

// Handle OPTIONS for CORS
router.options("/", (req, res) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.sendStatus(200);
});

module.exports = router;
