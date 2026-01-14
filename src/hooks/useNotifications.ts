import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
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

      const notificationsList: Notification[] = [];

      // Add overdue notifications
      (overdueLoans || []).forEach((loan) => {
        const borrowerName = loan.members?.name || loan.borrower_name || 'Unknown';
        notificationsList.push({
          id: `overdue-${loan.id}`,
          type: 'overdue',
          title: 'Pinjaman Jatuh Tempo!',
          message: `Pinjaman ${borrowerName} sudah melewati jatuh tempo (${formatDate(loan.due_date)})`,
          loanId: loan.id,
          borrowerName,
          dueDate: loan.due_date,
          createdAt: new Date().toISOString(),
          read: false,
        });
      });

      // Add due soon notifications
      (dueSoonLoans || []).forEach((loan) => {
        const borrowerName = loan.members?.name || loan.borrower_name || 'Unknown';
        const daysLeft = Math.ceil((new Date(loan.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        notificationsList.push({
          id: `due-soon-${loan.id}`,
          type: 'due_soon',
          title: 'Pinjaman Akan Jatuh Tempo',
          message: `Pinjaman ${borrowerName} akan jatuh tempo dalam ${daysLeft} hari (${formatDate(loan.due_date)})`,
          loanId: loan.id,
          borrowerName,
          dueDate: loan.due_date,
          createdAt: new Date().toISOString(),
          read: false,
        });
      });

      setNotifications(notificationsList);
      setUnreadCount(notificationsList.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

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
  }, []);

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
