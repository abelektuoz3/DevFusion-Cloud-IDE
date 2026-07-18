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

  // ✅ Manual Save function - only saves when user clicks or presses Ctrl+S
  const handleSave = async () => {
    if (!activeTabData) {
      toast.error("No file open to save");
      return;
    }

    if (activeTabData.isSaved) {
      toast.success("File already saved");
      return;
    }

    setIsSaving(true);
    try {
      const success = await onSaveFile(activeTab, activeTabData.content);
      if (success) {
        toast.success(`"${activeTabData.name}" saved successfully! 💾`);
      }
    } catch (error) {
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Ctrl+S shortcut - Manual save only
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTabData]);

  // ✅ Warn before closing tab with unsaved changes
  const handleCloseTab = (tabId) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab && !tab.isSaved) {
      if (!window.confirm(`"${tab.name}" has unsaved changes. Close anyway?`)) {
        return;
      }
    }
    onCloseTab(tabId);
  };

  // ✅ Warn before switching tabs with unsaved changes
  const handleTabChange = (tabId) => {
    const currentTab = tabs.find((t) => t.id === activeTab);
    if (currentTab && !currentTab.isSaved) {
      if (
        !window.confirm(
          `"${currentTab.name}" has unsaved changes. Switch anyway?`,
        )
      ) {
        return;
      }
    }
    onTabChange(tabId);
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
            onClick={() => handleTabChange(tab.id)}>
            <span className="text-sm font-medium whitespace-nowrap">
              {tab.name}
            </span>
            {!tab.isSaved && (
              <span className="ml-2 text-xs text-yellow-500 font-bold">●</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
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
            {/* ✅ Save Button - Top Right */}
            <div className="absolute top-3 right-4 z-10 flex items-center space-x-3">
              {!activeTabData.isSaved && (
                <span className="text-xs text-yellow-500 font-medium animate-pulse">
                  ● Unsaved
                </span>
              )}
              {activeTabData.isSaved && (
                <span className="text-xs text-green-500 font-medium">
                  ✓ Saved
                </span>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving || activeTabData.isSaved}
                className={`flex items-center space-x-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTabData.isSaved ?
                    "bg-gray-200 dark:bg-slate-600 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/30 hover:shadow-green-600/40"
                }`}
                title="Save file (Ctrl+S)">
                <FiSave size={16} />
                <span>
                  {isSaving ?
                    "Saving..."
                  : activeTabData.isSaved ?
                    "Saved"
                  : "Save"}
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs bg-white/20 rounded">
                  Ctrl+S
                </kbd>
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
              <div className="text-5xl mb-4">📄</div>
              <p className="text-lg font-medium">No file open</p>
              <p className="text-sm mt-1">
                Select a file from the explorer to start editing
              </p>
              <p className="text-xs mt-3 text-gray-400 dark:text-gray-500">
                💡 Tip: Press{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                  Ctrl+S
                </kbd>{" "}
                to save your changes
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  );
};

export default EditorTabs;
