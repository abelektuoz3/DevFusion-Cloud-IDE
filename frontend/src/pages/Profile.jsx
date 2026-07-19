// frontend/src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiArrowLeft,
  FiTrash2,
  FiMapPin,
  FiGlobe,
  FiGithub,
  FiTwitter,
  FiLinkedin,
} from "react-icons/fi";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileAccount from "../components/profile/ProfileAccount";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import { workspaceAPI } from "../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [stats, setStats] = useState({
    projects: 0,
    filesEdited: 0,
    storageUsed: "0 MB",
    storageLimit: "10 GB",
    createdAt: "",
  });

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      // Fetch real workspace count
      const res = await workspaceAPI.getAll();
      const workspaces = res.data?.workspaces || res.data || [];
      const count = Array.isArray(workspaces) ? workspaces.length : 0;

      // Format account creation date
      const createdAt = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown";

      setStats({
        projects: count,
        filesEdited: 0,
        storageUsed: "—",
        storageLimit: "10 GB",
        createdAt,
      });
    } catch (error) {
      console.error("Load stats error:", error);
      // fallback with real creation date
      const createdAt = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown";
      setStats((prev) => ({ ...prev, createdAt }));
    }
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
      toast.error("Account deletion is not available yet.");
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
          onEditProfile={() => setShowEditForm((v) => !v)}
          onChangePassword={handleChangePassword}
          isEditing={showEditForm}
        />

        {/* Inline Edit Form */}
        {showEditForm && (
          <ProfileEditForm onClose={() => setShowEditForm(false)} />
        )}

        {/* Profile Info (bio, location, website, socials) */}
        {!showEditForm && (user?.bio || user?.location || user?.website || user?.github || user?.twitter || user?.linkedin) && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About
            </h3>
            <div className="space-y-3">
              {user?.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {user.bio}
                </p>
              )}
              {(user?.location || user?.website || user?.github || user?.twitter || user?.linkedin) && (
                <div className="flex flex-wrap gap-4 pt-2">
                  {user?.location && (
                    <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <FiMapPin size={14} className="text-indigo-500" />
                      {user.location}
                    </span>
                  )}
                  {user?.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                      <FiGlobe size={14} />
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {user?.github && (
                    <a
                      href={`https://github.com/${user.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-indigo-500 transition">
                      <FiGithub size={14} />
                      {user.github}
                    </a>
                  )}
                  {user?.twitter && (
                    <a
                      href={`https://twitter.com/${user.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:underline">
                      <FiTwitter size={14} />
                      @{user.twitter}
                    </a>
                  )}
                  {user?.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${user.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      <FiLinkedin size={14} />
                      {user.linkedin}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

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
