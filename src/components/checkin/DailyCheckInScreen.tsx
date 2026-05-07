import { motion } from 'motion/react';
import { Sun, Utensils, Heart, Moon, ArrowLeft } from 'lucide-react';

interface DailyCheckInScreenProps {
  onSelectCheckIn: (type: 'morning' | 'afternoon' | 'evening' | 'night') => void;
  isDarkMode?: boolean;
  onBack?: () => void;
}

interface CheckInCard {
  id: 'morning' | 'afternoon' | 'evening' | 'night';
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  bgColor: string;
  borderColor: string;
}

export function DailyCheckInScreen({ onSelectCheckIn, isDarkMode = false, onBack }: DailyCheckInScreenProps) {
  // Get current date
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Determine greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const checkInCards: CheckInCard[] = [
    {
      id: 'morning',
      icon: <Sun className="w-6 h-6" />,
      title: 'Morning Check-in',
      subtitle: 'Sleep & wake',
      bgColor: 'rgba(247, 213, 110, 0.3)',
      borderColor: 'rgba(247, 213, 110, 0.5)',
    },
    {
      id: 'afternoon',
      icon: <Utensils className="w-6 h-6" />,
      title: 'Afternoon Check-in',
      subtitle: 'Diet, water & activity',
      bgColor: 'rgba(244, 168, 113, 0.3)',
      borderColor: 'rgba(244, 168, 113, 0.5)',
    },
    {
      id: 'evening',
      icon: <Heart className="w-6 h-6" />,
      title: 'Evening Check-in',
      subtitle: 'Emotions & social',
      bgColor: 'rgba(230, 153, 179, 0.3)',
      borderColor: 'rgba(230, 153, 179, 0.5)',
    },
    {
      id: 'night',
      icon: <Moon className="w-6 h-6" />,
      title: 'Night Reflection',
      subtitle: 'Meds & reflection',
      bgColor: 'rgba(110, 110, 110, 0.3)',
      borderColor: 'rgba(156, 144, 213, 0.5)',
    },
  ];

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: isDarkMode ? '#1a1410' : '#FCFAF8',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Back Button */}
      {onBack && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="pt-6 px-6"
        >
          <button
            onClick={onBack}
            className={`w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#423024]'}`} />
          </button>
        </motion.div>
      )}
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`text-center ${onBack ? 'pt-6' : 'pt-12'} pb-6 px-6`}
      >
        {/* Date */}
        <p 
          className="text-sm mb-2"
          style={{ color: isDarkMode ? '#ddc4af' : '#677E73' }}
        >
          {currentDate}
        </p>
        
        {/* Greeting */}
        <h1 
          className="text-2xl font-bold"
          style={{ color: isDarkMode ? '#ece5de' : '#423024' }}
        >
          {getGreeting()}
        </h1>
      </motion.div>

      {/* Status */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-center py-6 px-6"
      >
        {/* Plant icon */}
        <div className="text-5xl mb-3">🌱</div>
        
        {/* Status text */}
        <p 
          className="text-base font-medium"
          style={{ color: isDarkMode ? '#ece5de' : '#423024' }}
        >
          Ready to start
        </p>
      </motion.div>

      {/* Main Content - Check-in Cards */}
      <div className="flex-1 px-6 pb-6">
        <div className="space-y-3 max-w-md mx-auto">
          {checkInCards.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
                transition: { duration: 0.3 }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.3 }
              }}
              onClick={() => onSelectCheckIn(card.id)}
              className="w-full rounded-xl p-4 flex items-center gap-4 transition-all duration-300"
              style={{
                backgroundColor: isDarkMode ? 'rgba(42, 34, 24, 0.6)' : card.bgColor,
                border: `2px solid ${isDarkMode ? '#8d654c' : card.borderColor}`,
              }}
            >
              {/* Icon */}
              <div 
                className="flex-shrink-0"
                style={{ color: isDarkMode ? '#ffb757' : '#423024' }}
              >
                {card.icon}
              </div>
              
              {/* Text Content */}
              <div className="flex-1 text-left">
                <h3 
                  className="text-base font-normal mb-0.5"
                  style={{ color: isDarkMode ? '#ece5de' : '#423024' }}
                >
                  {card.title}
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: isDarkMode ? '#ddc4af' : '#677E73' }}
                >
                  {card.subtitle}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center pb-8 px-8"
      >
        <p 
          className="text-sm leading-relaxed max-w-xs mx-auto"
          style={{ color: isDarkMode ? '#ddc4af' : '#677E73' }}
        >
          Open any check-in anytime. You don't need to do all of them.
        </p>
      </motion.div>
    </div>
  );
}