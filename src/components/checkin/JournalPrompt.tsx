import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, ArrowRight, RefreshCw, X, Check, Sparkles, Hash, Archive, Image, Video, Smile, Bold, Italic, List, ListOrdered, Plus } from 'lucide-react';
import { getJournalPrompt } from '../../utils/journalPrompts';
import { BackButton } from '../ui/BackButton';

interface JournalPromptProps {
  onComplete: (entry: string, hashtags: string[], emotions: string[], media: { type: 'photo' | 'video', url: string } | null, prompt: string | null, moodIntensities?: { [emotion: string]: number }) => void;
  onSkip: () => void;
  isDarkMode: boolean;
  onBack?: () => void;
  isStandalone?: boolean;
  onViewEntries?: () => void;
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

// Emoji suggestions based on emotion keywords
const getEmojiForEmotion = (emotion: string): string => {
  const lowercaseEmotion = emotion.toLowerCase().trim();
  
  const emojiMap: { [key: string]: string } = {
    // Positive emotions
    'happy': '😊', 'joy': '😄', 'excited': '🤩', 'ecstatic': '🥳', 'cheerful': '😁',
    'grateful': '🙏', 'blessed': '🙏', 'thankful': '🙏', 'appreciative': '🙏',
    'loved': '❤️', 'loving': '🥰', 'affectionate': '🥰', 'adored': '😍',
    'proud': '😌', 'confident': '😎', 'accomplished': '💪', 'strong': '💪',
    'energized': '⚡', 'energetic': '⚡', 'pumped': '🔥', 'motivated': '🔥',
    'hopeful': '✨', 'optimistic': '🌟', 'inspired': '✨', 'uplifted': '🌈',
    'peaceful': '😌', 'calm': '😌', 'relaxed': '😊', 'serene': '🕊️',
    'playful': '😜', 'silly': '🤪', 'goofy': '😝', 'fun': '🎉',
    
    // Negative emotions
    'sad': '😢', 'unhappy': '😞', 'down': '😔', 'depressed': '😭',
    'anxious': '😰', 'worried': '😟', 'nervous': '😬', 'stressed': '😫',
    'angry': '😡', 'mad': '😠', 'furious': '🤬', 'irritated': '😤',
    'frustrated': '😤', 'annoyed': '😒', 'bothered': '😑',
    'tired': '😴', 'exhausted': '😩', 'drained': '😓', 'weary': '😪',
    'lonely': '😔', 'isolated': '😞', 'alone': '🥺', 'abandoned': '💔',
    'scared': '😨', 'afraid': '😱', 'fearful': '😰', 'terrified': '😱',
    'confused': '😕', 'uncertain': '🤔', 'lost': '😵', 'overwhelmed': '😵‍💫',
    'hurt': '😞', 'pain': '😣', 'aching': '💔', 'broken': '💔',
    'guilty': '😔', 'ashamed': '😳', 'regretful': '😞', 'remorseful': '😔',
    'disappointed': '😞', 'let down': '😔', 'discouraged': '😟',
    'empty': '😶', 'numb': '😐', 'blank': '😶', 'hollow': '🫥',
    'jealous': '😒', 'envious': '😠', 'bitter': '😤',
    
    // Neutral/Complex emotions
    'thoughtful': '🤔', 'pensive': '🤔', 'contemplative': '💭', 'reflective': '🤔',
    'surprised': '😮', 'shocked': '😲', 'amazed': '😯', 'astonished': '🤯',
    'curious': '🤨', 'interested': '🧐', 'intrigued': '🤔',
    'nostalgic': '🥺', 'wistful': '😌', 'sentimental': '🥺',
    'bored': '😑', 'uninterested': '😐', 'indifferent': '😶',
    'restless': '😬', 'uneasy': '😟', 'uncomfortable': '😣',
  };
  
  // Check for exact matches first
  if (emojiMap[lowercaseEmotion]) {
    return emojiMap[lowercaseEmotion];
  }
  
  // Check for partial matches
  for (const [keyword, emoji] of Object.entries(emojiMap)) {
    if (lowercaseEmotion.includes(keyword) || keyword.includes(lowercaseEmotion)) {
      return emoji;
    }
  }
  
  // Default emoji - no emoji for unknown emotions
  return '';
};

export function JournalPrompt({ onComplete, onSkip, isDarkMode, onBack, isStandalone = false, onViewEntries }: JournalPromptProps) {
  const [entry, setEntry] = useState('');
  const [prompt, setPrompt] = useState('');
  const [showPrompt, setShowPrompt] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [savedEntry, setSavedEntry] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [frequentHashtags, setFrequentHashtags] = useState<string[]>([]);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [moodIntensities, setMoodIntensities] = useState<{ [emotion: string]: number }>({});
  const [customEmotions, setCustomEmotions] = useState<{ emoji: string; label: string }[]>([]);
  const [showCustomEmotionInput, setShowCustomEmotionInput] = useState(false);
  const [customEmotionLabel, setCustomEmotionLabel] = useState('');
  const [customEmotionEmoji, setCustomEmotionEmoji] = useState('😊');
  const [media, setMedia] = useState<{ type: 'photo' | 'video', url: string } | null>(null);
  const [savedHashtags, setSavedHashtags] = useState<string[]>([]);
  const [savedEmotions, setSavedEmotions] = useState<string[]>([]);
  const [savedMoodIntensities, setSavedMoodIntensities] = useState<{ [emotion: string]: number }>({});
  const [savedMedia, setSavedMedia] = useState<{ type: 'photo' | 'video', url: string } | null>(null);
  const [savedPrompt, setSavedPrompt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Get a random prompt when component mounts
    setPrompt(getJournalPrompt());
    
    // Load frequent hashtags
    loadFrequentHashtags();
    
    // Load custom emotions from localStorage
    const savedCustomEmotions = localStorage.getItem('mindcheck_custom_emotions');
    if (savedCustomEmotions) {
      setCustomEmotions(JSON.parse(savedCustomEmotions));
    }
  }, []);

  const loadFrequentHashtags = () => {
    const hashtagCount: { [key: string]: number } = JSON.parse(
      localStorage.getItem('mindcheck_hashtag_count') || '{}'
    );
    
    // Sort by frequency and get top 10
    const sorted = Object.entries(hashtagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
    
    setFrequentHashtags(sorted);
  };

  const addHashtag = (tag: string) => {
    const cleanTag = tag.toLowerCase().trim().replace(/^#/, '');
    if (cleanTag && !hashtags.includes(cleanTag)) {
      setHashtags([...hashtags, cleanTag]);
      setHashtagInput('');
      setShowHashtagSuggestions(false);
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter(t => t !== tag));
  };

  const handleHashtagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && hashtagInput.trim()) {
      e.preventDefault();
      addHashtag(hashtagInput);
    }
  };

  const handleNewPrompt = () => {
    setPrompt(getJournalPrompt());
    setShowPrompt(true);
  };

  const handleWriteFreely = () => {
    setShowPrompt(false);
  };

  const handleAddCustomEmotion = () => {
    if (customEmotionLabel.trim()) {
      const newEmotion = {
        emoji: customEmotionEmoji || '', // Allow empty emoji
        label: customEmotionLabel.trim()
      };
      const updatedCustomEmotions = [...customEmotions, newEmotion];
      setCustomEmotions(updatedCustomEmotions);
      localStorage.setItem('mindcheck_custom_emotions', JSON.stringify(updatedCustomEmotions));
      
      // Auto-select the new emotion
      setSelectedEmotions([...selectedEmotions, newEmotion.label]);
      setMoodIntensities({ ...moodIntensities, [newEmotion.label]: 5 });
      
      // Reset form
      setCustomEmotionLabel('');
      setCustomEmotionEmoji('😊');
      setShowCustomEmotionInput(false);
    }
  };

  const handleSubmit = () => {
    if (entry.trim()) {
      // Save the entry and show confirmation modal
      setSavedEntry(entry);
      setSavedHashtags(hashtags);
      setSavedEmotions(selectedEmotions);
      setSavedMoodIntensities(moodIntensities);
      setSavedMedia(media);
      setSavedPrompt(showPrompt ? prompt : null);
      setShowConfirmation(true);
    } else {
      onSkip();
    }
  };

  const handleWriteAnother = () => {
    // Reset for another entry
    setHashtags([]);
    setHashtagInput('');
    setEntry('');
    setShowConfirmation(false);
    setPrompt(getJournalPrompt());
    setShowPrompt(true);
    setSelectedEmotions([]);
    setMoodIntensities({});
    setMedia(null);
  };

  const handleFinish = () => {
    // Complete and return to home
    onComplete(savedEntry, savedHashtags, savedEmotions, savedMedia, savedPrompt, savedMoodIntensities);
  };

  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Scale down if wider than maxWidth
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', quality);
            resolve(compressed);
          } else {
            reject(new Error('Canvas context unavailable'));
          }
        };
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = reader.result as string;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        if (file.type.includes('video')) {
          // Videos: store as-is but warn if too large (>2MB)
          if (file.size > 2 * 1024 * 1024) {
            alert('Video is too large. Please use a shorter clip (under 2MB).');
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const url = reader.result as string;
            setMedia({ type: 'video', url });
          };
          reader.readAsDataURL(file);
        } else {
          // Images: compress before storing
          const compressed = await compressImage(file, 800, 0.6);
          setMedia({ type: 'photo', url: compressed });
        }
      } catch (error) {
        console.error('Error processing media:', error);
        alert('Could not process this file. Please try a different one.');
      }
    }
  };

  const insertFormatting = (formatType: 'bold' | 'italic' | 'bullet' | 'number') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = entry.substring(start, end);
    const beforeText = entry.substring(0, start);
    const afterText = entry.substring(end);

    let newText = '';
    let newCursorPosition = 0;

    switch (formatType) {
      case 'bold':
        if (selectedText) {
          newText = `${beforeText}**${selectedText}**${afterText}`;
          newCursorPosition = start + selectedText.length + 4;
        } else {
          return;
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = `${beforeText}*${selectedText}*${afterText}`;
          newCursorPosition = start + selectedText.length + 2;
        } else {
          return;
        }
        break;
      case 'bullet':
        const beforeLines = beforeText.split('\n');
        const currentLine = beforeLines[beforeLines.length - 1];
        
        if (/^\d+\.\s*$/.test(currentLine) && !selectedText) {
          const withoutLastLine = beforeLines.slice(0, -1).join('\n');
          const prefix = withoutLastLine ? withoutLastLine + '\n' : '';
          newText = `${prefix}• ${afterText}`;
          newCursorPosition = prefix.length + 2;
        } else {
          const bulletPrefix = (start > 0 && beforeText[beforeText.length - 1] !== '\n') ? '\n• ' : '• ';
          newText = `${beforeText}${bulletPrefix}${selectedText}${afterText}`;
          newCursorPosition = start + bulletPrefix.length + selectedText.length;
        }
        break;
      case 'number':
        const beforeLinesNum = beforeText.split('\n');
        const currentLineNum = beforeLinesNum[beforeLinesNum.length - 1];
        
        if (/^•\s*$/.test(currentLineNum) && !selectedText) {
          const withoutLastLine = beforeLinesNum.slice(0, -1).join('\n');
          const prefix = withoutLastLine ? withoutLastLine + '\n' : '';
          newText = `${prefix}1. ${afterText}`;
          newCursorPosition = prefix.length + 3;
        } else {
          const numberPrefix = (start > 0 && beforeText[beforeText.length - 1] !== '\n') ? '\n1. ' : '1. ';
          newText = `${beforeText}${numberPrefix}${selectedText}${afterText}`;
          newCursorPosition = start + numberPrefix.length + selectedText.length;
        }
        break;
    }

    setEntry(newText);

    setTimeout(() => {
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      textarea.focus();
    }, 0);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6 py-12`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full space-y-6 relative my-auto"
      >
        {/* Back Button for Standalone */}
        {isStandalone && onBack && (
          <div className="absolute -top-2 -left-2">
            <BackButton onClick={onBack} isDarkMode={isDarkMode} />
          </div>
        )}

        {/* View Entries Button */}
        {isStandalone && onViewEntries && (
          <div className="absolute -top-2 -right-2">
            <button
              onClick={onViewEntries}
              className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg`}
              aria-label="View saved entries"
            >
              <Archive className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
            </button>
          </div>
        )}

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-full flex items-center justify-center shadow-lg">
            <BookOpen className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          {showPrompt ? (
            <>
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                {prompt || "How are you feeling today?"}
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                Take a moment to reflect (optional)
              </p>
              
              {/* Prompt Controls */}
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleNewPrompt}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all active:scale-95 ${
                    isDarkMode 
                      ? 'bg-[#2a2218] text-[#ece5de] hover:bg-[#3a3228]' 
                      : 'bg-white/60 text-[#8d654c] hover:bg-white'
                  }`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Different Question
                </button>
                
                <button
                  onClick={handleWriteFreely}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all active:scale-95 ${
                    isDarkMode 
                      ? 'bg-[#2a2218] text-[#ece5de] hover:bg-[#3a3228]' 
                      : 'bg-white/60 text-[#8d654c] hover:bg-white'
                  }`}
                >
                  <X className="w-4 h-4" />
                  Write Freely
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Free Writing
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                Express yourself freely
              </p>
              
              {/* Show Prompt Again Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={handleNewPrompt}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all active:scale-95 ${
                    isDarkMode 
                      ? 'bg-[#2a2218] text-[#ece5de] hover:bg-[#3a3228]' 
                      : 'bg-white/60 text-[#8d654c] hover:bg-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Get a Prompt
                </button>
              </div>
            </>
          )}
        </div>

        {/* Text Area with Formatting Toolbar */}
        <div className="space-y-2">
          {/* Formatting Toolbar */}
          <div className={`flex items-center gap-1 p-2 rounded-xl ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'}`}>
            <button
              onClick={() => insertFormatting('bold')}
              className={`p-2 rounded-lg transition-all active:scale-95 hover:bg-[#ffb757]/10 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}
              title="Bold"
              type="button"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('italic')}
              className={`p-2 rounded-lg transition-all active:scale-95 hover:bg-[#ffb757]/10 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}
              title="Italic"
              type="button"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('bullet')}
              className={`p-2 rounded-lg transition-all active:scale-95 hover:bg-[#ffb757]/10 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}
              title="Bullet List"
              type="button"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => insertFormatting('number')}
              className={`p-2 rounded-lg transition-all active:scale-95 hover:bg-[#ffb757]/10 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}
              title="Numbered List"
              type="button"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className={`flex-1 text-right text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>
              {entry.length} chars
            </div>
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="Share your thoughts..."
            className={`w-full h-40 p-4 rounded-2xl resize-none ${
              isDarkMode 
                ? 'bg-[#2a2218] text-[#ece5de] placeholder-[#ece5de]/40 border-[#8d654c]/20' 
                : 'bg-white/80 text-[#8d654c] placeholder-[#8d654c]/40 border-[#ddc4af]'
            } border focus:outline-none focus:ring-2 focus:ring-[#ffb757]/30`}
          />
        </div>

        {/* Hashtags */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Hash className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`} />
            <input
              type="text"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagInputKeyDown}
              onFocus={() => setShowHashtagSuggestions(true)}
              onBlur={() => setTimeout(() => setShowHashtagSuggestions(false), 200)}
              placeholder="Type hashtag and press Enter..."
              className={`flex-1 px-3 py-2 rounded-xl text-sm ${
                isDarkMode 
                  ? 'bg-[#2a2218] text-[#ece5de] placeholder-[#ece5de]/40 border-[#8d654c]/20' 
                  : 'bg-white/80 text-[#8d654c] placeholder-[#8d654c]/40 border-[#ddc4af]'
              } border focus:outline-none focus:ring-2 focus:ring-[#ffb757]/30`}
            />
          </div>

          {/* Selected Hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {hashtags.map(tag => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-[#ffb757] text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium shadow-sm"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => removeHashtag(tag)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Frequent Hashtags */}
          {frequentHashtags.length > 0 && !showHashtagSuggestions && (
            <div className="space-y-2">
              <p className={`text-xs font-medium ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
                Frequently used:
              </p>
              <div className="flex flex-wrap gap-2">
                {frequentHashtags.slice(0, 6).map(tag => (
                  <button
                    key={tag}
                    onClick={() => addHashtag(tag)}
                    disabled={hashtags.includes(tag)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all active:scale-95 ${
                      hashtags.includes(tag)
                        ? isDarkMode
                          ? 'bg-[#2a2218]/50 text-[#ece5de]/30'
                          : 'bg-white/30 text-[#8d654c]/30'
                        : isDarkMode
                          ? 'bg-[#2a2218] text-[#ece5de]/70 hover:bg-[#3a3228]'
                          : 'bg-white/60 text-[#8d654c] hover:bg-white'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hashtag Suggestions Dropdown */}
          {showHashtagSuggestions && frequentHashtags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl p-2 max-h-40 overflow-y-auto ${
                isDarkMode ? 'bg-[#2a2218] border border-[#8d654c]/20' : 'bg-white border border-[#ddc4af]'
              }`}
            >
              {frequentHashtags.map(tag => (
                <button
                  key={tag}
                  onClick={() => addHashtag(tag)}
                  disabled={hashtags.includes(tag)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    hashtags.includes(tag)
                      ? isDarkMode
                        ? 'text-[#ece5de]/30'
                        : 'text-[#8d654c]/30'
                      : isDarkMode
                        ? 'text-[#ece5de] hover:bg-[#3a3228]'
                        : 'text-[#8d654c] hover:bg-[#ece5de]/50'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Emotion Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              How are you feeling? (optional)
            </p>
            {selectedEmotions.length > 0 && (
              <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                {selectedEmotions.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {[...emotions, ...customEmotions].map(({ emoji, label }) => (
              <button
                key={label}
                onClick={() => {
                  if (selectedEmotions.includes(label)) {
                    setSelectedEmotions(selectedEmotions.filter(e => e !== label));
                    const newIntensities = { ...moodIntensities };
                    delete newIntensities[label];
                    setMoodIntensities(newIntensities);
                  } else {
                    setSelectedEmotions([...selectedEmotions, label]);
                    setMoodIntensities({ ...moodIntensities, [label]: 5 });
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  selectedEmotions.includes(label)
                    ? 'bg-[#ffb757] text-white shadow-sm'
                    : isDarkMode
                      ? 'bg-[#2a2218] text-[#ece5de]/70 hover:bg-[#3a3228]'
                      : 'bg-white/60 text-[#8d654c] hover:bg-white'
                }`}
              >
                {emoji && <span className="mr-1">{emoji}</span>}
                {label}
              </button>
            ))}
            {/* Add Custom Emotion Button */}
            <button
              onClick={() => setShowCustomEmotionInput(!showCustomEmotionInput)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-1 ${
                isDarkMode
                  ? 'bg-[#2a2218] text-[#ece5de]/70 hover:bg-[#3a3228]'
                  : 'bg-white/60 text-[#8d654c] hover:bg-white'
              }`}
            >
              <Plus className="w-3 h-3" />
              Add custom
            </button>
          </div>
        </div>

        {/* Custom Emotion Input */}
        {showCustomEmotionInput && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customEmotionEmoji}
                onChange={(e) => setCustomEmotionEmoji(e.target.value)}
                placeholder="😊"
                maxLength={2}
                className={`w-16 px-3 py-2 rounded-xl text-sm text-center ${
                  isDarkMode 
                    ? 'bg-[#2a2218] text-[#ece5de] placeholder-[#ece5de]/40 border-[#8d654c]/20' 
                    : 'bg-white/80 text-[#8d654c] placeholder-[#8d654c]/40 border-[#ddc4af]'
                } border focus:outline-none focus:ring-2 focus:ring-[#ffb757]/30`}
              />
              <input
                type="text"
                value={customEmotionLabel}
                onChange={(e) => {
                  const newLabel = e.target.value;
                  setCustomEmotionLabel(newLabel);
                  // Auto-suggest emoji based on the emotion label
                  if (newLabel.trim()) {
                    setCustomEmotionEmoji(getEmojiForEmotion(newLabel));
                  }
                }}
                placeholder="Emotion name (e.g. Exhausted)"
                className={`flex-1 px-3 py-2 rounded-xl text-sm ${
                  isDarkMode 
                    ? 'bg-[#2a2218] text-[#ece5de] placeholder-[#ece5de]/40 border-[#8d654c]/20' 
                    : 'bg-white/80 text-[#8d654c] placeholder-[#8d654c]/40 border-[#ddc4af]'
                } border focus:outline-none focus:ring-2 focus:ring-[#ffb757]/30`}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCustomEmotion}
                className="flex-1 bg-[#ffb757] text-white py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                Add Emotion
              </button>
              <button
                onClick={() => {
                  setShowCustomEmotionInput(false);
                  setCustomEmotionLabel('');
                  setCustomEmotionEmoji('😊');
                }}
                className={`flex-1 py-2 rounded-xl text-sm font-medium ${
                  isDarkMode ? 'bg-[#2a2218] text-[#ece5de]' : 'bg-white/60 text-[#8d654c]'
                } active:scale-95 transition-transform`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Mood Intensity Sliders */}
        {selectedEmotions.length > 0 && (
          <div className="space-y-3">
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              How intense are these feelings? (1-10)
            </p>
            {selectedEmotions.map((emotion) => {
              const allEmotions = [...emotions, ...customEmotions];
              const emotionData = allEmotions.find(e => e.label === emotion);
              const intensity = moodIntensities[emotion] || 5;
              
              return (
                <div key={emotion} className={`p-3 rounded-xl ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                        {emotionData?.emoji} {emotion}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDarkMode ? 'bg-[#1a1410] text-[#ece5de]' : 'bg-[#ece5de] text-[#8d654c]'}`}>
                        {intensity}/10
                      </span>
                      <button
                        onClick={() => {
                          setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
                          const newIntensities = { ...moodIntensities };
                          delete newIntensities[emotion];
                          setMoodIntensities(newIntensities);
                        }}
                        className={`p-1 rounded-full transition-colors hover:bg-red-500/20 ${
                          isDarkMode ? 'text-[#ece5de]/50 hover:text-red-400' : 'text-[#8d654c]/50 hover:text-red-600'
                        }`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={intensity}
                    onChange={(e) => setMoodIntensities({ ...moodIntensities, [emotion]: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ffb757 0%, #ffb757 ${(intensity - 1) * 11.11}%, ${isDarkMode ? '#1a1410' : '#ddc4af'} ${(intensity - 1) * 11.11}%, ${isDarkMode ? '#1a1410' : '#ddc4af'} 100%)`
                    }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>Mild</span>
                    <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>Intense</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Media Upload */}
        <div className="space-y-3">
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
            Add a photo or video (optional):
          </p>
          <div className="flex flex-col gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
            {!media ? (
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  isDarkMode 
                    ? 'bg-[#2a2218] text-[#ece5de] hover:bg-[#3a3228]' 
                    : 'bg-white/60 text-[#8d654c] hover:bg-white'
                }`}
              >
                <Image className="w-4 h-4" />
                Choose Photo/Video
              </button>
            ) : (
              <div className={`rounded-xl p-3 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {media.type === 'photo' ? (
                      <Image className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                    ) : (
                      <Video className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
                    )}
                    <span className={`text-sm ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                      {media.type === 'photo' ? 'Photo' : 'Video'} attached
                    </span>
                  </div>
                  <button
                    onClick={() => setMedia(null)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                      isDarkMode 
                        ? 'bg-[#1a1410] text-[#ece5de] hover:bg-[#1a1410]/80' 
                        : 'bg-[#ece5de] text-[#8d654c] hover:bg-[#ddc4af]/50'
                    }`}
                  >
                    Remove
                  </button>
                </div>
                {media.type === 'photo' && (
                  <div className="mt-3">
                    <img src={media.url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#ffb757] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
          >
            <span>{isStandalone ? 'Save Entry' : 'Continue'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={isStandalone ? onBack : onSkip}
            className={`w-full py-3 text-sm font-medium ${
              isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'
            }`}
          >
            {isStandalone ? 'Cancel' : 'Skip for now'}
          </button>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`max-w-sm w-full rounded-3xl p-8 shadow-2xl ${
                isDarkMode ? 'bg-[#2a2218]' : 'bg-white'
              }`}
            >
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-6"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-full flex items-center justify-center shadow-lg">
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center space-y-4"
              >
                <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                  Entry Saved! 🌿
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
                  Your thoughts have been recorded
                </p>

                {/* Entry Preview */}
                <div className={`rounded-2xl p-4 text-left space-y-3 ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]/50'}`}>
                  {/* Entry Text Preview */}
                  <p className={`text-sm leading-relaxed line-clamp-3 ${isDarkMode ? 'text-[#ece5de]/80' : 'text-[#8d654c]/80'}`}>
                    {savedEntry}
                  </p>

                  {/* Emotions */}
                  {savedEmotions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {savedEmotions.map((emotion, idx) => {
                        const allEmotions = [...emotions, ...customEmotions];
                        const emotionData = allEmotions.find(e => e.label === emotion);
                        const intensity = savedMoodIntensities[emotion];
                        return (
                          <span
                            key={idx}
                            className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-[#2a2218] text-[#ece5de]/70' : 'bg-white/60 text-[#8d654c]/70'}`}
                          >
                            {emotionData?.emoji} {emotion} {intensity && `(${intensity}/10)`}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Hashtags */}
                  {savedHashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {savedHashtags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-[#2a2218] text-[#ece5de]/70' : 'bg-white/60 text-[#8d654c]/70'}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleFinish}
                    className="w-full bg-[#ffb757] text-white py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
                  >
                    <span>Done</span>
                    <Check className="w-5 h-5" />
                  </button>

                  {isStandalone && (
                    <button
                      onClick={handleWriteAnother}
                      className={`w-full py-3 rounded-2xl font-medium transition-all active:scale-[0.98] ${
                        isDarkMode 
                          ? 'bg-[#1a1410] text-[#ece5de] hover:bg-[#1a1410]/80' 
                          : 'bg-[#ece5de]/70 text-[#8d654c] hover:bg-[#ddc4af]/50'
                      }`}
                    >
                      Write Another Entry
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}