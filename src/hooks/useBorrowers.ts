import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Borrower {
  id: string;
  name: string;
  nik: string | null;
  phone: string | null;
  address: string | null;
  totalLoans: number;
  activeLoans: number;
  totalAmount: number;
  lastLoanDate: string;
}

export function useBorrowers() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([]);
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

      // Group loans by borrower (using NIK as unique identifier, fallback to name)
      const borrowerMap = new Map<string, {
        name: string;
        nik: string | null;
        phone: string | null;
        address: string | null;
        loans: typeof loans;
      }>();

      (loans || []).forEach((loan) => {
        const key = loan.borrower_nik || loan.borrower_name || '';
        if (!key) return;

        if (borrowerMap.has(key)) {
          borrowerMap.get(key)!.loans.push(loan);
          // Update phone/address if not set
          const existing = borrowerMap.get(key)!;
          if (!existing.phone && loan.borrower_phone) {
            existing.phone = loan.borrower_phone;
          }
          if (!existing.address && loan.borrower_address) {
            existing.address = loan.borrower_address;
          }
        } else {
          borrowerMap.set(key, {
            name: loan.borrower_name || '',
            nik: loan.borrower_nik,
            phone: loan.borrower_phone,
            address: loan.borrower_address,
            loans: [loan],
          });
        }
      });

      // Transform to Borrower array
      const borrowerList: Borrower[] = [];
      borrowerMap.forEach((data, key) => {
        const activeLoans = data.loans.filter(l => l.status === 'active').length;
        const totalAmount = data.loans.reduce((sum, l) => sum + (l.total_amount || 0), 0);
        const lastLoan = data.loans[0];

        borrowerList.push({
          id: key,
          name: data.name,
          nik: data.nik,
          phone: data.phone,
          address: data.address,
          totalLoans: data.loans.length,
          activeLoans,
          totalAmount,
          lastLoanDate: lastLoan?.created_at || '',
        });
      });

      setBorrowers(borrowerList);
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

  return {
    borrowers,
    loading,
    error,
    refetch: fetchBorrowers,
  };
}
