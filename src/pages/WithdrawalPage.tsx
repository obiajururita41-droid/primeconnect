import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';

interface Bank { code: string; name: string; }
interface SavedBank { id: string; bank_code: string; bank_name: string; account_number: string; account_name: string; }

export default function WithdrawalPage() {
  const { user } = useAuth();
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
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => { fetchWallet(); fetchBanks(); fetchSavedBanks(); }, []);

  async function fetchWallet() {
    const { data } = await supabase.from('wallets').select('balance, currency').eq('user_id', user?.id).eq('is_active', true).single();
    if (data) { setBalance(Number(data.balance)); setCurrency(data.currency); }
  }

  async function fetchBanks() {
    const { data, error } = await supabase.functions.invoke('flutterwave-get-banks');
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
    const { data, error } = await supabase.functions.invoke('flutterwave-verify-account', { body: { account_number: accountNumber, account_bank: bankCode } });
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
    const { data, error } = await supabase.functions.invoke('flutterwave-transfer', {
      headers: { Authorization: `Bearer ${token}` },
      body: { account_number: accountNumber, account_bank: bankCode, account_name: accountName, amount: Number(amount), narration: narration || undefined },
    });
    setSubmitting(false);
    if (error || data?.error) { setError(data?.error || 'Transfer failed. Please try again.'); return; }
    setSuccess(`Transfer initiated! Reference: ${data.reference}`);
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

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Withdraw to Bank</h1>
      <p className="text-gray-500 mb-6">Available balance: <span className="font-semibold">{currency} {balance.toLocaleString()}</span></p>

      {savedBanks.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Saved recipients</p>
          <div className="flex flex-wrap gap-2">
            {savedBanks.map((b) => (
              <button key={b.id} onClick={() => selectSavedBank(b)} className="px-3 py-2 rounded-lg border text-sm text-left hover:bg-gray-50">
                <div className="font-medium">{b.account_name}</div>
                <div className="text-xs text-gray-500">{b.bank_name} • {b.account_number}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bank</label>
          <select value={bankCode} onChange={(e) => { setBankCode(e.target.value); setAccountName(''); }} className="w-full border rounded-lg px-3 py-2">
            <option value="">Select bank</option>
            {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Account Number</label>
          <input type="text" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10)); setAccountName(''); }} onBlur={verifyAccount} placeholder="0123456789" className="w-full border rounded-lg px-3 py-2" />
          {verifying && <p className="text-sm text-gray-500 mt-1">Verifying account...</p>}
          {accountName && <p className="text-sm text-green-600 mt-1 font-medium">{accountName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount ({currency})</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Narration (optional)</label>
          <input type="text" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="What is this for?" className="w-full border rounded-lg px-3 py-2" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={saveRecipient} onChange={(e) => setSaveRecipient(e.target.checked)} />
          Save this recipient for future transfers
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}
        <button onClick={handleSubmit} disabled={submitting || !accountName} className="w-full bg-black text-white rounded-lg py-3 font-medium disabled:opacity-50">
          {submitting ? 'Processing...' : 'Send Money'}
        </button>
      </div>

      {showPinModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, width: 300, textAlign: 'center' }}>
            <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Enter Transfer PIN</h3>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Enter your 4-digit PIN to confirm</p>
            <input type="password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} style={{ width: '100%', border: '2px solid #E5E7EB', borderRadius: 12, padding: '12px', fontSize: 24, textAlign: 'center', letterSpacing: 8, marginBottom: 16, outline: 'none' }} placeholder="••••" autoFocus />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setShowPinModal(false); setPin(''); }} style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#fff', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmPin} style={{ flex: 1, padding: '12px', borderRadius: 12, background: '#2563EB', color: '#fff', fontWeight: 700, cursor: 'pointer', border: 'none' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
