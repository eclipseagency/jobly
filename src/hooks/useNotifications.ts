'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface UseNotificationsOptions {
  onNewNotification?: (notification: Notification) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/notifications', {
        headers: { 'x-user-id': user.id },
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Set up SSE connection for real-time updates
  useEffect(() => {
    if (!user?.id) return;

    // Create EventSource connection
    const eventSource = new EventSource(`/api/notifications/stream`, {
      // Add headers through URL params since EventSource doesn't support custom headers
    });

    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'notification') {
          const notification = data.notification;

          // Add to notifications list
          setNotifications((prev) => [notification, ...prev]);

          // Update unread count
          if (!notification.read) {
            setUnreadCount((prev) => prev + 1);
          }

          // Call callback if provided
          if (options.onNewNotification) {
            options.onNewNotification(notification);
          }

          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
              icon: '/logo.svg',
            });
          }
        }
      } catch (error) {
        // Ignore ping messages and parse errors
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      // EventSource will auto-reconnect
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setConnected(false);
    };
  }, [user?.id, options.onNewNotification]);

  // Fetch initial notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user?.id]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      });

      if (response.ok) {
        const notification = notifications.find((n) => n.id === notificationId);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [user?.id, notifications]);

  // Request browser notification permission
  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    connected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
    requestPermission,
  };
}
