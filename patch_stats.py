with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center text-white`}>
                  {s.icon}
                </div>
                {s.trend && (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    ↑ {s.trend}
                  </span>
                )}
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>'''

new = '''        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Total Users', value: (stats?.totalUsers ?? 0).toLocaleString(), icon: <Users className="w-5 h-5" />, trend: '+12%', sub: 'Registered accounts', gradient: 'from-blue-600 to-blue-700', glow: 'shadow-blue-500/25', urgent: false },
            { label: 'Wallet Balance', value: `\u20a6${(stats?.totalWalletBalance ?? 0).toLocaleString()}`, icon: <Wallet className="w-5 h-5" />, trend: '+8%', sub: 'Total held in wallets', gradient: 'from-emerald-500 to-green-600', glow: 'shadow-green-500/25', urgent: false },
            { label: 'Total Revenue', value: `\u20a6${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, trend: '+15%', sub: 'Lifetime earnings', gradient: 'from-violet-600 to-purple-700', glow: 'shadow-purple-500/25', urgent: false },
            { label: 'Transactions', value: (stats?.totalTransactions ?? 0).toLocaleString(), icon: <ArrowUpRight className="w-5 h-5" />, trend: '+5%', sub: 'All time volume', gradient: 'from-orange-500 to-amber-600', glow: 'shadow-orange-500/25', urgent: false },
            { label: 'Pending Gift Cards', value: (stats?.pendingGiftCards ?? 0).toLocaleString(), icon: <Gift className="w-5 h-5" />, trend: None, sub: 'Awaiting review', gradient: 'from-pink-500 to-rose-600', glow: 'shadow-pink-500/25', urgent: (stats?.pendingGiftCards ?? 0) > 0 },
            { label: "Today\'s Activity", value: (stats?.todayTransactions ?? 0).toLocaleString(), icon: <Activity className="w-5 h-5" />, trend: None, sub: 'Transactions today', gradient: 'from-teal-500 to-cyan-600', glow: 'shadow-teal-500/25', urgent: false },
          ].map((s) => (
            <div key={s.label} className={`relative bg-gradient-to-br ${s.gradient} rounded-2xl p-4 shadow-lg ${s.glow} overflow-hidden group hover:-translate-y-0.5 transition-all duration-200`}>
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -right-1 -bottom-6 w-16 h-16 rounded-full bg-white/5" />
              <div className="flex items-start justify-between mb-3 relative">
                <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                  {s.icon}
                </div>
                {s.urgent ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full animate-pulse">
                    \u25cf Action needed
                  </span>
                ) : s.trend ? (
                  <span className="text-[10px] font-bold bg-white/25 text-white px-2 py-0.5 rounded-full">
                    \u25b2 {s.trend}
                  </span>
                ) : null}
              </div>
              <p className="text-2xl font-black text-white leading-none tracking-tight mb-1 relative">{s.value}</p>
              <p className="text-xs font-semibold text-white/80 mb-0.5 relative">{s.label}</p>
              <p className="text-[10px] text-white/50 relative">{s.sub}</p>
            </div>
          ))}
        </div>'''

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Stat cards patched!')
else:
    print('ERROR: Block not found. Check spacing in your file.')
