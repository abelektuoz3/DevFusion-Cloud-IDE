// frontend/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { notificationAPI } from "../services/api";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadNotifications = async (reset = true) => {
    // ✅ Only load if user is authenticated
    if (!user) {
      console.log("⏳ Waiting for user authentication...");
      return;
    }

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const response = await notificationAPI.get({
        limit: 20,
        offset: (currentPage - 1) * 20,
      });

      const newNotifications = response.data.notifications || [];
      setNotifications(
        reset ? newNotifications : [...notifications, ...newNotifications],
      );
      setUnreadCount(response.data.pagination?.unreadCount || 0);
      setHasMore(response.data.pagination?.hasMore || false);
      setPage(reset ? 2 : page + 1);
    } catch (error) {
      console.error("Load notifications error:", error);
      // ✅ Don't show toast for 401 errors - just silently fail
      if (error.response?.status !== 401) {
        toast.error("Failed to load notifications");
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!user) return;
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications(
        notifications.map((n) =>
          n._id === notificationId ? { ...n, read: true } : n,
        ),
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Mark all as read error:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user) return;
    try {
      await notificationAPI.delete(notificationId);
      setNotifications(notifications.filter((n) => n._id !== notificationId));
      if (!notifications.find((n) => n._id === notificationId)?.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Delete notification error:", error);
      toast.error("Failed to delete notification");
    }
  };

  const addNotification = (notification) => {
    setNotifications([notification, ...notifications]);
    if (!notification.read) {
      setUnreadCount(unreadCount + 1);
    }
  };

  // ✅ Only load notifications when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log("✅ User authenticated, loading notifications...");
      loadNotifications();
    }
  }, [user, authLoading]);

  const value = {
    notifications,
    unreadCount,
    loading,
    hasMore,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
