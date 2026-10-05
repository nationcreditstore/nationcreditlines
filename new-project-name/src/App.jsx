import React, { useState, useEffect, useRef } from 'react';
import FloatingChat from './components/FloatingChat';
import { auth, db } from './firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  updateDoc, 
  getDoc,
  setDoc,
  query, 
  orderBy,
  getDocs 
} from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import AdminVerificationDesk from './components/AdminVerificationDesk';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';

emailjs.init("f9VGQ1sU_T5JTj99k");

/*
|--------------------------------------------------------------------------
| LIVE CRYPTO CONFIGURATION
|--------------------------------------------------------------------------
*/

const LIVE_CRYPTO_SYMBOLS = [
  'btcusdt',
  'ethusdt',
  'solusdt',
  'bnbusdt',
  'xrpusdt',
  'adausdt',
  'avaxusdt',
  'dogeusdt',
  'linkusdt',
  'dotusdt'
];

const BINANCE_STREAM_URL =
  `wss://stream.binance.com:9443/stream?streams=${
    LIVE_CRYPTO_SYMBOLS.map(symbol => `${symbol}@ticker`).join('/')
  }`;

/*
|--------------------------------------------------------------------------
| Price formatter
|--------------------------------------------------------------------------
*/

function formatAssetPrice(price) {
  if (price === null || price === undefined || Number.isNaN(Number(price))) {
    return 'Loading...';
  }

  const numericPrice = Number(price);

  if (numericPrice >= 1000) {
    return numericPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  if (numericPrice >= 10) {
    return numericPrice.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  if (numericPrice >= 1) {
    return numericPrice.toFixed(4);
  }

  return numericPrice.toFixed(6);
}

/*
|--------------------------------------------------------------------------
| Native Real-Time Streaming Ticker
|--------------------------------------------------------------------------
*/

function TradingViewTicker({ assets, cryptoConnected }) {
  const cryptoAssets = assets.filter(
    asset => asset.category === 'Cryptocurrency'
  );

  return (
    <div className="w-full bg-[#080B13] border-b border-white/5 py-2 overflow-hidden shrink-0 flex items-center relative">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-custom {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-custom:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="absolute left-2 z-10 flex items-center gap-1.5 bg-[#080B13] pr-3">
        <span
          className={`w-2 h-2 rounded-full ${
            cryptoConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
          }`}
        />
        <span
          className={`text-[9px] font-black uppercase tracking-wider ${
            cryptoConnected ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {cryptoConnected ? 'LIVE' : 'RECONNECTING'}
        </span>
      </div>

      <div className="animate-marquee-custom whitespace-nowrap gap-8 items-center px-4 pl-28">
        {cryptoAssets.concat(cryptoAssets).map((asset, idx) => {
          const hasPrice =
            asset.price !== null &&
            asset.price !== undefined &&
            !Number.isNaN(Number(asset.price));

          const change =
            asset.changeNum !== null &&
            asset.changeNum !== undefined &&
            !Number.isNaN(Number(asset.changeNum))
              ? Number(asset.changeNum)
              : null;

          const isUp = change !== null ? change >= 0 : true;

          return (
            <div
              key={`${asset.symbol}-${idx}`}
              className="flex items-center gap-2 text-xs font-bold shrink-0"
            >
              <span className="text-gray-400">{asset.symbol}</span>
              <span className="text-white">
                {hasPrice ? `$${formatAssetPrice(asset.price)}` : 'Loading...'}
              </span>
              {change !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    isUp
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-rose-400 bg-rose-500/10'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {change.toFixed(2)}%
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Main TradingView Chart
|--------------------------------------------------------------------------
*/

function TradingViewChart() {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "450",
      symbol: "BINANCE:BTCUSDT",
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: true,
      calendar: false,
      support_host: "https://www.tradingview.com"
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isMounted]);

  return (
    <div className="w-full bg-[#0D121F] rounded-3xl overflow-hidden border border-white/10 shadow-2xl my-4">
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: "450px", width: "100%" }}
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| Mini TradingView Chart
|--------------------------------------------------------------------------
*/

function MiniTradingViewChart({ symbol = "BINANCE:BTCUSDT" }) {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const script = document.createElement('script');
    script.src =
      'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: "260",
      symbol: symbol,
      interval: "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com"
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [isMounted, symbol]);

  return (
    <div className="w-full bg-[#06080F] rounded-2xl overflow-hidden border border-white/10 my-3">
      <div
        className="tradingview-widget-container"
        ref={containerRef}
        style={{ height: "260px", width: "100%" }}
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TradingView Market News Widget Component
|--------------------------------------------------------------------------
*/
function TradingViewNewsWidget() {
  const containerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      feedMode: "all_symbols",
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "regular",
      width: "100%",
      height: "550",
      locale: "en"
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [isMounted]);

  return (
    <div className="w-full bg-[#0D121F] rounded-3xl overflow-hidden border border-white/10 shadow-2xl p-4 my-4">
      <div className="tradingview-widget-container" ref={containerRef} style={{ width: "100%", height: "550px" }} />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MAIN APP
|--------------------------------------------------------------------------
*/

export default function App() {
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const [currentView, setCurrentView] = useState('landing');
  const [authModal, setAuthModal] = useState(null);
  const [authError, setAuthError] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const [directResetLink, setDirectResetLink] = useState('');

  const [userProfile, setUserProfile] = useState({
    fullName: 'Trader',
    email: 'trader@example.com'
  });

  const [dashboardModal, setDashboardModal] = useState(null);
  const [dashboardAmount, setDashboardAmount] = useState('');
  
  const [selectedDepositMethod, setSelectedDepositMethod] = useState('bitcoin');
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pendingActionType, setPendingActionType] = useState(null);
  const [pinError, setPinError] = useState('');

  const [loanAmount, setLoanAmount] = useState('2000');
  const [loanNotice, setLoanNotice] = useState('');
  const [loanError, setLoanError] = useState('');

  const [balance, setBalance] = useState(0.00);
  const [transactions, setTransactions] = useState([]);
  const [depositSuccessNotice, setDepositSuccessNotice] = useState('');

  // VIP Form State
  const [vipFormSent, setVipFormSent] = useState(false);

  const [tradeProgress, setTradeProgress] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);

  const [activeTab, setActiveTab] = useState('overview');

  const [converterAmount, setConverterAmount] = useState('100');
  const [converterFrom, setConverterFrom] = useState('USD');
  const [converterTo, setConverterTo] = useState('BTC');

  const [searchQuery, setSearchQuery] = useState('');
  const [cryptoConnected, setCryptoConnected] = useState(false);

  const [calcAmount, setCalcAmount] = useState('5000');
  const [calcTierRate, setCalcTierRate] = useState(15);
  const [calcMonths, setCalcMonths] = useState(6);

  const ADMIN_EMAIL = 'Wham13588@gmail.com';
  const isAdmin = userProfile.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const depositDetails = {
    usdt: {
      name: 'USDT (TRC20 / ERC20)',
      address: '0x382Dbff9f5c00df7D11c4Fc5Dd3Ec8c5dd959E2C',
      instructions: 'Send only USDT to this address. Minimum deposit: $50.'
    },
    btc: {
      name: 'Bitcoin (BTC)',
      address: 'bc1q525zmt5ypcqual9z3rar5wr4gc2l9v3d7qcreh',
      instructions: 'Network confirmations required: 1. Minimum deposit: $100.'
    },
    eth: {
      name: 'Ethereum (ETH)',
      address: '0x382Dbff9f5c00df7D11c4Fc5Dd3Ec8c5dd959E2C',
      instructions: 'Send ETH or ERC-20 tokens only.'
    },
    wire: {
      name: 'Bank Wire Transfer',
      address: 'SWIFT: ContactsupportXXX | Acc: Contact support',
      instructions: 'Include your Account ID (xxxx) in the wire reference description.'
    }
  };

  const currentDepositOption = depositDetails[selectedDepositMethod] || depositDetails.usdt;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(currentDepositOption.address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2500);
  };

  const [dashboardAssets, setDashboardAssets] = useState([
    {
      id: 1,
      name: "Bitcoin",
      symbol: "BTC",
      binanceSymbol: "btcusdt",
      tvSymbol: "BINANCE:BTCUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Digital Assets",
      yield: "Staking 4.2%",
      cap: "$1.2T",
      risk: "Moderate",
      logoUrl: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      id: 2,
      name: "Ethereum",
      symbol: "ETH",
      binanceSymbol: "ethusdt",
      tvSymbol: "BINANCE:ETHUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Smart Contracts",
      yield: "Staking 3.8%",
      cap: "$420B",
      risk: "Moderate",
      logoUrl: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      id: 3,
      name: "Solana",
      symbol: "SOL",
      binanceSymbol: "solusdt",
      tvSymbol: "BINANCE:SOLUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "High-Speed L1",
      yield: "Staking 6.5%",
      cap: "$65B",
      risk: "High",
      logoUrl: "https://assets.coingecko.com/coins/images/4128/large/solana.png",
      color: "text-teal-400",
      bg: "bg-teal-500/10"
    },
    {
      id: 4,
      name: "Binance Coin",
      symbol: "BNB",
      binanceSymbol: "bnbusdt",
      tvSymbol: "BINANCE:BNBUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Exchange Token",
      yield: "Launchpool",
      cap: "$89B",
      risk: "Moderate",
      logoUrl: "https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
      color: "text-yellow-400",
      bg: "bg-yellow-500/10"
    },
    {
      id: 5,
      name: "Ripple",
      symbol: "XRP",
      binanceSymbol: "xrpusdt",
      tvSymbol: "BINANCE:XRPUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Cross-Border",
      yield: "N/A",
      cap: "$32B",
      risk: "High",
      logoUrl: "https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      id: 6,
      name: "Cardano",
      symbol: "ADA",
      binanceSymbol: "adausdt",
      tvSymbol: "BINANCE:ADAUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Proof-of-Stake",
      yield: "Staking 3.0%",
      cap: "$15B",
      risk: "Low-Moderate",
      logoUrl: "https://assets.coingecko.com/coins/images/975/large/cardano.png",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      id: 7,
      name: "Avalanche",
      symbol: "AVAX",
      binanceSymbol: "avaxusdt",
      tvSymbol: "BINANCE:AVAXUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Subnets",
      yield: "Staking 5.1%",
      cap: "$11B",
      risk: "High",
      logoUrl: "https://assets.coingecko.com/coins/images/12559/large/Avalanche_Circle_RedWhite_Trans.png",
      color: "text-rose-400",
      bg: "bg-rose-500/10"
    },
    {
      id: 8,
      name: "Dogecoin",
      symbol: "DOGE",
      binanceSymbol: "dogeusdt",
      tvSymbol: "BINANCE:DOGEUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Meme",
      yield: "N/A",
      cap: "$17B",
      risk: "Very High",
      logoUrl: "https://assets.coingecko.com/coins/images/5/large/dogecoin.png",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      id: 9,
      name: "Chainlink",
      symbol: "LINK",
      binanceSymbol: "linkusdt",
      tvSymbol: "BINANCE:LINKUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Oracle",
      yield: "Node Rewards",
      cap: "$10B",
      risk: "Moderate",
      logoUrl: "https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10"
    },
    {
      id: 10,
      name: "Polkadot",
      symbol: "DOT",
      binanceSymbol: "dotusdt",
      tvSymbol: "BINANCE:DOTUSDT",
      price: null,
      changeNum: null,
      isUp: true,
      category: "Cryptocurrency",
      sector: "Interoperability",
      yield: "Staking 11%",
      cap: "$9B",
      risk: "High",
      logoUrl: "https://assets.coingecko.com/coins/images/12171/large/polkadot.png",
      color: "text-pink-400",
      bg: "bg-pink-500/10"
    },
    {
      id: 11,
      name: "Apple Inc.",
      symbol: "AAPL",
      tvSymbol: "NASDAQ:AAPL",
      price: 175.34,
      changeNum: 1.24,
      isUp: true,
      category: "Global Equity",
      sector: "Technology",
      yield: "0.55%",
      cap: "$2.7T",
      risk: "Low",
      logoUrl: "https://logo.clearbit.com/apple.com",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      id: 12,
      name: "Microsoft Corporation",
      symbol: "MSFT",
      tvSymbol: "NASDAQ:MSFT",
      price: 415.50,
      changeNum: 1.02,
      isUp: true,
      category: "Global Equity",
      sector: "Technology",
      yield: "0.7%",
      cap: "$3.1T",
      risk: "Low",
      logoUrl: "https://logo.clearbit.com/microsoft.com",
      color: "text-teal-400",
      bg: "bg-teal-500/10"
    },
    {
      id: 13,
      name: "NVIDIA Corporation",
      symbol: "NVDA",
      tvSymbol: "NASDAQ:NVDA",
      price: 880.20,
      changeNum: 4.65,
      isUp: true,
      category: "Global Equity",
      sector: "Semiconductors",
      yield: "0.04%",
      cap: "$2.2T",
      risk: "Moderate",
      logoUrl: "https://logo.clearbit.com/nvidia.com",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      id: 14,
      name: "Amazon.com Inc.",
      symbol: "AMZN",
      tvSymbol: "NASDAQ:AMZN",
      price: 182.10,
      changeNum: 0.95,
      isUp: true,
      category: "Global Equity",
      sector: "Consumer Cyclical",
      yield: "N/A",
      cap: "$1.9T",
      risk: "Low-Moderate",
      logoUrl: "https://logo.clearbit.com/amazon.com",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      id: 15,
      name: "Tesla Inc.",
      symbol: "TSLA",
      tvSymbol: "NASDAQ:TSLA",
      price: 172.80,
      changeNum: -2.40,
      isUp: false,
      category: "Global Equity",
      sector: "Automotive / EV",
      yield: "N/A",
      cap: "$550B",
      risk: "High",
      logoUrl: "https://logo.clearbit.com/tesla.com",
      color: "text-red-500",
      bg: "bg-red-500/10"
    },
    {
      id: 16,
      name: "EUR / USD",
      symbol: "EURUSD",
      tvSymbol: "FX_IDC:EURUSD",
      price: 1.0892,
      changeNum: -0.11,
      isUp: false,
      category: "Forex Pair",
      sector: "Foreign Exchange",
      yield: "N/A",
      cap: "Global Liquidity",
      risk: "Low-Moderate",
      logoUrl: "https://flagcdn.com/w40/eu.png",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10"
    },
    {
      id: 17,
      name: "GBP / USD",
      symbol: "GBPUSD",
      tvSymbol: "FX_IDC:GBPUSD",
      price: 1.2710,
      changeNum: 0.32,
      isUp: true,
      category: "Forex Pair",
      sector: "Foreign Exchange",
      yield: "N/A",
      cap: "Global Liquidity",
      risk: "Moderate",
      logoUrl: "https://flagcdn.com/w40/gb.png",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      id: 18,
      name: "USD / JPY",
      symbol: "USDJPY",
      tvSymbol: "FX_IDC:USDJPY",
      price: 155.40,
      changeNum: 0.45,
      isUp: true,
      category: "Forex Pair",
      sector: "Foreign Exchange",
      yield: "N/A",
      cap: "Global Liquidity",
      risk: "Moderate",
      logoUrl: "https://flagcdn.com/w40/jp.png",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      id: 19,
      name: "Gold Spot",
      symbol: "XAUUSD",
      tvSymbol: "OANDA:XAUUSD",
      price: 2340.50,
      changeNum: 0.85,
      isUp: true,
      category: "Commodities",
      sector: "Precious Metals",
      yield: "Safe Haven",
      cap: "$15T",
      risk: "Low",
      logoUrl: "https://images.credly.com/images/041ef6a7-b2e1-43e5-8f6a-f3dcd142568a/large.png",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      id: 20,
      name: "Silver Spot",
      symbol: "XAGUSD",
      tvSymbol: "OANDA:XAGUSD",
      price: 29.40,
      changeNum: 1.40,
      isUp: true,
      category: "Commodities",
      sector: "Precious Metals",
      yield: "Industrial",
      cap: "$1.6T",
      risk: "Moderate",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/2952/2952136.png",
      color: "text-gray-300",
      bg: "bg-gray-400/10"
    },
    {
      id: 21,
      name: "Crude Oil WTI",
      symbol: "USOIL",
      tvSymbol: "TVC:USOIL",
      price: 78.20,
      changeNum: -1.10,
      isUp: false,
      category: "Commodities",
      sector: "Energy",
      yield: "Futures",
      cap: "Global Energy",
      risk: "Moderate-High",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/272/272346.png",
      color: "text-red-400",
      bg: "bg-red-500/10"
    },
    {
      id: 22,
      name: "Natural Gas",
      symbol: "NATGAS",
      tvSymbol: "NYMEX:NG1!",
      price: 2.45,
      changeNum: 3.20,
      isUp: true,
      category: "Commodities",
      sector: "Energy",
      yield: "Futures",
      cap: "$250B",
      risk: "High",
      logoUrl: "https://cdn-icons-png.flaticon.com/512/1149/1149751.png",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      id: 23,
      name: "S&P 500 Index",
      symbol: "SPX",
      tvSymbol: "FOREXCOM:SPXUSD",
      price: 5240.10,
      changeNum: 0.75,
      isUp: true,
      category: "Indices",
      sector: "US Large Cap",
      yield: "1.3%",
      cap: "$40T",
      risk: "Low",
      logoUrl: "https://logo.clearbit.com/spglobal.com",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      id: 24,
      name: "Nasdaq 100",
      symbol: "NDX",
      tvSymbol: "FOREXCOM:NSXUSD",
      price: 18450.00,
      changeNum: 1.10,
      isUp: true,
      category: "Indices",
      sector: "US Tech Growth",
      yield: "0.8%",
      cap: "$20T",
      risk: "Moderate",
      logoUrl: "https://logo.clearbit.com/nasdaq.com",
      color: "text-teal-400",
      bg: "bg-teal-500/10"
    },
    {
      id: 25,
      name: "Dow Jones Industrial",
      symbol: "DJI",
      tvSymbol: "FOREXCOM:DJI",
      price: 39120.00,
      changeNum: 0.35,
      isUp: true,
      category: "Indices",
      sector: "US Blue Chip",
      yield: "2.1%",
      cap: "$15T",
      risk: "Low-Moderate",
      logoUrl: "https://logo.clearbit.com/dowjones.com",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    }
  ]);

  useEffect(() => {
    let socket = null;
    let reconnectTimer = null;
    let manuallyClosed = false;

    const connect = () => {
      if (manuallyClosed) return;
      setCryptoConnected(false);

      try {
        socket = new WebSocket(BINANCE_STREAM_URL);

        socket.onopen = () => {
          setCryptoConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const ticker = message?.data;
            if (!ticker) return;

            const streamSymbol = ticker.s?.toLowerCase();
            if (!streamSymbol) return;

            const livePrice = Number.parseFloat(ticker.c);
            const liveChange = Number.parseFloat(ticker.P);

            if (!Number.isFinite(livePrice) || !Number.isFinite(liveChange)) {
              return;
            }

            setDashboardAssets(prevAssets => {
              let changed = false;
              const updatedAssets = prevAssets.map(asset => {
                if (asset.binanceSymbol !== streamSymbol) {
                  return asset;
                }
                changed = true;
                return {
                  ...asset,
                  price: livePrice,
                  changeNum: liveChange,
                  isUp: liveChange >= 0,
                  lastUpdated: Date.now()
                };
              });
              return changed ? updatedAssets : prevAssets;
            });
          } catch (error) {
            console.error('Error parsing live Binance ticker:', error);
          }
        };

        socket.onerror = () => {
          setCryptoConnected(false);
        };

        socket.onclose = () => {
          setCryptoConnected(false);
          if (!manuallyClosed) {
            reconnectTimer = setTimeout(() => {
              connect();
            }, 3000);
          }
        };
      } catch (error) {
        setCryptoConnected(false);
        if (!manuallyClosed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      manuallyClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) socket.close();
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTransactions(txs);
    }, (error) => {
      console.error("Error fetching Firestore transactions:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const userRef = doc(db, 'users', auth.currentUser.uid);

    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance || 0);
      } else {
        setDoc(userRef, { email: auth.currentUser.email, balance: 0 }, { merge: true });
      }
    });

    return () => unsubscribeUser();
  }, [auth.currentUser]);

  const filteredAssets = dashboardAssets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [openTrades, setOpenTrades] = useState([
    {
      id: 1,
      pair: "BTC/USD",
      type: "BUY",
      entry: "64,210.00",
      size: "0.45 BTC",
      rawPnl: 342.50,
      isProfit: true
    },
    {
      id: 2,
      pair: "ETH/USD",
      type: "BUY",
      entry: "3,480.00",
      size: "4.20 ETH",
      rawPnl: 118.20,
      isProfit: true
    },
    {
      id: 3,
      pair: "EUR/USD",
      type: "SELL",
      entry: "1.0892",
      size: "10,000 EUR",
      rawPnl: -14.30,
      isProfit: false
    }
  ]);

  const balanceMultiplier = balance > 0 ? balance / 1000 : 0;

  const totalPnL =
    balance > 0
      ? openTrades.reduce((acc, t) => acc + t.rawPnl, 0) * balanceMultiplier
      : 0.00;

  const calculatedRoi =
    balance > 0 ? ((totalPnL / balance) * 100).toFixed(2) : "0.00";

  const accountTypes = [
    {
      id: "starter",
      name: "Starter",
      min: "$500",
      rate: 10,
      popular: false,
      features: [
        "8-12% estimated monthly returns",
        "Basic Bitcoin accumulation",
        "Automated dollar-cost averaging",
        "Email support"
      ]
    },
    {
      id: "apex-pro",
      name: "Apex Pro Trader",
      min: "$5,000",
      rate: 18,
      popular: true,
      features: [
        "15-22% estimated monthly returns",
        "AI-powered trading strategies",
        "Bitcoin staking rewards",
        "Priority 24/7 support"
      ]
    },
    {
      id: "apex-vip",
      name: "Apex VIP",
      min: "$20,000",
      rate: 25,
      popular: false,
      features: [
        "20-30% estimated monthly returns",
        "Institutional-grade strategies",
        "Dedicated account manager",
        "VIP withdrawal processing"
      ]
    }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUserProfile({
          fullName:
            currentUser.displayName ||
            currentUser.email?.split('@')[0] ||
            'Trader',
          email: currentUser.email || 'trader@example.com'
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setLoadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 300);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTradeProgress(prev => (prev >= 100 ? 0 : prev + 2));
      setSignalStrength(prev => (prev >= 100 ? 20 : prev + 10));

      if (balance > 0) {
        setOpenTrades(prev =>
          prev.map(t => {
            const newVal = t.rawPnl + (Math.random() * 4 - 2);
            return {
              ...t,
              rawPnl: newVal,
              isProfit: newVal >= 0
            };
          })
        );
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [balance]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetNotice('');
    setDirectResetLink('');
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const fullName = formData.get('fullName');

    try {
      if (authModal === 'register') {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (fullName) {
          await updateProfile(userCredential.user, { displayName: fullName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setAuthModal(null);
      setCurrentView('dashboard');
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handlePasswordReset = async () => {
    setAuthError('');
    setResetNotice('');
    setDirectResetLink('');
    
    const emailInput = document.querySelector('input[name="email"]');
    const email = emailInput ? emailInput.value : '';

    if (!email) {
      setAuthError('Please enter your email address above first, then click Forgot Password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetNotice(`Password reset email sent to ${email}.`);
      // Fallback/Direct link simulation for immediate testing
      setDirectResetLink(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setCurrentView('landing');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const initiateSecureAction = (actionType) => {
    setPendingActionType(actionType);
    setPinCode('');
    setPinError('');
    setShow2FAModal(true);
  };

  const handleVerify2FAPin = (e) => {
    e.preventDefault();
    if (pinCode.length < 4) {
      setPinError('Please enter a valid 4 to 6 digit security PIN.');
      return;
    }
    
    setShow2FAModal(false);
    setDashboardModal(pendingActionType);
    setPendingActionType(null);
  };

  const handleDashboardActionSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(dashboardAmount || 0);

    if (dashboardModal === 'deposit') {
      const newTx = {
        type: 'Deposit',
        amount: val,
        method: selectedDepositMethod.toUpperCase(),
        status: 'Pending Verification',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdAt: Date.now(),
        userId: auth.currentUser?.uid || 'unknown',
        userEmail: auth.currentUser?.email || 'unknown'
      };

      try {
        await addDoc(collection(db, 'transactions'), newTx);
      } catch (err) {
        console.error("Error saving deposit to Firestore:", err);
      }
    
      setDepositSuccessNotice(
        `Deposit request of $${val.toFixed(2)} submitted successfully!`
      );
      setDashboardAmount('');
      setTimeout(() => setDepositSuccessNotice(''), 6000);

      emailjs.send('service_65msr6i', 'template_kte1rsb', {
        user_name: userProfile.fullName || "User",
        user_email: auth.currentUser?.email || "No email provided",
        deposit_amount: val.toFixed(2),
        deposit_method: selectedDepositMethod.toUpperCase(),
        date_time: new Date().toLocaleString()
      }).catch(err => console.error('EmailJS error:', err));

    } else if (dashboardModal === 'withdraw') {
      const newTx = {
        type: 'Withdrawal',
        amount: val,
        method: 'Bank / Crypto',
        status: 'Pending Verification',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        createdAt: Date.now(),
        userId: auth.currentUser?.uid || 'unknown',
        userEmail: auth.currentUser?.email || 'unknown'
      };

      try {
        await addDoc(collection(db, 'transactions'), newTx);
      } catch (err) {
        console.error("Error saving withdrawal to Firestore:", err);
      }

      setDepositSuccessNotice(
        `Withdrawal request of $${val.toFixed(2)} submitted for security review.`
      );
      setDashboardAmount('');
      setTimeout(() => setDepositSuccessNotice(''), 6000);
    }

    setDashboardModal(null);
  };

  const handleApplyForLoan = async (e) => {
    e.preventDefault();
    setLoanError('');
    setLoanNotice('');

    const requestedLoan = parseFloat(loanAmount || 0);
    const requiredBalance = requestedLoan * 0.35;

    if (balance < requiredBalance) {
      setLoanError(
        `Insufficient balance for collateral requirement. You need at least $${requiredBalance.toFixed(2)} (35% of $${requestedLoan.toFixed(2)}) in your balance. Current balance: $${balance.toFixed(2)}`
      );
      return;
    }

    const loanTx = {
      type: 'Asset Loan',
      amount: requestedLoan,
      method: 'Collateralized Loan',
      status: 'Approved & Disbursed',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      createdAt: Date.now(),
      userId: auth.currentUser?.uid || 'unknown',
      userEmail: auth.currentUser?.email || 'unknown'
    };

    try {
      await addDoc(collection(db, 'transactions'), loanTx);
      
      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userSnap = await getDoc(userRef);
        const currentBal = userSnap.exists() ? Number(userSnap.data().balance || 0) : 0;
        await updateDoc(userRef, { balance: currentBal + requestedLoan });
      }

      setLoanNotice(
        `Successfully secured loan of $${requestedLoan.toFixed(2)}! Funds added to your balance.`
      );
      setTimeout(() => setLoanNotice(''), 6000);
    } catch (err) {
      console.error("Error processing loan:", err);
      setLoanError("Error processing loan request. Please try again.");
    }
  };

  const handleVipSubmit = (e) => {
    e.preventDefault();
    setVipFormSent(true);
    setTimeout(() => setVipFormSent(false), 5000);
    e.target.reset();
  };

  const handleAdminAction = async (id, action) => {
    const updatedStatus = action === 'Approve' ? 'Approved' : 'Rejected';

    try {
      const targetTx = transactions.find(t => t.id === id);
      
      const txRef = doc(db, 'transactions', id);
      await updateDoc(txRef, { status: updatedStatus });

      if (action === 'Approve' && targetTx && targetTx.type === 'Deposit') {
        const targetUserId = targetTx.userId;
        const targetUserEmail = targetTx.userEmail;
        const depositAmount = Number(targetTx.amount);

        let userRef = null;

        if (targetUserId && targetUserId !== 'unknown' && targetUserId !== 'unknown-user') {
          userRef = doc(db, 'users', targetUserId);
        } else if (targetUserEmail && targetUserEmail !== 'unknown') {
          const usersQuery = query(collection(db, 'users'));
          const userSnapshots = await getDocs(usersQuery);
          const matchedUser = userSnapshots.docs.find(d => d.data().email === targetUserEmail);
          
          if (matchedUser) {
            userRef = doc(db, 'users', matchedUser.id);
          }
        }

        if (userRef) {
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const currentBal = Number(userSnap.data().balance || 0);
            const newBal = currentBal + depositAmount;
            await updateDoc(userRef, { balance: newBal });
          } else {
            await setDoc(userRef, { 
              email: targetUserEmail || 'unknown', 
              balance: depositAmount 
            }, { merge: true });
          }
        }
      }
    } catch (err) {
      console.error("Error updating transaction/balance in Firestore:", err);
    }
  };

  const getConvertedValue = () => {
    const amt = parseFloat(converterAmount || 0);
    const btcAsset = dashboardAssets.find(asset => asset.symbol === 'BTC');
    const btcPrice = btcAsset?.price;

    if (
      btcPrice === null ||
      btcPrice === undefined ||
      !Number.isFinite(Number(btcPrice))
    ) {
      return 'Loading live BTC price...';
    }

    const liveBtcPrice = Number(btcPrice);

    if (converterFrom === 'USD' && converterTo === 'BTC') {
      return (amt / liveBtcPrice).toFixed(8) + ' BTC';
    }

    if (converterFrom === 'BTC' && converterTo === 'USD') {
      return '$' + (amt * liveBtcPrice).toFixed(2);
    }

    return amt.toFixed(2) + ' ' + converterTo;
  };

  const principalAmt = parseFloat(calcAmount || 0);
  const monthlyRateDecimal = calcTierRate / 100;
  const futureValue = principalAmt * Math.pow(1 + monthlyRateDecimal, calcMonths);
  const totalProfit = futureValue - principalAmt;

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#06080F] text-white font-sans antialiased flex flex-col relative">
      {loading && (
        <div className="fixed inset-0 z-50 bg-[#06080F] flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center p-0.5 shadow-2xl shadow-emerald-500/30 mb-6 animate-pulse">
            <div className="w-full h-full bg-[#06080F] rounded-[14px] flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white mb-1">Apex Elite</h2>
          <p className="text-[10px] text-emerald-400 font-bold tracking-[0.25em] uppercase mb-8">
            SECURE TRADING PLATFORM
          </p>
          <div className="w-64 bg-[#0D121F] border border-white/10 h-2 rounded-full overflow-hidden mb-3 p-0.5">
            <div
              className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-150 ease-out"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      )}

      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D121F] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl my-auto">
            <button
              onClick={() => {
                setAuthModal(null);
                setAuthError('');
                setResetNotice('');
                setDirectResetLink('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>

            <div className="flex bg-[#06080F] p-1 rounded-xl mb-6 border border-white/5 mt-2">
              <button
                onClick={() => {
                  setAuthModal('login');
                  setAuthError('');
                  setResetNotice('');
                  setDirectResetLink('');
                }}
                className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all ${
                  authModal === 'login'
                    ? 'bg-emerald-400 text-black shadow-md'
                    : 'text-gray-400'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModal('register');
                  setAuthError('');
                  setResetNotice('');
                  setDirectResetLink('');
                }}
                className={`flex-1 py-2 rounded-lg font-extrabold text-xs transition-all ${
                  authModal === 'register'
                    ? 'bg-emerald-400 text-black shadow-md'
                    : 'text-gray-400'
                }`}
              >
                Sign Up
              </button>
            </div>

            <h3 className="text-xl font-black text-center mb-1 text-white">
              {authModal === 'login' ? 'Welcome Back' : 'Create Account'}
            </h3>
            <p className="text-gray-400 text-xs text-center mb-6">
              {authModal === 'login'
                ? 'Enter credentials to access dashboard'
                : 'Join professional traders globally'}
            </p>

            {authError && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-[11px] font-semibold text-center">
                {authError}
              </div>
            )}

            {resetNotice && (
              <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-[11px] font-semibold text-center space-y-2">
                <p>{resetNotice}</p>
                <div className="bg-[#06080F] p-2 rounded-lg border border-white/10 text-[10px] break-all text-emerald-300 font-mono select-all">
                  Firebase has dispatched the password reset link to your email inbox. Check your spam folder if it doesn't appear immediately.
                </div>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authModal === 'register' && (
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    placeholder="Enter your full name"
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              )}
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
                {authModal === 'login' && (
                  <div className="text-right mt-1.5">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-[11px] text-emerald-400 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-400/20"
              >
                {authModal === 'login' ? 'Sign In to Dashboard' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}

      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#0D121F] border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 font-bold text-xl mb-4 border border-emerald-500/20">
              🔒
            </div>
            <h3 className="text-xl font-black text-white mb-1">Two-Factor Security 2FA</h3>
            <p className="text-xs text-gray-400 mb-6 leading-relaxed">
              Enter your 6-digit security PIN to authorize this {pendingActionType}.
            </p>

            {pinError && (
              <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-400 text-[11px] font-semibold text-center">
                {pinError}
              </div>
            )}

            <form onSubmit={handleVerify2FAPin} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">
                  Security PIN / Authenticator Code
                </label>
                <input
                  type="password"
                  maxLength="6"
                  required
                  placeholder="••••••"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3.5 text-sm tracking-widest text-center text-emerald-400 font-black focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs shadow-lg shadow-emerald-400/20 hover:brightness-110 transition-all"
              >
                Verify & Continue →
              </button>
            </form>
          </div>
        </div>
      )}

      {dashboardModal === 'deposit' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0D121F] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl my-auto">
            <button
              onClick={() => setDashboardModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block mb-1">
                Secure Gateway
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Fund Your Account
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Select your preferred deposit channel and complete transfer.
              </p>
            </div>

            {depositSuccessNotice && (
              <div className="mb-4 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-semibold text-center">
                {depositSuccessNotice}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
              {[
                { id: 'usdt', label: 'USDT' },
                { id: 'btc', label: 'Bitcoin' },
                { id: 'eth', label: 'Ethereum' },
                { id: 'wire', label: 'Bank Wire' }
              ].map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedDepositMethod(method.id)}
                  className={`py-3 px-2 rounded-2xl border text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedDepositMethod === method.id
                      ? 'bg-emerald-400 text-black border-emerald-400 shadow-lg shadow-emerald-400/20'
                      : 'bg-[#06080F] text-gray-300 border-white/10 hover:border-white/30'
                  }`}
                >
                  <span>{method.label}</span>
                </button>
              ))}
            </div>

            <div className="bg-[#06080F] p-4 sm:p-5 rounded-2xl border border-white/5 mb-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-28 h-28 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full border-2 border-dashed border-black/40 flex flex-col items-center justify-center p-1 text-center">
                    <span className="text-[9px] font-black text-black uppercase tracking-tighter">
                      Scan QR Code
                    </span>
                    <span className="text-[7px] text-gray-600 font-mono mt-0.5">
                      {selectedDepositMethod.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex-1 w-full overflow-hidden text-center sm:text-left">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                    {currentDepositOption.name} Address
                  </span>
                  <div className="bg-[#0D121F] border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2 overflow-hidden">
                    <span className="text-xs text-emerald-400 font-mono truncate select-all">
                      {currentDepositOption.address}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold shrink-0 hover:bg-emerald-500/30 transition-colors"
                    >
                      {copiedAddress ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                    {currentDepositOption.instructions}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleDashboardActionSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">
                  Deposit Amount (USD)
                </label>
                <input
                  type="number"
                  min="50"
                  step="any"
                  required
                  placeholder="e.g. 1000"
                  value={dashboardAmount}
                  onChange={(e) => setDashboardAmount(e.target.value)}
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs shadow-lg shadow-emerald-400/20 hover:brightness-110 transition-all"
              >
                I Have Made This Transfer →
              </button>
            </form>
          </div>
        </div>
      )}

      {dashboardModal === 'withdraw' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0D121F] border border-white/10 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl">
            <button
              onClick={() => setDashboardModal(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold text-lg"
            >
              ✕
            </button>
            <h3 className="text-xl font-black capitalize mb-1 text-white">
              Withdraw Request
            </h3>
            <p className="text-gray-400 text-xs mb-4">
              Enter USD amount to proceed with your withdrawal.
            </p>
            <form onSubmit={handleDashboardActionSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  placeholder="0.00"
                  value={dashboardAmount}
                  onChange={(e) => setDashboardAmount(e.target.value)}
                  className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-lg"
              >
                Submit Withdrawal
              </button>
            </form>
          </div>
        </div>
      )}

      {!loading && (
        <TradingViewTicker
          assets={dashboardAssets}
          cryptoConnected={cryptoConnected}
        />
      )}

      <header className="flex items-center justify-between px-6 py-3.5 bg-[#06080F]/95 backdrop-blur-xl z-30 border-b border-white/10 w-full shrink-0 shadow-lg">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentView('landing')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 p-0.5 shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-[#06080F] rounded-[10px] flex items-center justify-center">
              <svg
                className="w-5 h-5 text-emerald-400 group-hover:scale-105 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M7 14l4-4 4 4 6-6" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-wide text-white">APEX ELITE</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                INSTITUTIONAL
              </span>
            </div>
            <span className="text-[9px] text-gray-400 font-bold tracking-[0.25em] uppercase block">
              GLOBAL MARKETS
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentView === 'dashboard' ? (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-300 hover:bg-white/10 transition-colors"
            >
              Log Out
            </button>
          ) : (
            <button
              onClick={() => setAuthModal('login')}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black text-xs font-black shadow-lg shadow-emerald-400/20 hover:brightness-110 transition-all"
            >
              Sign In Terminal
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        {currentView === 'landing' ? (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20 py-10">
            
            {/* HERO SECTION */}
            <section className="text-center relative z-10 pt-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Institutional Trading Infrastructure & Yield Engine
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6">
                Next-Generation Wealth & <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200 bg-clip-text text-transparent">
                  Digital Asset Portfolio
                </span>
              </h1>
              <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
                Execute algorithmic strategies across 50+ global markets, access instant asset-backed liquidity loans, and compound yield with real-time institutional liquidity.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setAuthModal('register')}
                  className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:opacity-95 transition-all"
                >
                  Open Account Now →
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="py-4 px-8 rounded-2xl bg-[#0D121F] border border-white/10 text-white font-extrabold text-sm hover:bg-white/5 transition-all"
                >
                  Explore Demo Dashboard
                </button>
              </div>
            </section>

            {/* INSTITUTIONAL PARTNER / LIQUIDITY BAR */}
            <section className="bg-[#0D121F]/60 backdrop-blur-md py-6 px-6 rounded-3xl border border-white/5">
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] text-center mb-6">
                Powered by Enterprise-Grade Technology & Liquidity Partners
              </p>
              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
                <span className="text-sm font-black tracking-widest text-white">BINANCE CLOUD</span>
                <span className="text-sm font-black tracking-widest text-emerald-400">TRADINGVIEW</span>
                <span className="text-sm font-black tracking-widest text-amber-400">FIREBASE AUTH</span>
                <span className="text-sm font-black tracking-widest text-teal-400">COINBASE CUSTODY</span>
                <span className="text-sm font-black tracking-widest text-blue-400">CLOUDFLARE</span>
              </div>
            </section>

            {/* LIVE STATS BANNER */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0D121F] p-6 rounded-3xl border border-white/10 shadow-2xl">
              <div className="text-center p-4">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Global Volume</span>
                <span className="text-2xl sm:text-3xl font-black text-white">$4.2B+</span>
              </div>
              <div className="text-center p-4 border-l border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Active Traders</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">54,800+</span>
              </div>
              <div className="text-center p-4 border-l border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Execution Speed</span>
                <span className="text-2xl sm:text-3xl font-black text-white">&lt; 12ms</span>
              </div>
              <div className="text-center p-4 border-l border-white/5">
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1">Platform Uptime</span>
                <span className="text-2xl sm:text-3xl font-black text-teal-400">99.99%</span>
              </div>
            </section>

            {/* REAL-TIME MARKET HEATMAP / TOP GAINERS SHOWCASE */}
            <section className="bg-[#0D121F] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block mb-1">Live Feed</span>
                  <h3 className="text-xl font-black text-white">Market Heatmap & Top Gainers</h3>
                  <p className="text-xs text-gray-400">Real-time streaming asset performance across global markets.</p>
                </div>
                <button
                  onClick={() => setAuthModal('register')}
                  className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-emerald-400 hover:bg-white/10"
                >
                  View All 25+ Markets →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {dashboardAssets.slice(0, 4).map(asset => (
                  <div key={asset.id} className="bg-[#06080F] p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-xs p-1">
                          <img src={asset.logoUrl} alt={asset.symbol} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                        </span>
                        <div>
                          <span className="text-sm font-black text-white block">{asset.symbol}</span>
                          <span className="text-[10px] text-gray-400">{asset.category}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        asset.isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {asset.isUp ? '+' : ''}{asset.changeNum !== null ? asset.changeNum.toFixed(2) : '1.20'}%
                      </span>
                    </div>
                    <div className="text-base font-black text-white">
                      {asset.price !== null ? `$${formatAssetPrice(asset.price)}` : '$--'}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* PRE-LOGIN INTERACTIVE ROI CALCULATOR */}
            <section className="bg-[#0D121F] p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl">
              <div className="text-center max-w-xl mx-auto mb-10">
                <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block mb-1">Earnings Simulator</span>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Calculate Your Projected Returns</h2>
                <p className="text-xs text-gray-400 mt-2">Simulate your compounding yields across our institutional strategy tiers.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Initial Investment Amount (USD): ${Number(calcAmount || 0).toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="500"
                      max="50000"
                      step="500"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(e.target.value)}
                      className="w-full accent-emerald-400 bg-black/40 h-2 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Strategy Tier Rate
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {accountTypes.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() => setCalcTierRate(tier.rate)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            calcTierRate === tier.rate
                              ? 'bg-emerald-400 text-black border-emerald-400 font-black shadow-lg shadow-emerald-400/20'
                              : 'bg-[#06080F] text-gray-300 border-white/10 font-bold hover:border-white/30'
                          }`}
                        >
                          <div className="text-xs">{tier.name.split(' ')[0]}</div>
                          <div className="text-[10px] opacity-80">{tier.rate}% /mo</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                      Lock-up Duration: {calcMonths} Months
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          onClick={() => setCalcMonths(m)}
                          className={`py-2.5 rounded-xl border text-xs font-extrabold transition-all ${
                            calcMonths === m
                              ? 'bg-teal-400 text-black border-teal-400 shadow-md'
                              : 'bg-[#06080F] text-gray-400 border-white/10 hover:text-white'
                          }`}
                        >
                          {m} {m === 1 ? 'Mo' : 'Mos'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#06080F] p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="space-y-4">
                    <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block">
                      Projected Portfolio Value
                    </span>
                    <div>
                      <span className="text-3xl sm:text-4xl font-black text-white block">
                        ${futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gray-400">Estimated Value at Term End</span>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Net Profit</span>
                        <span className="text-lg font-extrabold text-emerald-400">
                          +${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Effective ROI</span>
                        <span className="text-lg font-extrabold text-teal-300">
                          {((totalProfit / (principalAmt || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setAuthModal('register')}
                    className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-400/20 hover:brightness-110 transition-all"
                  >
                    Start Earning Today →
                  </button>
                </div>
              </div>
            </section>

            {/* INVESTMENT TIERS GRID */}
            <section className="py-6">
              <div className="text-center max-w-xl mx-auto mb-10">
                <h2 className="text-2xl sm:text-3xl font-black mb-2">Select Investment Tier</h2>
                <p className="text-gray-400 text-xs">Professional grade strategies designed for consistent performance</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {accountTypes.map((tier) => (
                  <div
                    key={tier.id}
                    className={`relative bg-[#0D121F] rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                      tier.popular
                        ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10'
                        : 'border-white/10'
                    }`}
                  >
                    <div>
                      {tier.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-400 text-black font-extrabold text-[9px] uppercase tracking-widest rounded-full">
                          Most Popular
                        </span>
                      )}
                      <h3 className="text-xl font-extrabold text-emerald-400 mb-2">
                        {tier.name}
                      </h3>
                      <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl font-black text-white">{tier.min}</span>
                        <span className="text-xs font-semibold text-gray-400">min deposit</span>
                      </div>
                      <div className="space-y-3.5 mb-8 border-t border-b border-white/5 py-5">
                        {tier.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-3 text-xs font-medium text-gray-200">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setAuthModal('register')}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-md"
                    >
                      Get Started
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* PLATFORM CAPABILITIES & FEATURES LIST */}
            <section className="bg-[#0D121F] p-8 rounded-3xl border border-white/10 shadow-xl space-y-8">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block mb-1">Advanced Features</span>
                <h2 className="text-2xl font-black text-white">Why Global Institutions Choose Apex Elite</h2>
                <p className="text-xs text-gray-400 mt-2">Built from the ground up for maximum security, execution speed, and capital efficiency.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#06080F] p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold mb-4 border border-emerald-500/20">⚡</div>
                  <h3 className="text-sm font-black text-white mb-2">AI-Driven Signal Execution</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Proprietary algorithms scan crypto and equity markets 24/7 to capture profitable breakout opportunities instantly.</p>
                </div>
                <div className="bg-[#06080F] p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 font-bold mb-4 border border-teal-500/20">🔒</div>
                  <h3 className="text-sm font-black text-white mb-2">Institutional Cold Custody</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Multi-signature hardware vaults and segregated client accounts ensure absolute asset protection against breaches.</p>
                </div>
                <div className="bg-[#06080F] p-6 rounded-2xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold mb-4 border border-amber-500/20">🏦</div>
                  <h3 className="text-sm font-black text-white mb-2">Instant Collateralized Loans</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Borrow stablecoin liquidity instantly using your portfolio balance as flexible collateral without triggering taxable events.</p>
                </div>
              </div>
            </section>

            {/* VIP ACCOUNT MANAGER / INSTITUTIONAL INQUIRY FORM */}
            <section className="bg-gradient-to-br from-[#0D121F] to-[#06080F] p-8 sm:p-12 rounded-3xl border border-emerald-500/30 shadow-2xl max-w-3xl mx-auto space-y-6">
              <div className="text-center">
                <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mb-1">VIP Services</span>
                <h3 className="text-2xl font-black text-white">Request Dedicated Account Management</h3>
                <p className="text-xs text-gray-400 mt-1">High-net-worth individuals and institutional desks can connect with our private advisory team.</p>
              </div>

              {vipFormSent && (
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs font-semibold text-center">
                  Inquiry received! A dedicated account manager will contact you within 2 hours.
                </div>
              )}

              <form onSubmit={handleVipSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Full Name</label>
                    <input type="text" required placeholder="John Doe" className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Institutional Email</label>
                    <input type="email" required placeholder="john@company.com" className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 uppercase tracking-wider">Estimated Capital Allocation</label>
                  <select className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-emerald-400">
                    <option>$50,000 - $100,000</option>
                    <option>$100,000 - $500,000</option>
                    <option>$500,000 - $1,000,000+</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs shadow-lg hover:brightness-110 transition-all">
                  Request VIP Advisory Call →
                </button>
              </form>
            </section>

          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0D121F] p-6 rounded-3xl border border-white/10 gap-4 shadow-xl">
              <div>
                <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1">
                  Standard Institutional Dashboard {isAdmin && '• [Admin Mode Active]'}
                </div>
                <h1 className="text-2xl font-black text-white">
                  Welcome back, {userProfile.fullName}
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Account ID: APX-847291 • Secure Connection Active
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => initiateSecureAction('deposit')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs shadow-lg hover:brightness-110"
                >
                  + Deposit Funds
                </button>
                <button
                  onClick={() => initiateSecureAction('withdraw')}
                  className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10"
                >
                  Withdraw
                </button>
              </div>
            </div>

            {depositSuccessNotice && (
              <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs font-semibold text-center">
                {depositSuccessNotice}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    Total Portfolio Balance
                  </span>
                  <div className="text-4xl font-black text-white mt-2 mb-1">
                    USD {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    ● Real-time liquidity pool value
                  </span>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between text-xs text-gray-400 font-semibold">
                  <span>Margin Level: <strong className="text-white">Unlimited</strong></span>
                  <span>Leverage: <strong className="text-emerald-400">1:500</strong></span>
                </div>
              </div>

              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Active Earnings & ROI
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                      LIVE
                    </span>
                  </div>
                  <div className="text-3xl font-black text-white mt-2 mb-1">
                    {totalPnL >= 0
                      ? `+$${totalPnL.toFixed(2)}`
                      : `-$${Math.abs(totalPnL).toFixed(2)}`}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    Estimated Monthly Return: <strong className="text-emerald-400">{calculatedRoi}% ROI</strong>
                  </span>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="w-full bg-[#06080F] h-2 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${tradeProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                    <span>Cycle Progress</span>
                    <span className="text-emerald-400">{tradeProgress}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl">
                <div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                    AI Signal Strength
                  </span>
                  <div className="text-3xl font-black text-white mt-2 mb-1">
                    {signalStrength}% Accuracy
                  </div>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    Optimized for bullish breakout patterns
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-10 gap-1">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 rounded-sm ${
                        i < Math.floor(signalStrength / 10)
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* NAVIGATION TABS */}
            <div className="flex flex-wrap bg-[#0D121F] p-1.5 rounded-2xl border border-white/10 gap-2 w-fit">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'overview' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Advanced Charts
              </button>
              <button
                onClick={() => setActiveTab('loan')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'loan' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                🏦 Asset Loan Facility
              </button>
              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'calculator' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                📈 ROI Calculator
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'news' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                📰 Market News & Feed
              </button>
              <button
                onClick={() => setActiveTab('tiers')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'tiers' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                ⭐ Investment Tiers
              </button>
              <button
                onClick={() => setActiveTab('markets')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'markets' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                📊 25+ Investment Options ({dashboardAssets.length})
              </button>
              <button
                onClick={() => setActiveTab('trades')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'trades' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Active Positions
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'transactions' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Transaction History
              </button>
              <button
                onClick={() => setActiveTab('converter')}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                  activeTab === 'converter' ? 'bg-emerald-400 text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                Asset Swap
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('adminDesk')}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                    activeTab === 'adminDesk' ? 'bg-amber-400 text-black shadow-md' : 'text-amber-400 hover:text-white bg-amber-500/10 border border-amber-500/30'
                  }`}
                >
                  ⚡ Admin Verification Desk
                </button>
              )}
            </div>

            {activeTab === 'overview' && (
              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Live Market Technical Analysis
                  </h3>
                  <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    BTC/USDT Live Feed
                  </span>
                </div>
                <TradingViewChart />
              </div>
            )}

            {activeTab === 'loan' && (
              <div className="bg-[#0D121F] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl max-w-2xl mx-auto space-y-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest block mb-1">
                    Instant Liquidity
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white">Crypto & Asset-Backed Loan Portal</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Borrow stablecoins against your portfolio instantly. <strong className="text-emerald-400">Rule:</strong> You must maintain at least 35% of the requested loan amount in your account balance as collateral.
                  </p>
                </div>

                {loanNotice && (
                  <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-400 text-xs font-semibold text-center">
                    {loanNotice}
                  </div>
                )}

                {loanError && (
                  <div className="p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl text-rose-400 text-xs font-semibold text-center">
                    {loanError}
                  </div>
                )}

                <div className="bg-[#06080F] p-5 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Current Account Balance:</span>
                    <span className="font-black text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Required Collateral (35%):</span>
                    <span className="font-black text-emerald-400">${(parseFloat(loanAmount || 0) * 0.35).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Borrowing Interest Rate:</span>
                    <span className="font-black text-white">4.5% APR</span>
                  </div>
                </div>

                <form onSubmit={handleApplyForLoan} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">
                      Requested Loan Amount (USD)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="any"
                      required
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-xs shadow-lg shadow-emerald-400/20 hover:brightness-110 transition-all cursor-pointer"
                  >
                    Apply & Disburse Loan Funds →
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'news' && (
              <div className="space-y-4">
                <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-1">Global Financial News & Economic Feed</h3>
                  <p className="text-xs text-gray-400 mb-4">Real-time breaking news across crypto, equities, and global commodities.</p>
                  <TradingViewNewsWidget />
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="bg-[#0D121F] p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl max-w-4xl mx-auto space-y-8">
                <div>
                  <h3 className="text-xl font-black text-white mb-1">Interactive ROI & Staking Calculator</h3>
                  <p className="text-xs text-gray-400">
                    Simulate your compounding returns over time based on our institutional strategy tiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                        Initial Investment Amount (USD): ${Number(calcAmount || 0).toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="500"
                        max="50000"
                        step="500"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        className="w-full accent-emerald-400 bg-black/40 h-2 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                        Select Strategy Tier & Monthly Yield
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {accountTypes.map((tier) => (
                          <button
                            key={tier.id}
                            onClick={() => setCalcTierRate(tier.rate)}
                            className={`p-3 rounded-2xl border text-center transition-all ${
                              calcTierRate === tier.rate
                                ? 'bg-emerald-400 text-black border-emerald-400 font-black shadow-lg shadow-emerald-400/20'
                                : 'bg-[#06080F] text-gray-300 border-white/10 font-bold hover:border-white/30'
                            }`}
                          >
                            <div className="text-xs">{tier.name.split(' ')[0]}</div>
                            <div className="text-[10px] opacity-80">{tier.rate}% /mo</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-400 block mb-2 uppercase tracking-wider">
                        Lock-up Duration: {calcMonths} Months
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 3, 6, 12].map((m) => (
                          <button
                            key={m}
                            onClick={() => setCalcMonths(m)}
                            className={`py-2.5 rounded-xl border text-xs font-extrabold transition-all ${
                              calcMonths === m
                                ? 'bg-teal-400 text-black border-teal-400 shadow-md'
                                : 'bg-[#06080F] text-gray-400 border-white/10 hover:text-white'
                            }`}
                          >
                            {m} {m === 1 ? 'Mo' : 'Mos'}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#06080F] p-6 sm:p-8 rounded-3xl border border-emerald-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                    <div className="space-y-4">
                      <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block">
                        Projected Compound Yield
                      </span>
                      <div>
                        <span className="text-3xl sm:text-4xl font-black text-white block">
                          ${futureValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-gray-400">Total Estimated Portfolio Value</span>
                      </div>
                      
                      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Net Profit</span>
                          <span className="text-lg font-extrabold text-emerald-400">
                            +${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 uppercase font-bold block">Effective ROI</span>
                          <span className="text-lg font-extrabold text-teal-300">
                            {((totalProfit / (principalAmt || 1)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => initiateSecureAction('deposit')}
                      className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-lg shadow-emerald-400/20 hover:brightness-110 transition-all"
                    >
                      Fund This Strategy Now →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tiers' && (
              <div className="space-y-6">
                <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 shadow-xl">
                  <h3 className="text-lg font-black text-white mb-1">Select Your Investment Tier</h3>
                  <p className="text-xs text-gray-400 mb-6">Upgrade your portfolio strategy and unlock higher monthly yields.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {accountTypes.map((tier) => (
                      <div
                        key={tier.id}
                        className={`relative bg-[#06080F] rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                          tier.popular
                            ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10'
                            : 'border-white/10'
                        }`}
                      >
                        <div>
                          {tier.popular && (
                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-400 text-black font-extrabold text-[9px] uppercase tracking-widest rounded-full">
                              Most Popular
                            </span>
                          )}
                          <h4 className="text-lg font-extrabold text-emerald-400 mb-2">
                            {tier.name}
                          </h4>
                          <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-3xl font-black text-white">{tier.min}</span>
                            <span className="text-xs font-semibold text-gray-400">min deposit</span>
                          </div>
                          <div className="space-y-3 mb-8 border-t border-b border-white/5 py-4">
                            {tier.features.map((feature, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-2.5 text-xs font-medium text-gray-300">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => initiateSecureAction('deposit')}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-md hover:brightness-110"
                        >
                          Fund Tier & Activate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'markets' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-center bg-[#0D121F] p-5 rounded-3xl border border-white/10 gap-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Curated Investment Options & Assets ({filteredAssets.length} Available)
                    </h3>
                    <p className="text-xs text-gray-400">
                      Browse through 25+ high-performance crypto vaults, global equities, commodities, and indices.
                    </p>
                  </div>
                  <div className="w-full sm:w-72">
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className="bg-[#0D121F] border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl hover:border-emerald-500/50 transition-all"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${asset.bg} flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden border border-white/10 p-1`}>
                              <img
                                src={asset.logoUrl}
                                alt={asset.name}
                                className="w-full h-full object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg font-black text-white block">{asset.symbol}</span>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-medium">
                                  {asset.category}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">{asset.name}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-lg font-black text-white block">
                              {asset.price !== null ? `$${formatAssetPrice(asset.price)}` : 'Live Stream'}
                            </span>
                            {asset.changeNum !== null && (
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border inline-block mt-0.5 ${
                                asset.isUp ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                              }`}>
                                {asset.isUp ? '+' : ''}{asset.changeNum.toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-[#06080F] p-3 rounded-2xl border border-white/5 mb-4 text-center">
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold block uppercase">Sector</span>
                            <span className="text-xs font-bold text-white truncate block">{asset.sector}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold block uppercase">Yield</span>
                            <span className="text-xs font-bold text-emerald-400 truncate block">{asset.yield}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-gray-500 font-bold block uppercase">Risk Level</span>
                            <span className="text-xs font-bold text-amber-400 truncate block">{asset.risk}</span>
                          </div>
                        </div>

                        {asset.tvSymbol && <MiniTradingViewChart symbol={asset.tvSymbol} />}
                      </div>

                      <button
                        onClick={() => initiateSecureAction('deposit')}
                        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-extrabold text-xs shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                      >
                        <span>📈</span> Invest in {asset.name}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <h3 className="text-sm font-black text-white">Active Institutional Positions</h3>
                  <span className="text-xs text-emerald-400 font-bold">Real-time P&L synchronization</span>
                </div>

                {balance > 0 ? (
                  <div className="space-y-3">
                    {openTrades.map(trade => {
                      const scaledPnl = trade.rawPnl * balanceMultiplier;
                      return (
                        <div key={trade.id} className="bg-[#06080F] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                              trade.type === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {trade.type}
                            </span>
                            <div>
                              <div className="text-sm font-bold text-white">{trade.pair}</div>
                              <div className="text-xs text-gray-400">Position Size: {trade.size} • Entry: {trade.entry}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-black ${scaledPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {scaledPnl >= 0 ? `+$${scaledPnl.toFixed(2)}` : `-$${Math.abs(scaledPnl).toFixed(2)}`}
                            </div>
                            <span className="text-[10px] text-gray-500 font-semibold uppercase">Unrealized Return</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xs text-gray-400 mb-4">
                      Account balance is $0.00. Deposit funds to activate automated trading strategies.
                    </p>
                    <button
                      onClick={() => initiateSecureAction('deposit')}
                      className="px-6 py-3 bg-emerald-400 text-black font-extrabold text-xs rounded-xl shadow-lg"
                    >
                      Make a Deposit
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
                <div className="flex justify-between items-center pb-3 border-b border-white/5">
                  <h3 className="text-sm font-black text-white">Deposit, Withdrawal & Loan Logs</h3>
                  <span className="text-xs text-amber-400 font-bold">Verification Desk</span>
                </div>

                <div className="space-y-3">
                  {transactions.map(tx => (
                    <div key={tx.id} className="bg-[#06080F] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold ${
                            tx.type === 'Deposit' || tx.type === 'Asset Loan'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {tx.type}
                          </span>
                          <span className="text-sm font-bold text-white">${Number(tx.amount).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{tx.method} • {tx.date}</div>
                      </div>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                        tx.status === 'Approved' || tx.status === 'Approved & Disbursed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'converter' && (
              <div className="bg-[#0D121F] p-6 rounded-3xl border border-white/10 max-w-lg mx-auto space-y-4 shadow-xl">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                  Instant Asset Swap
                </h3>
                <div>
                  <label className="text-xs text-gray-400 font-bold mb-1.5 block">Amount to Convert</label>
                  <input
                    type="number"
                    value={converterAmount}
                    onChange={e => setConverterAmount(e.target.value)}
                    className="w-full bg-[#06080F] border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1.5 block">From Asset</label>
                    <select
                      value={converterFrom}
                      onChange={e => setConverterFrom(e.target.value)}
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="USD">USD</option>
                      <option value="BTC">BTC</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 font-bold mb-1.5 block">To Asset</label>
                    <select
                      value={converterTo}
                      onChange={e => setConverterTo(e.target.value)}
                      className="w-full bg-[#06080F] border border-white/10 rounded-xl px-3 py-3.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                    >
                      <option value="BTC">BTC</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div className="bg-[#06080F] p-5 rounded-2xl border border-white/5 text-center mt-4">
                  <span className="text-xs text-gray-400 font-bold block mb-1">Estimated Conversion Output</span>
                  <span className="text-2xl font-black text-emerald-400">{getConvertedValue()}</span>
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'adminDesk' && (
              <AdminVerificationDesk
                transactions={transactions}
                onAdminAction={handleAdminAction}
              />
            )}
          </div>
        )}
      </main>

      <FloatingChat />
    </div>
  );
}
