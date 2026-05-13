import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, CheckCircle2, X, Delete } from 'lucide-react';
import { BackButton } from '../ui/BackButton';

interface MemoryGameProps {
  onComplete: (metrics: GameMetrics) => void;
  isDarkMode?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
}

export interface GameMetrics {
  totalTrials: number;
  correctRecalls: number;
  averageDigitSpan: number;
  longestSpan: number;
  averageReactionTime: number;
  accuracy: number;
}

const INITIAL_DIGIT_COUNT = 3;
const MAX_TRIALS = 10;
const DIGIT_DISPLAY_TIME = 1000; // ms per digit
const DIGIT_GAP_TIME = 300; // ms between digits

export function MemoryGame({ onComplete, isDarkMode = false, onBack, onSkip }: MemoryGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [digitSequence, setDigitSequence] = useState<number[]>([]);
  const [currentDigitIndex, setCurrentDigitIndex] = useState<number>(-1);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [digitCount, setDigitCount] = useState(INITIAL_DIGIT_COUNT);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [longestSpan, setLongestSpan] = useState(0);
  const [allSpans, setAllSpans] = useState<number[]>([]);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const recallStartTime = useRef<number>(0);

  // Generate a random digit sequence (0-9)
  const generateSequence = (length: number): number[] => {
    return Array.from({ length }, () => Math.floor(Math.random() * 10));
  };

  // Start a new trial
  const startNewTrial = () => {
    const newSequence = generateSequence(digitCount);
    setDigitSequence(newSequence);
    setUserSequence([]);
    setCurrentDigitIndex(-1);
    setPhase('showing');
    setFeedbackType(null);
  };

  // Show digit sequence animation
  useEffect(() => {
    if (phase !== 'showing' || digitSequence.length === 0) return;

    const startDelay = setTimeout(() => {
      setCurrentDigitIndex(0);
    }, 500);

    return () => clearTimeout(startDelay);
  }, [phase, digitSequence]);

  // Animate through digits
  useEffect(() => {
    if (phase !== 'showing' || currentDigitIndex < 0) return;

    if (currentDigitIndex < digitSequence.length) {
      const timer = setTimeout(() => {
        setCurrentDigitIndex(prev => prev + 1);
      }, DIGIT_DISPLAY_TIME + DIGIT_GAP_TIME);

      return () => clearTimeout(timer);
    } else {
      setTimeout(() => {
        setPhase('input');
        recallStartTime.current = Date.now();
      }, 1000);
    }
  }, [phase, currentDigitIndex, digitSequence]);

  // Handle digit button click
  const handleDigitClick = (digit: number) => {
    if (phase !== 'input') return;
    if (userSequence.length >= digitSequence.length) return;

    const newUserSequence = [...userSequence, digit];
    setUserSequence(newUserSequence);
  };

  // Handle submit answer
  const handleSubmit = () => {
    if (phase !== 'input' || userSequence.length !== digitSequence.length) return;

    const reactionTime = Date.now() - recallStartTime.current;
    setReactionTimes(prev => [...prev, reactionTime]);

    const isCorrect = userSequence.every((val, idx) => val === digitSequence[idx]);

    setPhase('feedback');
    setFeedbackType(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setCorrectTrials(prev => prev + 1);
      setAllSpans(prev => [...prev, digitCount]);

      if (digitCount > longestSpan) {
        setLongestSpan(digitCount);
      }

      // Increase difficulty
      setDigitCount(prev => prev + 1);
    } else {
      // Record current span (they failed at this level)
      setAllSpans(prev => [...prev, digitCount - 1]);
    }

    // Move to next trial
    setTimeout(() => {
      const nextTrial = currentTrial + 1;
      setCurrentTrial(nextTrial);

      if (nextTrial >= MAX_TRIALS) {
        // Game complete
        const finalLongest = isCorrect && digitCount > longestSpan ? digitCount : longestSpan;
        const finalSpans = [...allSpans, isCorrect ? digitCount : digitCount - 1];

        const metrics: GameMetrics = {
          totalTrials: MAX_TRIALS,
          correctRecalls: correctTrials + (isCorrect ? 1 : 0),
          averageDigitSpan: parseFloat((finalSpans.reduce((a, b) => a + b, 0) / finalSpans.length).toFixed(1)),
          longestSpan: finalLongest,
          averageReactionTime: reactionTimes.length > 0
            ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
            : 0,
          accuracy: Math.round(((correctTrials + (isCorrect ? 1 : 0)) / MAX_TRIALS) * 100)
        };
        setIsComplete(true);
        setTimeout(() => onComplete(metrics), 2000);
      } else {
        startNewTrial();
      }
    }, 1500);
  };

  // Handle backspace/delete last digit
  const handleBackspace = () => {
    if (phase !== 'input' || userSequence.length === 0) return;
    setUserSequence(prev => prev.slice(0, -1));
  };

  // Start first trial when game begins
  useEffect(() => {
    if (gameStarted && currentTrial === 0) {
      startNewTrial();
    }
  }, [gameStarted]);

  // Get performance-based feedback message
  const getPerformanceFeedback = () => {
    const accuracy = Math.round((correctTrials / MAX_TRIALS) * 100);

    if (accuracy >= 90) {
      return {
        title: "Outstanding memory! 🌟",
        subtitle: `${accuracy}% accuracy - Your working memory is exceptional!`
      };
    } else if (accuracy >= 70) {
      return {
        title: "Great recall! 🧠",
        subtitle: `${accuracy}% accuracy - Your memory skills are strong!`
      };
    } else if (accuracy >= 50) {
      return {
        title: "Good effort! 💪",
        subtitle: `${accuracy}% accuracy - Keep practicing to improve!`
      };
    } else {
      return {
        title: "Keep trying! 🌱",
        subtitle: `${accuracy}% accuracy - Every attempt helps you grow!`
      };
    }
  };

  if (isComplete) {
    const feedback = getPerformanceFeedback();
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-[#ffb757] rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            {feedback.title}
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mt-2`}>
            {feedback.subtitle}
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
            {onBack && (
              <div className="absolute -top-2 -left-2">
                <BackButton onClick={onBack} isDarkMode={isDarkMode} />
              </div>
            )}

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full mb-6">
              <Hash className="w-4 h-4 text-[#ffb757]" />
              <span className="text-sm font-semibold text-[#8d654c]">Digit Span</span>
            </div>

            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Number Memory
            </h1>

            <div className="mb-8">
              <div className="flex gap-3 justify-center">
                {[5, 8, 2].map((digit, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.3, repeat: Infinity, repeatDelay: 2.1 }}
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold ${
                      isDarkMode ? 'bg-[#2a2218] text-[#ece5de]' : 'bg-white/60 text-[#8d654c]'
                    }`}
                  >
                    {digit}
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 mb-8 text-left`}>
              <p className={`${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} leading-relaxed mb-3`}>
                Watch the <span className="font-semibold text-[#ffb757]">numbers</span> appear one by one. Then, enter them back in the <span className="font-semibold">same order</span>!
              </p>
              <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} text-sm`}>
                The sequence gets longer as you succeed. Test your working memory!
              </p>
            </div>

            <motion.button
              onClick={() => setGameStarted(true)}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-[#ff8a65] to-[#ff7043] text-white font-semibold py-4 rounded-full shadow-lg flex items-center justify-center gap-2 mb-3"
            >
              Start Challenge
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>

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
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="max-w-[390px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Digit Span Game
            </h2>
            <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              {currentTrial + 1} / {MAX_TRIALS}
            </div>
          </div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#ffb757]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentTrial + 1) / MAX_TRIALS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="px-6 pb-4">
        <div className="max-w-[390px] mx-auto">
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-2xl p-3 text-center`}>
            <AnimatePresence mode="wait">
              {phase === 'showing' && (
                <motion.p
                  key="watching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'}`}
                >
                  <strong>{digitSequence.length} Digits</strong> - Watch carefully!
                </motion.p>
              )}

              {phase === 'input' && (
                <motion.p
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`text-sm ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'}`}
                >
                  <strong>Your turn!</strong> Enter the numbers ({userSequence.length}/{digitSequence.length})
                </motion.p>
              )}

              {phase === 'feedback' && (
                <motion.p
                  key="feedback"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`text-sm font-semibold ${
                    feedbackType === 'correct'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {feedbackType === 'correct' ? '✓ Perfect recall!' : '✗ Not quite right'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        <div className="max-w-[390px] w-full">
          {/* Display Area - showing digits or user input */}
          <div className="mb-8">
            <AnimatePresence mode="wait">
              {phase === 'showing' && currentDigitIndex >= 0 && currentDigitIndex < digitSequence.length && (
                <motion.div
                  key={`digit-${currentDigitIndex}`}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center"
                >
                  <div className={`w-32 h-32 rounded-3xl flex items-center justify-center text-6xl font-bold ${
                    isDarkMode ? 'bg-[#ffb757] text-white' : 'bg-[#ffb757] text-white'
                  } shadow-2xl`}>
                    {digitSequence[currentDigitIndex]}
                  </div>
                </motion.div>
              )}

              {phase === 'input' && (
                <motion.div
                  key="input-display"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center gap-2 flex-wrap min-h-[80px] items-center"
                >
                  {userSequence.map((digit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                        isDarkMode ? 'bg-[#2a2218] text-[#ece5de]' : 'bg-white/60 text-[#8d654c]'
                      }`}
                    >
                      {digit}
                    </motion.div>
                  ))}
                  {/* Empty placeholder */}
                  {userSequence.length < digitSequence.length && (
                    <div className={`w-14 h-14 rounded-xl border-2 border-dashed ${
                      isDarkMode ? 'border-[#2a2218]' : 'border-[#8d654c]/20'
                    }`} />
                  )}
                </motion.div>
              )}

              {phase === 'feedback' && (
                <motion.div
                  key="feedback-display"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex justify-center"
                >
                  {feedbackType === 'correct' ? (
                    <CheckCircle2 className="w-24 h-24 text-green-500" strokeWidth={2} />
                  ) : (
                    <X className="w-24 h-24 text-red-500" strokeWidth={2} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Number Pad */}
          {phase === 'input' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((digit) => (
                  <motion.button
                    key={digit}
                    onClick={() => handleDigitClick(digit)}
                    whileTap={{ scale: 0.9 }}
                    className={`aspect-square rounded-2xl text-2xl font-semibold transition-all ${
                      isDarkMode
                        ? 'bg-[#2a2218] text-[#ece5de] active:bg-[#ffb757]'
                        : 'bg-white/60 text-[#8d654c] active:bg-[#ffb757] active:text-white'
                    }`}
                  >
                    {digit}
                  </motion.button>
                ))}
              </div>

              {/* Backspace button */}
              {userSequence.length > 0 && userSequence.length < digitSequence.length && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleBackspace}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${
                    isDarkMode
                      ? 'bg-red-900/30 text-red-400 active:bg-red-900/50'
                      : 'bg-red-50 text-red-600 active:bg-red-100'
                  }`}
                >
                  <Delete className="w-5 h-5" />
                  <span>Delete Last</span>
                </motion.button>
              )}

              {/* Submit button - appears when sequence is complete */}
              {userSequence.length === digitSequence.length && (
                <div className="flex gap-3">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleBackspace}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 font-medium transition-all ${
                      isDarkMode
                        ? 'bg-red-900/30 text-red-400 active:bg-red-900/50'
                        : 'bg-red-50 text-red-600 active:bg-red-100'
                    }`}
                  >
                    <Delete className="w-5 h-5" />
                    <span>Edit</span>
                  </motion.button>

                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={handleSubmit}
                    whileTap={{ scale: 0.95 }}
                    className="flex-[2] bg-gradient-to-r from-[#ffb757] to-[#ff9f43] text-white font-semibold py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Submit Answer</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Progress dots */}
          {phase === 'input' && (
            <div className="mt-6 flex justify-center gap-2">
              {digitSequence.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx < userSequence.length
                      ? 'bg-[#ffb757]'
                      : isDarkMode
                      ? 'bg-[#2a2218]'
                      : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
