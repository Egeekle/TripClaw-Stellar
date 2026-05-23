import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/Logo";
import PageHeader from "../components/PageHeader";
import BottomNav from "../components/BottomNav";

const badges = [
  { id: 1, name: "Primer Camino", icon: "🏔️", unlocked: true },
  { id: 2, name: "Guardián Inca", icon: "🦙", unlocked: true },
  { id: 3, name: "Alma Andina", icon: "🌄", unlocked: false },
  { id: 4, name: "Tejedor", icon: "🧵", unlocked: false },
  { id: 5, name: "Pachamama", icon: "🌿", unlocked: true },
  { id: 6, name: "Apu Sagrado", icon: "⛰️", unlocked: false },
];

const visitedPlaces = [
  { name: "Cusco", date: "MAYO 2026", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=400", stampColor: "text-primary border-primary/60" },
  { name: "Lima", date: "ABRIL 2026", image: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=400", stampColor: "text-success border-success/60" },
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
    <div className="min-h-screen pb-24 md:pb-6 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white transition-colors">
      
      {/* Page Header */}
      <PageHeader 
        title="Mi Pasaporte" 
        subtitle="Mi Perfil"
        showBack={true}
        backTo="/dashboard"
      />

      {/* Main Container - Responsive Grid */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Column 1: Profile & Stats (Stitched Passport Look) */}
          <div className="lg:col-span-1 bg-white dark:bg-[#2b2724] border border-slate-200 dark:border-[#38332f] rounded-[2rem] p-6 shadow-xl relative overflow-hidden passport-border">
            
            {/* Profile Info */}
            <div className="flex flex-col items-center text-center relative z-10 py-4">
              <div className="w-28 h-28 rounded-[2rem] bg-slate-900 border-2 border-primary/50 flex items-center justify-center mb-5 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform">
                <Logo className="w-16 h-16" />
              </div>
              <h3 className="text-2xl font-black mb-1 text-slate-900 dark:text-white">
                {profile.nickname || 'Explorador Anónimo'}
              </h3>
              <p className="text-primary font-bold text-xs uppercase tracking-wider mb-6">
                {profile.travelerType || 'Explorador'}
              </p>

              {/* Level Progress */}
              <div className="w-full max-w-xs mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span className="material-symbols-outlined text-secondary text-sm">star</span>
                    <span>Nivel {profile.level || 1}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{profile.xp || 0} / 1000 XP</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700">
                  <div
                    className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(((profile.xp || 0) / 1000) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats Block */}
              <div className="w-full grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <div className="text-center">
                  <p className="text-2xl font-black text-primary leading-tight">2</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Destinos</p>
                </div>
                <div className="text-center border-x border-slate-200 dark:border-slate-800">
                  <p className="text-2xl font-black text-primary leading-tight">3</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Misiones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-primary leading-tight">4.9</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rating</p>
                </div>
              </div>

            </div>
          </div>

          {/* Column 2 & 3: Badges Grid & Visited Places */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Badges (NFTs) Grid */}
            <section className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="flex items-center gap-2 font-black text-lg">
                  <span className="material-symbols-outlined text-secondary">military_tech</span>
                  Insignias de Viaje (NFTs)
                </h4>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">3 / 6</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                      badge.unlocked
                        ? "bg-white dark:bg-[#2b2724] border-primary/40 shadow-md hover:scale-105"
                        : "bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 opacity-40 grayscale"
                    }`}
                  >
                    <span className="text-3xl drop-shadow-md">{badge.icon}</span>
                    <p className="text-[9px] font-bold text-center uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {badge.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Visited Places (Verification Stamps) */}
            <section className="bg-white dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h4 className="flex items-center gap-2 font-black text-lg mb-4">
                <span className="material-symbols-outlined text-accent">verified</span>
                Destinos Verificados On-Chain
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visitedPlaces.map((place, index) => (
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

                    {/* Passport Stamp-like badge */}
                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full border-2 border-dashed px-2 py-1 rotate-12 text-[8px] font-mono font-bold tracking-widest leading-none ${place.stampColor} stamp-effect`}>
                      CHECK-IN
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Next Level Progression */}
            <section className="bg-gradient-primary/5 border border-primary/20 rounded-2xl p-5 shadow-inner">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl shrink-0">trending_up</span>
                <div>
                  <p className="font-bold text-base text-slate-900 dark:text-white leading-tight mb-1">Siguiente Nivel</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Completa 2 misiones de enjambre adicionales en Cusco o Arequipa para subir al Rango 2 de explorador.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </main>

      {/* New Badge Notification */}
      {showNewBadge && (
        <div className="fixed top-6 left-6 right-6 bg-gradient-primary text-white rounded-2xl p-4 shadow-2xl z-50 animate-in slide-in-from-top-10 fade-in duration-500 max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl">military_tech</span>
            </div>
            <div className="text-left">
              <p className="font-black tracking-tight text-lg leading-tight">¡Nueva Insignia!</p>
              <p className="text-xs font-medium opacity-90">Primer Camino desbloqueado (+150 XP)</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Nav for Mobile */}
      <BottomNav />
    </div>
  );
}
