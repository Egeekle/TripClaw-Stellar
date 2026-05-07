import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { sendTelegramViaAgent } from '../services/openclawApi';

export default function Dashboard() {
  const navigate = useNavigate();
  const { status, wsStatus, agentEvents, tools, isConnected, isGatewayOnline, send } = useOpenClaw();

  // Simulated live feed when gateway is offline (demo mode)
  const [demoEvents, setDemoEvents] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (isGatewayOnline && agentEvents.length > 0) return; // Use real events

    const intents = [
      { agent: 'Carlos', action: 'wants to hike tomorrow in Sacred Valley', type: 'Adventure' },
      { agent: 'Ana & Luis', action: 'looking for a foodie group in Lima tonight', type: 'Food' },
      { agent: '2 Travelers', action: 'going surfing in Miraflores, 1 spot left', type: 'Sports' },
      { agent: 'Elena', action: 'searching for ride-share to Colca Canyon', type: 'Transport' },
      { agent: 'Marc', action: 'wants to split a guide for Machu Picchu', type: 'Culture' },
    ];

    const interval = setInterval(() => {
      const randomIntent = intents[Math.floor(Math.random() * intents.length)];

      setDemoEvents((prev) => [
        { id: Date.now(), agent: randomIntent.agent, action: randomIntent.action, time: 'Just now' },
        ...prev.map((e) => ({ ...e, time: e.time === 'Just now' ? '1m ago' : e.time })).slice(0, 4),
      ]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isGatewayOnline, agentEvents]);

  const displayEvents = isGatewayOnline && agentEvents.length > 0
    ? agentEvents.map((e) => ({
        id: e.id,
        agent: e.tool || 'OpenClaw Agent',
        action: e.content,
        time: e.time,
      }))
    : demoEvents;

  const statusColor = {
    connected: 'bg-emerald-500',
    connecting: 'bg-amber-400',
    disconnected: 'bg-slate-400',
    error: 'bg-red-500',
  };

  const statusLabel = {
    connected: 'OpenClaw Live',
    connecting: 'Connecting…',
    disconnected: 'Offline',
    error: 'Error',
  };

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl text-sm font-bold transition-all animate-bounce ${
          toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex size-12 shrink-0 items-center">
            {/* OpenClaw Avatar */}
            <div className="relative">
              <div className="size-10 rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center shadow-lg shadow-fuchsia-500/20">
                <span className="material-symbols-outlined text-white text-xl font-bold">smart_toy</span>
              </div>
              <span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white dark:border-background-dark ${statusColor[wsStatus]} ${wsStatus === 'connected' ? 'animate-pulse' : ''}`}></span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">TripClaw</h2>
            <div className="flex items-center gap-1">
              <span className={`size-2 rounded-full ${statusColor[wsStatus]} ${wsStatus === 'connected' ? 'animate-pulse' : ''}`}></span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                {statusLabel[wsStatus]}
              </span>
            </div>
          </div>
          <div className="flex w-12 items-center justify-end">
            <button
              onClick={() => navigate('/console')}
              className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 dark:from-violet-600/30 dark:to-fuchsia-500/30 text-violet-600 dark:text-fuchsia-400 border border-violet-200 dark:border-violet-800/50"
            >
              <span className="material-symbols-outlined">terminal</span>
            </button>
          </div>
        </div>
      </div>

      <main className="px-4 space-y-6">
        {/* OpenClaw Agent Status Hero */}
        <section className="mt-4">
          <div className="relative group">
            {/* Badge */}
            <div className="absolute -top-3 -right-2 z-10 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-violet-500/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">psychology</span>
              OpenClaw Agent
            </div>
            <div className="flex flex-col items-stretch justify-start rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-[#1c2427] border border-slate-100 dark:border-none">
              {/* Gradient Hero instead of image */}
              <div className="w-full aspect-[16/9] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-fuchsia-800 to-slate-900"></div>
                {/* Animated grid pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}></div>
                {/* Animated blobs */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-violet-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-20 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl">
                    <span className="material-symbols-outlined text-white text-4xl">neurology</span>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#1c2427] to-transparent"></div>
              </div>

              <div className="flex w-full flex-col items-stretch justify-center gap-1 p-5 -mt-12 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-500 dark:text-violet-400 text-[10px] font-bold uppercase tracking-wider">
                    Session: {status?.session || 'main'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    Gateway {status?.gateway || 'checking...'}
                  </span>
                </div>
                <p className="text-slate-900 dark:text-white text-2xl font-bold leading-tight tracking-tight">Agent Control Panel</p>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-800 dark:text-slate-300 text-base font-medium">
                      {status?.agentsCount || tools.length || 0} Skills/Tools Available
                    </p>
                    <p className="text-slate-500 text-xs font-normal">
                      {isGatewayOnline ? 'Autonomous agent running on local gateway' : 'Demo mode — configure OpenClaw gateway to activate'}
                    </p>
                  </div>

                  {/* Connection Indicator */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-500 dark:text-slate-400 text-xs">Agent Uptime</span>
                      <span className="text-slate-900 dark:text-white text-xs font-bold">
                        {isGatewayOnline ? 'Active' : 'Standby'}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          isConnected
                            ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_8px_rgba(167,139,250,0.6)]'
                            : 'bg-slate-400'
                        }`}
                        style={{ width: isConnected ? '100%' : '15%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span className={`material-symbols-outlined text-[14px] ${isConnected ? 'animate-spin text-violet-500' : ''}`}>sync</span>
                      {isConnected ? 'WebSocket Sync' : 'No Connection'}
                    </div>
                    <button
                      onClick={() => navigate('/map')}
                      className="flex h-9 px-5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white rounded-lg text-sm font-bold items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-violet-500/20"
                    >
                      View Swarm Map
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Tools / Skills */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Active Skills</h2>
            <span
              onClick={() => navigate('/console')}
              className="text-violet-500 text-xs font-medium cursor-pointer hover:text-fuchsia-500 transition-colors"
            >
              Manage →
            </span>
          </div>
          <div className="space-y-3">
            {(tools.length > 0 ? tools.slice(0, 3) : [
              { name: 'trip_analyzer', description: 'Analyzes destinations for safety, cost, and sentiment', type: 'skill' },
              { name: 'weather_forecast', description: 'Real-time weather data for trip planning', type: 'skill' },
              { name: 'local_recommender', description: 'AI-curated local food, culture, and activities', type: 'skill' },
            ]).map((tool, i) => (
              <div key={tool.name || i} onClick={() => navigate('/console')} className="flex items-center gap-4 bg-white dark:bg-[#1c2427]/50 border border-slate-100 dark:border-white/5 rounded-xl p-3 justify-between shadow-sm cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-200 dark:border-violet-800/30">
                      <span className="material-symbols-outlined text-violet-500 dark:text-fuchsia-400 text-xl">
                        {i === 0 ? 'analytics' : i === 1 ? 'cloud' : 'explore'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 dark:text-white text-base font-bold line-clamp-1">{tool.name}</p>
                      <span className="text-[10px] bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 px-1.5 rounded uppercase font-bold tracking-tighter">
                        {tool.type || 'Skill'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-normal line-clamp-1">{tool.description}</p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-violet-500">
                  <span className="material-symbols-outlined text-lg">play_arrow</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Telegram Bot Integration */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Telegram Bot</h2>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-500">@Vogaye_bot</span>
          </div>
          <div className="bg-white dark:bg-[#1c2427]/50 border border-slate-100 dark:border-white/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-xl bg-[#0088cc]/10 flex items-center justify-center border border-[#0088cc]/20">
                <span className="material-symbols-outlined text-[#0088cc] text-xl">send</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 dark:text-white text-base font-bold">@Vogaye_bot</p>
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Chat ID: {import.meta.env.VITE_TELEGRAM_CHAT_ID || 'Not set'}</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await sendTelegramViaAgent('🦀 *TripClaw Bot Active!*\nYour agent is connected and ready to send travel alerts.');
                  showToast('success', '✅ Message sent! Check your Telegram.');
                } catch (err) {
                  showToast('error', '❌ Error: ' + err.message);
                }
              }}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-[#0088cc] text-white font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-[#0088cc]/20"
            >
              <span className="material-symbols-outlined text-lg">send</span>
              Send Test Message
            </button>
          </div>
        </section>

        {/* Swarm Voting */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Swarm Voting</h2>
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">On-Chain</span>
          </div>
          <div className="bg-white dark:bg-[#1c2427]/50 border border-slate-100 dark:border-white/5 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <span className="material-symbols-outlined text-indigo-500 text-xl">how_to_vote</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-slate-900 dark:text-white text-base font-bold">Decide the Next Activity</p>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Vote with your Swarm securely using Stellar Testnet.</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/vote')}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-indigo-500/20"
            >
              <span className="material-symbols-outlined text-lg">how_to_vote</span>
              Vote Now
            </button>
          </div>
        </section>

        {/* Live Agent Feed */}
        <section>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-slate-900 dark:text-white text-xl font-bold tracking-tight">Travel Swarm: Live Intent Feed</h2>
            <span className="flex items-center gap-1 text-violet-500 text-xs font-medium">
              <span className="size-2 bg-violet-500 rounded-full animate-pulse"></span>
              {isConnected ? 'Live' : 'Demo'}
            </span>
          </div>
          <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-violet-300 dark:before:via-violet-800 before:to-transparent">
            {displayEvents.map((event) => (
              <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-[#1c2427] bg-violet-500/20 text-violet-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#1c2427]/50 border border-slate-100 dark:border-white/5 p-3 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{event.agent}</div>
                    <time className="font-medium text-violet-500 text-xs">{event.time}</time>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-xs">{event.action}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 px-6 pb-8 pt-4 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <button className="flex flex-col items-center gap-1 text-violet-600 dark:text-fuchsia-400">
            <span className="material-symbols-outlined font-bold">dashboard</span>
            <span className="text-[10px] font-bold">Home</span>
          </button>
          <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined">map</span>
            <span className="text-[10px] font-medium">Explore</span>
          </button>

          <button
            onClick={() => navigate('/console')}
            className="relative -top-8 size-14 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 shadow-lg shadow-violet-500/40 flex items-center justify-center text-white border-4 border-white dark:border-background-dark"
          >
            <span className="material-symbols-outlined text-[30px] font-bold">neurology</span>
          </button>

          <button onClick={() => navigate('/console')} className="flex flex-col items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined">hub</span>
            <span className="text-[10px] font-medium">Skills</span>
          </button>
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 text-slate-500">
            <span className="material-symbols-outlined">settings</span>
            <span className="text-[10px] font-medium">Config</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
