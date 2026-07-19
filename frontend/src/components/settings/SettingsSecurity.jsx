// frontend/src/components/settings/SettingsSecurity.jsx
import React, { useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
} from "react-icons/fi";
import toast from "react-hot-toast";

const SettingsSecurity = () => {
  const { settings, updateSettings } = useSettings();
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: "Chrome on Windows",
      location: "Addis Ababa, Ethiopia",
      active: true,
    },
    {
      id: 2,
      device: "Safari on iPhone",
      location: "Addis Ababa, Ethiopia",
      active: true,
    },
    {
      id: 3,
      device: "Firefox on Linux",
      location: "Nairobi, Kenya",
      active: false,
    },
  ]);

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleChangePassword = () => {
    toast.success("Password change link sent to your email");
  };

  const handleTwoFactorToggle = () => {
    handleChange("twoFactorAuth", !settings.twoFactorAuth);
    toast.success(settings.twoFactorAuth ? "2FA disabled" : "2FA enabled");
  };

  const handleLogoutSession = (id) => {
    setSessions(
      sessions.map((s) => (s.id === id ? { ...s, active: false } : s)),
    );
    toast.success("Session logged out");
  };

  return (
    <div className="space-y-6">
      {/* Two Factor Authentication */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Two Factor Authentication
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add an extra layer of security to your account
          </p>
        </div>
        <button
          onClick={handleTwoFactorToggle}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
            settings.twoFactorAuth ?
              "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}>
          {settings.twoFactorAuth ?
            <>
              <FiCheckCircle size={16} />
              <span>Enabled</span>
            </>
          : <>
              <FiXCircle size={16} />
              <span>Disabled</span>
            </>
          }
        </button>
      </div>

      {/* Change Password */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Change Password
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Update your password to keep your account secure
          </p>
        </div>
        <button
          onClick={handleChangePassword}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm">
          Change Password
        </button>
      </div>

      {/* Active Sessions */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Active Sessions
        </h4>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  {session.device}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.location}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    session.active ?
                      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}>
                  {session.active ? "Active" : "Logged Out"}
                </span>
                {session.active && (
                  <button
                    onClick={() => handleLogoutSession(session.id)}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline">
                    Logout
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsSecurity;
