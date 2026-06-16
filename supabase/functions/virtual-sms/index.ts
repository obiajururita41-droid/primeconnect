const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY = Deno.env.get('5SIM_API_KEY');
const BASE_URL = 'https://5sim.net/v1';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { action, country, service, orderId, operator } = await req.json();
    const authHeaders = {
      'Authorization': `Bearer ${API_KEY}`,
      'Accept': 'application/json',
    };

    if (action === 'get_prices') {
      const res = await fetch(`${BASE_URL}/guest/prices?country=${country}&product=${service}`);
      const data = await res.json();
      const countryData = data?.[country]?.[service];
      let bestCost = null;
      let bestOp = 'any';
      if (countryData) {
        const ops = Object.entries(countryData);
        const good = ops.filter((e) => e[1].count > 0 && !['virtual58','virtual4','virtual52'].includes(e[0]));
        const pool = good.length > 0 ? good : ops.filter((e) => e[1].count > 0);
        if (pool.length > 0) {
          pool.sort((a, b) => (b[1].rate || 0) - (a[1].rate || 0));
          bestCost = pool[0][1].cost;
          bestOp = pool[0][0];
        }
      }
      const result = {};
      if (bestCost !== null) result[country] = { [service]: { any: { cost: bestCost }, _bestOp: bestOp } };
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (action === 'buy_number') {
      const op = operator || 'any';
      const res = await fetch(`${BASE_URL}/user/buy/activation/${country}/${op}/${service}`, { headers: authHeaders });
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (action === 'check_sms') {
      const res = await fetch(`${BASE_URL}/user/check/${orderId}`, { headers: authHeaders });
      const data = await res.json();
      const sms = (data.sms || []).map((s) => ({ code: s.code, text: s.text }));
      return new Response(JSON.stringify({ sms }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else if (action === 'cancel_order') {
      const res = await fetch(`${BASE_URL}/user/cancel/${orderId}`, { headers: authHeaders });
      return new Response(JSON.stringify(await res.json()), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch(err) {
    return new Response(JSON.stringify({ error: String(err) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
