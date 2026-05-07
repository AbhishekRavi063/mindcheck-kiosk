import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

interface GoNoGoGameProps {
  onComplete: (results: {
    hits: number;
    inhibitionErrors: number;
    avgReactionTime: number;
    totalTrials: number;
    completionTime: number;
  }) => void;
  onBack: () => void;
  isDarkMode: boolean;
  totalTrials?: number;
}

type StimulusType = 'go' | 'nogo' | null;

export function GoNoGoGame({ onComplete, onBack, isDarkMode, totalTrials = 20 }: GoNoGoGameProps) {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [stimulus, setStimulus] = useState<StimulusType>(null);
  const [hits, setHits] = useState(0);
  const [inhibitionErrors, setInhibitionErrors] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [stimulusStartTime, setStimulusStartTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Generate random stimulus (70% GO, 30% NO-GO for balance)
  const showNextStimulus = useCallback(() => {
    const isGo = Math.random() < 0.7;
    const stimulusType: StimulusType = isGo ? 'go' : 'nogo';
    
    setTimeout(() => {
      setStimulus(stimulusType);
      setStimulusStartTime(Date.now());
      setFeedback(null);

      // Auto-advance after 1.5 seconds if no response
      setTimeout(() => {
        if (stimulusType === 'nogo') {
          // Correct non-response for NO-GO
          setFeedback('✓ Correct!');
        } else {
          // Miss for GO stimulus
          setFeedback('Missed');
        }
        
        setTimeout(() => {
          advanceTrial();
        }, 500);
      }, 1500);
    }, 500 + Math.random() * 1000); // Random delay between 500-1500ms
  }, []);

  const advanceTrial = () => {
    if (currentTrial + 1 >= totalTrials) {
      // Game complete
      const avgRT = reactionTimes.length > 0
        ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length
        : 0;
      
      const completionTime = Date.now() - startTime;
      
      onComplete({
        hits,
        inhibitionErrors,
        avgReactionTime: Math.round(avgRT),
        totalTrials,
        completionTime: Math.round(completionTime / 1000)
      });
    } else {
      setCurrentTrial(currentTrial + 1);
      setStimulus(null);
      showNextStimulus();
    }
  };

  const handleResponse = () => {
    if (!stimulus || feedback) return;

    const reactionTime = Date.now() - stimulusStartTime;

    if (stimulus === 'go') {
      // Correct GO response
      setHits(hits + 1);
      setReactionTimes([...reactionTimes, reactionTime]);
      setFeedback('✓ Good!');
    } else {
      // Incorrect response to NO-GO
      setInhibitionErrors(inhibitionErrors + 1);
      setFeedback('✗ Stop!');
    }

    setTimeout(() => {
      advanceTrial();
    }, 500);
  };

  useEffect(() => {
    if (gameStarted && currentTrial === 0 && !stimulus) {
      setStartTime(Date.now());
      showNextStimulus();
    }
  }, [gameStarted, currentTrial, stimulus, showNextStimulus]);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameStarted && stimulus && !feedback) {
        e.preventDefault();
        handleResponse();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, stimulus, feedback]);

  if (!gameStarted) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`}>
        {/* Header */}
        <div className="p-6">
          <button
            onClick={onBack}
            className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
          </button>
        </div>

        {/* Instructions */}
        <div className="flex-1 px-6 pb-6 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2`}>
                Go/No-Go Game
              </h1>
              <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>
                Test your focus and impulse control
              </p>
            </div>

            <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 space-y-4`}>
              <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                How to play:
              </h3>
              <ul className={`space-y-3 text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#ffb757]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ffb757] font-bold text-xs">1</span>
                  </span>
                  <span>When you see a <strong className="text-green-500">GREEN circle</strong>, tap the screen quickly</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#ffb757]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ffb757] font-bold text-xs">2</span>
                  </span>
                  <span>When you see a <strong className="text-red-500">RED circle</strong>, don't tap — stay still!</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 bg-[#ffb757]/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#ffb757] font-bold text-xs">3</span>
                  </span>
                  <span>React quickly but stay focused on which color appears</span>
                </li>
              </ul>
            </div>

            <div className={`${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/5'} rounded-xl p-4`}>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
                <strong>Trials:</strong> {totalTrials} • <strong>Time:</strong> ~{Math.ceil(totalTrials * 2.5 / 60)} min
              </p>
            </div>
          </motion.div>

          <div className="flex-1" />

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => setGameStarted(true)}
            className="w-full py-4 rounded-2xl bg-[#ffb757] text-white font-semibold shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-all"
          >
            Start Game
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col items-center justify-center p-6`}>
      {/* Progress */}
      <div className="absolute top-6 left-6 right-6">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
            Trial {currentTrial + 1}/{totalTrials}
          </span>
        </div>
        <div className={`h-2 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/40'} rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentTrial + 1) / totalTrials) * 100}%` }}
            className="h-full bg-[#ffb757]"
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          onClick={handleResponse}
          className="relative cursor-pointer"
        >
          {stimulus && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-40 h-40 rounded-full flex items-center justify-center ${
                stimulus === 'go' ? 'bg-green-500' : 'bg-red-500'
              } shadow-2xl`}
            >
              {stimulus === 'go' && (
                <span className="text-white text-2xl font-bold">TAP!</span>
              )}
              {stimulus === 'nogo' && (
                <span className="text-white text-2xl font-bold">STOP</span>
              )}
            </motion.div>
          )}

          {!stimulus && !feedback && (
            <div className={`w-40 h-40 rounded-full flex items-center justify-center ${
              isDarkMode ? 'bg-[#2a2218]' : 'bg-white/40'
            } border-4 border-dashed ${isDarkMode ? 'border-[#ece5de]/20' : 'border-[#8d654c]/20'}`}>
              <span className={`text-sm ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>
                Get ready...
              </span>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`absolute inset-0 flex items-center justify-center text-2xl font-bold ${
                feedback.includes('✓') ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Instructions hint */}
      <div className={`text-center text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} mb-6`}>
        Tap the green circle • Don't tap the red circle
      </div>
    </div>
  );
}
