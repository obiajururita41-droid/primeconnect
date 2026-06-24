import { serve } from 'https://deno.land/x/sift@0.6.0/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import * as OTPAuth from 'https://esm.sh/otpauth@9.1.4';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { action, user_id, token } = await req.json();

  if (action === 'generate') {
    const secret = new OTPAuth.Secret();
    const totp = new OTPAuth.TOTP({
      issuer: 'PrimeConnect',
      label: user_id,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    });
    await supabase.from('profiles').update({ totp_secret: secret.base32 }).eq('id', user_id);
    return new Response(JSON.stringify({ otpauth_url: totp.toString(), secret: secret.base32 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'verify' || action === 'enable') {
    const { data: profile } = await supabase.from('profiles').select('totp_secret').eq('id', user_id).single();
    if (!profile?.totp_secret) return new Response(JSON.stringify({ error: 'No secret found' }), { status: 400 });
    const totp = new OTPAuth.TOTP({
      issuer: 'PrimeConnect',
      label: user_id,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(profile.totp_secret),
    });
    const delta = totp.validate({ token, window: 1 });
    if (delta === null) return new Response(JSON.stringify({ valid: false }), { headers: { 'Content-Type': 'application/json' } });
    if (action === 'enable') {
      await supabase.from('profiles').update({ totp_enabled: true }).eq('id', user_id);
    }
    return new Response(JSON.stringify({ valid: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  if (action === 'disable') {
    await supabase.from('profiles').update({ totp_enabled: false, totp_secret: null }).eq('id', user_id);
    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400 });
});
