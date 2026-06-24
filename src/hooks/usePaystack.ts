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

export function usePaystackFunding() {
  const fundWallet = useCallback(async (opts: FundWalletOptions) => {
    const { amount, userEmail, userName, userPhone, userId, walletId, onSuccess, onError } = opts;

    if (amount < 100) {
      onError('Minimum funding amount is ₦100');
      return;
    }

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

    if (txError) {
      onError(`TX Error: ${txError.message}`);
      return;
    }

    const initPayment = () => {
      // @ts-ignore
      const handler = PaystackPop.setup({
        key:       import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email:     userEmail || `user-${userId}@primeconnect.ng`,
        amount:    amount * 100, // Paystack uses kobo
        currency:  'NGN',
        ref:       reference,
        firstname: userName?.split(' ')[0] || '',
        lastname:  userName?.split(' ')[1] || '',
        phone:     userPhone,
        label:     'PrimeConnect Wallet Funding',
        onClose: () => {},
        callback: async (response: { reference: string }) => {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;
          const { data, error } = await supabase.functions.invoke('paystack-verify-transaction', {
            headers: { Authorization: `Bearer ${token}` },
            body: { reference: response.reference },
          });
          if (error || data?.error) {
            onError('Payment verification failed. Contact support. Ref: ' + reference);
          } else {
            onSuccess();
          }
        },
      });
      handler.openIframe();
    };

    const existing = document.getElementById('paystack-script');
    if (existing) {
      initPayment();
    } else {
      const script = document.createElement('script');
      script.id    = 'paystack-script';
      script.src   = 'https://js.paystack.co/v1/inline.js';
      script.onload = initPayment;
      document.body.appendChild(script);
    }
  }, []);

  return { fundWallet };
}
