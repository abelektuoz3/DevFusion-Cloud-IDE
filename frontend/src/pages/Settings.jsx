// frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSettings } from "../context/SettingsContext";
import { FiArrowLeft, FiSave, FiRefreshCw } from "react-icons/fi";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import SettingsGeneral from "../components/settings/SettingsGeneral";
import SettingsAppearance from "../components/settings/SettingsAppearance";
import SettingsEditor from "../components/settings/SettingsEditor";
import SettingsFiles from "../components/settings/SettingsFiles";
import SettingsTerminal from "../components/settings/SettingsTerminal";
import SettingsKeyboard from "../components/settings/SettingsKeyboard";
import SettingsExtensions from "../components/settings/SettingsExtensions";
import SettingsGit from "../components/settings/SettingsGit";
import SettingsCloud from "../components/settings/SettingsCloud";
import SettingsNotifications from "../components/settings/SettingsNotifications";
import SettingsSecurity from "../components/settings/SettingsSecurity";
import SettingsAbout from "../components/settings/SettingsAbout";
import toast from "react-hot-toast";

const Settings = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { settings, updateSettings, resetSettings, saveSettings, loading } =
    useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab) {
      setActiveTab(tab);
    }
  }, [location]);

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <SettingsGeneral />;
      case "appearance":
        return <SettingsAppearance />;
      case "editor":
        return <SettingsEditor />;
      case "files":
        return <SettingsFiles />;
      case "terminal":
        return <SettingsTerminal />;
      case "keyboard":
        return <SettingsKeyboard />;
      case "extensions":
        return <SettingsExtensions />;
      case "git":
        return <SettingsGit />;
      case "cloud":
        return <SettingsCloud />;
      case "notifications":
        return <SettingsNotifications />;
      case "security":
        return <SettingsSecurity />;
      case "about":
        return <SettingsAbout />;
      default:
        return <SettingsGeneral />;
    }
  };

  const handleSave = async () => {
    const success = await saveSettings();
    if (success) {
      toast.success("Settings saved successfully!");
    } else {
      toast.error("Failed to save settings");
    }
  };

  const handleReset = async () => {
    if (window.confirm("Reset all settings to default?")) {
      const success = await resetSettings();
      if (success) {
        toast.success("Settings reset to default");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              title="Back to Dashboard">
              <FiArrowLeft className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Settings
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure your IDE preferences
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50">
              <FiSave size={16} />
              <span>Save</span>
            </button>
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition text-gray-700 dark:text-gray-300">
              <FiRefreshCw size={16} />
              <span>Reset</span>
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Settings Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-700">
              <SettingsSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>

            {/* Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeTab} Settings
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure your {activeTab} preferences
                </p>
              </div>
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
