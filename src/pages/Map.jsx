import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { sendTelegramViaAgent } from '../services/openclawApi';

const DEMO_AGENTS = [
  { id: 'oc-1', x: 48, y: 30, sentiment: 92, name: 'Scout-α' },
  { id: 'oc-2', x: 85, y: 40, sentiment: 78, name: 'Navigator-β' },
  { id: 'oc-3', x: 52, y: 35, sentiment: 88, name: 'Analyst-γ' },
  { id: 'oc-4', x: 55, y: 38, sentiment: 65, name: 'Sentinel-δ' },
  { id: 'oc-5', x: 25, y: 32, sentiment: 95, name: 'Curator-ε' },
  { id: 'oc-6', x: 70, y: 45, sentiment: 72, name: 'Pathfinder-ζ' },
];

const CITIES = [
  { id: 'paris', name: 'Paris (Eiffel Tower)', top: '30%', left: '48%', icon: 'tour' },
  { id: 'tokyo', name: 'Tokyo (Shibuya)', top: '40%', left: '85%', icon: 'festival' },
  { id: 'rome', name: 'Rome (Colosseum)', top: '35%', left: '52%', icon: 'account_balance' },
  { id: 'santorini', name: 'Santorini (Oia)', top: '38%', left: '55%', icon: 'sailing' },
  { id: 'newyork', name: 'New York (Times Sq)', top: '32%', left: '25%', icon: 'location_city' },
  { id: 'bali', name: 'Bali (Ubud)', top: '52%', left: '78%', icon: 'spa' },
];

export default function Map() {
  const navigate = useNavigate();
  const { wsStatus, isConnected, isGatewayOnline, send, runSkill } = useOpenClaw();
  const [agents, setAgents] = useState(DEMO_AGENTS);
  const [interactions, setInteractions] = useState({});
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [agentInsight, setAgentInsight] = useState(null);
  const [mapScale, setMapScale] = useState(1);
  const agentsRef = useRef(agents);

  // Animate agents wandering
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) => {
        const next = prev.map((agent) => ({
          ...agent,
          x: Math.max(5, Math.min(95, agent.x + (Math.random() - 0.5) * 3)),
          y: Math.max(20, Math.min(70, agent.y + (Math.random() - 0.5) * 2)),
          sentiment: Math.max(30, Math.min(100, agent.sentiment + (Math.random() - 0.48) * 5)),
        }));
        agentsRef.current = next;
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Simulate agent dialogue bubbles
  useEffect(() => {
    if (agents.length === 0) return;
    const messages = [
      '🗼 Eiffel Tower queue: 45 min',
      '🍣 Found hidden ramen spot!',
      '🏛️ Colosseum best at sunset',
      '⛵ Boat tour: €35/person',
      '📸 Best photo spot found!',
      '☕ Amazing local café nearby',
      '🎭 Street performance starting',
      '🌅 Perfect viewing time: 6:30 PM',
      '⚠️ Pickpocket alert in area',
      '🎉 Local festival today!',
    ];

    const interval = setInterval(() => {
      const currentAgents = agentsRef.current;
      const randomAgent = currentAgents[Math.floor(Math.random() * currentAgents.length)];
      if (!randomAgent) return;
      const message = messages[Math.floor(Math.random() * messages.length)];
      setInteractions((prev) => ({ ...prev, [randomAgent.id]: message }));

      setTimeout(() => {
        setInteractions((prev) => {
          const next = { ...prev };
          delete next[randomAgent.id];
          return next;
        });
      }, 4000);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Handle city click — invoke trip_analyzer skill explicitly
  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setAgentInsight({ loading: true, city: city.name });

    // Use explicit skill invocation with trip_analyzer
    const result = await runSkill(
      'trip_analyzer',
      { destination: city.name, action: 'full_analysis' },
      `Analyze ${city.name} for tourist insights, safety, costs, and local recommendations`
    );

    // Extract response text from result
    const text = result?.result || result?.content || result?.text;
    if (text && !result?.error && !result?.demo) {
      setAgentInsight({ loading: false, city: city.name, text });
    } else {
      setAgentInsight({
        loading: false,
        city: city.name,
        text: result?.demo
          ? `📍 ${city.name} — Connect to ZeroClaw to get real AI analysis. The trip_analyzer skill will evaluate safety, costs, crowds, and hidden gems.`
          : `Analyzing ${city.name}... Check the console for the full agent response.`,
      });
    }

    if (telegramEnabled) {
      sendTelegramViaAgent(`📍 *TripClaw Explorer*\nUser explored *${city.name}* via OpenClaw agent map.`);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden font-display text-slate-900 dark:text-white bg-background-light dark:bg-background-dark">
      {/* Top HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-white/90 dark:from-background-dark/90 to-transparent p-4">
        <div className="flex items-center justify-between mb-4 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-background-dark/80 border border-slate-200 dark:border-violet-500/30 text-slate-900 dark:text-white shadow-sm"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Global Explorer Map</h2>
              <p className="text-violet-500 text-xs font-medium uppercase tracking-widest flex items-center gap-1">
                OpenClaw Swarm
                {isConnected && (
                  <span className="size-2 bg-emerald-500 rounded-full animate-pulse inline-block ml-1" title="OpenClaw Gateway Connected"></span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/console')}
              className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 border border-violet-200 dark:border-violet-700/50 text-violet-600 dark:text-fuchsia-400 shadow-sm"
            >
              <span className="material-symbols-outlined">terminal</span>
            </button>
            <button className="flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-background-dark/80 border border-slate-200 dark:border-violet-500/30 text-violet-500 shadow-sm relative">
              <span className="material-symbols-outlined">smart_toy</span>
              <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">{agents.length}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1 rounded-xl p-3 bg-white/60 dark:bg-background-dark/60 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
            <p className="text-slate-500 dark:text-[#9db2b9] text-[10px] font-bold uppercase tracking-wider">Active Agents</p>
            <div className="flex items-baseline gap-1">
              <p className="text-slate-900 dark:text-white text-xl font-bold">{agents.length}</p>
              <span className="text-violet-500 text-[10px]">OpenClaw</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-1 rounded-xl p-3 bg-white/60 dark:bg-background-dark/60 border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-sm">
            <p className="text-slate-500 dark:text-[#9db2b9] text-[10px] font-bold uppercase tracking-wider">Avg Sentiment</p>
            <div className="flex items-baseline gap-1">
              <p className="text-slate-900 dark:text-white text-xl font-bold">
                {agents.length ? Math.round(agents.reduce((acc, curr) => acc + (curr.sentiment || 50), 0) / agents.length) : 0}%
              </p>
              <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Layer */}
      <div className="relative flex-1 bg-slate-200 dark:bg-background-dark">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB64f9eh3uPzbFyCqCz-0AfKFHQ0UXRglW1t5tU_X0MnaGW-gNAFwwrbzDagR6k8e1JikvWQR5bCcxJMQ7gyilc5G_eTWXpYHjsWIxA-dexa9D61BR0kzxWWBlkoHtqERHQ_21GrO4_PVENt19EAJdXNARIVErXR8EB65lwliHjlTINeVjvh-klK5WKi-9Lm-F8lAoD0EG-eI_YT_nBMJsuzcjgHAbDY0Mg5Iwq4sd_rOKr-Au_3pamEGfkYkKIuZ6e_laWTpZyPXU")',
            transform: `scale(${mapScale})`,
          }}
        >
          {/* Fog overlay */}
          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 backdrop-grayscale"></div>
          <div className="absolute inset-0 fog-overlay mix-blend-multiply dark:mix-blend-normal"></div>

          {/* OpenClaw Swarm Agents */}
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="absolute transition-all duration-1000 ease-in-out flex flex-col items-center z-10"
              style={{ left: `${agent.x}%`, top: `${agent.y}%` }}
            >
              {/* Interaction Bubble */}
              {interactions[agent.id] && (
                <div className="absolute -top-12 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg border border-violet-200 dark:border-violet-700 whitespace-nowrap z-20 animate-bounce">
                  {interactions[agent.id]}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 rotate-45 border-b border-r border-violet-200 dark:border-violet-700"></div>
                </div>
              )}

              <div
                className="relative cursor-pointer hover:scale-125 transition-transform"
                onClick={() => setInteractions((prev) => ({ ...prev, [agent.id]: `${agent.name}: Scanning area...` }))}
                title={`${agent.name} — Sentiment: ${Math.round(agent.sentiment)}%`}
              >
                <div className="absolute -inset-2 rounded-full bg-violet-500/40 blur-md animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white size-6 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <span className="material-symbols-outlined text-xs">smart_toy</span>
                </div>
              </div>
              {agent.sentiment > 85 && (
                <div className="mt-1 px-1 bg-white/90 dark:bg-background-dark/80 rounded border border-emerald-500 backdrop-blur-sm text-[8px] font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shadow-sm">
                  High Confidence
                </div>
              )}
            </div>
          ))}

          {/* City Landmarks */}
          {CITIES.map((city) => (
            <div
              key={city.id}
              className="absolute flex flex-col items-center z-0 cursor-pointer hover:scale-110 transition-transform"
              style={{ top: city.top, left: city.left }}
              onClick={() => handleCityClick(city)}
            >
              <div className="relative bg-blue-600/80 text-white size-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg backdrop-blur-sm">
                <span className="material-symbols-outlined text-lg">{city.icon}</span>
              </div>
              <div className="mt-2 px-2 py-1 bg-white/90 dark:bg-background-dark/80 rounded border border-blue-500 backdrop-blur-sm text-[10px] font-bold text-slate-900 dark:text-white whitespace-nowrap shadow-md">
                {city.name}
              </div>
            </div>
          ))}
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          <div className="flex flex-col rounded-xl bg-white/80 dark:bg-background-dark/80 border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-sm">
            <button onClick={() => setMapScale((s) => Math.min(s + 0.25, 3))} className="flex size-12 items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined">add</span>
            </button>
            <div className="h-[1px] bg-slate-200 dark:bg-white/10 mx-2"></div>
            <button onClick={() => setMapScale((s) => Math.max(s - 0.25, 0.5))} className="flex size-12 items-center justify-center hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white">
              <span className="material-symbols-outlined">remove</span>
            </button>
          </div>
          <button className="flex size-12 items-center justify-center rounded-xl bg-white/80 dark:bg-background-dark/80 border border-slate-200 dark:border-white/10 backdrop-blur-md text-violet-500 shadow-sm">
            <span className="material-symbols-outlined">near_me</span>
          </button>
        </div>
      </div>

      {/* Agent Insight Modal */}
      {agentInsight && (
        <div className="absolute inset-x-0 top-1/3 z-30 px-4">
          <div className="bg-white/95 dark:bg-[#1c2427]/95 backdrop-blur-2xl border border-violet-200 dark:border-violet-800/50 rounded-2xl p-5 shadow-2xl max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-sm">neurology</span>
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white text-sm font-bold">{agentInsight.city}</p>
                  <p className="text-violet-500 text-[10px] uppercase font-bold tracking-wider">OpenClaw Insight</p>
                </div>
              </div>
              <button
                onClick={() => setAgentInsight(null)}
                className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            {agentInsight.loading ? (
              <div className="flex items-center gap-2 text-violet-500">
                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                <span className="text-sm">Agent analyzing...</span>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{agentInsight.text}</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-4 pb-8 flex flex-col gap-4">
        {/* FAB */}
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={() => navigate('/console')}
            className="flex items-center justify-center rounded-full h-14 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold gap-3 shadow-lg shadow-violet-500/30 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">terminal</span>
            <span className="truncate">Agent Console</span>
          </button>
        </div>

        {/* Toggle Panels */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-background-dark/90 backdrop-blur-xl p-4 shadow-xl">
            <div className="flex gap-4 items-center">
              <div className="size-10 flex items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-sm font-bold leading-tight">OpenClaw Gateway</p>
                <p className="text-slate-500 dark:text-[#9db2b9] text-xs font-normal">
                  {isGatewayOnline ? 'Agent connected via local gateway' : 'Demo mode — localhost:18789'}
                </p>
              </div>
            </div>
            <label className="relative flex h-[28px] w-[48px] cursor-pointer items-center rounded-full bg-slate-200 dark:bg-[#283539] p-0.5 has-[:checked]:bg-violet-600 transition-colors">
              <input type="checkbox" className="invisible absolute peer" checked={isConnected} readOnly />
              <div className="h-full w-[24px] rounded-full bg-white shadow-md transition-all peer-checked:translate-x-5 peer-[:not(:checked)]:translate-x-0"></div>
            </label>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-background-dark/90 backdrop-blur-xl p-4 shadow-xl">
            <div className="flex gap-4 items-center">
              <div className="size-10 flex items-center justify-center rounded-full bg-[#0088cc]/10 text-[#0088cc]">
                <span className="material-symbols-outlined">send</span>
              </div>
              <div className="flex flex-col">
                <p className="text-slate-900 dark:text-white text-sm font-bold leading-tight">Telegram Alerts</p>
                <p className="text-slate-500 dark:text-[#9db2b9] text-xs font-normal">Forward intel via OpenClaw skill</p>
              </div>
            </div>
            <label className="relative flex h-[28px] w-[48px] cursor-pointer items-center rounded-full bg-slate-200 dark:bg-[#283539] p-0.5 has-[:checked]:bg-[#0088cc] transition-colors">
              <input
                type="checkbox"
                className="invisible absolute peer"
                checked={telegramEnabled}
                onChange={(e) => setTelegramEnabled(e.target.checked)}
              />
              <div className="h-full w-[24px] rounded-full bg-white shadow-md transition-all translate-x-0 peer-checked:translate-x-5 peer-[:not(:checked)]:translate-x-0"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
