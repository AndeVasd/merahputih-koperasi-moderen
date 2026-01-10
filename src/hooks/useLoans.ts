import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbLoanItem {
  id: string;
  loan_id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface DbLoan {
  id: string;
  member_id: string | null;
  borrower_name: string | null;
  borrower_nik: string | null;
  borrower_phone: string | null;
  borrower_address: string | null;
  category: string;
  total_amount: number;
  interest_rate: number;
  due_date: string;
  status: 'active' | 'paid' | 'overdue';
  notes: string | null;
  ktp_image_url: string | null;
  created_at: string;
  updated_at: string;
  members?: {
    id: string;
    name: string;
  } | null;
  loan_items?: DbLoanItem[];
}

export interface LoanInput {
  member_id?: string;
  borrower_name?: string;
  borrower_nik?: string;
  borrower_phone?: string;
  borrower_address?: string;
  category: string;
  total_amount: number;
  interest_rate: number;
  due_date: string;
  notes?: string;
  ktp_image_url?: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
  }[];
}

export function useLoans(category?: string) {
  const [loans, setLoans] = useState<DbLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('loans')
        .select(`
          *,
          members (id, name),
          loan_items (*)
        `)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Cast status to proper type
      const typedLoans = (data || []).map((loan) => ({
        ...loan,
        status: loan.status as 'active' | 'paid' | 'overdue',
      }));
      
      setLoans(typedLoans);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLoan = async (loan: LoanInput) => {
    try {
      // First, insert the loan
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .insert({
          member_id: loan.member_id || null,
          borrower_name: loan.borrower_name || null,
          borrower_nik: loan.borrower_nik || null,
          borrower_phone: loan.borrower_phone || null,
          borrower_address: loan.borrower_address || null,
          category: loan.category,
          total_amount: loan.total_amount,
          interest_rate: loan.interest_rate,
          due_date: loan.due_date,
          notes: loan.notes || null,
          ktp_image_url: loan.ktp_image_url || null,
        })
        .select(`
          *,
          members (id, name)
        `)
        .single();

      if (loanError) throw loanError;

      // Then, insert the loan items
      let itemsData: DbLoanItem[] = [];
      if (loan.items.length > 0) {
        const itemsToInsert = loan.items.map((item) => ({
          loan_id: loanData.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
        }));

        const { data: insertedItems, error: itemsError } = await supabase
          .from('loan_items')
          .insert(itemsToInsert)
          .select();

        if (itemsError) throw itemsError;
        itemsData = insertedItems || [];
      }

      const newLoan: DbLoan = {
        ...loanData,
        status: loanData.status as 'active' | 'paid' | 'overdue',
        loan_items: itemsData,
      };

      // Don't manually update state - let realtime subscription handle it
      toast.success('Pinjaman berhasil ditambahkan');
      return newLoan;
    } catch (err: any) {
      toast.error('Gagal menambahkan pinjaman: ' + err.message);
      throw err;
    }
  };

  const updateLoanStatus = async (id: string, status: 'active' | 'paid' | 'overdue') => {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({ status })
        .eq('id', id)
        .select(`
          *,
          members (id, name),
          loan_items (*)
        `)
        .single();

      if (error) throw error;
      
      const typedLoan: DbLoan = {
        ...data,
        status: data.status as 'active' | 'paid' | 'overdue',
      };
      
      // Don't manually update state - let realtime subscription handle it
      toast.success('Status pinjaman berhasil diperbarui');
      return typedLoan;
    } catch (err: any) {
      toast.error('Gagal memperbarui status: ' + err.message);
      throw err;
    }
  };

  const deleteLoan = async (id: string) => {
    try {
      const { error } = await supabase.from('loans').delete().eq('id', id);

      if (error) throw error;
      // Don't manually update state - let realtime subscription handle it
      toast.success('Pinjaman berhasil dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus pinjaman: ' + err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchLoans();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('loans-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          // Refetch to get complete data with relations
          fetchLoans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [category]);

  return {
    loans,
    loading,
    error,
    addLoan,
    updateLoanStatus,
    deleteLoan,
    refetch: fetchLoans,
  };
}
