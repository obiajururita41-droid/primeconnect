const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get('5SIM_API_KEY');
const BASE_URL = 'https://5sim.net/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { action, country, service, orderId } = await req.json();

  let url = '';
  let options: any = {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json',
    },
  };

  if (action === 'get_prices') {
    url = `${BASE_URL}/guest/prices?country=${country}&product=${service}`;
  } else if (action === 'buy_number') {
    url = `${BASE_URL}/user/buy/activation/${country}/any/${service}`;
  } else if (action === 'check_sms') {
    url = `${BASE_URL}/user/check/${orderId}`;
  } else if (action === 'cancel_order') {
    url = `${BASE_URL}/user/cancel/${orderId}`;
    options.method = 'GET';
  }

  const res = await fetch(url, options);
  const data = await res.json();

  if (action === 'check_sms') {
    const sms = data.sms?.map((s: any) => ({ code: s.code, text: s.text })) || [];
    return new Response(JSON.stringify({ sms }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
