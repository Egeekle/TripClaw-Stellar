import React from 'react';
import Logo from '../../../components/Logo';

export default function StepAccount({
  authMode, setAuthMode,
  email, setEmail,
  password, setPassword,
  confirmPassword, setConfirmPassword,
  authNickname, setAuthNickname,
  companyName, setCompanyName,
  authLoading, authError, authSuccess, 
  showPassword, setShowPassword, 
  handleAuth
}) {
  return (
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
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}

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
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Email <span className="text-red-400">*</span></label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
              <input 
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold ml-1">Contraseña</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
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
                  className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium text-base focus:ring-2 focus:ring-violet-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          )}

          {authError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
              <span className="material-symbols-outlined text-base">error</span>
              {authError}
            </div>
          )}

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

          <div className="text-center">
            <button 
              onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); }}
              className="text-sm text-violet-500 font-bold hover:text-fuchsia-500 transition-colors"
            >
              {authMode === 'register' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>

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
  );
}
