import { useState, useEffect } from 'react';
import { MemoryGame } from './games/MemoryGame';
import { AttentionGame } from './games/AttentionGame';
import { CognitiveGame } from './games/CognitiveGame';

interface MiniGameProps {
  type: 'memory' | 'attention' | 'cognitive';
  onComplete: (score: number) => void;
}

export function MiniGame({ type, onComplete }: MiniGameProps) {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [type]);

  return (
    <div key={key}>
      {type === 'memory' && <MemoryGame onComplete={onComplete} />}
      {type === 'attention' && <AttentionGame onComplete={onComplete} />}
      {type === 'cognitive' && <CognitiveGame onComplete={onComplete} />}
    </div>
  );
}
