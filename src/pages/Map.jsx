import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { sendTelegramViaAgent } from '../services/openclawApi';
import { discoveryEngine } from '../services/discoveryService';
import { xpService } from '../services/xpService';
import HiddenDiscoveryOverlay from '../components/HiddenDiscoveryOverlay';
import LevelUpModal from '../components/LevelUpModal';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon issues if any, though we use custom ones
delete L.Icon.Default.prototype._getIconUrl;

const DEMO_AGENTS = [
  { id: 'oc-1', lat: -13.5, lng: -72.0, sentiment: 92, name: 'Scout-α' },
  { id: 'oc-2', lat: -12.1, lng: -77.0, sentiment: 78, name: 'Navigator-β' },
  { id: 'oc-3', lat: -15.5, lng: -71.5, sentiment: 88, name: 'Analyst-γ' },
  { id: 'oc-4', lat: -14.0, lng: -75.0, sentiment: 65, name: 'Sentinel-δ' },
  { id: 'oc-5', lat: -10.0, lng: -76.0, sentiment: 95, name: 'Curator-ε' },
  { id: 'oc-6', lat: -5.0, lng: -73.0, sentiment: 72, name: 'Pathfinder-ζ' },
];

const SWARMS = [
  { id: 'cusco', name: 'Cusco Backpackers', type: 'Adventure', lat: -13.1631, lng: -72.5450, icon: 'hiking', color: 'bg-emerald-600', members: 4 },
  { id: 'lima', name: 'Lima Food Hunters', type: 'Gastronomy', lat: -12.1211, lng: -77.0294, icon: 'ramen_dining', color: 'bg-orange-600', members: 6 },
  { id: 'arequipa', name: 'Arequipa Explorers', type: 'Nature', lat: -15.6074, lng: -71.8690, icon: 'volcano', color: 'bg-red-600', members: 3 },
  { id: 'puno', name: 'Lake Titicaca Nomads', type: 'Culture', lat: -15.8402, lng: -70.0219, icon: 'sailing', color: 'bg-blue-600', members: 5 },
  { id: 'iquitos', name: 'Amazon River Expeditions', type: 'Wilderness', lat: -3.7491, lng: -73.2243, icon: 'forest', color: 'bg-green-700', members: 2 },
  { id: 'nazca', name: 'Nazca Flyers', type: 'History', lat: -14.8288, lng: -74.9436, icon: 'flight', color: 'bg-violet-600', members: 8 },
];

const createSwarmIcon = (swarm) => {
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

const createAgentIcon = (agent, interaction) => {
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

export default function Map() {
  const navigate = useNavigate();
  const { wsStatus, isConnected, isGatewayOnline, send, runSkill } = useOpenClaw();
  const [agents, setAgents] = useState(DEMO_AGENTS);
  const [interactions, setInteractions] = useState({});
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [agentInsight, setAgentInsight] = useState(null);
  const [activeDiscovery, setActiveDiscovery] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const agentsRef = useRef(agents);

  // Animate agents wandering in Peru
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) => {
        const next = prev.map((agent) => ({
          ...agent,
          lat: Math.max(-18, Math.min(0, agent.lat + (Math.random() - 0.5) * 0.5)),
          lng: Math.max(-81, Math.min(-68, agent.lng + (Math.random() - 0.5) * 0.5)),
          sentiment: Math.max(30, Math.min(100, agent.sentiment + (Math.random() - 0.48) * 5)),
        }));
        agentsRef.current = next;
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate agent dialogue bubbles
  useEffect(() => {
    if (agents.length === 0) return;
    const messages = [
      '🗻 Machu Picchu is breathtaking',
      '🏄‍♂️ Great waves in Miraflores',
      '🦅 Condor spotted in Colca Canyon',
      '🚤 Lake Titicaca boat tour starting',
      '🐒 Amazing Amazon jungle walk!',
      '🛩️ Nazca Lines flight: $80',
      '🍹 Trying an authentic Pisco Sour',
      '🥘 Delicious Ceviche found in Lima',
      '⚠️ Remember to acclimatize in Cusco',
      '🎉 Inti Raymi festival preparations!',
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
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  // Simulate Geo-Spatial AI Engine Triggering
  useEffect(() => {
    const checkEnvironment = async () => {
      if (activeDiscovery) return; // Don't trigger if one is already open
      
      const profile = JSON.parse(localStorage.getItem('tripclaw_identity') || '{}');
      const mockEnv = { time: 'night', weather: 'clear', crowdDensity: 'low' };
      
      const discovery = await discoveryEngine.evaluateLocation(null, profile, mockEnv);
      if (discovery) {
        setActiveDiscovery(discovery);
      }
    };

    // Attempt to trigger a discovery every 15 seconds
    const interval = setInterval(checkEnvironment, 15000);
    return () => clearInterval(interval);
  }, [activeDiscovery]);

  // Handle city click — invoke trip_analyzer skill explicitly
  const handleCityClick = async (city) => {
    setSelectedCity(city);
    setAgentInsight({ loading: true, city: city.name });

    const result = await runSkill(
      'trip_analyzer',
      { destination: city.name, action: 'full_analysis' },
      `Analyze ${city.name} for tourist insights, safety, costs, and local recommendations`
    );

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
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-white/90 dark:from-background-dark/90 to-transparent p-4 pointer-events-none">
        <div className="flex items-center justify-between mb-4 mt-2 pointer-events-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex size-10 items-center justify-center rounded-full bg-white/80 dark:bg-background-dark/80 border border-slate-200 dark:border-violet-500/30 text-slate-900 dark:text-white shadow-sm"
            >
              <span className="material-symbols-outlined">arrow_back_ios_new</span>
            </button>
            <div>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">Peru Explorer Map</h2>
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
        <div className="flex gap-3 pointer-events-auto">
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

      {/* Interactive Map Layer */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[-9.19, -75.01]} // Center of Peru
          zoom={6} 
          scrollWheelZoom={true} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />

          {/* Render Travel Swarms */}
          {SWARMS.map((swarm) => (
            <Marker 
              key={swarm.id} 
              position={[swarm.lat, swarm.lng]} 
              icon={createSwarmIcon(swarm)}
              eventHandlers={{
                click: () => navigate('/payment', { state: { swarm } }),
              }}
            />
          ))}

          {/* Render Agents */}
          {agents.map((agent) => (
            <Marker 
              key={agent.id}
              position={[agent.lat, agent.lng]}
              icon={createAgentIcon(agent, interactions[agent.id])}
              eventHandlers={{
                click: () => setInteractions((prev) => ({ ...prev, [agent.id]: `${agent.name}: Scanning area...` }))
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Agent Insight Modal */}
      {agentInsight && (
        <div className="absolute inset-x-0 top-1/3 z-[2000] px-4 pointer-events-auto">
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
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{agentInsight.text}</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-[1000] pointer-events-none p-4 pb-8 flex flex-col gap-4">
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

      {/* Hidden Discovery Overlay Component */}
      <HiddenDiscoveryOverlay 
        discovery={activeDiscovery}
        onClose={() => setActiveDiscovery(null)}
        onAccept={(d) => {
          // Process XP via XpEngine
          const xpResult = xpService.grantXp(d.rarity === 'Legendary' ? 'discovery_legendary' : 'discovery_common');
          setActiveDiscovery(null);
          
          if (xpResult && xpResult.leveledUp) {
            setLevelUpData(xpResult);
          }
        }}
      />

      {/* Level Up RPG Modal */}
      <LevelUpModal 
        levelData={levelUpData}
        onClose={() => setLevelUpData(null)}
      />
    </div>
  );
}
