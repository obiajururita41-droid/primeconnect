from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

old = '''        {/* WALLETS TAB */}
        {tab === 'wallets' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {wallets.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No wallets found</div>
              ) : wallets.filter(w =>
                !search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase())
              ).map((w) => (
                <div key={w.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-green-600 text-sm font-bold">{w.profiles?.full_name?.charAt(0) ?? 'W'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{w.profiles?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400 truncate">{w.profiles?.email}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-gray-800">&#8358;{Number(w.balance).toLocaleString()}</p>
                      <button
                        onClick={() => {
                          const amt = prompt('Set balance to:');
                          if (amt) {
                            const n = parseFloat(amt);
                            if (!isNaN(n)) supabase.from('wallets').update({ balance: n }).eq('id', w.id).then(() => fetchAll());
                          }
                        }}
                        className="text-xs font-medium py-1 px-3 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
                      >
                        Adjust
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}'''

new = '''        {/* WALLETS TAB */}
        {tab === 'wallets' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-black text-gray-900">User Wallets</h2>
                <p className="text-xs text-gray-400 mt-0.5">{wallets.length} wallets · ₦{wallets.reduce((s, w) => s + Number(w.balance), 0).toLocaleString()} total</p>
              </div>
              <div className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-xl">
                {wallets.filter(w => Number(w.balance) > 0).length} funded
              </div>
            </div>
            {wallets.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Wallet className="w-7 h-7 text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold text-sm">No wallets found</p>
              </div>
            ) : wallets.filter(w =>
              !search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase())
            ).map((w) => {
              const bal = Number(w.balance);
              const tier = bal >= 10000 ? { label: 'High', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-700' }
                : bal >= 1000 ? { label: 'Mid', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' }
                : { label: 'Low', color: 'from-gray-400 to-gray-500', bg: 'bg-gray-50', text: 'text-gray-500' };
              return (
                <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm`}>
                      <span className="text-white text-sm font-black">{w.profiles?.full_name?.charAt(0) ?? 'W'}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{w.profiles?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{w.profiles?.email}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tier.bg} ${tier.text}`}>{tier.label}</span>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Balance</p>
                      <p className="text-xl font-black text-gray-900">&#8358;{bal.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        const amt = prompt('Set balance to:');
                        if (amt) {
                          const n = parseFloat(amt);
                          if (!isNaN(n)) supabase.from('wallets').update({ balance: n }).eq('id', w.id).then(() => fetchAll());
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-xl bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-sm"
                    >
                      Adjust
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Wallets tab improved!")
else:
    print("ERROR: Pattern not found.")
