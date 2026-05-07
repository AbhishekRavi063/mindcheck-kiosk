import { motion } from 'motion/react';
import { X, Brain, Shield, Zap, BarChart3, Sun, BookOpen, ClipboardList } from 'lucide-react';

interface HowItWorksModalProps {
  onClose: () => void;
  isDarkMode: boolean;
}

export function HowItWorksModal({ onClose, isDarkMode }: HowItWorksModalProps) {
  const card = `${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 space-y-3`;
  const heading = `font-semibold text-lg ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`;
  const body = `text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`;
  const bullets = `text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} space-y-1 pt-2`;
  const iconWrap = 'w-12 h-12 bg-[#ffb757]/20 rounded-xl flex items-center justify-center';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} rounded-3xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} z-10 flex items-center justify-between p-6 pb-4`}>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            How It Works
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
          <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
            MindCheck offers two ways to check in: a quick daily snapshot, and a full guided assessment using scientifically-validated questionnaires.
          </p>

          {/* Full Guided Check-in */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-2">
              <div className={iconWrap}>
                <ClipboardList className="w-6 h-6 text-[#ffb757]" />
              </div>
              <h3 className={heading}>Full Guided Check-in</h3>
            </div>
            <p className={body}>
              Each check-in pairs a short questionnaire with a quick cognitive game, covering mood, anxiety, stress, and self-esteem, and ends with an optional journal prompt. Prefer to go at your own pace? Individual questionnaires are also available in the check-in section.
            </p>
          </div>

          {/* Questionnaires */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-2">
              <div className={iconWrap}>
                <Brain className="w-6 h-6 text-[#ffb757]" />
              </div>
              <h3 className={heading}>Questionnaires</h3>
            </div>
            <p className={body}>
              Four short, validated scales that give you a scored snapshot of your mental wellness.
            </p>
            <div className={bullets}>
              <div>• PHQ-9: 9 questions on mood, energy, sleep, and daily interest</div>
              <div>• GAD-7: 7 questions on worry, nervousness, and anxious thoughts</div>
              <div>• PSS-10: 10 questions on how overwhelmed and out of control life has felt</div>
              <div>• RSES-10: 10 questions on self-worth and self-acceptance</div>
            </div>
          </div>

          {/* Cognitive Games */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-2">
              <div className={iconWrap}>
                <Zap className="w-6 h-6 text-[#ffb757]" />
              </div>
              <h3 className={heading}>Cognitive Games</h3>
            </div>
            <p className={body}>
              Four quick games that measure objective indicators like reaction time, attention, and memory, alongside your self-reported scores.
            </p>
            <div className={bullets}>
              <div>• Go/No-Go: tap or hold back based on the color of the shape shown</div>
              <div>• Attention: tap each glowing square in the order it lights up</div>
              <div>• Digit Span: recall a sequence of numbers in the same order</div>
              <div>• Counting: count backwards from a number, subtracting 7 each time</div>
            </div>
            <p className={`${body} pt-2`}>
              Available after each questionnaire in a guided check-in, or anytime from the Games screen.
            </p>
          </div>

          {/* Day Logs */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-2">
              <div className={iconWrap}>
                <Sun className="w-6 h-6 text-[#ffb757]" />
              </div>
              <h3 className={heading}>Day Logs</h3>
            </div>
            <p className={body}>
              A lighter everyday snapshot, separate from the full assessment. Pick how you're feeling across a few areas like mood, energy, and stress in just a few taps.
            </p>
            <div className={bullets}>
              <div>• Available any time from the home screen</div>
              <div>• Logged separately from full check-in data</div>
            </div>
          </div>

          {/* Journal */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-2">
              <div className={iconWrap}>
                <BookOpen className="w-6 h-6 text-[#ffb757]" />
              </div>
              <h3 className={heading}>Journal</h3>
            </div>
            <p className={body}>
              Write a short reflection whenever you feel like it. A prompt appears at the end of every full check-in, and you can also start a new entry directly from the home screen. Tag emotions and hashtags to make entries easier to look back on.
            </p>
            <div className={bullets}>
              <div>• Accessible from the home screen any time</div>
              <div>• Also prompted at the end of a full check-in</div>
              <div>• All entries stored privately on your device</div>
            </div>
          </div>

          {/* Trends */}
          <div className={card}>
            <div className="flex items-center gap-3 mb-2">
              <div className={iconWrap}>
                <BarChart3 className="w-6 h-6 text-[#ffb757]" />
              </div>
              <h3 className={heading}>Trends & Insights</h3>
            </div>
            <p className={body}>
              Visualize your patterns over time with interactive charts, compare questionnaire scores, track cognitive performance, and discover correlations between mood, stress, and focus.
            </p>
          </div>

          {/* Privacy */}
          <div className={`${isDarkMode ? 'bg-[#ffb757]/20 border-[#ffb757]/40' : 'bg-[#ffb757]/10 border-[#ffb757]/30'} border-2 rounded-2xl p-5`}>
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-[#ffb757] flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Your Privacy</h4>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                  Your answers, scores, and journal entries are stored only on this device and never shared. If you enable reminders, an anonymous token is used solely to deliver notifications, nothing else. You can turn this off anytime from Profile.
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} text-center leading-relaxed px-2`}>
            <strong>Important:</strong> MindCheck is a self-reflection tool, not a diagnostic instrument. These questionnaires help you notice patterns, but only a qualified healthcare provider can make a clinical diagnosis.
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}
