import { motion, AnimatePresence } from 'motion/react';
import { ClipboardList, Gamepad2, BookOpen, X, Zap, Clock } from 'lucide-react';

interface CheckInBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'questionnaire' | 'game' | 'journal' | 'ema' | 'quick' | 'full') => void;
  isDarkMode: boolean;
}

export function CheckInBottomSheet({ isOpen, onClose, onSelectType, isDarkMode }: CheckInBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed bottom-0 left-0 right-0 ${
              isDarkMode ? 'bg-[#2a2218]' : 'bg-white'
            } rounded-t-3xl shadow-2xl z-50 max-w-[390px] mx-auto`}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-[#ece5de]/20' : 'bg-[#8d654c]/20'}`} />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b" style={{ borderColor: isDarkMode ? '#ffb757' + '20' : '#ddc4af' + '40' }}>
              <div className="flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  Choose Check-in Type
                </h2>
                <button
                  onClick={onClose}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-[#ece5de]/10 hover:bg-[#ece5de]/20' : 'bg-[#8d654c]/10 hover:bg-[#8d654c]/20'
                  } transition-colors`}
                >
                  <X className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
              {/* Quick vs Full Toggle */}
              <div className={`${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} rounded-2xl p-4 mb-2`}>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mb-3`}>
                  How much time do you have?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSelectType('quick')}
                    className="bg-white/80 hover:bg-white rounded-xl p-4 text-left transition-all active:scale-[0.98] border-2 border-transparent hover:border-[#ffb757]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#ffb757]" />
                      <span className={`font-semibold ${isDarkMode ? 'text-[#8d654c]' : 'text-[#8d654c]'}`}>Quick</span>
                    </div>
                    <p className="text-xs text-[#8d654c]/60">2–3 min</p>
                  </button>

                  <button
                    onClick={() => onSelectType('full')}
                    className="bg-white/80 hover:bg-white rounded-xl p-4 text-left transition-all active:scale-[0.98] border-2 border-transparent hover:border-[#ffb757]"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-[#8d654c]" />
                      <span className={`font-semibold ${isDarkMode ? 'text-[#8d654c]' : 'text-[#8d654c]'}`}>Full</span>
                    </div>
                    <p className="text-xs text-[#8d654c]/60">6–10 min</p>
                  </button>
                </div>
              </div>

              {/* Main Options */}
              <button
                onClick={() => onSelectType('questionnaire')}
                className={`w-full ${
                  isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'
                } rounded-2xl p-5 text-left hover:bg-opacity-80 transition-all active:scale-[0.98]`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ffb757]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-6 h-6 text-[#ffb757]" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                      Questionnaire
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      PHQ-9, Stress Scale, or Self-Esteem assessment
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectType('ema')}
                className={`w-full ${
                  isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'
                } rounded-2xl p-5 text-left hover:bg-opacity-80 transition-all active:scale-[0.98]`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ddc4af]/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className={`w-6 h-6 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                      Quick Mood Check
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      30 seconds • Just track your current mood & stress
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectType('game')}
                className={`w-full ${
                  isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'
                } rounded-2xl p-5 text-left hover:bg-opacity-80 transition-all active:scale-[0.98]`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#8d654c]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gamepad2 className="w-6 h-6 text-[#8d654c]" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                      Quick Game
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      Focus & attention exercises
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => onSelectType('journal')}
                className={`w-full ${
                  isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'
                } rounded-2xl p-5 text-left hover:bg-opacity-80 transition-all active:scale-[0.98]`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#ffb757]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#ffb757]" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                      Journal
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      Write about how you're feeling today
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Bottom padding */}
            <div className="h-6" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
