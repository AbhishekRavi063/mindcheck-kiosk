import { motion } from 'motion/react';
import { Calendar, Heart } from 'lucide-react';

interface CheckInRestrictionModalProps {
  isDarkMode: boolean;
  nextAvailableDate: Date;
  onClose: () => void;
}

export function CheckInRestrictionModal({ isDarkMode, nextAvailableDate, onClose }: CheckInRestrictionModalProps) {
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getDaysUntil = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntil = getDaysUntil(nextAvailableDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`relative max-w-sm w-full ${
          isDarkMode ? 'bg-[#2a2218]' : 'bg-white'
        } rounded-3xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto`}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className={`w-20 h-20 rounded-full ${
            isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'
          } flex items-center justify-center`}>
            <Calendar className="w-10 h-10 text-[#ffb757]" />
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-2xl font-semibold text-center mb-3 ${
          isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'
        }`}>
          You're all set for now
        </h2>

        {/* Message */}
        <p className={`text-center mb-6 leading-relaxed ${
          isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'
        }`}>
          You recently completed your wellness check-in. To give you time to notice meaningful changes, 
          we recommend waiting before your next assessment.
        </p>

        {/* Next Available Date Card */}
        <div className={`${
          isDarkMode ? 'bg-[#1a1410] border-[#ffb757]/30' : 'bg-[#ece5de] border-[#ddc4af]'
        } border-2 rounded-2xl p-4 mb-6`}>
          <p className={`text-sm font-medium mb-2 ${
            isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'
          }`}>
            Next check-in available:
          </p>
          <p className={`text-lg font-semibold ${
            isDarkMode ? 'text-[#ffb757]' : 'text-[#8d654c]'
          }`}>
            {formatDate(nextAvailableDate)}
          </p>
          <p className={`text-sm mt-1 ${
            isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'
          }`}>
            {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
          </p>
        </div>

        {/* Helpful message */}
        <div className="flex items-start gap-3 mb-6">
          <Heart className="w-5 h-5 text-[#ffb757] flex-shrink-0 mt-0.5" />
          <p className={`text-sm ${
            isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'
          }`}>
            In the meantime, you can use My Day Log to track your wellbeing moments throughout each day.
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full py-4 rounded-2xl font-semibold transition-all active:scale-95 ${
            isDarkMode
              ? 'bg-[#ffb757] text-[#1a1410] hover:bg-[#ffb757]/90'
              : 'bg-[#ffb757] text-white hover:bg-[#ff9d3d]'
          }`}
        >
          Got it
        </button>
      </motion.div>
    </div>
  );
}