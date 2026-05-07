// PHQ-9 Questions (Patient Health Questionnaire - 9)
export const phq9Questions = [
  {
    text: "Over the last 2 weeks, how often have you had little interest or pleasure in doing things?",
    category: "PHQ-9: Interest & Pleasure",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080", // Enjoying activities
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080", // Contemplating
      2: "https://images.unsplash.com/photo-1560579183-1ae8d204bc56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB3b3JraW5nJTIwdGlyZWQlMjBsb3clMjBlbmVyZ3klMjBleGhhdXN0ZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080", // Low energy
      3: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080", // Feeling low
      4: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080" // Very low
    }
  },
  {
    text: "Over the last 2 weeks, how often have you felt down, depressed, or hopeless?",
    category: "PHQ-9: Mood",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?",
    category: "PHQ-9: Sleep",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1602704545740-431018e885ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzbGVlcGluZyUyMGJlZCUyMGluc29tbmlhJTIwdGlyZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1602704545740-431018e885ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzbGVlcGluZyUyMGJlZCUyMGluc29tbmlhJTIwdGlyZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1560579183-1ae8d204bc56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB3b3JraW5nJTIwdGlyZWQlMjBsb3clMjBlbmVyZ3klMjBleGhhdXN0ZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1560579183-1ae8d204bc56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB3b3JraW5nJTIwdGlyZWQlMjBsb3clMjBlbmVyZ3klMjBleGhhdXN0ZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you felt tired or had little energy?",
    category: "PHQ-9: Energy",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1560579183-1ae8d204bc56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB3b3JraW5nJTIwdGlyZWQlMjBsb3clMjBlbmVyZ3klMjBleGhhdXN0ZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1560579183-1ae8d204bc56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB3b3JraW5nJTIwdGlyZWQlMjBsb3clMjBlbmVyZ3klMjBleGhhdXN0ZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1602704545740-431018e885ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzbGVlcGluZyUyMGJlZCUyMGluc29tbmlhJTIwdGlyZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you had a poor appetite or been overeating?",
    category: "PHQ-9: Appetite",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1767535120895-1cd7c80d1304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBlYXRpbmclMjBmb29kJTIwYXBwZXRpdGUlMjBtZWFsfGVufDF8fHx8MTc2OTY4MTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1767535120895-1cd7c80d1304?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBlYXRpbmclMjBmb29kJTIwYXBwZXRpdGUlMjBtZWFsfGVufDF8fHx8MTc2OTY4MTc4Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you felt bad about yourself or that you're a failure?",
    category: "PHQ-9: Self-Worth",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you had trouble concentrating on things?",
    category: "PHQ-9: Concentration",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/flagged/photo-1571367061913-be59eefdfc66?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZWFkaW5nJTIwYm9vayUyMGNvbmNlbnRyYXRpb24lMjBmb2N1c3xlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1560579183-1ae8d204bc56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB3b3JraW5nJTIwdGlyZWQlMjBsb3clMjBlbmVyZ3klMjBleGhhdXN0ZWR8ZW58MXx8fHwxNzY5NjgxNzg1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you moved or spoken so slowly that others noticed, or been so fidgety or restless?",
    category: "PHQ-9: Psychomotor",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  },
  {
    text: "Over the last 2 weeks, how often have you thought you would be better off dead or of hurting yourself?",
    category: "PHQ-9: Safety (Important)",
    labels: ["Not at all", "Several days", "More than half", "Nearly every day", "Every day"],
    reversed: false,
    illustrations: {
      0: "https://images.unsplash.com/photo-1669794324374-616bf172ad90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBuYXR1cmUlMjBwZWFjZWZ1bCUyMGNhbG0lMjBtZWRpdGF0aW9ufGVufDF8fHx8MTc2OTY4MTc4N3ww&ixlib=rb-4.1.0&q=80&w=1080",
      1: "https://images.unsplash.com/photo-1601622256095-c0d8f191f7d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjB0aGlua2luZyUyMGNvbnRlbXBsYXRpbmclMjBzZWxmJTIwcmVmbGVjdGlvbnxlbnwxfHx8fDE3Njk2ODE3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      2: "https://images.unsplash.com/photo-1592277789331-f0ed660ecfe8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjByZXN0bGVzcyUyMGFueGlvdXMlMjBmaWRnZXRpbmclMjBzdHJlc3N8ZW58MXx8fHwxNzY5NjgxNzg3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      3: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      4: "https://images.unsplash.com/photo-1764921587464-f3cdd46fb4c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBwZXJzb24lMjBzaXR0aW5nJTIwYWxvbmUlMjBob21lJTIwZmVlbGluZyUyMGxvdyUyMGRlcHJlc3Npb258ZW58MXx8fHwxNzY5NjgxNzg0fDA&ixlib=rb-4.1.0&q=80&w=1080"
    }
  }
];

// Perceived Stress Scale Questions (PSS-10)
export const stressScaleQuestions = [
  {
    text: "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    category: "Stress: Coping Ability",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: true // Higher confidence = lower stress
  },
  {
    text: "In the last month, how often have you felt that things were going your way?",
    category: "Stress: Control",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: true
  },
  {
    text: "In the last month, how often have you been upset because of something that happened unexpectedly?",
    category: "Stress: Unexpected Events",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: false
  },
  {
    text: "In the last month, how often have you felt that you were unable to control the important things in your life?",
    category: "Stress: Control",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: false
  },
  {
    text: "In the last month, how often have you felt nervous and stressed?",
    category: "Stress: Tension",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: false
  },
  {
    text: "In the last month, how often have you been able to control irritations in your life?",
    category: "Stress: Emotional Control",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: true
  },
  {
    text: "In the last month, how often have you felt that you were on top of things?",
    category: "Stress: Mastery",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: true
  },
  {
    text: "In the last month, how often have you been angered because of things outside of your control?",
    category: "Stress: External Factors",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: false
  },
  {
    text: "In the last month, how often have you felt difficulties were piling up so high you could not overcome them?",
    category: "Stress: Overwhelm",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: false
  },
  {
    text: "In the last month, how often have you been able to stay calm when facing important challenges?",
    category: "Stress: Resilience",
    labels: ["Never", "Almost never", "Sometimes", "Fairly often", "Very often"],
    reversed: true
  }
];