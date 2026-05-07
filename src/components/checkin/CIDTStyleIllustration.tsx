import { motion } from 'motion/react';

interface CIDTStyleIllustrationProps {
  questionText: string;
  sliderPercentage: number;
  isDarkMode: boolean;
}

// CIDT-style illustrations inspired by the reference image
// Simple, colorful, friendly illustrations showing relatable scenarios
export function CIDTStyleIllustration({ questionText, sliderPercentage, isDarkMode }: CIDTStyleIllustrationProps) {
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
    if (lowerText.includes('better off dead') || lowerText.includes('hurting')) return 'crisis';
    
    // PSS
    if (lowerText.includes('upset') && lowerText.includes('unexpectedly')) return 'upset';
    if (lowerText.includes('control')) return 'control';
    if (lowerText.includes('nervous') || lowerText.includes('stressed')) return 'stressed';
    if (lowerText.includes('confident')) return 'confident';
    if (lowerText.includes('going your way')) return 'optimistic';
    if (lowerText.includes('cope')) return 'overwhelmed';
    if (lowerText.includes('irritation')) return 'irritation';
    if (lowerText.includes('on top')) return 'ontop';
    if (lowerText.includes('anger')) return 'anger';
    if (lowerText.includes('difficult') || lowerText.includes('piling')) return 'difficulties';
    
    return 'general';
  };

  const questionType = getQuestionType();

  // Colors for the illustrations
  const skinTone = '#f4c2a6';
  const hairColor = '#3d2817';
  const shirtColor1 = '#ff6b6b';
  const shirtColor2 = '#4ecdc4';
  const pantsColor = '#45b7d1';
  const objectColor = '#ffb757';
  const neutralColor = isDarkMode ? '#ddc4af' : '#8d654c';
  
  const renderIllustration = () => {
    switch (questionType) {
      case 'interest':
        // Person sitting with hobby items (book, craft) - engaged vs disengaged
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Background circle */}
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            {/* Person sitting */}
            <g transform={`translate(60, 50)`}>
              {/* Head */}
              <circle cx="20" cy="15" r="12" fill={skinTone} />
              {/* Hair */}
              <path d="M 10 10 Q 20 5 30 10 L 30 15 Q 20 12 10 15 Z" fill={hairColor} />
              {/* Face - eyes more open when interested */}
              <circle cx="16" cy="16" r={sliderPercentage > 0.5 ? 1 : 1.5} fill="#000" />
              <circle cx="24" cy="16" r={sliderPercentage > 0.5 ? 1 : 1.5} fill="#000" />
              {/* Smile fades */}
              {sliderPercentage < 0.5 && (
                <path d="M 15 20 Q 20 22 25 20" stroke="#000" fill="none" strokeWidth="1" />
              )}
              
              {/* Body */}
              <rect x="12" y="27" width="16" height="20" rx="3" fill={shirtColor1} />
              
              {/* Arms - holding book when interested */}
              <motion.g
                animate={{ 
                  y: sliderPercentage > 0.5 ? 5 : 0,
                  opacity: 1 - (sliderPercentage * 0.3)
                }}
              >
                <rect x="8" y="30" width="4" height="12" rx="2" fill={skinTone} />
                <rect x="28" y="30" width="4" height="12" rx="2" fill={skinTone} />
              </motion.g>
              
              {/* Legs */}
              <rect x="14" y="47" width="5" height="15" rx="2" fill={pantsColor} />
              <rect x="21" y="47" width="5" height="15" rx="2" fill={pantsColor} />
            </g>
            
            {/* Activity object (book) - fades when not interested */}
            <motion.g 
              transform="translate(100, 90)"
              animate={{ 
                opacity: 1 - sliderPercentage,
                scale: 1 - (sliderPercentage * 0.3)
              }}
            >
              <rect x="0" y="0" width="25" height="18" rx="2" fill={objectColor} stroke={neutralColor} strokeWidth="1" />
              <line x1="3" y1="6" x2="22" y2="6" stroke={neutralColor} strokeWidth="1" opacity="0.5" />
              <line x1="3" y1="10" x2="18" y2="10" stroke={neutralColor} strokeWidth="1" opacity="0.5" />
            </motion.g>
          </motion.svg>
        );

      case 'mood':
        // Person with changing facial expression and posture
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <g transform={`translate(65, 40)`}>
              {/* Head */}
              <motion.g
                animate={{ rotate: sliderPercentage * 10 }}
                style={{ transformOrigin: '15px 20px' }}
              >
                <circle cx="15" cy="20" r="14" fill={skinTone} />
                {/* Hair */}
                <ellipse cx="15" cy="12" rx="14" ry="8" fill={hairColor} />
                
                {/* Eyes */}
                <circle cx="11" cy="19" r="2" fill="#000" />
                <circle cx="19" cy="19" r="2" fill="#000" />
                
                {/* Tear when very sad */}
                {sliderPercentage > 0.7 && (
                  <motion.ellipse
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    cx="10" cy="26" rx="1.5" ry="3" fill="#4ecdc4" opacity="0.6"
                  />
                )}
                
                {/* Mouth - changes from smile to frown */}
                {sliderPercentage < 0.3 ? (
                  <path d="M 10 24 Q 15 27 20 24" stroke="#000" fill="none" strokeWidth="1.5" />
                ) : sliderPercentage < 0.7 ? (
                  <line x1="10" y1="25" x2="20" y2="25" stroke="#000" strokeWidth="1.5" />
                ) : (
                  <path d="M 10 26 Q 15 23 20 26" stroke="#000" fill="none" strokeWidth="1.5" />
                )}
              </motion.g>
              
              {/* Body - slouches when sad */}
              <motion.g
                animate={{ x: -sliderPercentage * 8, y: sliderPercentage * 5 }}
              >
                <rect x="7" y="34" width="16" height="22" rx="3" fill={shirtColor2} />
                {/* Arms - droop when sad */}
                <motion.rect 
                  x="3" y="38" width="4" height="14" rx="2" fill={skinTone}
                  animate={{ rotate: sliderPercentage * -15 }}
                  style={{ transformOrigin: '5px 38px' }}
                />
                <motion.rect 
                  x="23" y="38" width="4" height="14" rx="2" fill={skinTone}
                  animate={{ rotate: sliderPercentage * 15 }}
                  style={{ transformOrigin: '25px 38px' }}
                />
                
                {/* Legs */}
                <rect x="9" y="56" width="5" height="16" rx="2" fill={pantsColor} />
                <rect x="16" y="56" width="5" height="16" rx="2" fill={pantsColor} />
              </motion.g>
            </g>
          </motion.svg>
        );

      case 'sleep':
        // Person in bed - sleeping well vs restless
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            {/* Bed */}
            <rect x="30" y="80" width="100" height="45" rx="5" fill="#8d654c" opacity="0.3" />
            <rect x="30" y="85" width="100" height="30" rx="3" fill={objectColor} opacity="0.4" />
            
            {/* Pillow */}
            <ellipse cx="60" cy="90" rx="18" ry="8" fill="#fff" opacity="0.6" />
            
            {/* Person lying down */}
            <g transform="translate(50, 85)">
              {/* Head on pillow */}
              <ellipse cx="10" cy="5" rx="10" ry="7" fill={skinTone} />
              {/* Hair */}
              <ellipse cx="10" cy="2" rx="10" ry="5" fill={hairColor} />
              
              {/* Eyes - closed when sleeping, open when not */}
              {sliderPercentage > 0.5 ? (
                <>
                  <circle cx="7" cy="5" r="1.5" fill="#000" />
                  <circle cx="13" cy="5" r="1.5" fill="#000" />
                </>
              ) : (
                <>
                  <line x1="6" y1="5" x2="8" y2="5" stroke="#000" strokeWidth="1" />
                  <line x1="12" y1="5" x2="14" y2="5" stroke="#000" strokeWidth="1" />
                </>
              )}
              
              {/* Body under blanket */}
              <ellipse cx="35" cy="12" rx="25" ry="10" fill={shirtColor2} opacity="0.6" />
            </g>
            
            {/* Z's when sleeping well */}
            {sliderPercentage < 0.4 && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <text x="100" y="60" fill={neutralColor} fontSize="14" fontWeight="bold">Z</text>
                <text x="110" y="50" fill={neutralColor} fontSize="12" fontWeight="bold" opacity="0.7">Z</text>
                <text x="118" y="42" fill={neutralColor} fontSize="10" fontWeight="bold" opacity="0.5">Z</text>
              </motion.g>
            )}
            
            {/* Moon */}
            <g transform="translate(120, 35)">
              <circle cx="0" cy="0" r="10" fill="#ffb757" opacity="0.6" />
              <circle cx="3" cy="-2" r="8" fill={isDarkMode ? '#1a1410' : '#ece5de'} opacity="0.6" />
            </g>
          </motion.svg>
        );

      case 'energy':
        // Person walking/standing - energetic vs tired
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <motion.g 
              transform="translate(70, 35)"
              animate={{ y: sliderPercentage * 10 }}
            >
              {/* Head */}
              <circle cx="10" cy="18" r="13" fill={skinTone} />
              {/* Hair */}
              <ellipse cx="10" cy="10" rx="13" ry="9" fill={hairColor} />
              
              {/* Eyes - tired when low energy */}
              {sliderPercentage > 0.6 ? (
                <>
                  <line x1="6" y1="17" x2="8" y2="17" stroke="#000" strokeWidth="1.5" />
                  <line x1="12" y1="17" x2="14" y2="17" stroke="#000" strokeWidth="1.5" />
                </>
              ) : (
                <>
                  <circle cx="7" cy="17" r="1.5" fill="#000" />
                  <circle cx="13" cy="17" r="1.5" fill="#000" />
                </>
              )}
              
              {/* Mouth */}
              {sliderPercentage < 0.5 ? (
                <path d="M 6 22 Q 10 24 14 22" stroke="#000" fill="none" strokeWidth="1" />
              ) : (
                <path d="M 6 23 Q 10 21 14 23" stroke="#000" fill="none" strokeWidth="1" />
              )}
              
              {/* Body */}
              <motion.rect 
                x="2" y="31" width="16" height="24" rx="3" fill={shirtColor1}
                animate={{ skewX: -sliderPercentage * 5 }}
              />
              
              {/* Arms - energetic vs drooping */}
              <motion.rect 
                x="-2" y="35" width="4" height="15" rx="2" fill={skinTone}
                animate={{ rotate: sliderPercentage > 0.5 ? 20 : -15 }}
                style={{ transformOrigin: '0px 35px' }}
              />
              <motion.rect 
                x="18" y="35" width="4" height="15" rx="2" fill={skinTone}
                animate={{ rotate: sliderPercentage > 0.5 ? -20 : 15 }}
                style={{ transformOrigin: '22px 35px' }}
              />
              
              {/* Legs - walking vs standing tired */}
              <motion.rect 
                x="4" y="55" width="5" height="18" rx="2" fill={pantsColor}
                animate={{ rotate: sliderPercentage > 0.5 ? 0 : 10 }}
                style={{ transformOrigin: '6.5px 55px' }}
              />
              <motion.rect 
                x="11" y="55" width="5" height="18" rx="2" fill={pantsColor}
                animate={{ rotate: sliderPercentage > 0.5 ? 0 : -10 }}
                style={{ transformOrigin: '13.5px 55px' }}
              />
            </motion.g>
            
            {/* Energy indicator - sparkles when energetic */}
            {sliderPercentage < 0.4 && (
              <motion.g
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  scale: [0.8, 1, 0.8]
                }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <text x="50" y="45" fill="#ffb757" fontSize="16">✨</text>
                <text x="105" y="45" fill="#ffb757" fontSize="16">✨</text>
              </motion.g>
            )}
          </motion.svg>
        );

      case 'appetite':
        // Person with Indian food (thali)
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <g transform="translate(60, 30)">
              {/* Head */}
              <circle cx="20" cy="18" r="13" fill={skinTone} />
              {/* Hair */}
              <ellipse cx="20" cy="10" rx="13" ry="8" fill={hairColor} />
              
              {/* Eyes */}
              <circle cx="16" cy="17" r="1.5" fill="#000" />
              <circle cx="24" cy="17" r="1.5" fill="#000" />
              
              {/* Mouth - happy eating vs neutral */}
              {sliderPercentage < 0.5 ? (
                <path d="M 16 22 Q 20 24 24 22" stroke="#000" fill="none" strokeWidth="1" />
              ) : (
                <line x1="16" y1="22" x2="24" y2="22" stroke="#000" strokeWidth="1" />
              )}
              
              {/* Body */}
              <rect x="12" y="31" width="16" height="20" rx="3" fill={shirtColor2} />
              
              {/* Arms */}
              <rect x="8" y="34" width="4" height="12" rx="2" fill={skinTone} />
              <rect x="28" y="34" width="4" height="12" rx="2" fill={skinTone} />
            </g>
            
            {/* Indian Thali - shrinks when poor appetite */}
            <motion.g 
              transform="translate(80, 95)"
              animate={{ scale: 1 - (sliderPercentage * 0.5) }}
            >
              {/* Main plate */}
              <ellipse cx="0" cy="0" rx="30" ry="18" fill="#fff" stroke={neutralColor} strokeWidth="2" />
              
              {/* Small bowls (katoris) */}
              <circle cx="-12" cy="-4" r="5" fill={objectColor} stroke={neutralColor} strokeWidth="1" />
              <circle cx="0" cy="-6" r="5" fill="#ff6b6b" stroke={neutralColor} strokeWidth="1" />
              <circle cx="12" cy="-4" r="5" fill="#4ecdc4" stroke={neutralColor} strokeWidth="1" />
              
              {/* Roti/chapati */}
              <ellipse cx="0" cy="6" rx="8" ry="6" fill="#f4e4c1" stroke={neutralColor} strokeWidth="1" />
              <circle cx="-2" cy="5" r="1" fill={neutralColor} opacity="0.3" />
              <circle cx="2" cy="7" r="1" fill={neutralColor} opacity="0.3" />
            </motion.g>
          </motion.svg>
        );

      case 'selfworth':
        // Person looking down vs standing confident
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <g transform="translate(70, 40)">
              {/* Head - tilts down when feeling bad */}
              <motion.g
                animate={{ rotate: sliderPercentage * 20, y: sliderPercentage * 5 }}
                style={{ transformOrigin: '10px 15px' }}
              >
                <circle cx="10" cy="15" r="12" fill={skinTone} />
                <ellipse cx="10" cy="8" rx="12" ry="7" fill={hairColor} />
                
                {/* Eyes looking down when feeling bad */}
                <circle cx="7" cy={15 + sliderPercentage * 2} r="1.5" fill="#000" />
                <circle cx="13" cy={15 + sliderPercentage * 2} r="1.5" fill="#000" />
                
                {/* Mouth */}
                {sliderPercentage < 0.5 ? (
                  <path d="M 6 19 Q 10 21 14 19" stroke="#000" fill="none" strokeWidth="1" />
                ) : (
                  <path d="M 6 20 Q 10 18 14 20" stroke="#000" fill="none" strokeWidth="1" />
                )}
              </motion.g>
              
              {/* Body - slouches */}
              <motion.g
                animate={{ x: -sliderPercentage * 6 }}
              >
                <rect x="2" y="27" width="16" height="24" rx="3" fill={shirtColor1} />
                <rect x="-2" y="31" width="4" height="14" rx="2" fill={skinTone} />
                <rect x="18" y="31" width="4" height="14" rx="2" fill={skinTone} />
                <rect x="4" y="51" width="5" height="17" rx="2" fill={pantsColor} />
                <rect x="11" y="51" width="5" height="17" rx="2" fill={pantsColor} />
              </motion.g>
            </g>
            
            {/* Positive symbols when feeling confident */}
            {sliderPercentage < 0.4 && (
              <motion.g
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <text x="45" y="50" fill="#4ecdc4" fontSize="18">✓</text>
                <text x="105" y="50" fill="#4ecdc4" fontSize="18">✓</text>
              </motion.g>
            )}
          </motion.svg>
        );

      case 'concentration':
        // Person reading/working - focused vs distracted
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <g transform="translate(65, 45)">
              {/* Head */}
              <circle cx="15" cy="15" r="12" fill={skinTone} />
              <ellipse cx="15" cy="8" rx="12" ry="7" fill={hairColor} />
              
              {/* Eyes - focused vs wandering */}
              {sliderPercentage < 0.5 ? (
                <>
                  <circle cx="11" cy="15" r="1.5" fill="#000" />
                  <circle cx="19" cy="15" r="1.5" fill="#000" />
                </>
              ) : (
                <>
                  <circle cx="10" cy="15" r="1.5" fill="#000" />
                  <circle cx="20" cy="15" r="1.5" fill="#000" />
                </>
              )}
              
              {/* Thought bubble - clear when focused, question mark when confused */}
              {sliderPercentage < 0.4 ? (
                <g transform="translate(30, 5)">
                  <circle cx="0" cy="0" r="6" fill="#fff" stroke={neutralColor} strokeWidth="1" opacity="0.8" />
                  <text x="-2" y="3" fill={neutralColor} fontSize="8">💭</text>
                </g>
              ) : (
                <g transform="translate(30, 5)">
                  <circle cx="0" cy="0" r="7" fill="#fff" stroke={neutralColor} strokeWidth="1" opacity="0.8" />
                  <text x="-3" y="5" fill={neutralColor} fontSize="10" fontWeight="bold">?</text>
                </g>
              )}
              
              {/* Body sitting */}
              <rect x="7" y="27" width="16" height="20" rx="3" fill={shirtColor2} />
              <rect x="3" y="30" width="4" height="12" rx="2" fill={skinTone} />
              <rect x="23" y="30" width="4" height="12" rx="2" fill={skinTone} />
            </g>
            
            {/* Book - tilts when can't focus */}
            <motion.g 
              transform="translate(80, 100)"
              animate={{ rotate: sliderPercentage * 25 }}
            >
              <rect x="-18" y="-12" width="36" height="24" rx="2" fill={objectColor} stroke={neutralColor} strokeWidth="1.5" />
              <line x1="-14" y1="-6" x2="14" y2="-6" stroke={neutralColor} strokeWidth="1" opacity="0.4" />
              <line x1="-14" y1="0" x2="14" y2="0" stroke={neutralColor} strokeWidth="1" opacity="0.4" />
              <line x1="-14" y1="6" x2="10" y2="6" stroke={neutralColor} strokeWidth="1" opacity="0.4" />
            </motion.g>
          </motion.svg>
        );

      case 'movement':
      case 'stressed':
      case 'upset':
        // Person showing stress/restlessness
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <g transform="translate(70, 40)">
              {/* Head */}
              <circle cx="10" cy="15" r="12" fill={skinTone} />
              <ellipse cx="10" cy="8" rx="12" ry="7" fill={hairColor} />
              
              {/* Worried eyes */}
              <circle cx="7" cy="15" r="2" fill="#000" />
              <circle cx="13" cy="15" r="2" fill="#000" />
              
              {/* Worried mouth */}
              <path d="M 6 20 Q 10 18 14 20" stroke="#000" fill="none" strokeWidth="1" />
              
              {/* Sweat drops when stressed */}
              {sliderPercentage > 0.5 && (
                <>
                  <motion.ellipse
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    cx="3" cy="12" rx="1.5" ry="2" fill="#4ecdc4" opacity="0.6"
                  />
                  <motion.ellipse
                    animate={{ y: [0, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}
                    cx="17" cy="12" rx="1.5" ry="2" fill="#4ecdc4" opacity="0.6"
                  />
                </>
              )}
              
              {/* Body */}
              <rect x="2" y="27" width="16" height="24" rx="3" fill={shirtColor1} />
              
              {/* Arms - tense/moving when stressed */}
              <motion.rect 
                x="-2" y="31" width="4" height="14" rx="2" fill={skinTone}
                animate={{ 
                  rotate: sliderPercentage > 0.5 ? [0, -10, 0] : 0 
                }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ transformOrigin: '0px 31px' }}
              />
              <motion.rect 
                x="18" y="31" width="4" height="14" rx="2" fill={skinTone}
                animate={{ 
                  rotate: sliderPercentage > 0.5 ? [0, 10, 0] : 0 
                }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                style={{ transformOrigin: '20px 31px' }}
              />
              
              {/* Legs */}
              <rect x="4" y="51" width="5" height="17" rx="2" fill={pantsColor} />
              <rect x="11" y="51" width="5" height="17" rx="2" fill={pantsColor} />
            </g>
            
            {/* Stress lines */}
            {sliderPercentage > 0.5 && (
              <motion.g
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <path d="M 55 55 Q 50 60 55 65" stroke={neutralColor} fill="none" strokeWidth="2" />
                <path d="M 105 55 Q 110 60 105 65" stroke={neutralColor} fill="none" strokeWidth="2" />
              </motion.g>
            )}
          </motion.svg>
        );

      default:
        // General person
        return (
          <motion.svg 
            width="160" 
            height="160" 
            viewBox="0 0 160 160"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <circle cx="80" cy="80" r="70" fill={isDarkMode ? '#2a2218' : '#f5f5f5'} opacity="0.5" />
            
            <g transform="translate(70, 45)">
              <circle cx="10" cy="15" r="12" fill={skinTone} />
              <ellipse cx="10" cy="8" rx="12" ry="7" fill={hairColor} />
              <circle cx="7" cy="15" r="1.5" fill="#000" />
              <circle cx="13" cy="15" r="1.5" fill="#000" />
              <path d="M 6 19 Q 10 21 14 19" stroke="#000" fill="none" strokeWidth="1" />
              
              <rect x="2" y="27" width="16" height="24" rx="3" fill={shirtColor1} />
              <rect x="-2" y="31" width="4" height="14" rx="2" fill={skinTone} />
              <rect x="18" y="31" width="4" height="14" rx="2" fill={skinTone} />
              <rect x="4" y="51" width="5" height="17" rx="2" fill={pantsColor} />
              <rect x="11" y="51" width="5" height="17" rx="2" fill={pantsColor} />
            </g>
          </motion.svg>
        );
    }
  };

  return (
    <div className="flex justify-center items-center h-full">
      {renderIllustration()}
    </div>
  );
}
