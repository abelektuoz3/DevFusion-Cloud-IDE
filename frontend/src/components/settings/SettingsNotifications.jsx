// frontend/src/components/settings/SettingsNotifications.jsx
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const SettingsNotifications = () => {
  const { settings, updateSettings } = useSettings();

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Configure how and when you receive notifications
      </p>

      {/* Desktop Notifications */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.desktopNotifications}
          onChange={(e) =>
            handleChange("desktopNotifications", e.target.checked)
          }
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Desktop Notifications
        </span>
      </label>

      {/* Sound */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.sound}
          onChange={(e) => handleChange("sound", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Sound Notifications
        </span>
      </label>

      {/* Update Notifications */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.updateNotifications}
          onChange={(e) =>
            handleChange("updateNotifications", e.target.checked)
          }
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Update Notifications
        </span>
      </label>

      {/* Friend Activity */}
      <label className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={settings.friendActivity}
          onChange={(e) => handleChange("friendActivity", e.target.checked)}
          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700 dark:text-gray-300">
          Friend Activity
        </span>
      </label>
    </div>
  );
};

export default SettingsNotifications;
