import { motion } from 'motion/react';
import { Heart, Zap, Brain, Sparkles } from 'lucide-react';

interface QuestionnaireScoreScreenProps {
  type: 'phq9' | 'pss' | 'rses' | 'gad7';
  score: number;
  onContinue: () => void;
  onSkipGame?: () => void;
  isDarkMode?: boolean;
}

export function QuestionnaireScoreScreen({ type, score, onContinue, onSkipGame, isDarkMode = false }: QuestionnaireScoreScreenProps) {
  const getPhq9Info = (score: number) => {
    if (score <= 4) {
      return {
        level: 'Lower range',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        message: "You're showing minimal symptoms. This is a good sign! Remember to keep checking in with yourself regularly.",
        encouragement: "Keep nurturing your well-being! 🌱"
      };
    }
    if (score <= 9) {
      return {
        level: 'Lower-moderate range',
        color: 'from-yellow-400 to-amber-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        message: "You're experiencing mild symptoms. This is normal - everyone has ups and downs. Small steps can make a big difference.",
        encouragement: "You're taking positive steps forward! ✨"
      };
    }
    if (score <= 14) {
      return {
        level: 'Moderate range',
        color: 'from-orange-400 to-orange-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        message: "You're experiencing moderate symptoms. It's important to be gentle with yourself and consider reaching out for support.",
        encouragement: "Your feelings are valid. Keep going! 💪"
      };
    }
    if (score <= 19) {
      return {
        level: 'Moderate-higher range',
        color: 'from-orange-500 to-red-400',
        textColor: 'text-orange-700',
        bgColor: 'bg-orange-100',
        message: "You're experiencing moderately severe symptoms. Consider talking to a mental health professional - you deserve support.",
        encouragement: "Reaching out is a sign of strength! 🌟"
      };
    }
    return {
      level: 'Higher range',
      color: 'from-red-400 to-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      message: "You're experiencing severe symptoms. Please consider reaching out to a mental health professional or crisis support service soon.",
      encouragement: "You don't have to face this alone. Help is available! 💙"
    };
  };

  const getPssInfo = (score: number) => {
    if (score <= 13) {
      return {
        level: 'Lower stress',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        message: "You're managing stress well! Your current stress levels are in a healthy range. Keep up the good practices.",
        encouragement: "You're handling things beautifully! 🌈"
      };
    }
    if (score <= 26) {
      return {
        level: 'Moderate stress',
        color: 'from-yellow-400 to-amber-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        message: "You're experiencing moderate stress. This is common, but it's a good reminder to prioritize self-care and stress management.",
        encouragement: "Small breaks can make a big difference! 🌸"
      };
    }
    return {
      level: 'Higher stress',
      color: 'from-orange-400 to-red-400',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      message: "You're experiencing high stress levels. Consider incorporating stress-reduction techniques and reaching out for support if needed.",
      encouragement: "You're stronger than you know! 💫"
    };
  };

  const getRsesInfo = (score: number) => {
    if (score < 15) {
      return {
        level: 'Lower self-esteem',
        color: 'from-orange-400 to-amber-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        message: "Your self-esteem could use some support. Remember, your worth isn't defined by your thoughts - you're valuable just as you are.",
        encouragement: "You are worthy of love and respect! 🌺"
      };
    }
    if (score <= 25) {
      return {
        level: 'Average self-esteem',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        message: "Your self-esteem is in a healthy range. Keep building on your strengths and being kind to yourself.",
        encouragement: "You're doing great! Keep believing in yourself! ⭐"
      };
    }
    return {
      level: 'Strong self-esteem',
      color: 'from-blue-400 to-cyan-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      message: "You have strong self-esteem! This is wonderful. Continue nurturing this positive relationship with yourself.",
      encouragement: "Your confidence shines through! 🌟"
    };
  };

  const getGad7Info = (score: number) => {
    if (score <= 4) {
      return {
        level: 'Minimal anxiety',
        color: 'from-green-400 to-emerald-500',
        textColor: 'text-green-600',
        bgColor: 'bg-green-50',
        message: "You're experiencing minimal anxiety. This is great! Keep using the coping strategies that work for you.",
        encouragement: "You're managing anxiety well! 🌿"
      };
    }
    if (score <= 9) {
      return {
        level: 'Mild anxiety',
        color: 'from-yellow-400 to-amber-500',
        textColor: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        message: "You're experiencing mild anxiety. This is manageable with self-care and mindfulness practices.",
        encouragement: "You've got this! Take it one step at a time! 🌸"
      };
    }
    if (score <= 14) {
      return {
        level: 'Moderate anxiety',
        color: 'from-orange-400 to-orange-500',
        textColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        message: "You're experiencing moderate anxiety. Consider talking to someone you trust or exploring relaxation techniques.",
        encouragement: "Your courage in facing this is admirable! 💪"
      };
    }
    return {
      level: 'Severe anxiety',
      color: 'from-red-400 to-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      message: "You're experiencing severe anxiety. Please consider reaching out to a mental health professional for support.",
      encouragement: "Help is available, and you deserve it! 💙"
    };
  };

  const getTypeInfo = () => {
    switch (type) {
      case 'phq9':
        return {
          title: 'Mood & Energy',
          subtitle: 'PHQ-9 Score',
          icon: Heart,
          maxScore: 27,
          ...getPhq9Info(score)
        };
      case 'pss':
        return {
          title: 'Stress Level',
          subtitle: 'PSS Score',
          icon: Zap,
          maxScore: 40,
          ...getPssInfo(score)
        };
      case 'rses':
        return {
          title: 'Self-Esteem',
          subtitle: 'RSES Score',
          icon: Brain,
          maxScore: 40,
          ...getRsesInfo(score)
        };
      case 'gad7':
        return {
          title: 'Anxiety Level',
          subtitle: 'GAD-7 Score',
          icon: Brain,
          maxScore: 21,
          ...getGad7Info(score)
        };
    }
  };

  const info = getTypeInfo();
  const Icon = info.icon;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col items-center justify-center p-6`}>
      <div className="w-full max-w-md space-y-6">
        {/* Animated Score Circle */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', duration: 0.8, bounce: 0.4 }}
          className="flex flex-col items-center"
        >
          <div className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${info.color} p-1 shadow-2xl`}>
            <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-[#1a1410]' : 'bg-white'} flex flex-col items-center justify-center`}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className={`text-5xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  {score}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                  of {info.maxScore}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Floating Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            className={`-mt-8 w-16 h-16 rounded-full bg-gradient-to-br ${info.color} flex items-center justify-center shadow-lg`}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
          </motion.div>
        </motion.div>

        {/* Title & Level */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center space-y-2"
        >
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            {info.title}
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
            {info.subtitle}
          </p>
          
          <div className="flex justify-center pt-2">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${info.bgColor} ${info.textColor}`}>
              {info.level}
            </div>
          </div>
        </motion.div>

        {/* Message Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 shadow-lg space-y-4`}
        >
          <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-[#ece5de]/90' : 'text-[#8d654c]/90'}`}>
            {info.message}
          </p>
          
          <div className={`flex items-center gap-3 p-3 rounded-xl ${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} border-2 border-[#ffb757]/20`}>
            <Sparkles className="w-5 h-5 text-[#ffb757] flex-shrink-0" />
            <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              {info.encouragement}
            </p>
          </div>
        </motion.div>

        {/* Important Note */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-center text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} px-4`}
        >
          This score is for self-reflection only, not a clinical diagnosis
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={onContinue}
          className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
        >
          Continue to Focus Game
        </motion.button>

        {/* Skip Game Button */}
        {onSkipGame && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={onSkipGame}
            className="w-full py-4 bg-[#8d654c] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#8d654c]/20 active:scale-[0.98] transition-transform"
          >
            Skip Focus Game
          </motion.button>
        )}
      </div>
    </div>
  );
}