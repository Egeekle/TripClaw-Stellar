import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { useAuth } from '../hooks/useAuth';
import WalletWidget from '../components/WalletWidget';
import Logo from '../components/Logo';
import AgentHero from '../components/dashboard/AgentHero';
import LiveFeed from '../components/dashboard/LiveFeed';
import { Card, Badge } from '../components/ui';

const statusColor = {
  connected: 'bg-emerald-500',
  connecting: 'bg-amber-500',
  disconnected: 'bg-slate-400',
  error: 'bg-red-500',
};

const statusLabel = {
  connected: 'Agent Online',
  connecting: 'Synchronizing...',
  disconnected: 'Agent Offline',
  error: 'Connection Error',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { status, wsStatus, agentEvents, isGatewayOnline } = useOpenClaw();
  const { user: identity } = useAuth();

  // Simulated live feed when gateway is offline (demo mode)
  const [demoEvents, setDemoEvents] = useState([]);

  useEffect(() => {
    if (isGatewayOnline && agentEvents.length > 0) return;

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

  const activeEvents = isGatewayOnline && agentEvents.length > 0 ? agentEvents : demoEvents;

  return (
    <div className="max-w-[430px] mx-auto min-h-screen pb-24 bg-background-light dark:bg-background-dark font-display">
      {/* Header / Nav */}
      <div className="sticky top-0 z-40 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 pb-2 justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Logo className="w-10 h-10" />
              <div className="absolute -bottom-1 -right-1">
                <Badge variant="primary" className="bg-gradient-to-r from-violet-600 to-fuchsia-500 border border-violet-400 text-white lowercase">
                  Lv.{identity?.level || 1}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col items-start">
              <h2 className="text-slate-900 dark:text-white text-lg font-black leading-tight tracking-tight flex items-center gap-1 uppercase italic">
                {identity ? identity.nickname : 'TripClaw'}
                <span className="material-symbols-outlined text-[16px] text-fuchsia-500">verified</span>
              </h2>
              <div className="flex items-center gap-1">
                <span className={`size-2 rounded-full ${statusColor[wsStatus] || 'bg-slate-400'} ${wsStatus === 'connected' ? 'animate-pulse' : ''}`}></span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">
                  {identity ? `${identity.travelerType || 'Explorer'} • ${identity.xp || 0} XP` : statusLabel[wsStatus]}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end">
            <WalletWidget />
          </div>
        </div>
      </div>

      <main className="px-4 space-y-6">
        <AgentHero status={status} isGatewayOnline={isGatewayOnline} />

        {/* Quick Stats */}
        <section className="grid grid-cols-2 gap-4">
          <Card hoverable className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Rep</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-black text-slate-900 dark:text-white">{identity?.reputationScore || 100}</p>
              <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
            </div>
          </Card>
          <Card hoverable className="flex flex-col gap-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Missions Done</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-black text-slate-900 dark:text-white">3</p>
              <span className="material-symbols-outlined text-violet-500 text-sm">military_tech</span>
            </div>
          </Card>
        </section>

        {/* Navigation Grid */}
        <section className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/map')}
            className="group relative h-32 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-left">
              <span className="material-symbols-outlined text-white mb-1">map</span>
              <p className="text-white font-black text-sm uppercase tracking-tighter">Explore Map</p>
              <p className="text-white/60 text-[10px] font-medium">Find Swarms & Missions</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/console')}
            className="group relative h-32 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-violet-900 via-violet-900/40 to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-left">
              <span className="material-symbols-outlined text-white mb-1">terminal</span>
              <p className="text-white font-black text-sm uppercase tracking-tighter">AI Console</p>
              <p className="text-white/60 text-[10px] font-medium">Direct Agent Command</p>
            </div>
          </button>

          <button 
            onClick={() => navigate('/passport')}
            className="group relative h-28 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent"></div>
            <div className="p-4 flex flex-col items-start justify-between h-full">
              <span className="material-symbols-outlined text-fuchsia-500">badge</span>
              <div className="text-left">
                <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tighter leading-none mb-1">My Passport</p>
                <p className="text-slate-400 text-[10px] font-medium">Badges & History</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => navigate('/vote')}
            className="group relative h-28 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>
            <div className="p-4 flex flex-col items-start justify-between h-full">
              <span className="material-symbols-outlined text-amber-500">how_to_vote</span>
              <div className="text-left">
                <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tighter leading-none mb-1">Governance</p>
                <p className="text-slate-400 text-[10px] font-medium">Vote on Proposals</p>
              </div>
            </div>
          </button>
        </section>

        <LiveFeed events={activeEvents} />
      </main>

      {/* Persistent Bottom Nav (Floating) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] h-16 bg-white/10 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex items-center justify-around px-4">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center gap-1 text-violet-500">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button onClick={() => navigate('/map')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Map</span>
        </button>
        <div className="relative -top-6">
          <button 
            onClick={() => navigate('/console')}
            className="size-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white shadow-xl shadow-violet-500/40 ring-4 ring-background-light dark:ring-background-dark transform active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">neurology</span>
          </button>
        </div>
        <button onClick={() => navigate('/match')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">local_activity</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Match</span>
        </button>
        <button onClick={() => navigate('/passport')} className="flex flex-col items-center gap-1 text-slate-400 hover:text-white transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Profile</span>
        </button>
      </nav>
    </div>
  );
}
