// backend/controllers/settingsController.js
const User = require("../models/User");

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("settings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      settings: user.settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Failed to get settings" });
  }
};

// @desc    Update all settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({ message: "Settings object is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings },
      { new: true, runValidators: true },
    ).select("settings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }

    res.status(500).json({ message: "Failed to update settings" });
  }
};

// @desc    Update specific setting
// @route   PATCH /api/settings/:key
// @access  Private
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ message: "Key and value are required" });
    }

    const updateQuery = {};
    updateQuery[`settings.${key}`] = value;

    const user = await User.findByIdAndUpdate(req.user._id, updateQuery, {
      new: true,
      runValidators: true,
    }).select("settings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Setting updated successfully",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Update setting error:", error);
    res.status(500).json({ message: "Failed to update setting" });
  }
};

// @desc    Reset settings to default
// @route   POST /api/settings/reset
// @access  Private
exports.resetSettings = async (req, res) => {
  try {
    const defaultSettings = {
      language: "en",
      timezone: "Africa/Addis_Ababa",
      autoSave: true,
      autoSaveDelay: 1000,
      startup: "welcome",
      restoreWorkspace: true,
      openWelcome: true,
      recentProjects: 5,
      theme: "dark-plus",
      accentColor: "indigo",
      fontSize: 14,
      editorFont: "JetBrains Mono",
      iconTheme: "default",
      treeDensity: "medium",
      windowZoom: 100,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      minimap: true,
      lineNumbers: true,
      bracketPairColorization: true,
      stickyScroll: true,
      cursorStyle: "line",
      smoothScrolling: true,
      confirmBeforeDelete: true,
      trimTrailingWhitespace: true,
      insertFinalNewline: true,
      exclude: ["node_modules", "dist", "build", ".git"],
      defaultShell: "bash",
      terminalFontSize: 14,
      cursorBlink: true,
      terminalCursorStyle: "block",
      terminalTheme: "dark",
      keybindings: {
        save: "Ctrl+S",
        commandPalette: "Ctrl+Shift+P",
        quickOpen: "Ctrl+P",
        toggleSidebar: "Ctrl+B",
        comment: "Ctrl+/",
        search: "Ctrl+Shift+F",
      },
      gitUsername: "",
      gitEmail: "",
      autoFetch: true,
      confirmBeforePush: true,
      gitDecorations: true,
      cloudSync: true,
      backupFrequency: "daily",
      workspaceSync: true,
      desktopNotifications: true,
      sound: true,
      updateNotifications: true,
      friendActivity: true,
      twoFactorAuth: false,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { settings: defaultSettings },
      { new: true },
    ).select("settings");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Settings reset to default",
      settings: user.settings,
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    res.status(500).json({ message: "Failed to reset settings" });
  }
};
