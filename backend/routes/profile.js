// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const profileController = require("../controllers/profileController");

// @route   GET /api/profile
// @desc    Get user profile
// @access  Private
router.get("/", protect, profileController.getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put("/", protect, profileController.updateProfile);

// @route   PUT /api/profile/password
// @desc    Change password
// @access  Private
router.put("/password", protect, profileController.changePassword);

module.exports = router;
