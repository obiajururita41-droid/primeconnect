import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CheckCircle, Shield, Smartphone, Copy, AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  user: any;
  profile: any;
  refreshProfile: () => void;
  showToast: (type: 'success' | 'error', message: string) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callTOTP(body: Record<string, any>) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/totp-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    console.log('TOTP response:', text);
    return JSON.parse(text);
  } catch (err) {
    console.error('TOTP error:', err);
    return { error: String(err) };
  }
}

export default function TOTPSetup({ user, profile, refreshProfile, showToast }: Props) {
  const [step, setStep] = useState<'idle' | 'scan' | 'verify' | 'done'>('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const enabled = profile?.totp_enabled;

  useEffect(() => {
    if (step === 'idle') { setQrUrl(''); setSecret(''); setToken(''); }
  }, [step]);

  async function handleGenerate() {
    setLoading(true);
    const data = await callTOTP({ action: 'generate', user_id: user.id });
    if (data.otpauth_url) {
      const url = await QRCode.toDataURL(data.otpauth_url, { width: 220, margin: 2 });
      setQrUrl(url);
      setSecret(data.secret);
      setStep('scan');
    } else {
      showToast('error', 'Failed to generate QR code');
    }
    setLoading(false);
  }

  async function handleVerify() {
    if (token.length !== 6) return showToast('error', 'Enter the 6-digit code');
    setLoading(true);
    const data = await callTOTP({ action: 'enable', user_id: user.id, token });
    if (data.valid) {
      setStep('done');
      refreshProfile();
      showToast('success', '2FA enabled successfully!');
    } else {
      showToast('error', 'Invalid code. Try again.');
    }
    setLoading(false);
  }

  async function handleDisable() {
    setDisabling(true);
    const data = await callTOTP({ action: 'disable', user_id: user.id });
    if (data.success) {
      refreshProfile();
      setStep('idle');
      showToast('success', '2FA disabled');
    } else {
      showToast('error', 'Failed to disable 2FA');
    }
    setDisabling(false);
  }

  function copySecret() {
    navigator.clipboard.writeText(secret);
    showToast('success', 'Secret copied!');
  }

  if (enabled) return (
    <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-green-100 flex items-center justify-center">
          <Shield className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-black text-green-800">Authenticator App Enabled</p>
          <p className="text-xs text-green-600">Your account is protected with TOTP 2FA</p>
        </div>
        <span className="ml-auto text-[10px] font-bold bg-green-500 text-white px-2 py-1 rounded-full">ACTIVE</span>
      </div>
      <button onClick={handleDisable} disabled={disabling}
        className="w-full py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold bg-white flex items-center justify-center gap-2 active:scale-95 transition-all">
        {disabling ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Disable 2FA'}
      </button>
    </div>
  );

  if (step === 'idle') return (
    <div className="p-4 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center">
          <Smartphone className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="text-sm font-black text-gray-900">Authenticator App</p>
          <p className="text-xs text-gray-500">Google/Microsoft Authenticator</p>
        </div>
        <span className="ml-auto text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-1 rounded-full">OFF</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Use an authenticator app to generate one-time codes. More secure than SMS.</p>
      <button onClick={handleGenerate} disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Set Up Authenticator</>}
      </button>
    </div>
  );

  if (step === 'scan') return (
    <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">1</div>
        <p className="text-sm font-black text-gray-900">Scan QR Code</p>
      </div>
      <p className="text-xs text-gray-500">Open Google Authenticator or Microsoft Authenticator and scan this QR code.</p>
      {qrUrl && (
        <div className="flex justify-center bg-white p-3 rounded-2xl border border-gray-100">
          <img src={qrUrl} alt="QR Code" className="w-48 h-48" />
        </div>
      )}
      <div className="bg-white rounded-xl border border-gray-100 p-3">
        <p className="text-[10px] text-gray-400 mb-1 font-bold uppercase tracking-wider">Can't scan? Enter manually:</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-mono text-gray-700 break-all flex-1">{secret}</p>
          <button onClick={copySecret} className="shrink-0 w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
            <Copy className="w-3.5 h-3.5 text-blue-600" />
          </button>
        </div>
      </div>
      <button onClick={() => setStep('verify')}
        className="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-black active:scale-95 transition-all">
        I've Scanned It →
      </button>
      <button onClick={() => setStep('idle')} className="w-full text-xs text-gray-400 font-medium py-1">Cancel</button>
    </div>
  );

  if (step === 'verify') return (
    <div className="p-4 bg-gray-50 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">2</div>
        <p className="text-sm font-black text-gray-900">Enter Verification Code</p>
      </div>
      <p className="text-xs text-gray-500">Enter the 6-digit code shown in your authenticator app to confirm setup.</p>
      <input
        value={token}
        onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
        placeholder="000000"
        className="w-full text-center text-3xl font-black tracking-[0.5em] border-2 border-gray-200 rounded-2xl py-4 outline-none focus:border-blue-500 bg-white"
        inputMode="numeric"
        maxLength={6}
        autoFocus
      />
      <button onClick={handleVerify} disabled={loading || token.length !== 6}
        className="w-full py-3 rounded-xl bg-blue-600 disabled:bg-blue-300 text-white text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Verify & Enable 2FA</>}
      </button>
      <button onClick={() => setStep('scan')} className="w-full text-xs text-gray-400 font-medium py-1">← Back to QR Code</button>
    </div>
  );

  if (step === 'done') return (
    <div className="p-5 bg-green-50 border border-green-100 rounded-2xl text-center">
      <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
        <CheckCircle className="w-7 h-7 text-white" />
      </div>
      <p className="font-black text-green-800 text-base">2FA Enabled!</p>
      <p className="text-xs text-green-600 mt-1">Your account is now protected with authenticator app 2FA.</p>
    </div>
  );

  return null;
}
