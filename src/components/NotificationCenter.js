import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '../lib/productQueries';
import './PaymentComponents.css';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getUserNotifications(user.id, !showAll);
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error('Error loading unread count:', err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.id);
      await loadNotifications();
      await loadUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'payment_approved':
        return 'fas fa-check-circle text-success';
      case 'payment_rejected':
        return 'fas fa-times-circle text-danger';
      case 'payment_pending':
        return 'fas fa-clock text-warning';
      case 'payment_failed':
        return 'fas fa-exclamation-triangle text-danger';
      default:
        return 'fas fa-bell text-info';
    }
  };

  if (loading) {
    return (
      <div className="notification-center">
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notification-center">
      <div className="notification-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5>
            <i className="fas fa-bell me-2"></i>
            Notifications 
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </h5>
          <div className="notification-actions">
            {unreadCount > 0 && (
              <button
                className="btn btn-outline-primary btn-sm me-2"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setShowAll(!showAll);
                loadNotifications();
              }}
            >
              {showAll ? 'Show unread only' : 'Show all'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="empty-notifications">
            <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
            <h6>No notifications</h6>
            <p className="text-muted">
              {showAll ? 'You have no notifications yet.' : 'All caught up! No unread notifications.'}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${!notification.read ? 'unread' : 'read'}`}
            >
              <div className="notification-content">
                <div className="notification-icon">
                  <i className={getNotificationIcon(notification.notification_type)}></i>
                </div>
                <div className="notification-body">
                  <h6 className="notification-title">{notification.title}</h6>
                  <p className="notification-message">{notification.message}</p>
                  <small className="notification-date">
                    {formatDate(notification.created_at)}
                  </small>
                </div>
              </div>
              {!notification.read && (
                <button
                  className="btn btn-outline-primary btn-sm mark-read-btn"
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <i className="fas fa-check"></i>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
