// frontend/src/components/profile/ProfileHeader.jsx
import React, { useRef } from "react";
import { FiCamera, FiEdit2, FiLock, FiMail } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import toast from "react-hot-toast";

const ProfileHeader = ({ user, onEditProfile, onChangePassword }) => {
  const { setUser } = useAuth();
  const fileInputRef = useRef(null);

  const handleUploadPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const loadingToast = toast.loading("Uploading avatar...");
        const response = await authAPI.updateProfile({ avatar: reader.result });
        toast.dismiss(loadingToast);
        
        if (response.data?.user) {
          setUser(response.data.user);
          toast.success("Profile picture updated!");
        }
      } catch (error) {
        console.error("Upload photo error:", error);
        toast.error(error.response?.data?.error || "Failed to update profile picture");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-200 dark:border-slate-700 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <button
            onClick={handleUploadPhoto}
            className="absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg"
            title="Upload photo">
            <FiCamera size={14} />
          </button>
        </div>

        {/* User Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user?.username || "User"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            @{user?.username?.toLowerCase() || "username"}
          </p>
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mt-1">
            <FiMail size={14} />
            <span className="text-sm">{user?.email || "user@example.com"}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onEditProfile}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition">
            <FiEdit2 size={16} />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={onChangePassword}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg transition text-gray-700 dark:text-gray-300">
            <FiLock size={16} />
            <span>Change Password</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
