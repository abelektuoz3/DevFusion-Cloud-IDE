// routes/workspaces.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { validate, authValidations } = require("../middleware/validator");
const workspaceController = require("../controllers/workspaceController");

router.post(
  "/",
  protect,
  validate(authValidations.workspace),
  workspaceController.createWorkspace,
);
router.get("/", protect, workspaceController.getWorkspaces);
router.get("/:id", protect, workspaceController.getWorkspaceById);
router.put("/:id", protect, workspaceController.updateWorkspace);
router.delete("/:id", protect, workspaceController.deleteWorkspace);

module.exports = router;
