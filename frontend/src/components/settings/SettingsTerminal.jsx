// frontend/src/components/settings/SettingsTerminal.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsTerminal = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Default Shell */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Default Shell
        </label>
        <select
          value={settings.defaultShell}
          onChange={(e) => handleChange("defaultShell", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="bash">Bash</option>
          <option value="zsh">Zsh</option>
          <option value="fish">Fish</option>
          <option value="powershell">PowerShell</option>
          <option value="cmd">CMD</option>
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Terminal Font Size
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min={10}
            max={24}
            value={settings.terminalFontSize}
            onChange={(e) =>
              handleChange("terminalFontSize", parseInt(e.target.value))
            }
            className="flex-1"
          />
          <span className="text-sm font-mono text-gray-900 dark:text-white w-8">
            {settings.terminalFontSize}
          </span>
        </div>
      </div>

      {/* Cursor Blink */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.cursorBlink}
          onChange={(e) => handleChange("cursorBlink", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Cursor Blink
        </span>
      </label>

      {/* Cursor Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Cursor Style
        </label>
        <select
          value={settings.terminalCursorStyle}
          onChange={(e) => handleChange("terminalCursorStyle", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="block">Block</option>
          <option value="line">Line</option>
          <option value="underline">Underline</option>
        </select>
      </div>

      {/* Terminal Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Terminal Theme
        </label>
        <select
          value={settings.terminalTheme}
          onChange={(e) => handleChange("terminalTheme", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="material">Material</option>
          <option value="solarized">Solarized</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsTerminal;
