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
    const { account_number, account_bank, account_name, amount, narration } = await req.json();

    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    const userId = payload.sub;

    const dbHeaders = {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY!,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    };

    // Check wallet balance
    const walletRes = await fetch(`${SUPABASE_URL}/rest/v1/wallets?user_id=eq.${userId}&is_active=eq.true&select=id,balance`, {
      headers: dbHeaders,
    });
    const walletData = await walletRes.json();
    const wallet = walletData[0];
    if (!wallet) throw new Error('Wallet not found');

    const currentBalance = Number(wallet.balance);
    if (amount > currentBalance) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create transfer recipient
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'nuban',
        name: account_name,
        account_number,
        bank_code: account_bank,
        currency: 'NGN',
      }),
    });
    const recipientData = await recipientRes.json();
    if (!recipientData.status) throw new Error(recipientData.message || 'Failed to create recipient');

    const recipientCode = recipientData.data.recipient_code;
    const reference = `PC-PS-TRF-${Date.now()}`;

    // Initiate transfer
    const transferRes = await fetch('https://api.paystack.co/transfer', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'balance',
        amount: amount * 100, // kobo
        recipient: recipientCode,
        reason: narration || 'PrimeConnect withdrawal',
        reference,
      }),
    });
    const transferData = await transferRes.json();
    if (!transferData.status) throw new Error(transferData.message || 'Transfer failed');

    const newBalance = currentBalance - amount;

    // Deduct balance
    await fetch(`${SUPABASE_URL}/rest/v1/wallets?id=eq.${wallet.id}`, {
      method: 'PATCH',
      headers: dbHeaders,
      body: JSON.stringify({ balance: newBalance }),
    });

    // Record transaction
    await fetch(`${SUPABASE_URL}/rest/v1/transactions`, {
      method: 'POST',
      headers: dbHeaders,
      body: JSON.stringify({
        user_id: userId,
        wallet_id: wallet.id,
        type: 'debit',
        status: 'pending',
        amount,
        description: narration || 'Bank withdrawal',
        reference,
        metadata: { provider: 'paystack', account_number, account_bank, account_name },
      }),
    });

    return new Response(JSON.stringify({ success: true, reference, new_balance: newBalance }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
