// models/User.js - UPDATED VERSION
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
    lastOtpRequest: {
      type: Date,
      default: null,
    },
    settings: {
      theme: {
        type: String,
        enum: ["dark", "light", "vs-dark"],
        default: "dark",
      },
      fontSize: {
        type: Number,
        default: 14,
        min: 10,
        max: 24,
      },
      tabSize: {
        type: Number,
        default: 2,
        enum: [2, 4, 8],
      },
      wordWrap: {
        type: Boolean,
        default: true,
      },
      minimap: {
        type: Boolean,
        default: true,
      },
      lineNumbers: {
        type: Boolean,
        default: true,
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
      autoSaveDelay: {
        type: Number,
        default: 1000,
      },
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model("User", userSchema);
