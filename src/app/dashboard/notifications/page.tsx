'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

const notificationIcons: Record<string, string> = {
  application_viewed: '👁️',
  application_status: '📋',
  interview_scheduled: '📅',
  message_received: '💬',
  job_alert: '🔔',
  offer_received: '🎉',
  application_rejected: '📭',
  profile_incomplete: '⚠️',
  welcome: '👋',
  default: '📣',
};

const notificationColors: Record<string, { bg: string; border: string }> = {
  application_viewed: { bg: 'bg-blue-50', border: 'border-blue-200' },
  application_status: { bg: 'bg-purple-50', border: 'border-purple-200' },
  interview_scheduled: { bg: 'bg-green-50', border: 'border-green-200' },
  message_received: { bg: 'bg-indigo-50', border: 'border-indigo-200' },
  job_alert: { bg: 'bg-yellow-50', border: 'border-yellow-200' },
  offer_received: { bg: 'bg-emerald-50', border: 'border-emerald-200' },
  application_rejected: { bg: 'bg-slate-50', border: 'border-slate-200' },
  profile_incomplete: { bg: 'bg-orange-50', border: 'border-orange-200' },
  welcome: { bg: 'bg-cyan-50', border: 'border-cyan-200' },
  default: { bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/notifications${filter === 'unread' ? '?unread=true' : ''}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', notificationIds: ids }),
      });
      setNotifications(prev =>
        prev.map(n => (ids.includes(n.id) ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markAllRead' }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotifications = async (ids: string[]) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', notificationIds: ids }),
      });
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      const deletedUnread = notifications.filter(n => ids.includes(n.id) && !n.isRead).length;
      setUnreadCount(prev => Math.max(0, prev - deletedUnread));
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete notifications:', error);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getIcon = (type: string) => notificationIcons[type] || notificationIcons.default;
  const getColors = (type: string) => notificationColors[type] || notificationColors.default;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                <p className="text-slate-600 mt-1">
                  {unreadCount > 0
                    ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                    : 'You\'re all caught up!'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Filters and Actions */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    filter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                    filter === 'unread'
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </button>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    {selectedIds.size} selected
                  </span>
                  <button
                    onClick={() => markAsRead(Array.from(selectedIds))}
                    className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                  >
                    Mark read
                  </button>
                  <button
                    onClick={() => deleteNotifications(Array.from(selectedIds))}
                    className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-3 bg-slate-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {filter === 'unread'
                  ? 'You\'ve read all your notifications. Great job staying on top of things!'
                  : 'When you receive updates about your applications, messages, or job alerts, they\'ll appear here.'}
              </p>
              {filter === 'unread' && (
                <button
                  onClick={() => setFilter('all')}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all notifications
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All */}
              <div className="flex items-center gap-3 px-2">
                <input
                  type="checkbox"
                  checked={selectedIds.size === notifications.length && notifications.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">Select all</span>
              </div>

              {notifications.map((notification) => {
                const colors = getColors(notification.type);
                const handleClick = () => {
                  if (!notification.isRead) {
                    markAsRead([notification.id]);
                  }
                };

                const contentElement = (
                  <>
                    <div
                      className={`w-10 h-10 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center flex-shrink-0`}
                    >
                      <span className="text-lg">{getIcon(notification.type)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3
                            className={`font-medium ${
                              notification.isRead ? 'text-slate-700' : 'text-slate-900'
                            }`}
                          >
                            {notification.title}
                            {!notification.isRead && (
                              <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-slate-600 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 whitespace-nowrap flex-shrink-0">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </>
                );

                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-xl border ${
                      notification.isRead ? 'border-slate-200' : 'border-blue-300 shadow-sm'
                    } overflow-hidden transition hover:shadow-md`}
                  >
                    <div className="flex items-start gap-4 p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(notification.id)}
                        onChange={() => toggleSelect(notification.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      {notification.link ? (
                        <Link
                          href={notification.link}
                          className="flex-1 flex items-start gap-4 cursor-pointer"
                          onClick={handleClick}
                        >
                          {contentElement}
                        </Link>
                      ) : (
                        <div
                          className="flex-1 flex items-start gap-4 cursor-pointer"
                          onClick={handleClick}
                        >
                          {contentElement}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

      {/* Notification Settings Link */}
      <div className="mt-8 p-4 bg-slate-100 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900">Notification Preferences</h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Manage how and when you receive notifications
            </p>
          </div>
          <Link
            href="/dashboard/settings"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Settings →
          </Link>
        </div>
      </div>
    </div>
  );
}
