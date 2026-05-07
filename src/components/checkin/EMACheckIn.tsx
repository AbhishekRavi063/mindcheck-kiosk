import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';

interface EMACheckInProps {
  onComplete: (data: { mood: number; stress: number; energy: number }) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export function EMACheckIn({ onComplete, onBack, isDarkMode }: EMACheckInProps) {
  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    const data = { mood, stress, energy };
    
    // Save to localStorage
    const emaHistory = JSON.parse(localStorage.getItem('mindcheck_ema_history') || '[]');
    emaHistory.push({
      date: new Date().toISOString(),
      ...data
    });
    localStorage.setItem('mindcheck_ema_history', JSON.stringify(emaHistory));

    setTimeout(() => {
      onComplete(data);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-20 h-20 bg-[#ffb757]/20 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-10 h-10 text-[#ffb757]" strokeWidth={3} />
          </div>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
            Saved
          </h2>
          <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>
            Thank you for checking in.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`}>
      {/* Header */}
      <div className="p-6">
        <button
          onClick={onBack}
          className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
        >
          <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Title */}
          <div>
            <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-2`}>
              Quick mood check
            </h1>
            <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>
              How are you feeling right now?
            </p>
          </div>

          {/* Mood Slider */}
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <label className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Mood
              </label>
              <span className="text-2xl font-bold text-[#ffb757]">{mood}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={mood}
              onChange={(e) => setMood(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8d654c 0%, #ddc4af ${mood * 10}%, ${isDarkMode ? '#2a2218' : '#ece5de'} ${mood * 10}%, ${isDarkMode ? '#2a2218' : '#ece5de'} 100%)`
              }}
            />
            <div className="flex justify-between text-xs">
              <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>Very low</span>
              <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>Very good</span>
            </div>
          </div>

          {/* Stress Slider */}
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <label className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Stress
              </label>
              <span className="text-2xl font-bold text-[#ffb757]">{stress}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #ffb757 0%, #ddc4af ${stress * 10}%, ${isDarkMode ? '#2a2218' : '#ece5de'} ${stress * 10}%, ${isDarkMode ? '#2a2218' : '#ece5de'} 100%)`
              }}
            />
            <div className="flex justify-between text-xs">
              <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>None</span>
              <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>Very high</span>
            </div>
          </div>

          {/* Energy Slider */}
          <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <label className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                Energy
              </label>
              <span className="text-2xl font-bold text-[#ffb757]">{energy}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full h-3 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8d654c 0%, #ffb757 ${energy * 10}%, ${isDarkMode ? '#2a2218' : '#ece5de'} ${energy * 10}%, ${isDarkMode ? '#2a2218' : '#ece5de'} 100%)`
              }}
            />
            <div className="flex justify-between text-xs">
              <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>Exhausted</span>
              <span className={isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}>Energized</span>
            </div>
          </div>
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Submit Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-[#ffb757] text-white font-semibold shadow-lg shadow-[#ffb757]/20 active:scale-[0.98] transition-all mt-6"
        >
          Save check-in
        </motion.button>

        {/* Privacy note */}
        <p className={`text-xs text-center ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'} mt-4`}>
          Only you can see this
        </p>
      </div>
    </div>
  );
}
