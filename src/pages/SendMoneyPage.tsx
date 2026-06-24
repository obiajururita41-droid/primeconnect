import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Send, Search, CheckCircle, AlertCircle,
  User, ChevronRight, Clock, Wallet, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface RecentRecipient {
  id: string;
  recipient_name: string;
  recipient_tag: string;
  amount: number;
  created_at: string;
}

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function SendMoneyPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'form' | 'confirm' | 'pin' | 'success'>('form');
  const [balance, setBalance] = useState(0);
  const [recipientTag, setRecipientTag] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [resolvedName, setResolvedName] = useState('');
  const [recentRecipients, setRecentRecipients] = useState<RecentRecipient[]>([]);
  const [successData, setSuccessData] = useState<any>(null);
  const [hasPin, setHasPin] = useState(false);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single();
    if (wallet) setBalance(Number(wallet.balance));

    const { data: profileData } = await supabase
      .from('profiles')
      .select('transfer_pin')
      .eq('id', user?.id)
      .single();
    if (profileData?.transfer_pin) setHasPin(true);

    // Get recent wallet-to-wallet recipients
    const { data: txns } = await supabase
      .from('transactions')
      .select('id, metadata, amount, created_at')
      .eq('user_id', user?.id)
      .eq('type', 'debit')
      .like('reference', 'PC-W2W-%')
      .order('created_at', { ascending: false })
      .limit(5);

    if (txns) {
      const mapped = txns
        .filter(t => t.metadata?.recipient_name)
        .map(t => ({
          id: t.id,
          recipient_name: t.metadata.recipient_name,
          recipient_tag: t.metadata.recipient_tag || '',
          amount: Number(t.amount),
          created_at: t.created_at,
        }));
      setRecentRecipients(mapped);
    }
  }

  // Auto-resolve recipient when tag is 6+ chars
  useEffect(() => {
    setResolvedName('');
    setError('');
    if (recipientTag.trim().length < 3) return;
    const timer = setTimeout(() => resolveRecipient(), 600);
    return () => clearTimeout(timer);
  }, [recipientTag]);

  async function resolveRecipient() {
    if (!recipientTag.trim()) return;
    setSearching(true);
    setError('');
    setResolvedName('');

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    // We resolve by calling a quick DB lookup
    const tag = recipientTag.trim().toUpperCase();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, referral_code')
      .or(`referral_code.eq.${tag},email.eq.${recipientTag.trim().toLowerCase()},phone.eq.${recipientTag.trim()},phone.eq.0${recipientTag.trim()},phone.eq.+234${recipientTag.trim()}`)
      .single();

    setSearching(false);

    if (error || !data) {
      setResolvedName('');
      return;
    }

    if (data.id === user?.id) {
      setError('You cannot send money to yourself');
      return;
    }

    setResolvedName(data.full_name || 'Unknown User');
  }

  function handleNext() {
    setError('');
    if (!recipientTag.trim()) return setError('Enter a phone number, tag or email');
    if (!resolvedName) return setError('Recipient not found. Check the tag and try again.');
    const amt = Number(amount);
    if (!amt || amt < 50) return setError('Minimum transfer amount is ₦50');
    if (amt > balance) return setError('Insufficient wallet balance');
    setStep('confirm');
  }

  async function handleConfirm() {
    if (hasPin) {
      setStep('pin');
    } else {
      await doTransfer();
    }
  }

  async function handlePinConfirm() {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('transfer_pin')
      .eq('id', user?.id)
      .single();

    if (profileData?.transfer_pin !== pin) {
      setError('Incorrect PIN. Please try again.');
      setPin('');
      return;
    }
    await doTransfer();
  }

  async function doTransfer() {
    setLoading(true);
    setError('');

    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const { data, error } = await supabase.functions.invoke('wallet-transfer', {
      headers: { Authorization: `Bearer ${token}` },
      body: {
        recipient_tag: recipientTag.trim(),
        amount: Number(amount),
        narration: narration || undefined,
      },
    });

    setLoading(false);

    if (error || data?.error) {
      setError(data?.error || error?.message || 'Transfer failed. Please try again.');
      setStep('confirm');
      return;
    }

    setSuccessData(data);
    setBalance(data.new_balance);
    setStep('success');
  }

  function reset() {
    setStep('form');
    setRecipientTag('');
    setAmount('');
    setNarration('');
    setPin('');
    setError('');
    setResolvedName('');
    setSuccessData(null);
    fetchData();
  }

  // ── SUCCESS SCREEN ──
  if (step === 'success' && successData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-1">Transfer Successful!</h2>
            <p className="text-gray-400 text-sm mb-6">Money sent successfully</p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount Sent</span>
                <span className="text-sm font-black text-gray-900">₦{Number(successData.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Recipient</span>
                <span className="text-sm font-bold text-gray-900">{successData.recipient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">New Balance</span>
                <span className="text-sm font-bold text-blue-600">₦{Number(successData.new_balance).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Reference</span>
                <span className="text-xs font-mono text-gray-400">{successData.reference}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate('/transactions')}
                className="flex-1 py-3 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600"
              >
                View History
              </button>
              <button
                onClick={reset}
                className="flex-1 py-3 bg-blue-600 rounded-2xl text-sm font-bold text-white shadow-lg shadow-blue-200"
              >
                Send Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PIN SCREEN ──
  if (step === 'pin') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="text-lg font-black text-gray-900 mb-1">Enter Transfer PIN</h2>
            <p className="text-gray-400 text-sm mb-6">Confirm your 4-digit PIN to send ₦{Number(amount).toLocaleString()} to {resolvedName}</p>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                    pin.length > i
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {pin.length > i ? '•' : ''}
                </div>
              ))}
            </div>

            {/* Number Pad */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === '⌫') setPin(p => p.slice(0, -1));
                    else if (key === '') return;
                    else if (pin.length < 4) setPin(p => p + key);
                  }}
                  className={`h-14 rounded-2xl text-lg font-bold transition-all active:scale-95 ${
                    key === '' ? 'bg-transparent' :
                    key === '⌫' ? 'bg-gray-100 text-gray-600' :
                    'bg-gray-50 text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('confirm'); setPin(''); setError(''); }}
                className="flex-1 py-3 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600"
              >
                Back
              </button>
              <button
                onClick={handlePinConfirm}
                disabled={pin.length < 4 || loading}
                className="flex-1 py-3 bg-blue-600 rounded-2xl text-sm font-bold text-white disabled:opacity-50 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CONFIRM SCREEN ──
  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Confirm Transfer</h2>
              <p className="text-gray-400 text-sm">Review details before sending</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 mb-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Sending to</span>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{resolvedName}</p>
                  <p className="text-xs text-gray-400">{recipientTag.toUpperCase()}</p>
                </div>
              </div>
              <div className="border-t border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Amount</span>
                <span className="text-xl font-black text-blue-600">₦{Number(amount).toLocaleString()}</span>
              </div>
              {narration && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Note</span>
                    <span className="text-sm font-medium text-gray-700">{narration}</span>
                  </div>
                </>
              )}
              <div className="border-t border-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Balance after</span>
                <span className="text-sm font-bold text-gray-700">₦{(balance - Number(amount)).toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep('form'); setError(''); }}
                className="flex-1 py-3.5 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-600 active:scale-95 transition-transform"
              >
                Edit
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3.5 bg-blue-600 rounded-2xl text-sm font-bold text-white shadow-lg shadow-blue-200 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Send className="w-4 h-4" /> Send Now</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN FORM ──
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-white/5" />
        <div className="absolute -left-6 -bottom-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-white font-black text-lg">Send Money</h1>
              <p className="text-blue-200 text-xs">Transfer to any PrimeConnect user</p>
            </div>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs mb-1">Available Balance</p>
              <p className="text-white font-black text-2xl">₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-10 space-y-4">
        {/* Recipient Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">Send To</label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {searching
                ? <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin block" />
                : resolvedName
                ? <CheckCircle className="w-4 h-4 text-green-500" />
                : <Search className="w-4 h-4 text-gray-400" />
              }
            </div>
            <input
              type="text"
              value={recipientTag}
              onChange={e => { setRecipientTag(e.target.value); setResolvedName(''); setError(''); }}
              placeholder="Phone number, tag or email"
              className="w-full pl-10 pr-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
            {recipientTag && (
              <button
                onClick={() => { setRecipientTag(''); setResolvedName(''); setError(''); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {resolvedName && (
            <div className="flex items-center gap-3 mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-green-800">{resolvedName}</p>
                <p className="text-xs text-green-600">PrimeConnect User · Verified</p>
              </div>
              <CheckCircle className="w-4 h-4 text-green-500 ml-auto shrink-0" />
            </div>
          )}

          {error && !resolvedName && recipientTag.length > 3 && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> User not found
            </p>
          )}
        </div>

        {/* Amount Input */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">Amount (₦)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-4 border-2 border-gray-100 rounded-xl text-3xl font-black text-gray-900 focus:outline-none focus:border-blue-500 transition-colors text-center"
          />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {QUICK_AMOUNTS.map(q => (
              <button
                key={q}
                onClick={() => setAmount(String(q))}
                className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all active:scale-95 ${
                  amount === String(q)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-blue-200'
                }`}
              >
                ₦{q.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Narration */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <label className="block text-sm font-bold text-gray-700 mb-3">Note (optional)</label>
          <input
            type="text"
            value={narration}
            onChange={e => setNarration(e.target.value)}
            placeholder="What's this for? e.g. Rent, Food, Gift..."
            className="w-full px-4 py-3.5 border-2 border-gray-100 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors"
            maxLength={100}
          />
        </div>

        {/* Recent Recipients */}
        {recentRecipients.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-sm font-bold text-gray-700">Recent</p>
            </div>
            <div className="space-y-1">
              {recentRecipients.map((r, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setRecipientTag(r.recipient_tag || r.recipient_name);
                    setResolvedName(r.recipient_name);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-black text-sm">
                      {r.recipient_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-800">{r.recipient_name}</p>
                    <p className="text-xs text-gray-400">₦{r.amount.toLocaleString()} · {new Date(r.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Send Button */}
        <button
          onClick={handleNext}
          disabled={!recipientTag || !amount || !resolvedName}
          className="w-full py-4 bg-blue-600 rounded-2xl text-white font-black text-base shadow-lg shadow-blue-200 active:scale-95 transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          Continue
        </button>
      </div>
    </div>
  );
}
