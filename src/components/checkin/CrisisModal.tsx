import { motion } from 'motion/react';
import { Heart, Phone, MessageCircle, ExternalLink } from 'lucide-react';

interface CrisisModalProps {
  onContinue: () => void;
  isDarkMode?: boolean;
}

export function CrisisModal({ onContinue, isDarkMode = false }: CrisisModalProps) {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-full flex items-center justify-center shadow-lg">
            <Heart className="w-10 h-10 text-white" fill="white" strokeWidth={1.5} />
          </div>
        </div>

        {/* Message */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-[#8d654c]">
            You don't have to handle this alone
          </h2>
          <p className="text-[#8d654c]/70 leading-relaxed">
            If you feel unsafe or might harm yourself, please seek immediate support. Help is available 24/7.
          </p>
        </div>

        {/* Support Options */}
        <div className="space-y-3">
          <a
            href="tel:988"
            className="w-full flex items-center gap-3 bg-[#ffb757] text-white p-4 rounded-2xl font-semibold shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
          >
            <Phone className="w-5 h-5" strokeWidth={2} />
            <span>Call 988 Suicide & Crisis Lifeline</span>
          </a>

          <a
            href="sms:988"
            className="w-full flex items-center gap-3 bg-white/80 text-[#8d654c] p-4 rounded-2xl font-semibold shadow-sm active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={2} />
            <span>Text 988</span>
          </a>

          <a
            href="https://988lifeline.org/chat/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 bg-white/80 text-[#8d654c] p-4 rounded-2xl font-semibold shadow-sm active:scale-[0.98] transition-transform"
          >
            <ExternalLink className="w-5 h-5" strokeWidth={2} />
            <span>Chat online at 988lifeline.org</span>
          </a>
        </div>

        {/* Additional Resources */}
        <div className="bg-white/60 rounded-2xl p-5 text-sm text-[#8d654c]/70 space-y-2">
          <p className="font-semibold text-[#8d654c]">Other resources:</p>
          <p>• Crisis Text Line: Text "HELLO" to 741741</p>
          <p>• Veterans Crisis Line: Call 988, press 1</p>
          <p>• LGBTQ+ Trevor Project: 1-866-488-7386</p>
        </div>

        {/* Continue option */}
        <button
          onClick={onContinue}
          className="w-full py-4 bg-white/40 hover:bg-white/60 text-[#8d654c] text-base font-semibold rounded-2xl active:scale-[0.98] transition-all shadow-sm border border-[#8d654c]/10"
        >
          Continue with check-in
        </button>
      </motion.div>
    </div>
  );
}