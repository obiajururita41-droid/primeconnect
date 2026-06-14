from pathlib import Path

file = Path("src/components/admin/AdminLayout.tsx")
content = file.read_text()

old = '''    return (
      <button
        key={item.key}
        onClick={() => { if (item.key === 'aihub') { navigate('/ai-hub'); }  else { onTabChange(item.key); } if (closeOnClick) setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActiveTab ? 'bg-blue-600 text-white' : 'hover:bg-gray-800 text-gray-300'
        }`}
      >
        <Icon className="w-4 h-4" />
        <span className="flex-1 text-left">{item.label}</span>
        {!!item.badge && item.badge > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{item.badge}</span>
        )}
      </button>
    );'''

new = '''    return (
      <button
        key={item.key}
        onClick={() => { if (item.key === 'aihub') { navigate('/ai-hub'); } else { onTabChange(item.key); } if (closeOnClick) setMobileOpen(false); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActiveTab
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30 scale-[1.01]'
            : 'hover:bg-gray-800/80 text-gray-400 hover:text-gray-100'
        }`}
      >
        <div className={`shrink-0 ${isActiveTab ? 'text-white' : 'text-gray-500'}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="flex-1 text-left">{item.label}</span>
        {!!item.badge && item.badge > 0 && (
          <span className={`text-xs font-bold rounded-full px-1.5 py-0.5 ${isActiveTab ? 'bg-white/30 text-white' : 'bg-red-500 text-white'}`}>
            {item.badge}
          </span>
        )}
        {isActiveTab && <div className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />}
      </button>
    );'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Sidebar active state improved!")
else:
    print("ERROR: Pattern not found.")
