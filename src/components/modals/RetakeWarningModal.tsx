import { motion, AnimatePresence } from 'motion/react';
import { Calendar, AlertCircle } from 'lucide-react';

interface RetakeWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTakeAnyway: () => void;
  questionnaireName: string;
  lastTakenDate: string;
  isDarkMode: boolean;
}

export function RetakeWarningModal({
  isOpen,
  onClose,
  onTakeAnyway,
  questionnaireName,
  lastTakenDate,
  isDarkMode
}: RetakeWarningModalProps) {
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
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none`}
          >
            <div
              className={`${
                isDarkMode ? 'bg-[#2a2218]' : 'bg-white'
              } rounded-3xl shadow-2xl max-w-sm w-full pointer-events-auto`}
            >
              {/* Icon */}
              <div className="p-6 pb-0 flex justify-center">
                <div className="w-16 h-16 bg-[#ffb757]/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-[#ffb757]" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4 text-center">
                <div>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2`}>
                    You checked in recently
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                    You took the {questionnaireName} on {lastTakenDate}.
                  </p>
                </div>

                <div className={`${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} rounded-xl p-4`}>
                  <div className="flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-[#ffb757] flex-shrink-0 mt-0.5" />
                    <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                      For the most accurate measurement of your mood and energy patterns, we recommend waiting at least 2 weeks between assessments.
                    </p>
                  </div>
                </div>

                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                  Frequent retakes may not reflect meaningful changes
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 space-y-3">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-[#ffb757] text-white font-semibold transition-all active:scale-[0.98]"
                >
                  Okay, I'll wait
                </button>
                <button
                  onClick={onTakeAnyway}
                  className={`w-full py-3 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                    isDarkMode ? 'bg-[#ece5de]/10 text-[#ece5de]' : 'bg-[#8d654c]/10 text-[#8d654c]'
                  }`}
                >
                  Take anyway
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
