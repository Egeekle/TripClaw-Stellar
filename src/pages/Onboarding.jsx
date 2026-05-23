import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';
import { useStellarWallet } from '../hooks/useStellarWallet';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { TOTAL_STEPS } from '../features/onboarding/constants/onboardingData';

import OnboardingProgress from '../features/onboarding/components/OnboardingProgress';
import StepAccount from '../features/onboarding/components/StepAccount';
import StepConnection from '../features/onboarding/components/StepConnection';
import StepIdentity from '../features/onboarding/components/StepIdentity';
import StepCompanion from '../features/onboarding/components/StepCompanion';

export default function Onboarding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pair, isGatewayOnline } = useOpenClaw();
  const { publicKey, connect, connecting } = useStellarWallet();
  const { isAuthenticated, user, updateProfile, loading: authHookLoading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [pairingCode, setPairingCode] = useState('');
  const [pairingStatus, setPairingStatus] = useState(null);

  const from = location.state?.from?.pathname || "/dashboard";

  // Auth State
  const [authMode, setAuthMode] = useState('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authNickname, setAuthNickname] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Identity State
  const [identity, setIdentity] = useState({
    nickname: '',
    travelerType: '',
    companion: ''
  });

  useEffect(() => {
    if (isAuthenticated && step === 1) {
      setStep(2);
    }
  }, [isAuthenticated, step]);

  useEffect(() => {
    if (user || authNickname) {
      setIdentity(prev => ({
        ...prev,
        nickname: user?.nickname || authNickname || prev.nickname,
        travelerType: user?.travelerType || prev.travelerType,
        companion: user?.companion || prev.companion
      }));
    }
  }, [user, authNickname]);

  useEffect(() => {
    if (isAuthenticated && user?.travelerType && user?.companion) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  const handleAuth = async () => {
    setAuthError(null);
    if (!email.trim() || !password.trim()) { setAuthError('Email y contraseña son requeridos.'); return; }
    if (authMode === 'register' && !authNickname.trim()) { setAuthError('El nickname es requerido.'); return; }
    if (authMode === 'register' && password !== confirmPassword) { setAuthError('Las contraseñas no coinciden.'); return; }
    if (password.length < 6) { setAuthError('La contraseña debe tener al menos 6 caracteres.'); return; }

    setAuthLoading(true);
    try {
      if (!supabase) {
        setAuthSuccess(true);
        setAuthLoading(false);
        return;
      }
      let result;
      if (authMode === 'register') {
        result = await supabase.auth.signUp({
          email, password,
          options: { data: { nickname: authNickname.trim(), company_name: companyName.trim() || null } }
        });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setAuthSuccess(true);
      }
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

  const completeOnboarding = async () => {
    try {
      setAuthLoading(true);
      await updateProfile(identity);
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError('Error al guardar tu perfil. Intenta de nuevo.');
    } finally {
      setAuthLoading(false);
    }
  };

  const shortWallet = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const stepLabel = step === 1 ? 'Cuenta' : step === 2 ? 'Conexión' : step === 3 ? 'Identidad' : 'Compañero';

  const canContinue = () => {
    if (step === 1) return authSuccess;
    if (step === 2) return true;
    if (step === 3) return identity.nickname && identity.travelerType;
    if (step === 4) return identity.companion;
    return false;
  };

  if (authHookLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg animate-pulse">
            <span className="material-symbols-outlined text-white text-2xl">neurology</span>
          </div>
          <p className="text-slate-400 text-sm font-medium">Sincronizando explorador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto min-h-screen flex flex-col justify-between relative pb-28 bg-background-dark text-white px-4">
      <div className="w-full">
        <OnboardingProgress step={step} label={stepLabel} totalSteps={TOTAL_STEPS} />

        <div className="mt-8">
          {step === 1 && (
            <StepAccount 
              authMode={authMode} setAuthMode={setAuthMode}
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
              authNickname={authNickname} setAuthNickname={setAuthNickname}
              companyName={companyName} setCompanyName={setCompanyName}
              authLoading={authLoading} authError={authError} authSuccess={authSuccess}
              showPassword={showPassword} setShowPassword={setShowPassword}
              handleAuth={handleAuth}
            />
          )}

          {step === 2 && (
            <StepConnection 
              isGatewayOnline={isGatewayOnline}
              pairingCode={pairingCode} setPairingCode={setPairingCode}
              pairingStatus={pairingStatus} handlePair={handlePair}
              publicKey={publicKey} connect={connect} connecting={connecting}
              shortWallet={shortWallet}
            />
          )}

          {step === 3 && <StepIdentity identity={identity} setIdentity={setIdentity} />}
          
          {step === 4 && <StepCompanion identity={identity} setIdentity={setIdentity} />}
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-50">
        <div className="flex gap-3">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 font-bold shrink-0 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          
          {(step > 1 || authSuccess) && (
            <button 
              onClick={() => {
                if (step < TOTAL_STEPS) setStep(step + 1);
                else if (step === TOTAL_STEPS && identity.companion) completeOnboarding();
              }}
              disabled={!canContinue()}
              className="flex-1 flex cursor-pointer items-center justify-center rounded-xl h-14 bg-gradient-primary text-white text-lg font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
            >
              {step === TOTAL_STEPS ? 'Completar Registro' : 'Continuar'}
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

