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

folderSchema.pre("save", async function (next) {
  if (this.isNew && !this.path) {
    if (this.parentFolder) {
      const parent = await this.constructor.findById(this.parentFolder);
      if (parent) {
        this.path = `${parent.path}/${this.name}`;
      } else {
        this.path = `/${this.name}`;
      }
    } else {
      this.path = `/${this.name}`;
    }
  }
  next();
});

folderSchema.methods.getFullPath = function () {
  return this.path;
};

module.exports = mongoose.model("Folder", folderSchema);
