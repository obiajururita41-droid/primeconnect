from pathlib import Path

file = Path("src/components/admin/AdminLayout.tsx")
content = file.read_text()

old = '''          {renderNav(true)}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}'''

new = '''          {renderNav(true)}
          <div className="p-4 m-3 rounded-xl bg-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0) ?? 'A'}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? 'Admin'}</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online
                </p>
              </div>
            </div>
            <button
              onClick={() => { logout(); setMobileOpen(false); }}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: Mobile logout added!")
else:
    print("ERROR: Not found, showing context...")
    idx = content.find('renderNav(true)')
    if idx != -1:
        print(repr(content[idx:idx+200]))
