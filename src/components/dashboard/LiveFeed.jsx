import React, { useState, useEffect } from 'react';

// PERFORMANCE: Move static fallback data outside the component to prevent redundant allocation on every render.
const DEMO_INTENTS = [
  { agent: 'Carlos', action: 'quiere hacer trekking mañana en el Valle Sagrado', type: 'Adventure' },
  { agent: 'Ana & Luis', action: 'buscan grupo para comer ceviche en Miraflores', type: 'Food' },
  { agent: '2 Viajeros', action: 'van a surfear en Costa Verde, queda 1 cupo', type: 'Sports' },
  { agent: 'Elena', action: 'busca compartir taxi para ir al Cañón del Colca', type: 'Transport' },
  { agent: 'Marc', action: 'busca compañero para guía privado en Machu Picchu', type: 'Culture' },
];

export default function LiveFeed({ agentEvents = [], isGatewayOnline = false }) {
  // PERFORMANCE: Moving this high-frequency state down to the component that actually uses it
  // prevents the entire Dashboard parent from re-rendering every 3.5 seconds.
  const [demoEvents, setDemoEvents] = useState([]);

  useEffect(() => {
    // If gateway is online and has real events, we don't need the demo interval
    if (isGatewayOnline && agentEvents.length > 0) return;

    const interval = setInterval(() => {
      const randomIntent = DEMO_INTENTS[Math.floor(Math.random() * DEMO_INTENTS.length)];
      setDemoEvents((prev) => [
        { id: Date.now(), agent: randomIntent.agent, action: randomIntent.action, time: 'Hace un momento' },
        ...prev.map((e) => ({ ...e, time: e.time === 'Hace un momento' ? 'Hace 1m' : e.time })).slice(0, 4),
      ]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isGatewayOnline, agentEvents]);

  const activeEvents = isGatewayOnline && agentEvents.length > 0 ? agentEvents : demoEvents;

  return (
    <section className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">sensors</span>
          Señales del Enjambre
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
          Tiempo Real
        </span>
      </div>

      <div className="space-y-3">
        {activeEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">stream</span>
            <p className="text-sm text-slate-400 font-medium">Esperando datos de intención del enjambre...</p>
          </div>
        ) : (
          activeEvents.map((event) => (
            <div 
              key={event.id} 
              className="group p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 border border-accent/20">
                <span className="material-symbols-outlined text-accent text-xl">person_search</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-bold text-sm text-slate-900 dark:text-white">@{event.agent}</p>
                  <p className="text-[10px] font-medium text-slate-400">{event.time}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {event.action}
                </p>
              </div>
              <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
