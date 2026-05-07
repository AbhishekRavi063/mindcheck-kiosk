import { useState } from 'react';
import { QuestionSlider } from './QuestionSlider';
import { MiniGame } from './MiniGame';
import { phq9Questions, stressScaleQuestions } from '../data/questions';
import { Sparkles } from 'lucide-react';

interface AssessmentFlowProps {
  onComplete: () => void;
}

export function AssessmentFlow({ onComplete }: AssessmentFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [gameScores, setGameScores] = useState<number[]>([]);

  const allQuestions = [...phq9Questions, ...stressScaleQuestions];
  const totalSteps = allQuestions.length + 3; // questions + 3 games
  
  const isGameStep = (step: number) => {
    return step === 3 || step === 8 || step === 14;
  };

  const getGameType = (step: number): 'memory' | 'attention' | 'cognitive' => {
    if (step === 3) return 'memory';
    if (step === 8) return 'attention';
    return 'cognitive';
  };

  const handleAnswer = (value: number) => {
    setAnswers([...answers, value]);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
    }, 500);
  };

  const handleGameComplete = (score: number) => {
    setGameScores([...gameScores, score]);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
    }, 1000);
  };

  const handleFinish = () => {
    // Calculate PHQ-9 score (first 9 questions)
    const phq9Score = answers.slice(0, 9).reduce((a, b) => a + b, 0);
    
    // Calculate Stress score (next 10 questions)
    const stressScore = answers.slice(9, 19).reduce((a, b) => a + b, 0);
    
    // Calculate average cognitive score
    const cognitiveScore = gameScores.reduce((a, b) => a + b, 0) / gameScores.length;

    // Save to localStorage
    const assessment = {
      date: new Date().toISOString(),
      phq9Score,
      stressScore,
      cognitiveScore,
      answers,
      gameScores
    };

    const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    history.push(assessment);
    localStorage.setItem('assessmentHistory', JSON.stringify(history));
    localStorage.setItem('lastAssessmentDate', new Date().toISOString());

    onComplete();
  };

  // Adjust question index accounting for games
  let questionIndex = currentStep;
  if (currentStep > 14) questionIndex -= 3;
  else if (currentStep > 8) questionIndex -= 2;
  else if (currentStep > 3) questionIndex -= 1;

  if (currentStep >= totalSteps) {
    handleFinish();
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Your Journey</span>
            <span className="text-sm font-medium text-purple-600">
              {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        {isGameStep(currentStep) ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <Sparkles className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Time for a mindful break
              </h2>
              <p className="text-gray-600">
                Let's play a quick game to check in with your cognitive wellness
              </p>
            </div>
            <MiniGame 
              type={getGameType(currentStep)} 
              onComplete={handleGameComplete}
            />
          </div>
        ) : (
          <QuestionSlider
            question={allQuestions[questionIndex]}
            onAnswer={handleAnswer}
            questionNumber={questionIndex + 1}
          />
        )}
      </div>
    </div>
  );
}
