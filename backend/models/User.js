// backend/models/User.js
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
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    twitter: {
      type: String,
      default: "",
    },
    linkedin: {
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
      // General
      language: {
        type: String,
        default: "en",
      },
      timezone: {
        type: String,
        default: "Africa/Addis_Ababa",
      },
      autoSave: {
        type: Boolean,
        default: true,
      },
      autoSaveDelay: {
        type: Number,
        default: 1000,
      },
      startup: {
        type: String,
        enum: ["welcome", "dashboard", "lastWorkspace"],
        default: "welcome",
      },
      restoreWorkspace: {
        type: Boolean,
        default: true,
      },
      openWelcome: {
        type: Boolean,
        default: true,
      },
      recentProjects: {
        type: Number,
        default: 5,
      },

      // Appearance
      theme: {
        type: String,
        enum: [
          "dark-plus",
          "light-plus",
          "midnight",
          "dracula",
          "one-dark-pro",
          "github-dark",
        ],
        default: "dark-plus",
      },
      accentColor: {
        type: String,
        enum: [
          "indigo",
          "blue",
          "green",
          "red",
          "purple",
          "pink",
          "orange",
          "teal",
        ],
        default: "indigo",
      },
      fontSize: {
        type: Number,
        default: 14,
        min: 10,
        max: 24,
      },
      editorFont: {
        type: String,
        default: "JetBrains Mono",
      },
      iconTheme: {
        type: String,
        default: "default",
      },
      treeDensity: {
        type: String,
        enum: ["compact", "medium", "comfortable"],
        default: "medium",
      },
      windowZoom: {
        type: Number,
        default: 100,
        min: 50,
        max: 200,
      },

      // Editor
      tabSize: {
        type: Number,
        default: 2,
        enum: [2, 4, 8],
      },
      insertSpaces: {
        type: Boolean,
        default: true,
      },
      wordWrap: {
        type: String,
        enum: ["off", "on", "wordWrapColumn", "bounded"],
        default: "on",
      },
      minimap: {
        type: Boolean,
        default: true,
      },
      lineNumbers: {
        type: Boolean,
        default: true,
      },
      bracketPairColorization: {
        type: Boolean,
        default: true,
      },
      stickyScroll: {
        type: Boolean,
        default: true,
      },
      cursorStyle: {
        type: String,
        enum: ["line", "block", "underline"],
        default: "line",
      },
      smoothScrolling: {
        type: Boolean,
        default: true,
      },

      // Files
      confirmBeforeDelete: {
        type: Boolean,
        default: true,
      },
      trimTrailingWhitespace: {
        type: Boolean,
        default: true,
      },
      insertFinalNewline: {
        type: Boolean,
        default: true,
      },
      exclude: {
        type: [String],
        default: ["node_modules", "dist", "build", ".git"],
      },

      // Terminal
      defaultShell: {
        type: String,
        enum: ["bash", "zsh", "fish", "powershell", "cmd"],
        default: "bash",
      },
      terminalFontSize: {
        type: Number,
        default: 14,
        min: 10,
        max: 24,
      },
      cursorBlink: {
        type: Boolean,
        default: true,
      },
      terminalCursorStyle: {
        type: String,
        enum: ["block", "line", "underline"],
        default: "block",
      },
      terminalTheme: {
        type: String,
        enum: ["dark", "light", "material", "solarized"],
        default: "dark",
      },

      // Keyboard
      keybindings: {
        save: { type: String, default: "Ctrl+S" },
        commandPalette: { type: String, default: "Ctrl+Shift+P" },
        quickOpen: { type: String, default: "Ctrl+P" },
        toggleSidebar: { type: String, default: "Ctrl+B" },
        comment: { type: String, default: "Ctrl+/" },
        search: { type: String, default: "Ctrl+Shift+F" },
      },

      // Git
      gitUsername: { type: String, default: "" },
      gitEmail: { type: String, default: "" },
      autoFetch: { type: Boolean, default: true },
      confirmBeforePush: { type: Boolean, default: true },
      gitDecorations: { type: Boolean, default: true },

      // Cloud
      cloudSync: { type: Boolean, default: true },
      backupFrequency: {
        type: String,
        enum: ["manual", "daily", "weekly", "monthly"],
        default: "daily",
      },
      workspaceSync: { type: Boolean, default: true },

      // Notifications
      desktopNotifications: { type: Boolean, default: true },
      sound: { type: Boolean, default: true },
      updateNotifications: { type: Boolean, default: true },
      friendActivity: { type: Boolean, default: true },

      // Security
      twoFactorAuth: { type: Boolean, default: false },
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
