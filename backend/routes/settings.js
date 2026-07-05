// routes/settings.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const settingsController = require("../controllers/settingsController");

router.get("/", protect, settingsController.getSettings);
router.put("/", protect, settingsController.updateSettings);
router.patch("/theme", protect, settingsController.updateTheme);

module.exports = router;
