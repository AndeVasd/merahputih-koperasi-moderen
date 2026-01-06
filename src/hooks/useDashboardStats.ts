import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DbLoan } from './useLoans';

export interface DashboardStats {
  totalMembers: number;
  totalLoans: number;
  totalLoanAmount: number;
  activeLoans: number;
  overdueLoans: number;
  paidLoans: number;
  loansByCategory: {
    uang: number;
    sembako: number;
    alat_pertanian: number;
    obat: number;
  };
  countByCategory: {
    uang: number;
    sembako: number;
    alat_pertanian: number;
    obat: number;
  };
}

export function useDashboardStats() {
  const [members, setMembers] = useState<any[]>([]);
  const [loans, setLoans] = useState<DbLoan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [membersRes, loansRes] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('loans').select(`
          *,
          members (id, name),
          loan_items (*)
        `).order('created_at', { ascending: false }),
      ]);

      if (membersRes.error) throw membersRes.error;
      if (loansRes.error) throw loansRes.error;

      setMembers(membersRes.data || []);
      setLoans((loansRes.data || []).map((loan) => ({
        ...loan,
        status: loan.status as 'active' | 'paid' | 'overdue',
      })));
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats: DashboardStats = useMemo(() => {
    const activeLoans = loans.filter((l) => l.status === 'active');
    const overdueLoans = loans.filter((l) => l.status === 'overdue');
    const paidLoans = loans.filter((l) => l.status === 'paid');

    const categories = ['uang', 'sembako', 'alat_pertanian', 'obat'] as const;
    
    const loansByCategory = categories.reduce((acc, cat) => {
      acc[cat] = loans.filter((l) => l.category === cat && l.status === 'active').reduce((sum, l) => sum + l.total_amount, 0);
      return acc;
    }, {} as Record<typeof categories[number], number>);

    const countByCategory = categories.reduce((acc, cat) => {
      acc[cat] = loans.filter((l) => l.category === cat && l.status === 'active').length;
      return acc;
    }, {} as Record<typeof categories[number], number>);

    return {
      totalMembers: members.length,
      totalLoans: loans.length,
      totalLoanAmount: loans.reduce((sum, l) => sum + l.total_amount, 0),
      activeLoans: activeLoans.length,
      overdueLoans: overdueLoans.length,
      paidLoans: paidLoans.length,
      loansByCategory,
      countByCategory,
    };
  }, [members, loans]);

  useEffect(() => {
    fetchData();

    // Subscribe to realtime changes
    const membersChannel = supabase
      .channel('dashboard-members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchData();
      })
      .subscribe();

    const loansChannel = supabase
      .channel('dashboard-loans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loans' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
      supabase.removeChannel(loansChannel);
    };
  }, []);

  return {
    stats,
    loans,
    members,
    loading,
    refetch: fetchData,
  };
}
