import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { sendTelegramViaAgent } from '../services/openclawApi';
import { xpService } from '../services/xpService';
import { useMapEngine } from '../hooks/useMapEngine';
import { SWARMS } from '../config/mapData';
import HiddenDiscoveryOverlay from '../components/HiddenDiscoveryOverlay';
import LevelUpModal from '../components/LevelUpModal';
import MapView from '../components/MapView';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';
import { Card, Badge } from '../components/ui';

const CATEGORIES = ['Todos', 'Aventura', 'Gastronomía', 'Cultura', 'Naturaleza'];

export default function Map() {
  const navigate = useNavigate();
  const { wsStatus, isConnected, isGatewayOnline, runSkill } = useOpenClaw();
  const { agents, interactions, activeDiscovery, setActiveDiscovery, setInteractions } = useMapEngine();
  
  const [telegramEnabled, setTelegramEnabled] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [agentInsight, setAgentInsight] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Todos');

  /**
   * ⚡ Bolt: Memoize city click handler to prevent stable reference changes
   * from triggering unnecessary MapView re-renders.
   */
  const handleCityClick = useCallback(async (city) => {
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
          ? `📍 ${city.name} — Conéctate a Agente Aquisito para recibir un análisis con IA real. La habilidad trip_analyzer evaluará seguridad, costos, multitudes y joyas ocultas.`
          : `Analizando ${city.name}... Consulta la consola del agente para ver la respuesta completa.`,
      });
    }

    if (telegramEnabled) {
      sendTelegramViaAgent(`📍 *Aquisito Explorer*\nUsuario exploró *${city.name}* a través del mapa de agentes.`);
    }
  }, [runSkill, telegramEnabled]);

  /**
   * ⚡ Bolt: Memoize filtered swarms to avoid re-calculating on every render
   * unless the filter category actually changes.
   */
  const filteredSwarms = useMemo(() => {
    return activeFilter === 'Todos'
      ? SWARMS
      : SWARMS.filter(swarm => {
          if (activeFilter === 'Aventura') return swarm.type === 'Adventure';
          if (activeFilter === 'Gastronomía') return swarm.type === 'Gastronomy';
          if (activeFilter === 'Cultura') return swarm.type === 'Culture' || swarm.type === 'History';
          if (activeFilter === 'Naturaleza') return swarm.type === 'Nature' || swarm.type === 'Wilderness';
          return true;
        });
  }, [activeFilter]);

  return (
    <div className="relative min-h-screen flex flex-col font-display text-slate-900 dark:text-white bg-background-light dark:bg-background-dark pb-24 md:pb-6 transition-colors">
      
      {/* Reusable Responsively Styled PageHeader */}
      <PageHeader 
        title="Mapa Explorador" 
        subtitle="Exploración de Enjambres"
        showBack={false}
      />

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-160px)] min-h-[500px]">
        
        {/* Left Column: Custom Vintage Map (Occupies 2/3 cols on desktop) */}
        <div className="lg:col-span-2 flex flex-col h-full gap-4">
          
          {/* Category Filters row above map */}
          <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeFilter === cat
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Custom Map View Component */}
          <div className="flex-1 min-h-[380px] md:min-h-[450px] relative">
            <MapView 
              swarms={filteredSwarms}
              agents={agents}
              interactions={interactions}
              selectedCity={selectedCity}
              onCityClick={handleCityClick}
            />
          </div>
        </div>

        {/* Right Column: Agents and Missions list sidebar (Occupies 1/3 cols on desktop) */}
        <div className="flex flex-col gap-6 h-full overflow-y-auto lg:border-l lg:border-slate-200 lg:dark:border-slate-800 lg:pl-6">
          
          {/* Active Agents HUD block */}
          <section className="space-y-3 shrink-0">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-400">Agentes Enjambre</h3>
              <Badge variant="primary" className="bg-accent/15 border border-accent/30 text-accent font-bold">
                {agents.length} activos
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronización</span>
                <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                  <span className={`size-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  {isConnected ? 'En Línea' : 'Modo Demo'}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opinión Promedio</span>
                <span className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-amber-500">sentiment_satisfied</span>
                  {agents.length ? Math.round(agents.reduce((acc, curr) => acc + (curr.sentiment || 50), 0) / agents.length) : 0}%
                </span>
              </div>
            </div>
          </section>

          {/* Cities / Swarms List section */}
          <section className="flex-1 flex flex-col gap-3 min-h-0">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-400 shrink-0">Misiones y Destinos</h3>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredSwarms.map((swarm) => {
                const isSelected = selectedCity && selectedCity.id === swarm.id;
                return (
                  <Card 
                    key={swarm.id}
                    hoverable
                    onClick={() => handleCityClick(swarm)}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3">
                        <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-primary'
                        }`}>
                          <span className="material-symbols-outlined text-lg">{swarm.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {swarm.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                            Categoría: {swarm.type}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant="success" className="bg-success/15 border border-success/30 text-success text-[8px] font-bold">
                        {swarm.members} misiones
                      </Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Telegram and Gateway controls at bottom of list */}
          <section className="space-y-2 shrink-0 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-semibold">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg text-primary">send</span>
                Alertas Telegram
              </span>
              <label className="relative flex h-[22px] w-[38px] cursor-pointer items-center rounded-full bg-slate-200 dark:bg-slate-700 p-0.5 has-[:checked]:bg-primary transition-colors">
                <input
                  type="checkbox"
                  className="invisible absolute peer"
                  checked={telegramEnabled}
                  onChange={(e) => setTelegramEnabled(e.target.checked)}
                />
                <div className="h-full w-[18px] rounded-full bg-white shadow-md transition-all peer-checked:translate-x-[16px] peer-[:not(:checked)]:translate-x-0"></div>
              </label>
            </div>
          </section>

        </div>
      </main>

      {/* Floating Agent Insight Bottom Sheet/Modal */}
      {agentInsight && (
        <div className="fixed inset-x-0 bottom-6 md:bottom-12 z-[2000] px-4 pointer-events-none">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl max-w-md mx-auto pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-base">neurology</span>
                </div>
                <div>
                  <h4 className="text-slate-900 dark:text-white text-sm font-black leading-tight">{agentInsight.city}</h4>
                  <p className="text-accent text-[9px] uppercase font-bold tracking-wider">Agente Aquisito Intel</p>
                </div>
              </div>
              <button
                onClick={() => setAgentInsight(null)}
                className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            
            {agentInsight.loading ? (
              <div className="flex items-center gap-2 text-primary py-4 justify-center">
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                <span className="text-xs font-bold uppercase tracking-wider">Analizando territorio...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap pr-1">{agentInsight.text}</p>
                
                {/* Swipe Match CTA for that city */}
                <button
                  onClick={() => navigate('/match', { state: { city: { name: agentInsight.city } } })}
                  className="w-full py-3 rounded-2xl bg-gradient-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">local_activity</span>
                  Buscar Misiones en {agentInsight.city}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden Discover Overlay and Level Up modalls */}
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

      {/* Floating Bottom Nav for Mobile */}
      <BottomNav />
    </div>
  );
}
