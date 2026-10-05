import React, { useState } from 'react';
import TradingViewChart from './TradingViewChart'; // Ensure this is in components or adjust path

export default function Dashboard({
  userProfile,
  balance,
  activeTab,
  setActiveTab,
  dashboardAssets,
  totalPnL,
  calculatedRoi,
  earningChangeRed,
  earningChangeGreen,
  tradeProgress,
  openTrades,
  balanceMultiplier,
  transactions,
  converterAmount,
  setConverterAmount,
  getConvertedValue,
  setDashboardModal
}) {
  return (
    <div className="max-w-md mx-auto px-3 py-4 space-y-4 text-white font-sans">
      
      {/* Top User Header Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center cursor-pointer">☰</div>
        </div>
        <div className="text-xs font-bold text-gray-300 tracking-wider flex items-center gap-1">
          {userProfile?.fullName || 'Trader'} <span className="text-emerald-400">✓</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
          {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'T'}
        </div>
      </div>

      {/* Dashboard Feature Navigation Sub-bar */}
      <div className="grid grid-cols-4 gap-1 bg-[#0D121F] p-1 rounded-2xl border border-white/10 text-[11px] font-bold text-center">
        <button onClick={() => setActiveTab('overview')} className={`py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400'}`}>Overview</button>
        <button onClick={() => setActiveTab('trades')} className={`py-2 rounded-xl transition-all ${activeTab === 'trades' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400'}`}>Trades</button>
        <button onClick={() => setActiveTab('transactions')} className={`py-2 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400'}`}>Txs</button>
        <button onClick={() => setActiveTab('converter')} className={`py-2 rounded-xl transition-all ${activeTab === 'converter' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400'}`}>Convert</button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <>
          {/* Balance Card */}
          <div className="bg-[#0D121F] p-5 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
            <span className="text-xs text-gray-400 font-medium block mb-1">Real Account Balance ⇄</span>
            <div className="text-3xl font-black tracking-tight mb-4">USD {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setDashboardModal('deposit')} className="py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500/30 text-emerald-400 text-xs font-extrabold transition-all">Deposit</button>
              <button onClick={() => setDashboardModal('withdraw')} className="py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all">Withdraw</button>
              <button onClick={() => setDashboardModal('upgrade')} className="py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold transition-all">Upgrade</button>
            </div>
          </div>

          {/* WHAT TO INVEST IN ROOM - 50 CURATED ASSETS */}
          <div className="bg-[#0D121F] p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl my-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">What to Invest In (Institutional Catalog)</h4>
                <p className="text-[10px] text-gray-400">50 curated global assets, cryptos, and forex pairs based on live market momentum</p>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                50 Live Signals
              </span>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {[
                { name: "Bitcoin", symbol: "BTC", category: "Core Asset", risk: "Low", price: "$77,300.00", change: "+1.24%", isUp: true, icon: "₿", color: "text-amber-500", bg: "bg-amber-500/25" },
                { name: "Ethereum", symbol: "ETH", category: "Smart Contracts", risk: "Medium", price: "$2,468.70", change: "+0.96%", isUp: true, icon: "Ξ", color: "text-purple-400", bg: "bg-purple-500/20" },
                { name: "Solana", symbol: "SOL", category: "High Growth / L1", risk: "High", price: "$104.11", change: "+2.48%", isUp: true, icon: "S", color: "text-purple-300", bg: "bg-purple-400/20" },
                { name: "Tether USD", symbol: "USDT", category: "Stablecoin", risk: "Low", price: "$1.00", change: "0.00%", isUp: true, icon: "₮", color: "text-emerald-400", bg: "bg-emerald-500/20" },
                { name: "Binance Coin", symbol: "BNB", category: "Exchange Token", risk: "Medium", price: "$612.40", change: "+1.15%", isUp: true, icon: "B", color: "text-yellow-400", bg: "bg-yellow-500/20" },
                { name: "Ripple", symbol: "XRP", category: "Payments", risk: "High", price: "$0.58", change: "-0.42%", isUp: false, icon: "✕", color: "text-blue-400", bg: "bg-blue-500/20" },
                { name: "Cardano", symbol: "ADA", category: "Smart Contracts", risk: "High", price: "$0.38", change: "+3.20%", isUp: true, icon: "₳", color: "text-indigo-400", bg: "bg-indigo-500/20" },
                { name: "Dogecoin", symbol: "DOGE", category: "Meme", risk: "High", price: "$0.12", change: "+5.40%", isUp: true, icon: "Ð", color: "text-amber-300", bg: "bg-amber-400/20" },
                { name: "Avalanche", symbol: "AVAX", category: "Layer 1", risk: "High", price: "$28.50", change: "+1.80%", isUp: true, icon: "A", color: "text-rose-400", bg: "bg-rose-500/20" },
                { name: "Chainlink", symbol: "LINK", category: "Oracle", risk: "Medium", price: "$12.40", change: "+0.75%", isUp: true, icon: "⬡", color: "text-blue-300", bg: "bg-blue-400/20" },
                { name: "Polkadot", symbol: "DOT", category: "Interoperability", risk: "Medium", price: "$4.30", change: "-1.10%", isUp: false, icon: "P", color: "text-pink-400", bg: "bg-pink-500/20" },
                { name: "Polygon", symbol: "POL", category: "Layer 2", risk: "Medium", price: "$0.42", change: "+2.10%", isUp: true, icon: "⬟", color: "text-purple-500", bg: "bg-purple-600/20" },
                { name: "Litecoin", symbol: "LTC", category: "Payments", risk: "Medium", price: "$65.20", change: "+0.45%", isUp: true, icon: "Ł", color: "text-gray-300", bg: "bg-gray-500/20" },
                { name: "Near Protocol", symbol: "NEAR", category: "AI & L1", risk: "High", price: "$4.15", change: "+4.12%", isUp: true, icon: "N", color: "text-cyan-400", bg: "bg-cyan-500/20" },
                { name: "Uniswap", symbol: "UNI", category: "DeFi", risk: "High", price: "$6.80", change: "-0.20%", isUp: false, icon: "🦄", color: "text-pink-500", bg: "bg-pink-500/20" },
                { name: "Cosmos", symbol: "ATOM", category: "Layer 1", risk: "High", price: "$4.50", change: "+1.05%", isUp: true, icon: "⚛", color: "text-indigo-300", bg: "bg-indigo-500/20" },
                { name: "Stellar", symbol: "XLM", category: "Payments", risk: "Medium", price: "$0.10", change: "+0.80%", isUp: true, icon: "*", color: "text-slate-200", bg: "bg-slate-500/20" },
                { name: "Monero", symbol: "XMR", category: "Privacy", risk: "High", price: "$158.20", change: "-0.90%", isUp: false, icon: "ɱ", color: "text-orange-400", bg: "bg-orange-500/20" },
                { name: "Ethereum Classic", symbol: "ETC", category: "Smart Contracts", risk: "High", price: "$18.40", change: "+1.25%", isUp: true, icon: "ξ", color: "text-emerald-500", bg: "bg-emerald-600/20" },
                { name: "Filecoin", symbol: "FIL", category: "Storage", risk: "High", price: "$3.50", change: "+2.40%", isUp: true, icon: "🗄", color: "text-teal-400", bg: "bg-teal-500/20" },
                { name: "Apple Inc.", symbol: "AAPL", category: "Mega-Cap Tech", risk: "Low", price: "$175.34", change: "+1.24%", isUp: true, icon: "🍎", color: "text-gray-100", bg: "bg-gray-700/30" },
                { name: "Microsoft", symbol: "MSFT", category: "Cloud & AI", risk: "Low", price: "$415.50", change: "+1.02%", isUp: true, icon: "💻", color: "text-blue-400", bg: "bg-blue-600/20" },
                { name: "NVIDIA", symbol: "NVDA", category: "Semiconductors", risk: "Medium", price: "$124.20", change: "+3.45%", isUp: true, icon: "👁", color: "text-emerald-300", bg: "bg-emerald-500/20" },
                { name: "Tesla", symbol: "TSLA", category: "EV & Energy", risk: "High", price: "$222.10", change: "-1.40%", isUp: false, icon: "⚡", color: "text-rose-400", bg: "bg-rose-500/20" },
                { name: "Amazon", symbol: "AMZN", category: "E-Commerce", risk: "Low", price: "$186.40", change: "+0.85%", isUp: true, icon: "📦", color: "text-amber-400", bg: "bg-amber-600/20" },
                { name: "Alphabet (Google)", symbol: "GOOGL", category: "AI & Search", risk: "Low", price: "$168.90", change: "+0.45%", isUp: true, icon: "🌐", color: "text-blue-300", bg: "bg-blue-500/20" },
                { name: "Meta Platforms", symbol: "META", category: "Social Media", risk: "Medium", price: "$528.10", change: "+1.80%", isUp: true, icon: "♾", color: "text-indigo-400", bg: "bg-indigo-600/20" },
                { name: "Netflix", symbol: "NFLX", category: "Streaming", risk: "Medium", price: "$680.50", change: "+2.15%", isUp: true, icon: "🎬", color: "text-red-500", bg: "bg-red-600/20" },
                { name: "AMD", symbol: "AMD", category: "Semiconductors", risk: "High", price: "$152.30", change: "+1.10%", isUp: true, icon: "🚀", color: "text-orange-500", bg: "bg-orange-600/20" },
                { name: "Intel", symbol: "INTC", category: "Hardware", risk: "High", price: "$21.50", change: "-2.30%", isUp: false, icon: "⚙", color: "text-blue-500", bg: "bg-blue-500/20" },
                { name: "JPMorgan Chase", symbol: "JPM", category: "Banking", risk: "Low", price: "$218.40", change: "+0.30%", isUp: true, icon: "🏦", color: "text-sky-400", bg: "bg-sky-500/20" },
                { name: "Visa", symbol: "V", category: "Payments", risk: "Low", price: "$278.90", change: "+0.55%", isUp: true, icon: "💳", color: "text-blue-400", bg: "bg-blue-600/20" },
                { name: "Mastercard", symbol: "MA", category: "Payments", risk: "Low", price: "$472.10", change: "+0.65%", isUp: true, icon: "💳", color: "text-orange-400", bg: "bg-orange-500/20" },
                { name: "Coca-Cola", symbol: "KO", category: "Consumer Goods", risk: "Low", price: "$69.20", change: "+0.15%", isUp: true, icon: "🥤", color: "text-red-400", bg: "bg-red-500/20" },
                { name: "PepsiCo", symbol: "PEP", category: "Consumer Goods", risk: "Low", price: "$172.40", change: "-0.10%", isUp: false, icon: "🍿", color: "text-blue-400", bg: "bg-blue-500/20" },
                { name: "Walmart", symbol: "WMT", category: "Retail", risk: "Low", price: "$78.60", change: "+0.40%", isUp: true, icon: "🛒", color: "text-yellow-500", bg: "bg-yellow-500/20" },
                { name: "Disney", symbol: "DIS", category: "Entertainment", risk: "Medium", price: "$93.40", change: "-0.80%", isUp: false, icon: "🏰", color: "text-indigo-400", bg: "bg-indigo-500/20" },
                { name: "Palantir", symbol: "PLTR", category: "AI & Defense", risk: "High", price: "$34.20", change: "+4.85%", isUp: true, icon: "🔮", color: "text-teal-300", bg: "bg-teal-500/20" },
                { name: "Coinbase", symbol: "COIN", category: "Crypto Exchange", risk: "High", price: "$182.50", change: "+3.10%", isUp: true, icon: "🪙", color: "text-blue-400", bg: "bg-blue-600/20" },
                { name: "MicroStrategy", symbol: "MSTR", category: "Bitcoin Treasury", risk: "High", price: "$145.80", change: "+6.20%", isUp: true, icon: "📈", color: "text-amber-400", bg: "bg-amber-500/20" },
                { name: "EUR/USD", symbol: "EURUSD", category: "Forex Major", risk: "Low", price: "$1.1486", change: "+0.07%", isUp: true, icon: "€", color: "text-blue-300", bg: "bg-blue-500/20" },
                { name: "GBP/USD", symbol: "GBPUSD", category: "Forex Major", risk: "Medium", price: "$1.3210", change: "+0.14%", isUp: true, icon: "£", color: "text-purple-300", bg: "bg-purple-500/20" },
                { name: "USD/JPY", symbol: "USDJPY", category: "Forex Major", risk: "Low", price: "$142.50", change: "-0.22%", isUp: false, icon: "¥", color: "text-red-300", bg: "bg-red-500/20" },
                { name: "AUD/USD", symbol: "AUDUSD", category: "Forex Major", risk: "Medium", price: "$0.6780", change: "+0.25\%", isUp: true, icon: "$", color: "text-green-300", bg: "bg-green-500/20" },
                { name: "Gold", symbol: "XAUUSD", category: "Commodities", risk: "Low", price: "$2,580.40", change: "+0.65%", isUp: true, icon: "🥇", color: "text-yellow-400", bg: "bg-yellow-500/20" },
                { name: "Silver", symbol: "XAGUSD", category: "Commodities", risk: "Medium", price: "$30.80", change: "+1.10%", isUp: true, icon: "🥈", color: "text-gray-300", bg: "bg-gray-500/20" },
                { name: "Crude Oil", symbol: "BRENT", category: "Energy", risk: "High", price: "$74.20", change: "-1.15%", isUp: false, icon: "🛢", color: "text-slate-400", bg: "bg-slate-600/20" },
                { name: "Natural Gas", symbol: "NG", category: "Energy", risk: "High", price: "$2.45", change: "+1.80%", isUp: true, icon: "🔥", color: "text-orange-400", bg: "bg-orange-500/20" },
                { name: "S&P 500 ETF", symbol: "SPY", category: "Index Fund", risk: "Low", price: "$562.10", change: "+0.45%", isUp: true, icon: "📊", color: "text-blue-400", bg: "bg-blue-500/20" },
                { name: "Nasdaq 100", symbol: "QQQ", category: "Index Fund", risk: "Medium", price: "$482.30", change: "+0.85%", isUp: true, icon: "📈", color: "text-indigo-400", bg: "bg-indigo-500/20" }
              ].map((asset) => (
                <div key={asset.symbol} className="bg-[#06080F] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${asset.bg} ${asset.color} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {asset.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-white">{asset.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-medium">{asset.symbol}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium block mt-0.5">
                        {asset.category} • Risk: <span className={asset.risk === 'High' ? 'text-rose-400 font-bold' : asset.risk === 'Medium' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>{asset.risk}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-white">{asset.price}</div>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <span className={`text-[10px] font-bold ${asset.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>{asset.change}</span>
                      <button 
                        onClick={() => setDashboardModal && setDashboardModal('deposit')}
                        className="px-3 py-1 rounded-lg bg-emerald-400 text-black font-extrabold text-[10px] shadow-sm hover:brightness-110 transition-all"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Earning & Trading Chart Room */}
          {balance > 0 && (
            <div className="bg-[#0D121F] p-5 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xl font-black">USD {totalPnL >= 0 ? `+${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-gray-400">Total Earning ({calculatedRoi}% ROI)</span>
                    <span className="text-[10px] font-extrabold text-rose-500">{earningChangeRed}</span>
                    <span className="text-[10px] font-extrabold text-emerald-400">{earningChangeGreen}</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase">ACTIVE</span>
              </div>
            </div>
          )}

          <div className="pt-2">
            <TradingViewChart />
          </div>
        </>
      )}

      {/* TRADES TAB */}
      {activeTab === 'trades' && (
        <div className="bg-[#0D121F] p-5 rounded-3xl border border-white/10 space-y-4">
          <span className="text-xs font-extrabold text-white block pb-2 border-b border-white/5">Open Market Positions</span>
          {balance > 0 ? (
            <div className="space-y-3">
              {openTrades?.map(trade => {
                const scaledTradePnl = trade.rawPnl * balanceMultiplier;
                return (
                  <div key={trade.id} className="bg-[#06080F] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{trade.type}</span>
                      <span className="text-xs font-bold text-white ml-2">{trade.pair}</span>
                      <div className="text-[10px] text-gray-400 mt-1">Size: {trade.size}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-black ${scaledTradePnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {scaledTradePnl >= 0 ? `+$${scaledTradePnl.toFixed(2)}` : `-$${Math.abs(scaledTradePnl).toFixed(2)}`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs text-gray-400 mb-3">Your account balance is $0.00. Active trades unlock upon approved deposits.</p>
              <button onClick={() => setDashboardModal('deposit')} className="px-4 py-2 bg-emerald-400 text-black font-extrabold text-xs rounded-xl">Request Deposit</button>
            </div>
          )}
        </div>
      )}

      {/* TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="bg-[#0D121F] p-5 rounded-3xl border border-white/10 space-y-4">
          <span className="text-xs font-extrabold text-white block pb-2 border-b border-white/5">Deposit & Withdrawal History</span>
          <div className="space-y-3">
            {transactions?.map(tx => (
              <div key={tx.id} className="bg-[#06080F] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">${tx.amount.toFixed(2)}</span>
                  <div className="text-[10px] text-gray-400">{tx.method} • {tx.date}</div>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">{tx.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONVERTER TAB */}
      {activeTab === 'converter' && (
        <div className="bg-[#0D121F] p-5 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">Quick Asset Converter</h3>
          <input type="number" value={converterAmount} onChange={e => setConverterAmount(e.target.value)} className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white" />
          <div className="bg-[#06080F] p-4 rounded-2xl border border-white/5 text-center mt-4">
            <span className="text-lg font-black text-emerald-400">{getConvertedValue ? getConvertedValue() : '$0.00'}</span>
          </div>
        </div>
      )}

    </div>
  );
}
