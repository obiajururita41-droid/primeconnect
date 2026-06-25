import { useState } from 'react';
import BackButton from '../../components/ui/BackButton';
import { Zap, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { saveState, loadState, clearState } from '../../lib/sessionState';
import BackButton from '../../components/ui/BackButton';

const PROVIDERS = [
  { id: 'IKEDC', name: 'Ikeja Electric (IKEDC)' },
  { id: 'EKEDC', name: 'Eko Electric (EKEDC)' },
  { id: 'AEDC', name: 'Abuja Electric (AEDC)' },
  { id: 'PHEDC', name: 'Port Harcourt Electric (PHED)' },
  { id: 'EEDC', name: 'Enugu Electric (EEDC)' },
  { id: 'KEDCO', name: 'Kano Electric (KEDCO)' },
  { id: 'IBEDC', name: 'Ibadan Electric (IBEDC)' },
  { id: 'BEDC', name: 'Benin Electric (BEDC)' },
];

const METER_TYPES = ['Prepaid', 'Postpaid'];
const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

function generateRef() {
  return `PC-ELEC-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

function generateToken() {
  return Array.from({length:4}, () => Math.floor(1000 + Math.random()*9000)).join('-');
}

export default function ElectricityPage() {
  const { user } = useAuth();
  const [provider, setProvider] = useState<string>(() => loadState<string>('elec_provider') || '');
  const [meterType, setMeterType] = useState<string>(() => loadState<string>('elec_meterType') || 'Prepaid');
  const [meterNumber, setMeterNumber] = useState<string>(() => loadState<string>('elec_meterNumber') || '');
  const [amount, setAmount] = useState<string>(() => loadState<string>('elec_amount') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState<string>(() => loadState<string>('elec_token') || '');
  const [copied, setCopied] = useState(false);

  function handleSetProvider(val: string) { setProvider(val); saveState('elec_provider', val); }
  function handleSetMeterType(val: string) { setMeterType(val); saveState('elec_meterType', val); }
  function handleSetMeterNumber(val: string) { setMeterNumber(val); saveState('elec_meterNumber', val); }
  function handleSetAmount(val: string) { setAmount(val); saveState('elec_amount', val); }

  async function handlePurchase() {
    setError('');
    if (!provider) return setError('Select a provider');
    if (!meterNumber.trim() || meterNumber.length < 10) return setError('Enter a valid meter number');
    const amt = Number(amount);
    if (!amt || amt < 500) return setError('Minimum purchase is ₦500');
    setLoading(true);

    const { data: wallet } = await supabase.from('wallets').select('id,balance').eq('user_id', user!.id).single();
    if (!wallet || Number(wallet.balance) < amt) {
      setError('Insufficient wallet balance'); setLoading(false); return;
    }

    const ref = generateRef();
    const tok = generateToken();
    const { error: txErr } = await supabase.from('transactions').insert({
      user_id: user!.id, type: 'electricity', status: 'success',
      amount: amt,
      description: `${provider} electricity - Meter: ${meterNumber}`,
      reference: ref,
      metadata: { provider, meter_type: meterType, meter_number: meterNumber, token: tok },
    });
    if (txErr) { setError('Purchase failed'); setLoading(false); return; }

    await supabase.from('wallets').update({ balance: Number(wallet.balance) - amt }).eq('id', wallet.id);
    setToken(tok);
    saveState('elec_token', tok);
    setLoading(false);
  }

  function copyToken() {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleBuyAgain() {
    setToken('');
    setMeterNumber('');
    setAmount('');
    setProvider('');
    clearState('elec_token');
    clearState('elec_meterNumber');
    clearState('elec_amount');
    clearState('elec_provider');
  }

  if (token) return (
      <BackButton />
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-sm border border-gray-100">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Token Generated!</h2>
        <p className="text-gray-500 text-sm mb-5">Enter this token on your meter</p>
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <p className="text-2xl font-black text-gray-900 tracking-widest">{token}</p>
        </div>
        <button onClick={copyToken} className="flex items-center gap-2 mx-auto mb-6 text-blue-600 text-sm font-semibold">
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Token'}
        </button>
        <div className="text-left bg-blue-50 rounded-xl p-3 mb-5 text-xs text-blue-700 space-y-1">
          <p><strong>Meter:</strong> {meterNumber}</p>
          <p><strong>Provider:</strong> {provider}</p>
          <p><strong>Amount:</strong> ₦{Number(amount).toLocaleString()}</p>
        </div>
        <button onClick={handleBuyAgain} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Buy Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 pt-12 pb-16">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-blue-100 text-sm">Utility Payment</p>
            <p className="text-white font-bold text-lg">Electricity Token</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Electricity Provider</label>
            <select value={provider} onChange={e => handleSetProvider(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-white">
              <option value="">Select provider</option>
              {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meter Type</label>
            <div className="grid grid-cols-2 gap-2">
              {METER_TYPES.map(t => (
                <button key={t} onClick={() => handleSetMeterType(t)}
                  className={`py-3 rounded-xl text-sm font-bold border-2 ${meterType === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Meter Number</label>
            <input type="text" value={meterNumber} onChange={e => handleSetMeterNumber(e.target.value)}
              placeholder="Enter meter number"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl font-mono focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (₦)</label>
            <input type="number" value={amount} onChange={e => handleSetAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xl font-bold focus:outline-none focus:border-blue-500" />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {QUICK_AMOUNTS.map(q => (
                <button key={q} onClick={() => handleSetAmount(String(q))}
                  className={`py-2 rounded-xl text-xs font-bold border-2 ${amount === String(q) ? 'bg-blue-600 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-100'}`}>
                  ₦{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{error}</p></div>}

          <button onClick={handlePurchase} disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Zap className="w-5 h-5" />Purchase Token</>}
          </button>
        </div>
      </div>
    </div>
  );
}
