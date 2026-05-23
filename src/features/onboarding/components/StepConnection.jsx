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
        <h1 className="tracking-tight text-[32px] font-black leading-tight pt-2">Conexión y Sincronía</h1>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">
          Vincula tu agente de inteligencia local y tu billetera Web3 para desbloquear toda la experiencia de Aquisito.
        </p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">neurology</span>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Agente Aquisito</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inteligencia autónoma local</p>
          </div>
        </div>
        
        {isGatewayOnline ? (
          <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-bold text-sm">Agente Conectado</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <input 
              type="text" 
              value={pairingCode} 
              onChange={(e) => setPairingCode(e.target.value)} 
              placeholder="Código de 6 dígitos" 
              maxLength={6}
              className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" 
            />
            <button 
              onClick={handlePair} 
              disabled={!pairingCode.trim() || pairingStatus === 'pairing'}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {pairingStatus === 'pairing' ? 'Vinculando...' : 'Vincular Agente'}
            </button>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-slate-800 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-accent text-3xl">account_balance_wallet</span>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">Stellar Wallet</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Para Reputación y Votos</p>
          </div>
        </div>

        {publicKey ? (
          <div className="flex items-center justify-between text-accent bg-accent/10 p-3 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-accent animate-pulse"></span>
              <span className="font-mono font-bold text-sm">{shortWallet(publicKey)}</span>
            </div>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        ) : (
          <button 
            onClick={connect} 
            disabled={connecting}
            className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold transition-colors active:scale-[0.98] disabled:opacity-50 shadow-md shadow-accent/20"
          >
            {connecting ? 'Conectando...' : 'Conectar Freighter'}
          </button>
        )}
      </div>
    </div>
  );
}

