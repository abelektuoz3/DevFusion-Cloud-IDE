// src/components/explorer/Explorer.jsx
import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  FiFolder,
  FiFile,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
  FiFolderPlus,
  FiFilePlus,
} from "react-icons/fi";
import toast from "react-hot-toast";

const Explorer = ({ folderTree, files, onOpenFile, workspaceId }) => {
  const { createFolder, createFile } = useWorkspace();
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState("file");
  const [targetFolderId, setTargetFolderId] = useState(null);

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
      const data = {
        name: name.trim(),
        folderId: parentFolderId,
      };
      const file = await createFile(workspaceId, data);
      if (file) {
        toast.success(`File "${file.name}" created!`);
        // Reload workspace to refresh the file list
        window.location.reload();
      }
    } catch (error) {
      console.error("Create file error:", error);
      toast.error("Failed to create file");
    }
  };

  // ✅ Handle creating a new folder
  const handleCreateFolder = async (parentFolderId = null) => {
    const name = window.prompt("Enter folder name:");
    if (!name || name.trim() === "") return;

    try {
      const data = {
        name: name.trim(),
        parentFolderId: parentFolderId,
      };
      const folder = await createFolder(workspaceId, data);
      if (folder) {
        toast.success(`Folder "${folder.name}" created!`);
        // Auto-expand the parent folder
        if (parentFolderId) {
          const newSet = new Set(expandedFolders);
          newSet.add(parentFolderId);
          setExpandedFolders(newSet);
        }
        // Reload workspace to refresh the folder tree
        window.location.reload();
      }
    } catch (error) {
      console.error("Create folder error:", error);
      toast.error("Failed to create folder");
    }
  };

  // ✅ Open modal for creating item
  const openCreateModal = (folderId, type) => {
    setTargetFolderId(folderId);
    setNewItemType(type);
    setShowNewMenu(true);
  };

  const handleCreateNew = async () => {
    if (!newItemName.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (newItemType === "folder") {
        const data = {
          name: newItemName.trim(),
          parentFolderId: targetFolderId,
        };
        const folder = await createFolder(workspaceId, data);
        if (folder) {
          toast.success(`Folder "${folder.name}" created!`);
          if (targetFolderId) {
            const newSet = new Set(expandedFolders);
            newSet.add(targetFolderId);
            setExpandedFolders(newSet);
          }
        }
      } else {
        const data = {
          name: newItemName.trim(),
          folderId: targetFolderId,
        };
        const file = await createFile(workspaceId, data);
        if (file) {
          toast.success(`File "${file.name}" created!`);
        }
      }
      setShowNewMenu(false);
      setNewItemName("");
      // Reload workspace to refresh the tree
      window.location.reload();
    } catch (error) {
      console.error("Create error:", error);
      toast.error(`Failed to create ${newItemType}`);
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
          {/* ✅ Folder actions - New File & New Folder buttons */}
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openCreateModal(node._id, "file");
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
                openCreateModal(node._id, "folder");
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded"
              title="New Folder">
              <FiFolderPlus
                size={12}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && (
          <div>
            {/* Subfolders */}
            {node.children?.map((child) => renderTree(child, depth + 1))}

            {/* Files */}
            {node.files?.map((file) => (
              <div
                key={file._id}
                className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer ml-6"
                onClick={() => onOpenFile(file._id)}>
                <FiFile className="text-gray-400 mr-2" size={14} />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {file.name}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                  {file.language}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ✅ Check if workspace has any content
  const hasContent = folderTree && folderTree.length > 0;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800">
      {/* Explorer Header with two buttons */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Explorer
        </h3>
        <div className="flex items-center space-x-1">
          {/* ✅ New File Button */}
          <button
            onClick={() => openCreateModal(null, "file")}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
            title="New File">
            <FiFilePlus
              size={16}
              className="text-gray-500 dark:text-gray-400 hover:text-green-500"
            />
          </button>
          {/* ✅ New Folder Button */}
          <button
            onClick={() => openCreateModal(null, "folder")}
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
        {
          !hasContent && !files?.length ?
            // ✅ Empty state with two buttons
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
                <FiFolder className="text-3xl text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                No files or folders yet
              </p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openCreateModal(null, "file")}
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                  <FiFilePlus size={16} />
                  <span>New File</span>
                </button>
                <button
                  onClick={() => openCreateModal(null, "folder")}
                  className="flex items-center space-x-2 px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors">
                  <FiFolderPlus size={16} />
                  <span>New Folder</span>
                </button>
              </div>
            </div>
            // ✅ Render folder tree
          : <div>
              {folderTree?.map((node) => renderTree(node, 0))}
              {/* ✅ Root level files */}
              {files
                ?.filter((file) => !file.folder)
                .map((file) => (
                  <div
                    key={file._id}
                    className="flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded cursor-pointer"
                    onClick={() => onOpenFile(file._id)}>
                    <FiFile className="text-gray-400 mr-2" size={14} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                      {file.language}
                    </span>
                  </div>
                ))}
            </div>

        }
      </div>

      {/* ✅ New Item Modal */}
      {showNewMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New {newItemType === "file" ? "File" : "Folder"}
            </h3>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder={`Enter ${newItemType} name...`}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateNew()}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => {
                  setShowNewMenu(false);
                  setNewItemName("");
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition">
                Cancel
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer;
