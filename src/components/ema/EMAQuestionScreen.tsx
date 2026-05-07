import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { EMAQuestion } from '../../data/emaQuestions';

interface EMAQuestionScreenProps {
  question: EMAQuestion;
  onAnswer: (value: number | string | string[]) => void;
  onBack: () => void;
  currentQuestion: number;
  totalQuestions: number;
  sectionName: string;
  sectionIcon: string;
  isDarkMode: boolean;
}

export function EMAQuestionScreen({ 
  question, 
  onAnswer, 
  onBack, 
  currentQuestion, 
  totalQuestions,
  sectionName,
  sectionIcon,
  isDarkMode 
}: EMAQuestionScreenProps) {
  const [sliderValue, setSliderValue] = useState(50);
  const [textValue, setTextValue] = useState('');
  const [multiChoiceAnswers, setMultiChoiceAnswers] = useState<string[]>([]);

  const handleButtonClick = (option: string) => {
    onAnswer(option);
  };

  const handleSliderContinue = () => {
    onAnswer(sliderValue);
  };

  const handleTextContinue = () => {
    onAnswer(textValue);
  };

  const handleMultiChoiceSelect = (subIndex: number, value: string) => {
    const newAnswers = [...multiChoiceAnswers];
    newAnswers[subIndex] = value;
    setMultiChoiceAnswers(newAnswers);
  };

  const handleMultiChoiceContinue = () => {
    onAnswer(multiChoiceAnswers);
  };

  const isMultiChoiceComplete = () => {
    if (!question.subQuestions) return false;
    // Check that all sub-questions have answers
    for (let i = 0; i < question.subQuestions.length; i++) {
      if (!multiChoiceAnswers[i]) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="max-w-[390px] mx-auto">
          <button
            onClick={onBack}
            className={`mb-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center justify-center gap-1 mb-6">
            {Array.from({ length: totalQuestions }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx === currentQuestion
                    ? 'bg-[#ff6b6b]'
                    : idx < currentQuestion
                    ? 'bg-[#ffb757]'
                    : isDarkMode ? 'bg-[#2a2218]' : 'bg-white/40'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#ffb757] rounded-xl flex items-center justify-center">
              <span className="text-xl">{sectionIcon}</span>
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              {sectionName}
            </span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center px-6">
        <div className="max-w-[390px] mx-auto w-full">
          <h2 className={`text-2xl font-semibold text-center mb-12 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            {question.text}
          </h2>

          {question.type === 'buttons' && question.options && (
            <div className={`grid gap-2 ${
              question.options.length === 5 ? 'grid-cols-5' : 
              question.options.length === 4 ? 'grid-cols-4' :
              question.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'
            }`}>
              {question.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleButtonClick(option)}
                  whileTap={{ scale: 0.95 }}
                  className={`py-4 px-2 rounded-xl font-medium text-sm ${
                    isDarkMode 
                      ? 'bg-[#2a2218] text-[#ece5de] hover:bg-[#3a3228]' 
                      : 'bg-white/80 text-[#8d654c] hover:bg-white'
                  } transition-colors active:scale-95`}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          )}

          {question.type === 'slider' && question.sliderConfig && (
            <div className="space-y-8">
              {/* Emoji labels */}
              <div className="flex justify-between items-center px-2">
                <div className="text-center">
                  <div className="text-3xl mb-1">{question.sliderConfig.leftEmoji}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                    {question.sliderConfig.leftLabel}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">{question.sliderConfig.rightEmoji}</div>
                  <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                    {question.sliderConfig.rightLabel}
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={question.sliderConfig.min}
                  max={question.sliderConfig.max}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer slider-ema"
                  style={{
                    background: `linear-gradient(to right, #ff6b6b 0%, #ff6b6b ${sliderValue}%, ${isDarkMode ? '#2a2218' : '#ffffff66'} ${sliderValue}%, ${isDarkMode ? '#2a2218' : '#ffffff66'} 100%)`
                  }}
                />
              </div>
            </div>
          )}

          {question.type === 'text' && (
            <div className="space-y-4">
              <textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className={`w-full h-32 rounded-xl p-4 text-sm ${
                  isDarkMode ? 'bg-[#2a2218] text-[#ece5de] placeholder:text-[#ece5de]/40' : 'bg-white/80 text-[#8d654c] placeholder:text-[#8d654c]/40'
                }`}
                placeholder={question.placeholder || 'Type here...'}
              />
              {question.optional && (
                <p className={`text-xs text-center ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                  Optional — skip if you prefer
                </p>
              )}
            </div>
          )}

          {question.type === 'multi-choice' && question.subQuestions && (
            <div className="space-y-6">
              {question.subQuestions.map((subQuestion, subIndex) => (
                <div key={subIndex} className="space-y-3">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                    {subQuestion.text}
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {subQuestion.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleMultiChoiceSelect(subIndex, option)}
                        whileTap={{ scale: 0.95 }}
                        className={`py-3 px-3 rounded-xl font-medium text-sm transition-all ${
                          multiChoiceAnswers[subIndex] === option
                            ? 'bg-[#ffb757] text-white'
                            : isDarkMode 
                            ? 'bg-[#2a2218] text-[#ece5de] hover:bg-[#3a3228]' 
                            : 'bg-white/80 text-[#8d654c] hover:bg-white'
                        }`}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Continue button (only for slider questions) */}
      {question.type === 'slider' && (
        <div className="p-6">
          <div className="max-w-[390px] mx-auto">
            <motion.button
              onClick={handleSliderContinue}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#ff8a65] to-[#ff6b6b] text-white py-4 rounded-2xl font-semibold shadow-lg"
            >
              {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Continue'}
            </motion.button>
          </div>
        </div>
      )}

      {/* Continue button (only for text questions) */}
      {question.type === 'text' && (
        <div className="p-6">
          <div className="max-w-[390px] mx-auto">
            <motion.button
              onClick={handleTextContinue}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#ff8a65] to-[#ff6b6b] text-white py-4 rounded-2xl font-semibold shadow-lg"
            >
              {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Continue'}
            </motion.button>
          </div>
        </div>
      )}

      {/* Continue button (only for multi-choice questions) */}
      {question.type === 'multi-choice' && (
        <div className="p-6">
          <div className="max-w-[390px] mx-auto">
            <motion.button
              onClick={handleMultiChoiceContinue}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-[#ff8a65] to-[#ff6b6b] text-white py-4 rounded-2xl font-semibold shadow-lg disabled:opacity-50"
              disabled={!isMultiChoiceComplete()}
            >
              {currentQuestion === totalQuestions - 1 ? 'Complete' : 'Continue'}
            </motion.button>
          </div>
        </div>
      )}

      <style>{`
        .slider-ema::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }

        .slider-ema::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}