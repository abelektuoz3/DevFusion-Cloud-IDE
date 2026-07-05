const mongoose = require("mongoose");

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    rootFolder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    icon: {
      type: String,
      default: "📁",
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

workspaceSchema.index({ owner: 1 });
workspaceSchema.index({ name: 1 });
workspaceSchema.index({ members: 1 });

workspaceSchema.virtual("fileCount", {
  ref: "File",
  localField: "_id",
  foreignField: "workspace",
  count: true,
});

workspaceSchema.set("toJSON", { virtuals: true });
workspaceSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Workspace", workspaceSchema);
