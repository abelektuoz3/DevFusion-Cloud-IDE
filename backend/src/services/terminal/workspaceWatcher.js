const chokidar = require("chokidar");
const path = require("path");
const fs = require("fs");
const Folder = require("../../../models/Folder");
const File = require("../../../models/File");

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
 * Convert a disk-relative path (e.g. "project/src/utils")
 * into a DB path (e.g. "/project/src/utils").
 * Empty string means root.
 */
function toDbPath(relativePath) {
  const cleaned = relativePath.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
  return cleaned ? `/${cleaned}` : "";
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
      const dbPath = toDbPath(relativePath);
      const name = path.basename(filePath);
      const parentRelPath = path.dirname(relativePath).replace(/\\/g, "/");
      const parentDbPath = parentRelPath === "." ? "" : toDbPath(parentRelPath);

      const existing = await File.findOne({
        workspace: workspaceId,
        path: dbPath,
      });
      if (existing) return;

      let parentFolderId = null;
      if (parentDbPath) {
        const folder = await Folder.findOne({
          workspace: workspaceId,
          path: parentDbPath,
        });
        parentFolderId = folder ? folder._id : null;
      }

      const content = fs.readFileSync(filePath, "utf8").slice(0, 100000);

      const newFile = await File.create({
        workspace: workspaceId,
        name,
        path: dbPath,
        content,
        folder: parentFolderId,
        owner: userId,
      });

      console.log(`[Watcher] ✅ File synced to DB: ${dbPath}`);
      notifyChange(workspaceId, {
        type: "add-file",
        path: dbPath,
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
      const dbPath = toDbPath(relativePath);
      const content = fs.readFileSync(filePath, "utf8").slice(0, 100000);
      await File.updateOne(
        { workspace: workspaceId, path: dbPath },
        { $set: { content, lastModified: new Date() } },
      );
      console.log(`[Watcher] 📝 File updated in DB: ${dbPath}`);
      notifyChange(workspaceId, { type: "update-file", path: dbPath });
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
      const dbPath = toDbPath(relativePath);
      await File.deleteOne({ workspace: workspaceId, path: dbPath });
      console.log(`[Watcher] 🗑️ File removed from DB: ${dbPath}`);
      notifyChange(workspaceId, { type: "remove-file", path: dbPath });
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
      const dbPath = toDbPath(relativePath);
      const name = path.basename(dirPath);
      const parentRelPath = path.dirname(relativePath).replace(/\\/g, "/");
      const parentDbPath = parentRelPath === "." ? "" : toDbPath(parentRelPath);

      const existing = await Folder.findOne({
        workspace: workspaceId,
        path: dbPath,
      });
      if (existing) return;

      let parentFolderId = null;
      if (parentDbPath) {
        const parent = await Folder.findOne({
          workspace: workspaceId,
          path: parentDbPath,
        });
        parentFolderId = parent ? parent._id : null;
      }

      const newFolder = await Folder.create({
        workspace: workspaceId,
        name,
        path: dbPath,
        parentFolder: parentFolderId,
        owner: userId,
      });

      console.log(`[Watcher] ✅ Folder synced to DB: ${dbPath}`);
      notifyChange(workspaceId, {
        type: "add-folder",
        path: dbPath,
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
      const dbPath = toDbPath(relativePath);

      const pathRegex = new RegExp(`^${escapeRegex(dbPath)}(/|$)`);
      await Folder.deleteMany({
        workspace: workspaceId,
        path: pathRegex,
      });
      await File.deleteMany({
        workspace: workspaceId,
        path: pathRegex,
      });

      console.log(`[Watcher] 🗑️ Folder removed from DB: ${dbPath}`);
      notifyChange(workspaceId, { type: "remove-folder", path: dbPath });
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

module.exports = { startWatching, stopWatching, onChange };
