import React from 'react';
import { COMPANIONS } from '../constants/onboardingData';

export default function StepCompanion({ identity, setIdentity }) {
  return (
    <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="tracking-tight text-[32px] font-bold leading-tight pt-2">Choose Companion</h1>
        <p className="text-slate-500 text-base mt-2">
          Select your AI Agent persona. This will represent your node on the global map.
        </p>
      </div>

      <div className="space-y-4">
        {COMPANIONS.map(comp => (
          <button 
            key={comp.id}
            onClick={() => setIdentity({...identity, companion: comp.id})}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
              identity.companion === comp.id 
                ? 'border-fuchsia-500 bg-white dark:bg-white/5 shadow-xl scale-[1.02]' 
                : 'border-transparent bg-slate-100 dark:bg-white/5 opacity-70 hover:opacity-100'
            }`}
          >
            <div className={`size-14 rounded-xl bg-gradient-to-br ${comp.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
              <span className="material-symbols-outlined text-2xl">{comp.icon}</span>
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-lg">{comp.name}</h3>
              <p className="text-xs text-slate-500">{comp.desc}</p>
            </div>
            {identity.companion === comp.id && (
              <span className="material-symbols-outlined text-fuchsia-500">check_circle</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
