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
import { saveDayLog, getUserId } from './utils/dataSync';
import { savePrefsToFirestore, loadNotificationPrefs } from './utils/notificationManager';
import { saveJournal, logUserActivity, flushOfflineQueue } from './utils/firebaseSync';
import { savePrefsToFirestore } from './utils/notificationManager';
import { initAnalytics, logAppOpen, logTabVisit, logJournalWritten } from './utils/analytics';
import { APP_VERSION } from './utils/appConfig';
import {
  getSensitiveValueSync,
  initializeVault,
  migrateLegacySensitiveData,
  setSensitiveValue,
  exportSensitiveData,
} from './utils/secureVault';

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
  const [vaultStatus, setVaultStatus] = useState<'checking' | 'ready'>('checking');
  const [vaultError, setVaultError] = useState('');
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
    initAnalytics(); // init GA4 on first render

    const bootstrapVault = async () => {
      try {
        await initializeVault();
        await migrateLegacySensitiveData();
        setVaultStatus('ready');
      } catch (error) {
        console.error('Failed to initialize secure vault:', error);
        setVaultError('Secure storage could not be initialized in this browser.');
        setVaultStatus('ready');
      }
    };

    bootstrapVault();
  }, []);

  // Dev-only helper: access decrypted vault data from the browser console
  // Usage: window.__vault.export()
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).__vault = { export: exportSensitiveData };
    }
  }, []);

  useEffect(() => {
    if (vaultStatus !== 'ready') return;

    logUserActivity('app_open');
    logAppOpen(); // GA4

    // Fire once ever — marks when this user first opened the app after enabling sync
    const hasLoggedFirstOpen = localStorage.getItem('mindcheck_first_open_logged');
    if (!hasLoggedFirstOpen) {
      logUserActivity('first_app_open');
      localStorage.setItem('mindcheck_first_open_logged', 'true');
    }

    flushOfflineQueue();

    // One-time backfill of notificationPrefs to Firestore for existing users who
    // consented to cloud sync but never had prefs written (auth race condition / silent failures)
    const prefsBackfilled = localStorage.getItem('mindcheck_prefs_backfilled');
    if (!prefsBackfilled && localStorage.getItem('mindcheck_cloud_backup_enabled') === 'true') {
      const prefs = loadNotificationPrefs();
      if (prefs.frequency) {
        getUserId().then(uid => {
          if (uid) {
            savePrefsToFirestore(uid, prefs);
            localStorage.setItem('mindcheck_prefs_backfilled', 'true');
          }
        });
      }
    }

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
        const entries = getSensitiveValueSync<any[]>('mindcheck_journal_entries_all', []);
        if (entries.length > 0) {
          const seen = new Set<string>();
          const deduped = entries.filter((e: any) => {
            const key = `${(e.entry || '').trim()}-${e.date || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          if (deduped.length !== entries.length) {
            setSensitiveValue('mindcheck_journal_entries_all', deduped).catch((error) => {
              console.error('Could not write deduplicated journal entries:', error);
            });
          }
        }
        localStorage.setItem('mindcheck_dedupe_done', dedupeVersion);
      }
    } catch (e) {
      console.error('Deduplication failed:', e);
    }
    // Backfill notificationPrefs to Firestore for users who consented to cloud sync
    // but whose prefs were never written due to stale state / race conditions.
    // Runs silently in the background — no UI, no retries needed.
    const cloudSyncEnabled = localStorage.getItem('mindcheck_cloud_backup_enabled') === 'true';
    if (cloudSyncEnabled) {
      const raw = localStorage.getItem('mindcheck_preferences');
      if (raw) {
        try {
          const prefs = JSON.parse(raw);
          if (prefs.frequency || prefs.timePreference) {
            import('./firebase').then(({ db, getAuthUID }) =>
              import('firebase/firestore').then(({ doc, getDoc }) =>
                getAuthUID().then(uid =>
                  getDoc(doc(db, 'users', uid)).then(snap => {
                    const data = snap.data();
                    if (!data?.notificationPrefs?.reminders !== undefined) return; // already set
                    if (data?.notificationPrefs) return; // already set
                    savePrefsToFirestore(uid, prefs);
                  })
                )
              )
            ).catch(() => undefined);
          }
        } catch {
          // malformed localStorage — skip silently
        }
      }
    }
  }, [vaultStatus]);

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
      logTabVisit(tab); // GA4
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
    const existingData = getSensitiveValueSync<Record<string, any[]>>('mindcheck_ema_data', {});
    
    if (!existingData[today]) {
      existingData[today] = [];
    }
    
    const newEntry = {
      ...dailyCheckInData,
      timestamp: new Date().toISOString()
    };
    
    existingData[today].push(newEntry);
    
    setSensitiveValue('mindcheck_ema_data', existingData).catch(error => {
      console.error('Error saving secure day log:', error);
    });
    
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
      const hashtagCount = getSensitiveValueSync<Record<string, number>>('mindcheck_hashtag_count', {});
      hashtags.forEach(tag => {
        hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
      });
      setSensitiveValue('mindcheck_hashtag_count', hashtagCount).catch(error => {
        console.error('Error saving hashtag counts:', error);
      });
    } catch (e) {
      console.error('Error saving hashtag counts:', e);
    }
    
    // Save to secure vault directly with try-catch to prevent white screen crash
    try {
      const allEntries = getSensitiveValueSync<any[]>('mindcheck_journal_entries_all', []);
      const alreadySaved = allEntries.some((e: any) => e.id === newEntry.id);
      if (!alreadySaved) {
        allEntries.unshift(newEntry);
        await setSensitiveValue('mindcheck_journal_entries_all', allEntries);
      }
    } catch (e) {
      console.error('Error saving journal to secure vault:', e);
      // If the media payload fails, retry without media to prevent data loss
      try {
        const entryWithoutMedia = { ...newEntry, media: null };
        const allEntries = getSensitiveValueSync<any[]>('mindcheck_journal_entries_all', []);
        allEntries.unshift(entryWithoutMedia);
        await setSensitiveValue('mindcheck_journal_entries_all', allEntries);
      } catch (e2) {
        console.error('Critical: Could not save journal entry at all:', e2);
      }
    }
    
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
    logJournalWritten();

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

  if (vaultStatus === 'checking') {
    return (
      <div className="min-h-screen bg-[#ece5de] flex items-center justify-center p-6">
        <p className="text-[#8d654c] text-sm">Preparing secure storage...</p>
      </div>
    );
  }

  if (!hasOnboarded) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} onStartCheckIn={handleStartCheckIn} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'}`}>
      {vaultError && (
        <div className="max-w-[390px] mx-auto px-4 pt-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {vaultError}
          </div>
        </div>
      )}
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
