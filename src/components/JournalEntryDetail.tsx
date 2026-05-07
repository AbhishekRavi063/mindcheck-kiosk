import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Tag, Image as ImageIcon, Video } from 'lucide-react';
import { BackButton } from './ui/BackButton';

interface JournalEntry {
  id: string;
  entry: string;
  timestamp: string | number;
  hashtags?: string[];
  emotions?: string[];
  media?: { type: 'photo' | 'video', url: string } | null;
  prompt?: string | null;
  moodIntensities?: { [emotion: string]: number };
}

interface JournalEntryDetailProps {
  entry: JournalEntry;
  onBack: () => void;
  isDarkMode: boolean;
}

const emotions = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😡', label: 'Angry' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤔', label: 'Thoughtful' },
  { emoji: '💪', label: 'Strong' },
  { emoji: '😔', label: 'Down' },
  { emoji: '✨', label: 'Hopeful' },
];

const getEmotionEmoji = (label: string): string => {
  // Check custom emotions from localStorage
  const savedCustomEmotions = localStorage.getItem('mindcheck_custom_emotions');
  if (savedCustomEmotions) {
    const customEmotions = JSON.parse(savedCustomEmotions);
    const customEmotion = customEmotions.find((e: any) => e.label === label);
    if (customEmotion) return customEmotion.emoji;
  }
  
  // Check built-in emotions
  const emotion = emotions.find(e => e.label === label);
  return emotion?.emoji || '🙂';
};

export function JournalEntryDetail({ entry, onBack, isDarkMode }: JournalEntryDetailProps) {
  const formatDate = (timestamp: string | number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} pb-20`}>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} isDarkMode={isDarkMode} />
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            Journal Entry
          </h1>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-3xl p-6 shadow-lg ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white'}`}
        >
          {/* Date and Emotions */}
          <div className={`mb-4 pb-4 border-b ${isDarkMode ? 'border-[#8d654c]/20' : 'border-[#ddc4af]'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`} />
              <span className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
                {formatDate(entry.timestamp)}
              </span>
            </div>
            
            {/* Emotions Section - Read Only */}
            {entry.emotions && entry.emotions.length > 0 && (
              <div className="space-y-2">
                <p className={`text-xs font-medium ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                  EMOTIONS
                </p>
                <div className="flex flex-wrap gap-2">
                  {entry.emotions.map((emotion, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
                        isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'
                      }`}
                    >
                      <span className="text-lg">{getEmotionEmoji(emotion)}</span>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                        {emotion}
                      </span>
                      {entry.moodIntensities?.[emotion] && (
                        <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>
                          {entry.moodIntensities[emotion]}/10
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Prompt */}
          {entry.prompt && (
            <div className={`mb-6 p-4 rounded-2xl ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'}`}>
              <p className={`text-xs font-medium mb-1 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                PROMPT
              </p>
              <p className={`text-sm italic ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                "{entry.prompt}"
              </p>
            </div>
          )}

          {/* Entry Content */}
          <div className="mb-6">
            <p className={`text-base leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              {entry.entry}
            </p>
          </div>

          {/* Media */}
          {entry.media && (
            <div className="mb-6">
              {entry.media.type === 'photo' ? (
                <div className="rounded-2xl overflow-hidden">
                  <img
                    src={entry.media.url}
                    alt="Journal entry attachment"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden">
                  <video
                    src={entry.media.url}
                    controls
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>
          )}

          {/* Hashtags */}
          {entry.hashtags && entry.hashtags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                  TAGS
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.hashtags.map(tag => (
                  <div
                    key={tag}
                    className="bg-[#ffb757] text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    #{tag}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Metadata Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`rounded-2xl p-4 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/50'}`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>
              Created: {new Date(entry.timestamp).toLocaleString()}
            </span>
            {entry.media && (
              <div className="flex items-center gap-1">
                {entry.media.type === 'photo' ? (
                  <ImageIcon className="w-3 h-3" />
                ) : (
                  <Video className="w-3 h-3" />
                )}
                <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>
                  {entry.media.type}
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
