with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-800">Recent Activity</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Latest platform transactions</p>
                </div>
                <button onClick={() => setTab('transactions')} className="text-xs text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">View all →</button>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-7 h-7 text-gray-200" />
                  </div>
                  <p className="text-gray-500 text-sm font-semibold mb-1">No activity yet</p>
                  <p className="text-gray-300 text-xs">Transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {transactions.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit' ? 'bg-green-50' : tx.type === 'gift_card' ? 'bg-purple-50' : 'bg-red-50'
                      }`}>
                        {tx.type === 'credit' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> :
                         tx.type === 'gift_card' ? <Gift className="w-4 h-4 text-purple-600" /> :
                         <Wallet className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{tx.description ?? 'Transaction'}</p>
                        <p className="text-[11px] text-gray-400 truncate">{tx.profiles?.email} • {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tx.status === 'success' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>{tx.status === 'success' ? '✓ Success' : tx.status === 'pending' ? '⏳ Pending' : '✕ Failed'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}'''

new = '''            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">Recent Activity</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Latest platform transactions</p>
                </div>
                <button onClick={() => setTab('transactions')} className="text-xs text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">View all →</button>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-600 text-sm font-bold mb-1">No activity yet</p>
                  <p className="text-gray-300 text-xs">Transactions will appear here once users start transacting</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {transactions.slice(0, 8).map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-xl transition-colors">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit' ? 'bg-green-100' :
                        tx.type === 'gift_card' ? 'bg-purple-100' :
                        tx.type === 'debit' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {tx.type === 'credit' ? <ArrowUpRight className="w-4 h-4 text-green-600" /> :
                         tx.type === 'gift_card' ? <Gift className="w-4 h-4 text-purple-600" /> :
                         <Wallet className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{tx.description ?? 'Transaction'}</p>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {tx.profiles?.email} • {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}&#8358;{Number(tx.amount).toLocaleString()}
                        </p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 inline-block ${
                          tx.status === 'success' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tx.status === 'success' ? '✓ Success' : tx.status === 'pending' ? '⏳ Pending' : '✕ Failed'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}'''

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Recent Activity patched!')
else:
    print('ERROR: Block not found.')
