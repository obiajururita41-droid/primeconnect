from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

old = '''        {/* Nav Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {navItems.map((n) => (
            <button
              key={n.tab}
              onClick={() => setTab(n.tab as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === n.tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
              }`}
            >
              {n.icon}
              {n.label}
              {n.tab === 'giftcards' && (stats?.pendingGiftCards ?? 0) > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats?.pendingGiftCards}
                </span>
              )}
            </button>
          ))}
        </div>'''

new = '''        {/* Nav Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {navItems.map((n) => (
            <button
              key={n.tab}
              onClick={() => setTab(n.tab as any)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                tab === n.tab
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span className={tab === n.tab ? 'text-white' : 'text-gray-400'}>{n.icon}</span>
              {n.label}
              {!!n.badge && n.badge > 0 && (
                <span className={`min-w-[18px] h-[18px] px-1 text-[10px] font-black rounded-full flex items-center justify-center ${
                  tab === n.tab ? 'bg-white/30 text-white' : 'bg-red-500 text-white'
                }`}>
                  {n.badge}
                </span>
              )}
            </button>
          ))}
        </div>'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Nav tabs improved!")
else:
    print("ERROR: Not found, showing context...")
    idx = content.find('Nav Tabs')
    if idx != -1:
        print(repr(content[idx:idx+400]))
