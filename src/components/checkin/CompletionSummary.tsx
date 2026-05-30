import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, Heart, Zap, Brain, TrendingUp, TrendingDown, Minus, Target, Crosshair, Calculator } from 'lucide-react';
import { GameMetrics as GoNoGoMetrics } from '../games/GoNoGoGame';
import { GameMetrics as AttentionMetrics } from '../games/AttentionGame';
import { GameMetrics as MemoryMetrics } from '../games/MemoryGame';
import { GameMetrics as CountingMetrics } from '../games/CountingGame';
import { saveGameMetrics } from '../../utils/dataSync';
import { calculatePssScore } from '../../utils/pssScore';
import { calculateRsesScore } from '../../utils/rsesScore';
import { enableCloudSync, disableCloudSync, uploadAllLocalData } from '../../utils/cloudSync';
import { DataSyncPreferenceModal } from '../modals/DataSyncPreferenceModal';
import { getSensitiveValueSync, setSensitiveValue } from '../../utils/secureVault';
import { logUserActivity } from '../../utils/firebaseSync';

interface CompletionSummaryProps {
  checkInType: 'full' | 'phq9' | 'pss' | 'rses' | 'gad7';
  phq9Answers: number[];
  pssAnswers: number[];
  rsesAnswers: number[];
  gad7Answers: number[];
  goNoGoMetrics?: GoNoGoMetrics | null;
  attentionMetrics?: AttentionMetrics | null;
  memoryMetrics?: MemoryMetrics | null;
  countingMetrics?: CountingMetrics | null;
  journalEntries?: { entry: string, hashtags: string[], emotions: string[], media: { type: 'photo' | 'video', url: string } | null, prompt: string | null, moodIntensities?: { [emotion: string]: number } }[];
  functionalImpairment?: number | null;
  isFirstCheckIn?: boolean;
  onComplete: () => void;
  isDarkMode?: boolean;
}

export function CompletionSummary({
  checkInType,
  phq9Answers,
  pssAnswers,
  rsesAnswers,
  gad7Answers,
  goNoGoMetrics,
  attentionMetrics,
  memoryMetrics,
  countingMetrics,
  journalEntries,
  functionalImpairment,
  isFirstCheckIn = false,
  onComplete,
  isDarkMode = false
}: CompletionSummaryProps) {
  const [showSyncPreferenceModal, setShowSyncPreferenceModal] = useState(false);
  const hasShownModal = useRef(false);
  
  const phq9Score = phq9Answers.reduce((a, b) => a + b, 0);
  const pssScore = calculatePssScore(pssAnswers);
  const gad7Score = gad7Answers.reduce((a, b) => a + b, 0);
  
  const rsesScore = calculateRsesScore(rsesAnswers);

  useEffect(() => {
    // Show sync preference modal after the very first check-in
    const hasAskedSyncPreference = localStorage.getItem('mindcheck_sync_preference_asked') === 'true';
    if (isFirstCheckIn && !hasAskedSyncPreference && !hasShownModal.current) {
      setTimeout(() => {
        setShowSyncPreferenceModal(true);
        hasShownModal.current = true;
        // NOTE: first_consent_shown logged inside onChooseBackend AFTER enableCloudSync()
        // Logging here would be dropped — sync not enabled yet
      }, 2000);
    }

    // Game metrics are also saved by GameScoreScreen on mount; this covers the
    // edge-case where a game completes but CompletionSummary is the first to run.
    if (goNoGoMetrics) {
      saveGameMetrics({ type: 'gonogo', ...goNoGoMetrics, timestamp: new Date().toISOString() }).catch(error => {
        console.error('Error saving game metrics:', error);
      });
    }
    if (attentionMetrics) {
      saveGameMetrics({ type: 'attention', ...attentionMetrics, timestamp: new Date().toISOString() }).catch(error => {
        console.error('Error saving game metrics:', error);
      });
    }
    if (memoryMetrics) {
      saveGameMetrics({ type: 'memory', ...memoryMetrics, timestamp: new Date().toISOString() }).catch(error => {
        console.error('Error saving game metrics:', error);
      });
    }
    if (countingMetrics) {
      saveGameMetrics({ type: 'counting', ...countingMetrics, timestamp: new Date().toISOString() }).catch(error => {
        console.error('Error saving game metrics:', error);
      });
    }

    // Save journal entries if present
    if (journalEntries && journalEntries.length > 0) {
      const saveJournalEntries = async () => {
        for (const journalData of journalEntries) {
          const formattedEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            entry: journalData.entry,
            emotions: journalData.emotions,
            moodIntensities: journalData.moodIntensities ?? {},
            hashtags: journalData.hashtags,
            media: journalData.media,
            prompt: journalData.prompt,
            checkin_type: 'guided',
            timestamp: Date.now(),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };

          const hashtagCount = getSensitiveValueSync<Record<string, number>>('mindcheck_hashtag_count', {});
          journalData.hashtags.forEach(tag => {
            hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
          });
          setSensitiveValue('mindcheck_hashtag_count', hashtagCount).catch(error => {
            console.error('Error saving hashtag counts:', error);
          });

          try {
            const existingEntries = getSensitiveValueSync<any[]>('mindcheck_journal_entries_all', []);
            const alreadySaved = existingEntries.some((e: any) => e.id === formattedEntry.id);
            if (!alreadySaved) {
              existingEntries.unshift(formattedEntry);
              await setSensitiveValue('mindcheck_journal_entries_all', existingEntries);
            }
          } catch (e) {
            console.error('Error saving journal entry:', e);
            try {
              const entryWithoutMedia = { ...formattedEntry, media: null };
              const existingEntries = getSensitiveValueSync<any[]>('mindcheck_journal_entries_all', []);
              existingEntries.unshift(entryWithoutMedia);
              await setSensitiveValue('mindcheck_journal_entries_all', existingEntries);
            } catch (e2) {
              console.error('Critical: Could not save journal entry at all:', e2);
            }
          }
        }
      };

      saveJournalEntries().catch(error => {
        console.error('Error saving journal entries:', error);
      });
    }
  }, []);

  const getPhq9Range = (score: number) => {
    if (score <= 4) return { level: 'Lower range', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 9) return { level: 'Lower-moderate range', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score <= 14) return { level: 'Moderate range', color: 'text-orange-500', bg: 'bg-orange-50' };
    if (score <= 19) return { level: 'Moderate-higher range', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Higher range', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getPssRange = (score: number) => {
    if (score <= 13) return { level: 'Lower stress', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 26) return { level: 'Moderate stress', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Higher stress', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  const getRsesRange = (score: number) => {
    if (score <= 15) return { level: 'Lower self-esteem', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (score <= 25) return { level: 'Average self-esteem', color: 'text-green-600', bg: 'bg-green-50' };
    return { level: 'High self-esteem', color: 'text-blue-600', bg: 'bg-blue-50' };
  };

  const getGad7Range = (score: number) => {
    if (score <= 4) return { level: 'Minimal anxiety', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 9) return { level: 'Mild anxiety', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score <= 14) return { level: 'Moderate anxiety', color: 'text-orange-500', bg: 'bg-orange-50' };
    return { level: 'Severe anxiety', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const phq9Range = phq9Score ? getPhq9Range(phq9Score) : null;
  const pssRange = pssScore ? getPssRange(pssScore) : null;
  const rsesRange = rsesScore ? getRsesRange(rsesScore) : null;
  const gad7Range = gad7Score ? getGad7Range(gad7Score) : null;

  // Get previous scores for comparison
  const history = getSensitiveValueSync<any[]>('mindcheck_history', []);
  const previousEntry = history.length > 1 ? history[history.length - 2] : null;

  const getTrend = (current: number, previous: number | null) => {
    if (!previous) return null;
    const diff = current - previous;
    if (Math.abs(diff) <= 2) return { icon: Minus, label: 'Similar to last time' };
    if (diff > 0) return { icon: TrendingUp, label: `+${diff} from last time` };
    return { icon: TrendingDown, label: `${diff} from last time` };
  };

  const phq9Trend = previousEntry?.phq9Score ? getTrend(phq9Score, previousEntry.phq9Score) : null;
  const pssTrend = previousEntry?.pssScore ? getTrend(pssScore, previousEntry.pssScore) : null;
  const rsesTrend = previousEntry?.rsesScore ? getTrend(rsesScore, previousEntry.rsesScore) : null;
  const gad7Trend = previousEntry?.gad7Score ? getTrend(gad7Score, previousEntry.gad7Score) : null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} overflow-y-auto pb-24`}>
      <div className="p-6 space-y-6">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="flex justify-center pt-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            Check-in complete
          </h1>
          <p className={isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}>
            Thank you for taking time to reflect
          </p>
        </motion.div>

        {/* Score Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* PHQ-9 Score */}
          {phq9Answers.length > 0 && phq9Range && (
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Mood & Energy</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>PHQ-9 Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{phq9Score}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>of 27</div>
                </div>
              </div>
              
              <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${phq9Range.bg} ${phq9Range.color} mb-2`}>
                {phq9Range.level}
              </div>

              {phq9Trend && (
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-2`}>
                  <phq9Trend.icon className="w-4 h-4" />
                  <span>{phq9Trend.label}</span>
                </div>
              )}

              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mt-3 leading-relaxed`}>
                Your responses suggest you may be experiencing {phq9Range.level.toLowerCase()} symptoms. Remember, this is not a diagnosis.
              </p>
            </div>
          )}

          {/* Go/No-Go Game Metrics */}
          {goNoGoMetrics && (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/50'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <Crosshair className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Focus Game Results</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Go/No-Go Task</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{goNoGoMetrics.hits}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Hits</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{goNoGoMetrics.inhibitionScore}%</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Inhibition</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{goNoGoMetrics.averageReactionTime}ms</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Reaction Time</div>
                </div>
              </div>
              
              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-3`}>
                False Alarms: {goNoGoMetrics.falseAlarms} • Misses: {goNoGoMetrics.misses}
              </p>
            </div>
          )}

          {/* PSS Score */}
          {pssAnswers.length > 0 && pssRange && (
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Stress Level</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>PSS Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{pssScore}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>of 40</div>
                </div>
              </div>
              
              <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${pssRange.bg} ${pssRange.color} mb-2`}>
                {pssRange.level}
              </div>

              {pssTrend && (
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-2`}>
                  <pssTrend.icon className="w-4 h-4" />
                  <span>{pssTrend.label}</span>
                </div>
              )}

              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mt-3 leading-relaxed`}>
                You're experiencing {pssRange.level.toLowerCase()}. Stress ebbs and flows — noticing patterns helps.
              </p>
            </div>
          )}

          {/* Attention Game Metrics */}
          {attentionMetrics && (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-sky-900/30 border-2 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200/50'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Attention Game Results</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Visual Target Detection</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{attentionMetrics.correctSequences}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Correct</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{attentionMetrics.accuracy}%</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Accuracy</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{attentionMetrics.averageReactionTime}ms</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Avg Time</div>
                </div>
              </div>

              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-3`}>
                Longest sequence: {attentionMetrics.longestSequence} • Avg span: {attentionMetrics.averageSpan}
              </p>
            </div>
          )}

          {/* RSES Score */}
          {rsesAnswers.length > 0 && rsesRange && (
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Self-Esteem</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>RSES Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{rsesScore}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>of 40</div>
                </div>
              </div>
              
              <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${rsesRange.bg} ${rsesRange.color} mb-2`}>
                {rsesRange.level}
              </div>

              {rsesTrend && (
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-2`}>
                  <rsesTrend.icon className="w-4 h-4" />
                  <span>{rsesTrend.label}</span>
                </div>
              )}

              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mt-3 leading-relaxed`}>
                Your self-esteem is {rsesRange.level.toLowerCase()}. Reflecting on your strengths can help boost it.
              </p>
            </div>
          )}

          {/* Memory Game Metrics */}
          {memoryMetrics && (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200/50'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Memory Game Results</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Sequential Recall Task</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{memoryMetrics.correctRecalls}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Correct</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{memoryMetrics.accuracy}%</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Accuracy</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{memoryMetrics.longestSpan}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Longest Span</div>
                </div>
              </div>

              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-3`}>
                Avg Time: {memoryMetrics.averageReactionTime}ms • Longest span: {memoryMetrics.longestSpan}
              </p>
            </div>
          )}

          {/* Counting Game Metrics */}
          {countingMetrics && (
            <div className={`${isDarkMode ? 'bg-gradient-to-br from-gray-900/30 to-gray-900/30 border-2 border-gray-700/50' : 'bg-gradient-to-br from-gray-50 to-gray-50 border-2 border-gray-200/50'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-500 rounded-xl flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Counting Game Results</h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Counting Task</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{countingMetrics.correctRecalls}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Correct</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{countingMetrics.accuracy}%</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Accuracy</div>
                </div>
                <div>
                  <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{countingMetrics.maxSequenceLength}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Max Length</div>
                </div>
              </div>
              
              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-3`}>
                Avg Time: {countingMetrics.averageReactionTime}ms • Errors: {countingMetrics.incorrectRecalls}
              </p>
            </div>
          )}

          {/* GAD-7 Score */}
          {gad7Answers.length > 0 && gad7Range && (
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Anxiety Level</h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>GAD-7 Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>{gad7Score}</div>
                  <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>of 21</div>
                </div>
              </div>
              
              <div className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold ${gad7Range.bg} ${gad7Range.color} mb-2`}>
                {gad7Range.level}
              </div>

              {gad7Trend && (
                <div className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-2`}>
                  <gad7Trend.icon className="w-4 h-4" />
                  <span>{gad7Trend.label}</span>
                </div>
              )}

              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mt-3 leading-relaxed`}>
                Your anxiety level is {gad7Range.level.toLowerCase()}. Reflecting on your feelings can help manage it.
              </p>
            </div>
          )}
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#ffb757]/10 border-2 border-[#ffb757]/30 rounded-2xl p-5"
        >
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'} leading-relaxed`}>
            <strong>Important:</strong> These results are for self-reflection only. If you're concerned about your mental health or experiencing a crisis, please speak with a healthcare professional or contact crisis support.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onComplete}
          className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
        >
          View My Trends
        </motion.button>
      </div>

      {/* Data Sync Preference Modal */}
      <AnimatePresence>
        {showSyncPreferenceModal && (
          <DataSyncPreferenceModal
            isDarkMode={isDarkMode}
            onClose={() => {
              // Dismissed — treat as declined, sync not enabled so no Firestore record
              localStorage.setItem('mindcheck_sync_preference_asked', 'true');
              localStorage.setItem('mindcheck_cloud_backup_enabled', 'false');
              setShowSyncPreferenceModal(false);
              onComplete();
            }}
            onChooseBackend={() => {
              localStorage.setItem('mindcheck_cloud_backup_preference', 'accepted');
              enableCloudSync(); // must be FIRST — events below need isSyncEnabled()=true
              logUserActivity('first_consent_shown', { source: 'post_checkin' });
              logUserActivity('cloud_sync_enabled', { source: 'post_checkin' });
              uploadAllLocalData();
              setShowSyncPreferenceModal(false);
              onComplete();
            }}
            onChooseLocal={() => {
              // Declined — sync never enabled, events dropped by execute()
              localStorage.setItem('mindcheck_cloud_backup_preference', 'declined');
              disableCloudSync();
              setShowSyncPreferenceModal(false);
              onComplete();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
