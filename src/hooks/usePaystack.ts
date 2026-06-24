import { useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

interface FundWalletOptions {
  amount: number;
  userEmail: string;
  userName: string;
  userPhone: string;
  userId: string;
  walletId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

function generateRef(): string {
  return `PC-PS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PaystackPop) { resolve(); return; }
    const existing = document.getElementById('paystack-script');
    if (existing) { existing.addEventListener('load', () => resolve()); return; }
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(script);
  });
}

export function usePaystackFunding() {
  const fundWallet = useCallback(async (opts: FundWalletOptions) => {
    const { amount, userEmail, userName, userPhone, userId, walletId, onSuccess, onError } = opts;

    if (amount < 100) { onError('Minimum funding amount is ₦100'); return; }

    const reference = generateRef();

    const { error: txError } = await supabase.from('transactions').insert({
      user_id:     userId,
      wallet_id:   walletId,
      type:        'credit',
      status:      'pending',
      amount,
      description: 'Wallet funding via Paystack',
      reference,
      metadata:    { provider: 'paystack', email: userEmail },
    });

    if (txError) { onError(`TX Error: ${txError.message}`); return; }

    try {
      await loadPaystackScript();
    } catch {
      onError('Could not load payment system. Check your internet connection.');
      return;
    }

    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) { onError('Payment system not available. Please refresh and try again.'); return; }

    const handler = PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email:    userEmail || `user-${userId}@primeconnect.ng`,
      amount:   amount * 100,
      currency: 'NGN',
      ref:      reference,
      label:    'PrimeConnect Wallet Funding',
      onClose:  function() {},
      callback: function(response: { reference: string }) {
        const ref = response.reference;
        supabase.auth.getSession().then(({ data: sessionData }) => {
          const token = sessionData.session?.access_token;
          supabase.functions.invoke('paystack-verify-transaction', {
            headers: { Authorization: `Bearer ${token}` },
            body: { reference: ref },
          }).then(({ data, error }) => {
            if (error || data?.error) {
              onError('Payment verification failed. Contact support. Ref: ' + ref);
            } else {
              onSuccess();
            }
          });
        });
      },
    });

    handler.openIframe();
  }, []);

  return { fundWallet };
}
