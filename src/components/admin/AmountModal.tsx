import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface AmountModalProps {
  title: string;
  subtitle?: string;
  confirmLabel: string;
  onConfirm: (amount: number) => Promise<void> | void;
  onClose: () => void;
}

export default function AmountModal({ title, subtitle, confirmLabel, onConfirm, onClose }: AmountModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const num = Number(amount);
    if (!amount || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onConfirm(num);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4 pb-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} aria-label="Close">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="relative mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 py-3 rounded-xl text-sm text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !amount}
            className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:bg-blue-300 transition flex items-center justify-center gap-2"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
