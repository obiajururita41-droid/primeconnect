import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';

const USER_ID = 'CK101280550';
const API_KEY = Deno.env.get('CLUBKONNECT_API_KEY') || '';
const BASE_URL = 'https://www.nellobytesystems.com';

const NETWORK_MAP: Record<string, string> = {
  'mtn': '01',
  'glo': '02',
  '9mobile': '03',
  'etisalat': '03',
  'airtel': '04',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const { action, payload } = await req.json();

    if (action === 'buy_airtime') {
      const { network, phone, amount, requestId } = payload;
      const networkCode = NETWORK_MAP[network.toLowerCase()] || '01';
      const url = `${BASE_URL}/APIAirtimeV1.asp?UserID=${USER_ID}&APIKey=${API_KEY}&MobileNetwork=${networkCode}&Amount=${amount}&MobileNumber=${phone}&RequestID=${requestId}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === 'get_data_plans') {
      const url = `${BASE_URL}/APIDatabundlePlansV2.asp?UserID=${USER_ID}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === 'buy_data') {
      const { network, phone, dataPlan, requestId } = payload;
      const networkCode = NETWORK_MAP[network.toLowerCase()] || '01';
      const url = `${BASE_URL}/APIDatabundleV1.asp?UserID=${USER_ID}&APIKey=${API_KEY}&MobileNetwork=${networkCode}&DataPlan=${dataPlan}&MobileNumber=${phone}&RequestID=${requestId}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (action === 'query_order') {
      const { orderId } = payload;
      const url = `${BASE_URL}/APIQueryV1.asp?UserID=${USER_ID}&APIKey=${API_KEY}&OrderID=${orderId}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
