import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchProfile, fetchUserBadges, fetchCityProgress, fetchCompletedMissionsCount, fetchAllBadges } from '../services/identityApi';
import { xpService } from '../services/xpService';
import Logo from '../components/Logo';
import PageHeader from '../components/PageHeader';
import { Card, Badge } from '../components/ui';

const BADGE_EMOJIS = {
  'First Steps': '🥾',
  'City Discoverer': '🗺️',
  'Cusco Conqueror': '🦙',
  'Lima Foodie Elite': '🥘',
  'Titicaca Mystic': '🌅',
  'Amazon Survivor': '🐆',
  'Nazca Decoder': '🏜️',
  'Colca Canyon Sentinel': '🦅',
  'Inca Trail Survivor': '⛰️',
  'Apex Explorer': '🧬',
  '7-Day Streak': '🔥',
  '30-Day Legend': '🏆',
  'Swarm Leader': '🛰️'
};

const CITY_ASSETS = {
  'Cusco': {
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400',
    stampColor: 'text-primary border-primary/60'
  },
  'Lima': {
    image: 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400',
    stampColor: 'text-success border-success/60'
  },
  'Puno': {
    image: 'https://images.unsplash.com/photo-1542178652-320c89ba76bc?w=400',
    stampColor: 'text-accent border-accent/60'
  },
  'Arequipa': {
    image: 'https://images.unsplash.com/photo-1533221087851-bc2902347bde?w=400',
    stampColor: 'text-secondary border-secondary/60'
  },
  'Iquitos': {
    image: 'https://images.unsplash.com/photo-1517415413661-bc952ba5cbb9?w=400',
    stampColor: 'text-success border-success/60'
  },
  'Nazca': {
    image: 'https://images.unsplash.com/photo-1628148858807-6bb9fdf0dbb6?w=400',
    stampColor: 'text-primary border-primary/60'
  }
};

export default function TravelerProfile() {
  const { nickname } = useParams();
  const navigate = useNavigate();

  // Extract nickname without leading '@'
  const cleanNickname = nickname?.startsWith('@') ? nickname.substring(1) : nickname;

  const [profile, setProfile] = useState(null);
  const [unlockedBadges, setUnlockedBadges] = useState([]);
  const [visitedCities, setVisitedCities] = useState([]);
  const [missionsCount, setMissionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (!cleanNickname) return;

    async function loadPublicProfile() {
      setLoading(true);
      try {
        const { data: userProfile, error } = await fetchProfile(cleanNickname);
        if (error || !userProfile || !userProfile.id) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setProfile(userProfile);

        // Fetch user data
        const [allBadges, userBadges, userCities, mCount] = await Promise.all([
          fetchAllBadges(),
          fetchUserBadges(userProfile.id),
          fetchCityProgress(userProfile.id),
          fetchCompletedMissionsCount(userProfile.id)
        ]);

        // Map unlocked badges
        const unlockedIds = new Set(userBadges.map(ub => ub.badge_id));
        const mappedBadges = allBadges.map(b => ({
          id: b.id,
          name: b.name,
          icon: BADGE_EMOJIS[b.name] || '🎖️',
          unlocked: unlockedIds.has(b.id),
          rarity: b.rarity || 'common'
        }));
        setUnlockedBadges(mappedBadges);

        // Map visited cities
        const mappedCities = userCities.map(c => {
          const assets = CITY_ASSETS[c.city_name] || {
            image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400',
            stampColor: 'text-primary border-primary/60'
          };
          return {
            name: c.city_name,
            date: new Date(c.discovered_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase(),
            image: assets.image,
            stampColor: assets.stampColor
          };
        });
        setVisitedCities(mappedCities);
        setMissionsCount(mCount);
      } catch (err) {
        console.error('Error loading public profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPublicProfile();
  }, [cleanNickname]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSuccess(true);
    setTimeout(() => setShareSuccess(false), 3000);
  };

  const getRarityGlow = (rarity) => {
    switch (rarity) {
      case 'mythic': return 'shadow-[0_0_15px_rgba(236,72,153,0.3)] border-pink-500/55 text-pink-500';
      case 'legendary': return 'shadow-[0_0_15px_rgba(245,158,11,0.3)] border-amber-500/55 text-amber-500';
      case 'rare': return 'shadow-[0_0_10px_rgba(59,130,246,0.3)] border-blue-500/55 text-blue-500';
      default: return 'border-slate-700/40 text-slate-400';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'mythic': return 'MÍTICO';
      case 'legendary': return 'LEGENDARIO';
      case 'rare': return 'RARO';
      default: return 'COMÚN';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-white text-2xl">neurology</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Buscando explorador en la red...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-background-dark text-white pb-12 font-display">
        <PageHeader title="Explorador no encontrado" subtitle="Error" showBack={true} backTo="/" />
        <main className="max-w-md mx-auto px-6 text-center flex-1 flex flex-col justify-center items-center">
          <div className="size-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-red-500 text-4xl">search_off</span>
          </div>
          <h2 className="text-2xl font-black mb-2">Identidad Inexistente</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            No pudimos encontrar al explorador con el nickname <span className="text-primary font-bold">@{cleanNickname}</span> en la base de datos de TripClaw.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="w-full py-4 bg-gradient-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
          >
            Volver al Inicio
          </button>
        </main>
      </div>
    );
  }

  const rank = xpService.getRank(profile.level || 1);

  return (
    <div className="min-h-screen pb-24 md:pb-12 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors relative">
      
      {/* Top Banner Background Overlay for Premium Aesthetic */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none" />

      {/* Header */}
      <PageHeader 
        title={`Explorador @${profile.nickname}`} 
        subtitle="Perfil Público"
        showBack={true}
        backTo="/"
        showNav={false}
      />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 relative z-10">
        
        {/* Share Link Toast */}
        {shareSuccess && (
          <div className="fixed top-6 left-6 right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-10 fade-in duration-500 max-w-sm mx-auto flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
            <p className="text-xs font-bold uppercase tracking-wider">¡Enlace de perfil copiado al portapapeles!</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Public Identity Card */}
          <div className="lg:col-span-1 bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-[#38332f] rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden passport-border">
            
            <div className="flex flex-col items-center text-center py-4">
              {/* Logo / Avatar representation */}
              <div className="w-32 h-32 rounded-[2rem] bg-slate-900 border-2 border-primary/50 flex items-center justify-center mb-6 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                <Logo className="w-18 h-18" />
              </div>

              <h3 className="text-3xl font-black mb-1 leading-tight tracking-tight text-slate-900 dark:text-white">
                @{profile.nickname}
              </h3>
              
              <p className="text-primary font-bold text-xs uppercase tracking-widest mb-6">
                {profile.traveler_type || 'Explorador'}
              </p>

              {/* Share action button */}
              <button
                onClick={handleShare}
                className="mb-8 px-6 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">share</span>
                Compartir Explorador
              </button>

              {/* Level Progress */}
              <div className="w-full max-w-xs mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="material-symbols-outlined text-secondary text-sm">star</span>
                    <span>Nivel {profile.level || 1}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{profile.xp || 0} / {xpService.xpForNextLevel(profile.level || 1)} XP</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3.5 overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(((profile.xp || 0) / xpService.xpForNextLevel(profile.level || 1)) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">
                  Rango: <span className="text-slate-800 dark:text-white">{rank.name}</span>
                </p>
              </div>

              {/* Stats Block */}
              <div className="w-full grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <p className="text-2xl font-black text-primary leading-tight">{visitedCities.length}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Destinos</p>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-slate-800">
                  <p className="text-2xl font-black text-primary leading-tight">{missionsCount}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Misiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-primary leading-tight">{profile.reputation_score || 100}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Confianza</p>
                </div>
              </div>

              {/* Companion Tag */}
              {profile.companion_id && (
                <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <span className="material-symbols-outlined text-sm">robot_2</span>
                  <span>Compañero: <strong className="text-slate-800 dark:text-white uppercase font-black">{profile.companion_id}</strong></span>
                </div>
              )}

            </div>
          </div>

          {/* Column 2 & 3: Badges Showcase & Destinations */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Unlocked Badges Showcase */}
            <section className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="flex items-center gap-2 font-black text-lg">
                  <span className="material-symbols-outlined text-secondary">military_tech</span>
                  Insignias Coleccionadas (NFTs)
                </h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {unlockedBadges.filter(b => b.unlocked).length} / {unlockedBadges.length || 13}
                </span>
              </div>

              {unlockedBadges.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <p>Este explorador aún no ha coleccionado insignias.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {unlockedBadges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                        badge.unlocked
                          ? `bg-white dark:bg-[#2b2724] ${getRarityGlow(badge.rarity)} border-opacity-70 hover:scale-105`
                          : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800/50 opacity-25 grayscale"
                      }`}
                    >
                      <span className="text-4xl drop-shadow-md">{badge.icon}</span>
                      <p className="text-[10px] font-black text-center uppercase tracking-wider text-slate-800 dark:text-slate-200 leading-tight">
                        {badge.name}
                      </p>
                      {badge.unlocked && (
                        <span className="text-[7px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 uppercase tracking-widest text-slate-400 mt-1">
                          {getRarityLabel(badge.rarity)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Verified Destinations */}
            <section className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm">
              <h4 className="flex items-center gap-2 font-black text-lg mb-6">
                <span className="material-symbols-outlined text-accent">verified</span>
                Territorios Visitados On-Chain
              </h4>

              {visitedCities.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <p>Este explorador aún no ha verificado destinos.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {visitedCities.map((place, index) => (
                    <div
                      key={index}
                      className="bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex items-stretch p-3 gap-4 relative animate-in slide-in-from-bottom-2 duration-500"
                      style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}
                    >
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-20 h-20 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 flex flex-col justify-center text-left">
                        <p className="font-black text-base text-slate-800 dark:text-white leading-tight">{place.name}</p>
                        <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase tracking-widest">{place.date}</p>
                      </div>

                      {/* Check-In stamp style overlay */}
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full border-2 border-dashed px-2 py-1 rotate-12 text-[8px] font-mono font-bold tracking-widest leading-none ${place.stampColor} stamp-effect`}>
                        CHECK-IN
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Social Conversion CTA */}
            <section className="bg-gradient-primary/10 border border-primary/30 rounded-2xl p-6 shadow-md text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-primary/10 to-transparent pointer-events-none" />
              <h4 className="font-black text-lg text-slate-900 dark:text-white leading-tight mb-2">
                ¿Listo para ser un Explorador Autónomo?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 max-w-lg mx-auto">
                Únete a TripClaw, viaja sin barreras físicas o sensoriales usando asistencia de inteligencia artificial local, y colecciona tus insignias de viaje directamente en la red de Stellar.
              </p>
              <button
                onClick={() => navigate('/onboarding')}
                className="px-6 py-3 rounded-xl bg-gradient-primary text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              >
                Crear Mi Identidad De Viaje
              </button>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}
