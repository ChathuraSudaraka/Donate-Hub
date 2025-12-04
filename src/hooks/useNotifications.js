import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUnreadNotificationCount } from '../lib/productQueries';

export function useNotifications() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      
      // Set up periodic checking (every 30 seconds)
      const interval = setInterval(loadUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      setLoading(true);
      const count = await getUnreadNotificationCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread notification count:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnreadCount = () => {
    loadUnreadCount();
  };

  return {
    unreadCount,
    loading,
    refreshUnreadCount
  };
}
