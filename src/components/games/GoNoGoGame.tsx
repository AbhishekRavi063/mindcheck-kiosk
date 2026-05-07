import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { BackButton } from '../ui/BackButton';

interface GoNoGoGameProps {
  onComplete: (metrics: GameMetrics) => void;
  isDarkMode?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
}

export interface GameMetrics {
  totalTrials: number;
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  averageReactionTime: number;
  inhibitionScore: number;
}

type StimulusType = 'go' | 'no-go';

interface Trial {
  type: StimulusType;
  responded: boolean;
  correct: boolean;
  reactionTime: number | null;
}

const TOTAL_TRIALS = 20;
const STIMULUS_DURATION = 800; // ms
const INTER_TRIAL_INTERVAL = 400; // ms
const GO_PROBABILITY = 0.8; // 80% go trials (yellow circle), 20% no-go trials (black square)

export function GoNoGoGame({ onComplete, isDarkMode = false, onBack, onSkip }: GoNoGoGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stimulus, setStimulus] = useState<StimulusType | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const stimulusStartTime = useRef<number>(0);
  const responded = useRef<boolean>(false);

  // Pre-generate trial sequence once at mount
  const trialSequence = useRef<StimulusType[]>(
    Array.from({ length: TOTAL_TRIALS }, () =>
      Math.random() < GO_PROBABILITY ? 'go' : 'no-go'
    )
  );

  // Advance to next trial / detect completion
  useEffect(() => {
    if (!gameStarted || currentTrial >= TOTAL_TRIALS) {
      if (currentTrial >= TOTAL_TRIALS) {
        const metrics = calculateMetrics(trials);
        setIsComplete(true);
        setTimeout(() => onComplete(metrics), 2000);
      }
      return;
    }

    const startTimer = setTimeout(() => {
      const stimType = trialSequence.current[currentTrial];
      setStimulus(stimType);
      stimulusStartTime.current = Date.now();
      responded.current = false;
      setShowFeedback(null);
    }, INTER_TRIAL_INTERVAL);

    return () => clearTimeout(startTimer);
  }, [currentTrial, gameStarted]);

  // Auto-advance when stimulus expires with no response
  useEffect(() => {
    if (!stimulus) return;

    const endTimer = setTimeout(() => {
      if (!responded.current) {
        const correct = stimulus === 'no-go';
        const trial: Trial = { type: stimulus, responded: false, correct, reactionTime: null };
        setTrials(prev => [...prev, trial]);
        setShowFeedback(correct ? 'correct' : 'incorrect');

        setTimeout(() => {
          setStimulus(null);
          setCurrentTrial(prev => prev + 1);
        }, 500);
      }
    }, STIMULUS_DURATION);

    return () => clearTimeout(endTimer);
  }, [stimulus]);

  const handleResponse = () => {
    if (!stimulus || responded.current) return;

    responded.current = true;
    const reactionTime = Date.now() - stimulusStartTime.current;
    const correct = stimulus === 'go';

    const trial: Trial = { type: stimulus, responded: true, correct, reactionTime };
    setTrials(prev => [...prev, trial]);
    setShowFeedback(correct ? 'correct' : 'incorrect');

    setTimeout(() => {
      setStimulus(null);
      setCurrentTrial(prev => prev + 1);
    }, 500);
  };

  const calculateMetrics = (completedTrials: Trial[]): GameMetrics => {
    const goTrials = completedTrials.filter(t => t.type === 'go');
    const noGoTrials = completedTrials.filter(t => t.type === 'no-go');

    const hits = goTrials.filter(t => t.responded && t.correct).length;
    const misses = goTrials.filter(t => !t.responded).length;
    const falseAlarms = noGoTrials.filter(t => t.responded).length;
    const correctRejections = noGoTrials.filter(t => !t.responded && t.correct).length;

    const reactionTimes = completedTrials
      .filter(t => t.reactionTime !== null)
      .map(t => t.reactionTime!);

    const averageReactionTime = reactionTimes.length > 0
      ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
      : 0;

    const inhibitionScore = noGoTrials.length > 0
      ? (correctRejections / noGoTrials.length) * 100
      : 100;

    return {
      totalTrials: TOTAL_TRIALS,
      hits,
      misses,
      falseAlarms,
      correctRejections,
      averageReactionTime: Math.round(averageReactionTime),
      inhibitionScore: Math.round(inhibitionScore),
    };
  };

  if (isComplete) {
    const metrics = calculateMetrics(trials);

    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <div className="max-w-[390px] w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#ffb757]" fill="#ffb757" />
              <span className="text-sm font-semibold text-[#8d654c]">Response Control</span>
            </div>

            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Go / No-Go
            </h1>

            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-12 h-12 text-orange-500" fill="currentColor" />
            </div>

            <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Keep Practicing!
            </h2>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-4">
                <div className="text-3xl font-bold text-[#8d654c] mb-1">{metrics.hits}</div>
                <div className="text-xs text-[#8d654c]/60">Hits</div>
              </div>
              <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-4">
                <div className="text-3xl font-bold text-[#8d654c] mb-1">{metrics.inhibitionScore}%</div>
                <div className="text-xs text-[#8d654c]/60">Inhibition</div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-4">
                <div className="text-3xl font-bold text-[#8d654c] mb-1">{metrics.averageReactionTime}ms</div>
                <div className="text-xs text-[#8d654c]/60">Avg Time</div>
              </div>
            </div>

            <motion.button
              onClick={() => onComplete(metrics)}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-[#ff8a65] to-[#ff7043] text-white font-semibold py-4 rounded-full shadow-lg flex items-center justify-center gap-2"
            >
              Continue Journey
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </motion.div>
        </div>
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

            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-[#ffb757]" fill="#ffb757" />
              <span className="text-sm font-semibold text-[#8d654c]">Response Control</span>
            </div>

            <h1 className={`text-4xl font-bold mb-8 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Go / No-Go
            </h1>

            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-[#ffb757]/30 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#ffb757]" />
                </div>
                <span className="text-sm font-bold text-[#ffb757]">TAP!</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-md bg-[#2c3e50]" />
                </div>
                <span className="text-sm font-bold text-[#8d654c]">WAIT!</span>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 mb-8 text-left space-y-3`}>
              <p className={`${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} leading-relaxed`}>
                When you see a <span className="font-semibold text-[#ffb757]">yellow circle</span>, tap as fast as you can!
              </p>
              <p className={`${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} leading-relaxed`}>
                When you see a <span className="font-semibold text-[#2c3e50] dark:text-[#ece5de]">black square</span>, {`don't`} tap!
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
                Focus Game
              </h2>
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              {currentTrial + 1} / {TOTAL_TRIALS}
            </div>
          </div>
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#ffb757]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentTrial + 1) / TOTAL_TRIALS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Reminder */}
      <div className="px-6 pb-2">
        <div className="max-w-[390px] mx-auto">
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-2xl p-5 text-sm ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'}`}>
            <p className="mb-2 leading-relaxed"><strong className="font-semibold">Tap</strong> when you see the <span className="text-[#ffb757] font-semibold">yellow circle</span></p>
            <p className="leading-relaxed"><strong className="font-semibold">{`Don't`} tap</strong> when you see the <span className="text-[#2c3e50] dark:text-[#ece5de] font-semibold">black square</span></p>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full flex items-center justify-center">
          <AnimatePresence mode="wait">
            {stimulus && (
              <motion.button
                key={currentTrial}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={handleResponse}
                className={`w-40 h-40 ${
                  stimulus === 'go'
                    ? 'rounded-full bg-[#ffb757]'
                    : 'rounded-xl bg-[#2c3e50]'
                } shadow-2xl active:scale-95 transition-transform relative`}
              >
                {showFeedback && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    {showFeedback === 'correct' ? (
                      <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
                    ) : (
                      <XCircle className="w-16 h-16 text-white" strokeWidth={3} />
                    )}
                  </motion.div>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
