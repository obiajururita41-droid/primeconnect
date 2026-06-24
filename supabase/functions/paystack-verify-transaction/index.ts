const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PAYSTACK_SECRET = Deno.env.get('PAYSTACK_SECRET_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { reference } = await req.json();
    if (!reference) throw new Error('Missing reference');

    // Verify with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
    });
    const data = await res.json();

    if (!data.status || data.data?.status !== 'success') {
      return new Response(JSON.stringify({ error: 'Transaction not successful' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const amount = data.data.amount / 100; // convert from kobo
    const ref = data.data.reference;

    const dbHeaders = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY!,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    };

    // Get transaction
    const txRes = await fetch(`${SUPABASE_URL}/rest/v1/transactions?reference=eq.${ref}&select=*`, {
      headers: dbHeaders,
    });
    const txData = await txRes.json();
    const tx = txData[0];

    if (!tx) throw new Error('Transaction not found');
    if (tx.status === 'success') {
      return new Response(JSON.stringify({ success: true, message: 'Already credited' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Credit wallet
    const walletRes = await fetch(`${SUPABASE_URL}/rest/v1/wallets?id=eq.${tx.wallet_id}&select=balance`, {
      headers: dbHeaders,
    });
    const walletData = await walletRes.json();
    const currentBalance = Number(walletData[0]?.balance || 0);
    const newBalance = currentBalance + amount;

    await fetch(`${SUPABASE_URL}/rest/v1/wallets?id=eq.${tx.wallet_id}`, {
      method: 'PATCH',
      headers: dbHeaders,
      body: JSON.stringify({ balance: newBalance }),
    });

    await fetch(`${SUPABASE_URL}/rest/v1/transactions?reference=eq.${ref}`, {
      method: 'PATCH',
      headers: dbHeaders,
      body: JSON.stringify({ status: 'success' }),
    });

    return new Response(JSON.stringify({ success: true, new_balance: newBalance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
