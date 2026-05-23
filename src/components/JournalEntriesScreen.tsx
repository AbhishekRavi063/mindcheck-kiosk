import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Hash, Calendar, BookOpen, Filter, ChevronRight, Image, Video, Paperclip } from 'lucide-react';
import { BackButton } from './ui/BackButton';
import clipIcon from 'figma:asset/99d81622330278a46476d86a02b8d7a9b69374d1.png';
import { getJournalEntries } from '../utils/dataSync';
import { setSensitiveValue, subscribeToSecureVault } from '../utils/secureVault';

interface JournalEntry {
  id: string;
  entry: string;
  hashtags: string[];
  timestamp: string | number;
  date: string;
  emotions?: string[];
  media?: { type: 'photo' | 'video', url: string } | null;
  prompt?: string | null;
}

interface JournalEntriesScreenProps {
  isDarkMode: boolean;
  onBack: () => void;
  onViewEntry?: (entry: JournalEntry) => void;
  onStartNewEntry?: () => void; // Added new prop to start a new journal entry
}

// Group entries by week
const groupEntriesByWeek = (entries: JournalEntry[]) => {
  const weeks: { [key: string]: JournalEntry[] } = {};
  
  entries.forEach(entry => {
    const date = new Date(entry.timestamp);
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay()); // Go to Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekKey = `${startOfWeek.getDate()}.${String(startOfWeek.getMonth() + 1).padStart(2, '0')} - ${endOfWeek.getDate()}.${String(endOfWeek.getMonth() + 1).padStart(2, '0')}`;
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    weeks[weekKey].push(entry);
  });
  
  return weeks;
};

export function JournalEntriesScreen({ isDarkMode, onBack, onViewEntry, onStartNewEntry }: JournalEntriesScreenProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [allHashtags, setAllHashtags] = useState<string[]>([]);
  const [allEmotions, setAllEmotions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [topHashtags, setTopHashtags] = useState<{ tag: string; count: number }[]>([]);
  const [showNewJournalPrompt, setShowNewJournalPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load real journal entries from Supabase
    const loadEntries = async () => {
      setIsLoading(true);
      try {
        const savedEntries = await getJournalEntries();
        
        // Ensure all entries have the correct structure
        const validatedEntries = savedEntries.map((entry: any) => ({
          id: entry.id,
          entry: entry.entry || entry.content || '',
          emotions: entry.emotions || entry.emotion ? (Array.isArray(entry.emotions) ? entry.emotions : [entry.emotion]) : [],
          hashtags: Array.isArray(entry.hashtags) ? entry.hashtags : [],
          media: entry.media || null,
          prompt: entry.prompt || null,
          timestamp: entry.timestamp,
          date: new Date(entry.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        
        // Sort by timestamp (newest first)
        validatedEntries.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setEntries(validatedEntries);
        updateHashtagCounts(validatedEntries);
      } catch (error) {
        console.error('Error loading journal entries:', error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEntries();
    return subscribeToSecureVault(loadEntries);
  }, []);

  useEffect(() => {
    // Extract all unique hashtags from entries
    const tags = new Set<string>();
    entries.forEach(entry => {
      entry.hashtags.forEach(tag => tags.add(tag));
    });
    setAllHashtags(Array.from(tags).sort());
    
    // Calculate top hashtags with counts
    const hashtagCount: { [key: string]: number } = {};
    entries.forEach(entry => {
      entry.hashtags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });
    
    const sorted = Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
    
    setTopHashtags(sorted);
  }, [entries]);

  useEffect(() => {
    // Extract all unique emotions from entries
    const emotions = new Set<string>();
    entries.forEach(entry => {
      entry.emotions?.forEach(emotion => emotions.add(emotion));
    });
    setAllEmotions(Array.from(emotions).sort());
  }, [entries]);

  const updateHashtagCounts = (entries: JournalEntry[]) => {
    const hashtagCount: { [key: string]: number } = {};
    entries.forEach(entry => {
      entry.hashtags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
    });
    setSensitiveValue('mindcheck_hashtag_count', hashtagCount).catch(error => {
      console.error('Error updating secure hashtag counts:', error);
    });
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = searchQuery === '' || 
      entry.entry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesHashtag = selectedHashtags.length === 0 || entry.hashtags.some(tag => selectedHashtags.includes(tag));
    
    const matchesEmotion = selectedEmotions.length === 0 || entry.emotions?.some(emotion => selectedEmotions.includes(emotion));
    
    return matchesSearch && matchesHashtag && matchesEmotion;
  });

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedHashtags([]);
    setSelectedEmotions([]);
  };

  const weeklyEntries = groupEntriesByWeek(filteredEntries);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} pb-20`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} p-6 pb-4`}>
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Back Button and Title */}
          <div className="flex items-center gap-4">
            <BackButton onClick={onBack} isDarkMode={isDarkMode} />
            <div className="flex-1">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                My Journal
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
            >
              <Filter className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search entries or hashtags..."
              className={`w-full pl-12 pr-12 py-3 rounded-2xl ${
                isDarkMode 
                  ? 'bg-[#2a2218] text-[#ece5de] placeholder-[#ece5de]/40 border-[#8d654c]/20' 
                  : 'bg-white/80 text-[#8d654c] placeholder-[#8d654c]/40 border-[#ddc4af]'
              } border focus:outline-none focus:ring-2 focus:ring-[#ffb757]/30`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Filters Dropdown */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className={`rounded-2xl p-4 space-y-5 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'}`}>
                  {/* Hashtag Filter Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                        Filter by hashtag
                      </p>
                      {(selectedHashtags.length > 0 || selectedEmotions.length > 0) && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-[#ffb757] font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allHashtags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedHashtags(selectedHashtags.includes(tag) ? selectedHashtags.filter(t => t !== tag) : [...selectedHashtags, tag])}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 ${
                            selectedHashtags.includes(tag)
                              ? 'bg-[#ffb757] text-white shadow-sm'
                              : isDarkMode
                                ? 'bg-[#1a1410] text-[#ece5de]/70 hover:bg-[#1a1410]/80'
                                : 'bg-[#ece5de] text-[#8d654c] hover:bg-[#ddc4af]/50'
                          }`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Emotion Filter Section */}
                  <div className={`pt-4 border-t ${isDarkMode ? 'border-[#8d654c]/20' : 'border-[#ddc4af]'}`}>
                    <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                      Filter by emotion
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {allEmotions.map(emotion => {
                        const emotionEmoji = emotion === 'Happy' ? '😊' : 
                                            emotion === 'Sad' ? '😢' : 
                                            emotion === 'Anxious' ? '😰' : 
                                            emotion === 'Angry' ? '😡' : 
                                            emotion === 'Calm' ? '😌' : 
                                            emotion === 'Tired' ? '😴' : 
                                            emotion === 'Thoughtful' ? '🤔' : 
                                            emotion === 'Strong' ? '💪' : 
                                            emotion === 'Down' ? '😔' : 
                                            emotion === 'Hopeful' ? '✨' : '';
                        
                        return (
                          <button
                            key={emotion}
                            onClick={() => setSelectedEmotions(selectedEmotions.includes(emotion) ? selectedEmotions.filter(e => e !== emotion) : [...selectedEmotions, emotion])}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 flex items-center gap-1 ${
                              selectedEmotions.includes(emotion)
                                ? 'bg-[#ffb757] text-white shadow-sm'
                                : isDarkMode
                                  ? 'bg-[#1a1410] text-[#ece5de]/70 hover:bg-[#1a1410]/80'
                                  : 'bg-[#ece5de] text-[#8d654c] hover:bg-[#ddc4af]/50'
                            }`}
                          >
                            <span>{emotionEmoji}</span>
                            <span>{emotion}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filter Indicator */}
          {(selectedHashtags.length > 0 || selectedEmotions.length > 0) && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                Filtered by:
              </span>
              {selectedHashtags.map(tag => (
                <div key={tag} className="bg-[#ffb757] text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium">
                  <span>#{tag}</span>
                  <button
                    onClick={() => setSelectedHashtags(selectedHashtags.filter(t => t !== tag))}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {selectedEmotions.map(emotion => (
                <div key={emotion} className="bg-[#ffb757] text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-medium">
                  <span>{emotion}</span>
                  <button
                    onClick={() => setSelectedEmotions(selectedEmotions.filter(e => e !== emotion))}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entries List - Grid Layout like reference */}
      <div className="max-w-2xl mx-auto px-6 space-y-6 pb-8">
        {/* What's on your mind today - CTA Section */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onStartNewEntry || onBack}
          className={`w-full ${
            isDarkMode ? 'bg-gradient-to-br from-[#ffb757]/15 to-[#ffb757]/5' : 'bg-gradient-to-br from-[#ffb757]/20 to-[#ffb757]/10'
          } rounded-3xl p-6 text-center shadow-sm active:scale-[0.98] transition-all border ${
            isDarkMode ? 'border-[#ffb757]/10' : 'border-[#ffb757]/15'
          } relative overflow-hidden`}
        >
          {/* Decorative elements */}
          <div className="absolute -left-4 -top-4 w-20 h-20 rounded-full bg-[#ffb757]/10" />
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-[#ffb757]/10" />
          
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
              className="text-4xl mb-3"
            >
              ✍️
            </motion.div>
            <h3 className={`text-xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2`}>
              What's on your mind today?
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} mb-4`}>
              Take a moment to reflect and write
            </p>
            <div className={`inline-block px-4 py-2 rounded-full ${
              isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/30'
            }`}>
              <span className="text-sm font-semibold text-[#ffb757]">Start writing</span>
            </div>
          </div>
        </motion.button>

        {/* Weekly Journal Grid */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-[#ece5de]/20' : 'text-[#8d654c]/20'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Loading entries...
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Please wait while we fetch your journal entries.
            </p>
          </motion.div>
        ) : filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <BookOpen className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-[#ece5de]/20' : 'text-[#8d654c]/20'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              No entries found
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              {searchQuery || selectedHashtags.length > 0 ? 'Try adjusting your filters' : 'Start writing to see your entries here'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {Object.keys(weeklyEntries).map((weekKey, weekIndex) => (
              <div key={weekKey} className="space-y-3">
                {/* Week Header */}
                <div className="flex items-center justify-between">
                  <h3 className={`text-base font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                    {weekKey}
                  </h3>
                  <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                    {weeklyEntries[weekKey].length} {weeklyEntries[weekKey].length === 1 ? 'entry' : 'entries'}
                  </span>
                </div>

                {/* Grid of Weekly Cards - 2 columns */}
                <div className="grid grid-cols-2 gap-3">
                  {weeklyEntries[weekKey].map((entry, entryIndex) => {
                    const truncatedText = entry.entry.length > 120 ? entry.entry.substring(0, 120) + '...' : entry.entry;
                    
                    return (
                      <motion.button
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (weekIndex * 0.1) + (entryIndex * 0.05) }}
                        onClick={() => onViewEntry?.(entry)}
                        className={`relative text-left rounded-2xl p-4 shadow-sm ${
                          isDarkMode ? 'bg-[#2a2218] hover:bg-[#3a3228]' : 'bg-white/80 hover:bg-white'
                        } transition-all active:scale-[0.98] cursor-pointer overflow-hidden h-40`}
                      >
                        {/* Folded corner effect */}
                        <div className={`absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] ${
                          isDarkMode ? 'border-t-[#1a1410]' : 'border-t-[#ddc4af]/30'
                        }`} />
                        
                        {/* Date at top */}
                        <div className={`text-xs font-bold mb-2 ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'}`}>
                          {entry.date}
                        </div>

                        {/* Entry preview */}
                        <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} line-clamp-6`}>
                          {truncatedText}
                        </p>

                        {/* Bottom indicators */}
                        <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                          {/* Emotion emoji */}
                          {entry.emotions && entry.emotions.length > 0 && (
                            <div className="flex gap-1">
                              {entry.emotions.slice(0, 2).map((emotion, idx) => {
                                const emotionEmoji = emotion === 'Happy' ? '😊' : 
                                                   emotion === 'Sad' ? '😢' : 
                                                   emotion === 'Anxious' ? '😰' : 
                                                   emotion === 'Angry' ? '😡' : 
                                                   emotion === 'Calm' ? '😌' : 
                                                   emotion === 'Tired' ? '😴' : 
                                                   emotion === 'Thoughtful' ? '🤔' : 
                                                   emotion === 'Strong' ? '💪' : 
                                                   emotion === 'Down' ? '😔' : 
                                                   emotion === 'Hopeful' ? '✨' : '';
                                return <span key={`${entry.id}-emotion-${idx}`} className="text-sm">{emotionEmoji}</span>;
                              })}
                            </div>
                          )}
                          
                          {/* Clip icon if media */}
                          {entry.media && (
                            <img src={clipIcon} alt="Attachment" className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}

                  {/* Add new entry card (plus button) */}
                  {weekIndex === 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (weekIndex * 0.1) + (weeklyEntries[weekKey].length * 0.05) }}
                      onClick={onStartNewEntry || onBack}
                      className={`relative rounded-2xl p-4 shadow-sm ${
                        isDarkMode ? 'bg-[#2a2218] hover:bg-[#3a3228] border-2 border-dashed border-[#8d654c]/30' : 'bg-white/60 hover:bg-white/80 border-2 border-dashed border-[#8d654c]/30'
                      } transition-all active:scale-[0.98] cursor-pointer h-40 flex items-center justify-center`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl mb-2 ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>+</div>
                        <div className={`text-xs font-medium ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                          New entry
                        </div>
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
