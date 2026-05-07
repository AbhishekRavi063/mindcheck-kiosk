import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useEffect } from 'react';

interface EMASectionCompleteProps {
  sectionName: string;
  sectionIcon: string;
  isDarkMode: boolean;
  onContinue: () => void;
}

export function EMASectionComplete({ 
  sectionName, 
  sectionIcon, 
  isDarkMode, 
  onContinue 
}: EMASectionCompleteProps) {
  // Auto-continue after 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 bg-gradient-to-br from-[#ff8a65] to-[#ff6b6b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </motion.div>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">{sectionIcon}</span>
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              {sectionName}
            </h2>
          </div>
          <p className={`text-lg ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} mb-4`}>
            Complete!
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
            Great job checking in with yourself
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
