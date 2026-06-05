import { useState, useEffect } from 'react';
import { Bell, ChevronRight, Check, AlertTriangle } from 'lucide-react';
import {
  NotificationPrefs,
  loadNotificationPrefs,
  saveNotificationPrefs,
  isNotificationSupported,
  getPermissionStatus,
  requestPermission,
  computeNextNotificationAt,
  registerFCMToken,
  unregisterFCMToken,
  syncPrefsToFirestore,
  savePrefsToFirestore,
} from '../utils/notificationManager';
import { getUserId } from '../utils/dataSync';

interface Props {
  isDarkMode: boolean;
}

const frequencies: { value: NotificationPrefs['frequency']; label: string; desc: string }[] = [
  { value: 'weekly',       label: 'Weekly',       desc: 'Once a week'    },
  { value: 'twice-weekly', label: 'Twice a week', desc: 'Every 3–4 days' },
  { value: 'monthly',      label: 'Monthly',      desc: 'Once a month'   },
];

const times: { value: NotificationPrefs['timePreference']; label: string; icon: string; sublabel: string }[] = [
  { value: 'morning',   label: 'Morning',   icon: '🌅', sublabel: '9 AM'  },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️', sublabel: '2 PM'  },
  { value: 'night',     label: 'Evening',   icon: '🌙', sublabel: '8 PM'  },
];

const FREQ_LABEL: Record<NotificationPrefs['frequency'], string> = {
  'weekly':       'Weekly',
  'twice-weekly': 'Twice a week',
  'monthly':      'Monthly',
};

const TIME_LABEL: Record<NotificationPrefs['timePreference'], string> = {
  morning:   'Morning · 9 AM',
  afternoon: 'Afternoon · 2 PM',
  night:     'Evening · 8 PM',
};

export function NotificationPreferences({ isDarkMode }: Props) {
  const [prefs, setPrefs]           = useState<NotificationPrefs>(loadNotificationPrefs);
  const [permission, setPermission] = useState<NotificationPermission>(() => getPermissionStatus());
  const [expanded, setExpanded]     = useState<'frequency' | 'time' | null>(null);
  const [userId, setUserId]         = useState('');
  const supported = isNotificationSupported();

  useEffect(() => { setPermission(getPermissionStatus()); }, []);
  useEffect(() => { getUserId().then(setUserId); }, []);

  // Save to notificationPrefs + keep mindcheck_preferences in sync + push prefs to Firestore.
  // Uses syncPrefsToFirestore (updateDoc) rather than registerFCMToken (setDoc) so that
  // changing frequency/time does NOT reset lastNotifiedAt and trigger an immediate notification.
  function persist(next: NotificationPrefs) {
    setPrefs(next);
    saveNotificationPrefs(next);
    const legacy = JSON.parse(localStorage.getItem('mindcheck_preferences') || '{}');
    localStorage.setItem('mindcheck_preferences', JSON.stringify({
      ...legacy,
      frequency:      next.frequency,
      timePreference: next.timePreference,
      reminders:      next.reminders,
    }));
    if (next.reminders && permission === 'granted') {
      if (userId) syncPrefsToFirestore(userId, next);
    }
  }

  function selectFrequency(frequency: NotificationPrefs['frequency']) {
    const next: NotificationPrefs = {
      ...prefs,
      frequency,
      nextNotificationAt: prefs.reminders && permission === 'granted'
        ? computeNextNotificationAt({ ...prefs, frequency })
        : prefs.nextNotificationAt,
    };
    persist(next);
    setExpanded(null);
  }

  function selectTime(timePreference: NotificationPrefs['timePreference']) {
    const next: NotificationPrefs = {
      ...prefs,
      timePreference,
      nextNotificationAt: prefs.reminders && permission === 'granted'
        ? computeNextNotificationAt({ ...prefs, timePreference })
        : prefs.nextNotificationAt,
    };
    persist(next);
    setExpanded(null);
  }

  async function handleRemindersToggle() {
    if (prefs.reminders) {
      // Turning OFF — get uid first (no gesture needed for this path)
      const uid = userId || await getUserId();
      const next = { ...prefs, reminders: false };
      persist(next);
      if (uid) unregisterFCMToken(uid);
      if (uid) savePrefsToFirestore(uid, next);
      return;
    }

    // Turning ON — requestPermission() MUST be first, no await before it
    // otherwise mobile browsers break the gesture chain and auto-deny
    const result = await requestPermission();
    setPermission(result);

    // Get uid AFTER permission request — safe, gesture chain already resolved
    const uid = userId || await getUserId();

    if (result === 'granted') {
      const next: NotificationPrefs = {
        ...prefs,
        reminders: true,
        nextNotificationAt: computeNextNotificationAt(prefs),
      };
      persist(next);
      if (uid) registerFCMToken(uid, next);
    } else {
      if (uid) savePrefsToFirestore(uid, { ...prefs, reminders: false });
    }
  }

  const remindersOn = prefs.reminders && permission === 'granted';

  const rowText  = `font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`;
  const subText  = `text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`;
  const divider  = isDarkMode ? 'divide-[#ffb757]/10' : 'divide-[#ddc4af]/20';
  const card     = isDarkMode ? 'bg-[#2a2218]'         : 'bg-white/80';
  const selBtn   = (active: boolean) => active
    ? 'bg-[#ffb757] text-white shadow-md shadow-[#ffb757]/20'
    : isDarkMode
      ? 'bg-[#1a1410] text-[#ece5de]'
      : 'bg-[#ece5de] text-[#8d654c]';

  return (
    <div className="space-y-3">
      <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} uppercase tracking-wide px-1`}>
        Check-in &amp; Reminders
      </h3>

      <div className={`${card} ${divider} rounded-2xl divide-y shadow-sm`}>

        {/* Frequency row */}
        <div className="p-5">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setExpanded(expanded === 'frequency' ? null : 'frequency')}
          >
            <div>
              <div className={`${rowText} mb-1`}>Frequency</div>
              <div className={subText}>{FREQ_LABEL[prefs.frequency]}</div>
            </div>
            <ChevronRight className={`w-5 h-5 transition-transform ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'} ${expanded === 'frequency' ? 'rotate-90' : ''}`} />
          </button>

          {expanded === 'frequency' && (
            <div className="mt-4 space-y-2">
              {frequencies.map(f => (
                <button
                  key={f.value}
                  onClick={() => selectFrequency(f.value)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between transition-all active:scale-[0.98] ${selBtn(prefs.frequency === f.value)}`}
                >
                  <div className="text-left">
                    <div className="font-semibold">{f.label}</div>
                    <div className={`text-sm ${prefs.frequency === f.value ? 'text-white/80' : isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      {f.desc}
                    </div>
                  </div>
                  {prefs.frequency === f.value && <Check className="w-5 h-5 flex-shrink-0" strokeWidth={3} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Preferred time row */}
        <div className="p-5">
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setExpanded(expanded === 'time' ? null : 'time')}
          >
            <div>
              <div className={`${rowText} mb-1`}>Preferred time</div>
              <div className={subText}>{TIME_LABEL[prefs.timePreference]}</div>
            </div>
            <ChevronRight className={`w-5 h-5 transition-transform ${isDarkMode ? 'text-[#ece5de]/30' : 'text-[#8d654c]/30'} ${expanded === 'time' ? 'rotate-90' : ''}`} />
          </button>

          {expanded === 'time' && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {times.map(t => (
                <button
                  key={t.value}
                  onClick={() => selectTime(t.value)}
                  className={`p-4 rounded-xl flex flex-col items-center gap-1.5 transition-all active:scale-[0.98] ${selBtn(prefs.timePreference === t.value)}`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className={`text-xs ${prefs.timePreference === t.value ? 'text-white/70' : isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>{t.sublabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reminders toggle */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} rounded-xl flex items-center justify-center`}>
                <Bell className="w-5 h-5 text-[#ffb757]" />
              </div>
              <div>
                <div className={rowText}>Reminders</div>
                <div className={subText}>
                  {!supported
                    ? 'Not available in this browser'
                    : permission === 'denied'
                      ? 'Notifications blocked'
                      : 'Gentle nudges to check in'}
                </div>
              </div>
            </div>
            <button
              onClick={handleRemindersToggle}
              disabled={!supported}
              className={`w-14 h-8 rounded-full p-1 transition-all flex-shrink-0 disabled:opacity-40 ${remindersOn ? 'bg-[#ffb757]' : isDarkMode ? 'bg-[#ece5de]/20' : 'bg-[#8d654c]/20'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${remindersOn ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Denied help text — inline, no extra card */}
          {supported && permission === 'denied' && (
            <div className={`mt-3 flex items-start gap-2 text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} leading-relaxed`}>
              <AlertTriangle className="w-3.5 h-3.5 text-[#ffb757] flex-shrink-0 mt-0.5" />
              <span>
                To enable: tap the lock icon in your browser → Notifications → Allow.
                On iPhone: Settings → MindCheck → Notifications → Allow.
              </span>
            </div>
          )}

          {!supported && (
            <div className={`mt-3 flex items-start gap-2 text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'} leading-relaxed`}>
              <AlertTriangle className="w-3.5 h-3.5 text-[#ffb757] flex-shrink-0 mt-0.5" />
              <span>
                On iPhone, add MindCheck to your Home Screen via Safari to enable notifications.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
