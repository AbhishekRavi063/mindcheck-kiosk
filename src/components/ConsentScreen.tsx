import { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, AlertCircle, Lock, Check, ChevronLeft } from 'lucide-react';

interface ConsentScreenProps {
  onAccept: () => void;
  onBack: () => void;
}

export function ConsentScreen({ onAccept, onBack }: ConsentScreenProps) {
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="min-h-screen bg-[#ece5de] p-6 overflow-y-auto relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 p-2 bg-white/60 rounded-full text-[#8d654c] hover:bg-white/80 transition-colors active:scale-95 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="max-w-[390px] mx-auto pt-12 pb-20 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Shield className="w-8 h-8 text-[#ffb757]" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold text-[#8d654c]">
            Before We Begin
          </h1>
          <p className="text-[#8d654c]/70">
            A few important things to know
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#ffb757]/10 border-2 border-[#ffb757]/30 rounded-2xl p-4"
        >
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-[#ffb757] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold text-[#8d654c]">This is a self-check tool</h3>
              <p className="text-sm text-[#8d654c]/80 leading-relaxed">
                MindCheck helps you notice patterns in your mood and stress. It is <strong>not a diagnostic tool</strong> and cannot replace professional mental health support.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Key Points */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="bg-white/60 rounded-2xl p-5 space-y-4">
            <div className="flex gap-3">
              <Lock className="w-5 h-5 text-[#8d654c] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#8d654c] mb-1">Your privacy matters</h4>
                <p className="text-sm text-[#8d654c]/70 leading-relaxed">
                  All data is stored securely on your device. We don't share your information with anyone.
                </p>
                <a
                  href="https://sites.google.com/view/transit-lab/transit-lab/mindcheck_privacy_policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#ffb757] font-semibold mt-2 inline-flex items-center gap-1 underline"
                >
                  Read our full Privacy Policy →
                </a>
              </div>
            </div>

            <div className="flex gap-3">
              <Heart className="w-5 h-5 text-[#8d654c] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#8d654c] mb-1">Support is available</h4>
                <p className="text-sm text-[#8d654c]/70 leading-relaxed">
                  If you're in crisis or need immediate help, we'll connect you with support resources.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-[#8d654c] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-[#8d654c] mb-1">You're in control</h4>
                <p className="text-sm text-[#8d654c]/70 leading-relaxed">
                  Check in as often as feels right for you. Skip questions if needed. There's no pressure.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Consent Checkbox */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 rounded-2xl p-5"
        >
          <button
            onClick={() => setAgreed(!agreed)}
            className="flex items-start gap-3 w-full text-left"
          >
            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              agreed 
                ? 'bg-[#ffb757] border-[#ffb757]' 
                : 'border-[#8d654c]/30'
            }`}>
              {agreed && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
            </div>
            <div className="text-sm text-[#8d654c]/80 leading-relaxed">
              I understand this is a self-reflection tool, not a diagnostic service. If I'm experiencing a crisis, I'll seek immediate professional support.
            </div>
          </button>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="pt-4"
        >
          <button
            onClick={onAccept}
            disabled={!agreed}
            className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all ${
              agreed
                ? 'bg-[#ffb757] text-white shadow-lg shadow-[#ffb757]/20 active:scale-[0.98]'
                : 'bg-[#8d654c]/10 text-[#8d654c]/30 cursor-not-allowed'
            }`}
          >
            I Understand, Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function Heart({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );
}

function Sparkles({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"></path>
    </svg>
  );
}