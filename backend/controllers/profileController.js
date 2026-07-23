// backend/controllers/profileController.js
const User = require("../models/User");
const Workspace = require("../models/Workspace");
const File = require("../models/File");
const Folder = require("../models/Folder");
const Notification = require("../models/Notification");

// ✅ Helper to migrate old settings to new format
const migrateSettings = (settings) => {
  if (!settings) return settings;
  
  const migrated = { ...settings };
  
  // Fix theme values
  if (migrated.theme === "dark") migrated.theme = "dark-plus";
  if (migrated.theme === "light") migrated.theme = "light-plus";
  if (migrated.theme === "vs-dark") migrated.theme = "dark-plus";
  if (migrated.theme === "vs-light") migrated.theme = "light-plus";
  
  // Fix wordWrap values (boolean to string)
  if (migrated.wordWrap === true) migrated.wordWrap = "on";
  if (migrated.wordWrap === false) migrated.wordWrap = "off";
  
  // Fix terminalCursorStyle if it was using old name
  if (migrated.cursorStyle && !migrated.terminalCursorStyle) {
    migrated.terminalCursorStyle = migrated.cursorStyle;
  }
  
  return migrated;
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Migrate settings safely if needed
    if (user.settings) {
      try {
        const oldSettings = user.settings;
        const newSettings = migrateSettings(oldSettings);
        
        if (JSON.stringify(oldSettings) !== JSON.stringify(newSettings)) {
          user.settings = newSettings;
          await user.save({ validateBeforeSave: false });
          console.log("✅ Settings migrated for user:", user.username);
        }
      } catch (settingsError) {
        console.error("Settings migration error:", settingsError);
      }
    }

    // Calculate real stats dynamically with safe fallback
    let projectCount = 0;
    let fileCount = 0;
    let storageUsed = "0 B";

    try {
      if (Workspace) {
        projectCount = await Workspace.countDocuments({ owner: user._id });
      }
      if (File) {
        fileCount = await File.countDocuments({ owner: user._id });
        const files = await File.find({ owner: user._id }).select("size");
        const totalBytes = Array.isArray(files)
          ? files.reduce((sum, f) => sum + (f.size || 0), 0)
          : 0;

        if (totalBytes >= 1024 * 1024 * 1024) {
          storageUsed = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
        } else if (totalBytes >= 1024 * 1024) {
          storageUsed = `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;
        } else if (totalBytes >= 1024) {
          storageUsed = `${(totalBytes / 1024).toFixed(1)} KB`;
        } else {
          storageUsed = `${totalBytes} B`;
        }
      }
    } catch (statsError) {
      console.error("Stats calculation error:", statsError);
    }

    const createdAt = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
      : "Unknown";

    const stats = {
      projects: projectCount,
      filesEdited: fileCount,
      storageUsed,
      storageLimit: "10 GB",
      createdAt,
    };

    res.json({
      user,
      stats,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to get profile", error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      username,
      bio,
      location,
      website,
      github,
      twitter,
      linkedin,
      avatar,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username is taken
    if (username && username.trim() !== user.username) {
      const trimmed = username.trim();
      if (trimmed.length < 3 || trimmed.length > 30) {
        return res.status(400).json({ message: "Username must be 3-30 characters" });
      }
      const existingUser = await User.findOne({ username: trimmed });
      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Username already taken" });
      }
      user.username = trimmed;
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (github !== undefined) user.github = github;
    if (twitter !== undefined) user.twitter = twitter;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    // Return updated user without sensitive data
    const updatedUser = await User.findById(user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest"
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: errors.join(", ") });
    }
    
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
};

// @desc    Delete account
// @route   DELETE /api/profile
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body || {};
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (password) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }
    }

    const userId = user._id;

    await Workspace.deleteMany({ owner: userId });
    await File.deleteMany({ owner: userId });
    await Folder.deleteMany({ owner: userId });
    await Notification.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};