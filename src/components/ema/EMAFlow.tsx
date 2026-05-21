import { useState } from 'react';
import { EMAQuestionScreen } from './EMAQuestionScreen';
import { EMASectionSelector } from './EMASectionSelector';
import { EMASectionComplete } from './EMASectionComplete';
import { DataSyncPreferenceModal } from '../modals/DataSyncPreferenceModal';
import { emaSections, EMASection } from '../../data/emaQuestions';
import { saveDayLog, logUserActivity } from '../../utils/firebaseSync';
import { enableCloudSync, disableCloudSync, uploadAllLocalData } from '../../utils/cloudSync';
import { getSensitiveValueSync, setSensitiveValue } from '../../utils/secureVault';

interface EMAFlowProps {
  onComplete: (answers: any) => void;
  onSkip: () => void;
  isDarkMode: boolean;
}

export function EMAFlow({ onComplete, onSkip, isDarkMode }: EMAFlowProps) {
  const [selectedSection, setSelectedSection] = useState<EMASection | null>(null);
  const [completedSection, setCompletedSection] = useState<EMASection | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleSelectSection = (sectionId: string) => {
    const section = emaSections.find(s => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
      setCurrentQuestion(0);
      setAnswers([]);
      logUserActivity('ema_started', { time_of_day: sectionId });
    }
  };

  const handleAnswer = (value: number | string | string[]) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (selectedSection && currentQuestion === selectedSection.questions.length - 1) {
      // Section complete - save and return to selector
      const today = new Date().toISOString().split('T')[0];
      const existingData = getSensitiveValueSync<Record<string, any[]>>('mindcheck_ema_data', {});
      
      if (!existingData[today]) {
        existingData[today] = [];
      }
      
      const questions = selectedSection.questions.map((q, i) => ({
        question_text: q.text,
        response: newAnswers[i],
      }));

      existingData[today].push({
        section: selectedSection.id,
        answers: newAnswers,
        questions,
        timestamp: new Date().toISOString()
      });

      setSensitiveValue('mindcheck_ema_data', existingData).catch(error => {
        console.error('Error saving secure EMA data:', error);
      });

      // Firebase sync
      saveDayLog({ questions, time_of_day: selectedSection.id });
      logUserActivity('ema_completed', { time_of_day: selectedSection.id });

      // Go back to section selector instead of calling onComplete
      setCompletedSection(selectedSection);
      setSelectedSection(null);
      setCurrentQuestion(0);
      setAnswers([]);
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setAnswers(answers.slice(0, -1));
      setCurrentQuestion(currentQuestion - 1);
    } else {
      // Go back to section selector
      setSelectedSection(null);
    }
  };

  const handleBackToSelector = () => {
    onSkip();
  };

  const handleContinueAfterComplete = () => {
    setCompletedSection(null);
    const hasAsked = localStorage.getItem('mindcheck_sync_preference_asked') === 'true';
    if (!hasAsked) {
      setShowSyncModal(true);
    }
  };

  // Show cloud sync consent modal (once ever, after first EMA completion)
  if (showSyncModal) {
    return (
      <DataSyncPreferenceModal
        isDarkMode={isDarkMode}
        onClose={() => {
          localStorage.setItem('mindcheck_sync_preference_asked', 'true');
          localStorage.setItem('mindcheck_cloud_backup_enabled', 'false');
          setShowSyncModal(false);
        }}
        onChooseBackend={() => {
          localStorage.setItem('mindcheck_cloud_backup_preference', 'accepted');
          enableCloudSync();
          uploadAllLocalData();
          setShowSyncModal(false);
        }}
        onChooseLocal={() => {
          localStorage.setItem('mindcheck_sync_preference_asked', 'true');
          localStorage.setItem('mindcheck_cloud_backup_preference', 'declined');
          disableCloudSync();
          setShowSyncModal(false);
        }}
      />
    );
  }

  // Show completion screen
  if (completedSection) {
    return (
      <EMASectionComplete
        sectionName={completedSection.name}
        sectionIcon={completedSection.icon}
        onContinue={handleContinueAfterComplete}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Show section selector
  if (!selectedSection) {
    return (
      <EMASectionSelector
        sections={emaSections}
        onSelectSection={handleSelectSection}
        onBack={handleBackToSelector}
        isDarkMode={isDarkMode}
      />
    );
  }

  return (
    <EMAQuestionScreen
      question={selectedSection.questions[currentQuestion]}
      onAnswer={handleAnswer}
      onBack={handleBack}
      currentQuestion={currentQuestion}
      totalQuestions={selectedSection.questions.length}
      sectionName={selectedSection.name}
      sectionIcon={selectedSection.icon}
      isDarkMode={isDarkMode}
    />
  );
}

// Export with alias for consistency with user-facing "Daily Check-In" terminology
export { EMAFlow as DailyCheckInFlow };
