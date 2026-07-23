// frontend/src/context/SettingsContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { settingsAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    // General
    language: "en",
    timezone: "Africa/Addis_Ababa",
    autoSave: true,
    autoSaveDelay: 1000,
    startup: "welcome",
    restoreWorkspace: true,
    openWelcome: true,
    recentProjects: 5,

    // Appearance
    theme: "dark-plus",
    accentColor: "indigo",
    fontSize: 14,
    editorFont: "JetBrains Mono",
    iconTheme: "default",
    treeDensity: "medium",
    windowZoom: 100,

    // Editor
    tabSize: 2,
    insertSpaces: true,
    wordWrap: "on",
    minimap: true,
    lineNumbers: true,
    bracketPairColorization: true,
    stickyScroll: true,
    cursorStyle: "line",
    smoothScrolling: true,

    // Files
    confirmBeforeDelete: true,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    exclude: ["node_modules", "dist", "build", ".git"],

    // Terminal
    defaultShell: "bash",
    terminalFontSize: 14,
    cursorBlink: true,
    terminalCursorStyle: "block",
    terminalTheme: "dark",

    // Keyboard
    keybindings: {
      save: "Ctrl+S",
      commandPalette: "Ctrl+Shift+P",
      quickOpen: "Ctrl+P",
      toggleSidebar: "Ctrl+B",
      comment: "Ctrl+/",
      search: "Ctrl+Shift+F",
    },

    // Git
    gitUsername: "",
    gitEmail: "",
    autoFetch: true,
    confirmBeforePush: true,
    gitDecorations: true,

    // Cloud
    cloudSync: true,
    backupFrequency: "daily",
    workspaceSync: true,

    // Notifications
    desktopNotifications: true,
    sound: true,
    updateNotifications: true,
    friendActivity: true,

    // Security
    twoFactorAuth: false,
  });

  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Sync settings when user settings are updated/loaded from AuthContext
  useEffect(() => {
    if (user?.settings) {
      setSettings((prev) => ({
        ...prev,
        ...user.settings,
        keybindings: {
          save: "Ctrl+S",
          commandPalette: "Ctrl+Shift+P",
          quickOpen: "Ctrl+P",
          toggleSidebar: "Ctrl+B",
          comment: "Ctrl+/",
          search: "Ctrl+Shift+F",
          ...(prev.keybindings || {}),
          ...(user.settings.keybindings || {}),
        },
        exclude: Array.isArray(user.settings.exclude)
          ? user.settings.exclude
          : (prev.exclude || ["node_modules", "dist", "build", ".git"]),
      }));
    }
  }, [user?._id, user?.settings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.get();
      if (response.data?.settings) {
        setSettings((prev) => ({ ...prev, ...response.data.settings }));
        if (setUser) {
          setUser((prevUser) => {
            if (!prevUser) return prevUser;
            return {
              ...prevUser,
              settings: { ...prevUser.settings, ...response.data.settings },
            };
          });
        }
      }
    } catch (error) {
      console.error("Load settings error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.update(settings);
      const updatedUser = response.data?.user;
      if (setUser && updatedUser) {
        setUser(updatedUser);
      } else if (setUser) {
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            settings: { ...prevUser.settings, ...settings },
          };
        });
      }
      return true;
    } catch (error) {
      console.error("Save settings error:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    const defaultSettings = {
      language: "en",
      timezone: "Africa/Addis_Ababa",
      autoSave: true,
      autoSaveDelay: 1000,
      startup: "welcome",
      restoreWorkspace: true,
      openWelcome: true,
      recentProjects: 5,
      theme: "dark-plus",
      accentColor: "indigo",
      fontSize: 14,
      editorFont: "JetBrains Mono",
      iconTheme: "default",
      treeDensity: "medium",
      windowZoom: 100,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: "on",
      minimap: true,
      lineNumbers: true,
      bracketPairColorization: true,
      stickyScroll: true,
      cursorStyle: "line",
      smoothScrolling: true,
      confirmBeforeDelete: true,
      trimTrailingWhitespace: true,
      insertFinalNewline: true,
      exclude: ["node_modules", "dist", "build", ".git"],
      defaultShell: "bash",
      terminalFontSize: 14,
      cursorBlink: true,
      terminalCursorStyle: "block",
      terminalTheme: "dark",
      keybindings: {
        save: "Ctrl+S",
        commandPalette: "Ctrl+Shift+P",
        quickOpen: "Ctrl+P",
        toggleSidebar: "Ctrl+B",
        comment: "Ctrl+/",
        search: "Ctrl+Shift+F",
      },
      gitUsername: "",
      gitEmail: "",
      autoFetch: true,
      confirmBeforePush: true,
      gitDecorations: true,
      cloudSync: true,
      backupFrequency: "daily",
      workspaceSync: true,
      desktopNotifications: true,
      sound: true,
      updateNotifications: true,
      friendActivity: true,
      twoFactorAuth: false,
    };
    setSettings(defaultSettings);
    try {
      await settingsAPI.update(defaultSettings);
      if (setUser) {
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            settings: defaultSettings,
          };
        });
      }
      return true;
    } catch (error) {
      console.error("Reset settings error:", error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user?._id]);

  const value = {
    settings,
    loading,
    loadSettings,
    updateSettings,
    saveSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
