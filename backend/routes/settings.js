// backend/routes/settings.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const settingsController = require("../controllers/settingsController");

// @route   GET /api/settings
// @desc    Get user settings
// @access  Private
router.get("/", protect, settingsController.getSettings);

// @route   PUT /api/settings
// @desc    Update all settings
// @access  Private
router.put("/", protect, settingsController.updateSettings);

// @route   PATCH /api/settings/:key
// @desc    Update specific setting
// @access  Private
router.patch("/:key", protect, settingsController.updateSetting);

// @route   POST /api/settings/reset
// @desc    Reset settings to default
// @access  Private
router.post("/reset", protect, settingsController.resetSettings);

module.exports = router;
