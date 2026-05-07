import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Shield, Users, Heart } from 'lucide-react';

interface DataSyncPreferenceModalProps {
  isDarkMode: boolean;
  onClose: () => void;
  onChooseBackend: () => void;
  onChooseLocal: () => void;
}

export function DataSyncPreferenceModal({ isDarkMode, onClose, onChooseBackend, onChooseLocal }: DataSyncPreferenceModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70"
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className={`relative w-full max-w-md rounded-2xl p-5 ${
          isDarkMode ? 'bg-[#2a2218]' : 'bg-white'
        } shadow-xl max-h-[90vh] overflow-y-auto`}
      >
        {/* Header */}
        <div className="text-center mb-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 ${
              isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'
            }`}>
            <Heart className="w-7 h-7 text-[#ffb757]" />
          </motion.div>
          <h2 className={`text-xl font-bold mb-2 ${
            isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'
          }`}>
            Support Mental Health Research
          </h2>
          <p className={`text-sm leading-relaxed px-2 ${
            isDarkMode ? 'text-[#ddc4af]' : 'text-[#8d654c]/70'
          }`}>
            Your journey can help others. Would you like to contribute to mental health research?
          </p>
        </div>

        {/* What this means */}
        <div className={`rounded-xl p-3.5 mb-5 ${
          isDarkMode ? 'bg-[#3a2f1f]' : 'bg-[#ffb757]/5'
        }`}>
          <h3 className={`font-semibold mb-2.5 flex items-center gap-2 text-sm ${
            isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'
          }`}>
            <Cloud className="w-4 h-4 text-[#ffb757]" />
            What this means:
          </h3>
          
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <Shield className="w-3.5 h-3.5 text-[#ffb757] mt-0.5 flex-shrink-0" />
              <p className={`text-xs leading-relaxed ${
                isDarkMode ? 'text-[#ddc4af]' : 'text-[#8d654c]/80'
              }`}>
                <strong>Your privacy is protected:</strong> All data is anonymized. No names, emails, or personal identifiers are stored.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-[#ffb757] mt-0.5 flex-shrink-0" />
              <p className={`text-xs leading-relaxed ${
                isDarkMode ? 'text-[#ddc4af]' : 'text-[#8d654c]/80'
              }`}>
                <strong>Help improve mental health support:</strong> Researchers use anonymized data to better understand mental wellness patterns and improve interventions.
              </p>
            </div>
            
            <div className="flex items-start gap-2">
              <Cloud className="w-3.5 h-3.5 text-[#ffb757] mt-0.5 flex-shrink-0" />
              <p className={`text-xs leading-relaxed ${
                isDarkMode ? 'text-[#ddc4af]' : 'text-[#8d654c]/80'
              }`}>
                <strong>Secure cloud backup:</strong> Your data is securely saved and you can access it from any device.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={onChooseBackend}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all text-base ${
              isDarkMode
                ? 'bg-[#ffb757] text-white hover:bg-[#ffb757]/90'
                : 'bg-[#ffb757] text-white hover:bg-[#ffb757]/90'
            } active:scale-[0.98]`}
          >
            I Agree
          </button>
          
          <button
            onClick={onChooseLocal}
            className={`w-full py-3.5 rounded-xl font-semibold transition-all text-base ${
              isDarkMode
                ? 'bg-[#3a2f1f] text-[#ddc4af] hover:bg-[#4a3a28]'
                : 'bg-[#8d654c]/10 text-[#8d654c] hover:bg-[#8d654c]/15'
            } active:scale-[0.98]`}
          >
            Not Now
          </button>
        </div>

        {/* You can change this later note */}
        <p className={`text-center text-xs mt-2.5 ${
          isDarkMode ? 'text-[#ddc4af]/40' : 'text-[#8d654c]/40'
        }`}>
          You can change this preference anytime in Profile → Data & Privacy → Cloud Backup
        </p>

        {/* Questions Email */}
        <div className={`text-center mt-4 pt-3 border-t ${
          isDarkMode ? 'border-[#8d654c]/10' : 'border-[#8d654c]/5'
        }`}>
          <p className={`text-xs ${
            isDarkMode ? 'text-[#ddc4af]/50' : 'text-[#8d654c]/40'
          }`}>
            Questions?{' '}
            <a
              href="mailto:transitlabiitk18@gmail.com"
              className="text-[#ffb757] hover:underline font-medium"
            >
              transitlabiitk18@gmail.com
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}