// frontend/src/components/settings/SettingsSidebar.jsx
import React from "react";
import {
  FiSettings,
  FiEdit,
  FiFile,
  FiTerminal,
  FiCloud,
  FiBell,
  FiShield,
  FiInfo,
  FiSearch,
} from "react-icons/fi";
import { IoKeyOutline, IoColorPaletteOutline } from "react-icons/io5";
import { BsBoxSeam, BsGit } from "react-icons/bs";

const menuItems = [
  { id: "general", label: "General", icon: FiSettings },
  { id: "appearance", label: "Appearance", icon: IoColorPaletteOutline },
  { id: "editor", label: "Editor", icon: FiEdit },
  { id: "files", label: "Files", icon: FiFile },
  { id: "terminal", label: "Terminal", icon: FiTerminal },
  { id: "keyboard", label: "Keyboard", icon: IoKeyOutline },
  { id: "extensions", label: "Extensions", icon: BsBoxSeam },
  { id: "git", label: "Git", icon: BsGit },
  { id: "cloud", label: "Cloud", icon: FiCloud },
  { id: "notifications", label: "Notifications", icon: FiBell },
  { id: "security", label: "Security", icon: FiShield },
  { id: "about", label: "About", icon: FiInfo },
];

const SettingsSidebar = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="p-4">
      {/* Search */}
      <div className="relative mb-4">
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search Settings..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Menu */}
      <nav className="space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                isActive ?
                  "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white"
              }`}>
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;
