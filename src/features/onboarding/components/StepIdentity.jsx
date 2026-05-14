import React from 'react';
import { TRAVELER_TYPES } from '../constants/onboardingData';

export default function StepIdentity({ identity, setIdentity }) {
  return (
    <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div>
        <h1 className="tracking-tight text-[32px] font-bold leading-tight pt-2">Traveler Identity</h1>
        <p className="text-slate-500 text-base mt-2">
          How should the Swarm know you? Your identity dictates your starting skills and network reputation.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold ml-1">Nickname</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
          <input 
            type="text" 
            placeholder="AndeanNomad"
            value={identity.nickname}
            onChange={(e) => setIdentity({...identity, nickname: e.target.value.replace(/\s+/g, '')})}
            className="w-full h-14 pl-10 pr-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-lg focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-bold ml-1">Traveler Type</label>
        <div className="grid grid-cols-2 gap-3">
          {TRAVELER_TYPES.map(type => (
            <button 
              key={type.id}
              onClick={() => setIdentity({...identity, travelerType: type.id})}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                identity.travelerType === type.id 
                  ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-md scale-[1.02]' 
                  : 'border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 text-slate-500 hover:border-violet-300'
              }`}
            >
              <span className="material-symbols-outlined text-3xl mb-2">{type.icon}</span>
              <span className="text-xs font-bold text-center">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
