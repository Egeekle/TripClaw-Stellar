import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LevelUpModal({ levelData, onClose }) {
  const [particles, setParticles] = useState([]);

  // Generate random particles for the explosion effect
  useEffect(() => {
    if (levelData) {
      const newParticles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        angle: Math.random() * Math.PI * 2,
        velocity: 50 + Math.random() * 150,
        size: 2 + Math.random() * 4,
        delay: Math.random() * 0.2
      }));
      setParticles(newParticles);
    }
  }, [levelData]);

  if (!levelData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 1.1, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          className="relative w-full max-w-sm flex flex-col items-center text-center perspective-1000"
        >
          {/* Particle Explosion */}
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{
                x: Math.cos(p.angle) * p.velocity,
                y: Math.sin(p.angle) * p.velocity,
                opacity: 0
              }}
              transition={{ duration: 1, delay: p.delay, ease: "easeOut" }}
              className={`absolute top-1/2 left-1/2 rounded-full bg-gradient-to-r ${levelData.rank.color}`}
              style={{ width: p.size, height: p.size, marginTop: -60 }}
            />
          ))}

          {/* Holographic Badge */}
          <motion.div 
            animate={{ 
              y: [0, -10, 0],
              boxShadow: ["0px 0px 20px rgba(139,92,246,0.2)", "0px 0px 60px rgba(139,92,246,0.6)", "0px 0px 20px rgba(139,92,246,0.2)"]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`w-32 h-32 mb-6 rounded-3xl bg-gradient-to-br ${levelData.rank.color} flex items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 30%, 0 60%)' }}></div>
            <span className="text-white text-5xl font-black font-mono shadow-sm">{levelData.newLevel}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-violet-400 text-xs font-mono font-bold tracking-[0.3em] uppercase mb-1">
              Neural Sync Complete
            </h2>
            <h1 className="text-white text-4xl font-black tracking-tight mb-2">Level Up!</h1>
            <p className="text-slate-400 text-sm mb-6 max-w-[250px]">
              You have been promoted to <strong className="text-white">{levelData.rank.name}</strong>. New Swarm capabilities unlocked.
            </p>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onClose}
            className={`w-full h-14 rounded-2xl bg-gradient-to-r ${levelData.rank.color} text-white font-bold text-lg shadow-lg active:scale-95 transition-all`}
          >
            Acknowledge
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
