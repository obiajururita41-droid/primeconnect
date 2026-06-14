import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { account_number, account_bank, account_name, amount, narration } = await req.json();

    if (!account_number || !account_bank || !amount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (walletError || !wallet) {
      return new Response(JSON.stringify({ error: 'Wallet not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (Number(wallet.balance) < Number(amount)) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const reference = `PC-TRF-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const flwRes = await fetch('https://api.flutterwave.com/v3/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('FLW_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_bank,
        account_number,
        amount: Number(amount),
        narration: narration || 'PrimeConnect Withdrawal',
        currency: 'NGN',
        reference,
        callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/flutterwave-transfer-webhook`,
        debit_currency: 'NGN',
      }),
    });

    const flwData = await flwRes.json();

    if (flwData.status !== 'success') {
      return new Response(JSON.stringify({ error: flwData.message || 'Transfer failed' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newBalance = Number(wallet.balance) - Number(amount);

    await supabase.from('wallets').update({ balance: newBalance }).eq('id', wallet.id);

    await supabase.from('transactions').insert({
      user_id: user.id,
      wallet_id: wallet.id,
      type: 'debit',
      status: 'pending',
      amount: Number(amount),
      description: narration || 'Bank Transfer',
      reference,
      metadata: {
        provider: 'flutterwave',
        account_number,
        account_bank,
        account_name,
        flw_transfer_id: flwData.data?.id,
      },
    });

    return new Response(JSON.stringify({
      success: true,
      reference,
      new_balance: newBalance,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
