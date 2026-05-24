import React, { useState, memo } from 'react';
import { motion, useMotionValue } from 'framer-motion';

// Bounding box of Peru for Lat/Lng to X/Y mapping
const MAP_BOUNDS = {
  topLat: 0.0,
  bottomLat: -18.8,
  leftLng: -82.0,
  rightLng: -68.0,
};

/**
 * ⚡ Bolt: Move helper logic and static coordinates outside component
 * to avoid unnecessary recalculations on each render.
 */
const getRelativeCoords = (lat, lng) => {
  const totalLng = MAP_BOUNDS.rightLng - MAP_BOUNDS.leftLng;
  const totalLat = MAP_BOUNDS.topLat - MAP_BOUNDS.bottomLat;

  const x = ((lng - MAP_BOUNDS.leftLng) / totalLng) * 100;
  const y = ((MAP_BOUNDS.topLat - lat) / totalLat) * 100;

  return { x: `${x}%`, y: `${y}%`, xVal: x, yVal: y };
};

// Static visited path between Lima and Cusco
const LIMA_COORDS = getRelativeCoords(-12.1211, -77.0294);
const CUSCO_COORDS = getRelativeCoords(-13.1631, -72.5450);

/**
 * ⚡ Bolt: Extract and memoize markers to prevent unnecessary re-renders
 * of static elements when agents move.
 */
const SwarmMarker = memo(({ swarm, isSelected, onClick }) => {
  const coords = getRelativeCoords(swarm.lat, swarm.lng);
  return (
    <div
      style={{ left: coords.x, top: coords.y }}
      className="absolute -translate-x-1/2 -translate-y-[85%] z-20 cursor-pointer"
      onClick={() => onClick(swarm)}
    >
      {isSelected && (
        <span className="absolute -left-3 -top-2 inline-flex h-12 w-12 rounded-full bg-primary/20 animate-ping pointer-events-none"></span>
      )}
      <div className={`flex flex-col items-center transition-all ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
        <div className={`p-1.5 rounded-full flex items-center justify-center shadow-lg border-2 ${
          isSelected
            ? 'bg-primary border-secondary text-white'
            : 'bg-white dark:bg-[#2b2724] border-primary text-primary'
        }`}>
          <span className="material-symbols-outlined text-[16px] font-bold">
            {swarm.icon || 'location_on'}
          </span>
        </div>
        <div className="w-1.5 h-1.5 bg-foreground-light/60 dark:bg-foreground-dark/40 rounded-full mt-0.5 blur-[1px]"></div>
      </div>
    </div>
  );
});

const AgentMarker = memo(({ agent, interaction, onClick }) => {
  const coords = getRelativeCoords(agent.lat, agent.lng);
  return (
    <div
      style={{ left: coords.x, top: coords.y }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
      onClick={() => onClick({
        type: 'agent',
        name: agent.name,
        sentiment: agent.sentiment,
        desc: 'Agente enjambre buscando oportunidades locales.'
      })}
    >
      {interaction && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-[#2b2724] text-slate-800 dark:text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow-lg border border-primary/20 whitespace-nowrap z-30 animate-bounce">
          {interaction}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-[#2b2724] rotate-45 border-b border-r border-primary/20"></div>
        </div>
      )}
      <div className="size-6 bg-[#2b2724] border border-accent rounded-lg flex items-center justify-center shadow-md transform hover:scale-110 transition-transform">
        <span className="material-symbols-outlined text-accent text-[12px]">smart_toy</span>
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-900 text-white text-[8px] font-bold px-1 py-0.5 rounded whitespace-nowrap z-50">
        {agent.name}
      </div>
    </div>
  );
});

/**
 * ⚡ Bolt: Wrap MapView in React.memo to prevent re-renders when parent state
 * (like agentInsight) changes but MapView props remain stable.
 */
const MapView = memo(function MapView({
  swarms, 
  agents, 
  interactions = {},
  selectedCity, 
  onCityClick, 
  userLocation = { lat: -12.1211, lng: -77.0294, name: 'Tú (Lima)' } // Default location is Lima
}) {
  const [zoom, setZoom] = useState(1.1);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // ⚡ Bolt: Memoize user coordinates to avoid recalculating on each render
  const userCoords = React.useMemo(() =>
    userLocation ? getRelativeCoords(userLocation.lat, userLocation.lng) : null
  , [userLocation?.lat, userLocation?.lng]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.3, 1));
  const handleReset = () => {
    setZoom(1.1);
  };

  return (
    <div className="relative w-full h-full bg-[#f1ece1] dark:bg-[#201d1b] border-2 border-[#d5cfc1] dark:border-[#38332f] rounded-3xl overflow-hidden shadow-inner select-none transition-colors">
      
      {/* Map Graticule Grid Layer (Background lines) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Lat/Lng markers in corner */}
        <span className="absolute top-2 left-4 text-[9px] font-mono">12°S 77°W</span>
        <span className="absolute bottom-2 right-4 text-[9px] font-mono">18°S 70°W</span>
      </div>

      {/* Drag Container and Map Base */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          drag
          dragConstraints={{
            left: -200 * zoom,
            right: 200 * zoom,
            top: -200 * zoom,
            bottom: 200 * zoom
          }}
          dragElastic={0.1}
          dragMomentum={true}
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="relative w-[500px] h-[500px] md:w-[600px] md:h-[600px] shrink-0 cursor-grab active:cursor-grabbing origin-center"
        >
          {/* Base Stylized Peru Map Image */}
          <img 
            src="/peru_traveler_map.png" 
            alt="Base Map of Peru" 
            className="w-full h-full object-contain pointer-events-none drop-shadow-lg filter dark:brightness-90 dark:contrast-105" 
          />

          {/* SVG Overlay for Roads & Routes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="var(--accent)" />
              </linearGradient>
            </defs>

            {/* Dotted path (Lima to Cusco) */}
            <motion.path 
              d={`M ${LIMA_COORDS.xVal} ${LIMA_COORDS.yVal} Q ${(LIMA_COORDS.xVal + CUSCO_COORDS.xVal)/2 + 3} ${(LIMA_COORDS.yVal + CUSCO_COORDS.yVal)/2 - 5}, ${CUSCO_COORDS.xVal} ${CUSCO_COORDS.yVal}`}
              fill="none" 
              stroke="url(#routeGradient)" 
              strokeWidth="0.8" 
              strokeDasharray="2,3" 
              style={{
                strokeDashoffset: 0
              }}
              animate={{
                strokeDashoffset: [0, -20]
              }}
              transition={{
                repeat: Infinity,
                duration: 4,
                ease: 'linear'
              }}
            />
          </svg>

          {/* User Location Indicator */}
          {userCoords && (
            <div 
              style={{ left: userCoords.x, top: userCoords.y }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer"
              onClick={() => setActiveTooltip({
                type: 'user',
                name: 'Ubicación actual',
                desc: 'Estás explorando aquí.'
              })}
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute inline-flex h-8 w-8 rounded-full bg-accent/30 animate-ping"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-accent border-2 border-white shadow-md"></span>
              </div>
            </div>
          )}

          {/* Render Travel Swarms (Cities) */}
          {swarms.map((swarm) => (
            <SwarmMarker
              key={swarm.id}
              swarm={swarm}
              isSelected={selectedCity?.id === swarm.id}
              onClick={(s) => {
                onCityClick(s);
                setActiveTooltip(s);
              }}
            />
          ))}

          {/* Render Scout Agents */}
          {agents.map((agent) => (
            <AgentMarker
              key={agent.id}
              agent={agent}
              interaction={interactions[agent.id]}
              onClick={setActiveTooltip}
            />
          ))}
        </motion.div>
      </div>

      {/* Floating Control Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-30">
        <button 
          onClick={handleZoomIn} 
          className="size-9 rounded-xl bg-white/95 dark:bg-[#2b2724]/95 border border-[#d5cfc1] dark:border-[#38332f] text-foreground-light dark:text-foreground-dark flex items-center justify-center font-bold shadow-md hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
        <button 
          onClick={handleZoomOut} 
          className="size-9 rounded-xl bg-white/95 dark:bg-[#2b2724]/95 border border-[#d5cfc1] dark:border-[#38332f] text-foreground-light dark:text-foreground-dark flex items-center justify-center font-bold shadow-md hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-xl">remove</span>
        </button>
        <button 
          onClick={handleReset} 
          className="size-9 rounded-xl bg-white/95 dark:bg-[#2b2724]/95 border border-[#d5cfc1] dark:border-[#38332f] text-foreground-light dark:text-foreground-dark flex items-center justify-center font-bold shadow-md hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
          title="Centrar"
        >
          <span className="material-symbols-outlined text-lg">filter_center_focus</span>
        </button>
      </div>

      {/* Dynamic Popover / Tooltip Overlay (when clicked on pin) */}
      {activeTooltip && (
        <div className="absolute top-4 left-4 right-4 md:right-auto md:w-80 bg-white/95 dark:bg-[#2b2724]/95 backdrop-blur-md border border-[#d5cfc1] dark:border-[#38332f] rounded-2xl p-4 shadow-xl z-30 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                {activeTooltip.name}
              </h4>
              <p className="text-[10px] font-bold text-accent uppercase tracking-widest mt-0.5">
                {activeTooltip.type ? `${activeTooltip.type} Swarm` : activeTooltip.type === 'agent' ? 'Agente AI' : 'Explorador'}
              </p>
            </div>
            <button 
              onClick={() => setActiveTooltip(null)}
              className="size-6 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          
          {activeTooltip.members ? (
            <div className="space-y-3">
              <p className="text-slate-600 dark:text-slate-300 text-xs">
                Misión activa: Encuentra rincones gastronómicos o rutas arqueológicas ocultas junto al enjambre local.
              </p>
              <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400">EXPLORADORES:</span>
                <span className="text-slate-800 dark:text-white flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">groups</span>
                  {activeTooltip.members} enjambres
                </span>
              </div>
              <button 
                onClick={() => onCityClick(activeTooltip)}
                className="w-full py-2 bg-gradient-primary text-white rounded-xl font-bold text-xs shadow-md shadow-primary/20 hover:shadow-primary/30 transition-all uppercase tracking-wider"
              >
                Unirme al enjambre
              </button>
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
              {activeTooltip.desc || 'Explorando las inmediaciones y recolectando datos sobre la red de telecomunicaciones y transporte.'}
              {activeTooltip.sentiment && ` (Confianza del Agente: ${activeTooltip.sentiment}%)`}
            </p>
          )}
        </div>
      )}

      {/* Dotted Route Legend */}
      <div className="absolute bottom-4 left-4 z-30 bg-white/90 dark:bg-[#2b2724]/90 backdrop-blur-sm border border-[#d5cfc1] dark:border-[#38332f] px-3 py-1.5 rounded-xl shadow-md text-[10px] font-bold flex items-center gap-2">
        <span className="w-4 h-0.5 border-t border-dashed border-primary"></span>
        <span className="text-slate-500 uppercase tracking-wider">Itinerario verificado</span>
      </div>

    </div>
  );
}
);

export default MapView;
