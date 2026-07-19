// frontend/src/components/settings/SettingsKeyboard.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsKeyboard = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ keybindings: { ...settings.keybindings, [key]: value } });
  };

  const shortcuts = [
    { id: "save", label: "Save", default: "Ctrl+S" },
    { id: "commandPalette", label: "Command Palette", default: "Ctrl+Shift+P" },
    { id: "quickOpen", label: "Quick Open", default: "Ctrl+P" },
    { id: "toggleSidebar", label: "Toggle Sidebar", default: "Ctrl+B" },
    { id: "comment", label: "Toggle Comment", default: "Ctrl+/" },
    { id: "search", label: "Search", default: "Ctrl+Shift+F" },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Customize keyboard shortcuts. Click on a shortcut to edit it.
      </p>

      <div className="space-y-3">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {shortcut.label}
            </span>
            <input
              type="text"
              value={settings.keybindings?.[shortcut.id] || shortcut.default}
              onChange={(e) => handleChange(shortcut.id, e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 text-center"
              placeholder={shortcut.default}
            />
          </div>
        ))}
      </div>

      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Click on the input field and press the desired key combination to
          change the shortcut.
        </p>
      </div>
    </div>
  );
};

export default SettingsKeyboard;
