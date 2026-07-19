// frontend/src/components/settings/SettingsSecurity.jsx
import React, { useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { authAPI } from "../../services/api";
import {
  FiShield,
  FiCheckCircle,
  FiXCircle,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import toast from "react-hot-toast";

const PasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const toggleShow = (key) =>
    setShow((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully!");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-2xl w-full max-w-md mx-4 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <FiLock className="text-indigo-500" />
          Change Password
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={show.current ? "text" : "password"}
                value={form.currentPassword}
                onChange={(e) => handleChange("currentPassword", e.target.value)}
                placeholder="Enter current password"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => toggleShow("current")}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                {show.current ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={show.new ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => handleChange("newPassword", e.target.value)}
                placeholder="At least 6 characters"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => toggleShow("new")}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                {show.new ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <div className="flex items-center gap-2">
              <input
                type={show.confirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Repeat new password"
                required
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => toggleShow("confirm")}
                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                {show.confirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* Strength indicator */}
          {form.newPassword && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      form.newPassword.length >= i * 2
                        ? i <= 1
                          ? "bg-red-500"
                          : i <= 2
                          ? "bg-yellow-500"
                          : i <= 3
                          ? "bg-blue-500"
                          : "bg-green-500"
                        : "bg-gray-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {form.newPassword.length < 4
                  ? "Weak"
                  : form.newPassword.length < 6
                  ? "Fair"
                  : form.newPassword.length < 10
                  ? "Good"
                  : "Strong"}{" "}
                password
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium disabled:opacity-50">
              {saving ? "Saving..." : "Change Password"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SettingsSecurity = () => {
  const { settings, updateSettings } = useSettings();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleTwoFactorToggle = () => {
    handleChange("twoFactorAuth", !settings.twoFactorAuth);
    toast.success(settings.twoFactorAuth ? "2FA disabled" : "2FA enabled");
  };

  return (
    <div className="space-y-6">
      {/* Change Password modal */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}

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
            settings.twoFactorAuth
              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
              : "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
          }`}>
          {settings.twoFactorAuth ? (
            <>
              <FiCheckCircle size={16} />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <FiXCircle size={16} />
              <span>Disabled</span>
            </>
          )}
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
          onClick={() => setShowPasswordModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm">
          Change Password
        </button>
      </div>

      {/* Security Tips */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
          <FiShield size={14} />
          Security Tips
        </h4>
        <ul className="text-xs text-indigo-700 dark:text-indigo-400 space-y-1 list-disc list-inside">
          <li>Use a strong, unique password of at least 12 characters</li>
          <li>Enable two-factor authentication for extra security</li>
          <li>Never share your password with anyone</li>
          <li>Log out from devices you no longer use</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsSecurity;
