import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Building2, Search, CheckCircle, AlertCircle, Loader2, Lock, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Bank { code: string; name: string; }
interface SavedBank { id: string; bank_code: string; bank_name: string; account_number: string; account_name: string; }

export default function WithdrawalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState('NGN');
  const [banks, setBanks] = useState<Bank[]>([]);
  const [savedBanks, setSavedBanks] = useState<SavedBank[]>([]);
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [saveRecipient, setSaveRecipient] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pin, setPin] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => { fetchWallet(); fetchBanks(); fetchSavedBanks(); }, []);

  async function fetchWallet() {
    const { data } = await supabase.from('wallets').select('balance, currency').eq('user_id', user?.id).eq('is_active', true).single();
    if (data) { setBalance(Number(data.balance)); setCurrency(data.currency); }
  }

  async function fetchBanks() {
    const { data, error } = await supabase.functions.invoke('paystack-get-banks');
    if (!error && data?.banks) setBanks(data.banks.sort((a: Bank, b: Bank) => a.name.localeCompare(b.name)));
  }

  async function fetchSavedBanks() {
    const { data } = await supabase.from('bank_accounts').select('id, bank_code, bank_name, account_number, account_name').eq('user_id', user?.id).order('is_default', { ascending: false });
    if (data) setSavedBanks(data);
  }

  function selectSavedBank(b: SavedBank) { setBankCode(b.bank_code); setAccountNumber(b.account_number); setAccountName(b.account_name); setError(''); }

  async function verifyAccount() {
    if (!bankCode || accountNumber.length < 10) return;
    setVerifying(true); setError(''); setAccountName('');
    const { data, error } = await supabase.functions.invoke('paystack-verify-account', { body: { account_number: accountNumber, account_bank: bankCode } });
    setVerifying(false);
    if (error || data?.error) { setError(data?.error || 'Could not verify account.'); return; }
    setAccountName(data.account_name);
  }

  async function handleSubmit() {
    setError(''); setSuccess('');
    const transferAmount = Number(amount);
    if (!bankCode) return setError('Select a bank');
    if (!accountNumber) return setError('Enter account number');
    if (!accountName) return setError('Verify the account first');
    if (!transferAmount || transferAmount <= 0) return setError('Enter a valid amount');
    if (transferAmount > balance) return setError('Insufficient balance');
    const { data: profileData } = await supabase.from('profiles').select('transfer_pin').eq('id', user?.id).single();
    if (profileData?.transfer_pin) { setShowPinModal(true); return; }
    await doTransfer();
  }

  async function doTransfer() {
    setSubmitting(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    const { data, error } = await supabase.functions.invoke('paystack-transfer', {
      headers: { Authorization: `Bearer ${token}` },
      body: { account_number: accountNumber, account_bank: bankCode, account_name: accountName, amount: Number(amount), narration: narration || undefined },
    });
    setSubmitting(false);
    if (error || data?.error) { setError(error?.message || JSON.stringify(data) || 'Transfer failed'); return; }
    setSuccess(`Transfer successful! Ref: ${data.reference}`);
    setBalance(data.new_balance);
    if (saveRecipient) {
      const bankName = banks.find((b) => b.code === bankCode)?.name || '';
      await supabase.from('bank_accounts').insert({ user_id: user?.id, bank_code: bankCode, bank_name: bankName, account_number: accountNumber, account_name: accountName });
      fetchSavedBanks();
    }
    setAmount(''); setNarration('');
  }

  async function confirmPin() {
    const { data: profileData } = await supabase.from('profiles').select('transfer_pin').eq('id', user?.id).single();
    if (profileData?.transfer_pin !== pin) { setError('Incorrect PIN.'); setShowPinModal(false); setPin(''); return; }
    setShowPinModal(false); setPin('');
    await doTransfer();
  }

  const inputClass = "w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all";
  const selectedBank = banks.find(b => b.code === bankCode);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-4 pt-12 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/dashboard')} className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <h1 className="text-white font-bold text-lg">Withdraw to Bank</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/15 backdrop-blur rounded-2xl p-4 border border-white/20">
          <p className="text-blue-100 text-xs mb-1">Available Balance</p>
          <p className="text-white text-2xl font-black">₦{balance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="px-4 -mt-10 pb-24">
        <div className="bg-white rounded-3xl shadow-lg p-5">

          {/* Success */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-100 rounded-2xl flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Saved Recipients */}
          {savedBanks.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Saved Recipients</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {savedBanks.map((b) => (
                  <button key={b.id} onClick={() => selectSavedBank(b)}
                    className={`shrink-0 px-3 py-2.5 rounded-2xl border-2 text-left transition-all ${bankCode === b.bank_code && accountNumber === b.account_number ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-gray-50'}`}>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1.5">
                      <span className="text-blue-700 font-bold text-xs">{b.account_name?.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div className="font-semibold text-xs text-gray-800 max-w-[80px] truncate">{b.account_name?.split(' ')[0]}</div>
                    <div className="text-xs text-gray-400">{b.bank_name?.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Bank Selector */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank</label>
              <button onClick={() => setShowBankDropdown(!showBankDropdown)}
                className={`w-full border-2 ${showBankDropdown ? 'border-blue-500 bg-white' : 'border-gray-100 bg-gray-50'} rounded-xl px-4 py-3 flex items-center justify-between transition-all`}>
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-gray-400" />
                  <span className={`text-sm ${selectedBank ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                    {selectedBank?.name || 'Select bank'}
                  </span>
                </div>
                <span className="text-gray-400 text-xs">▼</span>
              </button>

              {showBankDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-50">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input autoFocus type="text" placeholder="Search bank..." value={bankSearch}
                        onChange={e => setBankSearch(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-gray-50 rounded-xl text-sm focus:outline-none border-2 border-transparent focus:border-blue-500" />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-52">
                    {banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase())).map(b => (
                      <button key={b.code} onClick={() => { setBankCode(b.code); setAccountName(''); setShowBankDropdown(false); setBankSearch(''); }}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ${b.code === bankCode ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
              <input type="text" value={accountNumber}
                onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setAccountName(''); }}
                onBlur={verifyAccount} placeholder="0123456789" className={inputClass} />
              {verifying && (
                <div className="flex items-center gap-2 mt-2">
                  <Loader2 size={14} className="text-blue-500 animate-spin" />
                  <p className="text-sm text-blue-500">Verifying account...</p>
                </div>
              )}
              {accountName && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-xl">
                  <CheckCircle size={14} className="text-green-600" />
                  <p className="text-sm text-green-700 font-semibold">{accountName}</p>
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Amount (NGN)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₦</span>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00" className={inputClass + ' pl-8'} />
              </div>
              {Number(amount) > 0 && (
                <p className={`text-xs mt-1 ${Number(amount) > balance ? 'text-red-500' : 'text-gray-400'}`}>
                  {Number(amount) > balance ? '⚠ Insufficient balance' : `Balance after: ₦${(balance - Number(amount)).toLocaleString()}`}
                </p>
              )}
            </div>

            {/* Narration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Narration <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" value={narration} onChange={(e) => setNarration(e.target.value)}
                placeholder="What is this for?" className={inputClass} />
            </div>

            {/* Save Recipient */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl">
              <button onClick={() => setSaveRecipient(!saveRecipient)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${saveRecipient ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}>
                {saveRecipient && <CheckCircle size={12} className="text-white" />}
              </button>
              <p className="text-sm text-gray-600">Save recipient for future transfers</p>
            </div>

            {/* Submit Button */}
            <button onClick={handleSubmit} disabled={submitting || !accountName}
              className="w-full text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 4px 15px rgba(37,99,235,0.4)' }}>
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Processing...</>
              ) : (
                <><Send size={18} /> Send Money</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-10">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Lock size={24} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Enter Transfer PIN</h3>
              <p className="text-gray-400 text-sm mt-1">Enter your 4-digit PIN to confirm</p>
            </div>
            <input type="password" maxLength={4} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full border-2 border-gray-100 rounded-2xl py-4 text-center text-3xl font-bold tracking-widest focus:outline-none focus:border-blue-500 mb-5 bg-gray-50"
              placeholder="••••" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => { setShowPinModal(false); setPin(''); }}
                className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-3.5 rounded-2xl">Cancel</button>
              <button onClick={confirmPin} disabled={pin.length < 4}
                className="flex-1 text-white font-bold py-3.5 rounded-2xl disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
