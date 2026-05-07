import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Zap, Target, TrendingUp, TrendingDown, Minus, Eye, Timer } from 'lucide-react';
import { getGameMetrics } from '../utils/dataSync';

interface CognitiveGamesTrendsProps {
  isDarkMode: boolean;
  timeRange: '7' | '30' | '90';
}

interface GameMetric {
  type: string;
  timestamp: string;
  averageReactionTime?: number;
  inhibitionScore?: number;
  hits?: number;
  totalTrials?: number;
  accuracy?: number;
  score?: number;
  level?: number;
  correctMatches?: number;
  incorrectMatches?: number;
  missedCards?: number;
  totalPairs?: number;
  correctCount?: number;
  totalNumbers?: number;
}

export function CognitiveGamesTrends({ isDarkMode, timeRange }: CognitiveGamesTrendsProps) {
  const [gameMetrics, setGameMetrics] = useState<GameMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<'all' | 'gonogo' | 'attention' | 'memory' | 'counting'>('all');

  useEffect(() => {
    const loadGameMetrics = async () => {
      setIsLoading(true);
      try {
        const metrics = await getGameMetrics();
        console.log('Loaded game metrics:', metrics); // Debug log
        console.log('Number of metrics:', metrics.length); // Debug log
        
        // Ensure all metrics have a timestamp field
        const normalizedMetrics = metrics.map(m => ({
          ...m,
          timestamp: m.timestamp || m.date || m.savedAt
        }));
        
        console.log('Normalized metrics:', normalizedMetrics); // Debug log
        setGameMetrics(normalizedMetrics);
      } catch (error) {
        console.error('Error loading game metrics:', error);
        setGameMetrics([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadGameMetrics();
  }, [timeRange]); // Reload when time range changes to ensure fresh data

  const getFilteredMetrics = () => {
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return gameMetrics.filter(metric => {
      const metricDate = new Date(metric.timestamp);
      const matchesTimeRange = metricDate >= cutoff;
      const matchesGameType = selectedGame === 'all' || metric.type === selectedGame;
      return matchesTimeRange && matchesGameType;
    });
  };

  const getAverageMetrics = () => {
    const filtered = getFilteredMetrics();
    
    if (filtered.length === 0) {
      return {
        avgReactionTime: 0,
        avgInhibitionScore: 0,
        avgAccuracy: 0,
        avgMemoryScore: 0,
        avgCountingScore: 0,
        totalGames: 0
      };
    }

    const gonogoGames = filtered.filter(m => m.type === 'gonogo');
    const attentionGames = filtered.filter(m => m.type === 'attention');
    const memoryGames = filtered.filter(m => m.type === 'memory');
    const countingGames = filtered.filter(m => m.type === 'counting');

    const avgReactionTime = gonogoGames.length > 0
      ? gonogoGames.reduce((sum, m) => sum + (m.averageReactionTime || 0), 0) / gonogoGames.length
      : 0;

    const avgInhibitionScore = gonogoGames.length > 0
      ? gonogoGames.reduce((sum, m) => sum + (m.inhibitionScore || 0), 0) / gonogoGames.length
      : 0;

    const avgAccuracy = attentionGames.length > 0
      ? attentionGames.reduce((sum, m) => sum + (m.accuracy || 0), 0) / attentionGames.length
      : 0;

    const avgMemoryScore = memoryGames.length > 0
      ? memoryGames.reduce((sum, m) => sum + (m.accuracy || 0), 0) / memoryGames.length
      : 0;

    const avgCountingScore = countingGames.length > 0
      ? countingGames.reduce((sum, m) => sum + (m.accuracy || 0), 0) / countingGames.length
      : 0;

    return {
      avgReactionTime,
      avgInhibitionScore,
      avgAccuracy,
      avgMemoryScore,
      avgCountingScore,
      totalGames: filtered.length
    };
  };

  const getChartData = () => {
    const filtered = getFilteredMetrics();
    
    // Group by date
    const groupedByDate: { [key: string]: GameMetric[] } = {};
    filtered.forEach(metric => {
      const date = new Date(metric.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(metric);
    });

    // Calculate averages for each date
    return Object.entries(groupedByDate).map(([date, metrics]) => {
      const gonogoMetrics = metrics.filter(m => m.type === 'gonogo');
      const attentionMetrics = metrics.filter(m => m.type === 'attention');
      const memoryMetrics = metrics.filter(m => m.type === 'memory');
      const countingMetrics = metrics.filter(m => m.type === 'counting');
      
      const avgReactionTime = gonogoMetrics.length > 0
        ? gonogoMetrics.reduce((sum, m) => sum + (m.averageReactionTime || 0), 0) / gonogoMetrics.length
        : null;

      const avgInhibitionScore = gonogoMetrics.length > 0
        ? gonogoMetrics.reduce((sum, m) => sum + (m.inhibitionScore || 0), 0) / gonogoMetrics.length
        : null;

      const avgAccuracy = attentionMetrics.length > 0
        ? attentionMetrics.reduce((sum, m) => sum + (m.accuracy || 0), 0) / attentionMetrics.length
        : null;

      const avgMemoryAccuracy = memoryMetrics.length > 0
        ? memoryMetrics.reduce((sum, m) => sum + (m.accuracy || 0), 0) / memoryMetrics.length
        : null;

      const avgCountingAccuracy = countingMetrics.length > 0
        ? countingMetrics.reduce((sum, m) => sum + (m.accuracy || 0), 0) / countingMetrics.length
        : null;

      // Normalize reaction time to 0-100 score (faster = higher score)
      // 200ms = 100%, 1000ms = 0%
      const reactionScore = avgReactionTime
        ? Math.round(Math.max(0, Math.min(100, ((1000 - avgReactionTime) / 800) * 100)))
        : null;

      return {
        date,
        'Reaction Score': reactionScore,
        'Inhibition Score': avgInhibitionScore ? Math.round(avgInhibitionScore) : null,
        'Attention Accuracy': avgAccuracy ? Math.round(avgAccuracy) : null,
        'Memory Accuracy': avgMemoryAccuracy ? Math.round(avgMemoryAccuracy) : null,
        'Counting Accuracy': avgCountingAccuracy ? Math.round(avgCountingAccuracy) : null
      };
    }).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const getTrend = (metricName: 'reactionTime' | 'inhibitionScore' | 'accuracy') => {
    const filtered = getFilteredMetrics();
    if (filtered.length < 3) return 'stable';

    let values: number[] = [];
    
    if (metricName === 'reactionTime') {
      values = filtered
        .filter(m => m.type === 'gonogo' && m.averageReactionTime)
        .map(m => m.averageReactionTime!);
    } else if (metricName === 'inhibitionScore') {
      values = filtered
        .filter(m => m.type === 'gonogo' && m.inhibitionScore)
        .map(m => m.inhibitionScore!);
    } else if (metricName === 'accuracy') {
      values = filtered
        .filter(m => m.type === 'attention' && m.accuracy)
        .map(m => m.accuracy!);
    }

    if (values.length < 3) return 'stable';

    const firstHalf = values.slice(0, Math.ceil(values.length / 2));
    const secondHalf = values.slice(Math.ceil(values.length / 2));

    const firstAvg = firstHalf.reduce((sum, v) => sum + v, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, v) => sum + v, 0) / secondHalf.length;

    const diff = secondAvg - firstAvg;

    if (metricName === 'reactionTime') {
      // Lower is better for reaction time
      if (diff < -20) return 'improving';
      if (diff > 20) return 'declining';
    } else {
      // Higher is better for scores
      if (diff > 5) return 'improving';
      if (diff < -5) return 'declining';
    }

    return 'stable';
  };

  const metrics = getAverageMetrics();
  const chartData = getChartData();

  if (isLoading) {
    return (
      <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6`}>
        <div className="text-center py-8">
          <Brain className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-[#ffb757]' : 'text-[#8d654c]'} animate-pulse`} />
          <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>Loading cognitive game data...</p>
        </div>
      </div>
    );
  }

  if (metrics.totalGames === 0) {
    return (
      <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} rounded-xl flex items-center justify-center`}>
            <Brain className="w-6 h-6 text-[#ffb757]" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Cognitive Games
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Performance metrics
            </p>
          </div>
        </div>

        {/* Game Type Filter - Keep visible even when no data */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          {[
            { id: 'all', label: 'All Games', icon: Brain },
            { id: 'gonogo', label: 'Go/No-Go', icon: Zap },
            { id: 'attention', label: 'Attention', icon: Eye },
            { id: 'memory', label: 'Memory', icon: Brain },
            { id: 'counting', label: 'Counting', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedGame(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedGame === id
                  ? 'bg-[#ffb757] text-white'
                  : isDarkMode
                  ? 'bg-[#1a1410] text-[#ece5de]/70'
                  : 'bg-[#ece5de] text-[#8d654c]/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>

        <div className="text-center py-8">
          <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>
            {selectedGame === 'all' 
              ? 'No cognitive game data available for the selected time period'
              : `No ${selectedGame === 'gonogo' ? 'Go/No-Go' : selectedGame.charAt(0).toUpperCase() + selectedGame.slice(1)} game data available`
            }
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`}>
            Try playing some games or selecting a different filter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${isDarkMode ? 'bg-[#ffb757]/20' : 'bg-[#ffb757]/10'} rounded-xl flex items-center justify-center`}>
            <Brain className="w-6 h-6 text-[#ffb757]" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>
              Cognitive Games
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              {metrics.totalGames} games completed
            </p>
          </div>
        </div>

        {/* Game Type Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Games', icon: Brain },
            { id: 'gonogo', label: 'Go/No-Go', icon: Zap },
            { id: 'attention', label: 'Attention', icon: Eye },
            { id: 'memory', label: 'Memory', icon: Brain },
            { id: 'counting', label: 'Counting', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedGame(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                selectedGame === id
                  ? 'bg-[#ffb757] text-white'
                  : isDarkMode
                  ? 'bg-[#1a1410] text-[#ece5de]/70'
                  : 'bg-[#ece5de] text-[#8d654c]/70'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Reaction Time */}
        {(selectedGame === 'all' || selectedGame === 'gonogo') && metrics.avgReactionTime > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'} rounded-lg flex items-center justify-center`}>
                <Timer className="w-4 h-4 text-blue-500" />
              </div>
              {getTrend('reactionTime') === 'improving' && <TrendingDown className="w-4 h-4 text-green-500" />}
              {getTrend('reactionTime') === 'declining' && <TrendingUp className="w-4 h-4 text-red-500" />}
              {getTrend('reactionTime') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
              {Math.round(Math.max(0, Math.min(100, ((1000 - metrics.avgReactionTime) / 800) * 100)))}%
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Reaction Speed Score
            </div>
          </motion.div>
        )}

        {/* Inhibition Score */}
        {(selectedGame === 'all' || selectedGame === 'gonogo') && metrics.avgInhibitionScore > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-50'} rounded-lg flex items-center justify-center`}>
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              {getTrend('inhibitionScore') === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {getTrend('inhibitionScore') === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {getTrend('inhibitionScore') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
              {Math.round(metrics.avgInhibitionScore)}%
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Inhibition Hit Rate
            </div>
          </motion.div>
        )}

        {/* Attention Accuracy */}
        {(selectedGame === 'all' || selectedGame === 'attention') && metrics.avgAccuracy > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'} rounded-lg flex items-center justify-center`}>
                <Eye className="w-4 h-4 text-green-500" />
              </div>
              {getTrend('accuracy') === 'improving' && <TrendingUp className="w-4 h-4 text-green-500" />}
              {getTrend('accuracy') === 'declining' && <TrendingDown className="w-4 h-4 text-red-500" />}
              {getTrend('accuracy') === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
              {Math.round(metrics.avgAccuracy)}%
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Attention Accuracy
            </div>
          </motion.div>
        )}

        {/* Memory Score */}
        {(selectedGame === 'all' || selectedGame === 'memory') && metrics.avgMemoryScore > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50'} rounded-lg flex items-center justify-center`}>
                <Brain className="w-4 h-4 text-orange-500" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
              {Math.round(metrics.avgMemoryScore)}%
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Memory Accuracy
            </div>
          </motion.div>
        )}

        {/* Counting Score */}
        {(selectedGame === 'all' || selectedGame === 'counting') && metrics.avgCountingScore > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-50'} rounded-lg flex items-center justify-center`}>
                <Target className="w-4 h-4 text-yellow-600" />
              </div>
            </div>
            <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
              {Math.round(metrics.avgCountingScore)}%
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>
              Counting Accuracy
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts */}
      {chartData.length > 1 && (
        <div className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-6`}>
          <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-4`}>
            Performance Over Time
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffb757/20' : '#ddc4af/40'} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: isDarkMode ? '#ece5de' : '#8d654c', fontSize: 11 }}
                stroke={isDarkMode ? '#ffb757' : '#ddc4af'}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                tick={{ fill: isDarkMode ? '#ece5de' : '#8d654c', fontSize: 11 }}
                stroke={isDarkMode ? '#ffb757' : '#ddc4af'}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDarkMode ? '#2a2218' : '#ffffff',
                  border: `1px solid ${isDarkMode ? '#ffb757/40' : '#ddc4af/60'}`,
                  borderRadius: '8px',
                  color: isDarkMode ? '#ece5de' : '#8d654c'
                }}
              />
              {(selectedGame === 'all' || selectedGame === 'gonogo') && (
                <>
                  <Line 
                    type="monotone" 
                    dataKey="Reaction Score" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Inhibition Score" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={{ fill: '#a855f7', r: 4 }}
                    connectNulls
                  />
                </>
              )}
              {(selectedGame === 'all' || selectedGame === 'attention') && (
                <Line 
                  type="monotone" 
                  dataKey="Attention Accuracy" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  connectNulls
                />
              )}
              {(selectedGame === 'all' || selectedGame === 'memory') && (
                <Line 
                  type="monotone" 
                  dataKey="Memory Accuracy" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  connectNulls
                />
              )}
              {(selectedGame === 'all' || selectedGame === 'counting') && (
                <Line 
                  type="monotone" 
                  dataKey="Counting Accuracy" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={{ fill: '#eab308', r: 4 }}
                  connectNulls
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}