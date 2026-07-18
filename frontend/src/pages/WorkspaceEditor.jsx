// frontend/src/pages/WorkspaceEditor.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiMenu, FiXCircle, FiFolder } from "react-icons/fi";
import { useWorkspace } from "../context/WorkspaceContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Explorer from "../components/explorer/Explorer";
import EditorTabs from "../components/editor/EditorTabs";
import StatusBar from "../components/editor/StatusBar";
import SearchOverlay from "../components/search/SearchOverlay";
import toast from "react-hot-toast";

const WorkspaceEditor = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const {
    currentWorkspace,
    folderTree,
    files,
    loading,
    loadWorkspace,
    openTabs,
    activeTab,
    setActiveTab,
    openFile,
    closeTab,
    saveFile,
    updateTabContent,
  } = useWorkspace();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspace(workspaceId);
    }
  }, [workspaceId]);

  // ✅ Handle content change - ONLY update content, NO autosave
  const handleContentChange = (value) => {
    if (!activeTab) return;
    // Only update the tab content - mark as unsaved
    updateTabContent(activeTab, value);
  };

  // ✅ Handle save file
  const handleSaveFile = async (fileId, content) => {
    try {
      const success = await saveFile(fileId, content);
      return success;
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save file");
      return false;
    }
  };

  // ✅ Warn before closing browser with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const hasUnsaved = openTabs.some((tab) => !tab.isSaved);
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [openTabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F: Search
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Ctrl+W: Close tab
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (activeTab) {
          const tab = openTabs.find((t) => t.id === activeTab);
          if (tab && !tab.isSaved) {
            if (
              !window.confirm(
                `"${tab.name}" has unsaved changes. Close anyway?`,
              )
            ) {
              return;
            }
          }
          closeTab(activeTab);
        }
      }
      // Escape: Close search
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
      // Ctrl+B: Toggle explorer
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault();
        setIsExplorerOpen(!isExplorerOpen);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, openTabs, isSearchOpen, isExplorerOpen, closeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workspace not found
          </h2>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Back to Dashboard">
            <FiArrowLeft className="text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex items-center space-x-2">
            <FiFolder className="text-yellow-500" size={20} />
            <span className="font-medium text-gray-900 dark:text-white">
              {currentWorkspace.name}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {files?.length || 0} files
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExplorerOpen(!isExplorerOpen)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
            title="Toggle Explorer (Ctrl+B)">
            {isExplorerOpen ?
              <FiMenu className="text-gray-600 dark:text-gray-400" />
            : <FiXCircle className="text-gray-600 dark:text-gray-400" />}
          </button>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition">
            Search (Ctrl+F)
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Explorer */}
        {isExplorerOpen && (
          <div className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-slate-700 overflow-hidden">
            <Explorer
              folderTree={folderTree}
              files={files}
              onOpenFile={openFile}
              workspaceId={workspaceId}
            />
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <EditorTabs
            tabs={openTabs}
            activeTab={activeTab}
            onCloseTab={closeTab}
            onTabChange={setActiveTab}
            onContentChange={handleContentChange}
            onSaveFile={handleSaveFile}
          />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar
        workspace={currentWorkspace}
        fileCount={files?.length || 0}
        activeTab={activeTab}
        tabs={openTabs}
      />

      {/* Search Overlay */}
      {isSearchOpen && (
        <SearchOverlay
          onClose={() => setIsSearchOpen(false)}
          workspaceId={workspaceId}
          onOpenFile={openFile}
        />
      )}
    </div>
  );
};

export default WorkspaceEditor;
