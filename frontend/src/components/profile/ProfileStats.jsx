// frontend/src/components/profile/ProfileStats.jsx
import React from "react";
import { FiFolder, FiFile, FiHardDrive, FiCalendar } from "react-icons/fi";

const ProfileStats = ({ stats }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 Statistics
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <FiFolder className="text-indigo-500 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.projects}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Projects Created
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <FiFile className="text-green-500 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.filesEdited.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Files Edited
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <FiHardDrive className="text-yellow-500 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.storageUsed}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats.storageLimit} Used
          </div>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <FiCalendar className="text-purple-500 text-2xl mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.createdAt}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Account Created
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
