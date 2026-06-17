import { useState, useEffect } from 'react';
import { saveState, loadState, clearState } from '../../lib/sessionState';
import { MessageSquare, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

function generateRef() {
  return `PC-SMS-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

const SMS_PRICE_PER_PAGE = 5; // ₦5 per SMS page (160 chars)

export default function BulkSMSPage() {
  const { user } = useAuth();
  const [numbers, setNumbers] = useState<string[]>(() => loadState<string[]>('sms_numbers') || ['']);
  const [message, setMessage] = useState<string>(() => loadState<string>('sms_message') || '');
  const [senderId, setSenderId] = useState<string>(() => loadState<string>('sms_senderid') || 'PrimeConnect');
  const [loading, setLoading] = useState(false);
  useEffect(() => { saveState('sms_numbers', numbers); }, [numbers]);
  useEffect(() => { saveState('sms_message', message); }, [message]);
  useEffect(() => { saveState('sms_senderid', senderId); }, [senderId]);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const smsPages   = Math.ceil(message.length / 160) || 1;
  const validNums  = numbers.filter(n => /^(070|071|080|081|090|091)\d{8}$/.test(n));
  const totalCost  = validNums.length * smsPages * SMS_PRICE_PER_PAGE;

  async function callBulkSMS(action: string, payload: Record<string, any>) {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/bulk-sms`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ action, payload }),
    });
    return res.json();
  }

  const addNumber = () => setNumbers([...numbers, '']);
  const removeNumber = (i: number) => setNumbers(numbers.filter((_, idx) => idx !== i));
  const updateNumber = (i: number, val: string) => {
    const updated = [...numbers];
    updated[i] = val.replace(/\D/g, '').slice(0, 11);
    setNumbers(updated);
  };

  const handlePasteNumbers = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const parsed = raw
      .split(/[\n,;|\s]+/)
      .map(n => n.replace(/\D/g, '').slice(0, 11))
      .filter(n => n.length === 11);
    if (parsed.length > 0) setNumbers(parsed);
  };

  const handleSend = async () => {
    setError('');
    setSuccess('');

    if (validNums.length === 0) return setError('Add at least one valid Nigerian phone number');
    if (!message.trim())        return setError('Enter your message');
    if (message.length > 960)   return setError('Message too long (max 6 pages / 960 chars)');

    setLoading(true);
    const reference = generateRef();

    const { data: wallet } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', user?.id)
      .eq('is_active', true)
      .single();

    if (!wallet || wallet.balance < totalCost) {
      setError(`Insufficient balance. Need ₦${totalCost.toLocaleString()}`);
      setLoading(false);
      return;
    }

    await supabase.from('transactions').insert({
      user_id:     user?.id,
      wallet_id:   wallet.id,
      type:        'debit',
      status:      'pending',
      amount:      totalCost,
      description: `Bulk SMS to ${validNums.length} numbers`,
      reference,
      metadata:    { numbers: validNums, message, senderId },
    });

    const res = await callBulkSMS(
      validNums.length === 1 ? 'send_sms' : 'send_bulk',
      {
        to:      validNums.length === 1 ? validNums[0] : validNums,
        from:    senderId,
        message,
      }
    );

    if (res?.code === 'ok' || res?.message === 'Successfully Sent') {
      await supabase.rpc('debit_wallet', {
        p_user_id:   user?.id,
        p_amount:    totalCost,
        p_reference: reference,
      });
      setSuccess(`✅ SMS sent to ${validNums.length} number${validNums.length > 1 ? 's' : ''} successfully!`);
      setNumbers(['']);
      setMessage('');
    } else {
      await supabase.from('transactions').update({ status: 'failed' }).eq('reference', reference);
      setError(res?.message || 'Failed to send SMS. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Bulk SMS</h1>
          <p className="text-gray-500 text-sm mt-1">Send SMS to multiple Nigerian numbers instantly</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {/* Sender ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sender ID <span className="text-gray-400 font-normal">(max 11 chars)</span>
            </label>
            <input
              type="text"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value.slice(0, 11))}
              placeholder="PrimeConnect"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Phone numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Numbers ({validNums.length} valid)
            </label>
            <div className="space-y-2 mb-2">
              {numbers.map((num, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="tel"
                    value={num}
                    onChange={(e) => updateNumber(i, e.target.value)}
                    placeholder="08012345678"
                    className={`flex-1 px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                      num && !/^(070|071|080|081|090|091)\d{8}$/.test(num)
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                  />
                  {numbers.length > 1 && (
                    <button
                      onClick={() => removeNumber(i)}
                      className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addNumber}
              className="flex items-center gap-2 text-sm text-blue-600 font-medium"
            >
              <Plus className="w-4 h-4" /> Add number
            </button>

            {/* Paste bulk numbers */}
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">
                Or paste multiple numbers (comma/newline separated)
              </label>
              <textarea
                onChange={handlePasteNumbers}
                placeholder="08012345678, 09087654321, 07011223344..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none text-sm"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message ({message.length} chars / {smsPages} page{smsPages > 1 ? 's' : ''})
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">160 chars = 1 page = ₦{SMS_PRICE_PER_PAGE}/number</p>
          </div>

          {/* Cost summary */}
          {validNums.length > 0 && message && (
            <div className="p-4 bg-blue-50 rounded-xl space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Recipients</span>
                <span className="font-medium">{validNums.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">SMS pages</span>
                <span className="font-medium">{smsPages}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per SMS</span>
                <span className="font-medium">₦{SMS_PRICE_PER_PAGE}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-blue-200 pt-1 mt-1">
                <span>Total Cost</span>
                <span className="text-blue-700">₦{totalCost.toLocaleString()}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={loading || validNums.length === 0 || !message}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
            ) : (
              <><MessageSquare className="w-5 h-5" />Send SMS{validNums.length > 0 ? ` to ${validNums.length} number${validNums.length > 1 ? 's' : ''}` : ''}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
