const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Folder = require('../../../models/Folder');
const File = require('../../../models/File');
const Workspace = require('../../../models/Workspace');

/**
 * Synchronizes all folders and files for a workspace from MongoDB onto disk.
 */
async function syncWorkspaceToDisk(workspaceId, workspacePath) {
  try {
    // 1. Ensure base workspace directory exists
    if (!fs.existsSync(workspacePath)) {
      fs.mkdirSync(workspacePath, { recursive: true });
    }

    // 2. Fetch all folders from DB
    const folders = await Folder.find({ workspace: workspaceId }).sort({ path: 1 });
    const folderMap = new Map();

    for (const folder of folders) {
      folderMap.set(folder._id.toString(), folder);
      let relPath = folder.path ? folder.path.replace(/^\//, '') : folder.name;
      if (relPath) {
        const fullFolderPath = path.join(workspacePath, relPath);
        if (!fs.existsSync(fullFolderPath)) {
          fs.mkdirSync(fullFolderPath, { recursive: true });
        }
      }
    }

    // 3. Fetch all files from DB
    const files = await File.find({ workspace: workspaceId });
    for (const file of files) {
      let relPath = file.path ? file.path.replace(/^\//, '') : file.name;
      
      // If file path is missing or basic, derive from folder
      if ((!relPath || relPath === file.name) && file.folder) {
        const folderObj = folderMap.get(file.folder.toString());
        if (folderObj && folderObj.path) {
          relPath = `${folderObj.path.replace(/^\//, '')}/${file.name}`;
        }
      }

      const fullFilePath = path.join(workspacePath, relPath);
      const dirName = path.dirname(fullFilePath);

      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      fs.writeFileSync(fullFilePath, file.content || '');
    }

    // 4. Initialize Git repo if not present
    const gitDir = path.join(workspacePath, '.git');
    if (!fs.existsSync(gitDir)) {
      try {
        execSync('git init -b main', { cwd: workspacePath, stdio: 'ignore' });
        // Create initial commit if empty repo so branch is set to main
        execSync('git config user.name "DevFusion User"', { cwd: workspacePath, stdio: 'ignore' });
        execSync('git config user.email "user@devfusion.ide"', { cwd: workspacePath, stdio: 'ignore' });
        execSync('git add -A', { cwd: workspacePath, stdio: 'ignore' });
        execSync('git commit -m "Initial workspace commit" --allow-empty', { cwd: workspacePath, stdio: 'ignore' });
      } catch (err) {
        // Fallback for environment without git or initial commit error
      }
    }

    console.log(`[WorkspaceSync] Synced workspace ${workspaceId} to ${workspacePath} (${files.length} files, ${folders.length} folders)`);
  } catch (error) {
    console.error(`[WorkspaceSync] Error syncing workspace ${workspaceId}:`, error);
  }
}

/**
 * Sync a single file to disk when saved/updated in the IDE
 */
async function syncSingleFileToDisk(workspaceId, filePath, content) {
  try {
    const workspacePath = path.join(__dirname, '../../workspaces', workspaceId);
    const relPath = filePath.replace(/^\//, '');
    const fullPath = path.join(workspacePath, relPath);
    const dirName = path.dirname(fullPath);

    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    fs.writeFileSync(fullPath, content || '');
  } catch (error) {
    console.error(`[WorkspaceSync] Error writing file to disk:`, error);
  }
}

/**
 * Remove a single file from disk when deleted in the IDE
 */
function removeSingleFileFromDisk(workspaceId, filePath) {
  try {
    const workspacePath = path.join(__dirname, '../../workspaces', workspaceId);
    const relPath = filePath.replace(/^\//, '');
    const fullPath = path.join(workspacePath, relPath);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error(`[WorkspaceSync] Error deleting file from disk:`, error);
  }
}

module.exports = {
  syncWorkspaceToDisk,
  syncSingleFileToDisk,
  removeSingleFileFromDisk,
};
