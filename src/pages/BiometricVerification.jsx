import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BiometricVerification() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => navigate("/dashboard"), 500); // Go back to onboarding/dashboard
            return 100;
          }
          return prev + 1;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isScanning, navigate]);

  const handleStartScan = () => {
    setIsScanning(true);
  };

  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col p-6 font-display text-slate-900 dark:text-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full z-10">
        <h1 className="text-3xl font-black mb-2 text-center tracking-tight">Verificación Biométrica</h1>
        <p className="text-slate-500 text-center mb-16 text-sm">
          Autenticación segura para identidad Web3
        </p>

        {/* Biometric Scanner */}
        <div className="relative w-64 h-64 mb-12">
          {/* Angular Brackets (CSS fallback for framer-motion) */}
          <div className={`absolute inset-0 transition-all duration-1000 ${isScanning ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-violet-500 rounded-tl-xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-violet-500 rounded-tr-xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-violet-500 rounded-bl-xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-violet-500 rounded-br-xl"></div>
          </div>

          {/* Face Area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-48 h-48 rounded-full border-2 border-violet-500/20 flex items-center justify-center bg-violet-500/5 transition-all duration-500 ${isScanning ? 'shadow-[0_0_50px_rgba(139,92,246,0.3)] animate-pulse' : ''}`}
            >
              <span className="material-symbols-outlined text-7xl text-violet-500/50">face</span>
            </div>
          </div>

          {/* Scanning Line */}
          {isScanning && (
            <div
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent shadow-[0_0_15px_rgba(217,70,239,0.8)] z-20 animate-[scan_2s_linear_infinite]"
              style={{ top: '20%' }}
            >
              <style>{`
                @keyframes scan {
                  0% { top: 10%; opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { top: 90%; opacity: 0; }
                }
              `}</style>
            </div>
          )}

          {/* Progress Circle */}
          {isScanning && (
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle
                cx="50%"
                cy="50%"
                r="125"
                fill="none"
                stroke="rgba(139, 92, 246, 0.1)"
                strokeWidth="4"
              />
              <circle
                cx="50%"
                cy="50%"
                r="125"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-fuchsia-500 transition-all duration-75 ease-linear"
                strokeDasharray={2 * Math.PI * 125}
                strokeDashoffset={2 * Math.PI * 125 * (1 - progress / 100)}
              />
            </svg>
          )}
        </div>

        {/* Status Badges */}
        <div className="flex gap-4 mb-8">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-violet-500/30 rounded-xl px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-violet-500">settings_input_antenna</span>
            <span className="text-xs font-bold text-violet-500 tracking-wider">LIVE SYNC</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-emerald-500">lock</span>
            <span className="text-xs font-bold tracking-wider">ENCRYPTED</span>
          </div>
        </div>

        {/* Status Text */}
        <div className={`text-center mb-8 h-12 transition-opacity duration-300 ${isScanning ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-violet-500 dark:text-violet-400 font-bold mb-1 tracking-widest uppercase">Scanning...</p>
          <p className="text-sm font-mono text-slate-500">{progress}%</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4 max-w-md mx-auto w-full z-10 pb-8">
        <button
          onClick={handleStartScan}
          disabled={isScanning}
          className="w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale shadow-lg shadow-violet-500/20 active:scale-95"
        >
          {isScanning ? "Verificando Identidad..." : "Iniciar Escaneo Facial"}
        </button>
        <button
          onClick={handleSkip}
          className="w-full h-14 bg-transparent text-slate-500 dark:text-slate-400 font-bold rounded-xl hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Omitir por ahora
        </button>
      </div>

      {/* Notice */}
      <div className="max-w-xs mx-auto z-10">
        <p className="text-[10px] text-center text-slate-400 uppercase tracking-wider leading-relaxed">
          Tus datos biométricos se procesan localmente. Solo guardamos una prueba criptográfica (ZK-Proof) on-chain.
        </p>
      </div>
    </div>
  );
}
