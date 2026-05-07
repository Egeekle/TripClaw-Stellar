import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HiddenDiscoveryOverlay({ discovery, onClose, onAccept }) {
  const [textStage, setTextStage] = useState(0);

  // Simulate AI terminal decoding effect
  useEffect(() => {
    if (!discovery) return;
    
    const timers = [
      setTimeout(() => setTextStage(1), 800),  // "Signal detected..."
      setTimeout(() => setTextStage(2), 2000), // "Decrypting coordinates..."
      setTimeout(() => setTextStage(3), 3500), // Reveal discovery
    ];

    return () => timers.forEach(clearTimeout);
  }, [discovery]);

  if (!discovery) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm pointer-events-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="relative w-full max-w-md bg-black/80 backdrop-blur-2xl border border-violet-500/30 rounded-2xl p-6 overflow-hidden shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)]"
        >
          {/* Cyberpunk scanning grid background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* Scanning line animation */}
          <motion.div 
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-violet-500/50 shadow-[0_0_10px_2px_rgba(139,92,246,0.8)] pointer-events-none"
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="size-10 rounded-full bg-violet-500/20 border border-violet-500/50 flex items-center justify-center">
              <motion.span 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="material-symbols-outlined text-violet-400"
              >
                radar
              </motion.span>
            </div>
            <div>
              <h2 className="text-violet-400 text-xs font-mono font-bold tracking-[0.2em] uppercase">Swarm Intel</h2>
              <p className="text-white font-bold text-lg leading-tight">Hidden Discovery</p>
            </div>
          </div>

          {/* Decoding Content */}
          <div className="min-h-[120px] relative z-10">
            {textStage === 0 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-400 font-mono text-sm flex items-center gap-2">
                <span className="w-2 h-4 bg-violet-500 animate-pulse"></span>
                Intercepting local signal...
              </motion.p>
            )}
            
            {textStage === 1 && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-300 font-mono text-sm flex items-center gap-2">
                <span className="w-2 h-4 bg-violet-500 animate-pulse"></span>
                Decrypting coordinates... [Matching Weather: {discovery.weather}]
              </motion.p>
            )}

            {textStage >= 2 && (
              <motion.div 
                initial={{ opacity: 0, filter: "blur(10px)" }} 
                animate={{ opacity: 1, filter: "blur(0px)" }}
                className="space-y-4"
              >
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <h3 className="text-white font-bold text-xl mb-1">{discovery.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{discovery.description}</p>
                </div>

                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-1.5 text-fuchsia-400">
                    <span className="material-symbols-outlined text-sm">stars</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{discovery.rarity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Only {discovery.foundCount} found this</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          {textStage >= 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex gap-3 mt-6 relative z-10"
            >
              <button 
                onClick={onClose}
                className="flex-1 h-12 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:bg-white/10 hover:text-white transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={() => onAccept(discovery)}
                className="flex-[2] h-12 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all active:scale-95"
              >
                Initiate Route (+{discovery.xpReward} XP)
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
