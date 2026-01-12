import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BorrowerLoan {
  id: string;
  name: string;
  nik: string | null;
  phone: string | null;
  address: string | null;
  category: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  ktpImageUrl: string | null;
}

export function useBorrowers() {
  const [borrowerLoans, setBorrowerLoans] = useState<BorrowerLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBorrowers = async () => {
    try {
      setLoading(true);
      
      // Fetch all loans with borrower info (non-member borrowers)
      const { data: loans, error } = await supabase
        .from('loans')
        .select('*')
        .not('borrower_name', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to BorrowerLoan array - each loan is a separate entry
      const borrowerLoanList: BorrowerLoan[] = (loans || []).map((loan) => ({
        id: loan.id,
        name: loan.borrower_name || '',
        nik: loan.borrower_nik,
        phone: loan.borrower_phone,
        address: loan.borrower_address,
        category: loan.category,
        totalAmount: loan.total_amount || 0,
        status: loan.status,
        dueDate: loan.due_date,
        createdAt: loan.created_at,
        ktpImageUrl: loan.ktp_image_url,
      }));

      setBorrowerLoans(borrowerLoanList);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching borrowers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('borrowers-loans-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loans' },
        () => {
          fetchBorrowers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Calculate summary stats
  const stats = {
    totalBorrowers: new Set(borrowerLoans.map(l => l.nik || l.name)).size,
    activeLoans: borrowerLoans.filter(l => l.status === 'active').length,
    totalAmount: borrowerLoans.reduce((sum, l) => sum + l.totalAmount, 0),
  };

  return {
    borrowerLoans,
    stats,
    loading,
    error,
    refetch: fetchBorrowers,
  };
}
