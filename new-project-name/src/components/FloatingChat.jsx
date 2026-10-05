import React from "react";

export default function FloatingChat() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-slate-900 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
        <svg className="w-6 h-6 stroke-current" viewBox="0 0 24 24" fill="none">
          <path d="M20 2H4C2.89543 2 2 2.89543 2 4V22L6 18H20C21.1046 18 22 17.1046 22 16V4C22 2.89543 21.1046 2 20 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}