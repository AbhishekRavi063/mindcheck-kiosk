import { useState, useEffect } from 'react';
import { CompletionSummary } from './checkin/CompletionSummary';
import { CrisisModal } from './checkin/CrisisModal';
import { CrisisResourcesModal } from './modals/CrisisResourcesModal';
import { JournalPrompt } from './checkin/JournalPrompt';
import { GoNoGoGame, GameMetrics as GoNoGoMetrics } from './games/GoNoGoGame';
import { AttentionGame, GameMetrics as AttentionMetrics } from './games/AttentionGame';
import { MemoryGame, GameMetrics as MemoryMetrics } from './games/MemoryGame';
import { CountingGame, GameMetrics as CountingMetrics } from './games/CountingGame';
import { phq9Questions, pssQuestions, rsesQuestions, gad7Questions, functionalImpairmentQuestion } from '../data/checkInQuestions';
import { saveQuestionnaireResponse } from '../utils/dataSync';
import { saveQuestionnaire, saveGame, saveJournal, logUserActivity } from '../utils/firebaseSync';
import { calculatePssScore } from '../utils/pssScore';
import { calculateRsesScore } from '../utils/rsesScore';
import { getSensitiveValueSync, setSensitiveValue } from '../utils/secureVault';
import { QuestionnaireScoreScreen } from './checkin/QuestionnaireScoreScreen';
import { GameScoreScreen } from './checkin/GameScoreScreen';
import { QuestionScreen } from './checkin/QuestionScreen';
import { CheckInTypeSelector } from './checkin/CheckInTypeSelector';
import { QuestionnaireTransition } from './checkin/QuestionnaireTransition';

interface CheckInFlowProps {
  onComplete: () => void;
  onCancel?: () => void;
  isDarkMode: boolean;
  onNavigateToDayLog?: () => void;
  onNavigateToJournal?: () => void;
}

type QuestionnaireType = 'phq9' | 'pss' | 'rses' | 'gad7';
type GameType = 'gonogo' | 'attention' | 'memory' | 'counting';

type FlowStep = 
  | 'type-selector'
  | 'transition'
  | 'questions'
  | 'score'
  | 'game'
  | 'game-score'
  | 'journal'
  | 'complete';

export function CheckInFlow({ onComplete, onCancel, isDarkMode, onNavigateToDayLog, onNavigateToJournal }: CheckInFlowProps) {
  const [checkInType, setCheckInType] = useState<'full' | 'phq9' | 'pss' | 'rses' | 'gad7' | null>(null);
  const [flowStep, setFlowStep] = useState<FlowStep>('type-selector');
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // For full check-in: randomized sequence of questionnaires
  const [questionnaireSequence, setQuestionnaireSequence] = useState<QuestionnaireType[]>([]);
  const [currentQuestionnaireIndex, setCurrentQuestionnaireIndex] = useState(0);
  
  // For full check-in: randomized sequence of 3 unique games (one per questionnaire)
  const [gameSequence, setGameSequence] = useState<GameType[]>([]);
  
  const [phq9Answers, setPhq9Answers] = useState<number[]>([]);
  const [pssAnswers, setPssAnswers] = useState<number[]>([]);
  const [rsesAnswers, setRsesAnswers] = useState<number[]>([]);
  const [gad7Answers, setGad7Answers] = useState<number[]>([]);
  const [functionalAnswer, setFunctionalAnswer] = useState<number | null>(null);
  
  const [journalEntries, setJournalEntries] = useState<{ entry: string, hashtags: string[], emotions: string[], media: { type: 'photo' | 'video', url: string } | null, prompt: string | null, moodIntensities?: { [emotion: string]: number } }[]>([]);
  
  const [goNoGoMetrics, setGoNoGoMetrics] = useState<GoNoGoMetrics | null>(null);
  const [attentionMetrics, setAttentionMetrics] = useState<AttentionMetrics | null>(null);
  const [memoryMetrics, setMemoryMetrics] = useState<MemoryMetrics | null>(null);
  const [countingMetrics, setCountingMetrics] = useState<CountingMetrics | null>(null);
  
  const [showCrisisResourcesModal, setShowCrisisResourcesModal] = useState(false);

  // Capture whether this is the user's first ever check-in (before any saves happen)
  const [isFirstCheckIn] = useState(
    () => getSensitiveValueSync<any[]>('mindcheck_history', []).length === 0
  );

  // Save a single questionnaire result immediately when its score screen appears
  const persistQuestionnaireResult = (
    type: QuestionnaireType,
    answers: number[],
    score: number,
    functionalImpairmentValue: number | null = null,
  ) => {
    const now = new Date().toISOString();
    const entry = {
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      checkInType: type,
      phq9Score: type === 'phq9' ? score : null,
      pssScore: type === 'pss' ? score : null,
      rsesScore: type === 'rses' ? score : null,
      gad7Score: type === 'gad7' ? score : null,
      phq9Answers: type === 'phq9' ? answers : null,
      pssAnswers: type === 'pss' ? answers : null,
      rsesAnswers: type === 'rses' ? answers : null,
      gad7Answers: type === 'gad7' ? answers : null,
      functionalImpairment: type === 'phq9' ? functionalImpairmentValue : null,
    };

    saveQuestionnaireResponse(entry).catch(err =>
      console.error('Error saving questionnaire result:', err)
    );

    const lastKey =
      type === 'phq9' ? 'mindcheck_last_phq9' :
      type === 'pss'  ? 'mindcheck_last_pss'  :
      type === 'rses' ? 'mindcheck_last_rses' : 'mindcheck_last_gad7';

    setSensitiveValue(lastKey, now).catch(err =>
      console.error('Error saving last questionnaire timestamp:', err)
    );
    setSensitiveValue('mindcheck_last_assessment', now).catch(err =>
      console.error('Error saving last assessment timestamp:', err)
    );
  };

  // Track current game type for this questionnaire
  const [currentGameType, setCurrentGameType] = useState<GameType | null>(null);
  
  // Store game metrics for each questionnaire
  const [gameMetricsMap, setGameMetricsMap] = useState<{
    phq9?: { type: GameType, metrics: any },
    pss?: { type: GameType, metrics: any },
    rses?: { type: GameType, metrics: any },
    gad7?: { type: GameType, metrics: any }
  }>({});

  // Get a random game type
  const getRandomGameType = (): GameType => {
    const games: GameType[] = ['gonogo', 'attention', 'memory', 'counting'];
    return games[Math.floor(Math.random() * games.length)];
  };

  // Shuffle array helper
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleTypeSelect = (type: 'full' | 'phq9' | 'pss' | 'rses' | 'gad7') => {
    setCheckInType(type);

    if (type === 'full') {
      logUserActivity('guided_checkin_started');
      // Randomize the order of questionnaires
      const randomSequence = shuffleArray<QuestionnaireType>(['phq9', 'pss', 'rses', 'gad7']);
      setQuestionnaireSequence(randomSequence);
      setCurrentQuestionnaireIndex(0);
      setFlowStep('questions');

      // Randomize the order of games
      const randomGames = shuffleArray<GameType>(['gonogo', 'attention', 'memory', 'counting']);
      setGameSequence(randomGames);
    } else {
      logUserActivity('individual_checkin_started', { questionnaire_type: type });
      // Single questionnaire
      setQuestionnaireSequence([type]);
      setCurrentQuestionnaireIndex(0);
      setFlowStep('questions');
    }
  };

  const getCurrentQuestionnaire = (): QuestionnaireType | null => {
    if (questionnaireSequence.length === 0) return null;
    return questionnaireSequence[currentQuestionnaireIndex];
  };

  const handleAnswer = (value: number) => {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return;

    if (currentQ === 'phq9') {
      if (questionIndex < 9) {
        const newAnswers = [...phq9Answers, value];
        setPhq9Answers(newAnswers);
        setQuestionIndex(questionIndex + 1);
      } else if (questionIndex === 9) {
        // Functional impairment question
        setFunctionalAnswer(value);
        setQuestionIndex(0);
        const phq9Score = phq9Answers.reduce((a, b) => a + b, 0);
        saveQuestionnaire({
          questionnaire_type: 'phq9',
          checkin_type: checkInType === 'full' ? 'guided' : 'individual',
          individual_question_scores: phq9Answers,
          total_score: phq9Score,
        });
        persistQuestionnaireResult('phq9', phq9Answers, phq9Score, value);
        logUserActivity('questionnaire_completed', { questionnaire_type: 'phq9' });
        setFlowStep('score');
      }
    } else if (currentQ === 'pss') {
      if (questionIndex < 10) {
        const newAnswers = [...pssAnswers, value];
        setPssAnswers(newAnswers);
        setQuestionIndex(questionIndex + 1);

        if (questionIndex === 9) {
          const pssScore = calculatePssScore(newAnswers);
          saveQuestionnaire({
            questionnaire_type: 'pss',
            checkin_type: checkInType === 'full' ? 'guided' : 'individual',
            individual_question_scores: newAnswers,
            total_score: pssScore,
          });
          persistQuestionnaireResult('pss', newAnswers, pssScore);
          logUserActivity('questionnaire_completed', { questionnaire_type: 'pss' });
          setQuestionIndex(0);
          setFlowStep('score');
        }
      }
    } else if (currentQ === 'rses') {
      if (questionIndex < 10) {
        const newAnswers = [...rsesAnswers, value];
        setRsesAnswers(newAnswers);
        setQuestionIndex(questionIndex + 1);

        if (questionIndex === 9) {
          const rsesScore = calculateRsesScore(newAnswers);
          saveQuestionnaire({
            questionnaire_type: 'rses',
            checkin_type: checkInType === 'full' ? 'guided' : 'individual',
            individual_question_scores: newAnswers,
            total_score: rsesScore,
          });
          persistQuestionnaireResult('rses', newAnswers, rsesScore);
          logUserActivity('questionnaire_completed', { questionnaire_type: 'rses' });
          setQuestionIndex(0);
          setFlowStep('score');
        }
      }
    } else if (currentQ === 'gad7') {
      if (questionIndex < 7) {
        const newAnswers = [...gad7Answers, value];
        setGad7Answers(newAnswers);
        setQuestionIndex(questionIndex + 1);

        if (questionIndex === 6) {
          const gad7Score = newAnswers.reduce((a, b) => a + b, 0);
          saveQuestionnaire({
            questionnaire_type: 'gad7',
            checkin_type: checkInType === 'full' ? 'guided' : 'individual',
            individual_question_scores: newAnswers,
            total_score: gad7Score,
          });
          persistQuestionnaireResult('gad7', newAnswers, gad7Score);
          logUserActivity('questionnaire_completed', { questionnaire_type: 'gad7' });
          setQuestionIndex(0);
          setFlowStep('score');
        }
      }
    }
  };

  const handleGameComplete = (metrics: GoNoGoMetrics | AttentionMetrics | MemoryMetrics | CountingMetrics) => {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ || !currentGameType) return;

    // Store metrics
    if (currentGameType === 'gonogo') setGoNoGoMetrics(metrics as GoNoGoMetrics);
    else if (currentGameType === 'attention') setAttentionMetrics(metrics as AttentionMetrics);
    else if (currentGameType === 'memory') setMemoryMetrics(metrics as MemoryMetrics);
    else if (currentGameType === 'counting') setCountingMetrics(metrics as CountingMetrics);

    // Store in map for this questionnaire
    setGameMetricsMap(prev => ({
      ...prev,
      [currentQ]: { type: currentGameType, metrics }
    }));

    saveGame({
      checkin_type: checkInType === 'full' ? 'guided' : 'individual',
      game_type: currentGameType,
      played: true,
      metrics,
    });
    logUserActivity('game_played', { game_type: currentGameType });

    setFlowStep('game-score');
  };

  const handleGameSkip = () => {
    // For full check-ins the game type is known from the sequence
    if (checkInType === 'full' && gameSequence.length > 0) {
      const gameType = gameSequence[currentQuestionnaireIndex];
      saveGame({ checkin_type: 'guided', game_type: gameType, played: false, metrics: null });
    }
    logUserActivity('game_skipped');
    moveToNextStep();
  };

  const handleJournalComplete = (entry: string, hashtags: string[], emotions: string[], media: { type: 'photo' | 'video', url: string } | null, prompt: string | null, moodIntensities?: { [emotion: string]: number }) => {
    setJournalEntries([...journalEntries, { entry, hashtags, emotions, media, prompt, moodIntensities }]);
    const wordCount = entry.trim().split(/\s+/).filter(w => w.length > 0).length;
    saveJournal({
      checkin_type: checkInType === 'full' ? 'guided' : 'individual',
      prompt_shown: prompt,
      prompt_type: prompt ? 'prompted' : 'freely_written',
      journal_text: entry,
      word_count: wordCount,
      has_image: !!media,
      emotions,
      mood_intensities: moodIntensities ?? {},
      hashtags,
    });
    logUserActivity('journal_written');
    logUserActivity(checkInType === 'full' ? 'guided_checkin_completed' : 'individual_checkin_completed');
    setFlowStep('complete');
  };

  const handleJournalSkip = () => {
    logUserActivity('journal_skipped');
    logUserActivity(checkInType === 'full' ? 'guided_checkin_completed' : 'individual_checkin_completed');
    setFlowStep('complete');
  };

  const moveToNextStep = () => {
    const isLastQuestionnaire = currentQuestionnaireIndex >= questionnaireSequence.length - 1;
    
    if (isLastQuestionnaire) {
      // All questionnaires done, show journal
      setFlowStep('journal');
    } else {
      // Move to next questionnaire
      setCurrentQuestionnaireIndex(prev => prev + 1);
      setFlowStep('transition');
    }
  };

  const handleCrisisModalContinue = () => {
    setShowCrisisResourcesModal(false);
  };

  const getQuestionnaireScore = (type: QuestionnaireType): number => {
    if (type === 'phq9') {
      return phq9Answers.reduce((a, b) => a + b, 0);
    } else if (type === 'pss') {
      return calculatePssScore(pssAnswers);
    } else if (type === 'rses') {
      return calculateRsesScore(rsesAnswers);
    } else if (type === 'gad7') {
      return gad7Answers.reduce((a, b) => a + b, 0);
    }
    return 0;
  };

  const getCurrentGameType = (): GameType => {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return 'gonogo';

    const gameType = gameMetricsMap[currentQ]?.type || 'gonogo';
    return gameType;
  };

  const getCurrentGameMetrics = () => {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return null;

    const metrics = gameMetricsMap[currentQ]?.metrics || null;
    return metrics;
  };

  // Type Selector
  if (flowStep === 'type-selector') {
    return <CheckInTypeSelector 
      onSelect={handleTypeSelect} 
      isDarkMode={isDarkMode} 
      onBack={onCancel || onComplete} 
      onNavigateToDayLog={onNavigateToDayLog}
      onNavigateToJournal={onNavigateToJournal}
    />;
  }

  // Completion
  if (flowStep === 'complete') {
    return (
      <CompletionSummary
        checkInType={checkInType!}
        phq9Answers={phq9Answers}
        pssAnswers={pssAnswers}
        rsesAnswers={rsesAnswers}
        gad7Answers={gad7Answers}
        goNoGoMetrics={goNoGoMetrics}
        attentionMetrics={attentionMetrics}
        memoryMetrics={memoryMetrics}
        countingMetrics={countingMetrics}
        journalEntries={journalEntries}
        functionalImpairment={functionalAnswer}
        isFirstCheckIn={isFirstCheckIn}
        onComplete={onComplete}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Score Screen
  if (flowStep === 'score') {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return null;

    const score = getQuestionnaireScore(currentQ);

    // Check if score indicates severe symptoms and automatically show crisis resources
    const shouldShowCrisisResources = 
      (currentQ === 'phq9' && score >= 20) ||  // Severe depression
      (currentQ === 'pss' && score >= 27) ||   // High stress
      (currentQ === 'rses' && score < 15) ||   // Low self-esteem
      (currentQ === 'gad7' && score >= 15);    // Severe anxiety

    if (shouldShowCrisisResources && !showCrisisResourcesModal) {
      return (
        <>
          <QuestionnaireScoreScreen
            type={currentQ}
            score={score}
            onContinue={() => {
              // For full check-in, use the unique game from the sequence
              // For single questionnaire, pick a random game
              if (checkInType === 'full' && gameSequence.length > 0) {
                setCurrentGameType(gameSequence[currentQuestionnaireIndex]);
              } else {
                setCurrentGameType(getRandomGameType());
              }
              setFlowStep('game');
            }}
            onSkipGame={() => {
              // Skip the game and move to the next step
              handleGameSkip();
            }}
            isDarkMode={isDarkMode}
          />
          <CrisisResourcesModal 
            onClose={() => setShowCrisisResourcesModal(true)} 
            isDarkMode={isDarkMode} 
          />
        </>
      );
    }

    return (
      <QuestionnaireScoreScreen
        type={currentQ}
        score={score}
        onContinue={() => {
          // For full check-in, use the unique game from the sequence
          // For single questionnaire, pick a random game
          if (checkInType === 'full' && gameSequence.length > 0) {
            setCurrentGameType(gameSequence[currentQuestionnaireIndex]);
          } else {
            setCurrentGameType(getRandomGameType());
          }
          setFlowStep('game');
        }}
        onSkipGame={() => {
          // Skip the game and move to the next step
          handleGameSkip();
        }}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Game Steps
  if (flowStep === 'game') {
    const gameType = currentGameType || getRandomGameType();
    
    if (gameType === 'gonogo') {
      return (
        <GoNoGoGame
          onComplete={handleGameComplete}
          isDarkMode={isDarkMode}
          onSkip={handleGameSkip}
        />
      );
    } else if (gameType === 'attention') {
      return (
        <AttentionGame
          onComplete={handleGameComplete}
          isDarkMode={isDarkMode}
          onSkip={handleGameSkip}
        />
      );
    } else if (gameType === 'memory') {
      return (
        <MemoryGame
          onComplete={handleGameComplete}
          isDarkMode={isDarkMode}
          onSkip={handleGameSkip}
        />
      );
    } else if (gameType === 'counting') {
      return (
        <CountingGame
          onComplete={handleGameComplete}
          isDarkMode={isDarkMode}
          onSkip={handleGameSkip}
        />
      );
    }
  }

  // Game Score Steps
  if (flowStep === 'game-score') {
    const metrics = getCurrentGameMetrics();
    if (metrics) {
      return (
        <GameScoreScreen
          gameType={getCurrentGameType()}
          metrics={metrics}
          onContinue={() => {
            moveToNextStep();
          }}
          isDarkMode={isDarkMode}
        />
      );
    }
  }

  // Journal Steps
  if (flowStep === 'journal') {
    return (
      <JournalPrompt
        onComplete={handleJournalComplete}
        onSkip={handleJournalSkip}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Transition Screens
  if (flowStep === 'transition') {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return null;

    return (
      <QuestionnaireTransition
        nextQuestionnaire={currentQ}
        onContinue={() => setFlowStep('questions')}
        isDarkMode={isDarkMode}
      />
    );
  }

  // Question Screens
  const getCurrentQuestion = () => {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return null;

    if (currentQ === 'phq9') {
      if (questionIndex < 9) {
        return phq9Questions[questionIndex];
      } else if (questionIndex === 9) {
        return functionalImpairmentQuestion;
      }
    } else if (currentQ === 'pss') {
      return pssQuestions[questionIndex];
    } else if (currentQ === 'rses') {
      return rsesQuestions[questionIndex];
    } else if (currentQ === 'gad7') {
      return gad7Questions[questionIndex];
    }
    return null;
  };

  const getQuestionProgress = () => {
    const currentQ = getCurrentQuestionnaire();
    if (!currentQ) return 0;

    if (currentQ === 'phq9') {
      return (questionIndex + 1) / 10;
    } else if (currentQ === 'pss') {
      return (questionIndex + 1) / 10;
    } else if (currentQ === 'rses') {
      return (questionIndex + 1) / 10;
    } else if (currentQ === 'gad7') {
      return (questionIndex + 1) / 7;
    }
    return 0;
  };

  const handleBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
      const currentQ = getCurrentQuestionnaire();
      if (!currentQ) return;

      if (currentQ === 'phq9') {
        setPhq9Answers(phq9Answers.slice(0, -1));
      } else if (currentQ === 'pss') {
        setPssAnswers(pssAnswers.slice(0, -1));
      } else if (currentQ === 'rses') {
        setRsesAnswers(rsesAnswers.slice(0, -1));
      } else if (currentQ === 'gad7') {
        setGad7Answers(gad7Answers.slice(0, -1));
      }
    } else {
      setFlowStep('type-selector');
      setQuestionIndex(0);
    }
  };

  const question = getCurrentQuestion();
  if (!question) return null;

  return (
    <QuestionScreen
      question={question}
      onAnswer={handleAnswer}
      progress={getQuestionProgress()}
      questionNumber={questionIndex + 1}
      onBack={handleBack}
      isDarkMode={isDarkMode}
    />
  );
}