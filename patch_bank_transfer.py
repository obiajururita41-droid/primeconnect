from pathlib import Path

file = Path("src/pages/Dashboard.tsx")
content = file.read_text()

old = '''                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                        <p className="text-xs font-bold text-blue-700 mb-2">📋 How to fund via Bank Transfer</p>
                        <ol className="text-xs text-blue-600 space-y-1.5">
                          <li>1. Contact support to get your dedicated account number</li>
                          <li>2. Transfer any amount to the account</li>
                          <li>3. Your wallet is credited automatically within minutes</li>
                        </ol>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Support Email</span>
                          <span className="text-xs font-bold text-gray-800">support.primeconnect@gmail.com</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                          <span className="text-xs text-gray-500">Support Phone</span>
                          <span className="text-xs font-bold text-gray-800">+234 814 838 5682</span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-3 flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="text-xs text-white font-semibold">No BVN required — transfer and your wallet is funded instantly.</p>
                      </div>'''

new = '''                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
                        <p className="text-xs font-bold text-blue-700 mb-2">🏦 Pay via Bank Transfer</p>
                        <ol className="text-xs text-blue-600 space-y-1.5">
                          <li>1. Enter amount and tap Pay Now below</li>
                          <li>2. Select Bank Transfer in the payment popup</li>
                          <li>3. Transfer to the account shown — wallet credited instantly</li>
                        </ol>
                      </div>
                      <div className="space-y-2 mb-4">
                        {[500, 1000, 2000, 5000].map((q) => (
                          <button key={q} onClick={() => setAmount(String(q))}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                              amount === String(q) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                            }`}>
                            ₦{q.toLocaleString()}
                          </button>
                        ))}
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm">₦</span>
                          <input type="number" placeholder="Other amount" value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (!amount || Number(amount) < 100) { setError('Minimum amount is ₦100'); return; }
                          fundWallet({
                            amount: Number(amount),
                            userEmail: profile?.email ?? '',
                            userName: profile?.full_name ?? '',
                            userPhone: profile?.phone ?? '',
                            userId: user?.id ?? '',
                            walletId: wallet?.id ?? '',
                            onSuccess: () => { setShowFund(false); setAmount(''); fetchData(); },
                            onError: (msg) => setError(msg),
                          });
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm hover:opacity-90 transition-opacity shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                      >
                        🏦 Pay via Bank Transfer {amount ? `— ₦${Number(amount).toLocaleString()}` : ''}
                      </button>'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS!")
else:
    print("FAILED")
    idx = content.find('How to fund via Bank Transfer')
    if idx != -1:
        print(repr(content[idx-50:idx+100]))
