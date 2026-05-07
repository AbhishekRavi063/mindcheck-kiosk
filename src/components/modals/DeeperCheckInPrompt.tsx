import { motion, AnimatePresence } from 'motion/react';
import { Heart, X } from 'lucide-react';

interface DeeperCheckInPromptProps {
  isOpen: boolean;
  onContinue: () => void;
  onNotNow: () => void;
  isDarkMode: boolean;
}

export function DeeperCheckInPrompt({
  isOpen,
  onContinue,
  onNotNow,
  isDarkMode
}: DeeperCheckInPromptProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (semi-transparent, non-blocking) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-40"
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

            {/* Icon */}
            <div className="px-6 pt-4 flex justify-center">
              <div className="w-14 h-14 bg-[#ffb757]/20 rounded-full flex items-center justify-center">
                <Heart className="w-7 h-7 text-[#ffb757]" fill="#ffb757" strokeWidth={1.5} />
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 text-center space-y-3">
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Want a deeper check-in?
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                Your responses suggest you may benefit from a slightly longer check-in today. This can help us better understand how you're doing.
              </p>

              <div className={`${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} rounded-xl p-4 text-left`}>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
                  We'll add a few more questions and a quick focus game. It'll take about 5 more minutes.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 space-y-3">
              <button
                onClick={onContinue}
                className="w-full py-4 rounded-xl bg-[#ffb757] text-white font-semibold transition-all active:scale-[0.98] shadow-lg shadow-[#ffb757]/20"
              >
                Continue deeper check-in
              </button>
              <button
                onClick={onNotNow}
                className={`w-full py-4 rounded-xl font-semibold transition-all active:scale-[0.98] ${
                  isDarkMode ? 'bg-[#ece5de]/10 text-[#ece5de]' : 'bg-[#8d654c]/10 text-[#8d654c]'
                }`}
              >
                Not now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
