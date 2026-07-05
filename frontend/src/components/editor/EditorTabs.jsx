// src/components/editor/EditorTabs.jsx
import React from "react";
import MonacoEditor from "@monaco-editor/react";
import { useTheme } from "../../context/ThemeContext";
import { FiXCircle } from "react-icons/fi";

const EditorTabs = ({
  tabs,
  activeTab,
  onCloseTab,
  onTabChange,
  onContentChange,
  onSaveFile,
}) => {
  const { isDark } = useTheme();

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleEditorChange = (value) => {
    onContentChange(value);
  };

  const handleSave = () => {
    if (activeTabData && !activeTabData.isSaved) {
      onSaveFile(activeTab, activeTabData.content);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Tabs Bar */}
      <div className="flex items-center bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 overflow-x-auto flex-shrink-0">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`flex items-center px-4 py-2 border-r border-gray-200 dark:border-slate-700 cursor-pointer group transition ${
              activeTab === tab.id ?
                "bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
            onClick={() => onTabChange(tab.id)}>
            <span className="text-sm font-medium whitespace-nowrap">
              {tab.name}
            </span>
            {!tab.isSaved && (
              <span className="ml-2 text-xs text-yellow-500">●</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="ml-2 p-0.5 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition opacity-0 group-hover:opacity-100">
              <FiXCircle size={14} />
            </button>
          </div>
        ))}
        {tabs.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-400 dark:text-gray-500">
            No files open
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1">
        {activeTabData ?
          <MonacoEditor
            height="100%"
            language={activeTabData.language || "plaintext"}
            value={activeTabData.content || ""}
            onChange={handleEditorChange}
            theme={isDark ? "vs-dark" : "vs-light"}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              scrollBeyondLastLine: false,
              tabSize: 2,
              fontFamily: "JetBrains Mono, monospace",
              lineNumbers: "on",
              renderWhitespace: "selection",
              formatOnPaste: true,
              formatOnType: true,
              bracketPairColorization: { enabled: true },
              suggest: {
                showKeywords: true,
                showSnippets: true,
              },
            }}
          />
        : <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <p>No file open</p>
              <p className="text-sm">Select a file from the explorer</p>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default EditorTabs;
