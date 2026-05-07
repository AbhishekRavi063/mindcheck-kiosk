import { motion } from 'motion/react';
import { PHQ9SketchIllustration } from './PHQ9SketchIllustrations';

interface SemanticIllustrationProps {
  questionNumber: number;
  sliderPercentage: number; // 0 to 1
  isDarkMode: boolean;
}

export function SemanticIllustration({ 
  questionNumber, 
  sliderPercentage, 
  isDarkMode 
}: SemanticIllustrationProps) {
  const baseColor = isDarkMode ? '#ece5de' : '#8d654c';
  const accentColor = '#ffb757';
  
  // Use sketch illustrations for PHQ-9 questions (1-9)
  if (questionNumber >= 1 && questionNumber <= 9) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="w-48 h-48">
          <PHQ9SketchIllustration 
            questionNumber={questionNumber}
            sliderPercentage={sliderPercentage}
            baseColor={baseColor}
            accentColor={accentColor}
          />
        </div>
      </div>
    );
  }

  // For other questionnaires, return null or a default illustration
  return null;
}
