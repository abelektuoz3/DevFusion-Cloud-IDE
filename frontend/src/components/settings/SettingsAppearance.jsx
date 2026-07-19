// frontend/src/components/settings/SettingsAppearance.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";
import { useTheme } from "../../context/ThemeContext";

const themes = [
  { id: "dark-plus", label: "Dark+", icon: "🌙" },
  { id: "light-plus", label: "Light+", icon: "☀️" },
  { id: "midnight", label: "Midnight", icon: "🌃" },
  { id: "dracula", label: "Dracula", icon: "🧛" },
  { id: "one-dark-pro", label: "One Dark Pro", icon: "🎨" },
  { id: "github-dark", label: "GitHub Dark", icon: "🐙" },
];

const accentColors = [
  { id: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { id: "blue", label: "Blue", class: "bg-blue-500" },
  { id: "green", label: "Green", class: "bg-green-500" },
  { id: "red", label: "Red", class: "bg-red-500" },
  { id: "purple", label: "Purple", class: "bg-purple-500" },
  { id: "pink", label: "Pink", class: "bg-pink-500" },
  { id: "orange", label: "Orange", class: "bg-orange-500" },
  { id: "teal", label: "Teal", class: "bg-teal-500" },
];

const fontSizes = [10, 11, 12, 13, 14, 15, 16, 18, 20, 22, 24];
const fonts = [
  "JetBrains Mono",
  "Fira Code",
  "Cascadia Code",
  "Consolas",
  "Monaco",
  "Menlo",
];

const SettingsAppearance = () => {
  const { settings, updateSettings } = useSettings();
  const { isDark, toggleTheme } = useTheme();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Theme
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                handleChange("theme", theme.id);
                if (theme.id.includes("dark") || theme.id === "midnight") {
                  if (!isDark) toggleTheme();
                } else {
                  if (isDark) toggleTheme();
                }
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                settings.theme === theme.id ?
                  "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30"
                : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
              }`}>
              <div className="text-2xl">{theme.icon}</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                {theme.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Accent Color
        </label>
        <div className="flex flex-wrap gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              onClick={() => handleChange("accentColor", color.id)}
              className={`w-10 h-10 rounded-full ${color.class} transition-all ${
                settings.accentColor === color.id ?
                  "ring-4 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-900"
                : "hover:scale-110"
              }`}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Editor Font Size */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Editor Font Size
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="range"
            min={10}
            max={24}
            value={settings.fontSize}
            onChange={(e) => handleChange("fontSize", parseInt(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm font-mono text-gray-900 dark:text-white w-8">
            {settings.fontSize}
          </span>
        </div>
      </div>

      {/* Editor Font */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Editor Font
        </label>
        <select
          value={settings.editorFont}
          onChange={(e) => handleChange("editorFont", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Tree Density */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tree Density
        </label>
        <select
          value={settings.treeDensity}
          onChange={(e) => handleChange("treeDensity", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="compact">Compact</option>
          <option value="medium">Medium</option>
          <option value="comfortable">Comfortable</option>
        </select>
      </div>
    </div>
  );
};

export default SettingsAppearance;
