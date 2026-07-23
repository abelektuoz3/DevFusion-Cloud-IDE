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

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ message: "Settings object is required" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Safely merge settings
    const current = user.settings?.toObject ? user.settings.toObject() : user.settings || {};
    const mergedSettings = { ...current, ...settings };

    // Normalize theme values if needed
    if (mergedSettings.theme === "dark") mergedSettings.theme = "dark-plus";
    if (mergedSettings.theme === "light") mergedSettings.theme = "light-plus";
    if (mergedSettings.theme === "vs-dark") mergedSettings.theme = "dark-plus";
    if (mergedSettings.theme === "vs-light") mergedSettings.theme = "light-plus";

    // Normalize wordWrap values
    if (mergedSettings.wordWrap === true) mergedSettings.wordWrap = "on";
    if (mergedSettings.wordWrap === false) mergedSettings.wordWrap = "off";

    user.settings = mergedSettings;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest"
    );

    res.json({
      message: "Settings updated successfully",
      settings: user.settings,
      user: updatedUser,
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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentSettings = user.settings?.toObject
      ? user.settings.toObject()
      : user.settings || {};

    if (key.includes(".")) {
      const parts = key.split(".");
      let target = currentSettings;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!target[parts[i]] || typeof target[parts[i]] !== "object") {
          target[parts[i]] = {};
        }
        target = target[parts[i]];
      }
      target[parts[parts.length - 1]] = value;
    } else {
      currentSettings[key] = value;
    }

    user.settings = currentSettings;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest"
    );

    res.json({
      message: "Setting updated successfully",
      settings: user.settings,
      user: updatedUser,
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

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.settings = defaultSettings;
    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest"
    );

    res.json({
      message: "Settings reset to default",
      settings: user.settings,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Reset settings error:", error);
    res.status(500).json({ message: "Failed to reset settings" });
  }
};
