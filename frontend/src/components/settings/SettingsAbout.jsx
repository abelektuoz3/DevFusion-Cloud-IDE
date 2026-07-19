// frontend/src/components/settings/SettingsAbout.jsx
import React from "react";
import {
  FiCode,
  FiServer,
  FiDatabase,
  FiBookOpen,
  FiHeart,
} from "react-icons/fi";

const SettingsAbout = () => {
  const version = "2.0.0";
  const releaseDate = "July 2026";

  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/25">
          <FiCode className="text-white text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          DevFusion Cloud IDE
        </h2>
        <p className="text-gray-500 dark:text-gray-400">Version {version}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Released {releaseDate}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <FiCode className="text-indigo-500 text-xl" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Frontend
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                React 18 + Vite
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <FiServer className="text-green-500 text-xl" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Backend
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Node.js + Express
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <FiDatabase className="text-yellow-500 text-xl" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Database
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                MongoDB Atlas
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <FiBookOpen className="text-purple-500 text-xl" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Editor
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Monaco Editor
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} DevFusion Cloud IDE. All rights reserved.
        </p>
        <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-1 flex items-center justify-center space-x-1">
          <span>Made with</span>
          <FiHeart className="text-red-500 inline" size={12} />
          <span>by Abel Eskinder Taye</span>
        </p>
      </div>
    </div>
  );
};

export default SettingsAbout;
