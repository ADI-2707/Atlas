import React, { useEffect } from 'react';
import { api } from '@atlas/api';
import { useNavigate } from 'react-router-dom';
import './NotificationDropdown.css';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  onRefresh,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh notifications when dropdown is opened
    onRefresh();
  }, []);

  const handleMarkAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      onRefresh();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/read-all');
      onRefresh();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await api.delete(`/notifications/${id}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await api.patch(`/notifications/${item.id}/read`);
      } catch (err) {
        console.error('Failed to read notification:', err);
      }
    }
    onClose();
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return '🟢';
      case 'WARNING':
        return '🟡';
      case 'ERROR':
        return '🔴';
      default:
        return '🔵';
    }
  };

  return (
    <div className="notifications-dropdown glass-panel-dropdown">
      <div className="dropdown-header">
        <h3>Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <button className="text-btn" onClick={handleMarkAllAsRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <span style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block' }}>🔔</span>
            <p>All caught up!</p>
            <span className="sub">No notifications found</span>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`notification-item ${item.isRead ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(item)}
            >
              <div className="notification-icon">{getTypeIcon(item.type)}</div>
              <div className="notification-content">
                <div className="notification-title-row">
                  <span className="title">{item.title}</span>
                  <span className="time">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="message">{item.message}</p>
              </div>
              <div className="notification-actions">
                {!item.isRead && (
                  <button
                    className="action-icon-btn read-btn"
                    title="Mark read"
                    onClick={(e) => handleMarkAsRead(e, item.id)}
                  >
                    ✓
                  </button>
                )}
                <button
                  className="action-icon-btn delete-btn"
                  title="Dismiss"
                  onClick={(e) => handleDelete(e, item.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
