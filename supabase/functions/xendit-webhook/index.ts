import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-callback-token',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const body = await req.json();
    console.log('Xendit webhook received:', JSON.stringify(body));

    const { id, external_id, status, payment_method, paid_at } = body;

    if (!external_id) {
      return new Response(JSON.stringify({ error: 'Missing external_id' }), { status: 400, headers: corsHeaders });
    }

    // Map Xendit status to our status
    let paymentStatus = 'pending';
    if (status === 'PAID' || status === 'SETTLED') {
      paymentStatus = 'paid';
    } else if (status === 'EXPIRED') {
      paymentStatus = 'expired';
    } else if (status === 'FAILED') {
      paymentStatus = 'failed';
    }

    // Update payment record
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        payment_status: paymentStatus,
        xendit_transaction_id: id,
        xendit_payment_method: payment_method,
        paid_at: paid_at || (paymentStatus === 'paid' ? new Date().toISOString() : null),
      })
      .eq('xendit_external_id', external_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment:', updateError);
      throw updateError;
    }

    // If paid, check total payments vs loan amount to auto-update loan status
    if (paymentStatus === 'paid' && payment) {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('loan_id', payment.loan_id)
        .eq('payment_status', 'paid');

      const totalPaid = (payments || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      const { data: loan } = await supabase
        .from('loans')
        .select('total_amount, interest_rate')
        .eq('id', payment.loan_id)
        .single();

      if (loan) {
        const totalWithInterest = Number(loan.total_amount) * (1 + Number(loan.interest_rate) / 100);
        if (totalPaid >= totalWithInterest) {
          await supabase
            .from('loans')
            .update({ status: 'paid' })
            .eq('id', payment.loan_id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
