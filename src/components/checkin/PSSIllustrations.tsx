import { motion } from 'motion/react';

interface PSSIllustrationProps {
  questionNumber: number;
  sliderPercentage: number;
  isDarkMode: boolean;
}

export function PSSIllustration({ questionNumber, sliderPercentage, isDarkMode }: PSSIllustrationProps) {
  const baseColor = isDarkMode ? '#ece5de' : '#8d654c';
  const accentColor = '#ffb757';
  const secondaryColor = '#ddc4af';

  // Color intensity based on stress level (higher = more stressed)
  const stressColor = sliderPercentage > 0.66 ? '#ff6b6b' : sliderPercentage > 0.33 ? accentColor : '#8dd38d';
  
  // Question 1: Upset by unexpected events - Person with surprise/shock expression
  if (questionNumber === 1) {
    const shockIntensity = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Unexpected event - lightning bolt */}
        <motion.path
          d="M140 40 L130 70 L145 70 L125 110"
          stroke={accentColor}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: sliderPercentage,
            opacity: sliderPercentage * 0.8,
            scale: 1 + shockIntensity * 0.3
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Person's head */}
        <circle cx="100" cy="90" r="28" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Eyes - widening with stress */}
        <motion.circle 
          cx="92" cy="85" 
          r={3 + shockIntensity * 4} 
          fill={baseColor}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3, repeat: shockIntensity > 0.5 ? Infinity : 0, repeatDelay: 0.5 }}
        />
        <motion.circle 
          cx="108" cy="85" 
          r={3 + shockIntensity * 4} 
          fill={baseColor}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3, repeat: shockIntensity > 0.5 ? Infinity : 0, repeatDelay: 0.5 }}
        />
        
        {/* Mouth - O shape when shocked */}
        <motion.ellipse
          cx="100" cy="100" 
          rx={4 + shockIntensity * 6} 
          ry={6 + shockIntensity * 8}
          fill="none"
          stroke={baseColor}
          strokeWidth="2"
        />
        
        {/* Stress lines around head */}
        {shockIntensity > 0.3 && (
          <>
            <motion.path d="M70 80 L65 75" stroke={stressColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.path d="M130 80 L135 75" stroke={stressColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} />
            <motion.path d="M75 65 L70 60" stroke={stressColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.6 }} />
          </>
        )}
        
        {/* Body */}
        <path d="M100 118 L100 160" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 130 L75 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <motion.path 
          d="M100 130 L125 150" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ rotate: shockIntensity > 0.5 ? [0, 5, -5, 0] : 0 }}
          style={{ originX: '100px', originY: '130px' }}
          transition={{ duration: 0.5, repeat: shockIntensity > 0.5 ? Infinity : 0 }}
        />
      </svg>
    );
  }

  // Question 2: Unable to control important things - Person juggling dropping balls
  if (questionNumber === 2) {
    const lossOfControl = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Person's head */}
        <circle cx="100" cy="80" r="25" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        <circle cx="93" cy="76" r="3" fill={baseColor} />
        <circle cx="107" cy="76" r="3" fill={baseColor} />
        <motion.path 
          d="M93 90 Q100 ${85 - lossOfControl * 8} 107 90" 
          stroke={baseColor} 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Body and arms reaching up */}
        <path d="M100 105 L100 145" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <motion.path 
          d="M100 115 L75 100" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ rotate: [-10, 10, -10] }}
          style={{ originX: '100px', originY: '115px' }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.path 
          d="M100 115 L125 100" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ rotate: [10, -10, 10] }}
          style={{ originX: '100px', originY: '115px' }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Balls falling/dropping */}
        <motion.circle 
          cx="75" 
          cy={70 + lossOfControl * 60}
          r="8" 
          fill={accentColor}
          fillOpacity="0.7"
          animate={{ y: [0, 60, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="125" 
          cy={75 + lossOfControl * 55}
          r="8" 
          fill={secondaryColor}
          fillOpacity="0.7"
          animate={{ y: [0, 55, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle 
          cx="100" 
          cy={60 + lossOfControl * 70}
          r="8" 
          fill={stressColor}
          fillOpacity="0.7"
          animate={{ y: [0, 70, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    );
  }

  // Question 3: Feeling nervous and stressed - Person with anxiety/tension
  if (questionNumber === 3) {
    const nervousness = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Head with tension */}
        <motion.circle 
          cx="100" cy="85" r="28" 
          fill={baseColor} 
          fillOpacity="0.2" 
          stroke={baseColor} 
          strokeWidth="2.5"
          animate={{ 
            scale: [1, 1 + nervousness * 0.05, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Worried eyes */}
        <path d="M88 78 Q93 75 98 78" stroke={baseColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M102 78 Q107 75 112 78" stroke={baseColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="93" cy="82" r="2.5" fill={baseColor} />
        <circle cx="107" cy="82" r="2.5" fill={baseColor} />
        
        {/* Stressed mouth */}
        <motion.path 
          d="M90 95 Q100 ${90 + nervousness * 5} 110 95" 
          stroke={baseColor} 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Stress waves around head */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx="100"
            cy="85"
            r={35 + i * 12}
            stroke={stressColor}
            strokeWidth="2"
            fill="none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, nervousness * 0.5, 0],
              scale: [0.8, 1.2, 1.4]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              delay: i * 0.4
            }}
          />
        ))}
        
        {/* Tense shoulders */}
        <motion.path 
          d="M100 113 L100 150" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ scaleY: [1, 0.95, 1] }}
          style={{ originY: '113px' }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <path d="M100 125 L75 140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 125 L125 140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Question 4: Confident handling problems - Person standing strong
  if (questionNumber === 4) {
    const confidence = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Head */}
        <circle cx="100" cy="85" r="26" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Confident eyes */}
        <circle cx="92" cy="82" r="3" fill={baseColor} />
        <circle cx="108" cy="82" r="3" fill={baseColor} />
        
        {/* Smile - bigger with more confidence */}
        <motion.path 
          d={`M88 93 Q100 ${93 + confidence * 8} 112 93`}
          stroke={baseColor} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Strong posture */}
        <path d="M100 111 L100 155" stroke={baseColor} strokeWidth="3.5" strokeLinecap="round" />
        
        {/* Arms in power pose */}
        <motion.path 
          d="M100 125 L70 115" 
          stroke={baseColor} 
          strokeWidth="3.5" 
          strokeLinecap="round"
          animate={{ rotate: confidence > 0.5 ? [0, -5, 0] : 0 }}
          style={{ originX: '100px', originY: '125px' }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.path 
          d="M100 125 L130 115" 
          stroke={baseColor} 
          strokeWidth="3.5" 
          strokeLinecap="round"
          animate={{ rotate: confidence > 0.5 ? [0, 5, 0] : 0 }}
          style={{ originX: '100px', originY: '125px' }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Success sparkles */}
        {confidence > 0.5 && (
          <>
            <motion.path d="M65 100 L70 100 M67.5 97.5 L67.5 102.5" stroke={accentColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <motion.path d="M130 105 L135 105 M132.5 102.5 L132.5 107.5" stroke={accentColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }} />
          </>
        )}
      </svg>
    );
  }

  // Question 5: Things going your way - Person walking with spring in step
  if (questionNumber === 5) {
    const positivity = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Head - happy */}
        <circle cx="100" cy="80" r="26" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        <circle cx="92" cy="77" r="3" fill={baseColor} />
        <circle cx="108" cy="77" r="3" fill={baseColor} />
        
        {/* Big smile */}
        <motion.path 
          d={`M87 88 Q100 ${88 + positivity * 10} 113 88`}
          stroke={baseColor} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Body walking */}
        <path d="M100 106 L100 145" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Swinging arms */}
        <motion.path 
          d="M100 118 L80 135" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ rotate: positivity > 0.3 ? [-15, 15, -15] : 0 }}
          style={{ originX: '100px', originY: '118px' }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        <motion.path 
          d="M100 118 L120 135" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ rotate: positivity > 0.3 ? [15, -15, 15] : 0 }}
          style={{ originX: '100px', originY: '118px' }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Path/road ahead */}
        <motion.path 
          d="M60 170 Q100 160 140 170" 
          stroke={secondaryColor} 
          strokeWidth="3" 
          strokeDasharray="10 5"
          strokeLinecap="round"
          fill="none"
          animate={{ strokeDashoffset: [0, -30, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Sun rays if things are going well */}
        {positivity > 0.5 && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.line
                key={i}
                x1="140"
                y1="50"
                x2="150"
                y2="45"
                stroke={accentColor}
                strokeWidth="2"
                strokeLinecap="round"
                style={{ originX: '140px', originY: '50px' }}
                transform={`rotate(${i * 30} 140 50)`}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </>
        )}
      </svg>
    );
  }

  // Question 6: Cannot cope with tasks - Person overwhelmed with papers/tasks
  if (questionNumber === 6) {
    const overwhelm = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Head - stressed */}
        <circle cx="100" cy="90" r="25" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        <circle cx="93" cy="87" r="2.5" fill={baseColor} />
        <circle cx="107" cy="87" r="2.5" fill={baseColor} />
        
        {/* Stressed mouth */}
        <path d="M90 98 Q100 95 110 98" stroke={baseColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Body hunched */}
        <motion.path 
          d="M100 115 L95 150" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ d: overwhelm > 0.5 ? "M100 115 L90 150" : "M100 115 L95 150" }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Arms overwhelmed */}
        <path d="M100 125 L75 130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 125 L125 130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Tasks/papers piling up */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.rect
            key={i}
            x={80 + i * 8 - overwhelm * 15}
            y={50 + i * 8}
            width="30"
            height="20"
            fill={i % 2 === 0 ? accentColor : secondaryColor}
            fillOpacity="0.6"
            stroke={baseColor}
            strokeWidth="1.5"
            rx="2"
            animate={{ 
              rotate: [0, overwhelm * (i % 2 === 0 ? 5 : -5), 0],
              y: [50 + i * 8, 50 + i * 8 - 2, 50 + i * 8]
            }}
            style={{ originX: `${95 + i * 8}px`, originY: `${60 + i * 8}px` }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </svg>
    );
  }

  // Question 7: Control irritations - Person staying calm with obstacles
  if (questionNumber === 7) {
    const control = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Head - calm */}
        <circle cx="100" cy="85" r="26" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Calm eyes */}
        <circle cx="92" cy="82" r="3" fill={baseColor} />
        <circle cx="108" cy="82" r="3" fill={baseColor} />
        
        {/* Neutral/slight smile */}
        <motion.path 
          d={`M90 94 Q100 ${94 + control * 4} 110 94`}
          stroke={baseColor} 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Body standing firm */}
        <path d="M100 111 L100 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 120 L80 135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 120 L120 135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Irritations bouncing off - shield */}
        {control > 0.3 && (
          <motion.path
            d="M100 85 Q85 70 85 50 Q85 40 100 35 Q115 40 115 50 Q115 70 100 85"
            stroke={accentColor}
            strokeWidth="2.5"
            fill={accentColor}
            fillOpacity="0.1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* Small irritations */}
        {[0, 1, 2].map((i) => (
          <motion.circle
            key={i}
            cx={60 + i * 40}
            cy={60 + i * 10}
            r="5"
            fill={stressColor}
            fillOpacity="0.5"
            animate={{ 
              x: control > 0.5 ? [-50, 50] : [0, 0],
              opacity: control > 0.5 ? [0.5, 0] : 0.5
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </svg>
    );
  }

  // Question 8: On top of things - Person on mountain peak
  if (questionNumber === 8) {
    const onTop = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Mountain peak */}
        <path 
          d="M50 160 L100 80 L150 160 Z" 
          fill={secondaryColor} 
          fillOpacity="0.3" 
          stroke={baseColor} 
          strokeWidth="2"
        />
        
        {/* Person at peak */}
        <motion.g
          animate={{ y: onTop > 0.5 ? [0, -3, 0] : 0 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle cx="100" cy="70" r="18" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2" />
          <circle cx="95" cy="67" r="2" fill={baseColor} />
          <circle cx="105" cy="67" r="2" fill={baseColor} />
          <motion.path 
            d={`M92 75 Q100 ${75 + onTop * 6} 108 75`}
            stroke={baseColor} 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Body */}
          <path d="M100 88 L100 115" stroke={baseColor} strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Victory arms */}
          <motion.path 
            d="M100 95 L85 85" 
            stroke={baseColor} 
            strokeWidth="2.5" 
            strokeLinecap="round"
            animate={{ rotate: onTop > 0.5 ? [0, 10, 0] : 0 }}
            style={{ originX: '100px', originY: '95px' }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.path 
            d="M100 95 L115 85" 
            stroke={baseColor} 
            strokeWidth="2.5" 
            strokeLinecap="round"
            animate={{ rotate: onTop > 0.5 ? [0, -10, 0] : 0 }}
            style={{ originX: '100px', originY: '95px' }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.g>
        
        {/* Flag at peak */}
        {onTop > 0.6 && (
          <motion.g
            animate={{ rotate: [-2, 2, -2] }}
            style={{ originX: '110px', originY: '65px' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <line x1="110" y1="65" x2="110" y2="45" stroke={baseColor} strokeWidth="2" />
            <path d="M110 45 L125 50 L110 55" fill={accentColor} fillOpacity="0.7" />
          </motion.g>
        )}
        
        {/* Clouds below */}
        <motion.ellipse cx="140" cy="140" rx="20" ry="8" fill="#ffffff" fillOpacity="0.5"
          animate={{ x: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }} />
        <motion.ellipse cx="65" cy="150" rx="18" ry="7" fill="#ffffff" fillOpacity="0.4"
          animate={{ x: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity }} />
      </svg>
    );
  }

  // Question 9: Angered by things outside control - Person with anger
  if (questionNumber === 9) {
    const anger = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Head - angry */}
        <motion.circle 
          cx="100" cy="90" r="28" 
          fill={baseColor} 
          fillOpacity="0.2" 
          stroke={baseColor} 
          strokeWidth="2.5"
          animate={{ 
            fill: anger > 0.6 ? '#ff6b6b' : baseColor,
            fillOpacity: anger > 0.6 ? 0.15 : 0.2
          }}
        />
        
        {/* Angry eyebrows */}
        <motion.path 
          d="M85 78 L95 81" 
          stroke={baseColor} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          animate={{ d: anger > 0.5 ? "M85 75 L95 80" : "M85 78 L95 81" }}
        />
        <motion.path 
          d="M105 81 L115 78" 
          stroke={baseColor} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          animate={{ d: anger > 0.5 ? "M105 80 L115 75" : "M105 81 L115 78" }}
        />
        
        {/* Angry eyes */}
        <circle cx="92" cy="87" r="3" fill={baseColor} />
        <circle cx="108" cy="87" r="3" fill={baseColor} />
        
        {/* Frown */}
        <path d="M88 103 Q100 98 112 103" stroke={baseColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        
        {/* Body - tense */}
        <path d="M100 118 L100 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Clenched fists */}
        <motion.circle 
          cx="75" cy="135" r="7" 
          fill={baseColor} 
          fillOpacity="0.3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <motion.circle 
          cx="125" cy="135" r="7" 
          fill={baseColor} 
          fillOpacity="0.3"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
        />
        <path d="M100 128 L75 135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 128 L125 135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Anger symbols */}
        {anger > 0.4 && (
          <>
            <motion.text x="130" y="85" fontSize="20" fill="#ff6b6b"
              animate={{ opacity: [0, 1, 0], y: [85, 75, 65] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              #
            </motion.text>
            <motion.text x="60" y="90" fontSize="18" fill="#ff6b6b"
              animate={{ opacity: [0, 1, 0], y: [90, 80, 70] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
              !
            </motion.text>
          </>
        )}
      </svg>
    );
  }

  // Question 10: Difficulties piling up - Person buried under pile
  if (questionNumber === 10) {
    const overwhelmed = sliderPercentage;
    return (
      <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none">
        {/* Person's head peeking out */}
        <motion.circle 
          cx="100" 
          cy={140 - overwhelmed * 40} 
          r="22" 
          fill={baseColor} 
          fillOpacity="0.2" 
          stroke={baseColor} 
          strokeWidth="2"
        />
        <motion.circle cx="94" cy={138 - overwhelmed * 40} r="2.5" fill={baseColor} />
        <motion.circle cx="106" cy={138 - overwhelmed * 40} r="2.5" fill={baseColor} />
        <motion.path 
          d={`M92 ${147 - overwhelmed * 40} Q100 ${145 - overwhelmed * 40} 108 ${147 - overwhelmed * 40}`}
          stroke={baseColor} 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Pile of difficulties/problems */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.rect
            key={i}
            x={60 + (i % 3) * 25}
            y={90 + Math.floor(i / 3) * 25}
            width="28"
            height="22"
            fill={i % 3 === 0 ? '#ff6b6b' : i % 3 === 1 ? accentColor : secondaryColor}
            fillOpacity="0.6"
            stroke={baseColor}
            strokeWidth="1.5"
            rx="3"
            initial={{ y: -50, opacity: 0 }}
            animate={{ 
              y: 90 + Math.floor(i / 3) * 25,
              opacity: i <= overwhelmed * 7 ? 0.6 : 0.2
            }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          />
        ))}
        
        {/* Stress indicators if highly overwhelmed */}
        {overwhelmed > 0.7 && (
          <>
            <motion.path d="M65 120 L60 115" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.path d="M135 125 L140 120" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} />
          </>
        )}
      </svg>
    );
  }

  return null;
}
