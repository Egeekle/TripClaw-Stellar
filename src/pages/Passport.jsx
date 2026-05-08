import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/Logo";

const badges = [
  { id: 1, name: "Primer Camino", icon: "🏔️", unlocked: true },
  { id: 2, name: "Guardián Inca", icon: "🦙", unlocked: true },
  { id: 3, name: "Alma Andina", icon: "🌄", unlocked: false },
  { id: 4, name: "Tejedor", icon: "🧵", unlocked: false },
  { id: 5, name: "Pachamama", icon: "🌿", unlocked: true },
  { id: 6, name: "Apu Sagrado", icon: "⛰️", unlocked: false },
];

const visitedPlaces = [
  { name: "Cusco", date: "Mayo 2026", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400" },
  { name: "Lima", date: "Abril 2026", image: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400" },
];

export default function Passport() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: profile } = useAuth();
  const [showNewBadge, setShowNewBadge] = useState(false);


  useEffect(() => {
    if (location.state?.newExperience) {
      setShowNewBadge(true);
      setTimeout(() => setShowNewBadge(false), 4000);
    }
  }, [location.state]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white">
      {/* Header Area */}
      <div className="bg-gradient-to-b from-violet-900/40 to-transparent p-6 pb-20 relative">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => navigate("/dashboard")} className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </button>
          <h2 className="text-lg font-bold">Mi Passport</h2>
          <div className="w-16" />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center relative z-10">
          <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-violet-500/50 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)] transform -rotate-3">
            <Logo className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-black mb-1">{profile.nickname || 'Explorador Anónimo'}</h3>
          <p className="text-violet-500 dark:text-violet-400 font-medium text-sm mb-6 uppercase tracking-wider">
            {profile.travelerType || 'Traveler'}
          </p>

          {/* Level Progress */}
          <div className="w-full max-w-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">star</span>
                <span className="font-bold">Level {profile.level || 1}</span>
              </div>
              <span className="text-sm font-medium text-slate-500">{profile.xp || 0} / 1000 XP</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(((profile.xp || 0) / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="px-6 -mt-12 pb-12 relative z-20">
        {/* Stats Grid */}
        <div className="bg-white dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-4 shadow-lg">
          <div className="text-center">
            <p className="text-3xl font-black mb-1 text-violet-600 dark:text-violet-400">2</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destinos</p>
          </div>
          <div className="text-center border-x border-slate-200 dark:border-slate-700">
            <p className="text-3xl font-black mb-1 text-violet-600 dark:text-violet-400">3</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Misiones</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black mb-1 text-violet-600 dark:text-violet-400">4.9</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rating</p>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="flex items-center gap-2 font-bold text-lg">
              <span className="material-symbols-outlined text-fuchsia-500">military_tech</span>
              Insignias (NFTs)
            </h4>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">3/6</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`bg-white dark:bg-slate-800 border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  badge.unlocked
                    ? "border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:scale-105"
                    : "border-slate-200 dark:border-slate-700 opacity-40 grayscale"
                }`}
              >
                <span className="text-3xl drop-shadow-md">{badge.icon}</span>
                <p className="text-[10px] font-bold text-center uppercase tracking-tighter leading-tight">
                  {badge.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Visited Places */}
        <div>
          <h4 className="flex items-center gap-2 font-bold text-lg mb-4">
            <span className="material-symbols-outlined text-emerald-500">pin_drop</span>
            Destinos Verificados
          </h4>

          <div className="space-y-4">
            {visitedPlaces.map((place, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden flex shadow-sm animate-in slide-in-from-left-4 duration-500"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
              >
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-24 h-24 object-cover"
                />
                <div className="p-4 flex-1 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg mb-0.5">{place.name}</p>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{place.date}</p>
                  </div>
                  <span className="material-symbols-outlined text-emerald-500 text-3xl">verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Level Preview */}
        <div className="mt-8 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-5 shadow-inner">
          <div className="flex items-start gap-4">
            <span className="material-symbols-outlined text-violet-500 text-3xl">trending_up</span>
            <div>
              <p className="font-bold text-lg mb-1 tracking-tight">Próximo Nivel</p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Completa 2 misiones más para desbloquear los mapas predictivos de Arequipa y subir al Rango 2.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Badge Notification */}
      {showNewBadge && (
        <div className="fixed top-6 left-6 right-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-10 fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl">military_tech</span>
            </div>
            <div>
              <p className="font-black tracking-tight text-lg">¡Nueva Insignia!</p>
              <p className="text-sm font-medium opacity-90">Primer Camino +100 XP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
