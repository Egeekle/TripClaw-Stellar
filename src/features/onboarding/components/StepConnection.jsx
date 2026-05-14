import React from 'react';

export default function StepConnection({
  isGatewayOnline,
  pairingCode, setPairingCode,
  pairingStatus, handlePair,
  publicKey, connect, connecting,
  shortWallet
}) {
  return (
    <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col items-start gap-2">
        <h1 className="tracking-tight text-[32px] font-bold leading-tight pt-2">Connect & Sync</h1>
        <p className="text-slate-500 text-base mt-2">
          Link your local AI agent and your Web3 wallet to unlock the full TripClaw experience.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-violet-500 text-3xl">neurology</span>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">ZeroClaw Agent</h3>
            <p className="text-xs text-slate-500">Local autonomous intelligence</p>
          </div>
        </div>
        
        {isGatewayOnline ? (
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-bold text-sm">Gateway Connected</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={pairingCode} 
              onChange={(e) => setPairingCode(e.target.value)} 
              placeholder="6-digit code" 
              maxLength={6}
              className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-violet-500 outline-none text-slate-900 dark:text-white" 
            />
            <button 
              onClick={handlePair} 
              disabled={!pairingCode.trim() || pairingStatus === 'pairing'}
              className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {pairingStatus === 'pairing' ? 'Pairing...' : 'Pair Agent'}
            </button>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-indigo-500 text-3xl">account_balance_wallet</span>
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Stellar Wallet</h3>
            <p className="text-xs text-slate-500">For Reputation & Swarm Voting</p>
          </div>
        </div>

        {publicKey ? (
          <div className="flex items-center justify-between text-indigo-500 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="font-mono font-bold text-sm">{shortWallet(publicKey)}</span>
            </div>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        ) : (
          <button 
            onClick={connect} 
            disabled={connecting}
            className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors active:scale-[0.98] disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Freighter'}
          </button>
        )}
      </div>
    </div>
  );
}
