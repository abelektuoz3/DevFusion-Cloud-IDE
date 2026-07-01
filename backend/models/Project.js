const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    language: {
      type: String,
      required: true,
      enum: ["javascript", "python", "java", "cpp", "csharp"],
      default: "javascript",
    },
    code: {
      type: String,
      default: "// Write your code here",
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

projectSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);
