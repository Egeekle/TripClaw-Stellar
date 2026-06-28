import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { useAuth } from '../hooks/useAuth';
import { fetchCompletedMissionsCount } from '../services/identityApi';
import AgentHero from '../components/dashboard/AgentHero';
import LiveFeed from '../components/dashboard/LiveFeed';
import { Card, Badge } from '../components/ui';
import PageHeader from '../components/PageHeader';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const navigate = useNavigate();
  const { status, wsStatus, agentEvents, isGatewayOnline } = useOpenClaw();
  const { user: identity } = useAuth();
  const [completedMissionsCount, setCompletedMissionsCount] = useState(0);

  useEffect(() => {
    if (identity && identity.id) {
      fetchCompletedMissionsCount(identity.id).then(count => {
        setCompletedMissionsCount(count);
      });
    }
  }, [identity]);

  return (
    <div className="min-h-screen pb-24 md:pb-6 bg-background-light dark:bg-background-dark font-display transition-colors">
      
      {/* Reusable Responsively Styled PageHeader */}
      <PageHeader 
        title="Escritorio de Viaje" 
        subtitle="Inicio"
        showBack={false}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Grid Responsive Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Column 1: Agent Status & Hero */}
          <div className="md:col-span-1 space-y-6">
            <AgentHero status={status} isGatewayOnline={isGatewayOnline} />

            {/* Quick Stats Grid */}
            <section className="grid grid-cols-2 gap-4">
              <Card hoverable className="flex flex-col gap-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Reputación Global</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{identity?.reputationScore || 100}</p>
                  <span className="material-symbols-outlined text-success text-sm leading-none">trending_up</span>
                </div>
              </Card>
              <Card hoverable className="flex flex-col gap-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Misiones Cumplidas</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-black text-slate-800 dark:text-white leading-none">{completedMissionsCount}</p>
                  <span className="material-symbols-outlined text-primary text-sm leading-none">military_tech</span>
                </div>
              </Card>
            </section>
          </div>

          {/* Column 2 & 3 (Desktop): Action Grid & Live Feed */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Quick Access Card Navigation Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/map')}
                className="group relative h-32 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-left z-10">
                  <span className="material-symbols-outlined text-white mb-1.5 text-xl">map</span>
                  <p className="text-white font-black text-sm uppercase tracking-tighter leading-none mb-1">Mapa Explorador</p>
                  <p className="text-white/70 text-[10px] font-medium leading-none">Encuentra enjambres y misiones</p>
                </div>
              </button>
              
              <button 
                onClick={() => navigate('/console')}
                className="group relative h-32 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800"
              >
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-left z-10">
                  <span className="material-symbols-outlined text-white mb-1.5 text-xl">terminal</span>
                  <p className="text-white font-black text-sm uppercase tracking-tighter leading-none mb-1">Consola Agente</p>
                  <p className="text-white/70 text-[10px] font-medium leading-none">Comandos directos de IA local</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/passport')}
                className="group relative h-28 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <div className="p-4 flex flex-col items-start justify-between h-full">
                  <span className="material-symbols-outlined text-primary text-xl">badge</span>
                  <div className="text-left">
                    <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tighter leading-none mb-1">Mi Pasaporte</p>
                    <p className="text-slate-400 text-[10px] font-medium">Insignias verificadas y destinos</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => navigate('/vote')}
                className="group relative h-28 rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-white/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent"></div>
                <div className="p-4 flex flex-col items-start justify-between h-full">
                  <span className="material-symbols-outlined text-secondary text-xl">how_to_vote</span>
                  <div className="text-left">
                    <p className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-tighter leading-none mb-1">Gobernanza</p>
                    <p className="text-slate-400 text-[10px] font-medium">Decisiones colectivas de enjambres</p>
                  </div>
                </div>
              </button>
            </section>

            {/* Live activity feed from swarms */}
            <LiveFeed events={agentEvents} />
          </div>

        </div>
      </main>

      {/* Floating Bottom Nav for Mobile */}
      <BottomNav />
    </div>
  );
}
