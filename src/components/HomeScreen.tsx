import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Heart, TrendingUp, Calendar, Activity, Gamepad2, BookOpen } from 'lucide-react';
import { CrisisResourcesModal } from './modals/CrisisResourcesModal';
import { getSensitiveValueSync, subscribeToSecureVault } from '../utils/secureVault';

interface HomeScreenProps {
  onStartCheckIn: () => void;
  isDarkMode: boolean;
  onNavigateToTrends: () => void;
  onOpenDailyCheckIn?: () => void;
  onNavigateToGames?: () => void;
  onOpenJournal?: () => void;
  onOpenJournalEntries?: () => void;
}

export function HomeScreen({ onStartCheckIn, isDarkMode, onNavigateToTrends, onOpenDailyCheckIn, onNavigateToGames, onOpenJournal, onOpenJournalEntries }: HomeScreenProps) {
  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [streak, setStreak] = useState(0);
  const [nextCheckIn, setNextCheckIn] = useState<string>('');
  const [todayStatus, setTodayStatus] = useState<string>('');
  const [dailyCheckInCompletedCount, setDailyCheckInCompletedCount] = useState(0);

  useEffect(() => {
    const refreshHomeData = () => {
    // Calculate streak
    const history = getSensitiveValueSync<any[]>('mindcheck_history', []);
    if (history.length > 0) {
      // Simple streak calculation
      setStreak(history.length);
    }

    // Get today's My Day Log completion count
    const today = new Date().toISOString().split('T')[0];
    const dailyCheckInData = getSensitiveValueSync<Record<string, any[]>>('mindcheck_ema_data', {});
    if (dailyCheckInData[today]) {
      setDailyCheckInCompletedCount(dailyCheckInData[today].length);
    }

    // Get next check-in date
    const prefs = JSON.parse(localStorage.getItem('mindcheck_preferences') || '{"frequency":"weekly"}');
    const lastAssessment = getSensitiveValueSync<string | null>('mindcheck_last_assessment', null);
    
    if (lastAssessment) {
      const lastDate = new Date(lastAssessment);
      let nextDate = new Date(lastDate);
      
      if (prefs.frequency === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (prefs.frequency === 'twice-weekly') {
        nextDate.setDate(nextDate.getDate() + 3);
      } else {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      
      const daysUntil = Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntil <= 0) {
        setNextCheckIn('Due today');
        setTodayStatus('ready');
      } else if (daysUntil === 1) {
        setNextCheckIn('Tomorrow');
        setTodayStatus('upcoming');
      } else {
        setNextCheckIn(`In ${daysUntil} days`);
        setTodayStatus('scheduled');
      }
    } else {
      setNextCheckIn('Ready when you are');
      setTodayStatus('ready');
    }
    };

    refreshHomeData();
    return subscribeToSecureVault(refreshHomeData);
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} pb-24 overflow-y-auto`}>
      <div className="p-5 space-y-4 pb-4">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-4"
        >
          <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
            Hello there 👋
          </h1>
          <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Today's Status Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`rounded-3xl p-5 shadow-lg ${
            todayStatus === 'ready' 
              ? 'bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80' 
              : isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                todayStatus === 'ready' ? 'bg-white/20' : 'bg-[#ffb757]/10'
              }`}>
                <Heart 
                  className={`w-6 h-6 ${todayStatus === 'ready' ? 'text-white' : 'text-[#ffb757]'}`} 
                  fill={todayStatus === 'ready' ? 'white' : '#ffb757'}
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <h3 className={`font-semibold ${todayStatus === 'ready' ? 'text-white' : isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  {todayStatus === 'ready' ? 'Ready for check-in' : 'Next check-in'}
                </h3>
                <p className={`text-sm ${todayStatus === 'ready' ? 'text-white/80' : isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  {nextCheckIn}
                </p>
              </div>
            </div>
            {todayStatus === 'ready' && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-3 h-3 rounded-full bg-white"
              />
            )}
          </div>
          
          {todayStatus === 'ready' && (
            <p className="text-white/90 text-sm mb-4">
              Taking a few minutes to check in can help you notice patterns and take care of yourself.
            </p>
          )}
          
          {todayStatus !== 'ready' && (
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              You can always check in early if something changes or you just want to reflect.
            </p>
          )}
          
          <button
            onClick={onStartCheckIn}
            className={`w-full py-3 rounded-xl font-semibold transition-all active:scale-[0.98] ${
              todayStatus === 'ready'
                ? 'bg-white text-[#ffb757] shadow-md'
                : 'bg-[#ffb757] text-white shadow-lg shadow-[#ffb757]/20'
            }`}
          >
            Start Check-in
          </button>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <button
            onClick={onNavigateToTrends}
            className={`${isDarkMode ? 'bg-gradient-to-br from-[#8d654c]/40 to-[#8d654c]/20' : 'bg-gradient-to-br from-[#8d654c]/25 to-[#8d654c]/15'} rounded-2xl p-3 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-sm flex flex-col`}
            style={{ aspectRatio: '1.1' }}
          >
            <div className={`w-9 h-9 ${isDarkMode ? 'bg-[#8d654c]/30' : 'bg-[#8d654c]/20'} rounded-xl flex items-center justify-center mb-2`}>
              <TrendingUp className={`w-4 h-4 ${isDarkMode ? 'text-[#ddc4af]' : 'text-[#8d654c]'}`} />
            </div>
            <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5 text-sm`}>View Trends</h4>
            <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-auto`}>See patterns</p>
          </button>

          {/* My Day Log Card */}
          {onOpenDailyCheckIn && (
            <button
              onClick={onOpenDailyCheckIn}
              className={`${isDarkMode ? 'bg-gradient-to-br from-[#6b3a30] to-[#4a2820] border-[#ff8a65]/20' : 'bg-gradient-to-br from-[#ff8a65]/10 to-[#ff6b6b]/10 border-[#ff8a65]/30'} border-2 rounded-2xl p-3 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-md flex flex-col relative`}
              style={{ aspectRatio: '1.1' }}
            >
              {dailyCheckInCompletedCount > 0 && (
                <div className="absolute top-2 right-2 bg-[#ffb757] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {dailyCheckInCompletedCount}/4
                </div>
              )}
              <div className={`w-9 h-9 ${isDarkMode ? 'bg-[#ff8a65]/25' : 'bg-[#ff8a65]/20'} rounded-xl flex items-center justify-center mb-2`}>
                <Activity className={`w-4 h-4 ${isDarkMode ? 'text-[#ff8a65]' : 'text-[#ff8a65]'}`}/>
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5 text-sm`}>My Day Log</h4>
              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-auto`}>
                Track wellbeing moments
              </p>
            </button>
          )}

          {/* Games Card */}
          {onNavigateToGames && (
            <button
              onClick={onNavigateToGames}
              className={`${isDarkMode ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/20 border-purple-500/30' : 'bg-gradient-to-br from-purple-400/10 to-indigo-400/10 border-purple-400/30'} border-2 rounded-2xl p-3 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-md flex flex-col`}
              style={{ aspectRatio: '1.1' }}
            >
              <div className={`w-9 h-9 ${isDarkMode ? 'bg-purple-500/25' : 'bg-purple-400/20'} rounded-xl flex items-center justify-center mb-2`}>
                <Gamepad2 className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-400'}`}/>
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5 text-sm`}>Games</h4>
              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-auto`}>
                Focus & Memory
              </p>
            </button>
          )}

          {/* Journal Card */}
          {onOpenJournal && (
            <button
              onClick={onOpenJournal}
              className={`${isDarkMode ? 'bg-gradient-to-br from-teal-900/30 to-cyan-900/20 border-teal-500/30' : 'bg-gradient-to-br from-[#ddc4af]/10 to-[#ddc4af]/20 border-[#ddc4af]/30'} border-2 rounded-2xl p-3 text-left hover:bg-opacity-90 transition-all active:scale-[0.98] shadow-md flex flex-col`}
              style={{ aspectRatio: '1.1' }}
            >
              <div className={`w-9 h-9 ${isDarkMode ? 'bg-teal-500/25' : 'bg-[#ddc4af]/20'} rounded-xl flex items-center justify-center mb-2`}>
                <BookOpen className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-[#ddc4af]'}`}/>
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-0.5 text-sm`}>Journal</h4>
              <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mt-auto`}>
                Reflect & Write
              </p>
            </button>
          )}
        </motion.div>

        {/* Reminder Card - Full Width Rectangle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => setShowCrisisModal(true)}
            className={`w-full ${isDarkMode ? 'bg-[#ddc4af]/20 border-[#ddc4af]/40' : 'bg-[#ddc4af]/30 border-[#ddc4af]/40'} border-2 rounded-2xl p-4 text-left hover:bg-opacity-90 transition-all active:scale-[0.98]`}
          >
            <div className="flex gap-3">
              <div className={`w-9 h-9 ${isDarkMode ? 'bg-[#ddc4af]/20' : 'bg-[#8d654c]/10'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1 text-sm`}>Reminder</h4>
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                  This is a self-reflection tool, not a diagnostic service. If you're in crisis, please reach out for immediate support.
                </p>
                <span className="text-xs text-[#ffb757] font-semibold mt-1.5 inline-block">
                  Crisis resources →
                </span>
              </div>
            </div>
          </button>
        </motion.div>
      </div>
      
      {showCrisisModal && (
        <CrisisResourcesModal
          onClose={() => setShowCrisisModal(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
