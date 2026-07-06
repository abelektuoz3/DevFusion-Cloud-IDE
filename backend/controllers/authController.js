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

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
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
    });

    await user.save();

    // Send OTP email
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

    // Check OTP attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({
        error: "Too many failed attempts. Please request a new OTP.",
      });
    }

    // Check if OTP exists
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        error: "No OTP found. Please request a new one.",
      });
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // OTP is correct - verify user
    user.isVerified = true;
    user.otp = { code: null, expiresAt: null };
    user.otpAttempts = 0;
    await user.save();

    // Send welcome email
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

    // Rate limiting: 1 minute between requests
    if (user.lastOtpRequest) {
      const timeSinceLastRequest =
        Date.now() - new Date(user.lastOtpRequest).getTime();
      if (timeSinceLastRequest < 60000) {
        return res.status(429).json({
          error: "Please wait 1 minute before requesting a new OTP",
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = {
      code: otp,
      expiresAt: otpExpires,
    };
    user.otpAttempts = 0;
    user.lastOtpRequest = new Date();
    await user.save();

    // Send OTP email
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

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email first. Check your inbox for the OTP.",
        requiresVerification: true,
        email: user.email,
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Generate token
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
    res.json({ user: req.user });
  } catch (error) {
    console.error("Get user error:", error);
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

module.exports = {
  register,
  verifyOTP,
  resendOTP,
  login,
  getCurrentUser,
  logout,
};
