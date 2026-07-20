// backend/controllers/profileController.js
const User = require("../models/User");

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

    // ✅ Migrate settings if needed
    if (user.settings) {
      const oldSettings = user.settings;
      const newSettings = migrateSettings(oldSettings);
      
      if (JSON.stringify(oldSettings) !== JSON.stringify(newSettings)) {
        user.settings = newSettings;
        await user.save();
        console.log("✅ Settings migrated for user:", user.username);
      }
    }

    // Calculate stats
    const stats = {
      projects: 24,
      filesEdited: 1280,
      storageUsed: "2.8 GB",
      storageLimit: "10 GB",
      createdAt: user.createdAt.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    };

    res.json({
      user,
      stats,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Failed to get profile" });
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
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    // Update fields
    if (username) user.username = username;
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