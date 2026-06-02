/**
 * PERFORMANCE: React.memo shields the heavy PageHeader (with multiple nav links)
 * from parent state updates (like Dashboard's live feed) that don't affect header props.
 */
import React, { memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Logo from './Logo';
import WalletWidget from './WalletWidget';
import { Badge } from './ui';

const PageHeader = memo(function PageHeader({
  title, 
  subtitle, 
  showBack = false, 
  backTo = null, 
  showNav = true 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: identity } = useAuth();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: 'home' },
    { label: 'Mapa Explorer', path: '/map', icon: 'explore' },
    { label: 'Consola IA', path: '/console', icon: 'terminal' },
    { label: 'Descubrir Match', path: '/match', icon: 'local_activity' },
    { label: 'Pasaporte', path: '/passport', icon: 'badge' },
    { label: 'Votación', path: '/vote', icon: 'how_to_vote' },
  ];

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Back Button or Desktop Logo */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button 
              onClick={handleBack}
              className="flex items-center gap-1 text-primary hover:text-primary/80 font-bold transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="hidden sm:inline text-sm">Volver</span>
            </button>
          ) : (
            <div className="cursor-pointer" onClick={() => navigate('/dashboard')}>
              <Logo className="w-8 h-8 md:w-10 md:h-10" showText={true} textClassName="text-lg md:text-xl" />
            </div>
          )}

          {/* Desktop Subtitle / Breadcrumbs */}
          {subtitle && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>/</span>
              <span className="uppercase tracking-wider">{subtitle}</span>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Bar */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-3">
            {navItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs lg:text-sm font-bold uppercase tracking-tight transition-all ${
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-base lg:text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right: Mobile Page Title OR Desktop Wallet Widget & Identity */}
        <div className="flex items-center gap-3">
          {/* Mobile Title display when back button is shown */}
          {showBack && (
            <h1 className="md:hidden text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              {title}
            </h1>
          )}

          {/* Desktop User Nivel Badge */}
          {identity && (
            <div className="hidden sm:flex items-center gap-2 pr-1 border-r border-slate-200 dark:border-slate-800">
              <Badge variant="primary" className="bg-gradient-primary border border-primary/30 text-white font-bold">
                Nvl.{identity.level || 1}
              </Badge>
              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">{identity.nickname}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{identity.travelerType || 'Explorador'}</span>
              </div>
            </div>
          )}

          {/* Wallet Connection */}
          <WalletWidget />
        </div>

      </div>
    </header>
  );
});

export default PageHeader;
