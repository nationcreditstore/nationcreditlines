import React from 'react';

export default function AdminVerificationDesk({ transactions, onAdminAction, isAdmin }) {
  if (!isAdmin) return null;

  return (
    <div className="bg-[#0D121F] p-6 rounded-3xl border border-amber-500/30 space-y-6 shadow-xl">
      <div>
        <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest block mb-1">
          Control Center
        </span>
        <h3 className="text-xl font-black text-white">Admin Verification & Management Desk</h3>
        <p className="text-xs text-gray-400">Review pending user deposits, withdrawals, and monitor account tiers.</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-black text-white uppercase tracking-wider">Pending Transaction Requests</h4>
        
        {transactions.filter(t => t.status?.includes('Pending')).length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs bg-[#06080F] rounded-2xl border border-white/5">
            No pending transaction requests at this time.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.filter(t => t.status?.includes('Pending')).map(tx => (
              <div key={tx.id} className="bg-[#06080F] p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      {tx.type}
                    </span>
                    <span className="text-sm font-bold text-white">${Number(tx.amount).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    User: <strong className="text-white">{tx.userEmail}</strong> • Method: {tx.method} • {tx.date}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onAdminAction(tx.id, 'Approve')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 font-extrabold text-xs border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onAdminAction(tx.id, 'Reject')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 font-extrabold text-xs border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
