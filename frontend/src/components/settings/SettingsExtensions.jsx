// frontend/src/components/settings/SettingsExtensions.jsx
import React, { useState } from "react";
import { FiSearch, FiDownload, FiCheck, FiX, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const SettingsExtensions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [installedExtensions, setInstalledExtensions] = useState([
    {
      id: "1",
      name: "ESLint",
      description: "JavaScript linting",
      installed: true,
    },
    {
      id: "2",
      name: "Prettier",
      description: "Code formatter",
      installed: true,
    },
    {
      id: "3",
      name: "Tailwind CSS",
      description: "Tailwind CSS IntelliSense",
      installed: false,
    },
    {
      id: "4",
      name: "GitLens",
      description: "Git supercharged",
      installed: false,
    },
  ]);

  const toggleExtension = (id) => {
    setInstalledExtensions(
      installedExtensions.map((ext) =>
        ext.id === id ? { ...ext, installed: !ext.installed } : ext,
      ),
    );
    const ext = installedExtensions.find((e) => e.id === id);
    toast.success(
      ext?.installed ? `"${ext.name}" uninstalled` : `"${ext.name}" installed`,
    );
  };

  const filteredExtensions = installedExtensions.filter(
    (ext) =>
      ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ext.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <FiSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search extensions..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Extensions List */}
      <div className="space-y-2">
        {filteredExtensions.map((ext) => (
          <div
            key={ext.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {ext.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {ext.description}
              </p>
            </div>
            <button
              onClick={() => toggleExtension(ext.id)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm transition ${
                ext.installed ?
                  "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
                : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
              }`}>
              {ext.installed ?
                <>
                  <FiCheck size={14} />
                  <span>Installed</span>
                </>
              : <>
                  <FiDownload size={14} />
                  <span>Install</span>
                </>
              }
            </button>
          </div>
        ))}
      </div>

      {filteredExtensions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No extensions found</p>
        </div>
      )}
    </div>
  );
};

export default SettingsExtensions;
