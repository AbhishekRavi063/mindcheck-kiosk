import { motion } from 'motion/react';

interface CIDTIllustrationProps {
  questionText: string;
  sliderPercentage: number;
  isDarkMode: boolean;
}

// CIDT-style illustrations - very simple line drawings showing Indian/community contexts
export function CIDTIllustration({ questionText, sliderPercentage, isDarkMode }: CIDTIllustrationProps) {
  const strokeColor = isDarkMode ? '#ddc4af' : '#8d654c';
  const strokeWidth = 2;

  const getQuestionType = () => {
    const lowerText = questionText.toLowerCase();
    
    if (lowerText.includes('little interest') || lowerText.includes('pleasure')) return 'interest';
    if (lowerText.includes('feeling down') || lowerText.includes('depressed') || lowerText.includes('hopeless')) return 'mood';
    if (lowerText.includes('sleep')) return 'sleep';
    if (lowerText.includes('tired') || lowerText.includes('energy')) return 'energy';
    if (lowerText.includes('appetite') || lowerText.includes('eating')) return 'appetite';
    if (lowerText.includes('bad about yourself') || lowerText.includes('failure')) return 'selfworth';
    if (lowerText.includes('concentration') || lowerText.includes('focus')) return 'concentration';
    if (lowerText.includes('moving') || lowerText.includes('restless')) return 'movement';
    
    return 'general';
  };

  const questionType = getQuestionType();
  const opacity = 1 - (sliderPercentage * 0.3);

  // CIDT-style: Very simple, culturally appropriate illustrations
  const renderIllustration = () => {
    switch (questionType) {
      case 'interest':
        // Person sitting idle vs engaged in activity (reading/hobby)
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            {/* Person sitting */}
            <g transform="translate(60, 50)">
              {/* Head */}
              <circle cx="40" cy="20" r="15" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Eyes - more open when interested */}
              <circle cx="35" cy="18" r={sliderPercentage > 0.5 ? "1" : "2"} fill={strokeColor} />
              <circle cx="45" cy="18" r={sliderPercentage > 0.5 ? "1" : "2"} fill={strokeColor} />
              {/* Mouth - smile fades */}
              {sliderPercentage < 0.5 ? (
                <path d="M 33 24 Q 40 27 47 24" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              ) : (
                <line x1="35" y1="25" x2="45" y2="25" stroke={strokeColor} strokeWidth={strokeWidth} />
              )}
              
              {/* Body */}
              <line x1="40" y1="35" x2="40" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Arms - drooped when no interest */}
              <line x1="40" y1="45" x2={20 + sliderPercentage * 10} y2={50 + sliderPercentage * 15} stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="40" y1="45" x2={60 - sliderPercentage * 10} y2={50 + sliderPercentage * 15} stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Legs */}
              <line x1="40" y1="70" x2="30" y2="95" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="40" y1="70" x2="50" y2="95" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            {/* Activity object (book/work) - fades away */}
            <g transform="translate(130, 100)" style={{ opacity: 1 - sliderPercentage }}>
              <rect x="0" y="0" width="30" height="20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="5" y1="7" x2="25" y2="7" stroke={strokeColor} strokeWidth="1" />
              <line x1="5" y1="12" x2="20" y2="12" stroke={strokeColor} strokeWidth="1" />
            </g>
            
            {/* Caption */}
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Enjoying activities' : sliderPercentage < 0.7 ? 'Less interested' : 'No interest'}
            </text>
          </svg>
        );

      case 'mood':
        // Person with varying facial expressions and posture
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform="translate(75, 40)">
              {/* Head */}
              <circle cx="25" cy="25" r="20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Eyes */}
              <circle cx="18" cy="22" r="2" fill={strokeColor} />
              <circle cx="32" cy="22" r="2" fill={strokeColor} />
              {/* Tear when sad */}
              {sliderPercentage > 0.7 && (
                <circle cx="16" cy="30" r="2" fill={strokeColor} opacity="0.4" />
              )}
              {/* Mouth - smile to frown */}
              {sliderPercentage < 0.3 ? (
                <path d="M 17 32 Q 25 36 33 32" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              ) : sliderPercentage < 0.7 ? (
                <line x1="18" y1="33" x2="32" y2="33" stroke={strokeColor} strokeWidth={strokeWidth} />
              ) : (
                <path d="M 17 35 Q 25 31 33 35" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              )}
              
              {/* Body - slouches when sad */}
              <line x1="25" y1="45" x2={25 - sliderPercentage * 5} y2={90 + sliderPercentage * 10} stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Arms - droop more when sad */}
              <line x1="25" y1="55" x2={10 - sliderPercentage * 3} y2={70 + sliderPercentage * 10} stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="55" x2={40 + sliderPercentage * 3} y2={70 + sliderPercentage * 10} stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Legs */}
              <line x1={25 - sliderPercentage * 5} y1={90 + sliderPercentage * 10} x2="15" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1={25 - sliderPercentage * 5} y1={90 + sliderPercentage * 10} x2="35" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Feeling okay' : sliderPercentage < 0.7 ? 'Feeling low' : 'Very sad'}
            </text>
          </svg>
        );

      case 'sleep':
        // Person lying in bed - restless vs sleeping
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            {/* Bed */}
            <rect x="40" y="90" width="120" height="50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            {/* Mattress line */}
            <line x1="40" y1="105" x2="160" y2="105" stroke={strokeColor} strokeWidth="1" />
            
            {/* Person lying down */}
            <g transform="translate(70, 95)">
              {/* Head */}
              <circle cx="20" cy="8" r="10" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Eyes - open if poor sleep */}
              {sliderPercentage > 0.5 ? (
                <>
                  <circle cx="17" cy="7" r="1.5" fill={strokeColor} />
                  <circle cx="23" cy="7" r="1.5" fill={strokeColor} />
                </>
              ) : (
                <>
                  <line x1="15" y1="7" x2="19" y2="7" stroke={strokeColor} strokeWidth="1" />
                  <line x1="21" y1="7" x2="25" y2="7" stroke={strokeColor} strokeWidth="1" />
                </>
              )}
              {/* Body */}
              <ellipse cx="45" cy="15" rx="25" ry="8" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            {/* Z's when sleeping well */}
            {sliderPercentage < 0.4 && (
              <g opacity={1 - sliderPercentage * 2}>
                <text x="135" y="70" fill={strokeColor} fontSize="16" opacity="0.6">Z</text>
                <text x="145" y="60" fill={strokeColor} fontSize="14" opacity="0.4">Z</text>
                <text x="152" y="52" fill={strokeColor} fontSize="12" opacity="0.3">Z</text>
              </g>
            )}
            
            {/* Moon/Sun */}
            <circle cx="160" cy="40" r="12" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} opacity="0.5" />
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Sleeping well' : sliderPercentage < 0.7 ? 'Some trouble' : 'Poor sleep'}
            </text>
          </svg>
        );

      case 'energy':
        // Person walking/standing - energetic vs tired
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform={`translate(85, 40)`}>
              {/* Head */}
              <circle cx="25" cy="25" r="18" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Eyes */}
              <circle cx="19" cy="23" r={sliderPercentage > 0.6 ? "1" : "2"} fill={strokeColor} />
              <circle cx="31" cy="23" r={sliderPercentage > 0.6 ? "1" : "2"} fill={strokeColor} />
              {/* Mouth */}
              {sliderPercentage < 0.5 ? (
                <path d="M 18 31 Q 25 34 32 31" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              ) : (
                <path d="M 18 32 Q 25 29 32 32" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              )}
              
              {/* Body - more upright when energetic */}
              <line x1="25" y1="43" x2={25 - sliderPercentage * 8} y2={85 + sliderPercentage * 15} stroke={strokeColor} strokeWidth={strokeWidth} />
              
              {/* Arms - more energetic position */}
              <line x1="25" y1="53" x2={8 + sliderPercentage * 5} y2={65 + sliderPercentage * 15} stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="53" x2={42 - sliderPercentage * 5} y2={65 + sliderPercentage * 15} stroke={strokeColor} strokeWidth={strokeWidth} />
              
              {/* Legs - walking vs standing tired */}
              {sliderPercentage < 0.5 ? (
                <>
                  <line x1={25 - sliderPercentage * 8} y1={85 + sliderPercentage * 15} x2="15" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
                  <line x1={25 - sliderPercentage * 8} y1={85 + sliderPercentage * 15} x2="30" y2="115" stroke={strokeColor} strokeWidth={strokeWidth} />
                </>
              ) : (
                <>
                  <line x1={25 - sliderPercentage * 8} y1={85 + sliderPercentage * 15} x2="18" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
                  <line x1={25 - sliderPercentage * 8} y1={85 + sliderPercentage * 15} x2="32" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
                </>
              )}
            </g>
            
            {/* Energy lines when energetic */}
            {sliderPercentage < 0.4 && (
              <g opacity={1 - sliderPercentage * 2}>
                <line x1="65" y1="55" x2="55" y2="45" stroke={strokeColor} strokeWidth="2" />
                <line x1="70" y1="50" x2="60" y2="40" stroke={strokeColor} strokeWidth="2" />
                <line x1="135" y1="55" x2="145" y2="45" stroke={strokeColor} strokeWidth="2" />
                <line x1="130" y1="50" x2="140" y2="40" stroke={strokeColor} strokeWidth="2" />
              </g>
            )}
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Full of energy' : sliderPercentage < 0.7 ? 'Tired' : 'Exhausted'}
            </text>
          </svg>
        );

      case 'appetite':
        // Person with plate of food (Indian thali)
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform="translate(70, 30)">
              {/* Head */}
              <circle cx="30" cy="25" r="18" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Eyes */}
              <circle cx="24" cy="23" r="2" fill={strokeColor} />
              <circle cx="36" cy="23" r="2" fill={strokeColor} />
              {/* Mouth - happy eating vs no appetite */}
              {sliderPercentage < 0.5 ? (
                <path d="M 23 30 Q 30 33 37 30" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              ) : (
                <line x1="24" y1="31" x2="36" y2="31" stroke={strokeColor} strokeWidth={strokeWidth} />
              )}
              
              {/* Body */}
              <line x1="30" y1="43" x2="30" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="30" y1="50" x2="15" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="30" y1="50" x2="45" y2="60" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            {/* Thali (Indian plate) */}
            <g transform={`translate(90, 100) scale(${1 - sliderPercentage * 0.4})`}>
              {/* Main plate */}
              <ellipse cx="0" cy="0" rx="35" ry="20" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Small bowls/katoris */}
              <circle cx="-15" cy="-3" r="6" fill="none" stroke={strokeColor} strokeWidth="1" />
              <circle cx="0" cy="-5" r="6" fill="none" stroke={strokeColor} strokeWidth="1" />
              <circle cx="15" cy="-3" r="6" fill="none" stroke={strokeColor} strokeWidth="1" />
              {/* Roti */}
              <circle cx="0" cy="8" r="8" fill="none" stroke={strokeColor} strokeWidth="1" />
            </g>
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Normal appetite' : sliderPercentage < 0.7 ? 'Changed appetite' : 'Poor appetite'}
            </text>
          </svg>
        );

      case 'selfworth':
        // Person looking down vs standing confident
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform={`translate(85, 40)`}>
              {/* Head - tilts down when feeling bad */}
              <g transform={`rotate(${sliderPercentage * 20} 25 25)`}>
                <circle cx="25" cy="25" r="18" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                {/* Eyes */}
                <circle cx="19" cy={23 + sliderPercentage * 3} r="2" fill={strokeColor} />
                <circle cx="31" cy={23 + sliderPercentage * 3} r="2" fill={strokeColor} />
                {/* Mouth */}
                {sliderPercentage < 0.5 ? (
                  <path d="M 18 31 Q 25 34 32 31" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                ) : (
                  <path d="M 18 33 Q 25 30 32 33" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                )}
              </g>
              
              {/* Body - slouches when feeling bad */}
              <line x1="25" y1="43" x2={25 - sliderPercentage * 10} y2={88 + sliderPercentage * 12} stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="53" x2={10 - sliderPercentage * 5} y2={68 + sliderPercentage * 10} stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="53" x2={40 + sliderPercentage * 5} y2={68 + sliderPercentage * 10} stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1={25 - sliderPercentage * 10} y1={88 + sliderPercentage * 12} x2="15" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1={25 - sliderPercentage * 10} y1={88 + sliderPercentage * 12} x2="35" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            {/* Positive symbols when feeling good */}
            {sliderPercentage < 0.4 && (
              <g opacity={1 - sliderPercentage * 2.5}>
                <text x="60" y="60" fill={strokeColor} fontSize="20">✓</text>
                <text x="140" y="60" fill={strokeColor} fontSize="20">✓</text>
              </g>
            )}
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Feeling good' : sliderPercentage < 0.7 ? 'Some doubts' : 'Feeling bad'}
            </text>
          </svg>
        );

      case 'concentration':
        // Person trying to read/work - focused vs distracted
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform="translate(70, 40)">
              {/* Head */}
              <circle cx="30" cy="25" r="18" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              {/* Eyes - focused vs wandering */}
              {sliderPercentage < 0.5 ? (
                <>
                  <circle cx="24" cy="24" r="2" fill={strokeColor} />
                  <circle cx="36" cy="24" r="2" fill={strokeColor} />
                </>
              ) : (
                <>
                  <circle cx="22" cy="24" r="2" fill={strokeColor} />
                  <circle cx="38" cy="24" r="2" fill={strokeColor} />
                </>
              )}
              {/* Thinking/confused symbols */}
              {sliderPercentage < 0.4 ? (
                <text x="45" y="15" fill={strokeColor} fontSize="14">💭</text>
              ) : (
                <text x="45" y="15" fill={strokeColor} fontSize="16">?</text>
              )}
              
              {/* Body sitting */}
              <line x1="30" y1="43" x2="30" y2="75" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="30" y1="50" x2="15" y2="65" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="30" y1="50" x2="45" y2="65" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            {/* Book/work - tilted when can't focus */}
            <g transform={`translate(90, 110) rotate(${sliderPercentage * 20})`}>
              <rect x="-20" y="-15" width="40" height="25" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="-15" y1="-8" x2="15" y2="-8" stroke={strokeColor} strokeWidth="1" />
              <line x1="-15" y1="-2" x2="15" y2="-2" stroke={strokeColor} strokeWidth="1" />
              <line x1="-15" y1="4" x2="10" y2="4" stroke={strokeColor} strokeWidth="1" />
            </g>
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Can focus' : sliderPercentage < 0.7 ? 'Distracted' : 'Can\'t concentrate'}
            </text>
          </svg>
        );

      case 'movement':
        // Person restless vs calm
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform="translate(85, 40)">
              {/* Head */}
              <circle cx="25" cy="25" r="18" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              <circle cx="19" cy="23" r="2" fill={strokeColor} />
              <circle cx="31" cy="23" r="2" fill={strokeColor} />
              
              {/* Body */}
              <line x1="25" y1="43" x2="25" y2="85" stroke={strokeColor} strokeWidth={strokeWidth} />
              
              {/* Arms - more animated when restless */}
              {sliderPercentage > 0.5 ? (
                <>
                  <line x1="25" y1="53" x2={10 - Math.sin(Date.now() / 200) * 5} y2={65 + Math.cos(Date.now() / 200) * 5} stroke={strokeColor} strokeWidth={strokeWidth} />
                  <line x1="25" y1="53" x2={40 + Math.sin(Date.now() / 200) * 5} y2={65 - Math.cos(Date.now() / 200) * 5} stroke={strokeColor} strokeWidth={strokeWidth} />
                </>
              ) : (
                <>
                  <line x1="25" y1="53" x2="12" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} />
                  <line x1="25" y1="53" x2="38" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} />
                </>
              )}
              
              {/* Legs */}
              <line x1="25" y1="85" x2="15" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="85" x2="35" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            
            {/* Motion lines when restless */}
            {sliderPercentage > 0.5 && (
              <g opacity={sliderPercentage}>
                <path d="M 65 80 Q 60 85 65 90" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
                <path d="M 135 80 Q 140 85 135 90" fill="none" stroke={strokeColor} strokeWidth="1" opacity="0.5" />
              </g>
            )}
            
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Moving normally' : sliderPercentage < 0.7 ? 'Bit restless' : 'Very restless'}
            </text>
          </svg>
        );

      default:
        // Generic person
        return (
          <svg width="200" height="200" viewBox="0 0 200 200" style={{ opacity }}>
            <g transform="translate(85, 40)">
              <circle cx="25" cy="25" r="18" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              <circle cx="19" cy="23" r="2" fill={strokeColor} />
              <circle cx="31" cy="23" r="2" fill={strokeColor} />
              {sliderPercentage < 0.5 ? (
                <path d="M 18 31 Q 25 34 32 31" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              ) : (
                <path d="M 18 32 Q 25 29 32 32" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
              )}
              <line x1="25" y1="43" x2="25" y2="85" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="53" x2="10" y2="68" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="53" x2="40" y2="68" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="85" x2="15" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
              <line x1="25" y1="85" x2="35" y2="120" stroke={strokeColor} strokeWidth={strokeWidth} />
            </g>
            <text x="100" y="180" textAnchor="middle" fill={strokeColor} fontSize="12">
              {sliderPercentage < 0.3 ? 'Doing well' : sliderPercentage < 0.7 ? 'Some difficulty' : 'Struggling'}
            </text>
          </svg>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center items-center"
    >
      {renderIllustration()}
    </motion.div>
  );
}
