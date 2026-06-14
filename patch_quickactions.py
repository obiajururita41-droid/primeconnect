with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Approve Gift Cards', icon: <Gift className="w-4 h-4" />,      color: 'bg-pink-50 text-pink-600 border-pink-100',   onClick: () => setTab('giftcards'), badge: stats?.pendingGiftCards },
                  { label: 'Manage Users',       icon: <Users className="w-4 h-4" />,     color: 'bg-blue-50 text-blue-600 border-blue-100',   onClick: () => setTab('users'), badge: null },
                  { label: 'View Transactions',  icon: <Wallet className="w-4 h-4" />,    color: 'bg-green-50 text-green-600 border-green-100', onClick: () => setTab('transactions'), badge: null },
                  { label: 'Refresh Data',       icon: <RefreshCw className="w-4 h-4" />, color: 'bg-gray-50 text-gray-600 border-gray-100',   onClick: fetchAll, badge: null },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-95 ${a.color}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center shrink-0">
                      {a.icon}
                    </div>
                    <span className="text-sm font-semibold flex-1 text-left">{a.label}</span>
                    {a.badge ? (
                      <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {a.badge}
                      </span>
                    ) : null}
                    <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                  </button>
                ))}
              </div>
            </div>'''

new = '''            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Quick Actions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Common admin tasks</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">6 actions</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Approve Gift Cards', icon: <Gift className="w-5 h-5" />, gradient: 'from-pink-500 to-rose-500', onClick: () => setTab('giftcards'), badge: stats?.pendingGiftCards, sub: 'Review pending' },
                  { label: 'Manage Users', icon: <Users className="w-5 h-5" />, gradient: 'from-blue-500 to-blue-600', onClick: () => setTab('users'), badge: null, sub: 'View all users' },
                  { label: 'Withdrawals', icon: <ArrowUpRight className="w-5 h-5" />, gradient: 'from-orange-500 to-amber-500', onClick: () => setTab('withdrawals'), badge: withdrawals.filter(w => w.status === 'pending').length || null, sub: 'Process requests' },
                  { label: 'Transactions', icon: <Wallet className="w-5 h-5" />, gradient: 'from-emerald-500 to-green-600', onClick: () => setTab('transactions'), badge: null, sub: 'View history' },
                  { label: 'Referrals', icon: <TrendingUp className="w-5 h-5" />, gradient: 'from-violet-500 to-purple-600', onClick: () => setTab('referrals'), badge: null, sub: 'Track bonuses' },
                  { label: 'Refresh Data', icon: <RefreshCw className="w-5 h-5" />, gradient: 'from-gray-500 to-gray-600', onClick: fetchAll, badge: null, sub: 'Sync latest' },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className="relative flex flex-col items-start p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-all active:scale-95 group overflow-hidden"
                  >
                    <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full bg-gray-200/50 group-hover:scale-110 transition-transform duration-300" />
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.gradient} flex items-center justify-center text-white mb-3 shadow-sm`}>
                      {a.icon}
                    </div>
                    <span className="text-sm font-bold text-gray-800 leading-tight">{a.label}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">{a.sub}</span>
                    {a.badge ? (
                      <span className="absolute top-3 right-3 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                        {a.badge}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>'''

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Quick Actions patched!')
else:
    print('ERROR: Block not found.')
