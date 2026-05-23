import { useNavigate } from 'react-router-dom';
import { Button, Badge } from '../ui';

export default function ConsoleHeader({ wsStatus, isGatewayOnline, status, activeTab, setActiveTab, agentEventsCount, toolsCount }) {
  const navigate = useNavigate();

  const statusColor = {
    connected: 'bg-emerald-500',
    connecting: 'bg-amber-400',
    disconnected: 'bg-slate-400',
    error: 'bg-red-500',
  };

  const tabs = [
    { key: 'chat', label: 'Chat', icon: 'chat' },
    { key: 'events', label: 'Eventos', icon: 'event_note', count: agentEventsCount },
    { key: 'tools', label: 'Skills', icon: 'build', count: toolsCount },
  ];

  return (
    <div className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => navigate('/dashboard')}
            icon="arrow_back_ios_new"
          />
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="size-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined text-white text-lg">neurology</span>
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-background-dark ${statusColor[wsStatus] || 'bg-slate-400'}`}></span>
            </div>
            <div>
              <h2 className="text-slate-900 dark:text-white text-base font-bold">Agente Aquisito</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-primary flex items-center gap-1">
                {isGatewayOnline ? (
                  <>Gateway Online <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span></>
                ) : (
                  <>Modo Demo <span className="size-1.5 bg-amber-400 rounded-full"></span></>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800">
          <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Sesión:</span>
          <Badge variant="default">{status?.session || 'main'}</Badge>
        </div>
      </div>

      <div className="flex px-4 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-t-lg border-b-2 ${
              activeTab === tab.key
                ? 'text-primary dark:text-primary border-primary dark:border-primary bg-primary/5'
                : 'text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined text-sm">{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className="text-[9px] bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary px-1.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

