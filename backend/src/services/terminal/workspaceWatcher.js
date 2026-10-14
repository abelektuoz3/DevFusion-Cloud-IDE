const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const Folder = require("../../models/Folder");
const File = require("../../models/File");

const watchers = new Map(); // workspaceId -> watcher
const changeCallbacks = new Map(); // workspaceId -> Set of callbacks

/**
 * Register a callback to be notified when a workspace changes on disk.
 * Multiple WebSocket connections can subscribe to the same workspace.
 */
function onChange(workspaceId, callback) {
  if (!changeCallbacks.has(workspaceId)) {
    changeCallbacks.set(workspaceId, new Set());
  }
  changeCallbacks.get(workspaceId).add(callback);
  return () => {
    const cbs = changeCallbacks.get(workspaceId);
    if (cbs) cbs.delete(callback);
  };
}

function notifyChange(workspaceId, change) {
  const cbs = changeCallbacks.get(workspaceId);
  if (!cbs) return;
  cbs.forEach((cb) => {
    try {
      cb(change);
    } catch (e) {
      console.error("[Watcher] Callback error:", e.message);
    }
  });
}

/**
 * Starts watching a workspace folder for changes on disk.
 * When files/folders are created/deleted, syncs them to MongoDB.
 */
function startWatching(workspaceId, workspacePath, userId) {
  if (watchers.has(workspaceId)) {
    return watchers.get(workspaceId);
  }

  console.log(
    `[Watcher] Starting watcher for workspace ${workspaceId} at ${workspacePath}`,
  );

  const watcher = chokidar.watch(workspacePath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles like .git
    persistent: true,
    ignoreInitial: true,
    depth: 10,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
  });

  // --- File added on disk → add to MongoDB ---
  watcher.on("add", async (filePath) => {
    try {
      const relativePath = path
        .relative(workspacePath, filePath)
        .replace(/\\/g, "/");
      const name = path.basename(filePath);
      const parentPath = path.dirname(relativePath);
      const parentFolder = parentPath === "." ? null : parentPath;

      const existing = await File.findOne({ workspaceId, path: relativePath });
      if (existing) return;

      let parentFolderId = null;
      if (parentFolder) {
        const folder = await Folder.findOne({
          workspaceId,
          path: parentFolder,
        });
        parentFolderId = folder ? folder._id : null;
      }

      const content = fs.readFileSync(filePath, "utf8").slice(0, 100000);

      const newFile = await File.create({
        workspaceId,
        name,
        path: relativePath,
        content,
        folderId: parentFolderId,
        ownerId: userId,
        language: detectLanguage(name),
      });

      console.log(`[Watcher] ✅ File synced to DB: ${relativePath}`);
      notifyChange(workspaceId, {
        type: "add-file",
        path: relativePath,
        file: newFile,
      });
    } catch (err) {
      console.error(
        `[Watcher] ❌ Error syncing file ${filePath}:`,
        err.message,
      );
    }
  });

  // --- File updated on disk → update in MongoDB ---
  watcher.on("change", async (filePath) => {
    try {
      const relativePath = path
        .relative(workspacePath, filePath)
        .replace(/\\/g, "/");
      const content = fs.readFileSync(filePath, "utf8").slice(0, 100000);
      await File.updateOne(
        { workspaceId, path: relativePath },
        { $set: { content } },
      );
      console.log(`[Watcher] 📝 File updated in DB: ${relativePath}`);
      notifyChange(workspaceId, { type: "update-file", path: relativePath });
    } catch (err) {
      console.error(
        `[Watcher] ❌ Error updating file ${filePath}:`,
        err.message,
      );
    }
  });

  // --- File deleted on disk → remove from MongoDB ---
  watcher.on("unlink", async (filePath) => {
    try {
      const relativePath = path
        .relative(workspacePath, filePath)
        .replace(/\\/g, "/");
      await File.deleteOne({ workspaceId, path: relativePath });
      console.log(`[Watcher] 🗑️ File removed from DB: ${relativePath}`);
      notifyChange(workspaceId, { type: "remove-file", path: relativePath });
    } catch (err) {
      console.error(
        `[Watcher] ❌ Error removing file ${filePath}:`,
        err.message,
      );
    }
  });

  // --- Folder added on disk → add to MongoDB ---
  watcher.on("addDir", async (dirPath) => {
    try {
      if (dirPath === workspacePath) return;
      const relativePath = path
        .relative(workspacePath, dirPath)
        .replace(/\\/g, "/");
      const name = path.basename(dirPath);
      const parentPath = path.dirname(relativePath);
      const parentFolder = parentPath === "." ? null : parentPath;

      const existing = await Folder.findOne({
        workspaceId,
        path: relativePath,
      });
      if (existing) return;

      let parentFolderId = null;
      if (parentFolder) {
        const parent = await Folder.findOne({
          workspaceId,
          path: parentFolder,
        });
        parentFolderId = parent ? parent._id : null;
      }

      const newFolder = await Folder.create({
        workspaceId,
        name,
        path: relativePath,
        parentId: parentFolderId,
        ownerId: userId,
      });

      console.log(`[Watcher] ✅ Folder synced to DB: ${relativePath}`);
      notifyChange(workspaceId, {
        type: "add-folder",
        path: relativePath,
        folder: newFolder,
      });
    } catch (err) {
      console.error(
        `[Watcher] ❌ Error syncing folder ${dirPath}:`,
        err.message,
      );
    }
  });

  // --- Folder deleted on disk → remove from MongoDB ---
  watcher.on("unlinkDir", async (dirPath) => {
    try {
      const relativePath = path
        .relative(workspacePath, dirPath)
        .replace(/\\/g, "/");
      await Folder.deleteMany({
        workspaceId,
        path: { $regex: `^${relativePath}(/|$)` },
      });
      await File.deleteMany({
        workspaceId,
        path: { $regex: `^${relativePath}(/|$)` },
      });
      console.log(`[Watcher] 🗑️ Folder removed from DB: ${relativePath}`);
      notifyChange(workspaceId, { type: "remove-folder", path: relativePath });
    } catch (err) {
      console.error(
        `[Watcher] ❌ Error removing folder ${dirPath}:`,
        err.message,
      );
    }
  });

  watcher.on("error", (err) => {
    console.error(`[Watcher] Error for workspace ${workspaceId}:`, err.message);
  });

  watchers.set(workspaceId, watcher);
  return watcher;
}

function stopWatching(workspaceId) {
  const watcher = watchers.get(workspaceId);
  if (watcher) {
    watcher.close();
    watchers.delete(workspaceId);
    console.log(`[Watcher] Stopped watching workspace ${workspaceId}`);
  }
}

function detectLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  const map = {
    ".js": "javascript",
    ".jsx": "javascript",
    ".ts": "typescript",
    ".tsx": "typescript",
    ".py": "python",
    ".java": "java",
    ".c": "c",
    ".cpp": "cpp",
    ".cs": "csharp",
    ".go": "go",
    ".rs": "rust",
    ".php": "php",
    ".rb": "ruby",
    ".html": "html",
    ".css": "css",
    ".json": "json",
    ".md": "markdown",
    ".sh": "shell",
    ".txt": "plaintext",
  };
  return map[ext] || "plaintext";
}

module.exports = { startWatching, stopWatching, onChange };
