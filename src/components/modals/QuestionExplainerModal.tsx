import { motion, AnimatePresence } from 'motion/react';
import { X, Lightbulb } from 'lucide-react';

interface QuestionExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionText: string;
  explanation: string;
  example: string;
  isDarkMode: boolean;
}

export function QuestionExplainerModal({
  isOpen,
  onClose,
  questionText,
  explanation,
  example,
  isDarkMode
}: QuestionExplainerModalProps) {
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
              {/* Header */}
              <div className="p-6 border-b" style={{ borderColor: isDarkMode ? '#ffb757' + '20' : '#ddc4af' + '40' }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-[#ffb757]/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Lightbulb className="w-5 h-5 text-[#ffb757]" />
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                        About this question
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                        {questionText}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-[#ece5de]/10 hover:bg-[#ece5de]/20' : 'bg-[#8d654c]/10 hover:bg-[#8d654c]/20'
                    } transition-colors`}
                  >
                    <X className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Explanation */}
                <div>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2 text-sm`}>
                    What this asks about:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                    {explanation}
                  </p>
                </div>

                {/* Example */}
                <div className={`${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} rounded-xl p-4`}>
                  <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2 text-sm`}>
                    For example:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed italic`}>
                    {example}
                  </p>
                </div>

                {/* Privacy note */}
                <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} text-center`}>
                  Answer based on how you've been feeling recently
                </p>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <button
                  onClick={onClose}
                  className="w-full py-3 rounded-xl bg-[#ffb757] text-white font-semibold transition-all active:scale-[0.98]"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
