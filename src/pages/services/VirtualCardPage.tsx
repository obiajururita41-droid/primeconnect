import { useState, useEffect } from 'react';
import { CreditCard, Plus, Eye, EyeOff, Snowflake, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

function generateCard() {
  const num = Array.from({length:4}, () => Math.floor(1000+Math.random()*9000)).join(' ');
  const exp = `${String(Math.floor(1+Math.random()*12)).padStart(2,'0')}/${String(new Date().getFullYear()+3).slice(2)}`;
  const cvv = String(Math.floor(100+Math.random()*900));
  return { number: num, expiry: exp, cvv };
}
function generateRef() {
  return `PC-CARD-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
}

export default function VirtualCardPage() {
  const { user } = useAuth();
  const [card, setCard] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<'card'|'fund'>('card');

  useEffect(() => { fetchData(); }, [user]);

  async function fetchData() {
    if (!user) return;
    const { data: w } = await supabase.from('wallets').select('balance').eq('user_id', user.id).single();
    if (w) setWalletBalance(Number(w.balance));
    const { data: c } = await supabase.from('virtual_cards').select('*').eq('user_id', user.id).single();
    if (c) setCard(c);
  }

  async function createCard() {
    setError(''); setCreating(true);
    const { data: w } = await supabase.from('wallets').select('id,balance').eq('user_id', user!.id).single();
    const creationFee = 500;
    if (!w || Number(w.balance) < creationFee) {
      setError('You need ₦500 to create a virtual card'); setCreating(false); return;
    }
    const cardData = generateCard();
    const { data: newCard, error: e } = await supabase.from('virtual_cards').insert({
      user_id: user!.id,
      card_number: cardData.number,
      expiry: cardData.expiry,
      cvv: cardData.cvv,
      balance: 0,
      currency: 'USD',
      is_frozen: false,
      is_active: true,
    }).select().single();
    if (e) { setError('Card creation failed: ' + e.message); setCreating(false); return; }
    await supabase.from('wallets').update({ balance: Number(w.balance) - creationFee }).eq('id', w.id);
    await supabase.from('transactions').insert({
      user_id: user!.id, type: 'card_creation', status: 'success',
      amount: creationFee, description: 'Virtual USD card creation fee', reference: generateRef(),
    });
    setCard(newCard);
    setWalletBalance(Number(w.balance) - creationFee);
    setCreating(false);
  }

  async function toggleFreeze() {
    if (!card) return;
    const { error: e } = await supabase.from('virtual_cards').update({ is_frozen: !card.is_frozen }).eq('id', card.id);
    if (!e) setCard({ ...card, is_frozen: !card.is_frozen });
  }

  async function fundCard() {
    setError(''); setSuccess('');
    const amt = Number(fundAmount);
    if (!amt || amt < 1) return setError('Minimum fund amount is $1');
    const usdRate = 1600;
    const ngnAmount = amt * usdRate;
    if (ngnAmount > walletBalance) return setError(`Insufficient balance. Need ₦${ngnAmount.toLocaleString()}`);
    setLoading(true);
    const { data: w } = await supabase.from('wallets').select('id,balance').eq('user_id', user!.id).single();
    if (!w) { setError('Wallet error'); setLoading(false); return; }
    await supabase.from('wallets').update({ balance: Number(w.balance) - ngnAmount }).eq('id', w.id);
    await supabase.from('virtual_cards').update({ balance: Number(card.balance) + amt }).eq('id', card.id);
    await supabase.from('transactions').insert({
      user_id: user!.id, type: 'card_funding', status: 'success',
      amount: ngnAmount, description: `Virtual card funded $${amt} @ ₦${usdRate}/USD`, reference: generateRef(),
    });
    setCard({ ...card, balance: Number(card.balance) + amt });
    setWalletBalance(Number(w.balance) - ngnAmount);
    setSuccess(`Card funded with $${amt}!`);
    setFundAmount('');
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-br from-purple-700 to-indigo-800 px-4 pt-12 pb-20">
        <div className="max-w-md mx-auto flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-purple-100 text-sm">Virtual Card</p>
            <p className="text-white font-bold text-lg">USD Virtual Card</p>
          </div>
        </div>

        {card ? (
          <div className="max-w-md mx-auto">
            <div className={`rounded-2xl p-5 ${card.is_frozen ? 'bg-gray-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'} text-white relative overflow-hidden`}>
              {card.is_frozen && (
                <div className="absolute inset-0 bg-gray-800/60 flex items-center justify-center z-10 rounded-2xl">
                  <div className="text-center">
                    <Snowflake className="w-10 h-10 text-blue-300 mx-auto mb-2" />
                    <p className="text-white font-bold">Card Frozen</p>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-start mb-6">
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">PrimeConnect</p>
                <p className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">VISA</p>
              </div>
              <p className="text-lg font-mono font-bold mb-4 tracking-widest">
                {showDetails ? card.card_number : card.card_number.replace(/\d{4} \d{4} \d{4}/, '**** **** ****')}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-white/60">Balance</p>
                  <p className="text-xl font-black">${Number(card.balance).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/60">Expires</p>
                  <p className="font-mono text-sm">{showDetails ? card.expiry : '**/**'}</p>
                  {showDetails && <p className="font-mono text-xs text-white/60">CVV: {card.cvv}</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              <button onClick={() => setShowDetails(!showDetails)} className="flex-1 py-2.5 bg-white/20 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2">
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? 'Hide' : 'Show'} Details
              </button>
              <button onClick={toggleFreeze} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${card.is_frozen ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>
                <Snowflake className="w-4 h-4" />
                {card.is_frozen ? 'Unfreeze' : 'Freeze'}
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-white/60" />
            </div>
            <p className="text-white font-bold mb-1">No Virtual Card Yet</p>
            <p className="text-purple-100 text-sm">Creation fee: ₦500 (one-time)</p>
          </div>
        )}
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4">
        {!card ? (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-2">Create Your Virtual USD Card</h3>
            <ul className="text-sm text-gray-500 space-y-1 mb-5">
              <li>✅ Shop on Amazon, Netflix, Spotify & more</li>
              <li>✅ Fund from your naira wallet</li>
              <li>✅ Freeze/unfreeze anytime</li>
              <li>✅ One-time fee of ₦500</li>
            </ul>
            {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl mb-4"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{error}</p></div>}
            <button onClick={createCard} disabled={creating}
              className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-xl flex items-center justify-center gap-2">
              {creating ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-5 h-5" />Create Card (₦500)</>}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 mt-4">
            <div className="flex gap-2 mb-4">
              {(['card','fund'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize ${tab === t ? 'bg-purple-600 text-white' : 'bg-gray-50 text-gray-500'}`}>
                  {t === 'card' ? '💳 Card Info' : '💰 Fund Card'}
                </button>
              ))}
            </div>

            {tab === 'card' && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Card Number</span>
                  <span className="font-mono font-bold">{showDetails ? card.card_number : '•••• •••• •••• ' + card.card_number.slice(-4)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Expiry</span>
                  <span className="font-mono font-bold">{showDetails ? card.expiry : '**/**'}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">CVV</span>
                  <span className="font-mono font-bold">{showDetails ? card.cvv : '***'}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold ${card.is_frozen ? 'text-blue-600' : 'text-green-600'}`}>{card.is_frozen ? '❄️ Frozen' : '✅ Active'}</span>
                </div>
                <div className="flex justify-between p-3 bg-purple-50 rounded-xl">
                  <span className="text-purple-700 font-semibold">USD Balance</span>
                  <span className="font-black text-purple-700">${Number(card.balance).toFixed(2)}</span>
                </div>
              </div>
            )}

            {tab === 'fund' && (
              <div>
                <div className="mb-3 p-3 bg-gray-50 rounded-xl flex justify-between text-sm">
                  <span className="text-gray-500">Wallet Balance</span>
                  <span className="font-bold">₦{walletBalance.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">Rate: $1 = ₦1,600</p>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount in USD ($)</label>
                <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)}
                  placeholder="Enter USD amount"
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-xl font-bold focus:outline-none focus:border-purple-500 mb-2" />
                {fundAmount && <p className="text-xs text-gray-500 mb-4">≈ ₦{(Number(fundAmount)*1600).toLocaleString()} will be deducted</p>}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[5,10,20,50,100,200].map(q => (
                    <button key={q} onClick={() => setFundAmount(String(q))}
                      className={`py-2 rounded-xl text-xs font-bold border-2 ${fundAmount === String(q) ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-100'}`}>
                      ${q}
                    </button>
                  ))}
                </div>
                {error && <div className="flex gap-2 p-3 bg-red-50 rounded-xl mb-3"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-600">{error}</p></div>}
                {success && <div className="flex gap-2 p-3 bg-green-50 rounded-xl mb-3"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><p className="text-sm text-green-600">{success}</p></div>}
                <button onClick={fundCard} disabled={loading}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                  {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Fund Card</>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
