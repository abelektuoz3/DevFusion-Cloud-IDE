// controllers/settingsController.js
const User = require("../models/User");

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");

    res.json({
      settings: user.settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings },
      { new: true, runValidators: true },
    ).select("settings");

    res.json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update theme
// @route   PATCH /api/settings/theme
// @access  Private
exports.updateTheme = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!["dark", "light", "vs-dark"].includes(theme)) {
      return res.status(400).json({ message: "Invalid theme" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { "settings.theme": theme },
      { new: true },
    ).select("settings");

    res.json({
      message: "Theme updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Update theme error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
