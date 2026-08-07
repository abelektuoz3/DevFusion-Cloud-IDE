// frontend/src/components/profile/ProfileAccount.jsx
import React, { useState } from "react";
import { FiCheckCircle, FiXCircle, FiMail, FiSend, FiCalendar, FiUser } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileAccount = () => {
  const { user, resendOTP, setPendingEmail } = useAuth();
  const navigate = useNavigate();
  const [sendingOTP, setSendingOTP] = useState(false);

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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Member";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Account Details
      </h3>
      <div className="space-y-4">
        {/* Username */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-2">
          <div className="flex items-center space-x-2">
            <FiUser className="text-indigo-500" size={16} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Username
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            @{user?.username || "N/A"}
          </span>
        </div>

        {/* Email Verification */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-2">
          <div className="flex items-center space-x-2">
            <FiMail className="text-indigo-500" size={16} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Account Email
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono mr-2">
              {user?.email}
            </span>
            {user?.isVerified ? (
              <span className="flex items-center space-x-1 text-green-500 font-medium text-xs bg-green-50 dark:bg-green-950/40 px-2.5 py-1 rounded-full border border-green-200 dark:border-green-800">
                <FiCheckCircle size={14} />
                <span>Verified</span>
              </span>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="flex items-center space-x-1 text-red-500 font-medium text-xs bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-full border border-red-200 dark:border-red-800">
                  <FiXCircle size={14} />
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

        {/* Member Since */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
          <div className="flex items-center space-x-2">
            <FiCalendar className="text-indigo-500" size={16} />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Joined Date
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {memberSince}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfileAccount;
