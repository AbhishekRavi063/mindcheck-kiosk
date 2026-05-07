import { motion } from 'motion/react';
import { Heart, Brain, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { HowItWorksModal } from '../modals/HowItWorksModal';

interface WelcomeScreenProps {
  onNext: () => void;
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#ece5de] flex flex-col items-center justify-center p-6">
        <div className="max-w-[390px] w-full space-y-8">
          {/* Illustration */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative mx-auto w-48 h-48"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffb757]/20 to-[#ddc4af]/20 rounded-full blur-3xl" />
            
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute"
              >
                <Heart className="w-20 h-20 text-[#ffb757]" fill="#ffb757" strokeWidth={1.5} />
              </motion.div>
              
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute left-12 top-8"
              >
                <Brain className="w-12 h-12 text-[#8d654c]/60" strokeWidth={1.5} />
              </motion.div>
              
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="absolute right-12 bottom-8"
              >
                <Sparkles className="w-10 h-10 text-[#ffb757]/70" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl font-semibold text-[#8d654c]">
              Welcome to MindCheck
            </h1>
            <p className="text-lg text-[#8d654c]/70 leading-relaxed px-4">
              A gentle space to track your mood and stress patterns, notice what matters, and take care of yourself.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-3 px-2"
          >
            {[
              'Quick, thoughtful check-ins',
              'Track patterns over time',
              'Supportive, judgment-free space'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[#8d654c]/80">
                <div className="w-2 h-2 rounded-full bg-[#ffb757]" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="space-y-3 pt-4"
          >
            <button
              onClick={onNext}
              className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
            >
              Get Started
            </button>
            
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="w-full py-3 text-[#8d654c]/60 font-medium hover:text-[#8d654c] transition-colors"
            >
              Learn how this works
            </button>
          </motion.div>
        </div>
      </div>

      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} isDarkMode={false} />
      )}
    </>
  );
}