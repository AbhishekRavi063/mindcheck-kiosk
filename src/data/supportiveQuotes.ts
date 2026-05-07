// Supportive quotes database - different quotes for different question types
// Each quote now includes author attribution
export const supportiveQuotes = {
  interest: [
    { text: "It's okay to not feel excited about everything all the time", author: "Dr. Kristin Neff" },
    { text: "Your interests and energy levels can change - that's normal", author: "Dr. Dan Siegel" },
    { text: "Small joys count too, even if they feel different now", author: "Brené Brown" },
    { text: "Rest is not idleness, and to lie sometimes on the grass under trees is not time wasted", author: "John Lubbock" },
  ],
  mood: [
    { text: "Your feelings are valid, whatever they may be", author: "Dr. Susan David" },
    { text: "It's okay to not be okay sometimes", author: "Glennon Doyle" },
    { text: "Every day is different, and that's alright", author: "Jon Kabat-Zinn" },
    { text: "There is no greater agony than bearing an untold story inside you", author: "Maya Angelou" },
  ],
  sleep: [
    { text: "Sleep patterns can vary - be gentle with yourself", author: "Dr. Matthew Walker" },
    { text: "Rest looks different for everyone", author: "Tricia Hersey" },
    { text: "Your body needs what it needs, and that can change", author: "Dr. Sara Gottfried" },
    { text: "Sleep is the best meditation", author: "Dalai Lama" },
  ],
  energy: [
    { text: "Energy levels naturally fluctuate throughout life", author: "Dr. Judson Brewer" },
    { text: "It's okay to take things at your own pace", author: "Pema Chödrön" },
    { text: "Caring for myself is not self-indulgence, it is self-preservation", author: "Audre Lorde" },
    { text: "Low energy doesn't mean low worth", author: "Dr. Kristin Neff" },
  ],
  appetite: [
    { text: "Eating patterns can change with how we're feeling", author: "Geneen Roth" },
    { text: "It's okay if your appetite isn't the same as before", author: "Dr. Susan Albers" },
    { text: "Nourishing yourself matters, in whatever form that takes", author: "Evelyn Tribole" },
    { text: "Your relationship with food can shift - that's okay", author: "Christy Harrison" },
  ],
  selfworth: [
    { text: "You are not your thoughts; you are the observer of your thoughts", author: "Eckhart Tolle" },
    { text: "Be kind to yourself - you deserve compassion", author: "Dr. Kristin Neff" },
    { text: "Your worth isn't determined by your productivity", author: "Tricia Hersey" },
    { text: "You alone are enough. You have nothing to prove to anybody", author: "Maya Angelou" },
  ],
  concentration: [
    { text: "Focus can be hard sometimes, and that's understandable", author: "Dr. Amishi Jha" },
    { text: "Your mind is doing its best to process everything", author: "Dr. Dan Siegel" },
    { text: "The present moment is the only time over which we have dominion", author: "Thích Nhất Hạnh" },
    { text: "Struggling to concentrate doesn't make you less capable", author: "Dr. Edward Hallowell" },
  ],
  movement: [
    { text: "The body keeps the score - it remembers everything", author: "Dr. Bessel van der Kolk" },
    { text: "However you're feeling physically is valid", author: "Dr. Peter Levine" },
    { text: "Movement and restlessness are ways our body communicates", author: "Dr. Gabor Maté" },
    { text: "Your body is not your masterpiece - your life is", author: "Glennon Doyle" },
  ],
  crisis: [
    { text: "You're brave for acknowledging how you feel", author: "Brené Brown" },
    { text: "Reaching out is a sign of strength, not weakness", author: "Dr. Marsha Linehan" },
    { text: "You don't have to face this alone", author: "Johann Hari" },
    { text: "There are people who want to help and support you", author: "Dr. Thomas Joiner" },
  ],
  stress: [
    { text: "Stress is a natural response - you're not overreacting", author: "Dr. Kelly McGonigal" },
    { text: "It's okay to feel overwhelmed sometimes", author: "Sharon Salzberg" },
    { text: "A journey of a thousand miles begins with a single step", author: "Lao Tzu" },
    { text: "Your feelings of stress are valid and real", author: "Dr. Susan David" },
  ],
  control: [
    { text: "It's normal to want to feel in control of your life", author: "Dr. Steven Hayes" },
    { text: "Some days are harder than others, and that's okay", author: "Pema Chödrön" },
    { text: "We must let go of the life we have planned to accept the one that is waiting for us", author: "Joseph Campbell" },
    { text: "Small steps forward still count as progress", author: "James Clear" },
  ],
  confident: [
    { text: "Confidence can ebb and flow - that's part of being human", author: "Dr. Carol Dweck" },
    { text: "Believe you can and you're halfway there", author: "Theodore Roosevelt" },
    { text: "You have power over your mind - not outside events", author: "Marcus Aurelius" },
    { text: "Your past strengths are still within you", author: "Dr. Martin Seligman" },
  ],
  overwhelmed: [
    { text: "Feeling overwhelmed is a sign you care deeply", author: "Dr. Susan David" },
    { text: "It's okay to ask for help when things feel like too much", author: "Brené Brown" },
    { text: "Almost everything will work again if you unplug it for a few minutes", author: "Anne Lamott" },
    { text: "You're braver than you believe, stronger than you seem, and smarter than you think", author: "A.A. Milne" },
  ],
  general: [
    { text: "What you seek is seeking you", author: "Rumi" },
    { text: "Being honest about how you feel takes courage", author: "Brené Brown" },
    { text: "The unexamined life is not worth living", author: "Socrates" },
    { text: "The curious paradox is that when I accept myself just as I am, then I can change", author: "Carl Rogers" },
  ],
};

// Get a random quote for a question type
export function getQuoteForQuestion(questionText: string): { text: string; author: string } {
  const lowerText = questionText.toLowerCase();
  
  let category = 'general';
  
  if (lowerText.includes('little interest') || lowerText.includes('pleasure')) category = 'interest';
  else if (lowerText.includes('feeling down') || lowerText.includes('depressed') || lowerText.includes('hopeless')) category = 'mood';
  else if (lowerText.includes('sleep')) category = 'sleep';
  else if (lowerText.includes('tired') || lowerText.includes('energy')) category = 'energy';
  else if (lowerText.includes('appetite') || lowerText.includes('eating')) category = 'appetite';
  else if (lowerText.includes('bad about yourself') || lowerText.includes('failure')) category = 'selfworth';
  else if (lowerText.includes('concentration') || lowerText.includes('focus')) category = 'concentration';
  else if (lowerText.includes('moving') || lowerText.includes('restless')) category = 'movement';
  else if (lowerText.includes('better off dead') || lowerText.includes('hurting')) category = 'crisis';
  else if (lowerText.includes('upset') || lowerText.includes('unexpectedly')) category = 'stress';
  else if (lowerText.includes('control')) category = 'control';
  else if (lowerText.includes('nervous') || lowerText.includes('stressed')) category = 'stress';
  else if (lowerText.includes('confident') || lowerText.includes('ability')) category = 'confident';
  else if (lowerText.includes('going your way')) category = 'confident';
  else if (lowerText.includes('cope') || lowerText.includes('could not cope')) category = 'overwhelmed';
  else if (lowerText.includes('irritation') || lowerText.includes('anger')) category = 'stress';
  else if (lowerText.includes('on top')) category = 'control';
  else if (lowerText.includes('difficult') || lowerText.includes('piling')) category = 'overwhelmed';
  
  const quotes = supportiveQuotes[category as keyof typeof supportiveQuotes];
  return quotes[Math.floor(Math.random() * quotes.length)];
}