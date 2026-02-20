import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const XENDIT_SECRET_KEY = Deno.env.get('XENDIT_SECRET_KEY');
    if (!XENDIT_SECRET_KEY) {
      throw new Error('XENDIT_SECRET_KEY is not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { loan_id, amount, payer_email, description } = await req.json();

    if (!loan_id || !amount) {
      return new Response(JSON.stringify({ error: 'loan_id and amount are required' }), { status: 400, headers: corsHeaders });
    }

    const externalId = `LOAN-${loan_id}-${Date.now()}`;

    // Create Xendit invoice
    const xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(XENDIT_SECRET_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        external_id: externalId,
        amount,
        description: description || `Pembayaran pinjaman #${loan_id.substring(0, 8)}`,
        currency: 'IDR',
        payer_email: payer_email || undefined,
        invoice_duration: 86400, // 24 hours
        success_redirect_url: `${req.headers.get('origin') || ''}/pinjaman/uang`,
      }),
    });

    if (!xenditResponse.ok) {
      const errorData = await xenditResponse.text();
      throw new Error(`Xendit API error [${xenditResponse.status}]: ${errorData}`);
    }

    const invoiceData = await xenditResponse.json();

    // Save payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        loan_id,
        amount,
        payment_method: 'xendit',
        payment_status: 'pending',
        xendit_invoice_id: invoiceData.id,
        xendit_invoice_url: invoiceData.invoice_url,
        xendit_external_id: externalId,
      })
      .select()
      .single();

    if (paymentError) throw paymentError;

    return new Response(JSON.stringify({
      payment_id: payment.id,
      invoice_url: invoiceData.invoice_url,
      external_id: externalId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error creating Xendit invoice:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
