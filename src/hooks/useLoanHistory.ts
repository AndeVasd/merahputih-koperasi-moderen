import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DbLoan, DbLoanItem } from './useLoans';

export function useLoanHistory() {
  const [loans, setLoans] = useState<DbLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          members (id, name),
          loan_items (*)
        `)
        .eq('status', 'paid')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const typedLoans = (data || []).map((loan) => ({
        ...loan,
        status: loan.status as 'active' | 'paid' | 'overdue',
      }));
      
      setLoans(typedLoans);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching loan history:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      // First delete loan items
      const { error: itemsError } = await supabase
        .from('loan_items')
        .delete()
        .eq('loan_id', id);

      if (itemsError) throw itemsError;

      // Then delete the loan
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Riwayat pinjaman berhasil dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus riwayat: ' + err.message);
      throw err;
    }
  };

  const restoreLoan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('loans')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Pinjaman dikembalikan ke status aktif');
    } catch (err: any) {
      toast.error('Gagal mengembalikan pinjaman: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchLoans();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('loan-history-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchLoans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    loans,
    loading,
    error,
    deleteLoan,
    restoreLoan,
    refetch: fetchLoans,
  };
}
