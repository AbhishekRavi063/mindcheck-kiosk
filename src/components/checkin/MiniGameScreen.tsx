import { AttentionGame } from './games/AttentionGame';
import { MemoryGame } from './games/MemoryGame';
import { ArrowLeft } from 'lucide-react';

interface MiniGameScreenProps {
  type: 'attention' | 'memory';
  onComplete: (score: number) => void;
  progress: number;
  isDarkMode?: boolean;
  onBack?: () => void;
}

export function MiniGameScreen({ type, onComplete, progress, isDarkMode = false, onBack }: MiniGameScreenProps) {
  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'}`}>
      {/* Header with back button and progress */}
      <div className="p-6 space-y-4">
        {onBack && (
          <button
            onClick={onBack}
            className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
          </button>
        )}
        
        <div className={`h-2 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/40'} rounded-full overflow-hidden`}>
          <div
            className="h-full bg-[#ffb757] transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {type === 'attention' && <AttentionGame onComplete={onComplete} isDarkMode={isDarkMode} />}
      {type === 'memory' && <MemoryGame onComplete={onComplete} isDarkMode={isDarkMode} />}
    </div>
  );
}