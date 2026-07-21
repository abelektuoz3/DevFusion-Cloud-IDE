// frontend/src/components/profile/ProfileHeader.jsx
import React, { useState } from "react";
import { FiCamera, FiEdit2, FiLock, FiMail, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ProfileHeader = ({
  user,
  onEditProfile,
  onChangePassword,
  isEditing,
}) => {
  const { api } = useAuth();
  const [uploading, setUploading] = useState(false);

  // ✅ Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 200; // Max width/height in pixels
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 80% quality
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // ✅ Handle avatar upload with compression
  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(true);
    try {
      // ✅ Compress the image
      const compressedImage = await compressImage(file);

      // ✅ Send to backend
      const response = await api.put("/auth/profile", {
        avatar: compressedImage,
      });

      if (response.data.user) {
        toast.success("Profile picture updated successfully!");
        // Reload to show updated avatar
        window.location.reload();
      }
    } catch (error) {
      console.error("Upload photo error:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to upload photo";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Profile Picture */}
        <div className="relative flex-shrink-0">
          {user?.avatar ?
            <img
              src={user.avatar}
              alt={user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500"
            />
          : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl text-white shadow-lg">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>
          }
          <label
            htmlFor="avatar-upload"
            className={`absolute -bottom-1 -right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg cursor-pointer ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Upload photo">
            {uploading ?
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <FiCamera size={14} />}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleUploadPhoto}
            className="hidden"
            disabled={uploading}
          />
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
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              isEditing ?
                "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}>
            <FiEdit2 size={16} />
            <span>{isEditing ? "Cancel Edit" : "Edit Profile"}</span>
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
