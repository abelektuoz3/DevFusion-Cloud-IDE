// frontend/src/pages/Notifications.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useTheme } from "../context/ThemeContext";
import {
  FiArrowLeft,
  FiTrash2,
  FiBell,
  FiBellOff,
  FiLoader,
} from "react-icons/fi";
import DarkModeToggle from "../components/ui/DarkModeToggle";

const Notifications = () => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadNotifications,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [selectedNotifications, setSelectedNotifications] = useState([]);

  // Load notifications then auto-mark all as read
  useEffect(() => {
    const loadAndMarkRead = async () => {
      await loadNotifications(true);
    };
    loadAndMarkRead();
  }, []);

  // Auto-mark all as read once notifications are loaded
  useEffect(() => {
    if (!loading && notifications.length > 0 && unreadCount > 0) {
      markAllAsRead();
    }
  }, [loading]);

  const getNotificationIcon = (type) => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type] || "📌";
  };

  const getNotificationColor = (type) => {
    const colors = {
      success:
        "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
      error:
        "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
      warning:
        "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
      info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
    };
    return (
      colors[type] ||
      "bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300"
    );
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this notification?")) {
      await deleteNotification(id);
    }
  };

  const handleDeleteAll = async () => {
    if (window.confirm("Delete all notifications?")) {
      for (const notification of notifications) {
        await deleteNotification(notification._id);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadNotifications(false);
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
            <div className="flex items-center space-x-3">
              <FiBell className="text-2xl text-gray-700 dark:text-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                {unreadCount > 0 && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {unreadCount} unread
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {notifications.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition">
                <FiTrash2 size={14} />
                <span>Clear all</span>
              </button>
            )}
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && notifications.length === 0 ?
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading notifications...
            </p>
          </div>
        : notifications.length === 0 ?
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <FiBellOff className="text-4xl text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You're all caught up!
            </p>
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              Go to Dashboard
            </button>
          </div>
        : <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white dark:bg-slate-900 rounded-xl border ${
                  !notification.read ?
                    "border-indigo-300 dark:border-indigo-700 shadow-lg shadow-indigo-500/10"
                  : "border-gray-200 dark:border-slate-700"
                } hover:shadow-md transition-all duration-200`}>
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getNotificationColor(
                      notification.type,
                    )}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(notification)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                          {new Date(notification.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}{" "}
                          at{" "}
                          {new Date(notification.createdAt).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {notification.link && (
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block">
                            View details →
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions - only delete */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                      title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition font-medium disabled:opacity-50">
                  {loading ?
                    <span className="flex items-center space-x-2">
                      <FiLoader className="animate-spin" />
                      <span>Loading...</span>
                    </span>
                  : "Load more"}
                </button>
              </div>
            )}
          </div>
        }
      </div>
    </div>
  );
};

export default Notifications;
