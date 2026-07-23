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
  FiLock,
  FiX,
  FiKey,
  FiAlertTriangle,
} from "react-icons/fi";
import DarkModeToggle from "../components/ui/DarkModeToggle";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileAccount from "../components/profile/ProfileAccount";
import ProfileEditForm from "../components/profile/ProfileEditForm";
import { profileAPI, authAPI } from "../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Account deletion state
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [stats, setStats] = useState({
    projects: 0,
    filesEdited: 0,
    storageUsed: "0 B",
    storageLimit: "10 GB",
    createdAt: "",
  });

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    try {
      const res = await profileAPI.getProfile();
      if (res.data?.stats) {
        setStats(res.data.stats);
      }
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Load profile stats error:", error);
      const createdAt = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown";
      setStats((prev) => ({ ...prev, createdAt }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setChangingPassword(true);
    try {
      await profileAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully! 🔑");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccountSubmit = async (e) => {
    e.preventDefault();
    setDeletingAccount(true);
    try {
      await profileAPI.deleteAccount({ password: deletePassword });
      toast.success("Account deleted successfully");
      logout();
      navigate("/");
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to delete account");
    } finally {
      setDeletingAccount(false);
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
          onChangePassword={() => setShowPasswordModal(true)}
          isEditing={showEditForm}
        />

        {/* Inline Edit Form */}
        {showEditForm && (
          <ProfileEditForm onClose={() => setShowEditForm(false)} />
        )}

        {/* Profile Info (bio, location, website, socials) */}
        {!showEditForm &&
          (user?.bio ||
            user?.location ||
            user?.website ||
            user?.github ||
            user?.twitter ||
            user?.linkedin) && (
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
                {(user?.location ||
                  user?.website ||
                  user?.github ||
                  user?.twitter ||
                  user?.linkedin) && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {user?.location && (
                      <span className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <FiMapPin size={14} className="text-indigo-500" />
                        {user.location}
                      </span>
                    )}
                    {user?.website && (
                      <a
                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
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
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
            <FiAlertTriangle size={20} /> Danger Zone
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Deleting your account is permanent. All your workspaces, projects, and custom preferences will be removed forever.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-medium text-sm">
            <FiTrash2 size={16} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiKey className="text-indigo-500" /> Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
                <FiX size={18} />
              </button>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={6}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <FiAlertTriangle /> Delete Account Permanently
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
                <FiX size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete your account? This will permanently wipe all your projects, files, and settings.
            </p>
            <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">
                  Enter Password to Confirm
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your account password"
                  className="w-full px-3 py-2 border border-red-300 dark:border-red-900 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50">
                  {deletingAccount ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
