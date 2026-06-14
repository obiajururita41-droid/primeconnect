with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No users found</div>
              ) : filteredUsers.map((u) => (
                <div key={u.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-600 text-sm font-bold">{u.full_name?.charAt(0) ?? 'U'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{u.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        <p className="text-xs text-gray-400">{u.phone}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-800">₦{(u.wallets?.[0]?.balance ?? 0).toLocaleString()}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => creditUser(u.id)}
                      className="flex-1 text-xs font-medium py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      Credit Wallet
                    </button>
                    <button
                      onClick={() => toggleUserStatus(u.id, u.is_active)}
                      className={`flex-1 text-xs font-medium py-2 rounded-lg transition-colors ${
                        u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}'''

new = '''        {/* USERS TAB */}
        {tab === 'users' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">User Management</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{filteredUsers.length} users found</p>
                </div>
                <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">{users.length} total</span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                />
              </div>
            </div>

            {/* Users List */}
            {filteredUsers.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-600 font-bold text-sm mb-1">No users found</p>
                <p className="text-gray-300 text-xs">Try adjusting your search</p>
              </div>
            ) : filteredUsers.map((u) => (
              <div key={u.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                {/* User Info */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-base font-bold">{u.full_name?.charAt(0) ?? 'U'}</span>
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${u.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{u.full_name ?? 'Unknown'}</p>
                      {u.is_verified && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 font-bold px-1.5 py-0.5 rounded-full shrink-0">✓ Verified</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    <p className="text-xs text-gray-400">{u.phone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-black text-gray-900">&#8358;{(u.wallets?.[0]?.balance ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Wallet balance</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-[10px] text-gray-400">
                    Joined {new Date(u.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => creditUser(u.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Wallet className="w-3.5 h-3.5" /> Credit Wallet
                  </button>
                  <button
                    onClick={() => toggleUserStatus(u.id, u.is_active)}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl transition-colors ${
                      u.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                    }`}
                  >
                    {u.is_active ? <><XCircle className="w-3.5 h-3.5" /> Deactivate</> : <><CheckCircle className="w-3.5 h-3.5" /> Activate</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}'''

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Users tab patched!')
else:
    print('ERROR: Block not found.')
