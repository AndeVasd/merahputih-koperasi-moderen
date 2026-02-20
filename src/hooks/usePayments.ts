import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Payment {
  id: string;
  loan_id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  xendit_invoice_id: string | null;
  xendit_invoice_url: string | null;
  xendit_payment_method: string | null;
  xendit_external_id: string | null;
  notes: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export function usePayments(loanId?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (loanId) {
        query = query.eq('loan_id', loanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPayments(data || []);
    } catch (err: any) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const addManualPayment = async (input: {
    loan_id: string;
    amount: number;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          loan_id: input.loan_id,
          amount: input.amount,
          payment_method: 'manual',
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          notes: input.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Check if loan is fully paid
      await checkAndUpdateLoanStatus(input.loan_id);

      toast.success('Pembayaran berhasil dicatat');
      return data;
    } catch (err: any) {
      toast.error('Gagal mencatat pembayaran: ' + err.message);
      throw err;
    }
  };

  const createXenditInvoice = async (input: {
    loan_id: string;
    amount: number;
    payer_email?: string;
    description?: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-xendit-invoice', {
        body: input,
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('Invoice Xendit berhasil dibuat');
      return data;
    } catch (err: any) {
      toast.error('Gagal membuat invoice: ' + err.message);
      throw err;
    }
  };

  const checkAndUpdateLoanStatus = async (loanId: string) => {
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('loan_id', loanId)
      .eq('payment_status', 'paid');

    const totalPaid = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);

    const { data: loan } = await supabase
      .from('loans')
      .select('total_amount, interest_rate')
      .eq('id', loanId)
      .single();

    if (loan) {
      const totalWithInterest = Number(loan.total_amount) * (1 + Number(loan.interest_rate) / 100);
      if (totalPaid >= totalWithInterest) {
        await supabase
          .from('loans')
          .update({ status: 'paid' })
          .eq('id', loanId);
      }
    }
  };

  const getTotalPaid = (loanId: string) => {
    return payments
      .filter(p => p.loan_id === loanId && p.payment_status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  useEffect(() => {
    fetchPayments();

    const channel = supabase
      .channel('payments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        fetchPayments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [loanId]);

  return {
    payments,
    loading,
    addManualPayment,
    createXenditInvoice,
    getTotalPaid,
    refetch: fetchPayments,
  };
}
