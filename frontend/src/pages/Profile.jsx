// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
  FiArrowLeft,
  FiCamera,
  FiEdit2,
  FiLock,
  FiTrash2,
  FiMail,
  FiCheckCircle,
  FiGlobe,
  FiClock,
} from "react-icons/fi";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileAccount from "../components/profile/ProfileAccount";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    filesEdited: 0,
    storageUsed: "0 GB",
    storageLimit: "10 GB",
    createdAt: "",
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats({
        projects: 24,
        filesEdited: 1280,
        storageUsed: "2.8 GB",
        storageLimit: "10 GB",
        createdAt: "July 2026",
      });
    } catch (error) {
      console.error("Load stats error:", error);
    }
  };

  const handleEditProfile = () => {
    navigate("/settings?tab=general");
  };

  const handleChangePassword = () => {
    navigate("/settings?tab=security");
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      toast.error("Account deletion is not available in demo mode");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
              title="Back to Dashboard">
              <FiArrowLeft className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Profile
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Manage your account and personal information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          onEditProfile={handleEditProfile}
          onChangePassword={handleChangePassword}
        />

        {/* Statistics */}
        <ProfileStats stats={stats} />

        {/* Account Information */}
        <ProfileAccount />

        {/* Danger Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
            ⚠️ Danger Zone
          </h3>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
            <FiTrash2 size={16} />
            <span>Delete Account</span>
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
