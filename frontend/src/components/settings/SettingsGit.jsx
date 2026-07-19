// frontend/src/components/settings/SettingsGit.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsGit = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Git Username
        </label>
        <input
          type="text"
          value={settings.gitUsername}
          onChange={(e) => handleChange("gitUsername", e.target.value)}
          placeholder="Enter your Git username"
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Git Email
        </label>
        <input
          type="email"
          value={settings.gitEmail}
          onChange={(e) => handleChange("gitEmail", e.target.value)}
          placeholder="Enter your Git email"
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Auto Fetch */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.autoFetch}
          onChange={(e) => handleChange("autoFetch", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Auto Fetch
        </span>
      </label>

      {/* Confirm Before Push */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.confirmBeforePush}
          onChange={(e) => handleChange("confirmBeforePush", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Confirm before pushing
        </span>
      </label>

      {/* Git Decorations */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.gitDecorations}
          onChange={(e) => handleChange("gitDecorations", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Show Git Decorations
        </span>
      </label>
    </div>
  );
};

export default SettingsGit;
