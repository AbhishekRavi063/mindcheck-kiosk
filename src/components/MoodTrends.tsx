import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { Smile, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { getJournalEntries } from '../utils/dataSync';
import { subscribeToSecureVault } from '../utils/secureVault';

interface MoodTrendsProps {
  isDarkMode: boolean;
  timeRange: string;
}

export function MoodTrends({ isDarkMode, timeRange }: MoodTrendsProps) {
  const [entries, setEntries] = useState<any[]>([]);

  // Get custom emotions
  const getCustomEmotions = () => {
    const customEmotions = localStorage.getItem('mindcheck_custom_emotions');
    return customEmotions ? JSON.parse(customEmotions) : [];
  };

  // Default emotions
  const defaultEmotions = [
    { emoji: '😊', label: 'Happy' },
    { emoji: '😢', label: 'Sad' },
    { emoji: '😰', label: 'Anxious' },
    { emoji: '😡', label: 'Angry' },
    { emoji: '😌', label: 'Calm' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '🤔', label: 'Thoughtful' },
    { emoji: '💪', label: 'Strong' },
    { emoji: '😔', label: 'Down' },
    { emoji: '✨', label: 'Hopeful' },
  ];

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case '3months':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return startDate;
  };

  // Process mood data
  const getMoodData = () => {
    const customEmotions = getCustomEmotions();
    const allEmotions = [...defaultEmotions, ...customEmotions];
    const startDate = getDateRange();
    
    // Filter entries by date range
    const filteredEntries = entries.filter((entry: any) => {
      const entryDate = new Date(entry.timestamp);
      return entryDate >= startDate;
    });

    // Count emotion frequencies and calculate average intensities
    const moodStats: { [emotion: string]: { count: number; totalIntensity: number; emoji: string } } = {};
    
    filteredEntries.forEach((entry: any) => {
      if (entry.emotions && entry.emotions.length > 0) {
        entry.emotions.forEach((emotion: string) => {
          if (!moodStats[emotion]) {
            const emotionData = allEmotions.find((e: any) => e.label === emotion);
            moodStats[emotion] = {
              count: 0,
              totalIntensity: 0,
              emoji: emotionData?.emoji || '😊'
            };
          }
          moodStats[emotion].count++;
          
          // Add intensity if available
          if (entry.moodIntensities && entry.moodIntensities[emotion]) {
            moodStats[emotion].totalIntensity += entry.moodIntensities[emotion];
          }
        });
      }
    });

    // Convert to array and sort by frequency
    const moodArray = Object.entries(moodStats)
      .map(([emotion, stats]) => ({
        emotion,
        count: stats.count,
        avgIntensity: stats.totalIntensity > 0 ? (stats.totalIntensity / stats.count).toFixed(1) : null,
        emoji: stats.emoji
      }))
      .sort((a, b) => b.count - a.count);

    return moodArray;
  };

  // Get chart data
  const getChartData = () => {
    const moodData = getMoodData();
    return moodData.slice(0, 5).map(mood => ({
      name: `${mood.emoji} ${mood.emotion}`,
      count: mood.count,
      avgIntensity: mood.avgIntensity ? parseFloat(mood.avgIntensity) : 0
    }));
  };

  useEffect(() => {
    const loadEntries = async () => {
      setEntries(await getJournalEntries());
    };

    loadEntries();
    return subscribeToSecureVault(() => {
      loadEntries();
    });
  }, []);

  const moodData = getMoodData();
  const chartData = getChartData();
  const hasData = moodData.length > 0;

  const timeRangeText = timeRange === 'week' ? 'week' : timeRange === 'month' ? 'month' : '3 months';

  // Always render the component, show empty state when no data
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={`rounded-3xl p-6 ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white'} shadow-sm`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ffb757] to-[#ffb757]/80 rounded-xl flex items-center justify-center">
            <Smile className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Mood Trends
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
              From journal entries
            </p>
          </div>
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-8 space-y-3">
          <div className="text-4xl">📝</div>
          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
            No mood data yet
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>
            Add emotions to your journal entries to see mood trends
          </p>
        </div>
      ) : (
        <>
          {/* Top Moods - Horizontal Circular Icons */}
          <div className="mb-6">
            <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
              In the past {timeRangeText}:
            </p>
            <div className="flex flex-wrap gap-3">
              {moodData.slice(0, 5).map((mood, index) => (
                <motion.div
                  key={mood.emotion}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 * index, type: 'spring', stiffness: 200 }}
                  className="flex items-center gap-2"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]/50'
                  }`}>
                    {mood.emoji || '😊'}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                      {mood.emotion}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>
                      {mood.count}x {mood.avgIntensity ? `• ${mood.avgIntensity}/10` : ''}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="space-y-3">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
                Mood frequency:
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#8d654c20' : '#ddc4af'} />
                    <XAxis 
                      dataKey="name" 
                      stroke={isDarkMode ? '#ece5de50' : '#8d654c50'}
                      tick={{ fill: isDarkMode ? '#ece5de80' : '#8d654c80', fontSize: 12 }}
                      angle={-25}
                      textAnchor="end"
                      height={70}
                      tickFormatter={(value: string) => {
                        // Extract just the emotion name (remove emoji)
                        return value.split(' ').slice(1).join(' ');
                      }}
                    />
                    <YAxis 
                      stroke={isDarkMode ? '#ece5de50' : '#8d654c50'}
                      tick={{ fill: isDarkMode ? '#ece5de80' : '#8d654c80', fontSize: 12 }}
                    />
                    <Bar dataKey="count" fill="#ffb757" radius={[8, 8, 0, 0]} barSize={60} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Insight */}
          {moodData.length > 0 && (
            <div className={`mt-6 p-4 rounded-xl ${isDarkMode ? 'bg-[#ffb757]/10' : 'bg-[#ffb757]/10'}`}>
              <div className="flex items-start gap-3">
                <TrendingUp className={`w-5 h-5 mt-0.5 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#8d654c]'}`} />
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
                    Your most common emotion this {timeRangeText} was {moodData[0].emoji} <strong>{moodData[0].emotion}</strong>
                  </p>
                  {moodData[0].avgIntensity && (
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
                      Average intensity: {moodData[0].avgIntensity}/10
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
