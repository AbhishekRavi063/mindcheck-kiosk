import { motion } from 'motion/react';

interface PHQ9SketchProps {
  questionNumber: number;
  sliderPercentage: number; // 0 to 1
  baseColor: string;
  accentColor: string;
}

export function PHQ9SketchIllustration({ 
  questionNumber, 
  sliderPercentage, 
  baseColor, 
  accentColor 
}: PHQ9SketchProps) {
  
  switch (questionNumber) {
    case 1: // Interest & Pleasure
      return <InterestSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 2: // Mood
      return <MoodSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 3: // Sleep
      return <SleepSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 4: // Energy
      return <EnergySketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 5: // Appetite
      return <AppetiteSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 6: // Self-Worth
      return <SelfWorthSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 7: // Concentration
      return <ConcentrationSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 8: // Psychomotor
      return <PsychomotorSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    case 9: // Crisis/Safety
      return <CrisisSketch sliderPercentage={sliderPercentage} baseColor={baseColor} accentColor={accentColor} />;
    default:
      return null;
  }
}

// Q1: Interest & Pleasure - Person with hobbies (painting, music)
function InterestSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const happiness = 1 - sliderPercentage;
  const slump = sliderPercentage * 10;
  const sparkleOpacity = happiness;
  const colorIntensity = happiness;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Background elements - hobby items */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: colorIntensity }}>
        {/* Canvas/Art */}
        <rect x="130" y="80" width="35" height="45" fill="none" stroke={accentColor} strokeWidth="2" rx="2" />
        <path d="M 135 90 Q 145 100 155 90" stroke={accentColor} strokeWidth="2" fill="none" />
        <circle cx="140" cy="105" r="3" fill={accentColor} />
        <circle cx="152" cy="110" r="3" fill="#f97316" />
      </motion.g>

      {/* Sparkles */}
      <motion.g 
        initial={{ opacity: 0, scale: 1 }}
        animate={{ 
          opacity: sparkleOpacity, 
          scale: sparkleOpacity > 0.5 ? [1, 1.2, 1] : 1 
        }} 
        transition={{ 
          repeat: sparkleOpacity > 0.5 ? Infinity : 0, 
          duration: 2 
        }}
      >
        <path d="M 150 65 L 152 70 L 157 68 L 153 73 L 155 78 L 150 75 L 145 78 L 147 73 L 143 68 L 148 70 Z" fill={accentColor} />
      </motion.g>

      {/* Person */}
      <motion.g animate={{ y: slump }}>
        {/* Head */}
        <circle cx="80" cy="80" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face - smile changes to neutral/sad */}
        <motion.path
          d="M 72 87 L 88 87"
          animate={{
            d: happiness > 0.7
              ? "M 72 85 Q 80 90 88 85"
              : happiness > 0.3
                ? "M 72 87 L 88 87"
                : "M 72 90 Q 80 85 88 90"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes */}
        <motion.circle 
          cx="74" cy="86" r="2.5" fill={baseColor}
          animate={{ scaleY: happiness < 0.3 ? 0.6 : 1 }}
          initial={{ scaleY: 1 }}
        />
        <motion.circle 
          cx="86" cy="86" r="2.5" fill={baseColor}
          animate={{ scaleY: happiness < 0.3 ? 0.6 : 1 }}
          initial={{ scaleY: 1 }}
        />

        {/* Body */}
        <motion.line 
          x1="80" y1="98" x2="80" y2="135" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          initial={{ opacity: 1 }}
        />

        {/* Arms - animated based on mood */}
        <motion.path
          d="M 80 105 Q 90 115 85 125"
          animate={{
            d: happiness > 0.5
              ? "M 80 105 Q 95 100 110 110"
              : "M 80 105 Q 90 115 85 125"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M 80 105 L 70 120"
          animate={{
            d: happiness > 0.5
              ? "M 80 105 L 65 115"
              : "M 80 105 L 70 120"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Legs */}
        <path d="M 80 135 L 70 160" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 80 135 L 90 160" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Music notes (fade out) */}
      <motion.g 
        initial={{ opacity: sparkleOpacity * 0.8, y: 0 }}
        animate={{ opacity: sparkleOpacity * 0.8, y: sparkleOpacity > 0.5 ? [-5, 0] : 0 }} 
        transition={{ repeat: sparkleOpacity > 0.5 ? Infinity : 0, duration: 1.5 }}
      >
        <circle cx="115" cy="90" r="4" fill={accentColor} />
        <line x1="119" y1="90" x2="119" y2="75" stroke={accentColor} strokeWidth="2" />
        <path d="M 119 75 Q 125 75 125 80" stroke={accentColor} strokeWidth="2" fill="none" />
      </motion.g>
    </svg>
  );
}

// Q2: Mood - Person with weather elements (sun to rain cloud)
function MoodSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const happiness = 1 - sliderPercentage;
  const headTilt = sliderPercentage * 8;
  const cloudOpacity = sliderPercentage;
  const sunOpacity = happiness;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Sun (fades out) */}
      <motion.g initial={{ opacity: 1, scale: 1 }} animate={{ opacity: sunOpacity, scale: sunOpacity }}>
        <circle cx="150" cy="50" r="12" fill={accentColor} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <line
            key={i}
            x1={150 + Math.cos((angle * Math.PI) / 180) * 18}
            y1={50 + Math.sin((angle * Math.PI) / 180) * 18}
            x2={150 + Math.cos((angle * Math.PI) / 180) * 25}
            y2={50 + Math.sin((angle * Math.PI) / 180) * 25}
            stroke={accentColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </motion.g>

      {/* Rain cloud (fades in) */}
      <motion.g 
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: cloudOpacity, y: cloudOpacity > 0.5 ? [0, -3, 0] : 0 }} 
        transition={{ repeat: cloudOpacity > 0.5 ? Infinity : 0, duration: 2 }}
      >
        <ellipse cx="145" cy="55" rx="18" ry="12" fill="#94a3b8" />
        <ellipse cx="160" cy="52" rx="15" ry="10" fill="#94a3b8" />
        <ellipse cx="155" cy="60" rx="12" ry="8" fill="#94a3b8" />
        {/* Rain drops */}
        <motion.g animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
          <line x1="145" y1="68" x2="145" y2="78" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="155" y1="70" x2="155" y2="80" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="150" y1="72" x2="150" y2="82" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </motion.g>

      {/* Person */}
      <motion.g animate={{ rotate: headTilt }} style={{ transformOrigin: '80px 100px' }}>
        {/* Head */}
        <circle cx="80" cy="90" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face */}
        <motion.path
          d="M 72 97 L 88 97"
          animate={{
            d: happiness > 0.7
              ? "M 72 95 Q 80 100 88 95"
              : happiness > 0.3
                ? "M 72 97 L 88 97"
                : "M 72 100 Q 80 95 88 100"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes */}
        <motion.circle 
          cx="74" cy="86" r="2.5" fill={baseColor}
          animate={{ scaleY: happiness < 0.3 ? 0.6 : 1 }}
        />
        <motion.circle 
          cx="86" cy="86" r="2.5" fill={baseColor}
          animate={{ scaleY: happiness < 0.3 ? 0.6 : 1 }}
        />

        {/* Body */}
        <line x1="80" y1="108" x2="80" y2="145" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />

        {/* Arms */}
        <path d="M 80 115 L 65 125" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 80 115 L 95 125" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />

        {/* Legs */}
        <path d="M 80 145 L 70 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 80 145 L 90 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Heart (happy) */}
      <motion.path
        d="M 100 100 L 103 97 Q 107 93 110 97 Q 113 100 110 103 L 100 113 L 90 103 Q 87 100 90 97 Q 93 93 97 97 L 100 100 Z"
        fill={accentColor}
        initial={{ opacity: 1 }}
        animate={{ opacity: sunOpacity, scale: sunOpacity > 0.7 ? [1, 1.2, 1] : sunOpacity }}
        transition={{ repeat: sunOpacity > 0.7 ? Infinity : 0, duration: 1.5 }}
      />
    </svg>
  );
}

// Q3: Sleep - Person in bed with moon/alarm clock
function SleepSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const tiredness = sliderPercentage;
  const eyesOpen = 1 - tiredness;
  const zzOpacity = tiredness;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Moon and stars */}
      <motion.g initial={{ opacity: 0.6 }} animate={{ opacity: 0.6 + tiredness * 0.4 }}>
        <circle cx="160" cy="50" r="15" fill={accentColor} opacity="0.3" />
        <circle cx="165" cy="48" r="15" fill={accentColor} />
        <circle cx="40" cy="60" r="2" fill={accentColor} />
        <circle cx="55" cy="50" r="1.5" fill={accentColor} />
        <circle cx="48" cy="70" r="2" fill={accentColor} />
      </motion.g>

      {/* Bed */}
      <rect x="50" y="130" width="100" height="10" fill={baseColor} opacity="0.3" rx="2" />
      <rect x="45" y="140" width="110" height="5" fill={baseColor} opacity="0.2" rx="1" />

      {/* Blanket */}
      <motion.path
        d="M 60 115 Q 100 125 140 115 L 140 140 L 60 140 Z"
        fill={accentColor}
        opacity="0.4"
        animate={{ d: tiredness > 0.5 
          ? "M 60 120 Q 100 130 140 120 L 140 140 L 60 140 Z"  // More covered
          : "M 60 115 Q 100 125 140 115 L 140 140 L 60 140 Z"
        }}
      />

      {/* Person laying down */}
      <g>
        {/* Head on pillow */}
        <ellipse cx="90" cy="105" rx="20" ry="15" fill={baseColor} stroke={baseColor} strokeWidth="2" />
        <ellipse cx="90" cy="110" rx="25" ry="8" fill={baseColor} opacity="0.2" /> {/* Pillow */}
        
        {/* Face */}
        <motion.g animate={{ scaleY: eyesOpen }}>
          <ellipse cx="85" cy="102" rx="2" ry="3" fill={baseColor} />
          <ellipse cx="95" cy="102" rx="2" ry="3" fill={baseColor} />
        </motion.g>

        {/* Tired eyes (closed) */}
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: tiredness }}>
          <line x1="83" y1="102" x2="87" y2="102" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="93" y1="102" x2="97" y2="102" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Mouth */}
        <motion.ellipse 
          cx="90" cy="108" rx="4" ry="2" 
          fill="none" stroke={baseColor} strokeWidth="1.5"
          animate={{ ry: tiredness > 0.5 ? 3 : 2 }}
        />
      </g>

      {/* ZZZ (sleep indicators) */}
      <motion.g 
        animate={{ 
          opacity: zzOpacity,
          y: zzOpacity > 0.5 ? [-3, 3] : 0
        }} 
        transition={{ repeat: zzOpacity > 0.5 ? Infinity : 0, duration: 2 }}
      >
        <text x="115" y="90" fill={accentColor} fontSize="16" fontWeight="bold">Z</text>
        <text x="125" y="80" fill={accentColor} fontSize="20" fontWeight="bold">Z</text>
        <text x="138" y="68" fill={accentColor} fontSize="24" fontWeight="bold">Z</text>
      </motion.g>

      {/* Alarm clock (more visible when sleep issues) */}
      <motion.g 
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 0.3 + tiredness * 0.7 }}
      >
        <circle cx="150" cy="130" r="12" fill="none" stroke={baseColor} strokeWidth="2" />
        <line x1="150" y1="130" x2="150" y2="123" stroke={baseColor} strokeWidth="2" />
        <line x1="150" y1="130" x2="155" y2="130" stroke={baseColor} strokeWidth="2" />
        <line x1="145" y1="118" x2="143" y2="115" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        <line x1="155" y1="118" x2="157" y2="115" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}

// Q4: Energy - Person with battery indicator
function EnergySketch({ sliderPercentage, baseColor, accentColor }: any) {
  const energy = 1 - sliderPercentage;
  const slump = sliderPercentage * 15;
  const batteryLevel = energy;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Battery indicator */}
      <g transform="translate(140, 50)">
        <rect x="0" y="5" width="30" height="50" fill="none" stroke={baseColor} strokeWidth="2.5" rx="3" />
        <rect x="10" y="0" width="10" height="5" fill={baseColor} />
        
        {/* Battery fill */}
        <motion.rect
          x="3"
          y={5 + (50 - 6) * (1 - batteryLevel)}
          height={(50 - 6) * batteryLevel}
          animate={{
            y: 5 + (50 - 6) * (1 - batteryLevel),
            height: (50 - 6) * batteryLevel
          }}
          width="24"
          fill={energy > 0.6 ? accentColor : energy > 0.3 ? '#f97316' : '#ef4444'}
          rx="2"
        />

        {/* Lightning bolt (high energy) */}
        <motion.path
          d="M 17 20 L 12 30 L 17 30 L 13 43 L 22 28 L 17 28 L 20 20 Z"
          fill="white"
          initial={{ opacity: 0 }}
          animate={{ opacity: energy > 0.6 ? [0.8, 1, 0.8] : 0 }}
          transition={{ repeat: energy > 0.6 ? Infinity : 0, duration: 1.5 }}
        />
      </g>

      {/* Person */}
      <motion.g animate={{ y: slump }}>
        {/* Head */}
        <circle cx="70" cy="85" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face */}
        <motion.path
          d="M 62 92 L 78 92"
          animate={{
            d: energy > 0.6
              ? "M 62 90 Q 70 95 78 90"
              : energy > 0.3
                ? "M 62 92 L 78 92"
                : "M 62 95 Q 70 90 78 95"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes - tired vs alert */}
        <motion.g animate={{ scaleY: energy < 0.3 ? 0.5 : 1 }}>
          <circle cx="64" cy="81" r="2.5" fill={baseColor} />
          <circle cx="76" cy="81" r="2.5" fill={baseColor} />
        </motion.g>

        {/* Body */}
        <motion.line
          x1="70" y1="103" x2="70" y2="140"
          animate={{ y2: 140 + slump * 0.5 }}
          stroke={baseColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Arms - energetic vs drooping */}
        <motion.path
          d="M 70 110 L 85 120"
          animate={{
            d: energy > 0.6
              ? "M 70 110 Q 85 105 95 115"
              : energy > 0.3
                ? "M 70 110 L 85 120"
                : "M 70 110 L 80 125"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M 70 110 L 55 120"
          animate={{
            d: energy > 0.6
              ? "M 70 110 Q 55 105 45 115"
              : energy > 0.3
                ? "M 70 110 L 55 120"
                : "M 70 110 L 60 125"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Legs */}
        <path d="M 70 140 L 60 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 140 L 80 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Energy sparkles (high energy) */}
      <motion.g 
        animate={{ 
          opacity: energy > 0.6 ? [0.6, 1, 0.6] : 0,
          scale: energy > 0.6 ? [1, 1.1, 1] : 1
        }} 
        transition={{ repeat: energy > 0.6 ? Infinity : 0, duration: 1.8 }}
      >
        <circle cx="50" cy="95" r="3" fill={accentColor} />
        <circle cx="90" cy="100" r="2.5" fill={accentColor} />
        <circle cx="55" cy="115" r="2" fill={accentColor} />
      </motion.g>
    </svg>
  );
}

// Q5: Appetite - Person with food/plate
function AppetiteSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const appetite = 1 - sliderPercentage;
  const foodOpacity = appetite;
  const plateFullness = appetite;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Table */}
      <rect x="40" y="135" width="120" height="5" fill={baseColor} opacity="0.2" rx="2" />

      {/* Plate with food */}
      <g>
        <ellipse cx="100" cy="130" rx="35" ry="8" fill="none" stroke={baseColor} strokeWidth="2" />
        
        {/* Food items - fade based on appetite */}
        <motion.g 
          initial={{ opacity: 0.8, scale: 1 }}
          animate={{ opacity: foodOpacity, scale: 0.8 + foodOpacity * 0.2 }}
        >
          {/* Rice/Dal */}
          <ellipse cx="100" cy="125" rx="20" ry="12" fill={accentColor} opacity="0.6" />
          {/* Roti/Chapati */}
          <circle cx="115" cy="123" r="10" fill="#f97316" opacity="0.5" />
          {/* Vegetable */}
          <circle cx="85" cy="123" r="8" fill="#22c55e" opacity="0.6" />
        </motion.g>

        {/* Steam (good appetite) */}
        <motion.g 
          animate={{ 
            opacity: appetite > 0.5 ? [0.4, 0.7, 0.4] : 0,
            y: appetite > 0.5 ? [0, -5] : 0
          }} 
          transition={{ repeat: appetite > 0.5 ? Infinity : 0, duration: 2 }}
        >
          <path d="M 95 115 Q 95 105 98 100" stroke={baseColor} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
          <path d="M 105 115 Q 105 105 102 100" stroke={baseColor} strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round" />
        </motion.g>
      </g>

      {/* Person */}
      <g>
        {/* Head */}
        <circle cx="100" cy="70" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face */}
        <motion.path
          d="M 92 77 L 108 77"
          animate={{
            d: appetite > 0.6
              ? "M 92 75 Q 100 80 108 75"
              : appetite > 0.3
                ? "M 92 77 L 108 77"
                : "M 92 78 Q 100 73 108 78"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes */}
        <circle cx="94" cy="66" r="2.5" fill={baseColor} />
        <circle cx="106" cy="66" r="2.5" fill={baseColor} />

        {/* Body */}
        <line x1="100" y1="88" x2="100" y2="120" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />

        {/* Arms - reaching for food vs hanging */}
        <motion.path
          d="M 100 95 L 110 105"
          animate={{
            d: appetite > 0.5
              ? "M 100 95 Q 110 100 115 110"
              : "M 100 95 L 110 105"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M 100 95 L 90 105"
          animate={{
            d: appetite > 0.5
              ? "M 100 95 Q 90 100 85 110"
              : "M 100 95 L 90 105"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Fork in hand (good appetite) */}
        <motion.g animate={{ opacity: appetite > 0.6 ? 1 : 0 }}>
          <line x1="115" y1="110" x2="118" y2="125" stroke={baseColor} strokeWidth="2" />
          <line x1="116" y1="125" x2="116" y2="128" stroke={baseColor} strokeWidth="1.5" />
          <line x1="118" y1="125" x2="118" y2="128" stroke={baseColor} strokeWidth="1.5" />
          <line x1="120" y1="125" x2="120" y2="128" stroke={baseColor} strokeWidth="1.5" />
        </motion.g>
      </g>

      {/* Heart eyes for food (high appetite) */}
      <motion.g animate={{ opacity: appetite > 0.7 ? [0.6, 1, 0.6] : 0 }} transition={{ repeat: appetite > 0.7 ? Infinity : 0, duration: 1.5 }}>
        <path d="M 93 65 L 94 63 Q 96 61 97 63 Q 98 65 97 67 L 93 70 L 89 67 Q 88 65 89 63 Q 90 61 92 63 L 93 65 Z" fill="#ef4444" />
        <path d="M 105 65 L 106 63 Q 108 61 109 63 Q 110 65 109 67 L 105 70 L 101 67 Q 100 65 101 63 Q 102 61 104 63 L 105 65 Z" fill="#ef4444" />
      </motion.g>
    </svg>
  );
}

// Q6: Self-Worth - Person looking in mirror
function SelfWorthSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const confidence = 1 - sliderPercentage;
  const posture = sliderPercentage * 10;
  const mirrorPositive = confidence;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Mirror frame */}
      <g>
        <rect x="125" y="60" width="50" height="70" fill="none" stroke={baseColor} strokeWidth="3" rx="5" />
        <rect x="120" y="55" width="60" height="80" fill="none" stroke={baseColor} strokeWidth="2" rx="7" />
        
        {/* Mirror reflection */}
        <g opacity="0.4">
          {/* Happy reflection vs sad */}
          <motion.circle 
            cx="150" cy="90" r="12" 
            fill={baseColor}
            animate={{ cy: 90 + posture * 0.5 }}
          />
          <motion.path
            d="M 145 96 L 155 96"
            animate={{
              d: confidence > 0.6
                ? "M 145 95 Q 150 98 155 95"
                : confidence > 0.3
                  ? "M 145 96 L 155 96"
                  : "M 145 98 Q 150 94 155 98"
            }}
            stroke={baseColor}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Positive symbols in mirror (high confidence) */}
        <motion.g animate={{ opacity: mirrorPositive }}>
          <circle cx="135" cy="75" r="2" fill={accentColor} />
          <circle cx="165" cy="78" r="2.5" fill={accentColor} />
          <path d="M 148 110 L 150 108 L 155 115" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* Negative symbols (low confidence) */}
        <motion.g animate={{ opacity: sliderPercentage }}>
          <line x1="133" y1="73" x2="137" y2="77" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
          <line x1="137" y1="73" x2="133" y2="77" stroke="#ef4444" strokeWidth="1.5" opacity="0.5" />
        </motion.g>
      </g>

      {/* Person */}
      <motion.g animate={{ y: posture }}>
        {/* Head */}
        <circle cx="70" cy="90" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face */}
        <motion.path
          d="M 62 97 L 78 97"
          animate={{
            d: confidence > 0.6
              ? "M 62 95 Q 70 100 78 95"
              : confidence > 0.3
                ? "M 62 97 L 78 97"
                : "M 62 100 Q 70 95 78 100"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes */}
        <motion.circle 
          cx="64" cy="86" r="2.5" fill={baseColor}
          animate={{ cy: confidence < 0.3 ? 88 : 86 }}  // Looking down when low
        />
        <motion.circle 
          cx="76" cy="86" r="2.5" fill={baseColor}
          animate={{ cy: confidence < 0.3 ? 88 : 86 }}
        />

        {/* Body */}
        <line x1="70" y1="108" x2="70" y2="145" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />

        {/* Arms */}
        <path d="M 70 115 L 55 130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 115 L 85 130" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />

        {/* Legs */}
        <path d="M 70 145 L 60 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 70 145 L 80 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Thought bubble with star (positive) or storm (negative) */}
      <g transform="translate(40, 50)">
        <ellipse cx="0" cy="0" rx="18" ry="15" fill="white" stroke={baseColor} strokeWidth="2" opacity="0.9" />
        <circle cx="-10" cy="10" r="5" fill="white" stroke={baseColor} strokeWidth="2" opacity="0.9" />
        <circle cx="-15" cy="15" r="3" fill="white" stroke={baseColor} strokeWidth="2" opacity="0.9" />
        
        <motion.g animate={{ opacity: mirrorPositive, scale: mirrorPositive > 0.6 ? [1, 1.1, 1] : 1 }} transition={{ repeat: mirrorPositive > 0.6 ? Infinity : 0, duration: 2 }}>
          <path d="M 0 -5 L 2 0 L 7 0 L 3 3 L 5 8 L 0 5 L -5 8 L -3 3 L -7 0 L -2 0 Z" fill={accentColor} />
        </motion.g>

        <motion.g animate={{ opacity: sliderPercentage }}>
          <line x1="-4" y1="-3" x2="-1" y2="3" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1" y1="-3" x2="4" y2="3" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-1" y1="0" x2="1" y2="0" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>
      </g>
    </svg>
  );
}

// Q7: Concentration - Person reading/working with focus indicators
function ConcentrationSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const focus = 1 - sliderPercentage;
  const distractionOpacity = sliderPercentage;
  const focusOpacity = focus;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Book/Laptop */}
      <g transform="translate(70, 120)">
        <rect x="0" y="0" width="60" height="40" fill="none" stroke={baseColor} strokeWidth="2.5" rx="2" />
        <line x1="30" y1="0" x2="30" y2="40" stroke={baseColor} strokeWidth="2" />
        <line x1="10" y1="10" x2="25" y2="10" stroke={baseColor} strokeWidth="1.5" opacity="0.5" />
        <line x1="10" y1="15" x2="25" y2="15" stroke={baseColor} strokeWidth="1.5" opacity="0.5" />
        <line x1="10" y1="20" x2="25" y2="20" stroke={baseColor} strokeWidth="1.5" opacity="0.5" />
        <line x1="35" y1="10" x2="50" y2="10" stroke={baseColor} strokeWidth="1.5" opacity="0.5" />
        <line x1="35" y1="15" x2="50" y2="15" stroke={baseColor} strokeWidth="1.5" opacity="0.5" />
        <line x1="35" y1="20" x2="50" y2="20" stroke={baseColor} strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* Person */}
      <g>
        {/* Head */}
        <circle cx="100" cy="75" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face - concentrated vs distracted */}
        <motion.path
          d="M 92 81 Q 100 78 108 81"
          animate={{
            d: focus > 0.6
              ? "M 92 80 L 108 80"
              : focus > 0.3
                ? "M 92 81 Q 100 78 108 81"
                : "M 92 83 Q 100 78 108 83"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes - focused vs scattered */}
        <motion.g animate={{ scaleX: focus < 0.3 ? 1.3 : 1 }}>
          <circle cx="94" cy="71" r="2.5" fill={baseColor} />
          <circle cx="106" cy="71" r="2.5" fill={baseColor} />
        </motion.g>

        {/* Concentration lines (focused) */}
        <motion.g animate={{ opacity: focusOpacity }}>
          <line x1="88" y1="63" x2="86" y2="58" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="112" y1="63" x2="114" y2="58" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Body leaning towards book */}
        <motion.line
          x1="100" y1="93" x2="100" y2="120"
          animate={{ x2: 100, y2: 120 - focus * 5 }}
          stroke={baseColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Arms on book */}
        <path d="M 100 100 L 85 120" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 100 L 115 120" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Focus beam (high concentration) */}
      <motion.g animate={{ opacity: focusOpacity, scale: focusOpacity > 0.6 ? [1, 1.05, 1] : 1 }} transition={{ repeat: focusOpacity > 0.6 ? Infinity : 0, duration: 2 }}>
        <circle cx="100" cy="140" r="4" fill={accentColor} opacity="0.6" />
        <circle cx="100" cy="140" r="8" fill={accentColor} opacity="0.3" />
        <circle cx="100" cy="140" r="12" fill={accentColor} opacity="0.1" />
      </motion.g>

      {/* Distraction elements */}
      <motion.g 
        animate={{ 
          opacity: distractionOpacity,
          x: distractionOpacity > 0.5 ? [-2, 2, -2] : 0
        }} 
        transition={{ repeat: distractionOpacity > 0.5 ? Infinity : 0, duration: 1.5 }}
      >
        {/* Phone notification */}
        <g transform="translate(140, 130)">
          <rect x="0" y="0" width="20" height="30" rx="3" fill="none" stroke="#ef4444" strokeWidth="2" />
          <circle cx="10" cy="5" r="2" fill="#ef4444" />
          <motion.circle 
            cx="10" cy="5" r="4" 
            fill="#ef4444" 
            opacity="0.5"
            animate={{ r: [4, 6, 4] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </g>

        {/* Thought bubbles (distracted) */}
        <circle cx="130" cy="65" r="6" fill="white" stroke="#94a3b8" strokeWidth="1.5" opacity="0.8" />
        <circle cx="145" cy="55" r="8" fill="white" stroke="#94a3b8" strokeWidth="1.5" opacity="0.8" />
        <text x="140" y="60" fontSize="10" fill="#94a3b8">?</text>
      </motion.g>
    </svg>
  );
}

// Q8: Psychomotor - Person showing movement (calm vs restless)
function PsychomotorSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const restlessness = sliderPercentage;
  const calmness = 1 - restlessness;
  const shakeAmount = restlessness * 3;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Person */}
      <motion.g 
        animate={{ 
          x: restlessness > 0.5 ? [-shakeAmount, shakeAmount, -shakeAmount] : 0,
          y: restlessness > 0.5 ? [-shakeAmount * 0.5, shakeAmount * 0.5, -shakeAmount * 0.5] : 0
        }} 
        transition={{ repeat: restlessness > 0.5 ? Infinity : 0, duration: 0.3 }}
      >
        {/* Head */}
        <circle cx="100" cy="80" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face */}
        <motion.path
          d="M 92 86 L 108 86"
          animate={{
            d: calmness > 0.6
              ? "M 92 85 Q 100 88 108 85"
              : calmness > 0.3
                ? "M 92 86 L 108 86"
                : "M 92 88 Q 100 85 108 88"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes - calm vs wide/anxious */}
        <motion.circle 
          cx="94" cy="76" 
          animate={{ r: restlessness > 0.6 ? 3 : 2.5 }}
          fill={baseColor}
        />
        <motion.circle 
          cx="106" cy="76" 
          animate={{ r: restlessness > 0.6 ? 3 : 2.5 }}
          fill={baseColor}
        />

        {/* Body */}
        <line x1="100" y1="98" x2="100" y2="140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />

        {/* Arms - fidgeting vs still */}
        <motion.path
          d="M 100 105 L 115 120"
          animate={{
            d: restlessness > 0.6
              ? ["M 100 105 Q 115 100 120 110", "M 100 105 Q 115 110 118 115", "M 100 105 Q 115 105 122 108"]
              : "M 100 105 L 115 120"
          }}
          transition={{ repeat: restlessness > 0.6 ? Infinity : 0, duration: 0.8 }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M 100 105 L 85 120"
          animate={{
            d: restlessness > 0.6
              ? ["M 100 105 Q 85 100 80 110", "M 100 105 Q 85 110 82 115", "M 100 105 Q 85 105 78 108"]
              : "M 100 105 L 85 120"
          }}
          transition={{ repeat: restlessness > 0.6 ? Infinity : 0, duration: 0.8, delay: 0.2 }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Legs - moving vs still */}
        <motion.path
          d="M 100 140 L 90 165"
          stroke={baseColor}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ d: restlessness > 0.6 
            ? ["M 100 140 L 90 165", "M 100 140 L 88 168", "M 100 140 L 92 163"]
            : "M 100 140 L 90 165"
          }}
          transition={{ repeat: restlessness > 0.6 ? Infinity : 0, duration: 0.5 }}
        />
        <motion.path
          d="M 100 140 L 110 165"
          stroke={baseColor}
          strokeWidth="3"
          strokeLinecap="round"
          animate={{ d: restlessness > 0.6 
            ? ["M 100 140 L 110 165", "M 100 140 L 112 168", "M 100 140 L 108 163"]
            : "M 100 140 L 110 165"
          }}
          transition={{ repeat: restlessness > 0.6 ? Infinity : 0, duration: 0.5, delay: 0.25 }}
        />
      </motion.g>

      {/* Calm zen circle */}
      <motion.g animate={{ opacity: calmness }}>
        <circle cx="100" cy="100" r="60" fill="none" stroke={accentColor} strokeWidth="1.5" opacity="0.3" />
        <circle cx="100" cy="100" r="70" fill="none" stroke={accentColor} strokeWidth="1" opacity="0.2" />
      </motion.g>

      {/* Motion lines (restless) */}
      <motion.g animate={{ opacity: restlessness }}>
        <motion.line 
          x1="65" y1="105" x2="75" y2="105" 
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeLinecap="round"
          animate={{ x1: [65, 70, 65] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
        />
        <motion.line 
          x1="125" y1="105" x2="135" y2="105" 
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeLinecap="round"
          animate={{ x1: [125, 130, 125] }}
          transition={{ repeat: Infinity, duration: 0.5, delay: 0.25 }}
        />
        <motion.line 
          x1="95" y1="65" x2="95" y2="55" 
          stroke="#ef4444" 
          strokeWidth="2" 
          strokeLinecap="round"
          animate={{ y1: [65, 60, 65] }}
          transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }}
        />
      </motion.g>
    </svg>
  );
}

// Q9: Crisis/Safety - Person with support symbols
function CrisisSketch({ sliderPercentage, baseColor, accentColor }: any) {
  const distress = sliderPercentage;
  const support = 1 - distress;
  const slump = distress * 12;

  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Supportive environment (calm) */}
      <motion.g animate={{ opacity: support }}>
        {/* Peaceful elements */}
        <path d="M 30 140 Q 40 130 50 140 T 70 140" stroke={accentColor} strokeWidth="2" fill="none" opacity="0.4" />
        <circle cx="45" cy="125" r="3" fill={accentColor} opacity="0.6" />
        <circle cx="170" cy="135" r="3" fill={accentColor} opacity="0.6" />
        
        {/* Hearts */}
        <motion.path
          d="M 160 100 L 162 98 Q 165 95 167 98 Q 169 101 167 103 L 160 110 L 153 103 Q 151 101 153 98 Q 155 95 158 98 L 160 100 Z"
          fill={accentColor}
          animate={{ scale: support > 0.7 ? [1, 1.1, 1] : 1, opacity: support }}
          transition={{ repeat: support > 0.7 ? Infinity : 0, duration: 1.5 }}
        />
      </motion.g>

      {/* Person */}
      <motion.g animate={{ y: slump }}>
        {/* Head */}
        <circle cx="100" cy="90" r="18" fill={baseColor} stroke={baseColor} strokeWidth="2.5" />
        
        {/* Face */}
        <motion.path
          d="M 92 96 L 108 96"
          animate={{
            d: support > 0.7
              ? "M 92 95 Q 100 99 108 95"
              : support > 0.4
                ? "M 92 96 L 108 96"
                : support > 0.2
                  ? "M 92 98 Q 100 94 108 98"
                  : "M 92 99 Q 100 94 108 99"
          }}
          stroke={baseColor}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Eyes - tired or tearful */}
        <motion.circle 
          cx="94" cy="86" r="2.5" fill={baseColor}
          animate={{ cy: distress > 0.7 ? 88 : 86 }}
        />
        <motion.circle 
          cx="106" cy="86" r="2.5" fill={baseColor}
          animate={{ cy: distress > 0.7 ? 88 : 86 }}
        />

        {/* Tears (high distress) */}
        <motion.g animate={{ opacity: distress > 0.7 ? [0.6, 1, 0.6] : 0 }} transition={{ repeat: distress > 0.7 ? Infinity : 0, duration: 2 }}>
          <line x1="94" y1="90" x2="92" y2="96" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
          <line x1="106" y1="90" x2="108" y2="96" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" />
        </motion.g>

        {/* Body - hunched when distressed */}
        <motion.line
          x1="100" y1="108" x2="100" y2="145"
          animate={{
            x2: 100 + distress * 5,
            y2: 145
          }}
          stroke={baseColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Arms - protective vs open */}
        <motion.path
          d="M 100 115 L 115 130"
          animate={{
            d: distress > 0.6
              ? "M 100 115 Q 95 120 93 130"
              : "M 100 115 L 115 130"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <motion.path
          d="M 100 115 L 85 130"
          animate={{
            d: distress > 0.6
              ? "M 100 115 Q 105 120 107 130"
              : "M 100 115 L 85 130"
          }}
          stroke={baseColor}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        {/* Legs */}
        <path d="M 100 145 L 90 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M 100 145 L 110 170" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Support hands (positive) */}
      <motion.g animate={{ opacity: support, y: support > 0.5 ? [0, -2, 0] : 0 }} transition={{ repeat: support > 0.5 ? Infinity : 0, duration: 2 }}>
        <path d="M 40 120 Q 45 115 50 120 L 48 125 Q 45 130 42 125 Z" fill={accentColor} opacity="0.6" />
        <path d="M 150 120 Q 155 115 160 120 L 158 125 Q 155 130 152 125 Z" fill={accentColor} opacity="0.6" />
      </motion.g>

      {/* Dark cloud (distress) */}
      <motion.g animate={{ opacity: distress, y: distress > 0.5 ? [0, -2, 0] : 0 }} transition={{ repeat: distress > 0.5 ? Infinity : 0, duration: 3 }}>
        <ellipse cx="100" cy="50" rx="25" ry="15" fill="#64748b" opacity="0.5" />
        <ellipse cx="85" cy="55" rx="18" ry="12" fill="#64748b" opacity="0.5" />
        <ellipse cx="115" cy="55" rx="18" ry="12" fill="#64748b" opacity="0.5" />
      </motion.g>

      {/* Lifeline/helpline symbol (always visible) */}
      <g transform="translate(30, 30)">
        <circle cx="0" cy="0" r="15" fill="none" stroke={accentColor} strokeWidth="2.5" />
        <path d="M -5 -3 L -3 3 L 0 0 L 3 5 L 5 -2" stroke={accentColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}