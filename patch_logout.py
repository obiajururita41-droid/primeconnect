with open('src/components/admin/AdminLayout.tsx', 'r') as f:
    content = f.read()

# Add LogOut to lucide imports
content = content.replace(
    'import {\n  LayoutDashboard, Users, ArrowUpRight, Gift, Wallet, ArrowDownToLine,\n  Share2, Sparkles, GraduationCap, Briefcase, BarChart3, FileText,\n  Megaphone, Settings, FileClock, Search, Bell, Moon, ChevronDown, Menu, X\n} from \'lucide-react\';',
    'import {\n  LayoutDashboard, Users, ArrowUpRight, Gift, Wallet, ArrowDownToLine,\n  Share2, Sparkles, GraduationCap, Briefcase, BarChart3, FileText,\n  Megaphone, Settings, FileClock, Search, Bell, Moon, ChevronDown, Menu, X, LogOut\n} from \'lucide-react\';'
)

# Add logout to useAuth
content = content.replace(
    'const { profile } = useAuth();',
    'const { profile, logout } = useAuth();'
)

# Add logout button in desktop sidebar profile section
content = content.replace(
    '''        <div className="p-4 m-3 rounded-xl bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">{profile?.full_name?.charAt(0) ?? 'A'}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{profile?.full_name ?? 'Admin'}</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Online
              </p>
            </div>
          </div>
        </div>''',
    '''        <div className="p-4 m-3 rounded-xl bg-gray-800">
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
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>'''
)

with open('src/components/admin/AdminLayout.tsx', 'w') as f:
    f.write(content)
print('SUCCESS: Logout added!')
