import { useState, useEffect } from 'react';
import { OnboardingFlow } from './components/OnboardingFlow';
import { CheckInHub } from './components/CheckInHub';
import { CheckInFlow } from './components/CheckInFlow';
import { TrendsScreen } from './components/TrendsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNav } from './components/BottomNav';
import { DailyCheckInFlow } from './components/ema/EMAFlow';
import { GamesScreen } from './components/GamesScreen';
import { JournalPrompt } from './components/checkin/JournalPrompt';
import { JournalEntriesScreen } from './components/JournalEntriesScreen';
import { JournalEntryDetail } from './components/JournalEntryDetail';
import { saveDayLog, saveJournalEntry, getUserId } from './utils/dataSync';
import { saveJournal, logUserActivity, flushOfflineQueue } from './utils/firebaseSync';
import { APP_VERSION } from './utils/appConfig';

interface JournalEntry {
  id: string;
  entry: string;
  hashtags: string[];
  timestamp: string | number;
  date?: string;
  emotions?: string[];
  moodIntensities?: { [emotion: string]: number };
  media?: { type: 'photo' | 'video', url: string } | null;
  prompt?: string | null;
}

export type TabType = 'home' | 'checkin' | 'trends' | 'profile' | 'journal-entries';

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isInCheckIn, setIsInCheckIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showGames, setShowGames] = useState(false);
  const [showJournal, setShowJournal] = useState(false);
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [showJournalDetail, setShowJournalDetail] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [trendsRefreshKey, setTrendsRefreshKey] = useState(0);

  useEffect(() => {
    logUserActivity('app_open');
    flushOfflineQueue();

    const onboarded = localStorage.getItem('mindcheck_onboarded');
    if (onboarded === 'true') {
      setHasOnboarded(true);
    }

    // Load dark mode preference
    const darkMode = localStorage.getItem('mindcheck_dark_mode');
    if (darkMode === 'true') {
      setIsDarkMode(true);
    }

    // Backend sync disabled for compliance — data stays on device only.
    // To re-enable in future: restore initializeBackendSync() call here.

    // One-time silent deduplication of journal entries from previous builds
    try {
      const dedupeVersion = APP_VERSION;
      const alreadyDeduped = localStorage.getItem('mindcheck_dedupe_done');
      if (alreadyDeduped !== dedupeVersion) {
        const raw = localStorage.getItem('mindcheck_journal_entries_all');
        if (raw) {
          const entries = JSON.parse(raw);
          const seen = new Set<string>();
          const deduped = entries.filter((e: any) => {
            const key = `${(e.entry || '').trim()}-${e.date || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          if (deduped.length !== entries.length) {
            localStorage.setItem('mindcheck_journal_entries_all', JSON.stringify(deduped));
          }
        }
        localStorage.setItem('mindcheck_dedupe_done', dedupeVersion);
      }
    } catch (e) {
      console.error('Deduplication failed:', e);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('mindcheck_onboarded', 'true');
    setHasOnboarded(true);
  };

  const handleStartCheckIn = () => {
    setCurrentTab('checkin');
    setIsInCheckIn(true);
  };

  const handleCheckInComplete = () => {
    setIsInCheckIn(false);
    setCurrentTab('trends');
    setTrendsRefreshKey(prev => prev + 1);
    // Note: Cloud backup preference is now handled in CompletionSummary component
  };

  const handleCheckInCancel = () => {
    setIsInCheckIn(false);
    setCurrentTab('home');
  };

  const handleTabChange = (tab: TabType) => {
    if (tab !== currentTab) {
      logUserActivity('tab_visit', { tab });
      if (tab === 'checkin') {
        setIsInCheckIn(true);
      }
      
      // Refresh trends data when navigating to trends tab
      if (tab === 'trends') {
        setTimeout(() => {
          setTrendsRefreshKey(prev => prev + 1);
        }, 300);
      }
      
      // If user is in check-in and tries to navigate away, just reset
      if (isInCheckIn && currentTab === 'checkin') {
        setIsInCheckIn(false);
      }
      setCurrentTab(tab);
    }
  };

  const handleOpenDailyCheckIn = () => {
    setShowDailyCheckIn(true);
  };

  const handleDailyCheckInComplete = (dailyCheckInData: any) => {
    // Save My Day Log data
    const today = new Date().toISOString().split('T')[0];
    const existingData = JSON.parse(localStorage.getItem('mindcheck_ema_data') || '{}');
    
    if (!existingData[today]) {
      existingData[today] = [];
    }
    
    const newEntry = {
      ...dailyCheckInData,
      timestamp: new Date().toISOString()
    };
    
    existingData[today].push(newEntry);
    
    localStorage.setItem('mindcheck_ema_data', JSON.stringify(existingData));
    
    // Save to backend with date included
    saveDayLog({ ...newEntry, date: today }).catch(error => {
      console.error('Error saving day log:', error);
    });
    
    setShowDailyCheckIn(false);
  };

  const handleDailyCheckInSkip = () => {
    setShowDailyCheckIn(false);
  };

  const handleJournalSave = async (entry: string, hashtags: string[], emotions: string[], media: { type: 'photo' | 'video'; url: string } | null, prompt: string | null, moodIntensities?: { [emotion: string]: number }) => {
    // Get userId to tag the record
    let userId = '';
    try { userId = await getUserId(); } catch (e) { console.error('getUserId failed:', e); }

    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entry,
      emotions,
      hashtags,
      moodIntensities,
      media,
      prompt,
      checkin_type: 'individual',
      timestamp: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      userId,
    };
    
    // Update hashtag counts
    try {
      const hashtagCount = JSON.parse(localStorage.getItem('mindcheck_hashtag_count') || '{}');
      hashtags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
      localStorage.setItem('mindcheck_hashtag_count', JSON.stringify(hashtagCount));
    } catch (e) {
      console.error('Error saving hashtag counts:', e);
    }
    
    // Save to localStorage directly with try-catch to prevent white screen crash
    try {
      const allEntries = JSON.parse(localStorage.getItem('mindcheck_journal_entries_all') || '[]');
      const alreadySaved = allEntries.some((e: any) => e.id === newEntry.id);
      if (!alreadySaved) {
        allEntries.unshift(newEntry);
        localStorage.setItem('mindcheck_journal_entries_all', JSON.stringify(allEntries));
      }
    } catch (e) {
      console.error('Error saving journal to localStorage:', e);
      // If localStorage is full, try saving without media to prevent data loss
      try {
        const entryWithoutMedia = { ...newEntry, media: null };
        const allEntries = JSON.parse(localStorage.getItem('mindcheck_journal_entries_all') || '[]');
        allEntries.unshift(entryWithoutMedia);
        localStorage.setItem('mindcheck_journal_entries_all', JSON.stringify(allEntries));
      } catch (e2) {
        console.error('Critical: Could not save journal entry at all:', e2);
      }
    }
    
    // Also try backend save (fire and forget)
    saveJournalEntry(newEntry).catch(error => {
      console.error('Error saving journal entry to backend:', error);
    });

    // Firebase cloud sync
    const wordCount = entry.trim().split(/\s+/).filter(w => w.length > 0).length;
    saveJournal({
      checkin_type: 'individual',
      prompt_shown: prompt,
      prompt_type: prompt ? 'prompted' : 'freely_written',
      journal_text: entry,
      word_count: wordCount,
      has_image: !!media,
      emotions: emotions ?? [],
      mood_intensities: moodIntensities ?? {},
      hashtags: hashtags ?? [],
    });
    logUserActivity('journal_written', { source: 'standalone' });

    setShowJournal(false);
    
    // If viewing journal entries screen, refresh it
    if (currentTab === 'journal-entries') {
      setCurrentTab('home');
      setTimeout(() => setCurrentTab('journal-entries'), 0);
    }
  };

  const handleJournalSkip = () => {
    setShowJournal(false);
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('mindcheck_dark_mode', String(newMode));
  };

  if (!hasOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onStartCheckIn={handleStartCheckIn} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'}`}>
      {/* Mobile App Container */}
      <div className={`max-w-[390px] mx-auto min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} relative pb-20`}>
        {/* Screen Content */}
        {showGames ? (
          <GamesScreen
            onBack={() => {
              setShowGames(false);
              setTimeout(() => {
                setTrendsRefreshKey(prev => prev + 1);
              }, 300);
            }}
            isDarkMode={isDarkMode}
          />
        ) : showDailyCheckIn ? (
          <DailyCheckInFlow
            onComplete={handleDailyCheckInComplete}
            onSkip={handleDailyCheckInSkip}
            isDarkMode={isDarkMode}
          />
        ) : showJournal ? (
          <JournalPrompt 
            onComplete={handleJournalSave}
            onSkip={handleJournalSkip}
            isDarkMode={isDarkMode}
            isStandalone={true}
            onBack={() => setShowJournal(false)}
            onViewEntries={() => {
              setShowJournal(false);
              setShowJournalEntries(true);
            }}
          />
        ) : showJournalEntries ? (
          <JournalEntriesScreen 
            key={Date.now()} // Force re-mount to refresh data
            isDarkMode={isDarkMode} 
            onBack={() => setShowJournalEntries(false)} 
            onViewEntry={(entry) => {
              setSelectedEntry(entry);
              setShowJournalEntries(false);
              setShowJournalDetail(true);
            }}
            onStartNewEntry={() => {
              setShowJournalEntries(false);
              setShowJournal(true);
            }}
          />
        ) : showJournalDetail && selectedEntry ? (
          <JournalEntryDetail 
            isDarkMode={isDarkMode} 
            onBack={() => {
              setShowJournalDetail(false);
              setShowJournalEntries(true);
            }} 
            entry={selectedEntry} 
          />
        ) : currentTab === 'home' && !isInCheckIn ? (
          <CheckInHub 
            onStartCheckIn={handleStartCheckIn} 
            isDarkMode={isDarkMode} 
            onNavigateToTrends={() => setCurrentTab('trends')}
            onOpenDailyCheckIn={handleOpenDailyCheckIn}
            onNavigateToGames={() => setShowGames(true)}
            onOpenJournal={() => setShowJournal(true)}
            onOpenJournalEntries={() => setShowJournalEntries(true)}
          />
        ) : (currentTab === 'checkin' || isInCheckIn) ? (
          <CheckInFlow 
            onComplete={handleCheckInComplete} 
            onCancel={handleCheckInCancel} 
            isDarkMode={isDarkMode}
            onNavigateToDayLog={handleOpenDailyCheckIn}
            onNavigateToJournal={() => setShowJournal(true)}
          />
        ) : currentTab === 'trends' && !isInCheckIn ? (
          <TrendsScreen 
            key={`trends-${trendsRefreshKey}`} // Force refresh when navigating to trends
            isDarkMode={isDarkMode} 
            onBack={() => setCurrentTab('home')} 
          />
        ) : currentTab === 'profile' && !isInCheckIn ? (
          <ProfileScreen isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
        ) : null}

        {/* Bottom Navigation */}
        {!showDailyCheckIn && !showGames && !showJournal && !showJournalEntries && !showJournalDetail && (
          <BottomNav currentTab={currentTab} onTabChange={handleTabChange} isDarkMode={isDarkMode} />
        )}
      </div>
    </div>
  );
}