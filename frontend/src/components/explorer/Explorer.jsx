// frontend/src/components/explorer/Explorer.jsx
import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  FiFolder,
  FiFile,
  FiChevronDown,
  FiChevronRight,
  FiFolderPlus,
  FiFilePlus,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Explorer = ({ folderTree, files, onOpenFile, workspaceId }) => {
  const {
    createFolder,
    createFile,
    deleteFolder,
    deleteFile,
    renameFolder,
    renameFile,
  } = useWorkspace();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);

  const toggleFolder = (folderId) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(folderId)) {
      newSet.delete(folderId);
    } else {
      newSet.add(folderId);
    }
    setExpandedFolders(newSet);
  };

  // ✅ Handle creating a new file
  const handleCreateFile = async (parentFolderId = null) => {
    const name = window.prompt("Enter file name:");
    if (!name || name.trim() === "") return;

    try {
      const data = { name: name.trim(), folderId: parentFolderId };
      const file = await createFile(workspaceId, data);
      if (file) {
        toast.success(`File "${file.name}" created!`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to create file");
    }
  };

  // ✅ Handle creating a new folder
  const handleCreateFolder = async (parentFolderId = null) => {
    const name = window.prompt("Enter folder name:");
    if (!name || name.trim() === "") return;

    try {
      const data = { name: name.trim(), parentFolderId: parentFolderId };
      const folder = await createFolder(workspaceId, data);
      if (folder) {
        toast.success(`Folder "${folder.name}" created!`);
        if (parentFolderId) {
          const newSet = new Set(expandedFolders);
          newSet.add(parentFolderId);
          setExpandedFolders(newSet);
        }
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to create folder");
    }
  };

  // ✅ Handle rename file
  const handleRenameFile = async (fileId, currentName) => {
    const newName = window.prompt("Enter new file name:", currentName);
    if (!newName || newName.trim() === "" || newName === currentName) return;

    try {
      const success = await renameFile(fileId, newName.trim());
      if (success) {
        toast.success(`File renamed to "${newName.trim()}"`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to rename file");
    }
  };

  // ✅ Handle rename folder
  const handleRenameFolder = async (folderId, currentName) => {
    const newName = window.prompt("Enter new folder name:", currentName);
    if (!newName || newName.trim() === "" || newName === currentName) return;

    try {
      const success = await renameFolder(folderId, newName.trim());
      if (success) {
        toast.success(`Folder renamed to "${newName.trim()}"`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to rename folder");
    }
  };

  // ✅ Handle delete file
  const handleDeleteFile = async (fileId, fileName) => {
    if (!window.confirm(`Delete "${fileName}"? This action cannot be undone.`))
      return;

    try {
      const success = await deleteFile(fileId);
      if (success) {
        toast.success(`File "${fileName}" deleted`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  // ✅ Handle delete folder
  const handleDeleteFolder = async (folderId, folderName) => {
    if (
      !window.confirm(
        `Delete folder "${folderName}" and all its contents? This action cannot be undone.`,
      )
    )
      return;

    try {
      const success = await deleteFolder(folderId);
      if (success) {
        toast.success(`Folder "${folderName}" deleted`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to delete folder");
    }
  };

  const renderTree = (node, depth = 0) => {
    if (!node) return null;

    const isExpanded = expandedFolders.has(node._id);

    return (
      <div key={node._id} style={{ paddingLeft: depth * 16 }}>
        {/* Folder Node */}
        <div
          className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer group"
          onClick={() => toggleFolder(node._id)}>
          <span className="mr-1">
            {isExpanded ?
              <FiChevronDown size={14} />
            : <FiChevronRight size={14} />}
          </span>
          <span className="mr-1">
            <FiFolder
              className={`${isExpanded ? "text-yellow-400" : "text-yellow-500"}`}
              size={16}
            />
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            {node.name}
          </span>

          {/* ✅ Folder Actions */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateFile(node._id);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              title="New File">
              <FiFilePlus
                size={12}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCreateFolder(node._id);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              title="New Folder">
              <FiFolderPlus
                size={12}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRenameFolder(node._id, node.name);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              title="Rename">
              <FiEdit2 size={12} className="text-blue-500" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteFolder(node._id, node.name);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              title="Delete">
              <FiTrash2 size={12} className="text-red-500" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && (
          <div>
            {node.children?.map((child) => renderTree(child, depth + 1))}
            {node.files?.map((file) => (
              <div
                key={file._id}
                className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer group ml-6"
                onClick={() => onOpenFile(file._id)}>
                <FiFile className="text-gray-400 mr-2" size={14} />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                  {file.language}
                </span>
                {/* ✅ File Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRenameFile(file._id, file.name);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    title="Rename">
                    <FiEdit2 size={12} className="text-blue-500" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file._id, file.name);
                    }}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                    title="Delete">
                    <FiTrash2 size={12} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasContent = folderTree && folderTree.length > 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800">
      {/* Explorer Header */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Explorer
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handleCreateFile(null)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="New File">
            <FiFilePlus
              size={16}
              className="text-gray-500 dark:text-gray-400 hover:text-green-500"
            />
          </button>
          <button
            onClick={() => handleCreateFolder(null)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="New Folder">
            <FiFolderPlus
              size={16}
              className="text-gray-500 dark:text-gray-400 hover:text-yellow-500"
            />
          </button>
        </div>
      </div>

      {/* Explorer Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {!hasContent && !files?.length ?
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <FiFolder className="text-3xl text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              No files or folders yet
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleCreateFile(null)}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                <FiFilePlus size={16} />
                <span>New File</span>
              </button>
              <button
                onClick={() => handleCreateFolder(null)}
                className="flex items-center space-x-2 px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                <FiFolderPlus size={16} />
                <span>New Folder</span>
              </button>
            </div>
          </div>
        : <div>
            {folderTree?.map((node) => renderTree(node, 0))}
            {files
              ?.filter((file) => !file.folder)
              .map((file) => (
                <div
                  key={file._id}
                  className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer group"
                  onClick={() => onOpenFile(file._id)}>
                  <FiFile className="text-gray-400 mr-2" size={14} />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                    {file.language}
                  </span>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRenameFile(file._id, file.name);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                      title="Rename">
                      <FiEdit2 size={12} className="text-blue-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file._id, file.name);
                      }}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
                      title="Delete">
                      <FiTrash2 size={12} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        }
      </div>
    </div>
  );
};

export default Explorer;
