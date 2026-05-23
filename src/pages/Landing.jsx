import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col justify-between px-6 py-8 md:py-16 font-display relative overflow-hidden transition-colors">
      
      {/* Background glow effects - warm travel sunset theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header bar with Logo */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <Logo className="w-8 h-8 md:w-10 md:h-10" showText={true} textClassName="text-lg md:text-xl" />
        <div className="flex items-center gap-1.5 opacity-75 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-xs text-secondary animate-pulse">lock</span>
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">ZK Privacy Protected</span>
        </div>
      </header>

      {/* Main Content Area: Responsive Split Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-center py-12 z-10">
        
        {/* Left Side: Brand presentation and CTAs */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          
          {/* Tagline */}
          <div className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
            Viajes en Enjambre • Web3 & IA
          </div>

          {/* H1 with Fluid Clamp-like Typography */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
            Encuentra lo bueno,<br className="hidden md:inline" />
            <span className="bg-gradient-primary bg-clip-text text-transparent"> aquisito nomás.</span>
          </h1>

          {/* Description */}
          <p className="text-slate-400 text-sm sm:text-base font-medium leading-relaxed mb-10 max-w-md">
            El primer enjambre de inteligencia viajera descentralizada. Descubre rincones ocultos, completa misiones misteriosas y sella memorias criptográficas on-chain guiado por tu agente IA local.
          </p>

          {/* Bottom CTA & Trust Badges */}
          <div className="w-full max-w-sm md:max-w-none flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto px-8 h-14 rounded-full bg-gradient-primary text-white text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/45 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Empezar el viaje</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            
            <button 
              onClick={() => navigate('/onboarding')}
              className="w-full sm:w-auto px-6 h-14 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Vincular Agente</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8 opacity-75">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="material-symbols-outlined text-slate-500">verified_user</span>
              <span>ZK Verified</span>
            </div>
            <div className="text-slate-700">•</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="material-symbols-outlined text-slate-500">token</span>
              <span>Powered by Stellar Soroban</span>
            </div>
          </div>
        </div>

        {/* Right Side: Beautiful Interactive Visual Mockup (Passport Stamp + Map preview) */}
        <div className="hidden md:flex justify-center items-center h-full relative">
          
          {/* Decorative absolute components */}
          <div className="absolute w-[360px] h-[360px] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Main Mockup Glassmorphic Card (Styled Pasaporte) */}
          <div className="relative w-[340px] h-[460px] bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl flex flex-col justify-between overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
            
            {/* Stamp Stitch Header */}
            <div className="flex items-center justify-between border-b border-dashed border-white/20 pb-4">
              <Logo className="w-8 h-8" />
              <div className="text-right">
                <p className="text-[10px] font-mono text-slate-500 uppercase">Documento de Viaje</p>
                <p className="text-xs font-black tracking-wider text-slate-300">AQUISITO PASSPORT</p>
              </div>
            </div>

            {/* Passport Stamp Mock */}
            <div className="my-auto flex flex-col items-center justify-center relative">
              
              {/* Retro Passport Seal */}
              <div className="size-36 rounded-full border-4 border-dashed border-primary/45 flex flex-col items-center justify-center text-primary rotate-[-12deg] p-4 text-center">
                <span className="text-[10px] font-mono tracking-widest leading-none">VERIFICADO</span>
                <span className="text-base font-black tracking-tighter uppercase my-1">CUSCO</span>
                <span className="text-[9px] font-mono leading-none">MAYO 2026</span>
              </div>

              {/* Float Badge 1 */}
              <div className="absolute top-2 -right-4 bg-[#2b2724] border border-secondary/50 rounded-2xl p-2 shadow-lg flex items-center gap-2 transform rotate-6">
                <span className="text-lg">🦙</span>
                <div className="text-left leading-none">
                  <p className="text-[8px] text-slate-500 font-bold uppercase">Badge</p>
                  <p className="text-[10px] font-black text-white">Guardián Inca</p>
                </div>
              </div>

              {/* Float Badge 2 */}
              <div className="absolute bottom-2 -left-6 bg-[#2b2724] border border-accent/50 rounded-2xl p-2 shadow-lg flex items-center gap-2 transform -rotate-3">
                <span className="text-lg">🌋</span>
                <div className="text-left leading-none">
                  <p className="text-[8px] text-slate-500 font-bold uppercase">Swarm</p>
                  <p className="text-[10px] font-black text-white">Ola Arequipa</p>
                </div>
              </div>
            </div>

            {/* Passport Holder Stats */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between text-xs">
              <div className="text-left">
                <p className="text-[9px] text-slate-500 uppercase font-mono">Traveler Name</p>
                <p className="font-bold text-slate-200">Explorer-729</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-500 uppercase font-mono">Rank</p>
                <p className="font-black text-primary uppercase">Lv.3 Pathfinder</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="w-full max-w-6xl mx-auto text-center md:text-left z-10 pt-8 mt-12 border-t border-white/5 opacity-55">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          © 2026 Aquisito Inc. · Powered by Stellar Network & Local AI swarm technologies.
        </p>
      </footer>

    </div>
  );
}
