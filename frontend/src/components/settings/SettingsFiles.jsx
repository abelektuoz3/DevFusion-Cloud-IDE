// frontend/src/components/settings/SettingsFiles.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsFiles = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Auto Save */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Auto Save
        </label>
        <select
          value={settings.autoSave ? "on" : "off"}
          onChange={(e) => handleChange("autoSave", e.target.value === "on")}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="on">On</option>
          <option value="off">Off</option>
        </select>
      </div>

      {/* Auto Save Delay */}
      {settings.autoSave && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Auto Save Delay (ms)
          </label>
          <input
            type="number"
            value={settings.autoSaveDelay}
            onChange={(e) =>
              handleChange("autoSaveDelay", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min={100}
            max={5000}
            step={100}
          />
        </div>
      )}

      {/* Confirm Before Delete */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.confirmBeforeDelete}
          onChange={(e) =>
            handleChange("confirmBeforeDelete", e.target.checked)
          }
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Confirm before deleting files
        </span>
      </label>

      {/* Trim Trailing Whitespace */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.trimTrailingWhitespace}
          onChange={(e) =>
            handleChange("trimTrailingWhitespace", e.target.checked)
          }
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Trim trailing whitespace on save
        </span>
      </label>

      {/* Insert Final Newline */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.insertFinalNewline}
          onChange={(e) => handleChange("insertFinalNewline", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Insert final newline on save
        </span>
      </label>

      {/* Exclude Files */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Exclude Files/Folders
        </label>
        <input
          type="text"
          value={settings.exclude?.join(", ") || ""}
          onChange={(e) =>
            handleChange(
              "exclude",
              e.target.value.split(",").map((s) => s.trim()),
            )
          }
          placeholder="node_modules, dist, build, .git"
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Comma-separated list of files/folders to exclude
        </p>
      </div>
    </div>
  );
};

export default SettingsFiles;
