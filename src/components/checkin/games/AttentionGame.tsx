import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Sparkles } from 'lucide-react';

interface AttentionGameProps {
  onComplete: (score: number) => void;
  isDarkMode?: boolean;
}

export function AttentionGame({ onComplete, isDarkMode = false }: AttentionGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [circles, setCircles] = useState<{ id: number; shouldGlow: boolean; x: number; y: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  useEffect(() => {
    if (gameStarted && !gameComplete) {
      // Generate 12 circles with random positions
      const newCircles = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        shouldGlow: Math.random() > 0.5, // 50% chance to glow
        x: Math.random() * 70 + 10, // 10-80% of width
        y: Math.random() * 70 + 10  // 10-80% of height
      }));
      setCircles(newCircles);
    }
  }, [gameStarted, gameComplete]);

  useEffect(() => {
    if (gameStarted && currentIndex < circles.length && !gameComplete) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    } else if (currentIndex >= circles.length && gameStarted) {
      setGameComplete(true);
      const accuracy = (score / circles.filter(c => c.shouldGlow).length) * 100;
      setTimeout(() => {
        onComplete(Math.round(accuracy));
      }, 2000);
    }
  }, [currentIndex, gameStarted, circles, gameComplete, score, onComplete]);

  const handleCircleTap = (circle: typeof circles[0]) => {
    if (circle.shouldGlow) {
      setScore(prev => prev + 1);
    }
    setTaps(prev => prev + 1);
  };

  if (!gameStarted) {
    return (
      <div className="px-6 py-12 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-[#ffb757] to-[#ffb757]/70 rounded-full flex items-center justify-center shadow-lg"
        >
          <Zap className="w-10 h-10 text-white" strokeWidth={2} />
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[#8d654c]">Quick Focus Check</h2>
          <p className="text-[#8d654c]/70 max-w-sm mx-auto leading-relaxed">
            Tap only the circles that <strong>glow</strong>. They'll appear one by one for just a moment.
          </p>
        </div>

        <div className="bg-white/60 rounded-2xl p-5 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-[#ffb757]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#ffb757]" />
            </div>
            <div className="text-sm text-[#8d654c]/70">
              This helps us notice your attention patterns — there's no pass or fail
            </div>
          </div>
        </div>

        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
        >
          Start Challenge
        </button>
      </div>
    );
  }

  if (gameComplete) {
    return (
      <div className="px-6 py-12 text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="text-6xl"
        >
          ✨
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[#8d654c]">Great focus!</h2>
          <p className="text-[#8d654c]/70">
            You tapped {score} of {circles.filter(c => c.shouldGlow).length} glowing circles correctly
          </p>
        </div>

        <div className="bg-[#ffb757]/10 rounded-2xl p-4 max-w-xs mx-auto">
          <div className="text-4xl font-bold text-[#ffb757]">
            {Math.round((score / circles.filter(c => c.shouldGlow).length) * 100)}%
          </div>
          <div className="text-sm text-[#8d654c]/60 mt-1">Focus score</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-[#8d654c] mb-2">Tap the glowing circles</h3>
        <div className="text-sm text-[#8d654c]/60">
          {currentIndex + 1} of {circles.length}
        </div>
      </div>

      <div className="relative bg-white/60 rounded-3xl h-[400px] border-2 border-white shadow-inner">
        <AnimatePresence mode="wait">
          {currentIndex < circles.length && (
            <motion.button
              key={circles[currentIndex].id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => handleCircleTap(circles[currentIndex])}
              className={`absolute w-16 h-16 rounded-full cursor-pointer transition-transform active:scale-90 ${
                circles[currentIndex].shouldGlow
                  ? 'bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 shadow-lg shadow-[#ffb757]/40 animate-pulse'
                  : 'bg-[#ddc4af]/40'
              }`}
              style={{
                left: `${circles[currentIndex].x}%`,
                top: `${circles[currentIndex].y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {circles[currentIndex].shouldGlow && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-[#ffb757]/30 -z-10"
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}