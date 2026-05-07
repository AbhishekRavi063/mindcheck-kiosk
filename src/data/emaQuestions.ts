export interface EMAQuestion {
  id: number;
  text: string;
  type: 'buttons' | 'slider' | 'multi-choice' | 'text';
  options?: string[];
  sliderConfig?: {
    min: number;
    max: number;
    leftEmoji: string;
    rightEmoji: string;
    leftLabel: string;
    rightLabel: string;
  };
  subQuestions?: {
    text: string;
    options: string[];
  }[];
  placeholder?: string;
  optional?: boolean;
}

export interface EMASection {
  id: string;
  name: string;
  icon: string;
  theme: string;
  questions: EMAQuestion[];
}

export const morningEMAQuestions: EMAQuestion[] = [
  {
    id: 1,
    text: 'How long were you in bed last night?',
    type: 'buttons',
    options: ['<5h', '5-6h', '6-7h', '7-8h', '>8h']
  },
  {
    id: 2,
    text: 'How was your sleep?',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😣',
      rightEmoji: '😊',
      leftLabel: 'very bad',
      rightLabel: 'very good'
    }
  },
  {
    id: 3,
    text: 'How do you feel after waking up?',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😵',
      rightEmoji: '🙂',
      leftLabel: 'Groggy',
      rightLabel: 'Fresh'
    }
  }
];

export const afternoonEMAQuestions: EMAQuestion[] = [
  {
    id: 1,
    text: "How's your appetite today?",
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '🍽️',
      rightEmoji: '😋',
      leftLabel: 'Not hungry',
      rightLabel: 'Always hungry'
    }
  },
  {
    id: 2,
    text: 'Food choices today',
    type: 'multi-choice',
    subQuestions: [
      {
        text: 'Sugar today?',
        options: ['A lot', 'A little', 'Avoided']
      },
      {
        text: 'Junk food today?',
        options: ['A lot', 'A little', 'Avoided']
      },
      {
        text: 'Alcohol?',
        options: ['A lot', 'A little', 'Avoided']
      }
    ]
  },
  {
    id: 3,
    text: 'Water intake',
    type: 'buttons',
    options: ['💧 <500ml', '💧 ~1L', '💧 ~2L', '💧 3L+']
  },
  {
    id: 4,
    text: 'Physical activity',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '🛋️',
      rightEmoji: '🚶',
      leftLabel: 'Nothing',
      rightLabel: 'Physically active'
    }
  }
];

export const eveningEMAQuestions: EMAQuestion[] = [
  {
    id: 1,
    text: 'Alertness',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😴',
      rightEmoji: '⚡',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 2,
    text: 'Happiness',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😞',
      rightEmoji: '😊',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 3,
    text: 'Sadness',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😊',
      rightEmoji: '😢',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 4,
    text: 'Tension',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😌',
      rightEmoji: '😰',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 5,
    text: 'Calm',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😟',
      rightEmoji: '🧘',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 6,
    text: 'Tiredness',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '💪',
      rightEmoji: '😩',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 7,
    text: 'Sleepiness',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '👀',
      rightEmoji: '😪',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 8,
    text: 'Irritability',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😇',
      rightEmoji: '😤',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 9,
    text: 'Motivation',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '🫠',
      rightEmoji: '🔥',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  },
  {
    id: 10,
    text: 'Effort',
    type: 'slider',
    sliderConfig: {
      min: 0,
      max: 100,
      leftEmoji: '😴',
      rightEmoji: '💯',
      leftLabel: 'Low',
      rightLabel: 'High'
    }
  }
];

export const nightEMAQuestions: EMAQuestion[] = [
  {
    id: 1,
    text: 'Did you take your medications today?',
    type: 'buttons',
    options: ['✔️ Yes', '◻️ Sometimes', '✖️ No']
  },
  {
    id: 2,
    text: 'What are you grateful for?',
    type: 'text',
    placeholder: 'Type here...',
    optional: true
  }
];

export const emaSections: EMASection[] = [
  {
    id: 'morning',
    name: 'Morning Check-in',
    icon: '☀️',
    theme: 'Sleep & wake',
    questions: morningEMAQuestions
  },
  {
    id: 'afternoon',
    name: 'Afternoon Check-in',
    icon: '🌤️',
    theme: 'Diet, water & activity',
    questions: afternoonEMAQuestions
  },
  {
    id: 'evening',
    name: 'Evening Check-in',
    icon: '🌆',
    theme: 'Emotions & social',
    questions: eveningEMAQuestions
  },
  {
    id: 'night',
    name: 'Night Reflection',
    icon: '🌙',
    theme: 'Meds & reflection',
    questions: nightEMAQuestions
  }
];