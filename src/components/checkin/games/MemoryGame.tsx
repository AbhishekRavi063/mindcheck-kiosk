import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles } from 'lucide-react';

interface MemoryGameProps {
  onComplete: (score: number) => void;
  isDarkMode?: boolean;
}

export function MemoryGame({ onComplete, isDarkMode = false }: MemoryGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [showCards, setShowCards] = useState(true);
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const emojis = ['🌸', '⭐', '🌊', '🌙', '🔥', '🌈'];

  useEffect(() => {
    if (gameStarted) {
      // Create pairs (only 3 pairs = 6 cards)
      const pairs = [0, 0, 1, 1, 2, 2];
      const shuffled = pairs.sort(() => Math.random() - 0.5);
      setCards(shuffled);

      // Show cards for 2 seconds
      setTimeout(() => {
        setShowCards(false);
      }, 2000);
    }
  }, [gameStarted]);

  useEffect(() => {
    if (flipped.length === 2) {
      setAttempts(prev => prev + 1);
      
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        setFlipped([]);
        
        // Check if game is complete
        if (matched.length + 2 === cards.length) {
          setGameComplete(true);
          const score = Math.max(0, 100 - (attempts * 10));
          setTimeout(() => {
            onComplete(score);
          }, 1500);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 800);
      }
    }
  }, [flipped, cards, matched, attempts, onComplete]);

  const handleCardClick = (index: number) => {
    if (showCards || flipped.length >= 2 || flipped.includes(index) || matched.includes(index)) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  if (!gameStarted) {
    return (
      <div className="px-6 py-12 text-center space-y-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-[#8d654c] to-[#8d654c]/80 rounded-full flex items-center justify-center shadow-lg"
        >
          <Brain className="w-10 h-10 text-white" strokeWidth={2} />
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[#8d654c]">Memory Moment</h2>
          <p className="text-[#8d654c]/70 max-w-sm mx-auto leading-relaxed">
            Watch the cards carefully. Then find the matching pairs from memory.
          </p>
        </div>

        <div className="bg-white/60 rounded-2xl p-5 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 bg-[#8d654c]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#8d654c]" />
            </div>
            <div className="text-sm text-[#8d654c]/70">
              Memory can vary day to day — this is just a gentle check-in
            </div>
          </div>
        </div>

        <button
          onClick={() => setGameStarted(true)}
          className="px-8 py-4 bg-[#8d654c] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#8d654c]/20 active:scale-[0.98] transition-transform"
        >
          Begin
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
          🎯
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[#8d654c]">Well done!</h2>
          <p className="text-[#8d654c]/70">
            You found all pairs in {attempts} {attempts === 1 ? 'try' : 'tries'}
          </p>
        </div>

        <div className="bg-[#8d654c]/10 rounded-2xl p-4 max-w-xs mx-auto">
          <div className="text-4xl font-bold text-[#8d654c]">
            {Math.max(0, 100 - (attempts * 10))}%
          </div>
          <div className="text-sm text-[#8d654c]/60 mt-1">Memory score</div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      <div className="text-center mb-8">
        <h3 className="text-lg font-semibold text-[#8d654c] mb-2">
          {showCards ? 'Watch carefully...' : 'Find the matching pairs'}
        </h3>
        <div className="text-sm text-[#8d654c]/60">
          Pairs found: {matched.length / 2} of 3
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
        {cards.map((card, index) => (
          <motion.button
            key={index}
            onClick={() => handleCardClick(index)}
            initial={{ rotateY: 0 }}
            animate={{ 
              rotateY: (showCards || flipped.includes(index) || matched.includes(index)) ? 0 : 180
            }}
            transition={{ duration: 0.3 }}
            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl shadow-lg ${
              showCards || flipped.includes(index) || matched.includes(index)
                ? 'bg-white'
                : 'bg-[#ddc4af]'
            }`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {(showCards || flipped.includes(index) || matched.includes(index)) && (
              <span>{emojis[card]}</span>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}