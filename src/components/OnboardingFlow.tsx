import { useState } from 'react';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { ConsentScreen } from './onboarding/ConsentScreen';
import { PreferencesScreen } from './onboarding/PreferencesScreen';
import { BaselineScreen } from './onboarding/BaselineScreen';
import { DataSyncPreferenceModal } from './modals/DataSyncPreferenceModal';
import {
  saveNotificationPrefs,
  requestPermission,
  computeNextNotificationAt,
  registerFCMToken,
  savePrefsToFirestore,
} from '../utils/notificationManager';
import { getUserId } from '../utils/dataSync';
import { enableCloudSync, disableCloudSync, uploadAllLocalData } from '../utils/cloudSync';
import { logUserActivity } from '../utils/firebaseSync';

interface OnboardingFlowProps {
  onComplete: () => void;
  onStartCheckIn: () => void;
}

export function OnboardingFlow({ onComplete, onStartCheckIn }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [preferences, setPreferences] = useState({
    frequency: 'weekly',
    timePreference: 'morning',
    reminders: true
  });

  const handleWelcomeNext = () => setStep(1);
  const handleConsentAccept = () => setStep(2);
  const handleConsentBack = () => setStep(0);
  
  const handlePreferencesComplete = (prefs: typeof preferences) => {
    setPreferences(prefs);

    const notifPrefs = {
      frequency:      prefs.frequency      as 'weekly' | 'twice-weekly' | 'monthly',
      timePreference: prefs.timePreference as 'morning' | 'afternoon' | 'night',
      reminders:      prefs.reminders,
    };

    // Always persist frequency + timePreference unconditionally so selections are never lost
    saveNotificationPrefs(notifPrefs);
    localStorage.setItem('mindcheck_preferences', JSON.stringify(prefs));

    // Advance to BaselineScreen — permission is requested there via a direct button tap
    // DO NOT call requestPermission() here — it fires after setStep() which breaks the
    // user gesture chain on mobile, causing silent auto-denial by the browser
    setStep(3);

    // Show cloud sync consent if the user hasn't seen it yet
    const hasAskedSync = localStorage.getItem('mindcheck_sync_preference_asked') === 'true';
    if (!hasAskedSync) {
      setShowSyncModal(true);
    }
  };

  // Called directly from BaselineScreen's "Allow Notifications" button onClick
  // MUST be called synchronously within a user gesture — no await before requestPermission()
  const handleRequestNotificationPermission = async () => {
    const notifPrefs = {
      frequency:      preferences.frequency      as 'weekly' | 'twice-weekly' | 'monthly',
      timePreference: preferences.timePreference as 'morning' | 'afternoon' | 'night',
      reminders:      preferences.reminders,
    };

    if (!notifPrefs.reminders) return;

    // requestPermission() is the FIRST thing called — preserves user gesture on mobile
    const permission = await requestPermission();
    if (permission === 'granted') {
      const withSchedule = {
        ...notifPrefs,
        nextNotificationAt: computeNextNotificationAt(notifPrefs),
      };
      saveNotificationPrefs(withSchedule);
      const uid = await getUserId();
      if (uid) registerFCMToken(uid, withSchedule);
    } else {
      saveNotificationPrefs({ ...notifPrefs, reminders: false });
    }
  };

  const handlePreferencesBack = () => setStep(1);

  const handleStartNow = () => {
    onComplete();
   setTimeout(() => {
      onStartCheckIn();
    }, 100);

  };

  const handleLater = () => {
    onComplete();
  };

  const handleBaselineBack = () => setStep(2);

  return (
    <>
      {step === 0 && <WelcomeScreen onNext={handleWelcomeNext} />}
      {step === 1 && <ConsentScreen onAccept={handleConsentAccept} onBack={handleConsentBack} />}
      {step === 2 && (
        <PreferencesScreen 
          onComplete={handlePreferencesComplete}
          onBack={handlePreferencesBack}
          initialPreferences={preferences}
        />
      )}
      {step === 3 && (
        <>
          <BaselineScreen
            onStartNow={handleStartNow}
            onLater={handleLater}
            onBack={handleBaselineBack}
            onRequestNotificationPermission={handleRequestNotificationPermission}
            remindersEnabled={preferences.reminders}
          />
          {showSyncModal && (
            <DataSyncPreferenceModal
              isDarkMode={false}
              onClose={() => {
                // Dismissed without choosing — treat as declined, no Firestore record
                localStorage.setItem('mindcheck_sync_preference_asked', 'true');
                localStorage.setItem('mindcheck_cloud_backup_enabled', 'false');
                setShowSyncModal(false);
              }}
              onChooseBackend={() => {
                localStorage.setItem('mindcheck_cloud_backup_preference', 'accepted');
                enableCloudSync(); // must be FIRST — events below need isSyncEnabled()=true
                logUserActivity('first_consent_shown', { source: 'onboarding' });
                logUserActivity('cloud_sync_enabled', { source: 'onboarding' });
                getUserId().then(uid => { if (uid) savePrefsToFirestore(uid, preferences); });
                uploadAllLocalData();
                setShowSyncModal(false);
              }}
              onChooseLocal={() => {
                // Declined — sync never enabled, events would be dropped by execute()
                // so we only update localStorage; no Firestore record for declined users (by design)
                localStorage.setItem('mindcheck_cloud_backup_preference', 'declined');
                localStorage.setItem('mindcheck_sync_preference_asked', 'true');
                disableCloudSync();
                setShowSyncModal(false);
              }}
            />
          )}
        </>
      )}
    </>
  );
}