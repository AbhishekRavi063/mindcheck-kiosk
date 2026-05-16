import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid3x3, CheckCircle2, X, ArrowLeft } from 'lucide-react';
import { BackButton } from '../ui/BackButton';

interface AttentionGameProps {
  onComplete: (metrics: GameMetrics) => void;
  isDarkMode?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
}

export interface GameMetrics {
  totalTrials: number;
  correctSequences: number;
  longestSequence: number;
  averageSpan: number;
  accuracy: number;
  averageReactionTime: number;
}

const GRID_SIZE = 4; // 4x4 grid
const STARTING_SEQUENCE_LENGTH = 2;
const MAX_SEQUENCE_LENGTH = 9;
const FLASH_DURATION = 500; // ms
const FLASH_INTERVAL = 250; // ms between flashes
const MAX_TRIALS = 10; // Total number of trials

export function AttentionGame({ onComplete, isDarkMode = false, onBack, onSkip }: AttentionGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [sequenceLength, setSequenceLength] = useState(STARTING_SEQUENCE_LENGTH);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [flashingIndex, setFlashingIndex] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [correctSequences, setCorrectSequences] = useState(0);
  const [longestSequence, setLongestSequence] = useState(0);
  const [allSpans, setAllSpans] = useState<number[]>([]);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const inputStartTimeRef = useRef<number | null>(null);
  const sequenceLengthRef = useRef(STARTING_SEQUENCE_LENGTH);
  const correctSequencesRef = useRef(0);
  const currentTrialRef = useRef(0);
  const longestSequenceRef = useRef(0);
  const reactionTimesRef = useRef<number[]>([]);
  const trialsAtCurrentLength = useRef(0);
  const correctAtCurrentLength = useRef(0);

  // Generate a new random sequence
  const generateSequence = (length: number): number[] => {
    const isAdjacent = (a: number, b: number): boolean => {
      const diff = Math.abs(a - b);
      if (diff === 1) {
        return Math.floor(a / GRID_SIZE) === Math.floor(b / GRID_SIZE);
      }
      return diff === GRID_SIZE;
    };

    const seq: number[] = [];
    let attempts = 0;

    while (seq.length < length && attempts < 1000) {
      attempts++;
      const randomIndex = Math.floor(
        Math.random() * (GRID_SIZE * GRID_SIZE)
      );

      // reject if already used anywhere in the sequence
      if (seq.includes(randomIndex)) continue;

      // reject if adjacent to immediately previous cell
      if (
        seq.length > 0 &&
        isAdjacent(seq[seq.length - 1], randomIndex)
      ) continue;

      seq.push(randomIndex);
    }

    return seq;
  };

  // Start a new trial
  const startNextTrial = () => {
    const newSequence = generateSequence(sequenceLengthRef.current);
    setSequence(newSequence);
    setUserSequence([]);
    setGamePhase('showing');
    setFeedbackType(null);
  };

  // Flash sequence animation
  useEffect(() => {
    if (gamePhase !== 'showing' || sequence.length === 0) return;

    let currentStep = 0;

    const showSequence = () => {
      if (currentStep < sequence.length) {
        setFlashingIndex(sequence[currentStep]);

        setTimeout(() => {
          setFlashingIndex(null);
          currentStep++;

          if (currentStep < sequence.length) {
            setTimeout(showSequence, FLASH_INTERVAL);
          } else {
            // Sequence shown, now wait for user input
            setTimeout(() => {
              setGamePhase('input');
              inputStartTimeRef.current = performance.now();
            }, 500);
          }
        }, FLASH_DURATION);
      }
    };

    // Start showing sequence after a brief delay
    const timer = setTimeout(showSequence, 800);
    return () => clearTimeout(timer);
  }, [gamePhase, sequence]);

  const endGame = () => {
    const finalLongest = longestSequenceRef.current;
    const finalCorrect = correctSequencesRef.current;
    const finalTotal = currentTrialRef.current + 1;
    const finalRTs = reactionTimesRef.current;

    const avgRT = finalRTs.length > 0
      ? Math.round(finalRTs.reduce((a, b) => a + b, 0) / finalRTs.length)
      : 0;

    const metrics: GameMetrics = {
      totalTrials: finalTotal,
      correctSequences: finalCorrect,
      longestSequence: finalLongest,
      averageSpan: finalLongest,
      accuracy: Math.round((finalCorrect / finalTotal) * 100),
      averageReactionTime: avgRT,
    };

    setTimeout(() => {
      onComplete(metrics);
    }, 500);
  };

  // Handle cell click during input phase
  const handleCellClick = (index: number) => {
    if (gamePhase !== 'input') return;

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    // Check if user completed the sequence
    if (newUserSequence.length === sequence.length) {
      const isCorrect = newUserSequence.every((cell, i) => cell === sequence[i]);

      // record reaction time using ref
      const reactionTime = performance.now() - (inputStartTimeRef.current ?? 0);
      reactionTimesRef.current.push(reactionTime);

      // update trial counters
      currentTrialRef.current += 1;
      setCurrentTrial(prev => prev + 1);

      trialsAtCurrentLength.current += 1;

      if (isCorrect) {
        correctAtCurrentLength.current += 1;
        correctSequencesRef.current += 1;
        setCorrectSequences(prev => prev + 1);
      }

      // Delay phase change to keep last square orange
      setTimeout(() => {
        setGamePhase('feedback');
        setFeedbackType(isCorrect ? 'correct' : 'incorrect');

        // after 3 trials at this length, decide advance or stop
        if (trialsAtCurrentLength.current === 3) {
          const correct = correctAtCurrentLength.current;

          // reset per-length counters
          trialsAtCurrentLength.current = 0;
          correctAtCurrentLength.current = 0;

          if (correct >= 2) {
            // update longest span — length is confirmed passed
            if (sequenceLengthRef.current > longestSequenceRef.current) {
              longestSequenceRef.current = sequenceLengthRef.current;
              setLongestSequence(sequenceLengthRef.current);
            }
            // advance
            if (sequenceLengthRef.current < MAX_SEQUENCE_LENGTH) {
              sequenceLengthRef.current += 1;
              setSequenceLength(prev => prev + 1);
              setTimeout(() => startNextTrial(), 1500);
            } else {
              // ceiling — end game
              setTimeout(() => endGame(), 1500);
            }
          } else {
            // 0 or 1 correct out of 3 — stop
            setTimeout(() => endGame(), 1500);
          }

        } else {
          // fewer than 3 trials at this length — continue
          setTimeout(() => startNextTrial(), 1500);
        }
      }, 300); // 300ms delay to keep last square orange
    }
  };

  // Start first trial when game begins
  useEffect(() => {
    if (gameStarted && currentTrial === 0) {
      startNextTrial();
    }
  }, [gameStarted]);


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

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full mb-6">
              <Grid3x3 className="w-4 h-4 text-[#ffb757]" />
              <span className="text-sm font-semibold text-[#8d654c]">Spatial Span</span>
            </div>

            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Memory Grid
            </h1>

            <div className="mb-8">
              <div className="grid grid-cols-4 gap-2 max-w-[200px] mx-auto">
                {Array.from({ length: 16 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={`aspect-square rounded-lg ${
                      isDarkMode ? 'bg-[#2a2218]' : 'bg-white/40'
                    }`}
                    animate={
                      i === 1 || i === 6 || i === 11
                        ? {
                            backgroundColor: [
                              isDarkMode ? '#2a2218' : '#ffffff66',
                              '#ffb757',
                              isDarkMode ? '#2a2218' : '#ffffff66'
                            ],
                            scale: [1, 1.1, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      delay: i === 1 ? 0 : i === 6 ? 1 : i === 11 ? 2 : 0,
                      repeat: Infinity,
                      repeatDelay: 2.4,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 mb-8 text-left`}>
              <p className={`${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} leading-relaxed mb-3`}>
                Watch the <span className="font-semibold text-[#ffb757]">orange squares</span> flash in sequence, then tap them back in the <span className="font-semibold">same order</span>!
              </p>
              <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} text-sm`}>
                Test your spatial working memory and attention.
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
    <div className={`${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`} style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="max-w-[390px] mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className={`w-9 h-9 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
                >
                  <ArrowLeft className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                </button>
              )}
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Spatial Span Game
              </h2>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              Trial {currentTrial + 1}
            </div>
          </div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#ffb757]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((currentTrial + 1) * 8, 95)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Status Message */}
      <div className="px-6 pb-4">
        <div className="max-w-[390px] mx-auto">
          <div className={`w-full h-[116px] overflow-hidden flex flex-col items-center justify-center rounded-2xl p-4 text-sm text-center transition-colors duration-200 ${
            gamePhase === 'feedback'
              ? feedbackType === 'correct'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
              : isDarkMode
                ? 'bg-[#2a2218] text-[#ece5de]/80'
                : 'bg-white/60 text-[#8d654c]/80'
          }`}>
            {gamePhase === 'showing' && (
              <>
                <Grid3x3 className="w-6 h-6 text-[#ffb757] mb-2" />
                <p><strong>Watch carefully!</strong> Remember the sequence...</p>
              </>
            )}
            {gamePhase === 'input' && (
              <>
                <Grid3x3 className="w-6 h-6 text-[#ffb757] mb-2 opacity-0" />
                <p><strong>Your turn!</strong> Tap the squares in order ({userSequence.length}/{sequence.length})</p>
              </>
            )}
            {gamePhase === 'feedback' && (
              <>
                {feedbackType === 'correct'
                  ? <CheckCircle2 className="w-6 h-6 mb-2" />
                  : <X className="w-6 h-6 mb-2" />
                }
                {feedbackType === 'correct'
                  ? <p><strong>Perfect!</strong> Sequence length: {sequence.length}</p>
                  : <p><strong>Not quite!</strong> Let's try the next one</p>
                }
              </>
            )}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="max-w-[390px] w-full">
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const isFlashing = flashingIndex === index;
              const isInUserSequence = userSequence.includes(index);
              const shouldShowUserClick = gamePhase === 'input' && isInUserSequence;

              return (
                <motion.button
                  key={index}
                  onClick={() => handleCellClick(index)}
                  disabled={gamePhase !== 'input'}
                  className={`aspect-square rounded-2xl transition-all ${
                    isFlashing
                      ? 'bg-[#ffb757] shadow-xl'
                      : shouldShowUserClick
                      ? 'bg-[#ffb757] shadow-lg'
                      : isDarkMode
                      ? 'bg-[#2a2218]'
                      : 'bg-white/40'
                  } ${gamePhase === 'input' ? 'active:scale-90 cursor-pointer' : 'cursor-default'}`}
                >
                  <AnimatePresence>
                    {shouldShowUserClick && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <div className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-[#ece5de]' : 'bg-[#8d654c]'}`} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>

          {/* Sequence indicator during input */}
          <div className={`h-10 flex items-center justify-center transition-opacity duration-150 ${
            gamePhase === 'input' ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
            <div className="flex justify-center gap-2">
              {sequence.map((_, idx) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
