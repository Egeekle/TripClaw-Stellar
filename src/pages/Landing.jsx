import { useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col items-center justify-between px-6 py-12 font-display relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-fuchsia-600/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="flex flex-col items-center w-full max-w-sm mt-8 z-10">
        {/* Logo Icon */}
        <div className="size-24 rounded-[1.5rem] bg-gradient-to-br from-[#b47af5] via-[#d946ef] to-[#d946ef] flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.4)] mb-8">
          <span className="material-symbols-outlined text-white text-[56px] font-light">auto_awesome</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl font-black tracking-tight mb-5 flex items-center">
          <span className="text-white">Trip</span>
          <span className="bg-gradient-to-r from-[#b47af5] to-[#d946ef] text-transparent bg-clip-text">Claw</span>
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-center text-[15px] font-medium leading-relaxed mb-12 px-2">
          Web3 travel swarm. Discover hidden territories, complete mystery missions, mint on-chain memories.
        </p>

        {/* Feature Cards */}
        <div className="w-full space-y-3">
          <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="size-11 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-violet-400 text-xl">neurology</span>
            </div>
            <div className="text-left">
              <h3 className="text-white text-sm font-bold">Local AI Agents</h3>
              <p className="text-slate-500 text-xs font-medium">ZeroClaw runs on your device</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="size-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-indigo-400 text-xl">account_balance_wallet</span>
            </div>
            <div className="text-left">
              <h3 className="text-white text-sm font-bold">Stellar Wallet</h3>
              <p className="text-slate-500 text-xs font-medium">Earn XLM rewards & NFTs</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-[1.25rem] p-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="size-11 rounded-xl bg-fuchsia-500/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-fuchsia-400 text-xl">lock</span>
            </div>
            <div className="text-left">
              <h3 className="text-white text-sm font-bold">ZK Identity</h3>
              <p className="text-slate-500 text-xs font-medium">Privacy-first verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-12 z-10">
        <button 
          onClick={() => navigate('/onboarding')}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[#ca7af5] to-[#ef46df] text-white text-[17px] font-bold shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Empezar el viaje
        </button>
        <div className="flex items-center gap-1.5 opacity-60">
          <span className="material-symbols-outlined text-[13px] text-yellow-500/80">lock</span>
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">WEB3 & LOCAL AI READY</span>
        </div>
      </div>

    </div>
  );
}
