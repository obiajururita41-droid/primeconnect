const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { country } = await req.json();
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const [productsRes, servicesRes] = await Promise.all([
      fetch("https://5sim.net/v1/guest/products/" + country + "/any", {
        headers: { "Accept": "application/json" },
      }),
      fetch(SUPABASE_URL + "/rest/v1/services?select=*,service_categories(name)&is_active=eq.true&order=sort_order", {
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": "Bearer " + SUPABASE_KEY,
        },
      }),
    ]);

    const products = await productsRes.json();
    const services = await servicesRes.json();

    const result = (services || []).map((service) => {
      const product = products[service.slug];
      const available = product && product.Qty > 0;
      const price = product ? product.Price : null;
      const status = available ? (service.is_high_risk ? "limited" : "active") : "unavailable";
      return {
        id: service.id,
        name: service.name,
        slug: service.slug,
        category: service.service_categories ? service.service_categories.name : "Other",
        is_high_risk: service.is_high_risk,
        available,
        price_usd: price,
        price_ngn: price ? Math.ceil(price * 1600 * 1.3) : null,
        status,
        success_rate: service.is_high_risk ? 20 : 40,
        warning: service.is_high_risk ? "Low reliability - OTP may not arrive" : null,
      };
    });

    const grouped = {};
    result.forEach((s) => {
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });

    return new Response(JSON.stringify({ services: result, grouped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
