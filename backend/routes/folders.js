// backend/routes/folders.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { validate, authValidations } = require("../middleware/validator");
const folderController = require("../controllers/folderController");

router.post(
  "/:workspaceId",
  protect,
  validate(authValidations.folder),
  folderController.createFolder,
);
router.get("/:id", protect, folderController.getFolder);
router.put("/:id", protect, folderController.updateFolder);
router.patch("/:id/rename", protect, folderController.renameFolder); // ✅ Add rename route
router.delete("/:id", protect, folderController.deleteFolder);

module.exports = router;
