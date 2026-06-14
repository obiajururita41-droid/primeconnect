from pathlib import Path

file = Path("src/pages/Dashboard.tsx")
content = file.read_text()

old = '                    <>\n                      {/* BVN form */}\n                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4 flex items-start gap-2">\n                        <span className="text-amber-500 text-sm mt-0.5">\U0001f510</span>\n                        <p className="text-xs text-amber-700 leading-relaxed">To get a dedicated bank account, we need to verify your identity with your BVN. Your BVN is never stored or shared.</p>\n                      </div>\n\n                      <label className="block text-sm font-bold text-gray-700 mb-2">Bank Verification Number (BVN)</label>\n                      <div className="relative mb-3">\n                        <input\n                          type="text"\n                          inputMode="numeric"\n                          placeholder="Enter your 11-digit BVN"\n                          value={bvn}\n                          onChange={e => setBvn(e.target.value.replace(/\\D/g, \'\').slice(0, 11))}\n                          className="w-full px-4 py-3.5 border-2 border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:border-blue-500 bg-gray-50 transition-colors tracking-widest"\n                        />\n                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{bvn.length}/11</span>\n                      </div>'

new = '''                    <>
                      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
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
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-green-500 text-sm">✅</span>
                        <p className="text-xs text-green-700 leading-relaxed">No BVN required. Transfer and your wallet is funded instantly.</p>
                      </div>'''

if old in content:
    content = content.replace(old, new)
    # Also remove the rest of BVN form (vaError block + button + p)
    old2 = '\n\n                      {vaError && (\n                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-3">\n                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />\n                          <p className="text-xs text-red-600 font-medium">{vaError}</p>\n                        </div>\n                      )}\n\n                      <button\n                        onClick={createVirtualAccount}\n                        disabled={vaLoading || bvn.length !== 11}\n                        className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold hover:bg-blue-700 disabled:bg-blue-200 disabled:text-blue-400 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mb-3"\n                      >\n                        {vaLoading\n                          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verifying BVN...</>\n                          : \'\U0001f3e6 Get My Account Number\'}\n                      </button>\n\n                      <p className="text-center text-xs text-gray-400">\U0001f512 Your BVN is securely verified and never shared</p>'
    new2 = ''
    if old2 in content:
        content = content.replace(old2, new2)
        print("Step 2 OK: BVN button removed!")
    else:
        print("Step 2 FAILED - manual check needed")
    file.write_text(content)
    print("SUCCESS: BVN form replaced!")
else:
    print("FAILED")
