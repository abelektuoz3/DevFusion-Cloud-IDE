// frontend/src/components/profile/ProfileAccount.jsx
import React, { useState } from "react";
import { FiCheckCircle, FiXCircle, FiGlobe, FiClock, FiMail, FiSend } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { settingsAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const languagesMap = {
  en: "English",
  am: "አማርኛ (Amharic)",
  es: "Español (Spanish)",
  fr: "Français (French)",
  de: "Deutsch (German)",
  zh: "中文 (Chinese)",
  ja: "日本語 (Japanese)",
};

const commonTimezones = [
  "Africa/Addis_Ababa",
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
];

const ProfileAccount = () => {
  const { user, setUser, resendOTP, setPendingEmail } = useAuth();
  const navigate = useNavigate();
  const [updatingSetting, setUpdatingSetting] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const handleUpdateSetting = async (key, value) => {
    setUpdatingSetting(true);
    try {
      const currentSettings = user?.settings || {};
      const newSettings = { ...currentSettings, [key]: value };
      const response = await settingsAPI.update(newSettings);
      
      if (response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser({ ...user, settings: newSettings });
      }
      toast.success(`${key === "language" ? "Language" : "Timezone"} updated!`);
    } catch (error) {
      console.error("Update setting error:", error);
      toast.error(error.response?.data?.error || "Failed to update preference");
    } finally {
      setUpdatingSetting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.email) return;
    setSendingOTP(true);
    try {
      setPendingEmail(user.email);
      await resendOTP(user.email);
      navigate("/verify-otp");
    } catch (error) {
      console.error("Verification trigger error:", error);
    } finally {
      setSendingOTP(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Account Settings
      </h3>
      <div className="space-y-4">
        {/* Email Verification */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-2">
          <div className="flex items-center space-x-2">
            <FiMail className="text-gray-400" size={16} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Verified Email
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {user?.isVerified ? (
              <span className="flex items-center space-x-1 text-green-500 font-medium text-sm">
                <FiCheckCircle size={16} />
                <span>Verified</span>
              </span>
            ) : (
              <div className="flex items-center space-x-3">
                <span className="flex items-center space-x-1 text-red-500 font-medium text-sm">
                  <FiXCircle size={16} />
                  <span>Unverified</span>
                </span>
                <button
                  onClick={handleVerifyEmail}
                  disabled={sendingOTP}
                  className="flex items-center space-x-1 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs transition font-medium">
                  <FiSend size={12} />
                  <span>{sendingOTP ? "Sending..." : "Verify Now"}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Preferred Language */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-2">
          <div className="flex items-center space-x-2">
            <FiGlobe className="text-gray-400" size={16} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Preferred Language
            </span>
          </div>
          <select
            value={user?.settings?.language || "en"}
            onChange={(e) => handleUpdateSetting("language", e.target.value)}
            disabled={updatingSetting}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            {Object.entries(languagesMap).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
          <div className="flex items-center space-x-2">
            <FiClock className="text-gray-400" size={16} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">Timezone</span>
          </div>
          <select
            value={user?.settings?.timezone || "Africa/Addis_Ababa"}
            onChange={(e) => handleUpdateSetting("timezone", e.target.value)}
            disabled={updatingSetting}
            className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono">
            {commonTimezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccount;
