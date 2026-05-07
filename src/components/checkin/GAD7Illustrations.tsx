import { motion } from 'motion/react';

interface GAD7IllustrationProps {
  questionNumber: number;
  sliderPercentage: number;
  isDarkMode: boolean;
}

export function GAD7Illustration({ questionNumber, sliderPercentage, isDarkMode }: GAD7IllustrationProps) {
  const baseColor = isDarkMode ? '#ece5de' : '#8d654c';
  const accentColor = '#ffb757';
  const anxietyColor = sliderPercentage > 0.66 ? '#9b6bff' : sliderPercentage > 0.33 ? '#b8a0ff' : '#d4c5ff';
  
  // Question 1: Feeling nervous, anxious, or on edge
  if (questionNumber === 1) {
    const nervousness = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Person's head with tension */}
        <motion.circle 
          cx="100" cy="90" r="30" 
          fill={baseColor} 
          fillOpacity="0.2" 
          stroke={baseColor} 
          strokeWidth="2.5"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Worried eyes */}
        <motion.ellipse cx="90" cy="85" rx="3" ry="4" fill={baseColor}
          animate={{ ry: [4, 5, 4] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.ellipse cx="110" cy="85" rx="3" ry="4" fill={baseColor}
          animate={{ ry: [4, 5, 4] }} transition={{ duration: 1.5, repeat: Infinity }} />
        
        {/* Worried eyebrows */}
        <path d="M82 78 L90 79" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M110 79 L118 78" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Uncertain mouth */}
        <motion.path 
          d={`M88 102 Q100 ${100 - nervousness * 3} 112 102`}
          stroke={baseColor} 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Anxiety waves radiating */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            cx="100"
            cy="90"
            r={40 + i * 15}
            stroke={anxietyColor}
            strokeWidth="1.5"
            fill="none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, nervousness * 0.4, 0],
              scale: [0.9, 1.1, 1.3]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}
        
        {/* Body - slightly hunched */}
        <path d="M100 120 L98 160" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Arms crossed/protective */}
        <motion.path 
          d="M98 135 L80 145" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ d: nervousness > 0.5 ? "M98 135 L78 148" : "M98 135 L80 145" }}
        />
        <motion.path 
          d="M98 135 L116 148" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Question 2: Not being able to stop or control worrying
  if (questionNumber === 2) {
    const worrying = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Head */}
        <circle cx="100" cy="85" r="28" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Anxious eyes looking around */}
        <motion.circle 
          cx={92 + Math.sin(Date.now() / 1000) * worrying * 2} 
          cy="83" 
          r="3" 
          fill={baseColor}
        />
        <motion.circle 
          cx={108 + Math.sin(Date.now() / 1000) * worrying * 2} 
          cy="83" 
          r="3" 
          fill={baseColor}
        />
        
        {/* Worried mouth */}
        <path d="M90 97 Q100 94 110 97" stroke={baseColor} strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Thought bubbles/worry spirals */}
        {[0, 1, 2].map((i) => (
          <motion.g key={i}>
            <motion.circle
              cx={70 + i * 30}
              cy={50 + i * 10}
              r={8 + i * 2}
              stroke={anxietyColor}
              strokeWidth="2"
              fill="none"
              strokeDasharray="3 2"
              animate={{ 
                rotate: [0, 360],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{ 
                duration: 3 + i, 
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ originX: `${70 + i * 30}px`, originY: `${50 + i * 10}px` }}
            />
            <motion.path
              d={`M ${70 + i * 30} ${50 + i * 10} Q ${75 + i * 30} ${45 + i * 10} ${80 + i * 30} ${50 + i * 10}`}
              stroke={anxietyColor}
              strokeWidth="1.5"
              fill="none"
              animate={{ 
                opacity: [0, worrying * 0.8, 0]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          </motion.g>
        ))}
        
        {/* Spinning/looping arrows showing can't stop */}
        <motion.path
          d="M130 80 A 20 20 0 1 1 130 100"
          stroke={accentColor}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          animate={{ rotate: [0, 360] }}
          style={{ originX: '140px', originY: '90px' }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.path
          d="M130 100 L125 95 L130 95"
          fill={accentColor}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {/* Body */}
        <path d="M100 113 L100 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 125 L78 140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 125 L122 140" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Question 3: Worrying too much about different things
  if (questionNumber === 3) {
    const multiWorry = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Head - overwhelmed */}
        <circle cx="100" cy="90" r="27" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Stressed eyes */}
        <circle cx="92" cy="86" r="2.5" fill={baseColor} />
        <circle cx="108" cy="86" r="2.5" fill={baseColor} />
        <path d="M85 80 L92 82" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M108 82 L115 80" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Worried mouth */}
        <path d="M90 100 L110 100" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Multiple worry items floating around head */}
        {[
          { x: 60, y: 70, icon: '!' },
          { x: 140, y: 75, icon: '?' },
          { x: 70, y: 110, icon: '...' },
          { x: 130, y: 105, icon: '!?' },
          { x: 55, y: 95, icon: '?' }
        ].map((item, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={item.x}
              cy={item.y}
              r="12"
              fill={anxietyColor}
              fillOpacity="0.2"
              stroke={anxietyColor}
              strokeWidth="2"
              animate={{ 
                y: [item.y, item.y - 5, item.y],
                opacity: i < multiWorry * 5 ? [0.4, 0.8, 0.4] : 0.2
              }}
              transition={{ 
                duration: 2 + i * 0.3, 
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
            <motion.text
              x={item.x}
              y={item.y + 4}
              fontSize="12"
              fill={baseColor}
              textAnchor="middle"
              animate={{ opacity: i < multiWorry * 5 ? [0.5, 1, 0.5] : 0.3 }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            >
              {item.icon}
            </motion.text>
          </motion.g>
        ))}
        
        {/* Body */}
        <path d="M100 117 L100 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 128 L80 142" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 128 L120 142" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  // Question 4: Trouble relaxing
  if (questionNumber === 4) {
    const tension = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Person trying to relax but can't */}
        <circle cx="100" cy="85" r="26" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Tense eyes */}
        <motion.line x1="88" y1="82" x2="94" y2="82" stroke={baseColor} strokeWidth="2.5" strokeLinecap="round"
          animate={{ scaleX: [1, 0.8, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.line x1="106" y1="82" x2="112" y2="82" stroke={baseColor} strokeWidth="2.5" strokeLinecap="round"
          animate={{ scaleX: [1, 0.8, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        
        {/* Tense mouth */}
        <line x1="92" y1="97" x2="108" y2="97" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Body - trying to sit still but fidgety */}
        <motion.path 
          d="M100 111 L100 150" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ 
            d: tension > 0.4 ? [
              "M100 111 L100 150",
              "M100 111 L102 150",
              "M100 111 L98 150",
              "M100 111 L100 150"
            ] : "M100 111 L100 150"
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Tense shoulders */}
        <motion.path 
          d="M100 120 L75 130" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ 
            d: tension > 0.3 ? [
              "M100 120 L75 130",
              "M100 118 L75 128",
              "M100 120 L75 130"
            ] : "M100 120 L75 130"
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.path 
          d="M100 120 L125 130" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ 
            d: tension > 0.3 ? [
              "M100 120 L125 130",
              "M100 118 L125 128",
              "M100 120 L125 130"
            ] : "M100 120 L125 130"
          }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        
        {/* Tension marks */}
        {tension > 0.5 && (
          <>
            <motion.path d="M70 115 L65 110" stroke={anxietyColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.path d="M130 115 L135 110" stroke={anxietyColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} />
            <motion.path d="M75 85 L70 85" stroke={anxietyColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.25 }} />
            <motion.path d="M125 85 L130 85" stroke={anxietyColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.75 }} />
          </>
        )}
        
        {/* Failed relaxation symbol - meditation pose but shaking */}
        <motion.circle 
          cx="140" 
          cy="140" 
          r="10" 
          stroke={accentColor} 
          strokeWidth="2" 
          fill="none"
          strokeDasharray="2 3"
          animate={{ rotate: 360 }}
          style={{ originX: '140px', originY: '140px' }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    );
  }

  // Question 5: Being so restless that it's hard to sit still
  if (questionNumber === 5) {
    const restlessness = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Head - can't stay still */}
        <motion.circle 
          cx="100" cy="85" r="26" 
          fill={baseColor} 
          fillOpacity="0.2" 
          stroke={baseColor} 
          strokeWidth="2.5"
          animate={{ 
            x: restlessness > 0.3 ? [-2, 2, -2] : 0,
            y: restlessness > 0.3 ? [-1, 1, -1] : 0
          }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
        
        {/* Restless eyes */}
        <motion.circle cx="92" cy="83" r="3" fill={baseColor}
          animate={{ cx: restlessness > 0.4 ? [90, 94, 90] : 92 }}
          transition={{ duration: 1.2, repeat: Infinity }} />
        <motion.circle cx="108" cy="83" r="3" fill={baseColor}
          animate={{ cx: restlessness > 0.4 ? [106, 110, 106] : 108 }}
          transition={{ duration: 1.2, repeat: Infinity }} />
        
        {/* Tense mouth */}
        <path d="M92 96 L108 96" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Body - constantly moving */}
        <motion.g
          animate={{ 
            x: restlessness > 0.3 ? [-3, 3, -3] : 0,
            rotate: restlessness > 0.5 ? [-2, 2, -2] : 0
          }}
          style={{ originX: '100px', originY: '130px' }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          <path d="M100 111 L100 150" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
          
          {/* Fidgeting arms */}
          <motion.path 
            d="M100 120 L78 135" 
            stroke={baseColor} 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ 
              d: [
                "M100 120 L78 135",
                "M100 120 L75 138",
                "M100 120 L80 132",
                "M100 120 L78 135"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <motion.path 
            d="M100 120 L122 135" 
            stroke={baseColor} 
            strokeWidth="3" 
            strokeLinecap="round"
            animate={{ 
              d: [
                "M100 120 L122 135",
                "M100 120 L125 138",
                "M100 120 L120 132",
                "M100 120 L122 135"
              ]
            }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.5 }}
          />
        </motion.g>
        
        {/* Motion lines showing movement */}
        {restlessness > 0.5 && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.path
                key={i}
                d={`M ${85 + i * 10} ${160 + i * 5} Q ${90 + i * 10} ${155 + i * 5} ${95 + i * 10} ${160 + i * 5}`}
                stroke={anxietyColor}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1, 0],
                  opacity: [0, 0.6, 0]
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </>
        )}
        
        {/* Tapping foot indicator */}
        <motion.circle
          cx="100"
          cy="170"
          r="6"
          fill={accentColor}
          fillOpacity="0.4"
          animate={{ 
            scale: restlessness > 0.3 ? [1, 1.3, 1] : 1,
            opacity: restlessness > 0.3 ? [0.4, 0.7, 0.4] : 0.4
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      </svg>
    );
  }

  // Question 6: Becoming easily annoyed or irritable
  if (questionNumber === 6) {
    const irritability = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Head - irritated */}
        <circle cx="100" cy="88" r="28" fill={baseColor} fillOpacity="0.2" stroke={baseColor} strokeWidth="2.5" />
        
        {/* Annoyed eyebrows */}
        <motion.path 
          d="M84 78 L94 81" 
          stroke={baseColor} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          animate={{ 
            d: irritability > 0.5 ? "M84 76 L94 80" : "M84 78 L94 81"
          }}
        />
        <motion.path 
          d="M106 81 L116 78" 
          stroke={baseColor} 
          strokeWidth="2.5" 
          strokeLinecap="round"
          animate={{ 
            d: irritability > 0.5 ? "M106 80 L116 76" : "M106 81 L116 78"
          }}
        />
        
        {/* Irritated eyes */}
        <circle cx="91" cy="86" r="2.5" fill={baseColor} />
        <circle cx="109" cy="86" r="2.5" fill={baseColor} />
        
        {/* Annoyed mouth */}
        <motion.path 
          d="M88 100 Q100 97 112 100" 
          stroke={baseColor} 
          strokeWidth="2" 
          fill="none"
          strokeLinecap="round"
        />
        
        {/* Steam/irritation coming from head */}
        {irritability > 0.4 && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.g key={i}>
                <motion.path
                  d={`M ${85 + i * 15} 60 Q ${87 + i * 15} 50 ${85 + i * 15} 40`}
                  stroke={anxietyColor}
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: [0, 1],
                    opacity: [0, irritability * 0.8, 0],
                    y: [0, -10]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    delay: i * 0.3
                  }}
                />
              </motion.g>
            ))}
          </>
        )}
        
        {/* Body - tense posture */}
        <path d="M100 116 L100 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Arms crossed irritably */}
        <path d="M100 125 L78 135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        <path d="M100 125 L122 135" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Small irritation symbols */}
        {irritability > 0.6 && (
          <>
            <motion.text x="130" y="95" fontSize="16" fill="#ff6b6b"
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}>
              !
            </motion.text>
            <motion.text x="62" y="100" fontSize="14" fill="#ff6b6b"
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>
              !
            </motion.text>
          </>
        )}
      </svg>
    );
  }

  // Question 7: Feeling afraid as if something awful might happen
  if (questionNumber === 7) {
    const fear = sliderPercentage;
    return (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        {/* Person looking afraid/worried */}
        <motion.circle 
          cx="100" cy="90" r="28" 
          fill={baseColor} 
          fillOpacity="0.2" 
          stroke={baseColor} 
          strokeWidth="2.5"
          animate={{ 
            scale: fear > 0.5 ? [1, 0.98, 1] : 1
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Wide fearful eyes */}
        <motion.circle 
          cx="90" cy="85" 
          r={3 + fear * 3} 
          fill={baseColor}
        />
        <motion.circle 
          cx="110" cy="85" 
          r={3 + fear * 3} 
          fill={baseColor}
        />
        
        {/* Raised worried eyebrows */}
        <path d="M82 76 L92 77" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        <path d="M108 77 L118 76" stroke={baseColor} strokeWidth="2" strokeLinecap="round" />
        
        {/* Fearful mouth */}
        <motion.ellipse
          cx="100" cy="100" 
          rx={5 + fear * 4} 
          ry={6 + fear * 5}
          fill="none"
          stroke={baseColor}
          strokeWidth="2"
        />
        
        {/* Ominous shadow/threat looming */}
        {fear > 0.3 && (
          <motion.g>
            <motion.path
              d="M140 50 Q150 70 145 90 Q140 110 150 130"
              stroke={anxietyColor}
              strokeWidth="3"
              fill="none"
              opacity={fear * 0.5}
              strokeLinecap="round"
              animate={{ 
                d: [
                  "M140 50 Q150 70 145 90 Q140 110 150 130",
                  "M142 50 Q152 70 147 90 Q142 110 152 130",
                  "M140 50 Q150 70 145 90 Q140 110 150 130"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.circle
              cx="145"
              cy="60"
              r="15"
              fill={anxietyColor}
              fillOpacity={fear * 0.2}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [fear * 0.2, fear * 0.4, fear * 0.2]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.g>
        )}
        
        {/* Protective/defensive posture */}
        <path d="M100 118 L100 155" stroke={baseColor} strokeWidth="3" strokeLinecap="round" />
        
        {/* Arms up defensively */}
        <motion.path 
          d="M100 125 L78 115" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ 
            d: fear > 0.5 ? [
              "M100 125 L78 115",
              "M100 125 L76 112",
              "M100 125 L78 115"
            ] : "M100 125 L78 115"
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.path 
          d="M100 125 L122 115" 
          stroke={baseColor} 
          strokeWidth="3" 
          strokeLinecap="round"
          animate={{ 
            d: fear > 0.5 ? [
              "M100 125 L122 115",
              "M100 125 L124 112",
              "M100 125 L122 115"
            ] : "M100 125 L122 115"
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        
        {/* Trembling effect */}
        {fear > 0.6 && (
          <>
            <motion.path d="M70 140 L68 135" stroke={anxietyColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }} />
            <motion.path d="M130 140 L132 135" stroke={anxietyColor} strokeWidth="2" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} />
          </>
        )}
      </svg>
    );
  }

  return null;
}
