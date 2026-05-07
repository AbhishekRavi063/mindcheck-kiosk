import { Home, ClipboardList, TrendingUp, User } from 'lucide-react';
import { TabType } from '../App';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  isDarkMode: boolean;
}

export function BottomNav({ currentTab, onTabChange, isDarkMode }: BottomNavProps) {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'checkin' as TabType, label: 'Check-in', icon: ClipboardList },
    { id: 'trends' as TabType, label: 'Trends', icon: TrendingUp },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white'} border-t ${isDarkMode ? 'border-[#ffb757]/10' : 'border-[#ddc4af]/20'} max-w-[390px] mx-auto`}>
      <div className="flex items-center justify-around px-6 py-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 py-2 px-4 transition-all active:scale-95"
            >
              <Icon 
                className={`w-6 h-6 transition-colors ${
                  isActive 
                    ? 'text-[#ffb757]' 
                    : isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs font-medium transition-colors ${
                isActive 
                  ? 'text-[#ffb757]' 
                  : isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}