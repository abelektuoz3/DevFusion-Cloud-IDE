// backend/models/Folder.js
const mongoose = require("mongoose");

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    parentFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    path: {
      type: String,
      required: true,
      default: "", // Add default to prevent validation errors
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    color: {
      type: String,
      default: "#4CAF50",
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

folderSchema.index(
  { workspace: 1, parentFolder: 1, name: 1 },
  { unique: true },
);
folderSchema.index({ path: 1 });

// ✅ Fix: Use function declaration instead of arrow function
folderSchema.pre("save", function (next) {
  // Only generate path if it's not already set
  if (!this.path) {
    if (this.parentFolder) {
      // For subfolders, get parent path
      mongoose
        .model("Folder")
        .findById(this.parentFolder)
        .then((parent) => {
          if (parent) {
            this.path = `${parent.path}/${this.name}`;
          } else {
            this.path = `/${this.name}`;
          }
          next();
        })
        .catch((err) => {
          console.error("Error finding parent folder:", err);
          // Fallback
          this.path = `/${this.name}`;
          next();
        });
    } else {
      // Root folder
      this.path = `/${this.name}`;
      next();
    }
  } else {
    next();
  }
});

folderSchema.methods.getFullPath = function () {
  return this.path;
};

module.exports = mongoose.model("Folder", folderSchema);
