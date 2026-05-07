// Pool of diverse journal prompts for post-game reflection
const JOURNAL_PROMPTS = [
  "How are you feeling today?",
  "What's something that brought you peace recently?",
  "What's one thing you're grateful for right now?",
  "How would you describe your energy level today?",
  "What's something you're looking forward to?",
  "How has your day been treating you?",
  "What's on your mind at this moment?",
  "What would make today feel complete for you?",
  "How are you taking care of yourself today?",
  "What emotions have you noticed today?",
  "What's something small that made you smile?",
  "How connected do you feel to others right now?",
  "What would you tell a friend if they felt this way?",
  "What's one thing that's going well for you?",
  "How does your body feel right now?",
  "What are you proud of yourself for lately?",
  "What's something you've learned about yourself recently?",
  "How can you be kind to yourself today?",
  "What's been on your heart lately?",
  "What do you need more of in your life right now?"
];

// Get a random journal prompt, cycling through all before repeating
export function getJournalPrompt(): string {
  // Get the list of used prompts from localStorage
  const usedPrompts = JSON.parse(
    localStorage.getItem('mindcheck_used_journal_prompts') || '[]'
  ) as number[];

  // If all prompts have been used, reset the cycle
  if (usedPrompts.length >= JOURNAL_PROMPTS.length) {
    localStorage.setItem('mindcheck_used_journal_prompts', '[]');
    usedPrompts.length = 0;
  }

  // Get available prompts (indices not yet used)
  const availableIndices = JOURNAL_PROMPTS.map((_, index) => index).filter(
    (index) => !usedPrompts.includes(index)
  );

  // Randomly select one from available prompts
  const selectedIndex = availableIndices[
    Math.floor(Math.random() * availableIndices.length)
  ];

  // Mark this prompt as used
  usedPrompts.push(selectedIndex);
  localStorage.setItem('mindcheck_used_journal_prompts', JSON.stringify(usedPrompts));

  return JOURNAL_PROMPTS[selectedIndex];
}
