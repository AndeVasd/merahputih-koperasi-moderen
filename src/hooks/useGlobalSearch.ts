import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CATEGORY_LABELS, LoanCategory } from '@/types/koperasi';

export interface SearchResult {
  id: string;
  type: 'loan' | 'member' | 'borrower';
  name: string;
  nik?: string;
  phone?: string;
  category?: string;
  categoryLabel?: string;
  status?: string;
  amount?: number;
  dueDate?: string;
  url: string;
}

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const searchDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const searchQuery = `%${query.toLowerCase()}%`;
        const searchResults: SearchResult[] = [];

        // Search loans by borrower name, NIK, phone
        const { data: loans, error: loansError } = await supabase
          .from('loans')
          .select('id, borrower_name, borrower_nik, borrower_phone, category, status, total_amount, due_date, members(name, nik, phone)')
          .or(`borrower_name.ilike.${searchQuery},borrower_nik.ilike.${searchQuery},borrower_phone.ilike.${searchQuery}`)
          .limit(10);

        if (!loansError && loans) {
          loans.forEach((loan) => {
            const categoryKey = loan.category as LoanCategory;
            const urlCategory = loan.category === 'alat_pertanian' ? 'alat-pertanian' : loan.category;
            searchResults.push({
              id: loan.id,
              type: 'loan',
              name: loan.borrower_name || loan.members?.name || 'Unknown',
              nik: loan.borrower_nik || loan.members?.nik,
              phone: loan.borrower_phone || loan.members?.phone,
              category: loan.category,
              categoryLabel: CATEGORY_LABELS[categoryKey] || loan.category,
              status: loan.status,
              amount: loan.total_amount,
              dueDate: loan.due_date,
              url: `/pinjaman/${urlCategory}`,
            });
          });
        }

        // Search members
        const { data: members, error: membersError } = await supabase
          .from('members')
          .select('id, name, nik, phone')
          .or(`name.ilike.${searchQuery},nik.ilike.${searchQuery},phone.ilike.${searchQuery}`)
          .limit(10);

        if (!membersError && members) {
          members.forEach((member) => {
            searchResults.push({
              id: member.id,
              type: 'member',
              name: member.name,
              nik: member.nik,
              phone: member.phone || undefined,
              url: '/peminjam',
            });
          });
        }

        // Also search loans by member relation
        const { data: memberLoans, error: memberLoansError } = await supabase
          .from('loans')
          .select('id, borrower_name, borrower_nik, borrower_phone, category, status, total_amount, due_date, members!inner(name, nik, phone)')
          .or(`members.name.ilike.${searchQuery},members.nik.ilike.${searchQuery},members.phone.ilike.${searchQuery}`)
          .limit(10);

        if (!memberLoansError && memberLoans) {
          memberLoans.forEach((loan) => {
            // Avoid duplicates
            if (!searchResults.find((r) => r.id === loan.id && r.type === 'loan')) {
              const categoryKey = loan.category as LoanCategory;
              const urlCategory = loan.category === 'alat_pertanian' ? 'alat-pertanian' : loan.category;
              searchResults.push({
                id: loan.id,
                type: 'loan',
                name: loan.members?.name || loan.borrower_name || 'Unknown',
                nik: loan.members?.nik || loan.borrower_nik,
                phone: loan.members?.phone || loan.borrower_phone,
                category: loan.category,
                categoryLabel: CATEGORY_LABELS[categoryKey] || loan.category,
                status: loan.status,
                amount: loan.total_amount,
                dueDate: loan.due_date,
                url: `/pinjaman/${urlCategory}`,
              });
            }
          });
        }

        setResults(searchResults);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounce);
  }, [query]);

  return { results, loading };
}
