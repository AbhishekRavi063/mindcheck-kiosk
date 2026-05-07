import { motion } from 'motion/react';
import { Zap, Brain, ArrowRight } from 'lucide-react';

interface QuestionnaireTransitionProps {
  nextQuestionnaire: 'pss' | 'rses' | 'gad7' | 'phq9';
  onContinue: () => void;
  isDarkMode: boolean;
}

export function QuestionnaireTransition({ nextQuestionnaire, onContinue, isDarkMode }: QuestionnaireTransitionProps) {
  const getQuestionnaireInfo = () => {
    if (nextQuestionnaire === 'phq9') {
      return {
        icon: Brain,
        title: 'Mood Check',
        description: 'First, we\'ll check in on how you\'ve been feeling lately',
        color: 'from-pink-500 to-red-500',
        bgColor: isDarkMode ? 'from-pink-500/20 to-red-500/20' : 'from-pink-100 to-red-100'
      };
    } else if (nextQuestionnaire === 'pss') {
      return {
        icon: Zap,
        title: 'Stress Check',
        description: 'Next, we\'ll check in on how you\'ve been managing stress lately',
        color: 'from-orange-500 to-yellow-500',
        bgColor: isDarkMode ? 'from-orange-500/20 to-yellow-500/20' : 'from-orange-100 to-yellow-100'
      };
    } else if (nextQuestionnaire === 'rses') {
      return {
        icon: Brain,
        title: 'Self-Esteem Check',
        description: 'Now, let\'s explore how you\'ve been feeling about yourself',
        color: 'from-blue-500 to-cyan-500',
        bgColor: isDarkMode ? 'from-blue-500/20 to-cyan-500/20' : 'from-blue-100 to-cyan-100'
      };
    } else {
      return {
        icon: Brain,
        title: 'Anxiety Check',
        description: 'Finally, let\'s see how anxiety has been affecting you',
        color: 'from-purple-500 to-indigo-500',
        bgColor: isDarkMode ? 'from-purple-500/20 to-indigo-500/20' : 'from-purple-100 to-indigo-100'
      };
    }
  };

  const info = getQuestionnaireInfo();
  const Icon = info.icon;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
      <div className="max-w-md w-full space-y-6">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="flex justify-center"
        >
          <div className={`w-20 h-20 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-3"
        >
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            Great job! 🎉
          </h2>
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-2xl p-5 space-y-2`}>
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              {info.title}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
              {info.description}
            </p>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#ffb757]"></div>
              <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Mood</span>
            </div>
            <ArrowRight className={`w-3 h-3 ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`} />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${nextQuestionnaire === 'pss' ? 'bg-[#ffb757]' : 'bg-[#ffb757]/30'}`}></div>
              <span className={`text-xs ${nextQuestionnaire === 'pss' ? (isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]') : (isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40')}`}>Stress</span>
            </div>
            <ArrowRight className={`w-3 h-3 ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`} />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${nextQuestionnaire === 'rses' ? 'bg-[#ffb757]' : 'bg-[#ffb757]/30'}`}></div>
              <span className={`text-xs ${nextQuestionnaire === 'rses' ? (isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]') : (isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40')}`}>Self-Esteem</span>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onContinue}
          className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
        >
          Continue
        </motion.button>
      </div>
    </div>
  );
}