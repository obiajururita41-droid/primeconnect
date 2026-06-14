import { useState } from 'react';
import { Gift, Upload, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const CARD_TYPES = [
  'Amazon', 'iTunes / Apple', 'Google Play', 'Steam',
  'Xbox', 'PlayStation', 'Walmart', 'eBay',
  'Visa/Mastercard Gift Card', 'Sephora',
];

const CURRENCIES = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'];

function generateRef() {
  return `PC-GC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export default function GiftCardPage() {
  const { user } = useAuth();
  const [cardType, setCardType]       = useState('');
  const [currency, setCurrency]       = useState('USD');
  const [declaredValue, setDeclaredValue] = useState('');
  const [cardCode, setCardCode]       = useState('');
  const [pin, setPin]                 = useState('');
  const [images, setImages]           = useState<File[]>([]);
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length + images.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');
    if (!cardType)       return setError('Select a gift card type');
    if (!declaredValue || Number(declaredValue) <= 0)
      return setError('Enter the card value');
    if (!cardCode)       return setError('Enter the card code/number');
    if (images.length === 0) return setError('Upload at least one image');

    setLoading(true);

    const imageUrls: string[] = [];
    for (const file of images) {
      const ext      = file.name.split('.').pop();
      const filename = `${user?.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('gift-cards')
        .upload(filename, file, { cacheControl: '3600', upsert: false });

      if (!uploadErr) {
        const { data } = supabase.storage.from('gift-cards').getPublicUrl(filename);
        imageUrls.push(data.publicUrl);
      }
    }

    if (imageUrls.length === 0) {
      setError('Image upload failed. Please try again.');
      setLoading(false);
      return;
    }

    const { error: insertErr } = await supabase.from('transactions').insert({
      user_id:     user?.id,
      type:        'gift_card',
      status:      'pending',
      amount:      0,
      description: `${cardType} ${currency} ${declaredValue} gift card`,
      reference:   generateRef(),
      metadata: {
        card_type:      cardType,
        card_currency:  currency,
        declared_value: Number(declaredValue),
        card_code:      cardCode,
        pin:            pin || null,
        image_urls:     imageUrls,
        notes:          notes || null,
        user_email:     user?.email,
      },
    });

    if (insertErr) {
      setError('Failed to submit. Please try again.');
    } else {
      setSuccess(true);
      setCardType('');
      setDeclaredValue('');
      setCardCode('');
      setPin('');
      setImages([]);
      setNotes('');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-500 text-sm mb-6">
              Your gift card is under review. We'll credit your wallet within 15–30 minutes after verification.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Submit Another Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gift Card Trading</h1>
          <p className="text-gray-500 text-sm mt-1">Trade your gift cards for instant naira credit</p>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-700">
            💡 Submit your card details. Our team reviews and credits your wallet at the best rates — typically within 30 minutes.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Type</label>
            <select
              value={cardType}
              onChange={(e) => setCardType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white"
            >
              <option value="">Select card type</option>
              {CARD_TYPES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none bg-white"
              >
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Card Value</label>
              <input
                type="number"
                value={declaredValue}
                onChange={(e) => setDeclaredValue(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Code / Number</label>
            <input
              type="text"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              placeholder="Enter card number or code"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              PIN <span className="text-gray-400 font-normal">(if applicable)</span>
            </label>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (optional)"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Images <span className="text-gray-400 font-normal">(up to 3)</span>
            </label>
            <label className="flex flex-col items-center justify-center w-full py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload images</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {images.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`card-${i}`}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting...</>
            ) : (
              <><Gift className="w-5 h-5" />Submit Gift Card</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
