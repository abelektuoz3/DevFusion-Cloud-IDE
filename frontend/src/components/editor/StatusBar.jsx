// src/components/editor/StatusBar.jsx
import React from "react";

const StatusBar = ({ workspace, fileCount, activeTab, tabs }) => {
  const activeFile = tabs?.find((tab) => tab.id === activeTab);

  return (
    <div className="bg-gray-100 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 px-4 py-1 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <span className="font-medium">{workspace?.name || "No workspace"}</span>
        <span>📁 {fileCount || 0} files</span>
        {activeFile && (
          <>
            <span>|</span>
            <span>📄 {activeFile.name}</span>
            <span className="text-gray-400 dark:text-gray-500">
              {activeFile.language || "plaintext"}
            </span>
            {!activeFile.isSaved && (
              <span className="text-yellow-500">● unsaved</span>
            )}
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <span>Ln 1, Col 1</span>
        <span>UTF-8</span>
        <span>LF</span>
        {tabs?.length > 0 && <span>{tabs.length} tabs open</span>}
      </div>
    </div>
  );
};

export default StatusBar;
