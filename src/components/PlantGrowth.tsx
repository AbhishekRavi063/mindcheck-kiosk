import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface PlantGrowthProps {
  completedCount: number;
  totalSections: number;
  isDarkMode: boolean;
}

export function PlantGrowth({ completedCount, totalSections, isDarkMode }: PlantGrowthProps) {
  const [previousCount, setPreviousCount] = useState(completedCount);
  const progress = (completedCount / totalSections) * 100;
  const circumference = 2 * Math.PI * 85; // radius of 85

  useEffect(() => {
    if (completedCount > previousCount) {
      setPreviousCount(completedCount);
    }
  }, [completedCount, previousCount]);

  // Plant stages based on completion
  const renderPlant = () => {
    const stage = completedCount;

    switch (stage) {
      case 0:
        // Seed in soil - minimal
        return (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Soil mound */}
            <path
              d="M 65 110 Q 65 95 82.5 95 Q 100 95 117.5 95 Q 135 95 135 110 L 135 115 Q 135 120 130 120 L 70 120 Q 65 120 65 115 Z"
              fill="#8B6F47"
            />
            {/* Seed */}
            <ellipse cx="100" cy="105" rx="6" ry="8" fill="#6B4423" />
          </motion.g>
        );

      case 1:
        // Small sprout - like the reference image
        return (
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Soil mound */}
            <path
              d="M 65 110 Q 65 95 82.5 95 Q 100 95 117.5 95 Q 135 95 135 110 L 135 115 Q 135 120 130 120 L 70 120 Q 65 120 65 115 Z"
              fill="#8B6F47"
            />
            {/* Stem */}
            <motion.rect
              x="98"
              y="85"
              width="4"
              height="25"
              rx="2"
              fill="#7CB342"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ transformOrigin: 'bottom' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Left leaf */}
            <motion.path
              d="M 98 90 Q 85 88 80 92 Q 82 98 90 96 Q 96 94 98 92 Z"
              fill="#9CCC65"
              initial={{ scale: 0, x: 10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.3, type: 'spring' }}
            />
            {/* Right leaf */}
            <motion.path
              d="M 102 90 Q 115 88 120 92 Q 118 98 110 96 Q 104 94 102 92 Z"
              fill="#9CCC65"
              initial={{ scale: 0, x: -10 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
            />
          </motion.g>
        );

      case 2:
        // Growing plant - taller with more leaves
        return (
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Soil mound */}
            <path
              d="M 60 110 Q 60 92 82.5 92 Q 100 92 117.5 92 Q 140 92 140 110 L 140 116 Q 140 122 134 122 L 66 122 Q 60 122 60 116 Z"
              fill="#8B6F47"
            />
            {/* Stem */}
            <rect x="98" y="68" width="4" height="44" rx="2" fill="#7CB342" />
            {/* Bottom left leaf */}
            <path
              d="M 98 95 Q 82 93 76 98 Q 78 106 88 103 Q 96 100 98 97 Z"
              fill="#8BC34A"
            />
            {/* Bottom right leaf */}
            <path
              d="M 102 95 Q 118 93 124 98 Q 122 106 112 103 Q 104 100 102 97 Z"
              fill="#8BC34A"
            />
            {/* Top left leaf */}
            <path
              d="M 98 78 Q 86 76 82 80 Q 84 86 92 84 Q 97 82 98 80 Z"
              fill="#9CCC65"
            />
            {/* Top right leaf */}
            <path
              d="M 102 78 Q 114 76 118 80 Q 116 86 108 84 Q 103 82 102 80 Z"
              fill="#9CCC65"
            />
          </motion.g>
        );

      case 3:
        // Mature plant - taller with more leaf pairs
        return (
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Soil mound */}
            <path
              d="M 58 110 Q 58 90 82.5 90 Q 100 90 117.5 90 Q 142 90 142 110 L 142 117 Q 142 124 135 124 L 65 124 Q 58 124 58 117 Z"
              fill="#8B6F47"
            />
            {/* Stem */}
            <rect x="98" y="52" width="4" height="58" rx="2" fill="#689F38" />
            {/* Bottom left leaf */}
            <path
              d="M 98 100 Q 80 98 72 104 Q 74 114 86 110 Q 96 106 98 103 Z"
              fill="#7CB342"
            />
            {/* Bottom right leaf */}
            <path
              d="M 102 100 Q 120 98 128 104 Q 126 114 114 110 Q 104 106 102 103 Z"
              fill="#7CB342"
            />
            {/* Middle left leaf */}
            <path
              d="M 98 82 Q 84 80 78 85 Q 80 92 90 89 Q 97 86 98 84 Z"
              fill="#8BC34A"
            />
            {/* Middle right leaf */}
            <path
              d="M 102 82 Q 116 80 122 85 Q 120 92 110 89 Q 103 86 102 84 Z"
              fill="#8BC34A"
            />
            {/* Top left leaf */}
            <path
              d="M 98 66 Q 87 64 83 68 Q 85 74 93 72 Q 97 70 98 68 Z"
              fill="#9CCC65"
            />
            {/* Top right leaf */}
            <path
              d="M 102 66 Q 113 64 117 68 Q 115 74 107 72 Q 103 70 102 68 Z"
              fill="#9CCC65"
            />
            {/* Small bud at top */}
            <motion.circle
              cx="100"
              cy="54"
              r="4"
              fill="#FFB74D"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            />
          </motion.g>
        );

      case 4:
        // Fully grown with flower
        return (
          <motion.g
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            {/* Soil mound */}
            <path
              d="M 55 110 Q 55 88 82.5 88 Q 100 88 117.5 88 Q 145 88 145 110 L 145 118 Q 145 126 137 126 L 63 126 Q 55 126 55 118 Z"
              fill="#8B6F47"
            />
            {/* Stem */}
            <rect x="98" y="40" width="4" height="70" rx="2" fill="#689F38" />
            {/* Bottom left leaf */}
            <path
              d="M 98 102 Q 78 100 68 107 Q 70 118 84 113 Q 96 108 98 105 Z"
              fill="#689F38"
            />
            {/* Bottom right leaf */}
            <path
              d="M 102 102 Q 122 100 132 107 Q 130 118 116 113 Q 104 108 102 105 Z"
              fill="#689F38"
            />
            {/* Middle left leaf */}
            <path
              d="M 98 82 Q 82 80 76 86 Q 78 94 88 91 Q 97 88 98 85 Z"
              fill="#7CB342"
            />
            {/* Middle right leaf */}
            <path
              d="M 102 82 Q 118 80 124 86 Q 122 94 112 91 Q 103 88 102 85 Z"
              fill="#7CB342"
            />
            {/* Upper left leaf */}
            <path
              d="M 98 66 Q 85 64 80 69 Q 82 76 91 73 Q 97 71 98 69 Z"
              fill="#8BC34A"
            />
            {/* Upper right leaf */}
            <path
              d="M 102 66 Q 115 64 120 69 Q 118 76 109 73 Q 103 71 102 69 Z"
              fill="#8BC34A"
            />
            {/* Top left leaf */}
            <path
              d="M 98 52 Q 88 50 85 54 Q 87 59 94 57 Q 97 55 98 54 Z"
              fill="#9CCC65"
            />
            {/* Top right leaf */}
            <path
              d="M 102 52 Q 112 50 115 54 Q 113 59 106 57 Q 103 55 102 54 Z"
              fill="#9CCC65"
            />
            
            {/* Flower */}
            <motion.g
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              {/* Flower center */}
              <circle cx="100" cy="38" r="6" fill="#FFD54F" />
              {/* Petals */}
              <circle cx="100" cy="30" r="4" fill="#FF7043" />
              <circle cx="93" cy="34" r="4" fill="#FF7043" />
              <circle cx="107" cy="34" r="4" fill="#FF7043" />
              <circle cx="95" cy="42" r="4" fill="#FFA726" />
              <circle cx="105" cy="42" r="4" fill="#FFA726" />
              {/* Inner center */}
              <circle cx="100" cy="38" r="3" fill="#FFE082" />
            </motion.g>
            
            {/* Sparkles */}
            <motion.g 
              initial={{ opacity: 0, scale: 1 }}
              animate={{ 
                opacity: 1, 
                scale: [1, 1.2, 1] 
              }} 
              transition={{ 
                repeat: Infinity, 
                duration: 2 
              }}
            >
              <path d="M 150 65 L 152 70 L 157 68 L 153 73 L 155 78 L 150 75 L 145 78 L 147 73 L 143 68 L 148 70 Z" fill="#ffb757" />
            </motion.g>
          </motion.g>
        );

      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (completedCount) {
      case 0: return 'Ready to start';
      case 1: return 'Growing nicely';
      case 2: return 'Buds forming';
      case 3: return 'Starting to bloom';
      case 4: return 'Fully bloomed!';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col items-center py-6">
      {/* Plant Container with Progress Ring */}
      <div className="relative mb-4">
        {/* Progress Circle */}
        <svg width="200" height="200" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r="85"
            stroke={isDarkMode ? 'rgba(255, 138, 101, 0.2)' : 'rgba(255, 138, 101, 0.15)'}
            strokeWidth="8"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="85"
            stroke="#ff8a65"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: circumference - (progress / 100) * circumference 
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>

        {/* Plant SVG */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-44 h-44 rounded-full flex items-center justify-center ${
            isDarkMode ? 'bg-[#2a2218]' : 'bg-[#ece5de]'
          }`}>
            <svg width="200" height="140" viewBox="0 0 200 140">
              <AnimatePresence mode="wait">
                <motion.g
                  key={completedCount}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  {renderPlant()}
                </motion.g>
              </AnimatePresence>
            </svg>
          </div>
        </div>

        {/* Progress badge */}
        <div className="absolute -top-2 -right-2 bg-[#ff8a65] text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
          {completedCount}/{totalSections}
        </div>
      </div>

      {/* Status Text */}
      <motion.p
        key={completedCount}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}
      >
        {getStatusText()}
      </motion.p>
    </div>
  );
}