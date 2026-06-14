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
  return `PC-FW-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function useFlutterwaveFunding() {
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
      description: 'Wallet funding via Flutterwave',
      reference,
      metadata:    { provider: 'flutterwave', email: userEmail },
    });

    if (txError) {
      onError('Failed to initiate transaction. Please try again.');
      return;
    }

    const initPayment = () => {
      // @ts-ignore
      FlutterwaveCheckout({
        public_key:      import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
        tx_ref:          reference,
        amount,
        currency:        'NGN',
        payment_options: 'card,banktransfer,ussd',
        customer: {
          email:        userEmail,
          phone_number: userPhone,
          name:         userName,
        },
        customizations: {
          title:       'PrimeConnect',
          description: 'Wallet Funding',
        },
        callback: async (response: { status: string; transaction_id?: number; tx_ref?: string }) => {
          if (response.status === 'successful') {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData.session?.access_token;

            const { data, error } = await supabase.functions.invoke('flutterwave-verify-transaction', {
              headers: { Authorization: `Bearer ${token}` },
              body: {
                transaction_id: response.transaction_id,
                tx_ref: response.tx_ref || reference,
              },
            });

            if (error || data?.error) {
              onError('Payment verification failed. Contact support. Ref: ' + reference);
            } else {
              onSuccess();
            }
          } else {
            await supabase
              .from('transactions')
              .update({ status: 'failed' })
              .eq('reference', reference);
            onError('Payment was not completed.');
          }
        },
        onclose: () => {},
      });
    };

    const existing = document.getElementById('flutterwave-script');
    if (existing) {
      initPayment();
    } else {
      const script = document.createElement('script');
      script.id    = 'flutterwave-script';
      script.src   = 'https://checkout.flutterwave.com/v3.js';
      script.onload = initPayment;
      document.body.appendChild(script);
    }
  }, []);

  return { fundWallet };
}
