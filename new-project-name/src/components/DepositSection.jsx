'use client';
import React, { useState } from 'react';

export default function DepositSection({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const btcWalletAddress = "bc1q525zmt5ypcqual9z3rar5wr4gc2l9v3d7qcreh";
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=bitcoin:${btcWalletAddress}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(btcWalletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white relative shadow-2xl">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg">
          ✕
        </button>

        <h2 className="text-xl font-bold mb-1">Fund Your Account</h2>
        <p className="text-sm text-slate-400 mb-6">Send Bitcoin to the secure gateway address below.</p>

        {/* Bitcoin Only Badge */}
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between">
          <span className="font-semibold text-emerald-400">Bitcoin (BTC) Network</span>
          <span className="text-xs bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded">Active</span>
        </div>

        {/* Real QR Code Image */}
        <div className="flex flex-col items-center justify-center bg-white p-3 rounded-xl mb-4 w-36 h-36 mx-auto shadow-md">
          <img src={qrCodeUrl} alt="BTC QR Code" className="w-full h-full object-contain" />
        </div>

        {/* Address & Copy Button */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 uppercase font-semibold block mb-1">Bitcoin Address</label>
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-emerald-400 truncate">{btcWalletAddress}</span>
            <button 
              type="button"
              onClick={handleCopy}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-3 py-1.5 rounded-lg text-xs transition-all shrink-0 cursor-pointer"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Deposit Amount Input */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="text-xs text-slate-400 uppercase font-semibold block mb-1">Deposit Amount (USD)</label>
            <input 
              type="number" 
              placeholder="e.g. 1000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-sm"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            I Have Made This Transfer →
          </button>
        </form>

        {successNotice && (
          <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs rounded-xl text-center">
            Transfer submitted! Pending manual admin verification.
          </div>
        )}

      </div>
    </div>
  );
}
