// src/components/explorer/Explorer.jsx
import React, { useState } from "react";
import { useWorkspace } from "../../context/WorkspaceContext";
import {
  FiFolder,
  FiFolderOpen,
  FiFile,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";

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

  const handleCreateNew = async () => {
    if (!newItemName.trim()) return;

    const data = {
      name: newItemName.trim(),
      folderId: targetFolderId || folderTree?._id,
    };

    if (newItemType === "folder") {
      await createFolder(workspaceId, data);
    } else {
      await createFile(workspaceId, data);
    }

    setNewItemName("");
    setShowNewMenu(false);
    // Reload workspace
    window.location.reload();
  };

  const renderTree = (node, depth = 0) => {
    if (!node) return null;

    const isExpanded = expandedFolders.has(node._id);
    const hasChildren = node.children?.length > 0 || node.files?.length > 0;

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
            {isExpanded ?
              <FiFolderOpen className="text-yellow-500" />
            : <FiFolder className="text-yellow-500" />}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            {node.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setTargetFolderId(node._id);
              setNewItemType("file");
              setShowNewMenu(true);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded">
            <FiPlus size={12} />
          </button>
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-800">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Explorer
        </h3>
        <button
          onClick={() => {
            setTargetFolderId(folderTree?._id);
            setNewItemType("file");
            setShowNewMenu(true);
          }}
          className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded">
          <FiPlus size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {folderTree && renderTree(folderTree)}
      </div>

      {/* New Item Modal */}
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
                onClick={() => setShowNewMenu(false)}
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
