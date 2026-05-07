import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, CheckCircle2 } from 'lucide-react';
import { BackButton } from '../ui/BackButton';

interface CountingGameProps {
  onComplete: (metrics: GameMetrics) => void;
  isDarkMode?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
}

export interface GameMetrics {
  totalSteps: number;
  correctSteps: number;
  incorrectSteps: number;
  averageReactionTime: number;
  accuracy: number;
  totalTime: number;
}

const TOTAL_STEPS = 5;
const STARTING_NUMBER = 100;
const SUBTRACT_VALUE = 7;

export function CountingGame({ onComplete, isDarkMode, onBack, onSkip }: CountingGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [correctSteps, setCorrectSteps] = useState(0);
  const [incorrectSteps, setIncorrectSteps] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [stepStartTime, setStepStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [showCompletion, setShowCompletion] = useState(false);
  const [skipped, setSkipped] = useState(false);
  
  // Random starting number (50-999 for variety)
  const [startingNumber] = useState(() => Math.floor(Math.random() * 950) + 50);
  const totalSteps = 5;

  useEffect(() => {
    if (gameStarted && currentStep === 0) {
      const startTime = Date.now();
      setStepStartTime(startTime);
      setTotalTime(startTime);
    }
  }, [gameStarted, currentStep]);

  const SUBTRACT_VALUE = 7;
  const currentNumber = startingNumber - (currentStep * SUBTRACT_VALUE);
  const expectedAnswer = currentNumber - SUBTRACT_VALUE;

  const handleNumberInput = (digit: string) => {
    if (userInput.length < 3) {
      setUserInput(userInput + digit);
    }
  };

  const handleBackspace = () => {
    setUserInput(userInput.slice(0, -1));
  };

  const handleClear = () => {
    setUserInput('');
  };

  const handleSubmit = () => {
    if (userInput === '') return;

    const reactionTime = Date.now() - stepStartTime;
    setReactionTimes(prev => [...prev, reactionTime]);

    const userAnswer = parseInt(userInput);
    const correct = userAnswer === expectedAnswer;

    setFeedback(correct ? 'correct' : 'incorrect');

    if (correct) {
      setCorrectSteps(prev => prev + 1);
    } else {
      setIncorrectSteps(prev => prev + 1);
    }

    setTimeout(() => {
      setFeedback(null);
      setUserInput('');

      if (currentStep + 1 >= totalSteps) {
        // Game complete
        const endTime = Date.now();
        const metrics: GameMetrics = {
          totalSteps: totalSteps,
          correctSteps: correct ? correctSteps + 1 : correctSteps,
          incorrectSteps: incorrectSteps + (correct ? 0 : 1),
          averageReactionTime: reactionTimes.length > 0
            ? Math.round([...reactionTimes, reactionTime].reduce((a, b) => a + b, 0) / (reactionTimes.length + 1))
            : reactionTime,
          accuracy: Math.round(((correct ? correctSteps + 1 : correctSteps) / totalSteps) * 100),
          totalTime: Math.round((endTime - totalTime) / 1000), // in seconds
        };
        setShowCompletion(true);
        setTimeout(() => onComplete(metrics), 2000);
      } else {
        setCurrentStep(prev => prev + 1);
        setStepStartTime(Date.now());
      }
    }, 1500);
  };

  if (showCompletion) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 bg-[#ffb757] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2`}>
            Well done! 🎯
          </h2>
          <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
            This helps us understand your focus and concentration
          </p>
        </motion.div>
      </div>
    );
  }

  // Instruction screen
  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <div className="max-w-[390px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative"
          >
            {/* Back Button */}
            {onBack && (
              <div className="absolute -top-2 -left-2">
                <BackButton onClick={onBack} isDarkMode={isDarkMode} />
              </div>
            )}

            {/* Serial 7s Badge */}
            <div className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} px-4 py-2 rounded-full mb-6 border-2 ${isDarkMode ? 'border-[#ffb757]/40' : 'border-[#ffb757]/30'}`}>
              <Calculator className="w-4 h-4 text-[#ffb757]" />
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Focus & Calculation</span>
            </div>

            {/* Title */}
            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Count Backward
            </h1>

            {/* Visual Example */}
            <div className="mb-8">
              <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-3xl p-8 shadow-lg`}>
                <div className="flex items-center justify-center gap-4 text-2xl font-semibold">
                  <motion.span
                    className="text-[#ffb757]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {startingNumber}
                  </motion.span>
                  <motion.span
                    className={isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    →
                  </motion.span>
                  <motion.span
                    className="text-[#ffb757]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    {startingNumber - 7}
                  </motion.span>
                  <motion.span
                    className={isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    →
                  </motion.span>
                  <motion.span
                    className="text-[#ffb757]"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1.0 }}
                  >
                    {startingNumber - 14}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 mb-8 text-left`}>
              <p className={`${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} leading-relaxed mb-3`}>
                You'll start from <span className="font-semibold text-[#ffb757]">{startingNumber}</span> and subtract <span className="font-semibold text-[#ffb757]">7</span> each time.
              </p>
              <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} text-sm`}>
                Take your time. There's no rush. 🌿
              </p>
            </div>

            {/* Start Button */}
            <motion.button
              onClick={() => setGameStarted(true)}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-[#ffb757] to-[#ff9a3d] text-white font-semibold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 mb-3"
            >
              Start Challenge
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

            {/* Skip Button */}
            {onSkip && (
              <button
                onClick={onSkip}
                className={`w-full py-3 rounded-full font-medium transition-all ${
                  isDarkMode
                    ? 'text-[#ece5de]/60 hover:text-[#ece5de]'
                    : 'text-[#8d654c]/60 hover:text-[#8d654c]'
                }`}
              >
                Skip for now
              </button>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`}>
      {/* Header with Progress */}
      <div className="p-6 pb-4">
        <div className="max-w-[390px] mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Count Backward
            </h2>
            <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              {currentStep + 1} / {totalSteps}
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#ffb757]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6">
        <div className="max-w-[390px] w-full space-y-8">
          {/* Instruction */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mb-2`}>
              Subtract 7 from
            </p>
            <motion.div
              className={`text-6xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}
              key={currentNumber}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              {currentNumber}
            </motion.div>
          </motion.div>

          {/* Input Display */}
          <div className="relative">
            <motion.div
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-3xl p-6 shadow-lg min-h-[100px] flex items-center justify-center`}
              layout
            >
              <AnimatePresence mode="wait">
                {feedback ? (
                  <motion.div
                    key="feedback"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-center"
                  >
                    {feedback === 'correct' ? (
                      <div>
                        <div className={`w-16 h-16 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <CheckCircle2 className="w-8 h-8 text-[#ffb757]" />
                        </div>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                          Perfect! ✨
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className={`w-16 h-16 ${isDarkMode ? 'bg-[#ddc4af]/20' : 'bg-[#ddc4af]/30'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                          <span className="text-3xl">🌟</span>
                        </div>
                        <p className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                          Not quite
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                          The answer was {expectedAnswer}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <div className={`text-5xl font-bold text-center min-h-[60px] flex items-center justify-center ${
                      userInput ? (isDarkMode ? 'text-[#ffb757]' : 'text-[#ffb757]') : (isDarkMode ? 'text-[#ece5de]/20' : 'text-[#8d654c]/20')
                    }`}>
                      {userInput || '?'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Number Pad */}
          {!feedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                  <motion.button
                    key={digit}
                    onClick={() => handleNumberInput(digit.toString())}
                    whileTap={{ scale: 0.95 }}
                    className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl py-6 text-2xl font-semibold ${
                      isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'
                    } shadow-sm active:shadow-none transition-shadow`}
                  >
                    {digit}
                  </motion.button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <motion.button
                  onClick={handleClear}
                  whileTap={{ scale: 0.95 }}
                  className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl py-6 text-sm font-semibold ${
                    isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'
                  } shadow-sm active:shadow-none transition-shadow`}
                >
                  Clear
                </motion.button>
                <motion.button
                  onClick={() => handleNumberInput('0')}
                  whileTap={{ scale: 0.95 }}
                  className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl py-6 text-2xl font-semibold ${
                    isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'
                  } shadow-sm active:shadow-none transition-shadow`}
                >
                  0
                </motion.button>
                <motion.button
                  onClick={handleBackspace}
                  whileTap={{ scale: 0.95 }}
                  className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl py-6 text-sm font-semibold ${
                    isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'
                  } shadow-sm active:shadow-none transition-shadow`}
                >
                  ←
                </motion.button>
              </div>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={userInput === ''}
                whileTap={{ scale: userInput ? 0.98 : 1 }}
                className={`w-full py-5 rounded-2xl font-semibold text-white shadow-lg transition-all ${
                  userInput
                    ? 'bg-gradient-to-r from-[#ffb757] to-[#ff9a3d] active:shadow-none'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                Submit Answer
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Skip Option */}
      {onSkip && !feedback && (
        <div className="pb-6 px-6">
          <div className="max-w-[390px] mx-auto">
            <button
              onClick={onSkip}
              className={`w-full py-3 rounded-full font-medium transition-all ${
                isDarkMode
                  ? 'text-[#ece5de]/60 hover:text-[#ece5de]'
                  : 'text-[#8d654c]/60 hover:text-[#8d654c]'
              }`}
            >
              Pause & skip for now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}