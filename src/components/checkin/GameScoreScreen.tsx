import { motion } from 'motion/react';
import { Crosshair, Target, Brain, Trophy, Star, TrendingUp, Zap, Calculator } from 'lucide-react';
import { GameMetrics as GoNoGoMetrics } from '../games/GoNoGoGame';
import { GameMetrics as AttentionMetrics } from '../games/AttentionGame';
import { GameMetrics as MemoryMetrics } from '../games/MemoryGame';
import { GameMetrics as CountingMetrics } from '../games/CountingGame';
import { saveGameMetrics } from '../../utils/dataSync';
import { useEffect } from 'react';

interface GameScoreScreenProps {
  gameType: 'gonogo' | 'attention' | 'memory' | 'counting';
  metrics: GoNoGoMetrics | AttentionMetrics | MemoryMetrics | CountingMetrics;
  onContinue: () => void;
  isDarkMode?: boolean;
}

export function GameScoreScreen({ gameType, metrics, onContinue, isDarkMode = false }: GameScoreScreenProps) {
  // Save game metrics to backend when component mounts
  useEffect(() => {
    const saveMetrics = async () => {
      try {
        const metricsToSave = { 
          type: gameType, 
          ...metrics, 
          timestamp: new Date().toISOString() 
        };
        console.log('Saving game metrics:', metricsToSave); // Debug log
        await saveGameMetrics(metricsToSave);
        console.log(`${gameType} game metrics saved successfully`);
        
        // Verify save by reading back
        const savedData = localStorage.getItem('mindcheck_game_metrics');
        console.log('Current localStorage game metrics:', savedData ? JSON.parse(savedData) : 'No data');
      } catch (error) {
        console.error(`Error saving ${gameType} game metrics:`, error);
      }
    };
    
    saveMetrics();
  }, [gameType, metrics]);

  const getGameInfo = () => {
    switch (gameType) {
      case 'gonogo':
        const gonogoMetrics = metrics as GoNoGoMetrics;
        return {
          title: 'Focus Game Complete!',
          subtitle: 'Go/No-Go Task',
          icon: Crosshair,
          color: 'from-green-400 to-emerald-500',
          bgColor: 'bg-green-50',
          primaryScore: gonogoMetrics.inhibitionScore,
          primaryLabel: 'Inhibition Control',
          primaryUnit: '%',
          stats: [
            { label: 'Hits', value: gonogoMetrics.hits, icon: Target },
            { label: 'Reaction Time', value: `${gonogoMetrics.averageReactionTime}ms`, icon: Zap },
            { label: 'False Alarms', value: gonogoMetrics.falseAlarms, icon: TrendingUp }
          ],
          message: gonogoMetrics.inhibitionScore >= 80 
            ? "Excellent impulse control! Your ability to inhibit responses is strong."
            : gonogoMetrics.inhibitionScore >= 60
            ? "Good focus! You're doing well at managing your responses."
            : "Nice effort! This task is challenging and you're building important skills.",
          encouragement: gonogoMetrics.inhibitionScore >= 80
            ? "Outstanding performance! 🎯"
            : "Great job completing the task! 💪"
        };
      
      case 'attention':
        const attentionMetrics = metrics as AttentionMetrics;
        return {
          title: 'Attention Game Complete!',
          subtitle: 'Spatial Span Task',
          icon: Target,
          color: 'from-blue-400 to-sky-500',
          bgColor: 'bg-blue-50',
          primaryScore: attentionMetrics.accuracy,
          primaryLabel: 'Accuracy',
          primaryUnit: '%',
          stats: [
            { label: 'Sequences', value: `${attentionMetrics.correctSequences}/${attentionMetrics.totalTrials}`, icon: Target },
            { label: 'Avg Time', value: `${attentionMetrics.averageReactionTime}ms`, icon: Zap },
            { label: 'Longest Span', value: attentionMetrics.longestSequence, icon: TrendingUp }
          ],
          message: attentionMetrics.correctSequences >= 9
            ? "Amazing memory work! You're recalling sequences with exceptional accuracy. Your spatial memory is truly impressive!"
            : attentionMetrics.correctSequences >= 7
            ? "Great memory! You're doing really well at remembering and recalling the sequences. Your focus is strong!"
            : attentionMetrics.correctSequences >= 5
            ? "Nice work! You're building your memory skills with each sequence. Keep practicing and you'll continue improving!"
            : attentionMetrics.correctSequences >= 3
            ? "You're doing it! Memory tasks like these take practice, and you're developing important cognitive skills with each attempt."
            : "Every sequence you complete helps strengthen your memory! These exercises are valuable for building spatial recall abilities.",
          encouragement: attentionMetrics.correctSequences >= 9
            ? "Your memory is remarkable! 🌟🧠"
            : attentionMetrics.correctSequences >= 7
            ? "Excellent recall skills! 🎯✨"
            : attentionMetrics.correctSequences >= 5
            ? "You're building strong memory! 💪🧠"
            : attentionMetrics.correctSequences >= 3
            ? "Great effort - memory grows with practice! 🌱"
            : "Every sequence counts - you're learning! 💫"
        };
      
      case 'memory':
        const memoryMetrics = metrics as MemoryMetrics;
        return {
          title: 'Memory Game Complete!',
          subtitle: 'Sequential Recall Task',
          icon: Brain,
          color: 'from-purple-400 to-pink-500',
          bgColor: 'bg-purple-50',
          primaryScore: memoryMetrics.accuracy,
          primaryLabel: 'Accuracy',
          primaryUnit: '%',
          stats: [
            { label: 'Correct Recalls', value: memoryMetrics.correctRecalls, icon: Target },
            { label: 'Max Sequence', value: memoryMetrics.maxSequenceLength, icon: Star },
            { label: 'Avg Time', value: `${memoryMetrics.averageReactionTime}ms`, icon: Zap }
          ],
          message: memoryMetrics.accuracy >= 80
            ? "Impressive memory! You recalled sequences with great accuracy."
            : memoryMetrics.accuracy >= 60
            ? "Nice work! Your memory performance shows solid recall ability."
            : "Well done! Memory tasks are challenging, and you completed them all.",
          encouragement: memoryMetrics.accuracy >= 80
            ? "Your memory is sharp! 🧠"
            : "Every recall builds your memory strength! 💫"
        };
      
      case 'counting':
        const countingMetrics = metrics as CountingMetrics;
        return {
          title: 'Counting Game Complete!',
          subtitle: 'Backward Counting Task',
          icon: Calculator,
          color: 'from-[#ffb757] to-[#ddc4af]',
          bgColor: isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5',
          primaryScore: countingMetrics.accuracy,
          primaryLabel: 'Accuracy',
          primaryUnit: '%',
          stats: [
            { label: 'Correct Steps', value: countingMetrics.correctSteps, icon: Target },
            { label: 'Total Time', value: `${countingMetrics.totalTime}s`, icon: Star },
            { label: 'Avg Time', value: `${countingMetrics.averageReactionTime}ms`, icon: Zap }
          ],
          message: countingMetrics.accuracy >= 80
            ? "Excellent concentration! Your mental calculation skills are strong."
            : countingMetrics.accuracy >= 60
            ? "Nice work! You maintained good focus during the counting task."
            : "Well done! Counting backward can be challenging, and you completed it.",
          encouragement: countingMetrics.accuracy >= 80
            ? "Your focus is impressive! 🎯"
            : "Great effort on this mental challenge! 💪"
        };
    }
  };

  const info = getGameInfo();
  const Icon = info.icon;

  // Determine overall performance level
  const getPerformanceLevel = () => {
    if (info.primaryScore >= 85) return { level: 'Excellent', color: 'text-green-600' };
    if (info.primaryScore >= 70) return { level: 'Good', color: 'text-blue-600' };
    if (info.primaryScore >= 50) return { level: 'Fair', color: 'text-yellow-600' };
    return { level: 'Needs Practice', color: 'text-orange-600' };
  };

  const performance = getPerformanceLevel();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col items-center justify-center p-6`}>
      <div className="w-full max-w-md space-y-6">
        {/* Trophy Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.5 }}
          className="flex justify-center"
        >
          <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${info.color} p-1 shadow-2xl`}>
            <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-[#1a1410]' : 'bg-white'} flex items-center justify-center`}>
              <Trophy className={`w-16 h-16 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#ffb757]'}`} strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-1"
        >
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            {info.title}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
            {info.subtitle}
          </p>
        </motion.div>

        {/* Primary Score */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  {info.primaryLabel}
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Overall Performance
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                {info.primaryScore}{info.primaryUnit}
              </div>
              <div className={`text-sm font-semibold ${performance.color}`}>
                {performance.level}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#8d654c]/10">
            {info.stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-1">
                    <StatIcon className={`w-4 h-4 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#8d654c]/60'}`} />
                  </div>
                  <div className={`text-lg font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                    {stat.value}
                  </div>
                  <div className={`text-[10px] ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Message Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-lg space-y-3`}
        >
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-[#ece5de]/90' : 'text-[#8d654c]/90'}`}>
            {info.message}
          </p>
          
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} border-2 border-[#ffb757]/20`}>
            <Star className="w-5 h-5 text-[#ffb757] flex-shrink-0" />
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              {info.encouragement}
            </p>
          </div>
        </motion.div>

        {/* Info Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className={`text-center text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} px-4`}
        >
          These cognitive games help track your mental agility over time
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={onContinue}
          className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}