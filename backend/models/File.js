// backend/models/File.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    content: {
      type: String,
      default: "",
    },
    language: {
      type: String,
      default: "plaintext",
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    path: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    isSaved: {
      type: Boolean,
      default: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// ✅ Clean indexes - NO text index
fileSchema.index({ workspace: 1, folder: 1, name: 1 }, { unique: true });
fileSchema.index({ path: 1 });

// ✅ Pre-save middleware
fileSchema.pre("save", async function (next) {
  try {
    // Generate path if it's empty
    if (!this.path || this.path === "") {
      if (this.folder) {
        const folder = await mongoose.model("Folder").findById(this.folder);
        if (folder) {
          this.path = `${folder.path}/${this.name}`;
        } else {
          this.path = `/${this.name}`;
        }
      } else {
        // Root level file
        this.path = `/${this.name}`;
      }
    }

    // Update file size
    this.size = Buffer.byteLength(this.content, "utf-8");

    // Detect language from extension
    if (this.isNew || this.isModified("name")) {
      this.language = getLanguageFromExtension(this.name);
    }

    next();
  } catch (error) {
    console.error("Error in file pre-save middleware:", error);
    this.path = `/${this.name}`;
    next();
  }
});

function getLanguageFromExtension(filename) {
  const extension = filename.split(".").pop().toLowerCase();
  const languageMap = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    h: "c",
    hpp: "cpp",
    cs: "csharp",
    php: "php",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    less: "less",
    json: "json",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",
    md: "markdown",
    txt: "plaintext",
    sh: "shell",
    bash: "shell",
    sql: "sql",
    vue: "vue",
    svelte: "svelte",
  };
  return languageMap[extension] || "plaintext";
}

module.exports = mongoose.model("File", fileSchema);
