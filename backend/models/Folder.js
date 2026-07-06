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
      // ✅ Remove required: true - let the pre-save middleware handle it
      default: "",
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

// ✅ Fix: Use async/await for better handling
folderSchema.pre("save", async function (next) {
  try {
    // Only generate path if it's empty
    if (!this.path || this.path === "") {
      if (this.parentFolder) {
        // For subfolders, get parent path
        const parent = await mongoose
          .model("Folder")
          .findById(this.parentFolder);
        if (parent) {
          this.path = `${parent.path}/${this.name}`;
        } else {
          this.path = `/${this.name}`;
        }
      } else {
        // Root folder
        this.path = `/${this.name}`;
      }
    }
    next();
  } catch (error) {
    console.error("Error in folder pre-save middleware:", error);
    // Fallback: set a default path
    this.path = `/${this.name}`;
    next();
  }
});

// ✅ Add a static method to create a folder with path
folderSchema.statics.createWithPath = async function (data) {
  const folder = new this(data);
  // Generate path before saving
  if (!folder.path || folder.path === "") {
    if (folder.parentFolder) {
      const parent = await this.findById(folder.parentFolder);
      if (parent) {
        folder.path = `${parent.path}/${folder.name}`;
      } else {
        folder.path = `/${folder.name}`;
      }
    } else {
      folder.path = `/${folder.name}`;
    }
  }
  return folder.save();
};

folderSchema.methods.getFullPath = function () {
  return this.path;
};

module.exports = mongoose.model("Folder", folderSchema);
