import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface BreathingExerciseProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export function BreathingExercise({ onClose, isDarkMode }: BreathingExerciseProps) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [count, setCount] = useState(4);
  const [cycles, setCycles] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev === 1) {
          if (phase === 'inhale') {
            setPhase('hold');
            return 4;
          } else if (phase === 'hold') {
            setPhase('exhale');
            return 4;
          } else {
            setCycles(c => c + 1);
            setPhase('inhale');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (cycles >= 3) {
      setTimeout(onClose, 2000);
    }
  }, [cycles, onClose]);

  const getPhaseText = () => {
    if (phase === 'inhale') return 'Breathe in...';
    if (phase === 'hold') return 'Hold...';
    return 'Breathe out...';
  };

  const getScale = () => {
    if (phase === 'inhale') return 1.4;
    if (phase === 'hold') return 1.4;
    return 0.8;
  };

  if (cycles >= 3) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl">✨</div>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Well done</h2>
          <p className={isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}>Taking a moment for yourself matters</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`}>
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Quick Calm</h2>
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Cycle {cycles + 1} of 3</p>
        </div>
        <button
          onClick={onClose}
          className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
        >
          <X className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
        </button>
      </div>

      {/* Breathing Circle */}
      <div className="flex-1 flex items-center justify-center">
        <div className="relative">
          <motion.div
            animate={{ scale: getScale() }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="w-64 h-64 rounded-full bg-gradient-to-br from-[#ffb757] to-[#ffb757]/60 flex items-center justify-center shadow-2xl shadow-[#ffb757]/30"
          >
            <div className="text-center space-y-2">
              <div className="text-6xl font-bold text-white">{count}</div>
              <div className="text-xl text-white/90 font-medium">{getPhaseText()}</div>
            </div>
          </motion.div>

          {/* Glow effect */}
          <motion.div
            animate={{ 
              scale: getScale(),
              opacity: phase === 'hold' ? 0.8 : 0.4
            }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 -z-10 bg-[#ffb757]/20 rounded-full blur-3xl"
          />
        </div>
      </div>

      <div className="p-6 text-center">
        <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
          Follow the rhythm with your breath
        </p>
      </div>
    </div>
  );
}