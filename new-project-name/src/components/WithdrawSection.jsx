import React from 'react';

export default function WithdrawSection({ 
  isOpen, 
  onClose, 
  amount, 
  setAmount, 
  selectedMethod, 
  setSelectedMethod, 
  onSubmit, 
  balance 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#121824] border border-slate-700 rounded-2xl w-full max-w-md p-6 text-white shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-xl font-bold"
        >
          &times;
        </button>

        <h3 className="text-xl font-semibold mb-2">Withdraw Funds</h3>
        <p className="text-sm text-slate-400 mb-4">Available Balance: ${balance.toFixed(2)}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">Withdrawal Method</label>
            <select 
              value={selectedMethod} 
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="crypto">Crypto Wallet</option>
              <option value="bank">Bank Account</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Amount ($ USD)</label>
            <input 
              type="number" 
              placeholder="0.00" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition"
          >
            Request Withdrawal
          </button>
        </form>
      </div>
    </div>
  );
}
