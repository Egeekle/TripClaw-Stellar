import L from 'leaflet';

export const createSwarmIcon = (swarm) => {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="flex flex-col items-center cursor-pointer hover:scale-110 transition-transform relative -top-6 -left-1/2 min-w-max group">
        <div class="relative ${swarm.color}/90 text-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-white shadow-xl backdrop-blur-sm z-10">
          <span class="material-symbols-outlined text-xl">${swarm.icon}</span>
          <span class="absolute -top-2 -right-2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-white">${swarm.members}</span>
        </div>
        <div class="mt-1 px-3 py-1.5 bg-white/95 rounded-xl border border-slate-200 backdrop-blur-sm text-center shadow-lg group-hover:border-violet-400 transition-colors">
          <div class="text-[11px] font-black text-slate-900 whitespace-nowrap">${swarm.name}</div>
          <div class="text-[9px] font-bold text-violet-500 uppercase tracking-widest mt-0.5">Join Swarm</div>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

export const createAgentIcon = (agent, interaction) => {
  const confidenceBadge = agent.sentiment > 85 
    ? `<div class="mt-1 px-1 bg-white/90 rounded border border-emerald-500 backdrop-blur-sm text-[8px] font-bold text-emerald-600 whitespace-nowrap shadow-sm">High Confidence</div>` 
    : '';

  const bubble = interaction 
    ? `<div class="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-800 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg border border-violet-200 whitespace-nowrap z-20 animate-bounce">
        ${interaction}
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-b border-r border-violet-200"></div>
      </div>`
    : '';

  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `
      <div class="absolute flex flex-col items-center relative -top-3 -left-3 transition-all">
        ${bubble}
        <div class="relative cursor-pointer hover:scale-125 transition-transform group" title="${agent.name} — Sentiment: ${Math.round(agent.sentiment)}%">
          <div class="absolute -inset-2 rounded-full bg-violet-500/40 blur-md animate-pulse"></div>
          <div class="relative bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <span class="material-symbols-outlined text-[10px]">smart_toy</span>
          </div>
        </div>
        ${confidenceBadge}
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};
