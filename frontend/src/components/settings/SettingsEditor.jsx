// frontend/src/components/settings/SettingsEditor.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsEditor = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Tab Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tab Size
        </label>
        <select
          value={settings.tabSize}
          onChange={(e) => handleChange("tabSize", parseInt(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value={2}>2</option>
          <option value={4}>4</option>
          <option value={8}>8</option>
        </select>
      </div>

      {/* Insert Spaces */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.insertSpaces}
          onChange={(e) => handleChange("insertSpaces", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Insert Spaces
        </span>
      </label>

      {/* Word Wrap */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Word Wrap
        </label>
        <select
          value={settings.wordWrap}
          onChange={(e) => handleChange("wordWrap", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="off">Off</option>
          <option value="on">On</option>
          <option value="wordWrapColumn">Word Wrap Column</option>
          <option value="bounded">Bounded</option>
        </select>
      </div>

      {/* Minimap */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.minimap}
          onChange={(e) => handleChange("minimap", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Show Minimap
        </span>
      </label>

      {/* Line Numbers */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.lineNumbers}
          onChange={(e) => handleChange("lineNumbers", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Show Line Numbers
        </span>
      </label>

      {/* Bracket Pair Colorization */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.bracketPairColorization}
          onChange={(e) =>
            handleChange("bracketPairColorization", e.target.checked)
          }
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Bracket Pair Colorization
        </span>
      </label>

      {/* Sticky Scroll */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.stickyScroll}
          onChange={(e) => handleChange("stickyScroll", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Sticky Scroll
        </span>
      </label>

      {/* Smooth Scrolling */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.smoothScrolling}
          onChange={(e) => handleChange("smoothScrolling", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Smooth Scrolling
        </span>
      </label>
    </div>
  );
};

export default SettingsEditor;
