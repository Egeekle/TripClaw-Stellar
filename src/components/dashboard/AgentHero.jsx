import React, { memo } from 'react';
import Logo from '../Logo';

/**
 * PERFORMANCE: React.memo prevents the AgentHero component from re-rendering
 * when the Dashboard parent re-renders (e.g., due to the LiveFeed timer),
 * as long as the status and isGatewayOnline props remain the same.
 */
const AgentHero = memo(function AgentHero({ status, isGatewayOnline }) {
  return (
    <section className="mt-4">
      <div className="relative group">
        <div className="absolute -top-3 -right-2 z-10 bg-gradient-primary text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">psychology</span>
          Agente Aquisito
        </div>
        <div className="flex flex-col items-stretch justify-start rounded-xl overflow-hidden shadow-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-none">
          <div className="w-full aspect-[16/9] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-sky-dark"></div>
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/25 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-[0_0_50px_rgba(214,83,53,0.3)]">
                <Logo className="w-20 h-20" />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0A0A0F] to-transparent"></div>
          </div>

          <div className="flex w-full flex-col items-stretch justify-center gap-1 p-5 -mt-12 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-primary/20 text-primary dark:text-primary/90 text-[10px] font-bold uppercase tracking-wider">
                Sesión: {status?.session || 'principal'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isGatewayOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {isGatewayOnline ? 'Gateway Online' : 'Modo Demo'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
              Aquisito <span className="text-primary">Inteligente</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-snug">
              Tu agente autónomo local analiza información de interés y señales del enjambre en tiempo real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AgentHero;

