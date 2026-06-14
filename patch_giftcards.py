with open('src/pages/AdminDashboard.tsx', 'r') as f:
    content = f.read()

old = '''        {/* GIFT CARDS TAB */}
        {tab === 'giftcards' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-50">
              {giftCards.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No gift card submissions</div>
              ) : giftCards.map((gc) => (
                <div key={gc.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {gc.metadata?.card_type} — {gc.metadata?.card_currency} {gc.metadata?.declared_value}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{gc.profiles?.email}</p>
                      <p className="text-xs text-gray-300 font-mono">{gc.reference}</p>
                      <p className="text-xs text-gray-400">{new Date(gc.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      gc.status === 'success' ? 'bg-green-100 text-green-700' :
                      gc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{gc.status}</span>
                  </div>
                  {gc.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => updateGiftCard(gc.id, 'success', gc.user_id, gc.reference)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve & Credit
                      </button>
                      <button
                        onClick={() => updateGiftCard(gc.id, 'failed', gc.user_id, gc.reference)}
                        className="flex-1 flex items-center justify-center gap-1 text-xs font-medium py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}'''

new = '''        {/* GIFT CARDS TAB */}
        {tab === 'giftcards' && (
          <div className="space-y-4">
            {/* Header */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-bold text-gray-900">Gift Card Submissions</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{giftCards.length} total submissions</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${(stats?.pendingGiftCards ?? 0) > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {stats?.pendingGiftCards ?? 0} pending
                </span>
              </div>
              {/* Summary Pills */}
              <div className="flex gap-2">
                <div className="flex-1 bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-yellow-600">{giftCards.filter(g => g.status === 'pending').length}</p>
                  <p className="text-[10px] text-yellow-500 font-semibold">Pending</p>
                </div>
                <div className="flex-1 bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-green-600">{giftCards.filter(g => g.status === 'success').length}</p>
                  <p className="text-[10px] text-green-500 font-semibold">Approved</p>
                </div>
                <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-black text-red-600">{giftCards.filter(g => g.status === 'failed').length}</p>
                  <p className="text-[10px] text-red-500 font-semibold">Rejected</p>
                </div>
              </div>
            </div>

            {/* Gift Card List */}
            {giftCards.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Gift className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-600 font-bold text-sm mb-1">No submissions yet</p>
                <p className="text-gray-300 text-xs">Gift card submissions will appear here</p>
              </div>
            ) : giftCards.map((gc) => (
              <div key={gc.id} className={`bg-white rounded-2xl p-4 shadow-sm border ${gc.status === 'pending' ? 'border-yellow-200' : 'border-gray-100'}`}>
                {/* Status Banner for pending */}
                {gc.status === 'pending' && (
                  <div className="flex items-center gap-2 bg-yellow-50 rounded-xl px-3 py-2 mb-3">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <p className="text-xs font-bold text-yellow-700">Awaiting Review</p>
                  </div>
                )}

                {/* Card Info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900">
                        {gc.metadata?.card_type ?? 'Gift Card'}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {gc.metadata?.card_currency} {gc.metadata?.declared_value}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{gc.profiles?.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    gc.status === 'success' ? 'bg-green-100 text-green-700' :
                    gc.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {gc.status === 'success' ? '✓ Approved' : gc.status === 'pending' ? '⏳ Pending' : '✕ Rejected'}
                  </span>
                </div>

                {/* Meta */}
                <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3">
                  <p className="text-[10px] text-gray-400 font-mono">{gc.reference}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(gc.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                {gc.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateGiftCard(gc.id, 'success', gc.user_id, gc.reference)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:opacity-90 transition-opacity shadow-sm"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Approve & Credit
                    </button>
                    <button
                      onClick={() => updateGiftCard(gc.id, 'failed', gc.user_id, gc.reference)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
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
    print('SUCCESS: Gift Cards tab patched!')
else:
    print('ERROR: Block not found.')
