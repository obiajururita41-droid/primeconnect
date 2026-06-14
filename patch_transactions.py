with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''        {/* TRANSACTIONS TAB */}
        {tab === 'transactions' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filteredTx.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No transactions found</div>
              ) : filteredTx.map((tx) => (
                <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'credit' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                        {tx.type === 'credit'
                          ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                          : <Wallet className="w-4 h-4 text-red-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{tx.description ?? 'Transaction'}</p>
                        <p className="text-xs text-gray-400">{tx.profiles?.email} • {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-gray-300 font-mono">{tx.reference}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'credit' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tx.status === 'success' ? 'bg-green-100 text-green-700' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>{tx.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}'''

new = '''        {/* TRANSACTIONS TAB */}
        {tab === 'transactions' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">All Transactions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredTx.length} records found</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">{transactions.length} total</span>
                </div>
              </div>
              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by email, description, ref..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <select
                  className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-3 outline-none focus:border-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                  <option value="gift_card">Gift Card</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              {/* Filter Pills */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {['all','credit','debit','gift_card','success','pending','failed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
                      filter === f
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {f === 'all' ? 'All' : f === 'gift_card' ? 'Gift Card' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredTx.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Wallet className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-600 font-bold text-sm mb-1">No transactions found</p>
                  <p className="text-gray-300 text-xs">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredTx.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                          tx.type === 'credit' ? 'bg-green-100' :
                          tx.type === 'gift_card' ? 'bg-purple-100' :
                          'bg-red-100'
                        }`}>
                          {tx.type === 'credit'
                            ? <ArrowUpRight className="w-4 h-4 text-green-600" />
                            : tx.type === 'gift_card'
                            ? <Gift className="w-4 h-4 text-purple-600" />
                            : <Wallet className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{tx.description ?? 'Transaction'}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{tx.profiles?.email}</p>
                              <p className="text-[10px] text-gray-300 font-mono mt-0.5 truncate">{tx.reference}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                                {tx.type === 'credit' ? '+' : '-'}&#8358;{Number(tx.amount).toLocaleString()}
                              </p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                                tx.status === 'success' ? 'bg-green-100 text-green-700' :
                                tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {tx.status === 'success' ? '✓ Success' : tx.status === 'pending' ? '⏳ Pending' : '✕ Failed'}
                              </span>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-300 mt-1">
                            {new Date(tx.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}'''

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Transactions tab patched!')
else:
    print('ERROR: Block not found.')
