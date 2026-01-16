import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const READ_NOTIFICATIONS_KEY = 'kopdes_read_notifications';

export interface Notification {
  id: string;
  type: 'overdue' | 'due_soon' | 'new_loan';
  title: string;
  message: string;
  loanId: string;
  borrowerName: string;
  dueDate: string;
  createdAt: string;
  read: boolean;
}

// Get read notification IDs from localStorage
function getReadNotificationIds(): Set<string> {
  try {
    const stored = localStorage.getItem(READ_NOTIFICATIONS_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch (err) {
    console.error('Error reading from localStorage:', err);
  }
  return new Set();
}

// Save read notification IDs to localStorage
function saveReadNotificationIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_NOTIFICATIONS_KEY, JSON.stringify([...ids]));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadNotificationIds());

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch overdue loans
      const { data: overdueLoans, error: overdueError } = await supabase
        .from('loans')
        .select('id, borrower_name, due_date, total_amount, category, members(name)')
        .eq('status', 'active')
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (overdueError) throw overdueError;

      // Fetch loans due soon (within 7 days)
      const { data: dueSoonLoans, error: dueSoonError } = await supabase
        .from('loans')
        .select('id, borrower_name, due_date, total_amount, category, members(name)')
        .eq('status', 'active')
        .gte('due_date', today)
        .lte('due_date', nextWeek)
        .order('due_date', { ascending: true });

      if (dueSoonError) throw dueSoonError;

      const currentReadIds = getReadNotificationIds();
      const notificationsList: Notification[] = [];

      // Add overdue notifications
      (overdueLoans || []).forEach((loan) => {
        const borrowerName = loan.members?.name || loan.borrower_name || 'Unknown';
        const notifId = `overdue-${loan.id}`;
        const isRead = currentReadIds.has(notifId);
        
        notificationsList.push({
          id: notifId,
          type: 'overdue',
          title: 'Pinjaman Jatuh Tempo!',
          message: `Pinjaman ${borrowerName} sudah melewati jatuh tempo (${formatDate(loan.due_date)})`,
          loanId: loan.id,
          borrowerName,
          dueDate: loan.due_date,
          createdAt: new Date().toISOString(),
          read: isRead,
        });
      });

      // Add due soon notifications
      (dueSoonLoans || []).forEach((loan) => {
        const borrowerName = loan.members?.name || loan.borrower_name || 'Unknown';
        const daysLeft = Math.ceil((new Date(loan.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const notifId = `due-soon-${loan.id}`;
        const isRead = currentReadIds.has(notifId);
        
        notificationsList.push({
          id: notifId,
          type: 'due_soon',
          title: 'Pinjaman Akan Jatuh Tempo',
          message: `Pinjaman ${borrowerName} akan jatuh tempo dalam ${daysLeft} hari (${formatDate(loan.due_date)})`,
          loanId: loan.id,
          borrowerName,
          dueDate: loan.due_date,
          createdAt: new Date().toISOString(),
          read: isRead,
        });
      });

      // Filter out read notifications - only show unread ones
      const unreadNotifications = notificationsList.filter(n => !n.read);
      
      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setReadIds((prev) => {
      const newReadIds = new Set(prev);
      newReadIds.add(notificationId);
      saveReadNotificationIds(newReadIds);
      return newReadIds;
    });
    
    // Remove the notification from the list
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const newReadIds = new Set(prev);
      notifications.forEach((n) => newReadIds.add(n.id));
      saveReadNotificationIds(newReadIds);
      return newReadIds;
    });
    
    // Clear all notifications
    setNotifications([]);
    setUnreadCount(0);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();

    // Subscribe to loan changes
    const channel = supabase
      .channel('notifications-loans')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
