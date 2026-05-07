import { motion } from 'motion/react';
import { ArrowLeft, Check } from 'lucide-react';
import { EMASection } from '../../data/emaQuestions';
import { useState, useEffect } from 'react';
import { PlantGrowth } from './PlantGrowth';

interface EMASectionSelectorProps {
  sections: EMASection[];
  onSelectSection: (sectionId: string) => void;
  onBack: () => void;
  isDarkMode: boolean;
}

export function EMASectionSelector({ 
  sections, 
  onSelectSection, 
  onBack, 
  isDarkMode 
}: EMASectionSelectorProps) {
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const loadCompletedSections = () => {
    // Get today's completed My Day Log sections
    const today = new Date().toISOString().split('T')[0];
    const dailyCheckInData = JSON.parse(localStorage.getItem('mindcheck_ema_data') || '{}');
    if (dailyCheckInData[today]) {
      const completed = dailyCheckInData[today].map((entry: any) => entry.section);
      setCompletedSections(completed);
    } else {
      setCompletedSections([]);
    }
  };

  useEffect(() => {
    loadCompletedSections();
    
    // Add event listener to refresh when returning to this page
    const handleStorageChange = () => {
      loadCompletedSections();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus/visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadCompletedSections();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Set up an interval to check for updates (as fallback)
    const interval = setInterval(loadCompletedSections, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex flex-col`}>
      {/* Header */}
      <div className="p-5">
        <div className="pt-8">
          <div className="max-w-[390px] mx-auto">
            <button
              onClick={onBack}
              className={`mb-4 w-10 h-10 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-full flex items-center justify-center active:scale-95 transition-transform`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`} />
            </button>

            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              My Day Log
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Choose a check-in section to complete
            </p>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="flex-1 px-6 py-4">
        <div className="max-w-[390px] mx-auto">
          {/* Plant Growth Visualization */}
          <PlantGrowth 
            completedCount={completedSections.length} 
            totalSections={sections.length}
            isDarkMode={isDarkMode}
          />
          
          {/* Sections List */}
          <div className="space-y-3 mt-4">
            {sections.map((section, index) => (
              <motion.button
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`w-full p-5 rounded-2xl ${
                  isDarkMode 
                    ? 'bg-[#2a2218] hover:bg-[#3a3228]' 
                    : 'bg-white/80 hover:bg-white'
                } transition-all shadow-sm flex items-center gap-4`}
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#ffb757] to-[#ff8a65] rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  {section.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-semibold text-base mb-1 ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                    {section.name}
                  </h3>
                  <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                    {section.theme}
                  </p>
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#ff8a65]'}`}>
                    {section.questions.length} question{section.questions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                {completedSections.includes(section.id) && (
                  <Check className="w-6 h-6 text-[#ff8a65]" />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}