import { motion } from 'motion/react';
import { Heart, Zap, Sparkles, ArrowLeft, Star, Lock, Clock, BookOpen, PenLine, X, Calendar, Brain } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getSensitiveValueSync, subscribeToSecureVault } from '../../utils/secureVault';

interface CheckInTypeSelectorProps {
  onSelect: (type: 'full' | 'phq9' | 'pss' | 'rses' | 'gad7') => void;
  isDarkMode?: boolean;
  onBack?: () => void;
  onNavigateToDayLog?: () => void;
  onNavigateToJournal?: () => void;
}

export function CheckInTypeSelector({ onSelect, isDarkMode = false, onBack, onNavigateToDayLog, onNavigateToJournal }: CheckInTypeSelectorProps) {
  const [lockStatus, setLockStatus] = useState({
    phq9: { locked: false, daysLeft: 0 },
    pss: { locked: false, daysLeft: 0 },
    rses: { locked: false, daysLeft: 0 },
    gad7: { locked: false, daysLeft: 0 },
    full: { locked: false, daysLeft: 0 }
  });
  
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [lockedType, setLockedType] = useState<'full' | 'phq9' | 'pss' | 'rses' | 'gad7' | null>(null);

  useEffect(() => {
    const LOCKOUT_DAYS = 14; // Changed to 14 days (2 weeks)

    const refreshLockStatus = () => {
      const now = new Date();
      const checkLockStatus = (key: 'phq9' | 'pss' | 'rses' | 'gad7') => {
        const storageKey = (
          key === 'phq9' ? 'mindcheck_last_phq9' :
          key === 'pss' ? 'mindcheck_last_pss' :
          key === 'rses' ? 'mindcheck_last_rses' :
          'mindcheck_last_gad7'
        );
        const lastAttempt = getSensitiveValueSync<string | null>(storageKey, null);
        if (lastAttempt) {
          const lastDate = new Date(lastAttempt);
          const diffMs = now.getTime() - lastDate.getTime();
          const daysPassed = diffMs / (1000 * 60 * 60 * 24);
          const daysLeft = Math.ceil(LOCKOUT_DAYS - daysPassed);

          if (daysPassed < LOCKOUT_DAYS) {
            return { locked: true, daysLeft };
          }
        }
        return { locked: false, daysLeft: 0 };
      };

    const phq9Status = checkLockStatus('phq9');
    const pssStatus = checkLockStatus('pss');
    const rsesStatus = checkLockStatus('rses');
    const gad7Status = checkLockStatus('gad7');
    
    // Full check-in is locked if ALL four are locked
    const allLocked = phq9Status.locked && pssStatus.locked && rsesStatus.locked && gad7Status.locked;
    const maxDaysLeft = Math.max(phq9Status.daysLeft, pssStatus.daysLeft, rsesStatus.daysLeft, gad7Status.daysLeft);

    setLockStatus({
      phq9: phq9Status,
      pss: pssStatus,
      rses: rsesStatus,
      gad7: gad7Status,
      full: { locked: allLocked, daysLeft: maxDaysLeft }
    });
    };

    refreshLockStatus();
    return subscribeToSecureVault(refreshLockStatus);
  }, []);

  const handleSelect = (type: 'full' | 'phq9' | 'pss' | 'rses' | 'gad7') => {
    if (lockStatus[type].locked) {
      setLockedType(type);
      setShowLockedModal(true);
      return; // Show soft disclaimer modal
    }
    onSelect(type);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} p-6 overflow-y-auto`}>
      <div className="max-w-[390px] mx-auto pt-4 pb-24 space-y-6">
        {/* Back button */}
        {onBack && (
          <button
            onClick={onBack}
            className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
          </button>
        )}

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-2"
        >
          <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            Choose Your Check-in
          </h1>
          <p className={isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}>
            What would you like to reflect on today?
          </p>
        </motion.div>

        <div className="space-y-3">
          {/* Full Check-in */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => handleSelect('full')}
            className={`w-full bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-3xl p-6 text-left shadow-lg active:scale-[0.98] transition-transform relative overflow-hidden`}
          >
            {lockStatus.full.locked ? (
              <div className="absolute top-2 right-2 px-3 py-1 bg-white/30 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-semibold">{lockStatus.full.daysLeft}d left</span>
              </div>
            ) : (
              <div className="absolute top-2 right-2 px-3 py-1 bg-white/20 rounded-full">
                <span className="text-xs text-white font-semibold">Recommended</span>
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                {lockStatus.full.locked ? (
                  <Lock className="w-6 h-6 text-white" strokeWidth={2} />
                ) : (
                  <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-1">
                  Full Check-in
                </h3>
                <p className="text-white/80 text-sm">
                  {lockStatus.full.locked ? 'All scales completed recently' : 'Mood, stress, & self-esteem'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <span>⏱️ ~15 minutes</span>
              <span>•</span>
              <span>36 questions + 3 games</span>
            </div>
          </motion.button>

          {/* PHQ-9 Only */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleSelect('phq9')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-3xl p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all relative`}
          >
            {lockStatus.phq9.locked && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-[#9dc4e8]/80 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-semibold">{lockStatus.phq9.daysLeft}d left</span>
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#ffb757]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                {lockStatus.phq9.locked ? (
                  <Lock className="w-6 h-6 text-[#ffb757]" strokeWidth={2} />
                ) : (
                  <Heart className="w-6 h-6 text-[#ffb757]" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Mood & Energy (PHQ-9)
                </h3>
                <p className={`${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} text-sm`}>
                  {lockStatus.phq9.locked ? 'Completed recently - take a break' : 'Focus on recent mood patterns'}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} text-sm`}>
              <span>⏱️ ~5 minutes</span>
              <span>•</span>
              <span>10 questions + 1 game</span>
            </div>
          </motion.button>

          {/* PSS Only */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleSelect('pss')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-3xl p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all relative`}
          >
            {lockStatus.pss.locked && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-[#9dc4e8]/80 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-semibold">{lockStatus.pss.daysLeft}d left</span>
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#8d654c]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                {lockStatus.pss.locked ? (
                  <Lock className="w-6 h-6 text-[#8d654c]" strokeWidth={2} />
                ) : (
                  <Zap className="w-6 h-6 text-[#8d654c]" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Stress (PSS)
                </h3>
                <p className={`${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} text-sm`}>
                  {lockStatus.pss.locked ? 'Completed recently - take a break' : 'How stressed have you felt lately?'}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} text-sm`}>
              <span>⏱️ ~5 minutes</span>
              <span>•</span>
              <span>7 questions + 1 game</span>
            </div>
          </motion.button>

          {/* RSES Only */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => handleSelect('rses')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-3xl p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all relative`}
          >
            {lockStatus.rses.locked && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-[#9dc4e8]/80 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-semibold">{lockStatus.rses.daysLeft}d left</span>
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#8d654c]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                {lockStatus.rses.locked ? (
                  <Lock className="w-6 h-6 text-[#8d654c]" strokeWidth={2} />
                ) : (
                  <Star className="w-6 h-6 text-[#8d654c]" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Self-Esteem (RSES)
                </h3>
                <p className={`${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} text-sm`}>
                  {lockStatus.rses.locked ? 'Completed recently - take a break' : 'How do you feel about yourself?'}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} text-sm`}>
              <span>⏱️ ~5 minutes</span>
              <span>•</span>
              <span>10 questions + 1 game</span>
            </div>
          </motion.button>

          {/* GAD-7 Only */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => handleSelect('gad7')}
            className={`w-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-3xl p-6 text-left shadow-sm hover:shadow-md active:scale-[0.98] transition-all relative`}
          >
            {lockStatus.gad7.locked && (
              <div className="absolute top-2 right-2 px-3 py-1 bg-[#9dc4e8]/80 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-xs text-white font-semibold">{lockStatus.gad7.daysLeft}d left</span>
              </div>
            )}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-[#8d654c]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                {lockStatus.gad7.locked ? (
                  <Lock className="w-6 h-6 text-[#8d654c]" strokeWidth={2} />
                ) : (
                  <Brain className="w-6 h-6 text-[#8d654c]" strokeWidth={2} />
                )}
              </div>
              <div className="flex-1">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                  Anxiety (GAD-7)
                </h3>
                <p className={`${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} text-sm`}>
                  {lockStatus.gad7.locked ? 'Completed recently - take a break' : 'How anxious have you felt lately?'}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} text-sm`}>
              <span>⏱️ ~5 minutes</span>
              <span>•</span>
              <span>7 questions + 1 game</span>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-[#8d654c]/50 px-4"
        >
          All check-ins are private and saved only on your device
        </motion.div>
      </div>

      {/* Locked Modal */}
      {showLockedModal && lockedType && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowLockedModal(false)}
          />

          {/* Modal - Bottom sheet on mobile, centered on desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`relative w-full sm:max-w-md ${
              isDarkMode ? 'bg-[#2a2218]' : 'bg-white'
            } rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden`}
          >
            {/* Swipe indicator (mobile only) */}
            <div className="sm:hidden flex justify-center pt-3 pb-2">
              <div className={`w-10 h-1 rounded-full ${
                isDarkMode ? 'bg-[#ece5de]/30' : 'bg-[#8d654c]/20'
              }`} />
            </div>

            {/* Close button (top right) */}
            <button
              onClick={() => setShowLockedModal(false)}
              className={`absolute top-4 right-4 w-8 h-8 rounded-full ${
                isDarkMode ? 'bg-[#1a1410]/50 hover:bg-[#1a1410]/70' : 'bg-[#ece5de]/50 hover:bg-[#ece5de]/70'
              } flex items-center justify-center transition-colors z-10`}
              aria-label="Close"
            >
              <X className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
            </button>

            {/* Content */}
            <div className="px-6 pb-6 pt-4">
              {/* Icon with Calendar */}
              <div className="flex justify-center mb-5">
                <div className={`w-16 h-16 rounded-2xl ${
                  isDarkMode ? 'bg-[#9dc4e8]/15' : 'bg-[#9dc4e8]/20'
                } flex items-center justify-center`}>
                  <Calendar className={`w-8 h-8 ${isDarkMode ? 'text-[#9dc4e8]' : 'text-[#5b8db8]'}`} strokeWidth={1.5} />
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-xl font-semibold text-center mb-3 ${
                isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'
              }`}>
                Better insights take a little time
              </h2>

              {/* Body text */}
              <p className={`text-center mb-3 leading-relaxed ${
                isDarkMode ? 'text-[#ece5de]/75' : 'text-[#8d654c]/75'
              }`}>
                For more meaningful tracking, it's best to retake this check-in after <span className="font-semibold">2 weeks</span>. Filling it too early may not reflect real changes.
              </p>

              {/* Secondary guidance */}
              <p className={`text-center mb-6 text-sm ${
                isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'
              }`}>
                You can still log how your day is going using Journaling or Daily Logs meanwhile.
              </p>

              {/* CTA buttons */}
              {/* Primary (subtle) - Fill anyway */}
              <button
                onClick={() => {
                  setShowLockedModal(false);
                  onSelect(lockedType);
                }}
                className={`w-full py-4 rounded-2xl font-medium transition-all active:scale-[0.98] mb-3 ${
                  isDarkMode
                    ? 'bg-[#ece5de]/10 text-[#ece5de]/80 hover:bg-[#ece5de]/15 border border-[#ece5de]/20'
                    : 'bg-[#8d654c]/8 text-[#8d654c]/80 hover:bg-[#8d654c]/12 border border-[#8d654c]/15'
                }`}
              >
                Fill anyway
              </button>

              {/* Secondary (recommended) - Remind me later */}
              <button
                onClick={() => {
                  setShowLockedModal(false);
                }}
                className={`w-full py-4 rounded-2xl font-semibold transition-all active:scale-[0.98] mb-3 ${
                  isDarkMode
                    ? 'bg-[#9dc4e8] text-[#1a1410] hover:bg-[#8bb3d8]'
                    : 'bg-[#9dc4e8] text-white hover:bg-[#7ba4cc]'
                } shadow-lg shadow-[#9dc4e8]/20`}
              >
                Remind me later
              </button>

              {/* Tertiary - Go to Journal */}
              <button
                onClick={() => {
                  setShowLockedModal(false);
                  onNavigateToJournal?.();
                }}
                className={`w-full py-2 rounded-xl text-sm transition-all active:scale-[0.98] ${
                  isDarkMode
                    ? 'text-[#ece5de]/50 hover:text-[#ece5de]/70 hover:underline'
                    : 'text-[#8d654c]/50 hover:text-[#8d654c]/70 hover:underline'
                }`}
              >
                Go to Journal
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
