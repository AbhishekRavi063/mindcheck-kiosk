import { motion } from 'motion/react';

interface RSESIllustrationProps {
  questionNumber: number;
  sliderPercentage: number; // 0 to 1
  isDarkMode: boolean;
  isReversed: boolean; // Whether this is a reverse-scored question
}

export function RSESIllustration({ 
  questionNumber, 
  sliderPercentage, 
  isDarkMode,
  isReversed 
}: RSESIllustrationProps) {
  const baseColor = isDarkMode ? '#ece5de' : '#8d654c';
  const accentColor = '#ffb757';
  const bgAccent = isDarkMode ? '#2a2218' : '#ddc4af';

  // Animation logic:
  // - Animations show: LOW percentage (0) = negative visuals, HIGH percentage (1) = positive visuals
  // 
  // For NON-reversed questions (e.g., "I feel I'm a person of worth"):
  //   - Strongly agree (slider=0) = HIGH self-esteem → needs HIGH visual (1)
  //   - Strongly disagree (slider=1) = LOW self-esteem → needs LOW visual (0)
  //   - Formula: visualPercentage = 1 - sliderPercentage
  // 
  // For REVERSED questions (e.g., "I feel like a failure"):
  //   - Strongly agree (slider=0) = LOW self-esteem → needs LOW visual (0)
  //   - Strongly disagree (slider=1) = HIGH self-esteem → needs HIGH visual (1)
  //   - Formula: visualPercentage = sliderPercentage (no inversion)
  const visualPercentage = isReversed ? sliderPercentage : (1 - sliderPercentage);
  
  switch (questionNumber) {
    case 1: // Person of worth - equal with others
      return <WorthIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 2: // Good qualities
      return <QualitiesIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 3: // Feeling like a failure (REVERSED)
      return <FailureIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 4: // Able to do things as well as others
      return <CapabilityIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 5: // Nothing to be proud of (REVERSED)
      return <PrideIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 6: // Positive attitude toward self
      return <PositiveAttitudeIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 7: // Satisfied with self
      return <SatisfactionIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 8: // Wish for more respect (REVERSED)
      return <SelfRespectIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 9: // Feel useless (REVERSED)
      return <UsefulnessIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    case 10: // Think I'm no good (REVERSED)
      return <SelfGoodnessIllustration percentage={visualPercentage} baseColor={baseColor} accentColor={accentColor} />;
    
    default:
      return null;
  }
}

// Q1: Worth - Person standing equal with others
function WorthIllustration({ percentage, baseColor, accentColor }: any) {
  const platformHeight = 10 + (percentage * 15); // Person rises on platform
  const crownOpacity = percentage * 0.8;
  const glowIntensity = percentage;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Other people at equal level */}
      <g opacity="0.4">
        <circle cx="50" cy="100" r="10" fill={baseColor} />
        <line x1="50" y1="110" x2="50" y2="130" stroke={baseColor} strokeWidth="2.5" />
        
        <circle cx="150" cy="100" r="10" fill={baseColor} />
        <line x1="150" y1="110" x2="150" y2="130" stroke={baseColor} strokeWidth="2.5" />
      </g>

      {/* Platform/pedestal */}
      <motion.rect 
        x="85" 
        y={130 - platformHeight} 
        width="30" 
        height={platformHeight}
        fill={accentColor} 
        opacity={0.2}
        rx="2"
        animate={{ height: platformHeight }}
        transition={{ duration: 0.3 }}
      />

      {/* Main person */}
      <motion.g animate={{ y: -platformHeight }}>
        {/* Glow effect */}
        <motion.circle 
          cx="100" cy="95" r="20" 
          fill={accentColor} 
          opacity={glowIntensity * 0.15}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        
        <circle cx="100" cy="95" r="12" fill={baseColor} />
        <circle cx="96" cy="93" r="2" fill={baseColor} opacity="0.8" />
        <circle cx="104" cy="93" r="2" fill={baseColor} opacity="0.8" />
        
        <motion.path 
          d="M 95 100 Q 100 103 105 100"
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
        />
        
        <line x1="100" y1="107" x2="100" y2="130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 111 L 85 116" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 111 L 115 116" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Crown/worth symbol */}
      <motion.g opacity={crownOpacity}>
        <path 
          d="M 90 75 L 95 85 L 100 78 L 105 85 L 110 75 L 108 88 L 92 88 Z" 
          fill={accentColor} 
          opacity="0.5"
        />
      </motion.g>
    </svg>
  );
}

// Q2: Good qualities - Person with stars/achievements
function QualitiesIllustration({ percentage, baseColor, accentColor }: any) {
  const starCount = Math.floor(1 + (percentage * 4));
  const sparkleIntensity = percentage;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Stars representing qualities */}
      {Array.from({ length: starCount }).map((_, i) => {
        const angle = (i / starCount) * Math.PI * 2 - Math.PI / 2;
        const radius = 35 + (percentage * 5);
        const x = 100 + Math.cos(angle) * radius;
        const y = 95 + Math.sin(angle) * radius;
        
        return (
          <motion.g key={i}>
            <motion.path
              d={`M ${x} ${y - 5} L ${x + 1.5} ${y - 1} L ${x + 5} ${y} L ${x + 1.5} ${y + 1} L ${x} ${y + 5} L ${x - 1.5} ${y + 1} L ${x - 5} ${y} L ${x - 1.5} ${y - 1} Z`}
              fill={accentColor}
              opacity={0.6}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            />
            <motion.circle
              cx={x} cy={y} r="2"
              fill={accentColor}
              opacity={sparkleIntensity * 0.8}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
            />
          </motion.g>
        );
      })}

      {/* Person */}
      <circle cx="100" cy="95" r="12" fill={baseColor} />
      <circle cx="96" cy="93" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="104" cy="93" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 95 100 Q 100 103 105 100"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="100" y1="107" x2="100" y2="130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Arms raised in celebration */}
      <motion.path
        d={`M 100 111 L 85 ${95 + (percentage * 5)}`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ d: `M 100 111 L 85 ${95 + (percentage * 5)}` }}
        transition={{ duration: 0.3 }}
      />
      <motion.path
        d={`M 100 111 L 115 ${95 + (percentage * 5)}`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ d: `M 100 111 L 115 ${95 + (percentage * 5)}` }}
        transition={{ duration: 0.3 }}
      />
      
      <path d="M 100 130 L 90 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 130 L 110 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q3: Failure feelings (reversed) - Person with obstacles/achievements
function FailureIllustration({ percentage, baseColor, accentColor }: any) {
  const obstacleOpacity = 1 - percentage; // Obstacles fade when feeling is disagreed with
  const pathOpacity = percentage * 0.7;
  const finishLineReached = percentage > 0.7;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Path/journey */}
      <motion.path
        d="M 40 130 Q 80 110, 120 120 Q 150 125, 170 115"
        stroke={accentColor}
        strokeWidth="3"
        strokeDasharray="5 5"
        fill="none"
        opacity={pathOpacity}
      />

      {/* Finish flag */}
      <motion.g opacity={percentage}>
        <line x1="170" y1="115" x2="170" y2="95" stroke={accentColor} strokeWidth="2" />
        <motion.path
          d="M 170 95 L 185 100 L 170 105 Z"
          fill={accentColor}
          opacity="0.5"
          animate={finishLineReached ? { x: [0, 3, 0] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </motion.g>

      {/* Obstacles (fade out) */}
      <motion.g opacity={obstacleOpacity}>
        <rect x="100" y="115" width="8" height="15" fill={baseColor} opacity="0.3" />
        <rect x="140" y="120" width="8" height="12" fill={baseColor} opacity="0.3" />
      </motion.g>

      {/* Person moving forward */}
      <motion.g 
        animate={{ x: percentage * 40 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      >
        <circle cx="70" cy="110" r="12" fill={baseColor} />
        <circle cx="66" cy="108" r="2" fill={baseColor} opacity="0.8" />
        <circle cx="74" cy="108" r="2" fill={baseColor} opacity="0.8" />
        
        <motion.path 
          d="M 65 115 Q 70 117 75 115"
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
        />
        
        <line x1="70" y1="122" x2="70" y2="140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Running pose */}
        <path d="M 70 126 L 60 132" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 126 L 82 130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 140 L 62 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 140 L 78 152" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

// Q4: Capability - Person accomplishing tasks
function CapabilityIllustration({ percentage, baseColor, accentColor }: any) {
  const checkmarkCount = Math.floor(percentage * 3);
  const toolsVisible = percentage > 0.4;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Task checklist */}
      {[0, 1, 2].map((i) => (
        <g key={i} opacity={i < checkmarkCount ? 0.6 : 0.2}>
          <rect x="120" y={75 + i * 18} width="50" height="12" fill={baseColor} opacity="0.1" rx="2" />
          {i < checkmarkCount && (
            <motion.path
              d={`M 128 ${81 + i * 18} L 132 ${85 + i * 18} L 138 ${77 + i * 18}`}
              stroke={accentColor}
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: i * 0.2 }}
            />
          )}
        </g>
      ))}

      {/* Tools */}
      {toolsVisible && (
        <motion.g 
          opacity={percentage}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <line x1="145" y1="125" x2="155" y2="135" stroke={accentColor} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          <circle cx="157" cy="137" r="4" fill={accentColor} opacity="0.4" />
        </motion.g>
      )}

      {/* Person */}
      <circle cx="80" cy="100" r="12" fill={baseColor} />
      <circle cx="76" cy="98" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="84" cy="98" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 75 105 Q 80 107 85 105"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="80" y1="112" x2="80" y2="135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Arm pointing to accomplishments */}
      <motion.path
        d={`M 80 116 L ${100 + percentage * 10} ${110 + percentage * 5}`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M 80 116 L 65 120" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      <path d="M 80 135 L 70 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 80 135 L 90 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q5: Pride (reversed) - Person with achievements/trophies
function PrideIllustration({ percentage, baseColor, accentColor }: any) {
  const trophySize = 0.8 + (percentage * 0.4);
  const ribbonCount = Math.floor(percentage * 3);

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Trophy */}
      <motion.g 
        opacity={percentage * 0.7}
        animate={{ scale: trophySize, y: percentage > 0.5 ? [0, -3, 0] : 0 }}
        style={{ originX: '145px', originY: '110px' }}
        transition={{ repeat: percentage > 0.5 ? Infinity : 0, duration: 2 }}
      >
        <path 
          d="M 135 100 L 135 110 Q 145 115 155 110 L 155 100 Z" 
          fill={accentColor} 
          opacity="0.4"
        />
        <rect x="142" y="110" width="6" height="8" fill={accentColor} opacity="0.3" />
        <rect x="138" y="118" width="14" height="3" fill={accentColor} opacity="0.4" />
      </motion.g>

      {/* Achievement ribbons/medals */}
      {Array.from({ length: ribbonCount }).map((_, i) => (
        <motion.g 
          key={i}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 0.5 }}
          transition={{ duration: 0.4, delay: i * 0.15 }}
        >
          <circle cx={125 + i * 15} cy="70" r="6" fill={accentColor} opacity="0.5" />
          <line x1={125 + i * 15} y1="76" x2={125 + i * 15} y2="85" stroke={accentColor} strokeWidth="2" opacity="0.4" />
        </motion.g>
      ))}

      {/* Person */}
      <circle cx="75" cy="105" r="12" fill={baseColor} />
      <circle cx="71" cy="103" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="79" cy="103" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 70 110 Q 75 113 80 110"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="75" y1="117" x2="75" y2="140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 121 L 60 126" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Arm gesturing to achievements */}
      <motion.path
        d={`M 75 121 L ${95 + percentage * 15} ${108 + percentage * 5}`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <path d="M 75 140 L 65 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 140 L 85 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q6: Positive attitude - Person with sun/positive symbols
function PositiveAttitudeIllustration({ percentage, baseColor, accentColor }: any) {
  const sunBrightness = percentage;
  const positiveSymbolsCount = Math.floor(percentage * 4);

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Sun */}
      <motion.g opacity={sunBrightness}>
        <circle cx="150" cy="70" r="12" fill={accentColor} opacity="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + Math.cos(rad) * 16;
          const y1 = 70 + Math.sin(rad) * 16;
          const x2 = 150 + Math.cos(rad) * 22;
          const y2 = 70 + Math.sin(rad) * 22;
          return (
            <motion.line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={accentColor}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.4"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.1 }}
            />
          );
        })}
      </motion.g>

      {/* Positive symbols (hearts, plus signs) */}
      {Array.from({ length: positiveSymbolsCount }).map((_, i) => {
        const x = 120 + (i % 2) * 25;
        const y = 100 + Math.floor(i / 2) * 20;
        return (
          <motion.g
            key={i}
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <path
              d={`M ${x} ${y} L ${x + 3} ${y - 3} L ${x + 6} ${y} L ${x + 3} ${y + 3} Z`}
              fill={accentColor}
              opacity="0.4"
            />
          </motion.g>
        );
      })}

      {/* Person with open, positive posture */}
      <circle cx="70" cy="95" r="12" fill={baseColor} />
      <circle cx="66" cy="93" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="74" cy="93" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 65 100 Q 70 103 75 100"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="70" y1="107" x2="70" y2="130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Arms open wide */}
      <motion.path
        d={`M 70 111 L ${50 - percentage * 5} ${110 + percentage * 3}`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <motion.path
        d={`M 70 111 L ${90 + percentage * 5} ${110 + percentage * 3}`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <path d="M 70 130 L 60 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 130 L 80 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q7: Satisfaction - Person in comfortable, content state
function SatisfactionIllustration({ percentage, baseColor, accentColor }: any) {
  const heartScale = 0.7 + (percentage * 0.5);
  const contentmentGlow = percentage;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Contentment glow */}
      <motion.circle 
        cx="100" cy="100" r="40" 
        fill={accentColor} 
        opacity={contentmentGlow * 0.1}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      />

      {/* Heart symbol */}
      <motion.g 
        opacity={percentage * 0.6}
        animate={{ scale: heartScale }}
        style={{ originX: '140px', originY: '85px' }}
      >
        <path
          d="M 140 95 C 140 88, 146 84, 150 88 C 154 84, 160 88, 160 95 C 160 102, 150 110, 150 110 C 150 110, 140 102, 140 95"
          fill={accentColor}
          opacity="0.4"
        />
        <motion.path
          d="M 140 95 C 140 88, 146 84, 150 88 C 154 84, 160 88, 160 95 C 160 102, 150 110, 150 110 C 150 110, 140 102, 140 95"
          fill="none"
          stroke={accentColor}
          strokeWidth="2"
          opacity="0.5"
          animate={{ scale: [1, 1.2, 1] }}
          style={{ originX: '150px', originY: '97px' }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </motion.g>

      {/* Peaceful flowers/nature */}
      <motion.g opacity={percentage * 0.5}>
        <circle cx="130" cy="135" r="3" fill={accentColor} opacity="0.4" />
        <line x1="130" y1="135" x2="130" y2="145" stroke={accentColor} strokeWidth="2" opacity="0.3" />
        
        <circle cx="145" cy="138" r="2.5" fill={accentColor} opacity="0.4" />
        <line x1="145" y1="138" x2="145" y2="145" stroke={accentColor} strokeWidth="1.5" opacity="0.3" />
      </motion.g>

      {/* Person in peaceful pose */}
      <circle cx="100" cy="100" r="12" fill={baseColor} />
      
      {/* Closed, content eyes */}
      <motion.line 
        x1="96" y1="98" x2="100" y2="98" 
        stroke={baseColor} 
        strokeWidth="2" 
        strokeLinecap="round"
        animate={{ scaleX: [1, 0.8, 1] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      <motion.line 
        x1="100" y1="98" x2="104" y2="98" 
        stroke={baseColor} 
        strokeWidth="2" 
        strokeLinecap="round"
        animate={{ scaleX: [1, 0.8, 1] }}
        transition={{ repeat: Infinity, duration: 4 }}
      />
      
      <motion.path 
        d="M 95 105 Q 100 108 105 105"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="100" y1="112" x2="100" y2="135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 116 L 85 121" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 116 L 115 121" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 135 L 90 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 135 L 110 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q8: Self-respect (reversed) - Person with mirror showing respect
function SelfRespectIllustration({ percentage, baseColor, accentColor }: any) {
  const respectSymbolOpacity = percentage;
  const mirrorClarity = percentage;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Mirror with clear reflection */}
      <motion.rect 
        x="125" y="75" width="45" height="60" 
        fill={baseColor} 
        opacity={mirrorClarity * 0.15}
        rx="4" 
        stroke={baseColor} 
        strokeWidth="2" 
        strokeOpacity={0.25}
      />
      
      {/* Reflection showing dignity */}
      <motion.g opacity={mirrorClarity * 0.5}>
        <circle cx="147" cy="105" r="10" fill={baseColor} />
        <circle cx="144" cy="103" r="1.5" fill={baseColor} />
        <circle cx="150" cy="103" r="1.5" fill={baseColor} />
        <path d="M 143 109 Q 147 111 151 109" stroke={baseColor} strokeWidth="1.5" fill="none" />
      </motion.g>

      {/* Respect symbol (bow/honor gesture) */}
      <motion.g opacity={respectSymbolOpacity}>
        <path 
          d="M 145 90 Q 147 85 149 90" 
          stroke={accentColor} 
          strokeWidth="2.5" 
          fill="none"
          strokeLinecap="round"
        />
      </motion.g>

      {/* Person */}
      <circle cx="75" cy="105" r="12" fill={baseColor} />
      <circle cx="71" cy="103" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="79" cy="103" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 70 110 Q 75 112 80 110"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="75" y1="117" x2="75" y2="140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 121 L 60 126" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 121 L 90 126" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 140 L 65 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 75 140 L 85 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q9: Usefulness (reversed) - Person helping/contributing
function UsefulnessIllustration({ percentage, baseColor, accentColor }: any) {
  const helpingHandReach = percentage * 20;
  const contributionVisible = percentage > 0.4;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Person being helped (on right) */}
      <g opacity="0.4">
        <circle cx="140" cy="105" r="10" fill={baseColor} />
        <line x1="140" y1="115" x2="140" y2="130" stroke={baseColor} strokeWidth="2.5" />
      </g>

      {/* Contribution symbols (gift, help, support) */}
      {contributionVisible && (
        <motion.g 
          opacity={percentage}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <rect x="120" y="80" width="20" height="20" fill={accentColor} opacity="0.3" rx="2" />
          <path d="M 125 70 Q 130 65 135 70 L 130 80 L 125 70" fill={accentColor} opacity="0.4" />
        </motion.g>
      )}

      {/* Main person reaching out to help */}
      <circle cx="70" cy="100" r="12" fill={baseColor} />
      <circle cx="66" cy="98" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="74" cy="98" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 65 105 Q 70 107 75 105"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="70" y1="112" x2="70" y2="135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      {/* Arm extending to help */}
      <motion.path
        d={`M 70 116 L ${90 + helpingHandReach} 105`}
        stroke={baseColor}
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ d: `M 70 116 L ${90 + helpingHandReach} 105` }}
        transition={{ duration: 0.3 }}
      />
      <path d="M 70 116 L 55 120" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      
      <path d="M 70 135 L 60 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 135 L 80 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// Q10: Self-goodness (reversed) - Person with positive affirmations
function SelfGoodnessIllustration({ percentage, baseColor, accentColor }: any) {
  const affirmationCount = Math.floor(percentage * 3);
  const positiveGlow = percentage;

  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {/* Positive glow around person */}
      <motion.circle 
        cx="100" cy="100" r="35" 
        fill={accentColor} 
        opacity={positiveGlow * 0.12}
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 2.5 }}
      />

      {/* Positive affirmation bubbles */}
      {Array.from({ length: affirmationCount }).map((_, i) => {
        const positions = [
          { x: 130, y: 75 },
          { x: 145, y: 95 },
          { x: 135, y: 115 }
        ];
        const pos = positions[i];
        
        return (
          <motion.g
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 0.3, delay: i * 0.15 }}
          >
            <circle cx={pos.x} cy={pos.y} r="8" fill={accentColor} opacity="0.2" />
            <text x={pos.x - 3} y={pos.y + 3} fontSize="10" fill={accentColor} opacity="0.6">+</text>
          </motion.g>
        );
      })}

      {/* Thumbs up */}
      {percentage > 0.6 && (
        <motion.g
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 0.6 }}
          transition={{ duration: 0.4 }}
        >
          <rect x="155" y="105" width="6" height="12" fill={accentColor} opacity="0.4" rx="1" />
          <rect x="155" y="100" width="6" height="6" fill={accentColor} opacity="0.4" rx="1" />
        </motion.g>
      )}

      {/* Person */}
      <circle cx="100" cy="100" r="12" fill={baseColor} />
      <circle cx="96" cy="98" r="2" fill={baseColor} opacity="0.8" />
      <circle cx="104" cy="98" r="2" fill={baseColor} opacity="0.8" />
      
      <motion.path 
        d="M 95 105 Q 100 108 105 105"
        stroke={baseColor}
        strokeWidth="2"
        fill="none"
      />
      
      <line x1="100" y1="112" x2="100" y2="135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 116 L 85 121" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 116 L 115 121" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 135 L 90 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      <path d="M 100 135 L 110 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}