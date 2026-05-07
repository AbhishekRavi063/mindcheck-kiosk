import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Brain, Check, X } from 'lucide-react';

interface CognitiveGameProps {
  onComplete: (score: number) => void;
}

interface Question {
  question: string;
  options: string[];
  correct: number;
}

const questions: Question[] = [
  {
    question: 'Which word does NOT belong?',
    options: ['Apple', 'Banana', 'Carrot', 'Orange'],
    correct: 2
  },
  {
    question: 'What comes next? 2, 4, 8, 16, __',
    options: ['20', '24', '32', '64'],
    correct: 2
  },
  {
    question: 'If CAT is to KITTEN, then DOG is to:',
    options: ['Puppy', 'Bark', 'Pet', 'Animal'],
    correct: 0
  }
];

export function CognitiveGame({ onComplete }: CognitiveGameProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [started, setStarted] = useState(false);

  const handleAnswer = (index: number) => {
    if (selected !== null) return;
    
    setSelected(index);
    const correct = index === questions[currentQ].correct;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setIsCorrect(null);
      } else {
        const finalScore = correct ? score + 1 : score;
        const percentage = Math.round((finalScore / questions.length) * 100);
        setTimeout(() => {
          onComplete(percentage);
        }, 1500);
      }
    }, 1500);
  };

  if (!started) {
    return (
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-6">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">
            Cognitive Patterns
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Test your pattern recognition and reasoning skills with a few quick questions
          </p>
          <button
            onClick={() => setStarted(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Begin
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Question {currentQ + 1} of {questions.length}</span>
          <span className="text-sm font-medium text-purple-600">Score: {score}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 text-center">
          {question.question}
        </h3>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selected !== null}
            whileHover={{ scale: selected === null ? 1.02 : 1 }}
            whileTap={{ scale: selected === null ? 0.98 : 1 }}
            className={`p-6 rounded-xl font-semibold text-lg transition-all ${
              selected === null
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                : selected === index
                  ? isCorrect
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : 'bg-red-100 text-red-800 border-2 border-red-400'
                  : index === question.correct
                    ? 'bg-green-100 text-green-800 border-2 border-green-400'
                    : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{option}</span>
              {selected !== null && (
                <>
                  {selected === index && isCorrect && <Check className="w-6 h-6" />}
                  {selected === index && !isCorrect && <X className="w-6 h-6" />}
                  {selected !== index && index === question.correct && <Check className="w-6 h-6" />}
                </>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center"
        >
          <p className={`text-lg font-medium ${isCorrect ? 'text-green-600' : 'text-orange-600'}`}>
            {isCorrect ? 'Excellent reasoning!' : 'That\'s okay, every brain works differently!'}
          </p>
        </motion.div>
      )}
    </div>
  );
}
