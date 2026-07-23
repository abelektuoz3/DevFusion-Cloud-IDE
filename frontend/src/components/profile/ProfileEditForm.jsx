// frontend/src/components/profile/ProfileEditForm.jsx
import React, { useState, useEffect } from "react";
import {
  FiSave,
  FiX,
  FiGlobe,
  FiMapPin,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiAlignLeft,
  FiUser,
} from "react-icons/fi";
import { authAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfileEditForm = ({ onClose }) => {
  const { user, setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    username: "",
    bio: "",
    location: "",
    website: "",
    github: "",
    twitter: "",
    linkedin: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        github: user.github || "",
        twitter: user.twitter || "",
        linkedin: user.linkedin || "",
      });
    }
  }, [user]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (form.username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    setSaving(true);
    try {
      const response = await authAPI.updateProfile(form);
      if (response.data?.user) {
        setUser(response.data.user);
        toast.success("Profile updated successfully!");
        onClose();
      }
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-200 dark:border-indigo-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ✏️ Edit Profile
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
          title="Cancel">
          <FiX size={18} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <FiUser size={14} /> Username
          </label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            placeholder="Username"
            minLength={3}
            maxLength={30}
            className={inputClass}
          />
        </div>
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <FiAlignLeft size={14} /> Bio
          </label>
          <textarea
            value={form.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            placeholder="Tell the world a little about yourself..."
            maxLength={500}
            rows={3}
            className={inputClass + " resize-none"}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {form.bio.length}/500
          </p>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <FiMapPin size={14} /> Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="City, Country"
            className={inputClass}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <FiGlobe size={14} /> Website
          </label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://yourwebsite.com"
            className={inputClass}
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <FiGithub size={14} /> GitHub
            </label>
            <input
              type="text"
              value={form.github}
              onChange={(e) => handleChange("github", e.target.value)}
              placeholder="username"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <FiTwitter size={14} /> Twitter
            </label>
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
              placeholder="username"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
              <FiLinkedin size={14} /> LinkedIn
            </label>
            <input
              type="text"
              value={form.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="username"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 text-sm font-medium">
          <FiSave size={15} />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ProfileEditForm;
