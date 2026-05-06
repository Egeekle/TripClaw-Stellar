import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenClaw } from '../context/OpenClawContext';

const INTERESTS = [
  { icon: 'restaurant', label: 'Food & Dining' },
  { icon: 'landscape', label: 'Nature & Hiking' },
  { icon: 'museum', label: 'Museums & Culture' },
  { icon: 'nightlife', label: 'Nightlife' },
  { icon: 'photo_camera', label: 'Photography' },
  { icon: 'beach_access', label: 'Beach & Relax' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { pair, isGatewayOnline } = useOpenClaw();
  const [pairingCode, setPairingCode] = useState('');
  const [pairingStatus, setPairingStatus] = useState(null);
  const [pairingResult, setPairingResult] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState(new Set());

  const toggleInterest = (label) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  const handlePair = async () => {
    if (!pairingCode.trim()) return;
    setPairingStatus('pairing');
    const result = await pair(pairingCode.trim());
    setPairingStatus(result && !result.error ? 'success' : 'error');
    setPairingResult(result);
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen flex flex-col relative pb-24">
      <div className="flex flex-col gap-3 p-4 pt-8">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-slate-900 dark:text-white text-base font-medium leading-normal font-display">Agent Setup</p>
          <span className="material-symbols-outlined text-violet-500">security</span>
        </div>
        <div className="rounded-full bg-slate-200 dark:bg-[#3b4d54]">
          <div className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" style={{ width: '50%' }}></div>
        </div>
        <p className="text-slate-500 dark:text-[#9db2b9] text-sm font-normal leading-normal">Agent Pairing</p>
      </div>

      <div className="px-4">
        <h1 className="text-slate-900 dark:text-white tracking-tight text-[32px] font-bold leading-tight pt-6">Connect to ZeroClaw</h1>
        <p className="text-slate-600 dark:text-slate-300 text-base font-normal leading-normal pt-2">
          TripClaw connects to your local <strong className="text-violet-500">ZeroClaw</strong> agent for autonomous trip planning and intelligence.
        </p>
      </div>

      <div className="p-4">
        <div className="flex flex-col items-stretch justify-start rounded-xl shadow-lg bg-white dark:bg-[#1c2427] border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="w-full h-48 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-fuchsia-800 to-slate-900"></div>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-violet-500/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/3 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-xl border flex items-center justify-center mb-2 shadow-2xl transition-all ${isGatewayOnline ? 'border-emerald-400/50 shadow-emerald-500/20' : 'border-white/20'}`}>
                <span className="material-symbols-outlined text-white text-5xl">{isGatewayOnline ? 'check_circle' : 'neurology'}</span>
              </div>
              <span className={`text-xs font-medium uppercase tracking-widest ${isGatewayOnline ? 'text-emerald-300' : 'text-violet-300'}`}>
                {isGatewayOnline ? '🦀 Gateway Online' : '🦀 ZeroClaw Agent'}
              </span>
            </div>
          </div>

          <div className="flex w-full grow flex-col items-stretch justify-center gap-4 p-5">
            <div>
              <p className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                {isGatewayOnline ? 'Gateway Connected!' : 'Pair Your Agent'}
              </p>
              <p className="text-slate-500 dark:text-[#9db2b9] text-sm font-normal leading-normal mt-1">
                {isGatewayOnline
                  ? 'Your ZeroClaw agent is running and ready.'
                  : <>ZeroClaw gateway on <code className="text-violet-500 bg-violet-500/10 px-1 py-0.5 rounded text-xs font-mono">localhost:18789</code> — enter the pairing code shown in your terminal.</>}
              </p>
            </div>

            {!isGatewayOnline && (
              <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                  <input type="text" value={pairingCode} onChange={(e) => setPairingCode(e.target.value)} placeholder="Enter 6-digit pairing code" maxLength={6}
                    className="flex-1 h-12 px-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center text-xl font-mono font-bold tracking-[0.3em] placeholder:text-slate-400 placeholder:text-sm placeholder:tracking-normal placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                    onKeyDown={(e) => e.key === 'Enter' && handlePair()} />
                  <button onClick={handlePair} disabled={!pairingCode.trim() || pairingStatus === 'pairing'}
                    className="h-12 px-5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-bold disabled:opacity-40 active:scale-95 transition-all shadow-lg shadow-violet-500/20">
                    {pairingStatus === 'pairing' ? <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> : 'Pair'}
                  </button>
                </div>
                {pairingStatus === 'success' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">check_circle</span>
                    <p className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">Paired! Copy the token to your <code className="font-mono">.env</code> file and restart.</p>
                  </div>
                )}
                {pairingStatus === 'error' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-800/50">
                    <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm">error</span>
                    <p className="text-red-700 dark:text-red-400 text-xs font-medium">{pairingResult?.error || 'Pairing failed. Check the code and try again.'}</p>
                  </div>
                )}
                <p className="text-slate-400 text-[10px] text-center">
                  Run <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">POST /pair</code> with <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">X-Pairing-Code</code> header
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interest Tags — now interactive */}
      <div className="px-4">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight pt-4">What are you exploring?</h3>
        <p className="text-slate-500 dark:text-[#9db2b9] text-sm mb-4">Choose interests to help your agent personalize recommendations.</p>
        <div className="flex flex-wrap gap-2 pb-6">
          {INTERESTS.map((item) => (
            <button key={item.label} onClick={() => toggleInterest(item.label)}
              className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-all ${
                selectedInterests.has(item.label)
                  ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                  : 'border-slate-200 dark:border-slate-700 bg-transparent text-slate-600 dark:text-slate-300 hover:border-violet-400/50'
              }`}>
              <span className="material-symbols-outlined text-sm">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-gradient-to-t from-background-light dark:from-background-dark via-background-light dark:via-background-dark to-transparent">
        <button onClick={() => navigate('/dashboard')}
          className="w-full flex cursor-pointer items-center justify-center rounded-xl h-14 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white text-lg font-bold shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-transform">
          {isGatewayOnline ? 'Launch Dashboard' : 'Get Started'}
        </button>
        <div className="flex items-center justify-center gap-1 mt-3">
          <span className="material-symbols-outlined text-[12px] text-slate-400">lock</span>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Local-first · Your data stays on your machine</p>
        </div>
      </div>
    </div>
  );
}
