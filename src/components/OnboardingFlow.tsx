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

    // Save prefs to Firestore unconditionally (even if FCM permission denied later)
    // so that 1.3 notification metrics are available for all opted-in users
    getUserId().then(uid => { if (uid) savePrefsToFirestore(uid, notifPrefs); });

    // Advance immediately — never block navigation on a permission prompt
    setStep(3);

    // Show cloud sync consent if the user hasn't seen it yet
    const hasAskedSync = localStorage.getItem('mindcheck_sync_preference_asked') === 'true';
    if (!hasAskedSync) {
      setShowSyncModal(true);
      logUserActivity('first_consent_shown', { source: 'onboarding' });
    }

    if (prefs.reminders) {
      requestPermission().then(permission => {
        if (permission === 'granted') {
          const withSchedule = {
            ...notifPrefs,
            nextNotificationAt: computeNextNotificationAt(notifPrefs),
          };
          saveNotificationPrefs(withSchedule);
          // Register FCM token + write prefs to Firestore so Cloud Functions can reach this user
          getUserId().then(uid => { if (uid) registerFCMToken(uid, withSchedule); });
        } else {
          saveNotificationPrefs({ ...notifPrefs, reminders: false });
        }
      }).catch(() => {
        saveNotificationPrefs({ ...notifPrefs, reminders: false });
      });
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
          />
          {showSyncModal && (
            <DataSyncPreferenceModal
              isDarkMode={false}
              onClose={() => {
                localStorage.setItem('mindcheck_sync_preference_asked', 'true');
                localStorage.setItem('mindcheck_cloud_backup_enabled', 'false');
                logUserActivity('cloud_sync_disabled', { source: 'onboarding' });
                setShowSyncModal(false);
              }}
              onChooseBackend={() => {
                localStorage.setItem('mindcheck_cloud_backup_preference', 'accepted');
                enableCloudSync();
                uploadAllLocalData();
                logUserActivity('cloud_sync_enabled', { source: 'onboarding' });
                setShowSyncModal(false);
              }}
              onChooseLocal={() => {
                localStorage.setItem('mindcheck_cloud_backup_preference', 'declined');
                localStorage.setItem('mindcheck_sync_preference_asked', 'true');
                disableCloudSync();
                logUserActivity('cloud_sync_disabled', { source: 'onboarding' });
                setShowSyncModal(false);
              }}
            />
          )}
        </>
      )}
    </>
  );
}