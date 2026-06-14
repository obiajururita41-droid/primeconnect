from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

old = '''          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Referrals</p>
                  <p className="text-2xl font-bold text-gray-800">{referrals.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bonus Paid</p>
                  <p className="text-2xl font-bold text-green-600">{referrals.filter(r => r.bonus_paid).length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{referrals.filter(r => !r.bonus_paid).length}</p>
                </div>
              </div>
            </div>
            {referrals.filter(r =>
              !search ||
              r.referrer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referred?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referrer?.email?.toLowerCase().includes(search.toLowerCase())
            ).length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No referrals found</div>
            ) : referrals.filter(r =>
              !search ||
              r.referrer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referred?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referrer?.email?.toLowerCase().includes(search.toLowerCase())
            ).map((r) => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 text-xs font-bold">{r.referrer?.full_name?.charAt(0) ?? 'R'}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.referrer?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{r.referrer?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-2 border-l-2 border-gray-100 ml-4">
                      <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-green-600 text-xs font-bold">{r.referred?.full_name?.charAt(0) ?? 'U'}</span>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-700">{r.referred?.full_name ?? 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{r.referred?.email}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${r.bonus_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.bonus_paid ? 'Paid' : 'Pending'}
                    </span>
                    {!r.bonus_paid && (
                      <button
                        onClick={async () => {
                          await supabase.from('referrals').update({ bonus_paid: true }).eq('id', r.id);
                          fetchReferrals();
                        }}
                        className="block mt-2 text-xs font-medium py-1 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>'''

new = '''          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total', value: referrals.length, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700' },
                { label: 'Paid', value: referrals.filter(r => r.bonus_paid).length, color: 'from-emerald-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700' },
                { label: 'Pending', value: referrals.filter(r => !r.bonus_paid).length, color: 'from-amber-500 to-orange-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
              ].map((s) => (
                <div key={s.label} className={`${s.bg} rounded-2xl p-3 text-center`}>
                  <p className={`text-2xl font-black ${s.text}`}>{s.value}</p>
                  <p className={`text-[10px] font-bold ${s.text} opacity-70`}>{s.label}</p>
                </div>
              ))}
            </div>
            {referrals.filter(r =>
              !search ||
              r.referrer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referred?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referrer?.email?.toLowerCase().includes(search.toLowerCase())
            ).length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-7 h-7 text-gray-200" />
                </div>
                <p className="text-gray-500 font-bold text-sm">No referrals found</p>
              </div>
            ) : referrals.filter(r =>
              !search ||
              r.referrer?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referred?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
              r.referrer?.email?.toLowerCase().includes(search.toLowerCase())
            ).map((r) => (
              <div key={r.id} className={`bg-white rounded-2xl shadow-sm border p-4 ${!r.bonus_paid ? 'border-yellow-200' : 'border-gray-100'}`}>
                {/* Referrer → Referred */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Referrer */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">{r.referrer?.full_name?.charAt(0) ?? 'R'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.referrer?.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.referrer?.email}</p>
                    </div>
                  </div>
                  {/* Arrow */}
                  <div className="shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  </div>
                  {/* Referred */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">{r.referred?.full_name?.charAt(0) ?? 'U'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{r.referred?.full_name ?? 'Unknown'}</p>
                      <p className="text-[10px] text-gray-400 truncate">{r.referred?.email}</p>
                    </div>
                  </div>
                </div>
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <p className="text-[10px] text-gray-400">
                    {new Date(r.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.bonus_paid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.bonus_paid ? '✓ Bonus Paid' : '⏳ Pending'}
                    </span>
                    {!r.bonus_paid && (
                      <button
                        onClick={async () => {
                          await supabase.from('referrals').update({ bonus_paid: true }).eq('id', r.id);
                          fetchReferrals();
                        }}
                        className="text-[10px] font-bold py-1 px-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Referrals tab improved!")
else:
    print("ERROR: Not found")
    idx = content.find('REFERRALS TAB')
    if idx != -1:
        print(repr(content[idx:idx+300]))
