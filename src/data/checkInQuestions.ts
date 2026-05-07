export interface Question {
  id?: string;
  text: string;
  category: string;
  options: string[];
  timeframe?: string;
  reverseScore?: boolean; // For RSES reverse-scored items
}

export const phq9Questions: Question[] = [
  {
    id: 'phq9-1',
    text: 'Little interest or pleasure in doing things',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-2',
    text: 'Feeling down, depressed, or hopeless',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-3',
    text: 'Trouble falling or staying asleep, or sleeping too much',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-4',
    text: 'Feeling tired or having little energy',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-5',
    text: 'Poor appetite or overeating',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-6',
    text: 'Feeling bad about yourself — or that you\'re a failure',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-7',
    text: 'Trouble concentrating on things',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-8',
    text: 'Moving or speaking slowly, or being fidgety or restless',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'phq9-9',
    text: 'Thoughts that you would be better off dead, or thoughts of hurting yourself',
    category: 'PHQ-9',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  }
];

export const functionalImpairmentQuestion: Question = {
  id: 'phq9-functional',
  text: 'If you checked any of these, how difficult have they made it to work, take care of things, or get along with others?',
  category: 'PHQ-9 Functional Impact',
  options: ['Not difficult', 'Somewhat difficult', 'Very difficult', 'Extremely difficult']
};

export const pssQuestions: Question[] = [
  {
    id: 'pss-1',
    text: 'Been upset because of something that happened unexpectedly',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-2',
    text: 'Felt unable to control important things in your life',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-3',
    text: 'Felt nervous and stressed',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-4',
    text: 'Felt confident about your ability to handle personal problems',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-5',
    text: 'Felt that things were going your way',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-6',
    text: 'Found that you could not cope with all the things you had to do',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-7',
    text: 'Been able to control irritations in your life',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-8',
    text: 'Felt that you were on top of things',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-9',
    text: 'Been angered by things outside of your control',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  },
  {
    id: 'pss-10',
    text: 'Felt difficulties were piling up so high you could not overcome them',
    category: 'Perceived Stress',
    timeframe: 'In the last month, how often have you',
    options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
  }
];

// Rosenberg Self-Esteem Scale (RSES-10)
export const rsesQuestions: Question[] = [
  {
    id: 'rses-1',
    text: 'I feel that I am a person of worth, at least on an equal plane with others',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: false
  },
  {
    id: 'rses-2',
    text: 'I feel that I have a number of good qualities',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: false
  },
  {
    id: 'rses-3',
    text: 'All in all, I am inclined to feel that I am a failure',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: true // Reverse-scored
  },
  {
    id: 'rses-4',
    text: 'I am able to do things as well as most other people',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: false
  },
  {
    id: 'rses-5',
    text: 'I feel I do not have much to be proud of',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: true // Reverse-scored
  },
  {
    id: 'rses-6',
    text: 'I take a positive attitude toward myself',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: false
  },
  {
    id: 'rses-7',
    text: 'On the whole, I am satisfied with myself',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: false
  },
  {
    id: 'rses-8',
    text: 'I wish I could have more respect for myself',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: true // Reverse-scored
  },
  {
    id: 'rses-9',
    text: 'I certainly feel useless at times',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: true // Reverse-scored
  },
  {
    id: 'rses-10',
    text: 'At times I think I am no good at all',
    category: 'Self-Esteem',
    options: ['Strongly agree', 'Agree', 'Disagree', 'Strongly disagree'],
    reverseScore: true // Reverse-scored
  }
];

// GAD-7 (Generalized Anxiety Disorder 7-item scale)
export const gad7Questions: Question[] = [
  {
    id: 'gad7-1',
    text: 'Feeling nervous, anxious, or on edge',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'gad7-2',
    text: 'Not being able to stop or control worrying',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'gad7-3',
    text: 'Worrying too much about different things',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'gad7-4',
    text: 'Trouble relaxing',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'gad7-5',
    text: 'Being so restless that it\'s hard to sit still',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'gad7-6',
    text: 'Becoming easily annoyed or irritable',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  },
  {
    id: 'gad7-7',
    text: 'Feeling afraid as if something awful might happen',
    category: 'GAD-7',
    timeframe: 'Over the last 2 weeks',
    options: ['Not at all', 'Several days', 'More than half', 'Nearly every day']
  }
];