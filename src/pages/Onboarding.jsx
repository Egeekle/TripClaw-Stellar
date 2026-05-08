import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { useStellarWallet } from '../hooks/useStellarWallet';
import Logo from '../components/Logo';
import { supabase } from '../lib/supabase';

const TRAVELER_TYPES = [
  { id: 'explorer', label: 'Explorer', icon: 'explore' },
  { id: 'foodie', label: 'Food Hunter', icon: 'restaurant' },
  { id: 'luxury', label: 'Luxury Traveler', icon: 'diamond' },
  { id: 'adventure', label: 'Adventure Seeker', icon: 'hiking' },
  { id: 'culture', label: 'Culture Scout', icon: 'museum' },
];

const COMPANIONS = [
  { id: 'condor', name: 'Condor AI', icon: 'flight_takeoff', desc: 'Overhead views & safety', color: 'from-blue-500 to-indigo-600' },
  { id: 'puma', name: 'Puma Scout', icon: 'pets', desc: 'Hidden trails & speed', color: 'from-orange-500 to-red-600' },
  { id: 'inca', name: 'Inca Navigator', icon: 'map', desc: 'History & deep culture', color: 'from-amber-500 to-orange-600' },
  { id: 'pacific', name: 'Pacific Drone', icon: 'water', desc: 'Coastal & relaxed vibes', color: 'from-cyan-500 to-blue-600' },
];

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const navigate = useNavigate();
  const { pair, isGatewayOnline } = useOpenClaw();
  const { publicKey, connect, connecting } = useStellarWallet();
  
  const [step, setStep] = useState(1);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingStatus, setPairingStatus] = useState(null);

  // ── Auth State ──────────────────────────────────────────────
  const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [identity, setIdentity] = useState({
    nickname: '',
    travelerType: '',
    companion: ''
  });

  // ── Auth Handlers ───────────────────────────────────────────
  const handleAuth = async () => {
    setAuthError(null);
    
    if (!email.trim() || !password.trim()) {
      setAuthError('Email y contraseña son requeridos.');
      return;
    }

    if (authMode === 'register' && !authNickname.trim()) {
      setAuthError('El nickname es requerido.');
      return;
    }

    if (authMode === 'register' && password !== confirmPassword) {
      setAuthError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setAuthLoading(true);

    try {
      if (!supabase) {
        // Fallback: skip auth if Supabase not configured
        setAuthSuccess(true);
        setAuthLoading(false);
        return;
      }

      let result;
      if (authMode === 'register') {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              nickname: authNickname.trim(),
              company_name: companyName.trim() || null,
            }
          }
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        setAuthError(result.error.message);
        setAuthLoading(false);
        return;
      }

      setAuthSuccess(true);
    } catch (err) {
      setAuthError('Error de conexión. Intenta de nuevo.');
    }
    
    setAuthLoading(false);
  };

  const handlePair = async () => {
    if (!pairingCode.trim()) return;
    setPairingStatus('pairing');
    const result = await pair(pairingCode.trim());
    setPairingStatus(result && !result.error ? 'success' : 'error');
  };

  const completeOnboarding = () => {
    const userProfile = {
      ...identity,
      email,
      authNickname,
      companyName,
      xp: 0,
      level: 1,
      reputationScore: 100,
      visitedCities: [],
      unlockedSkills: ['Basic Travel Analyzer'],
      badges: [],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('tripclaw_identity', JSON.stringify(userProfile));
    navigate('/verify');
  };

  const shortWallet = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const stepLabel = step === 1 ? 'Cuenta' : step === 2 ? 'Conexión' : step === 3 ? 'Identidad' : 'Compañero';

  const canContinue = () => {
    if (step === 1) return authSuccess;
    if (step === 2) return true; // connections are optional
    if (step === 3) return identity.nickname && identity.travelerType;
    if (step === 4) return identity.companion;
    return false;
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen flex flex-col relative pb-24 bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {/* Progress Bar */}
      <div className="flex flex-col gap-3 p-4 pt-8">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-base font-medium leading-normal font-display">
            {stepLabel}
          </p>
          <span className="text-sm font-bold text-violet-500">Step {step} of {TOTAL_STEPS}</span>
        </div>
        <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500" 
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STEP 1: Create Account (Supabase Auth) */}
      {step === 1 && (
        <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col items-start gap-4 mb-2">
            <Logo 
              className="w-16 h-16 drop-shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
              showText={true} 
              textClassName="text-3xl"
            />
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white leading-[1.1] mt-2">
              {authMode === 'register' ? 'Explora el Mundo' : 'Bienvenido'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-snug">
              {authMode === 'register' 
                ? 'Tu identidad de explorador comienza aquí. Crea tu cuenta para guardar tu progreso en la nube.'
                : 'Bienvenido de vuelta, explorador. Tu progreso te espera.'}
            </p>
          </div>

          {/* Auth Success State */}
          {authSuccess ? (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-2xl">check_circle</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {authMode === 'register' ? '¡Cuenta Creada!' : '¡Sesión Iniciada!'}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{email}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {authMode === 'register' 
                  ? 'Revisa tu email para confirmar tu cuenta. Mientras tanto, continúa configurando tu identidad.'
                  : 'Tu perfil ha sido restaurado. Continúa explorando.'}
              </p>
            </div>
          ) : (
            <>
              {/* Nickname */}
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Nickname <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">@</span>
                    <input 
                      type="text"
                      placeholder="CyberNomad"
                      value={authNickname}
                      onChange={(e) => setAuthNickname(e.target.value.replace(/\s+/g, ''))}
                      maxLength={30}
                      className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Company Name */}
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Empresa <span className="text-slate-400 font-normal">(opcional)</span></label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">apartment</span>
                    <input 
                      type="text"
                      placeholder="Tu empresa o startup"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      maxLength={60}
                      className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Email <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                  <input 
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-bold ml-1">Contraseña</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              {/* Confirm Password (Register only) */}
              {authMode === 'register' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1">Confirmar Contraseña</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Error */}
              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  <span className="material-symbols-outlined text-base">error</span>
                  {authError}
                </div>
              )}

              {/* Submit */}
              <button 
                onClick={handleAuth}
                disabled={authLoading}
                className="w-full h-14 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-bold shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                    Procesando...
                  </>
                ) : authMode === 'register' ? (
                  <>
                    <span className="material-symbols-outlined text-xl">person_add</span>
                    Crear Cuenta
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xl">login</span>
                    Iniciar Sesión
                  </>
                )}
              </button>

              {/* Toggle Auth Mode */}
              <div className="text-center">
                <button 
                  onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(null); }}
                  className="text-sm text-violet-500 font-bold hover:text-fuchsia-500 transition-colors"
                >
                  {authMode === 'register' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                </button>
              </div>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                  Encriptado E2E
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                  <span className="material-symbols-outlined text-[12px]">shield</span>
                  Supabase Auth
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STEP 2: Connections (ZeroClaw + Wallet) */}
      {step === 2 && (
        <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex flex-col items-start gap-2">
            <h1 className="tracking-tight text-[32px] font-bold leading-tight pt-2">Connect & Sync</h1>
            <p className="text-slate-500 text-base mt-2">
              Link your local AI agent and your Web3 wallet to unlock the full TripClaw experience.
            </p>
          </div>

          {/* ZeroClaw Gateway */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-violet-500 text-3xl">neurology</span>
              <div>
                <h3 className="font-bold text-lg">ZeroClaw Agent</h3>
                <p className="text-xs text-slate-500">Local autonomous intelligence</p>
              </div>
            </div>
            
            {isGatewayOnline ? (
              <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <span className="material-symbols-outlined">check_circle</span>
                <span className="font-bold text-sm">Gateway Connected</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input type="text" value={pairingCode} onChange={(e) => setPairingCode(e.target.value)} placeholder="6-digit code" maxLength={6}
                  className="w-full h-12 px-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center text-xl font-mono tracking-widest focus:ring-2 focus:ring-violet-500 outline-none" />
                <button onClick={handlePair} disabled={!pairingCode.trim() || pairingStatus === 'pairing'}
                  className="w-full h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold">
                  {pairingStatus === 'pairing' ? 'Pairing...' : 'Pair Agent'}
                </button>
              </div>
            )}
          </div>

          {/* Stellar Wallet */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-indigo-500 text-3xl">account_balance_wallet</span>
              <div>
                <h3 className="font-bold text-lg">Stellar Wallet</h3>
                <p className="text-xs text-slate-500">For Reputation & Swarm Voting</p>
              </div>
            </div>

            {publicKey ? (
              <div className="flex items-center justify-between text-indigo-500 bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="font-mono font-bold text-sm">{shortWallet(publicKey)}</span>
                </div>
                <span className="material-symbols-outlined">check_circle</span>
              </div>
            ) : (
              <button onClick={connect} disabled={connecting}
                className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors">
                {connecting ? 'Connecting...' : 'Connect Freighter'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STEP 3: Identity */}
      {step === 3 && (
        <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h1 className="tracking-tight text-[32px] font-bold leading-tight pt-2">Traveler Identity</h1>
            <p className="text-slate-500 text-base mt-2">
              How should the Swarm know you? Your identity dictates your starting skills and network reputation.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Nickname</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
              <input 
                type="text" 
                placeholder="AndeanNomad"
                value={identity.nickname}
                onChange={(e) => setIdentity({...identity, nickname: e.target.value.replace(/\s+/g, '')})}
                className="w-full h-14 pl-10 pr-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-lg focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold ml-1">Traveler Type</label>
            <div className="grid grid-cols-2 gap-3">
              {TRAVELER_TYPES.map(type => (
                <button 
                  key={type.id}
                  onClick={() => setIdentity({...identity, travelerType: type.id})}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                    identity.travelerType === type.id 
                      ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 shadow-md scale-[1.02]' 
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 text-slate-500 hover:border-violet-300'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl mb-2">{type.icon}</span>
                  <span className="text-xs font-bold text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* STEP 4: Companion */}
      {step === 4 && (
        <div className="px-4 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div>
            <h1 className="tracking-tight text-[32px] font-bold leading-tight pt-2">Choose Companion</h1>
            <p className="text-slate-500 text-base mt-2">
              Select your AI Agent persona. This will represent your node on the global map.
            </p>
          </div>

          <div className="space-y-4">
            {COMPANIONS.map(comp => (
              <button 
                key={comp.id}
                onClick={() => setIdentity({...identity, companion: comp.id})}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  identity.companion === comp.id 
                    ? 'border-fuchsia-500 bg-white dark:bg-slate-800 shadow-xl scale-[1.02]' 
                    : 'border-transparent bg-slate-100 dark:bg-slate-800/50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className={`size-14 rounded-xl bg-gradient-to-br ${comp.color} flex items-center justify-center text-white shadow-lg shrink-0`}>
                  <span className="material-symbols-outlined text-2xl">{comp.icon}</span>
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-lg">{comp.name}</h3>
                  <p className="text-xs text-slate-500">{comp.desc}</p>
                </div>
                {identity.companion === comp.id && (
                  <span className="material-symbols-outlined text-fuchsia-500">check_circle</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent z-50">
        <div className="flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold shrink-0 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          
          {/* Only show Continue if step 1 auth is done or step > 1 */}
          {(step > 1 || authSuccess) && (
            <button 
              onClick={() => {
                if (step < TOTAL_STEPS) setStep(step + 1);
                else if (step === TOTAL_STEPS && identity.companion) completeOnboarding();
              }}
              disabled={!canContinue()}
              className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-bold shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {step === TOTAL_STEPS ? 'Verificar Identidad →' : 'Continuar'}
            </button>
          )}
        </div>
        
        {step === 1 && !authSuccess && (
          <div className="flex items-center justify-center gap-1 mt-3">
            <span className="material-symbols-outlined text-[12px] text-slate-400">lock</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Protegido por Supabase Auth</p>
          </div>
        )}
      </div>
    </div>
  );
}
