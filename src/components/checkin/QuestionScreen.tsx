import { useState, useRef, useLayoutEffect } from 'react';
import { motion, useSpring } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { Question } from '../../data/checkInQuestions';
import { CIDTStyleIllustration } from './CIDTStyleIllustration';
import { SemanticIllustration } from './SemanticIllustrations';
import { RSESIllustration } from './RSESIllustrations';
import { PSSIllustration } from './PSSIllustrations';
import { GAD7Illustration } from './GAD7Illustrations';
import { getQuoteForQuestion } from '../../data/supportiveQuotes';

interface QuestionScreenProps {
  question: Question;
  onAnswer: (value: number) => void;
  progress: number;
  questionNumber: number | null;
  onBack: () => void;
  isDarkMode: boolean;
}

export function QuestionScreen({ question, onAnswer, progress, questionNumber, onBack, isDarkMode }: QuestionScreenProps) {
  const [value, setValue] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(true); // Changed to true so button is active from start
  const [isDragging, setIsDragging] = useState(false);
  const [supportiveQuote] = useState(getQuoteForQuestion(question.text));
  const sliderRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevent window scroll while this screen is active
  useLayoutEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Reset slider and scroll position when question changes (before paint)
  useLayoutEffect(() => {
    setValue(0);
    setHasInteracted(true);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [question.id]);

  // Use spring animation for smoother movement
  const springValue = useSpring(value, { stiffness: 200, damping: 25 });

  // Get unique animation variant based on question number
  const getAnimationVariant = () => {
    if (!questionNumber) return 'default';
    
    const variants = [
      'slideRight',    // Q1: Slide from right
      'slideLeft',     // Q2: Slide from left
      'scaleRotate',   // Q3: Scale + rotate
      'bounce',        // Q4: Bounce effect
      'fadeUp',        // Q5: Fade + up
      'flip',          // Q6: 3D flip
      'elastic',       // Q7: Elastic spring
      'wave',          // Q8: Wave effect
      'zoom',          // Q9: Zoom in
    ];
    
    return variants[(questionNumber - 1) % variants.length];
  };

  const animationVariant = getAnimationVariant();

  // Define unique animation variants
  const containerVariants = {
    slideRight: {
      initial: { opacity: 0, x: 100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -100 },
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    },
    slideLeft: {
      initial: { opacity: 0, x: -100 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 100 },
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    },
    scaleRotate: {
      initial: { opacity: 0, scale: 0.5, rotate: -10 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      exit: { opacity: 0, scale: 0.5, rotate: 10 },
      transition: { type: 'spring', stiffness: 150, damping: 15 }
    },
    bounce: {
      initial: { opacity: 0, y: -50 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 50 },
      transition: { type: 'spring', stiffness: 300, damping: 15, bounce: 0.5 }
    },
    fadeUp: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 },
      transition: { type: 'tween', duration: 0.5, ease: 'easeOut' }
    },
    flip: {
      initial: { opacity: 0, rotateY: 90 },
      animate: { opacity: 1, rotateY: 0 },
      exit: { opacity: 0, rotateY: -90 },
      transition: { type: 'spring', stiffness: 120, damping: 20 }
    },
    elastic: {
      initial: { opacity: 0, scale: 0.3 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.3 },
      transition: { type: 'spring', stiffness: 200, damping: 10 }
    },
    wave: {
      initial: { opacity: 0, x: -20, y: 20 },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, x: 20, y: -20 },
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    },
    zoom: {
      initial: { opacity: 0, scale: 1.5 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
      transition: { type: 'spring', stiffness: 150, damping: 20 }
    },
    default: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
      transition: { duration: 0.3 }
    }
  };

  const currentVariant = containerVariants[animationVariant as keyof typeof containerVariants];

  const maxValue = question.options.length - 1;

  // Snap value to nearest discrete position (0, 1, 2, 3)
  const snapToNearest = (rawValue: number) => {
    return Math.round(Math.max(0, Math.min(maxValue, rawValue)));
  };

  const handleSliderInteraction = (clientX: number) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const rawValue = percentage * maxValue;
    
    // Allow continuous movement (no snapping during drag)
    setValue(rawValue);
    setHasInteracted(true);
  };

  // Snap to nearest discrete value
  const snapToNearestValue = () => {
    const snappedValue = snapToNearest(value);
    setValue(snappedValue);
  };

  // Handle scroll wheel for smooth scrolling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Determine scroll direction (negative = scroll up/left, positive = scroll down/right)
    const delta = e.deltaY > 0 ? 1 : -1;
    const newValue = snapToNearest(value + delta);
    
    if (newValue !== value) {
      setValue(newValue);
      setHasInteracted(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleSliderInteraction(e.clientX);
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      snapToNearestValue();
    }
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    handleSliderInteraction(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderInteraction(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      snapToNearestValue();
    }
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      handleSliderInteraction(e.clientX);
      // Small delay to allow the value to update before snapping
      setTimeout(() => {
        snapToNearestValue();
      }, 0);
    }
  };

  const handleContinue = () => {
    // Round to nearest integer when submitting
    onAnswer(Math.round(value));
  };

  // Calculate person state based on slider value
  const sliderPercentage = value / maxValue;

  // Slider position (use spring value for smooth animation)
  const sliderPosition = (value / maxValue) * 100;

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className={`px-5 pt-3 pb-1.5 flex-shrink-0 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'}`}>
        <div className="flex items-center justify-between mb-1.5">
          <button
            onClick={onBack}
            className={`w-9 h-9 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <ArrowLeft className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
          </button>
          
          <div className={`text-xs font-medium ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
            {questionNumber && question.id?.startsWith('phq9-') && `${question.category} • ${questionNumber} of 9`}
            {questionNumber && question.id?.startsWith('rses-') && `${question.category} • ${questionNumber} of 10`}
            {questionNumber && question.id?.startsWith('pss-') && `${question.category} • ${questionNumber} of 10`}
            {questionNumber && question.id?.startsWith('gad7-') && `${question.category} • ${questionNumber} of 7`}
            {!questionNumber && question.category}
          </div>
        </div>

        {/* Progress bar */}
        <div className={`h-1 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/40'} rounded-full overflow-hidden`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-[#ffb757]"
          />
        </div>
      </div>

      {/* Main Content - Scrollable, vertical only */}
      <div ref={contentRef} className="flex-1 overflow-y-auto overflow-x-hidden px-5 pt-2 pb-24" style={{ touchAction: 'pan-y', overscrollBehaviorX: 'none' }}>
        <div className="flex flex-col">
          <div className="flex-shrink-0">
            {/* Timeframe */}
            {question.timeframe && (
              <motion.div
                {...currentVariant}
                className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mb-1.5`}
              >
                {question.timeframe}
              </motion.div>
            )}

            {/* Question Text */}
            <motion.h2
              initial={currentVariant.initial}
              animate={currentVariant.animate}
              transition={{ ...currentVariant.transition, delay: 0.1 }}
              className={`text-[18px] font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2 leading-snug`}
            >
              {question.text}
            </motion.h2>

            {/* Illustration - Centered with compact space */}
            <motion.div
              initial={currentVariant.initial}
              animate={currentVariant.animate}
              transition={{ ...currentVariant.transition, delay: 0.2 }}
              className="flex justify-center items-center mb-3 h-36 flex-shrink-0 overflow-hidden"
            >
              {question.id?.startsWith('phq9-') && questionNumber ? (
                <SemanticIllustration 
                  questionNumber={questionNumber}
                  sliderPercentage={sliderPercentage}
                  isDarkMode={isDarkMode}
                />
              ) : question.id?.startsWith('rses-') && questionNumber ? (
                <RSESIllustration 
                  questionNumber={questionNumber}
                  sliderPercentage={sliderPercentage}
                  isDarkMode={isDarkMode}
                  isReversed={question.reverseScore || false}
                />
              ) : question.id?.startsWith('pss-') && questionNumber ? (
                <PSSIllustration 
                  questionNumber={questionNumber}
                  sliderPercentage={sliderPercentage}
                  isDarkMode={isDarkMode}
                />
              ) : question.id?.startsWith('gad7-') && questionNumber ? (
                <GAD7Illustration 
                  questionNumber={questionNumber}
                  sliderPercentage={sliderPercentage}
                  isDarkMode={isDarkMode}
                />
              ) : (
                <CIDTStyleIllustration 
                  questionText={question.text}
                  sliderPercentage={sliderPercentage}
                  isDarkMode={isDarkMode}
                />
              )}
            </motion.div>
          </div>

          {/* Slider + Labels + Quote - Grouped as single interaction unit */}
          <div className="flex-shrink-0">
            {/* Slider Section */}
            <motion.div
              initial={currentVariant.initial}
              animate={currentVariant.animate}
              transition={{ ...currentVariant.transition, delay: 0.3 }}
              className="mb-1"
            >
              {/* Helper text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-center text-sm ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} mb-2`}
              >
                Slide to select
              </motion.p>

              {/* Slider track wrapper with interaction handlers */}
              <div
                ref={sliderRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
                onWheel={handleWheel}
                className="relative h-4 rounded-full cursor-pointer mx-4"
                style={{
                  background: 'linear-gradient(to right, #ffb757 0%, #ddc4af 50%, #8d654c 100%)',
                  touchAction: 'none'
                }}
              >
                {/* Slider thumb */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center"
                  style={{
                    left: `${sliderPosition}%`,
                    x: '-50%',
                    border: '3px solid #ffb757',
                    boxShadow: isDragging ? '0 8px 20px rgba(255, 183, 87, 0.5)' : '0 4px 12px rgba(255, 183, 87, 0.3)'
                  }}
                  animate={{
                    scale: isDragging ? 1.2 : 1
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {/* Small indicator dot */}
                  <div className="w-2.5 h-2.5 bg-[#ffb757] rounded-full" />
                </motion.div>
              </div>
            </motion.div>

            {/* Option labels */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-4 relative"
            >
              <div className="relative mx-4">
                {question.options.map((option, index) => {
                  const optionPercentage = index / maxValue;
                  const distance = Math.abs(sliderPercentage - optionPercentage);
                  const isNear = distance < 0.15;
                  const isActive = distance < 0.08;
                  
                  // Calculate exact position to align with slider positions
                  const optionPosition = (index / maxValue) * 100;
                  
                  return (
                    <div
                      key={index}
                      className="absolute flex flex-col items-center justify-start"
                      style={{
                        left: `${optionPosition}%`,
                        transform: 'translateX(-50%)',
                        width: 'max-content',
                        maxWidth: `${Math.floor(96 / maxValue)}%`
                      }}
                    >
                      {/* Indicator dot */}
                      <motion.div
                        animate={{
                          scale: isNear ? 1.4 : 1,
                          opacity: isNear ? 1 : 0.3
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`w-1.5 h-1.5 rounded-full mb-2 ${
                          isActive ? 'bg-[#ffb757]' : isDarkMode ? 'bg-[#ece5de]/40' : 'bg-[#8d654c]/40'
                        }`}
                      />
                      {/* Label text */}
                      <motion.div
                        animate={{
                          scale: isNear ? 1.08 : 1,
                          y: isActive ? -2 : 0
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`text-[11px] font-medium transition-all duration-200 text-center leading-tight ${
                          isActive
                            ? `${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} font-semibold`
                            : isNear
                            ? isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'
                            : isDarkMode ? 'text-[#ece5de]/35' : 'text-[#8d654c]/35'
                        }`}
                      >
                        {option}
                      </motion.div>
                    </div>
                  );
                })}
                {/* Spacer to maintain height */}
                <div className="h-14 w-full" />
              </div>
            </motion.div>

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="pb-4 flex-shrink-0"
            >
              <button
                onClick={handleContinue}
                disabled={!hasInteracted}
                className={`w-full py-4 rounded-2xl font-semibold text-base transition-all ${
                  hasInteracted
                    ? 'bg-[#ffb757] text-white shadow-lg shadow-[#ffb757]/20 active:scale-[0.98]'
                    : isDarkMode ? 'bg-[#ece5de]/10 text-[#ece5de]/30 cursor-not-allowed' : 'bg-[#8d654c]/10 text-[#8d654c]/30 cursor-not-allowed'
                }`}
              >
                {hasInteracted ? 'Continue' : 'Please slide to select'}
              </button>
            </motion.div>

            {/* Supportive Quote - Below continue button */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`text-center px-4 mb-4 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#8d654c]'}`}
            >
              <div className={`text-[14px] font-medium leading-snug ${isDarkMode ? 'text-[#ffb757]/85' : 'text-[#8d654c]/85'}`}>
                "{supportiveQuote.text}"
              </div>
              <div className={`text-[12px] mt-1 ${isDarkMode ? 'text-[#ddc4af]/70' : 'text-[#8d654c]/60'}`}>
                — {supportiveQuote.author}
              </div>
            </motion.div>
          </div>

          {/* Decorative Bottom Section - Reduced */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex-1 flex items-end justify-center pb-8 relative overflow-hidden min-h-[80px]"
          >
            {/* Floating decorative elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Circle 1 */}
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-24 h-24 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${isDarkMode ? '#ffb757' : '#ddc4af'}, transparent)`,
                  left: '15%',
                  top: '20%'
                }}
              />
              
              {/* Circle 2 */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute w-32 h-32 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${isDarkMode ? '#ddc4af' : '#ffb757'}, transparent)`,
                  right: '20%',
                  top: '40%'
                }}
              />

              {/* Subtle affirmation text */}
              <motion.div
                animate={{
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`text-center text-xs ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'} px-8`}
              >
                Take your time • Your feelings are valid
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}