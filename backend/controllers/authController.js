// backend/controllers/authController.js
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const {
  sendOTPEmail,
  sendVerificationSuccessEmail,
  generateOTP,
} = require("../services/emailService");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// ✅ Default settings object - COMPLETE with all fields
const getDefaultSettings = () => {
  return {
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
};

// ✅ Helper to ensure settings is ALWAYS valid - CRITICAL FIX
const ensureValidSettings = (settings) => {
  const defaultSettings = getDefaultSettings();

  // If settings is null/undefined, return default
  if (!settings || typeof settings !== "object") {
    return { ...defaultSettings };
  }

  // Create a clean copy with defaults
  const result = { ...defaultSettings, ...settings };

  // ✅ CRITICAL: Force keybindings to be an object
  if (!result.keybindings || typeof result.keybindings !== "object") {
    result.keybindings = {
      save: "Ctrl+S",
      commandPalette: "Ctrl+Shift+P",
      quickOpen: "Ctrl+P",
      toggleSidebar: "Ctrl+B",
      comment: "Ctrl+/",
      search: "Ctrl+Shift+F",
    };
  }

  // Fix theme values
  if (result.theme === "dark") result.theme = "dark-plus";
  if (result.theme === "light") result.theme = "light-plus";
  if (result.theme === "vs-dark") result.theme = "dark-plus";
  if (result.theme === "vs-light") result.theme = "light-plus";

  // Fix wordWrap values
  if (result.wordWrap === true) result.wordWrap = "on";
  if (result.wordWrap === false) result.wordWrap = "off";

  return result;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
      });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      username,
      email,
      password,
      isVerified: false,
      otp: {
        code: otp,
        expiresAt: otpExpires,
      },
      otpAttempts: 0,
      settings: getDefaultSettings(),
    });

    await user.save();
    await sendOTPEmail(email, otp, username);

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User created. Please verify your email with the OTP sent.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: false,
        createdAt: user.createdAt,
      },
      requiresVerification: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: "User is already verified",
      });
    }

    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        error: "Too many failed attempts. Please request a new OTP.",
      });
    }

    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        error: "No OTP found. Please request a new one.",
      });
    }

    if (new Date() > user.otp.expiresAt) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    if (user.otp.code !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = { code: null, expiresAt: null };
    user.otpAttempts = 0;
    await user.save();

    await sendVerificationSuccessEmail(email, user.username);

    const token = generateToken(user._id);

    res.json({
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: true,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: "User is already verified",
      });
    }

    if (user.lastOtpRequest) {
      const timeSinceLastRequest =
        Date.now() - new Date(user.lastOtpRequest).getTime();
      if (timeSinceLastRequest < 60000) {
        return res.status(429).json({
          error: "Please wait 1 minute before requesting a new OTP",
        });
      }
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = {
      code: otp,
      expiresAt: otpExpires,
    };
    user.otpAttempts = 0;
    user.lastOtpRequest = new Date();
    await user.save();

    await sendOTPEmail(email, otp, user.username);

    res.json({
      message: "New OTP sent to your email",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email first. Check your inbox for the OTP.",
        requiresVerification: true,
        email: user.email,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    console.log("📝 Getting current user:", req.user?._id);

    let user = await User.findById(req.user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest",
    );

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    console.log("✅ User found:", user.username);

    // ✅ ALWAYS ensure settings is valid
    const validSettings = ensureValidSettings(user.settings);
    user.settings = validSettings;
    await user.save({ validateBeforeSave: false });

    res.json({ user });
  } catch (error) {
    console.error("❌ Get user error:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    console.log("📝 Update profile called");

    let user = await User.findById(req.user._id);

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ error: "User not found" });
    }

    const { bio, location, website, github, linkedin, twitter, avatar } =
      req.body;

    // ✅ Validate avatar size (max 1.5MB for base64)
    if (avatar && avatar.length > 1.5 * 1024 * 1024) {
      console.log("❌ Avatar too large:", avatar.length);
      return res.status(400).json({
        error: "Image is too large. Please upload a smaller image (max 1.5MB).",
      });
    }

    // Update fields
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (twitter !== undefined) user.twitter = twitter;

    // ✅ Handle avatar
    if (avatar !== undefined) {
      if (typeof avatar === "string" && avatar.startsWith("data:image")) {
        user.avatar = avatar;
        console.log("✅ Avatar updated successfully");
      } else {
        console.log("❌ Invalid avatar format");
        return res.status(400).json({
          error: "Invalid image format. Please upload a valid image.",
        });
      }
    }

    // ✅ CRITICAL FIX: Ensure settings is valid BEFORE saving
    const validSettings = ensureValidSettings(user.settings);
    user.settings = validSettings;
    console.log("✅ Settings ensured valid for user:", user.username);

    await user.save();

    const updatedUser = await User.findById(user._id).select(
      "-password -otp -otpAttempts -lastOtpRequest",
    );

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    console.error("❌ Error stack:", error.stack);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ error: errors.join(", ") });
    }

    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword,
};
