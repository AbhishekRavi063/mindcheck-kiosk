import { useState } from 'react';
import { motion } from 'motion/react';
import { User } from 'lucide-react';

interface Question {
  text: string;
  category: string;
  labels: string[];
  reversed?: boolean;
  illustrations?: { [key: number]: string }; // Added illustrations support
}

interface QuestionSliderProps {
  question: Question;
  onAnswer: (value: number) => void;
  questionNumber: number;
}

export function QuestionSlider({ question, onAnswer, questionNumber }: QuestionSliderProps) {
  const [value, setValue] = useState(2);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setValue(newValue);
    setHasInteracted(true);
  };

  const handleSubmit = () => {
    // If reversed scoring, flip the value
    const finalValue = question.reversed ? (4 - value) : value;
    onAnswer(finalValue);
  };

  // Calculate brightness and size based on slider value
  const brightness = question.reversed 
    ? 0.3 + (value / 4) * 0.7  // reversed: lower value = brighter
    : 0.3 + ((4 - value) / 4) * 0.7;  // normal: lower value = dimmer
  
  const scale = 0.8 + brightness * 0.4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-3xl shadow-2xl p-8 md:p-12"
    >
      {/* Category Badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          {question.category}
        </span>
      </div>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-12">
        {question.text}
      </h2>

      {/* Visual Indicator - Illustration or Person */}
      <div className="flex justify-center mb-8">
        <motion.div
          key={value} // Key changes with value to trigger animation
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative"
        >
          {question.illustrations && question.illustrations[value] ? (
            // Display Indianized illustration if available
            <div className="w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src={question.illustrations[value]} 
                alt={`Illustration for ${question.labels[value]}`}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            // Fallback to original icon
            <div>
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: `radial-gradient(circle, rgba(139, 92, 246, ${brightness}) 0%, rgba(219, 39, 119, ${brightness * 0.8}) 100%)`,
                  boxShadow: `0 20px 60px rgba(139, 92, 246, ${brightness * 0.5})`
                }}
              >
                <User className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
              
              {/* Glow effect */}
              <motion.div
                animate={{ opacity: brightness * 0.6 }}
                className="absolute inset-0 rounded-full blur-2xl -z-10"
                style={{
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)'
                }}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Slider */}
      <div className="mb-8">
        <input
          type="range"
          min="0"
          max="4"
          value={value}
          onChange={handleChange}
          className="w-full h-3 bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 rounded-full appearance-none cursor-pointer slider"
          style={{
            accentColor: '#8b5cf6'
          }}
        />
        <style>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
            transition: transform 0.2s;
          }
          .slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }
          .slider::-moz-range-thumb {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #8b5cf6 0%, #db2777 100%);
            cursor: pointer;
            border: none;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
          }
        `}</style>
      </div>

      {/* Labels */}
      <div className="flex justify-between mb-8 px-1">
        {question.labels.map((label, index) => (
          <div 
            key={index}
            className="text-center max-w-[80px]"
          >
            <div 
              className={`text-xs md:text-sm transition-all duration-300 ${
                value === index 
                  ? 'text-purple-700 font-semibold scale-110' 
                  : 'text-gray-500'
              }`}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={!hasInteracted}
        whileHover={{ scale: hasInteracted ? 1.02 : 1 }}
        whileTap={{ scale: hasInteracted ? 0.98 : 1 }}
        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${
          hasInteracted
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {hasInteracted ? 'Continue' : 'Please select your response'}
      </motion.button>

      {/* Progress indicator */}
      <div className="mt-6 text-center text-sm text-gray-500">
        Question {questionNumber}
      </div>
    </motion.div>
  );
}