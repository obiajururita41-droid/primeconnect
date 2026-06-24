import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const ref = searchParams.get('reference') || searchParams.get('ref');
    const txStatus = searchParams.get('trxref');

    if (!ref) {
      setStatus('error');
      setMessage('Invalid payment reference.');
      return;
    }

    verifyPayment(ref);
  }, []);

  async function verifyPayment(reference: string) {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const { data, error } = await supabase.functions.invoke('paystack-verify-transaction', {
        headers: { Authorization: `Bearer ${token}` },
        body: { reference },
      });

      if (error || data?.error) {
        setStatus('error');
        setMessage('Payment verification failed. Contact support with ref: ' + reference);
      } else {
        setStatus('success');
        setMessage('Your wallet has been funded successfully!');
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Something went wrong. Please contact support.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center max-w-sm w-full">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold text-gray-900 text-lg mb-1">Verifying Payment</p>
            <p className="text-sm text-gray-400">Please wait...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="font-bold text-gray-900 text-lg mb-1">Payment Successful!</p>
            <p className="text-sm text-gray-400 mb-4">{message}</p>
            <p className="text-xs text-gray-300">Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="font-bold text-gray-900 text-lg mb-1">Verification Failed</p>
            <p className="text-sm text-gray-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-2xl text-sm font-bold"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
