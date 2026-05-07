import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, Bell, Check, ChevronLeft, AlertTriangle } from 'lucide-react';
import { isNotificationSupported, getPermissionStatus } from '../../utils/notificationManager';

interface PreferencesScreenProps {
  onComplete: (preferences: {
    frequency: string;
    timePreference: string;
    reminders: boolean;
  }) => void;
  onBack: () => void;
  initialPreferences: {
    frequency: string;
    timePreference: string;
    reminders: boolean;
  };
}

export function PreferencesScreen({ onComplete, onBack, initialPreferences }: PreferencesScreenProps) {
  const [frequency, setFrequency] = useState(initialPreferences.frequency);
  const [timePreference, setTimePreference] = useState(initialPreferences.timePreference);
  const [reminders, setReminders] = useState(initialPreferences.reminders);

  const supported = isNotificationSupported();
  const [permission, setPermission] = useState<NotificationPermission>(() => getPermissionStatus());
  useEffect(() => { setPermission(getPermissionStatus()); }, []);

  const handleContinue = () => {
    onComplete({ frequency, timePreference, reminders });
  };

  const frequencies = [
    { value: 'weekly', label: 'Weekly', desc: 'Once a week' },
    { value: 'twice-weekly', label: 'Twice a week', desc: 'Every 3-4 days' },
    { value: 'monthly', label: 'Monthly', desc: 'Once a month' }
  ];

  const times = [
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'night', label: 'Evening', icon: '🌙' }
  ];

  return (
    <div className="min-h-screen bg-[#ece5de] p-6 overflow-y-auto relative">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 p-2 bg-white/60 rounded-full text-[#8d654c] hover:bg-white/80 transition-colors active:scale-95 z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <div className="max-w-[390px] mx-auto pt-12 pb-20 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
            <Calendar className="w-8 h-8 text-[#ffb757]" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-semibold text-[#8d654c]">
            Set Your Rhythm
          </h1>
          <p className="text-[#8d654c]/70">
            How often would you like to check in?
          </p>
        </motion.div>

        {/* Frequency Selection */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="text-sm font-semibold text-[#8d654c] flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Check-in Frequency
          </label>
          <div className="space-y-2">
            {frequencies.map((freq) => (
              <button
                key={freq.value}
                onClick={() => setFrequency(freq.value)}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                  frequency === freq.value
                    ? 'bg-[#ffb757] text-white shadow-lg shadow-[#ffb757]/20'
                    : 'bg-white/60 text-[#8d654c] hover:bg-white/80'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold">{freq.label}</div>
                  <div className={`text-sm ${frequency === freq.value ? 'text-white/80' : 'text-[#8d654c]/60'}`}>
                    {freq.desc}
                  </div>
                </div>
                {frequency === freq.value && (
                  <Check className="w-5 h-5" strokeWidth={3} />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Time Preference */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <label className="text-sm font-semibold text-[#8d654c] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Preferred Time
          </label>
          <div className="grid grid-cols-3 gap-2">
            {times.map((time) => (
              <button
                key={time.value}
                onClick={() => setTimePreference(time.value)}
                className={`p-4 rounded-xl flex flex-col items-center gap-2 transition-all ${
                  timePreference === time.value
                    ? 'bg-[#ffb757] text-white shadow-lg shadow-[#ffb757]/20'
                    : 'bg-white/60 text-[#8d654c] hover:bg-white/80'
                }`}
              >
                <span className="text-2xl">{time.icon}</span>
                <span className="text-sm font-medium">{time.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Gentle Reminders Toggle */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/60 rounded-2xl p-5 space-y-3"
        >
          <button
            onClick={() => supported && permission !== 'denied' && setReminders(!reminders)}
            disabled={!supported || permission === 'denied'}
            className="w-full flex items-center justify-between disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ffb757]/10 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#ffb757]" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-[#8d654c]">Gentle reminders</div>
                <div className="text-sm text-[#8d654c]/60">
                  {permission === 'denied'
                    ? 'Notifications blocked in browser'
                    : 'Supportive nudges, no pressure'}
                </div>
              </div>
            </div>
            <div className={`w-14 h-8 rounded-full p-1 transition-all ${
              reminders && permission !== 'denied' ? 'bg-[#ffb757]' : 'bg-[#8d654c]/20'
            }`}>
              <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                reminders && permission !== 'denied' ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </div>
          </button>

          {supported && permission === 'denied' && (
            <div className="flex items-start gap-2 text-xs text-[#8d654c]/60 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ffb757] flex-shrink-0 mt-0.5" />
              <span>
                To enable reminders: tap the lock icon in your browser address bar → Notifications → Allow.
                On iPhone: Settings → MindCheck → Notifications → Allow.
              </span>
            </div>
          )}

          {!supported && (
            <div className="flex items-start gap-2 text-xs text-[#8d654c]/60 leading-relaxed">
              <AlertTriangle className="w-3.5 h-3.5 text-[#ffb757] flex-shrink-0 mt-0.5" />
              <span>Add MindCheck to your Home Screen via Safari to enable notifications.</span>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-[#ffb757] text-white rounded-2xl font-semibold text-lg shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-transform"
          >
            Continue
          </button>
        </motion.div>
      </div>
    </div>
  );
}