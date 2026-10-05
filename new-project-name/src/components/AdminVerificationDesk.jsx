import React from 'react';

export default function AdminVerificationDesk({ transactions, onAdminAction }) {
  return (
    <div className="bg-[#121824] border border-slate-700/80 rounded-2xl p-6 mt-6 text-white shadow-xl max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          Admin Verification Desk
        </h3>
        <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
          Pending Requests: {transactions.filter(t => t.status === 'Pending Verification').length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-[#1e293b] text-xs uppercase text-slate-400 border-b border-slate-700">
            <tr>
              <th className="p-3">User Email</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Date</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-6 text-slate-500">
                  No transactions recorded yet.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3 text-slate-300 text-xs font-mono">{tx.userEmail || 'N/A'}</td>
                  <td className="p-3 font-medium text-white">{tx.type}</td>
                  <td className="p-3 text-emerald-400 font-semibold">${Number(tx.amount).toFixed(2)}</td>
                  <td className="p-3 text-slate-400">{tx.method}</td>
                  <td className="p-3 text-slate-400 text-xs">{tx.date}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      tx.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {tx.status === 'Pending Verification' ? (
                      <>
                        <button
                          onClick={() => onAdminAction(tx.id, 'Approve')}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onAdminAction(tx.id, 'Reject')}
                          className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded text-xs font-medium transition"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Completed</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
