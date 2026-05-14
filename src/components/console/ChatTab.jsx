import { useEffect, useRef } from 'react';

const QUICK_COMMANDS = [
  { label: '📍 Analyze Cusco', skill: 'trip_analyzer', query: 'Analyze Cusco for safety, altitude sickness tips, costs, and hidden gems' },
  { label: '🗺️ Plan Lima Trip', skill: 'itinerary_builder', query: 'Create a 3-day itinerary for Lima focusing on gastronomy and culture' },
  { label: '☀️ Arequipa Weather', skill: 'weather_forecast', query: 'Weather forecast for Arequipa this week' },
  { label: '💎 Hidden Gems', skill: 'local_recommender', query: 'Best hidden restaurants and local experiences in the Sacred Valley' },
];

export default function ChatTab({ messages, isThinking, isGatewayOnline, runSkill }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-700">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 mb-6 group">
              <span className="material-symbols-outlined text-white text-4xl group-hover:scale-110 transition-transform">neurology</span>
            </div>
            <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">OpenClaw Agent Ready</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">
              {isGatewayOnline
                ? 'Your agent is connected and ready. Ask anything about destinations, safety, or trip planning.'
                : 'Configure your OpenClaw gateway (localhost:18789) to enable live agent responses.'}
            </p>

            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_COMMANDS.map((qc) => (
                <button
                  key={qc.label}
                  onClick={() => runSkill(qc.skill, { query: qc.query, destination: qc.query }, qc.query)}
                  className="text-left px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-500/5 transition-all active:scale-[0.97]"
                >
                  {qc.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            {msg.role !== 'user' && (
              <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md">
                <span className="material-symbols-outlined text-white text-sm">neurology</span>
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-br-md shadow-lg shadow-violet-500/20'
                  : 'bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-sm'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
              {msg.timestamp && (
                <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="shrink-0 size-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300 text-sm">person</span>
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-3 justify-start animate-pulse">
            <div className="shrink-0 size-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-sm animate-spin">progress_activity</span>
            </div>
            <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex items-center gap-2 text-violet-500 text-sm">
                <div className="flex gap-1">
                  <span className="size-1.5 bg-violet-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="size-1.5 bg-fuchsia-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="size-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs font-bold">Agent processing…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
