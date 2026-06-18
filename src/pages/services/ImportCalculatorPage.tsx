import { useState } from 'react';
import { Package, Calculator, TrendingUp, Ship, Plane, ChevronDown, ChevronUp } from 'lucide-react';

const PRODUCT_CATEGORIES = [
  { name: 'Electronics & Gadgets', dutyRate: 0.20, levyRate: 0.01 },
  { name: 'Mobile Phones & Accessories', dutyRate: 0.10, levyRate: 0.01 },
  { name: 'Clothing & Textiles', dutyRate: 0.35, levyRate: 0.07 },
  { name: 'Shoes & Footwear', dutyRate: 0.35, levyRate: 0.07 },
  { name: 'Bags & Luggage', dutyRate: 0.35, levyRate: 0.07 },
  { name: 'Furniture & Home Decor', dutyRate: 0.25, levyRate: 0.07 },
  { name: 'Toys & Games', dutyRate: 0.20, levyRate: 0.01 },
  { name: 'Jewelry & Accessories', dutyRate: 0.35, levyRate: 0.07 },
  { name: 'Sports & Fitness Equipment', dutyRate: 0.10, levyRate: 0.01 },
  { name: 'Kitchen & Cooking Equipment', dutyRate: 0.20, levyRate: 0.05 },
  { name: 'Beauty & Personal Care', dutyRate: 0.20, levyRate: 0.05 },
  { name: 'Auto Parts & Accessories', dutyRate: 0.10, levyRate: 0.05 },
  { name: 'Building Materials', dutyRate: 0.10, levyRate: 0.05 },
  { name: 'Industrial Machinery', dutyRate: 0.05, levyRate: 0.01 },
  { name: 'Food & Beverages', dutyRate: 0.35, levyRate: 0.07 },
  { name: 'Books & Stationery', dutyRate: 0.05, levyRate: 0.00 },
  { name: 'Medical Equipment', dutyRate: 0.05, levyRate: 0.00 },
  { name: 'Solar & Power Equipment', dutyRate: 0.05, levyRate: 0.01 },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1620 },
  { code: 'CNY', symbol: '¥', rate: 224 },
  { code: 'EUR', symbol: '€', rate: 1750 },
  { code: 'GBP', symbol: '£', rate: 2050 },
];

// Air: per kg rates, Sea: per kg rates
const SHIPPING_RATES = {
  air:  { baseRate: 4500, minWeight: 0.5 },  // ₦4500 per kg by air
  sea:  { baseRate: 1200, minWeight: 10 },    // ₦1200 per kg by sea
};

const CLEARING_FEE_RATE = 0.05; // 5% of CIF value
const VAT_RATE = 0.075; // 7.5% VAT

export default function ImportCalculatorPage() {
  const [category, setCategory] = useState('');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [productValue, setProductValue] = useState('');
  const [weight, setWeight] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'air' | 'sea'>('air');
  const [result, setResult] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  function calculate() {
    if (!category || !productValue || !weight) return;

    const cat = PRODUCT_CATEGORIES.find(c => c.name === category)!;
    const valueNGN = Number(productValue) * currency.rate;
    const weightKg = Number(weight);

    // Shipping cost
    const rate = SHIPPING_RATES[shippingMethod];
    const shippingCost = Math.max(weightKg, rate.minWeight) * rate.baseRate;

    // CIF = Cost + Insurance + Freight
    const insuranceCost = valueNGN * 0.01; // 1% insurance
    const cifValue = valueNGN + shippingCost + insuranceCost;

    // Customs duty
    const customsDuty = cifValue * cat.dutyRate;

    // Levies (ETLS + NCS surcharge etc.)
    const levies = cifValue * cat.levyRate;

    // VAT on (CIF + duty + levies)
    const vatBase = cifValue + customsDuty + levies;
    const vat = vatBase * VAT_RATE;

    // Clearing/agent fee
    const clearingFee = cifValue * CLEARING_FEE_RATE;

    // Total landed cost
    const totalCost = valueNGN + shippingCost + insuranceCost + customsDuty + levies + vat + clearingFee;

    setResult({
      productValueNGN: valueNGN,
      shippingCost,
      insuranceCost,
      cifValue,
      customsDuty,
      levies,
      vat,
      clearingFee,
      totalCost,
      dutyRate: cat.dutyRate,
    });
    setShowBreakdown(true);
  }

  function fmt(n: number) {
    return '₦' + Math.round(n).toLocaleString('en-NG');
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 px-4 pt-12 pb-16">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-blue-200 text-sm">China Import Tool</p>
            <p className="text-white font-bold text-xl">Import Cost Calculator</p>
          </div>
        </div>
        <p className="text-blue-200 text-sm mt-3 max-w-md mx-auto">
          Calculate total landed cost including shipping, customs duty, and clearing fees.
        </p>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-8 space-y-4">

        {/* Input Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-4">

          {/* Product Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-sm">
              <option value="">Select category</option>
              {PRODUCT_CATEGORIES.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({(c.dutyRate * 100).toFixed(0)}% duty)</option>
              ))}
            </select>
          </div>

          {/* Currency + Product Value */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Value</label>
            <div className="flex gap-2">
              <select value={currency.code}
                onChange={e => setCurrency(CURRENCIES.find(c => c.code === e.target.value)!)}
                className="px-3 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-white text-sm font-bold w-24">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
              </select>
              <input type="number" value={productValue} onChange={e => setProductValue(e.target.value)}
                placeholder="0.00"
                className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-lg font-bold" />
            </div>
            {productValue && (
              <p className="text-xs text-gray-400 mt-1">
                ≈ ₦{Math.round(Number(productValue) * currency.rate).toLocaleString()} at ₦{currency.rate}/{currency.code}
              </p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Total Weight (KG)</label>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 text-lg font-bold" />
          </div>

          {/* Shipping Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Shipping Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setShippingMethod('air')}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${shippingMethod === 'air' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <Plane className={`w-5 h-5 ${shippingMethod === 'air' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-bold ${shippingMethod === 'air' ? 'text-blue-700' : 'text-gray-700'}`}>By Air</p>
                  <p className="text-xs text-gray-400">7-14 days</p>
                </div>
              </button>
              <button onClick={() => setShippingMethod('sea')}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${shippingMethod === 'sea' ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <Ship className={`w-5 h-5 ${shippingMethod === 'sea' ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className="text-left">
                  <p className={`text-sm font-bold ${shippingMethod === 'sea' ? 'text-blue-700' : 'text-gray-700'}`}>By Sea</p>
                  <p className="text-xs text-gray-400">30-45 days</p>
                </div>
              </button>
            </div>
          </div>

          <button onClick={calculate}
            disabled={!category || !productValue || !weight}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl flex items-center justify-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculate Total Cost
          </button>
        </div>

        {/* Result Card */}
        {result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Total */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-center">
              <p className="text-blue-100 text-sm mb-1">Total Landed Cost</p>
              <p className="text-white text-4xl font-black">{fmt(result.totalCost)}</p>
              <p className="text-blue-200 text-xs mt-1">All inclusive estimate</p>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500">Product</p>
                <p className="text-sm font-bold text-gray-800">{fmt(result.productValueNGN)}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500">Shipping</p>
                <p className="text-sm font-bold text-gray-800">{fmt(result.shippingCost)}</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-xs text-gray-500">Duty & Tax</p>
                <p className="text-sm font-bold text-gray-800">{fmt(result.customsDuty + result.levies + result.vat)}</p>
              </div>
            </div>

            {/* Breakdown Toggle */}
            <button onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-blue-600">
              Full Breakdown
              {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showBreakdown && (
              <div className="px-5 pb-5 space-y-2">
                {[
                  { label: 'Product Value', value: result.productValueNGN },
                  { label: 'Shipping Cost', value: result.shippingCost },
                  { label: 'Insurance (1%)', value: result.insuranceCost },
                  { label: `Customs Duty (${(result.dutyRate * 100).toFixed(0)}%)`, value: result.customsDuty },
                  { label: 'Levies & Surcharges', value: result.levies },
                  { label: 'VAT (7.5%)', value: result.vat },
                  { label: 'Clearing Agent Fee (5%)', value: result.clearingFee },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-bold text-gray-800">{fmt(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-black text-gray-900">Total Landed Cost</span>
                  <span className="text-sm font-black text-blue-600">{fmt(result.totalCost)}</span>
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mx-5 mb-5 p-3 bg-yellow-50 rounded-xl">
              <p className="text-xs text-yellow-700">
                ⚠️ This is an estimate only. Actual costs may vary based on current exchange rates, NCS assessment, and agent fees. Always confirm with your freight forwarder.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
