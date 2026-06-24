// supabase/functions/hyper-task/index.ts
// Deploy: supabase functions deploy hyper-task

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {

  // ── MUST be first — handles browser pre-flight ──
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing message field." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "You are Auveria Assistant, a helpful AI for Auveria Mall — a cross-border e-commerce platform for Nigeria, China, and the UK. Help with orders, products, shipping, pricing, and sourcing. Be concise and friendly." }]
            },
            {
              role: "model",
              parts: [{ text: "I'm Auveria Assistant! How can I help you today?" }]
            },
            {
              role: "user",
              parts: [{ text: message }]
            }
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
        }),
      }
    );

    const data = await geminiRes.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      ?? "Sorry, I couldn't get a response. Please try again.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message ?? "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
