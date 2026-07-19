// frontend/src/components/profile/ProfileAccount.jsx
import React from "react";
import { FiCheckCircle } from "react-icons/fi";

const ProfileAccount = () => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Account
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
          <span className="text-gray-600 dark:text-gray-400">
            Verified Email
          </span>
          <span className="flex items-center space-x-1 text-green-500">
            <FiCheckCircle size={16} />
            <span>Verified</span>
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
          <span className="text-gray-600 dark:text-gray-400">
            Connected Google
          </span>
          <span className="flex items-center space-x-1 text-green-500">
            <FiCheckCircle size={16} />
            <span>Connected</span>
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
          <span className="text-gray-600 dark:text-gray-400">
            Preferred Language
          </span>
          <span className="text-gray-900 dark:text-white">English</span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400">Timezone</span>
          <span className="text-gray-900 dark:text-white">
            Africa/Addis_Ababa
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccount;
