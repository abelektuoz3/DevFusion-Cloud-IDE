// frontend/src/components/layout/DashboardNavbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FiCode, FiBell } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import DarkModeToggle from "../ui/DarkModeToggle";
import ProfileDropdown from "./ProfileDropdown";

const DashboardNavbar = ({ projectCount = 0 }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo + Welcome */}
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <FiCode className="text-white text-xl" />
            </div>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              DevFusion IDE
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Welcome back, {user?.username || "User"}!
            </p>
          </div>
        </div>

        {/* Right: project count, bell, dark mode, profile dropdown */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </span>

          {/* ✅ Bell / Notifications - Only shows if user is logged in */}
          {user && (
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all duration-200"
              title="Notifications"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          )}

          <DarkModeToggle />

          <ProfileDropdown />
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar;