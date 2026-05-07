import { motion } from 'motion/react';
import { X, Heart, Shield, Code } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export function AboutModal({ onClose, isDarkMode }: AboutModalProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-3xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} z-10 flex items-center justify-between p-6 pb-4`}>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            About MindCheck
          </h2>
          <button
            onClick={onClose}
            className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <X className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-6">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ffb757]/20 to-[#ddc4af]/20 rounded-full blur-2xl" />
              <div className="relative w-full h-full flex items-center justify-center">
                <Heart className="w-16 h-16 text-[#ffb757]" fill="#ffb757" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* Version */}
          <div className="text-center">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
              MindCheck
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Version 1.0.0
            </p>
          </div>

          {/* Mission */}
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 space-y-3`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#ffb757]/20 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-[#ffb757]" />
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Our Mission
              </h4>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
              MindCheck provides a gentle, judgment-free space to track your mental wellness. We believe that noticing patterns in your mood and stress can help you take better care of yourself.
            </p>
          </div>

          {/* Privacy First */}
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 space-y-3`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#ffb757]/20 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#ffb757]" />
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Privacy First
              </h4>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
              Your data never leaves your device. All check-ins are stored locally using your browser's storage. We don't have servers, accounts, or any way to access your information.
            </p>
          </div>

          {/* Evidence-Based */}
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 space-y-3`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#ffb757]/20 rounded-xl flex items-center justify-center">
                <Code className="w-5 h-5 text-[#ffb757]" />
              </div>
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Evidence-Based
              </h4>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
              MindCheck uses the PHQ-9 and Perceived Stress Scale (PSS-10), both validated by extensive research and widely used by mental health professionals.
            </p>
          </div>

          {/* Important Disclaimer */}
          <div className={`${isDarkMode ? 'bg-[#ffb757]/20 border-[#ffb757]/40' : 'bg-[#ffb757]/10 border-[#ffb757]/30'} border-2 rounded-2xl p-5`}>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'} leading-relaxed text-center`}>
              <strong>Important:</strong> MindCheck is a self-reflection tool, not a diagnostic service or replacement for professional care. If you're experiencing mental health concerns, please consult a qualified healthcare provider.
            </p>
          </div>

          {/* Credits */}
          <div className={`text-center text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
            <p>Made with care and respect</p>
            <p className="mt-1">for your mental wellness journey</p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}