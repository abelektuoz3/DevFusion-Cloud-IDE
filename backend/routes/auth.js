// routes/auth.js
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// Validation rules
const registerValidation = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters"),
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please enter a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Routes
router.post("/register", registerValidation, authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", loginValidation, authController.login);
router.get("/me", protect, authController.getCurrentUser);
router.post("/logout", protect, authController.logout);
router.put("/profile", protect, authController.updateProfile);
router.put("/change-password", protect, authController.changePassword);
router.delete("/account", protect, authController.deleteAccount);

module.exports = router;
