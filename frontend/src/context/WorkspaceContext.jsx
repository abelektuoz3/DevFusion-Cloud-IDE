// frontend/src/context/WorkspaceContext.jsx
import React, { createContext, useContext, useState } from "react";
import { workspaceAPI, folderAPI, fileAPI } from "../services/api";
import toast from "react-hot-toast";

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
};

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [folderTree, setFolderTree] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data.workspaces || []);
    } catch (error) {
      console.error("Load workspaces error:", error);
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const loadWorkspace = async (workspaceId) => {
    try {
      setLoading(true);
      const response = await workspaceAPI.getById(workspaceId);
      const { workspace, folderTree, files } = response.data;
      setCurrentWorkspace(workspace);
      setFolderTree(folderTree);
      setFiles(files || []);
      return { workspace, folderTree, files };
    } catch (error) {
      console.error("Load workspace error:", error);
      toast.error("Failed to load workspace");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async (data) => {
    try {
      setLoading(true);
      const response = await workspaceAPI.create(data);
      const newWorkspace = response.data.workspace;
      setWorkspaces([newWorkspace, ...workspaces]);
      toast.success(`Workspace "${newWorkspace.name}" created!`);
      return newWorkspace;
    } catch (error) {
      console.error("Create workspace error:", error);
      toast.error("Failed to create workspace");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateWorkspace = async (workspaceId, data) => {
    try {
      const response = await workspaceAPI.update(workspaceId, data);
      const updated = response.data.workspace;
      setWorkspaces(
        workspaces.map((w) => (w._id === workspaceId ? updated : w)),
      );
      if (currentWorkspace?._id === workspaceId) {
        setCurrentWorkspace(updated);
      }
      toast.success("Workspace updated!");
      return updated;
    } catch (error) {
      console.error("Update workspace error:", error);
      toast.error("Failed to update workspace");
      return null;
    }
  };

  const deleteWorkspace = async (workspaceId) => {
    try {
      await workspaceAPI.delete(workspaceId);
      setWorkspaces(workspaces.filter((w) => w._id !== workspaceId));
      if (currentWorkspace?._id === workspaceId) {
        setCurrentWorkspace(null);
        setFolderTree(null);
        setFiles([]);
        setOpenTabs([]);
        setActiveTab(null);
      }
      toast.success("Workspace deleted");
      return true;
    } catch (error) {
      console.error("Delete workspace error:", error);
      toast.error("Failed to delete workspace");
      return false;
    }
  };

  const createFolder = async (workspaceId, data) => {
    try {
      const response = await folderAPI.create(workspaceId, data);
      toast.success("Folder created!");
      return response.data.folder;
    } catch (error) {
      console.error("Create folder error:", error);
      toast.error("Failed to create folder");
      return null;
    }
  };

  const deleteFolder = async (folderId) => {
    try {
      await folderAPI.delete(folderId);
      toast.success("Folder deleted");
      return true;
    } catch (error) {
      console.error("Delete folder error:", error);
      toast.error("Failed to delete folder");
      return false;
    }
  };

  const createFile = async (workspaceId, data) => {
    try {
      const response = await fileAPI.create(workspaceId, data);
      toast.success("File created!");
      return response.data.file;
    } catch (error) {
      console.error("Create file error:", error);
      toast.error("Failed to create file");
      return null;
    }
  };

  // ✅ Update file content
  const updateFile = async (fileId, data) => {
    try {
      const response = await fileAPI.update(fileId, data);
      return response.data.file;
    } catch (error) {
      console.error("Update file error:", error);
      return null;
    }
  };

  // ✅ Save file with proper error handling
  const saveFile = async (fileId, content) => {
    try {
      console.log("📝 Saving file:", fileId);
      const response = await fileAPI.update(fileId, { content });
      console.log("✅ File saved:", response.data.file);

      // Update the tabs
      setOpenTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === fileId ? { ...tab, content, isSaved: true } : tab,
        ),
      );

      // Update the files list
      setFiles((prevFiles) =>
        prevFiles.map((file) =>
          file._id === fileId ? { ...file, content, isSaved: true } : file,
        ),
      );

      return true;
    } catch (error) {
      console.error("❌ Save file error:", error);
      toast.error("Failed to save file");
      return false;
    }
  };

  // ✅ Update tab content (mark as unsaved)
  const updateTabContent = (tabId, content) => {
    setOpenTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId ? { ...tab, content, isSaved: false } : tab,
      ),
    );
  };

  const deleteFile = async (fileId) => {
    try {
      await fileAPI.delete(fileId);
      setOpenTabs(openTabs.filter((tab) => tab.id !== fileId));
      if (activeTab === fileId) {
        const remaining = openTabs.filter((tab) => tab.id !== fileId);
        setActiveTab(
          remaining.length > 0 ? remaining[remaining.length - 1].id : null,
        );
      }
      // Update files list
      setFiles(files.filter((f) => f._id !== fileId));
      toast.success("File deleted");
      return true;
    } catch (error) {
      console.error("Delete file error:", error);
      toast.error("Failed to delete file");
      return false;
    }
  };

  // ✅ Open file with content
  const openFile = async (fileId) => {
    // Check if already open
    const existing = openTabs.find((tab) => tab.id === fileId);
    if (existing) {
      setActiveTab(fileId);
      return existing;
    }

    try {
      const response = await fileAPI.getById(fileId);
      const file = response.data.file;
      const newTab = {
        id: file._id,
        name: file.name,
        path: file.path,
        language: file.language,
        content: file.content || "",
        isSaved: true,
      };
      setOpenTabs([...openTabs, newTab]);
      setActiveTab(file._id);
      return newTab;
    } catch (error) {
      console.error("Open file error:", error);
      toast.error("Failed to open file");
      return null;
    }
  };

  const closeTab = (tabId) => {
    setOpenTabs(openTabs.filter((tab) => tab.id !== tabId));
    if (activeTab === tabId) {
      const remaining = openTabs.filter((tab) => tab.id !== tabId);
      setActiveTab(
        remaining.length > 0 ? remaining[remaining.length - 1].id : null,
      );
    }
  };

  // ✅ Autosave file
  const autosaveFile = async (fileId, content) => {
    try {
      await fileAPI.autosave(fileId, { content });
      setOpenTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === fileId ? { ...tab, content, isSaved: true } : tab,
        ),
      );
    } catch (error) {
      console.error("Autosave error:", error);
    }
  };

  const value = {
    workspaces,
    currentWorkspace,
    folderTree,
    files,
    loading,
    openTabs,
    activeTab,
    setActiveTab,
    loadWorkspaces,
    loadWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    createFolder,
    deleteFolder,
    createFile,
    updateFile,
    deleteFile,
    openFile,
    closeTab,
    saveFile,
    autosaveFile,
    updateTabContent,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
