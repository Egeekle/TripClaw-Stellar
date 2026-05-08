import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { sendTelegramViaAgent } from '../services/openclawApi';
import { xpService } from '../services/xpService';
import { useMapEngine } from '../hooks/useMapEngine';
import { createSwarmIcon, createAgentIcon } from '../utils/mapIcons';
import { SWARMS } from '../config/mapData';
import HiddenDiscoveryOverlay from '../components/HiddenDiscoveryOverlay';
import LevelUpModal from '../components/LevelUpModal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function Map() {
  const navigate = useNavigate();
  const { wsStatus, isConnected, isGatewayOnline, runSkill } = useOpenClaw();
  const { agents, interactions, activeDiscovery, setActiveDiscovery, setInteractions } = useMapEngine();
  
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [agentInsight, setAgentInsight] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);

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
                click: () => handleCityClick(swarm),
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
        <div className="flex justify-end pointer-events-auto">
          <button
            onClick={() => navigate('/console')}
            className="flex items-center justify-center rounded-full h-14 px-6 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold gap-3 shadow-lg shadow-violet-500/30 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">terminal</span>
            <span className="truncate">Agent Console</span>
          </button>
        </div>

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

      <HiddenDiscoveryOverlay 
        discovery={activeDiscovery}
        onClose={() => setActiveDiscovery(null)}
        onAccept={(d) => {
          const xpResult = xpService.grantXp(d.rarity === 'Legendary' ? 'discovery_legendary' : 'discovery_common');
          setActiveDiscovery(null);
          if (xpResult && xpResult.leveledUp) setLevelUpData(xpResult);
        }}
      />
      <LevelUpModal levelData={levelUpData} onClose={() => setLevelUpData(null)} />
    </div>
  );
}
