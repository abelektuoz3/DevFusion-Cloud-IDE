// frontend/src/components/ui/NotificationBell.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiBellOff } from "react-icons/fi";
import { useNotifications } from "../../context/NotificationContext";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Debug log to verify component renders
  console.log("🔔 NotificationBell rendering");

  // ✅ Add error handling for context
  let notifications = [];
  let unreadCount = 0;
  let markAsRead = () => {};

  try {
    const context = useNotifications();
    notifications = context.notifications || [];
    unreadCount = context.unreadCount || 0;
    markAsRead = context.markAsRead || (() => {});
    console.log("✅ Notifications loaded:", notifications.length);
  } catch (error) {
    console.warn("❌ Notification context not available:", error);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    console.log("🔔 Bell clicked");
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || "📌";
  };

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        title="Notifications">
        {unreadCount > 0 ?
          <FiBell className="text-gray-600 dark:text-gray-300 text-xl" />
        : <FiBellOff className="text-gray-400 dark:text-gray-500 text-xl" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={handleViewAll}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ?
              <div className="flex flex-col items-center justify-center py-8 text-gray-400 dark:text-gray-500">
                <FiBellOff size={32} className="mb-2" />
                <p className="text-sm">No notifications</p>
              </div>
            : recentNotifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition ${
                    !notification.read ?
                      "bg-indigo-50/50 dark:bg-indigo-900/20"
                    : ""
                  }`}>
                  <div className="flex-shrink-0 text-xl mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2" />
                  )}
                </div>
              ))
            }
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-slate-700 text-center">
              <button
                onClick={handleViewAll}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                See all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
