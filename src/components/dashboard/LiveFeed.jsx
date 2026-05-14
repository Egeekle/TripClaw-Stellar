import React from 'react';

export default function LiveFeed({ events }) {
  return (
    <section className="space-y-4 pb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black flex items-center gap-2">
          <span className="material-symbols-outlined text-fuchsia-500">sensors</span>
          Live Travel Feed
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded">
          Real-time
        </span>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">stream</span>
            <p className="text-sm text-slate-400 font-medium">Waiting for swarm intent data...</p>
          </div>
        ) : (
          events.map((event) => (
            <div 
              key={event.id} 
              className="group p-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-start gap-4 animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="size-10 rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center shrink-0 border border-violet-500/20">
                <span className="material-symbols-outlined text-violet-500 text-xl">person_search</span>
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
              <button className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-violet-500 transition-colors">
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
              </button>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
