from pathlib import Path

file = Path("src/pages/AdminDashboard.tsx")
content = file.read_text()

# Find the overview tab and add services section after stat cards
old = '''  const quickActions = [
    { label: 'Approve Gift Cards', icon: <Gift className="w-5 h-5" />,         color: 'bg-pink-50 text-pink-600',   onClick: () => setTab('giftcards') },
    { label: 'Manage Users',       icon: <Users className="w-5 h-5" />,        color: 'bg-blue-50 text-blue-600',   onClick: () => setTab('users') },
    { label: 'Transactions',       icon: <Wallet className="w-5 h-5" />,       color: 'bg-green-50 text-green-600', onClick: () => setTab('transactions') },
    { label: 'Refresh Data',       icon: <RefreshCw className="w-5 h-5" />,    color: 'bg-gray-50 text-gray-600',   onClick: fetchAll },
  ];'''

new = '''  const quickActions = [
    { label: 'Approve Gift Cards', icon: <Gift className="w-5 h-5" />,         color: 'bg-pink-50 text-pink-600',   onClick: () => setTab('giftcards') },
    { label: 'Manage Users',       icon: <Users className="w-5 h-5" />,        color: 'bg-blue-50 text-blue-600',   onClick: () => setTab('users') },
    { label: 'Transactions',       icon: <Wallet className="w-5 h-5" />,       color: 'bg-green-50 text-green-600', onClick: () => setTab('transactions') },
    { label: 'Refresh Data',       icon: <RefreshCw className="w-5 h-5" />,    color: 'bg-gray-50 text-gray-600',   onClick: fetchAll },
  ];

  const serviceStats = [
    { label: 'Airtime',      pct: 45, color: 'from-blue-500 to-blue-600',     bg: 'bg-blue-50',   text: 'text-blue-700',   icon: <Phone className="w-4 h-4" /> },
    { label: 'Data',         pct: 25, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-700', icon: <Wifi className="w-4 h-4" /> },
    { label: 'Gift Cards',   pct: 15, color: 'from-pink-500 to-rose-600',     bg: 'bg-pink-50',   text: 'text-pink-700',   icon: <Gift className="w-4 h-4" /> },
    { label: 'Virtual SMS',  pct: 10, color: 'from-amber-500 to-orange-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  icon: <MessageSquare className="w-4 h-4" /> },
    { label: 'Bulk SMS',     pct:  5, color: 'from-teal-500 to-emerald-500',  bg: 'bg-teal-50',   text: 'text-teal-700',   icon: <MessageSquare className="w-4 h-4" /> },
  ];'''

if old in content:
    content = content.replace(old, new)
    file.write_text(content)
    print("SUCCESS: serviceStats added!")
else:
    print("ERROR: Pattern not found.")
