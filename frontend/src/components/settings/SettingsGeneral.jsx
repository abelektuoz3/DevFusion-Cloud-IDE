// frontend/src/components/settings/SettingsGeneral.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsGeneral = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Language
        </label>
        <select
          value={settings.language}
          onChange={(e) => handleChange("language", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="en">English</option>
          <option value="am">አማርኛ</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
          <option value="zh">中文</option>
          <option value="ja">日本語</option>
        </select>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Timezone
        </label>
        <select
          value={settings.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="Africa/Addis_Ababa">Africa/Addis_Ababa (UTC+3)</option>
          <option value="America/New_York">America/New_York (UTC-4)</option>
          <option value="Europe/London">Europe/London (UTC+1)</option>
          <option value="Europe/Paris">Europe/Paris (UTC+2)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
          <option value="Australia/Sydney">Australia/Sydney (UTC+10)</option>
        </select>
      </div>

      {/* Startup Options */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Startup Options
        </h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.restoreWorkspace}
              onChange={(e) =>
                handleChange("restoreWorkspace", e.target.checked)
              }
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Restore previous workspace on startup
            </span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.openWelcome}
              onChange={(e) => handleChange("openWelcome", e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Open Welcome Page on startup
            </span>
          </label>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Recent Projects
        </label>
        <select
          value={settings.recentProjects}
          onChange={(e) =>
            handleChange("recentProjects", parseInt(e.target.value))
          }
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value={0}>None</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsGeneral;
