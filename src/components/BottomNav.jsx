import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// PERFORMANCE: Move static navigation data outside the component to prevent redundant allocation on every render.
const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', icon: 'home' },
  { label: 'Mapa', path: '/map', icon: 'explore' },
  { label: 'Consola', path: '/console', icon: 'neurology', isCenter: true },
  { label: 'Match', path: '/match', icon: 'local_activity' },
  { label: 'Perfil', path: '/passport', icon: 'account_circle' },
];

// PERFORMANCE: Memoizing BottomNav as it is a layout element present on all mobile pages.
const BottomNav = memo(function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] h-16 bg-white/10 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800 rounded-2xl shadow-2xl z-50 flex items-center justify-around px-2 md:hidden">
      {NAV_ITEMS.map((item, idx) => {
        const isActive = location.pathname === item.path;

        if (item.isCenter) {
          return (
            <div key={idx} className="relative -top-6">
              <button 
                onClick={() => navigate(item.path)}
                className="size-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white shadow-xl shadow-primary/30 ring-4 ring-background-light dark:ring-background-dark transform active:scale-95 transition-transform"
                title="AI Console"
              >
                <span className="material-symbols-outlined text-3xl">neurology</span>
              </button>
            </div>
          );
        }

        return (
          <button 
            key={idx}
            onClick={() => navigate(item.path)} 
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
});

export default BottomNav;
