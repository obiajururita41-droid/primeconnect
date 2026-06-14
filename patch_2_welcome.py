from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

old = '     <h1 className="text-2xl font-bold text-gray-900">\n            Welcome back, {profile?.full_name?.split(\' \')?.[0] ?? \'Admin\'} 👋\n          </h1>\n          <p className="text-sm text-gray-500 mt-1">Here\'s what\'s happening on PrimeConnect today.</p>\n        </div>'

new = '''        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
                  {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <h1 className="text-xl font-black text-white">
                  Welcome back, {profile?.full_name?.split(' ')?.[0] ?? 'Admin'} 👋
                </h1>
                <p className="text-blue-200 text-xs mt-1">Here\'s your PrimeConnect platform summary.</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                <span className="text-white text-lg font-black">{profile?.full_name?.charAt(0) ?? 'A'}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-white font-black text-lg">{(stats?.totalUsers ?? 0).toLocaleString()}</p>
                <p className="text-blue-200 text-[10px] font-semibold">Total Users</p>
              </div>
              <div className="text-center border-x border-white/20">
                <p className="text-white font-black text-lg">{stats?.todayTransactions ?? 0}</p>
                <p className="text-blue-200 text-[10px] font-semibold">Today\'s Txns</p>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-lg">{stats?.pendingGiftCards ?? 0}</p>
                <p className="text-blue-200 text-[10px] font-semibold">Pending Cards</p>
              </div>
            </div>
          </div>'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Welcome header improved!")
else:
    print("ERROR: Still not matching. Showing exact repr around welcome div...")
    idx = content.find('<div className="mb-6">')
    if idx != -1:
        print(repr(content[idx:idx+300]))
    else:
        print("mb-6 div not found")
