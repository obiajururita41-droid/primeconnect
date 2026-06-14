with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''        {/* WITHDRAWALS TAB */}
        {tab === 'withdrawals' && (
          <div className="space-y-3">
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search withdrawals..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500"
                />
              </div>
              <select
                className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-3"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            {withdrawals.filter(w =>
              (filter === 'all' || w.status === filter) &&
              (!search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase()))
            ).length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400">No withdrawal requests found</div>
            ) : withdrawals.filter(w =>
              (filter === 'all' || w.status === filter) &&
              (!search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase()))
            ).map((w) => (
              <div key={w.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{w.profiles?.full_name ?? 'Unknown'}</p>
                    <p className="text-xs text-gray-400">{w.profiles?.email}</p>
                    <p className="text-xs text-gray-400">{w.profiles?.phone}</p>
                    <p className="text-xs text-gray-300 font-mono mt-1">{w.reference}</p>
                    <p className="text-xs text-gray-400">{new Date(w.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-gray-800">&#8358;{Number(w.amount).toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Fee: &#8358;{Number(w.fee ?? 0).toLocaleString()}</p>
                    <p className="text-xs font-medium text-green-600">Net: &#8358;{Number(w.net_amount ?? w.amount).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                      w.status === 'completed' ? 'bg-green-100 text-green-700' :
                      w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      w.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      w.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>{w.status}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-gray-500">Account Name</p>
                  <p className="text-sm font-medium text-gray-800">{w.account_name ?? 'N/A'}</p>
                </div>
                {w.rejection_reason && (
                  <div className="bg-red-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-red-500">Rejection Reason</p>
                    <p className="text-sm text-red-700">{w.rejection_reason}</p>
                  </div>
                )}
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('withdrawal_requests').update({ status: 'approved', reviewed_by: user?.id }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 text-xs font-medium py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={async () => {
                        const reason = prompt('Rejection reason:');
                        if (!reason) return;
                        await supabase.from('withdrawal_requests').update({ status: 'rejected', rejection_reason: reason, reviewed_by: user?.id }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 text-xs font-medium py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {w.status === 'approved' && (
                  <button
                    onClick={async () => {
                      await supabase.from('withdrawal_requests').update({ status: 'processing' }).eq('id', w.id);
                      fetchWithdrawals();
                    }}
                    className="w-full text-xs font-medium py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
                  >
                    Mark as Processing
                  </button>
                )}
                {w.status === 'processing' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('withdrawal_requests').update({ status: 'completed' }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 text-xs font-medium py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={async () => {
                        const reason = prompt('Failure reason:');
                        if (!reason) return;
                        await supabase.from('withdrawal_requests').update({ status: 'failed', rejection_reason: reason }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 text-xs font-medium py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Mark Failed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}'''

new = '''        {/* WITHDRAWALS TAB */}
        {tab === 'withdrawals' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">Withdrawal Requests</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{withdrawals.length} total requests</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${withdrawals.filter(w => w.status === 'pending').length > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {withdrawals.filter(w => w.status === 'pending').length} pending
                </span>
              </div>
              {/* Summary Pills */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[
                  { label: 'Pending', count: withdrawals.filter(w => w.status === 'pending').length, color: 'bg-yellow-50 text-yellow-600' },
                  { label: 'Approved', count: withdrawals.filter(w => w.status === 'approved').length, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Completed', count: withdrawals.filter(w => w.status === 'completed').length, color: 'bg-green-50 text-green-600' },
                  { label: 'Rejected', count: withdrawals.filter(w => w.status === 'rejected' || w.status === 'failed').length, color: 'bg-red-50 text-red-600' },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} rounded-xl p-2 text-center`}>
                    <p className="text-base font-black">{s.count}</p>
                    <p className="text-[10px] font-semibold">{s.label}</p>
                  </div>
                ))}
              </div>
              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <select
                  className="bg-white border border-gray-200 rounded-xl text-sm text-gray-700 px-3 outline-none focus:border-blue-500"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Withdrawal List */}
            {withdrawals.filter(w =>
              (filter === 'all' || w.status === filter) &&
              (!search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase()))
            ).length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ArrowUpRight className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-600 font-bold text-sm mb-1">No withdrawal requests</p>
                <p className="text-gray-300 text-xs">Requests will appear here</p>
              </div>
            ) : withdrawals.filter(w =>
              (filter === 'all' || w.status === filter) &&
              (!search || w.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) || w.profiles?.email?.toLowerCase().includes(search.toLowerCase()))
            ).map((w) => (
              <div key={w.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${w.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'}`}>
                {/* Pending Banner */}
                {w.status === 'pending' && (
                  <div className="flex items-center gap-2 bg-yellow-50 rounded-xl px-3 py-2 mb-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-yellow-700">Awaiting Approval</p>
                  </div>
                )}

                {/* User + Amount */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-black">{w.profiles?.full_name?.charAt(0) ?? 'U'}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{w.profiles?.full_name ?? 'Unknown'}</p>
                      <p className="text-xs text-gray-400 truncate">{w.profiles?.email}</p>
                      <p className="text-xs text-gray-400">{w.profiles?.phone}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-gray-900">&#8358;{Number(w.amount).toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">Fee: &#8358;{Number(w.fee ?? 0).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-green-600">Net: &#8358;{Number(w.net_amount ?? w.amount).toLocaleString()}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      w.status === 'completed' ? 'bg-green-100 text-green-700' :
                      w.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      w.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      w.status === 'processing' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>{w.status}</span>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-3">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Bank Details</p>
                  <p className="text-sm font-bold text-gray-800">{w.account_name ?? 'N/A'}</p>
                  <p className="text-xs text-gray-400">{w.bank_name ?? ''} {w.account_number ? `• ${w.account_number}` : ''}</p>
                  <p className="text-[10px] text-gray-300 font-mono mt-1">{w.reference}</p>
                  <p className="text-[10px] text-gray-400">{new Date(w.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>

                {/* Rejection Reason */}
                {w.rejection_reason && (
                  <div className="bg-red-50 rounded-xl p-3 mb-3 border border-red-100">
                    <p className="text-[10px] text-red-500 font-semibold uppercase tracking-wide mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-700">{w.rejection_reason}</p>
                  </div>
                )}

                {/* Actions */}
                {w.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('withdrawal_requests').update({ status: 'approved', reviewed_by: user?.id }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={async () => {
                        const reason = prompt('Rejection reason:');
                        if (!reason) return;
                        await supabase.from('withdrawal_requests').update({ status: 'rejected', rejection_reason: reason, reviewed_by: user?.id }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                )}
                {w.status === 'approved' && (
                  <button
                    onClick={async () => {
                      await supabase.from('withdrawal_requests').update({ status: 'processing' }).eq('id', w.id);
                      fetchWithdrawals();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 transition-colors"
                  >
                    Mark as Processing
                  </button>
                )}
                {w.status === 'processing' && (
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await supabase.from('withdrawal_requests').update({ status: 'completed' }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                    <button
                      onClick={async () => {
                        const reason = prompt('Failure reason:');
                        if (!reason) return;
                        await supabase.from('withdrawal_requests').update({ status: 'failed', rejection_reason: reason }).eq('id', w.id);
                        fetchWithdrawals();
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Mark Failed
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}'''

if old in content:
    content = content.replace(old, new)
    with open('src/pages/AdminDashboard.tsx', 'w') as f:
        f.write(content)
    print('SUCCESS: Withdrawals tab patched!')
else:
    print('ERROR: Block not found.')
