// routes/files.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { validate, authValidations } = require("../middleware/validator");
const fileController = require("../controllers/fileController");

router.post(
  "/:workspaceId",
  protect,
  validate(authValidations.file),
  fileController.createFile,
);
router.get("/:id", protect, fileController.getFileContent);
router.put("/:id", protect, fileController.updateFileContent);
router.patch("/:id/rename", protect, fileController.renameFile);
router.delete("/:id", protect, fileController.deleteFile);
router.post("/:id/autosave", protect, fileController.autosaveFile);

module.exports = router;
