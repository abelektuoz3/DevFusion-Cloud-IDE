// frontend/src/components/settings/SettingsCloud.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";
import { FiCloud, FiDownload, FiUpload } from "react-icons/fi";
import toast from "react-hot-toast";

const SettingsCloud = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleBackup = () => {
    toast.success("Backup created successfully!");
  };

  const handleRestore = () => {
    toast.success("Backup restored successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Cloud Sync */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.cloudSync}
          onChange={(e) => handleChange("cloudSync", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Enable Cloud Sync
        </span>
      </label>

      {/* Backup Frequency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Backup Frequency
        </label>
        <select
          value={settings.backupFrequency}
          onChange={(e) => handleChange("backupFrequency", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="manual">Manual</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      {/* Workspace Sync */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.workspaceSync}
          onChange={(e) => handleChange("workspaceSync", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Sync Workspaces
        </span>
      </label>

      {/* Backup Actions */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Backup Actions
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleBackup}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
            <FiUpload size={16} />
            <span>Create Backup</span>
          </button>
          <button
            onClick={handleRestore}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition text-gray-700 dark:text-gray-300">
            <FiDownload size={16} />
            <span>Restore Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsCloud;
