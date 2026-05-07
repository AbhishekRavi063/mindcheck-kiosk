import { useState } from 'react';
import { motion } from 'motion/react';
import { Crosshair, Target, Brain, Sparkles, Calculator } from 'lucide-react';
import { GoNoGoGame, GameMetrics as GoNoGoMetrics } from './games/GoNoGoGame';
import { AttentionGame, GameMetrics as AttentionMetrics } from './games/AttentionGame';
import { MemoryGame, GameMetrics as MemoryMetrics } from './games/MemoryGame';
import { CountingGame, GameMetrics as CountingMetrics } from './games/CountingGame';
import { GameScoreScreen } from './checkin/GameScoreScreen';
import { BackButton } from './ui/BackButton';
import { saveGame, logUserActivity } from '../utils/firebaseSync';

interface GamesScreenProps {
  onBack: () => void;
  isDarkMode: boolean;
}

export function GamesScreen({ onBack, isDarkMode }: GamesScreenProps) {
  const [selectedGame, setSelectedGame] = useState<'gonogo' | 'attention' | 'memory' | 'counting' | null>(null);
  const [showGameScore, setShowGameScore] = useState(false);
  const [gameMetrics, setGameMetrics] = useState<GoNoGoMetrics | AttentionMetrics | MemoryMetrics | CountingMetrics | null>(null);

  const handleGameComplete = (metrics: GoNoGoMetrics | AttentionMetrics | MemoryMetrics | CountingMetrics) => {
    saveGame({
      checkin_type: 'individual',
      game_type: selectedGame!,
      played: true,
      metrics,
    });
    logUserActivity('game_played', { game_type: selectedGame! });
    setGameMetrics(metrics);
    setShowGameScore(true);
  };

  const handleScoreContinue = () => {
    setShowGameScore(false);
    setSelectedGame(null);
    setGameMetrics(null);
  };

  if (showGameScore && gameMetrics && selectedGame) {
    return (
      <GameScoreScreen
        gameType={selectedGame}
        metrics={gameMetrics}
        onContinue={handleScoreContinue}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (selectedGame === 'gonogo') {
    return <GoNoGoGame onComplete={handleGameComplete} isDarkMode={isDarkMode} onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'attention') {
    return <AttentionGame onComplete={handleGameComplete} isDarkMode={isDarkMode} onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'memory') {
    return <MemoryGame onComplete={handleGameComplete} isDarkMode={isDarkMode} onBack={() => setSelectedGame(null)} />;
  }

  if (selectedGame === 'counting') {
    return <CountingGame onComplete={handleGameComplete} isDarkMode={isDarkMode} onBack={() => setSelectedGame(null)} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} pb-24 overflow-y-auto`}>
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="pt-8">
          <BackButton onClick={onBack} isDarkMode={isDarkMode} className="mb-4" />
          <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
            Cognitive Games
          </h1>
          <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>
            Train your focus, attention, and memory
          </p>
        </div>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`${isDarkMode ? 'bg-[#ffb757]/20 border-[#ffb757]/40' : 'bg-[#ffb757]/10 border-[#ffb757]/30'} border-2 rounded-2xl p-5`}
        >
          <div className="flex gap-3">
            <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#ffb757]'} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                About These Games
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                These cognitive games help track your mental agility over time. Play them regularly to see how your focus, attention, and memory change.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <div className="space-y-3">
          {/* Go/No-Go Game */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setSelectedGame('gonogo')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Crosshair className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Focus Game
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Go/No-Go Task
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} mt-1`}>
                  Test your impulse control and selective responding
                </p>
              </div>
              <div className={`text-2xl ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`}>
                →
              </div>
            </div>
          </motion.button>

          {/* Attention Game */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setSelectedGame('attention')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-sky-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Target className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Spatial Span Game
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Sequence Memory Task
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} mt-1`}>
                  Measure your spatial working memory
                </p>
              </div>
              <div className={`text-2xl ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`}>
                →
              </div>
            </div>
          </motion.button>

          {/* Memory Game */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => setSelectedGame('memory')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Digit Span Game
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Number Memory Task
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} mt-1`}>
                  Challenge your working memory with digits
                </p>
              </div>
              <div className={`text-2xl ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`}>
                →
              </div>
            </div>
          </motion.button>

          {/* Counting Game */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setSelectedGame('counting')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Calculator className="w-8 h-8 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold text-lg ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Counting Game
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Backward Counting Task
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} mt-1`}>
                  Assess your concentration and mental calculation
                </p>
              </div>
              <div className={`text-2xl ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'}`}>
                →
              </div>
            </div>
          </motion.button>
        </div>

        {/* Tips Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5`}
        >
          <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-3`}>
            Tips for Best Results
          </h3>
          <ul className={`space-y-2 text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
            <li className="flex gap-2">
              <span className="text-[#ffb757] flex-shrink-0">•</span>
              <span>Play in a quiet environment with minimal distractions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ffb757] flex-shrink-0">•</span>
              <span>Respond as quickly and accurately as possible</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ffb757] flex-shrink-0">•</span>
              <span>Track your scores over time to see improvements</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#ffb757] flex-shrink-0">•</span>
              <span>Don't worry about individual performances - trends matter more</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}