// frontend/src/components/editor/EditorTabs.jsx
import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useTheme } from "../../context/ThemeContext";
import { FiXCircle, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";

const EditorTabs = ({
  tabs,
  activeTab,
  onCloseTab,
  onTabChange,
  onContentChange,
  onSaveFile,
}) => {
  const { isDark } = useTheme();
  const [isSaving, setIsSaving] = useState(false);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const handleEditorChange = (value) => {
    onContentChange(value);
  };

  const handleSave = async () => {
    if (!activeTabData) return;

    setIsSaving(true);
    try {
      await onSaveFile(activeTab, activeTabData.content);
      toast.success(`File "${activeTabData.name}" saved!`);
    } catch (error) {
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeTabData && !activeTabData.isSaved) {
          handleSave();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabData]);

  // Auto-save when switching tabs
  useEffect(() => {
    return () => {
      // Save current tab before switching if there are unsaved changes
      if (activeTabData && !activeTabData.isSaved) {
        // Don't autosave on tab switch - let the user decide
      }
    };
  }, [activeTab]);

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
            onClick={() => {
              // Save current tab before switching if there are unsaved changes
              if (activeTabData && !activeTabData.isSaved) {
                // Prompt user to save or just save automatically
                if (
                  window.confirm(
                    `Save changes to "${activeTabData.name}" before switching?`,
                  )
                ) {
                  handleSave();
                }
              }
              onTabChange(tab.id);
            }}>
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
      <div className="flex-1 relative">
        {activeTabData ?
          <>
            {/* Save Button in Editor */}
            <div className="absolute top-2 right-4 z-10 flex items-center space-x-2">
              {!activeTabData.isSaved && (
                <span className="text-xs text-yellow-500 animate-pulse">
                  ● Unsaved
                </span>
              )}
              {activeTabData.isSaved && (
                <span className="text-xs text-green-500">✓ Saved</span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || activeTabData.isSaved}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg transition ${
                  activeTabData.isSaved ?
                    "bg-gray-200 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
                }`}>
                <FiSave size={14} />
                <span>
                  {isSaving ?
                    "Saving..."
                  : activeTabData.isSaved ?
                    "Saved"
                  : "Save"}
                </span>
              </button>
            </div>

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
          </>
        : <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-4">📄</div>
              <p className="text-lg font-medium">No file open</p>
              <p className="text-sm mt-1">
                Select a file from the explorer to start editing
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default EditorTabs;
