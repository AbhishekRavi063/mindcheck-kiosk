import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Calendar, Filter, Lightbulb, Brain, Heart, Info } from 'lucide-react';
import { BackButton } from './ui/BackButton';
import { getQuestionnaireResponses, getGameMetrics } from '../utils/dataSync';
import { CognitiveGamesTrends } from './CognitiveGamesTrends';
import { MoodTrends } from './MoodTrends';

interface TrendsScreenProps {
  isDarkMode: boolean;
  onBack?: () => void;
}

export function TrendsScreen({ isDarkMode, onBack }: TrendsScreenProps) {
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Fetch real questionnaire responses from Supabase
        const responses = await getQuestionnaireResponses();
        
        // Fetch game metrics
        const gameMetrics = await getGameMetrics();
        
        // Build a map of all dates that have any data
        const allDates = new Map<string, {
          timestamp: number | string;
          phq9Score?: number;
          pssScore?: number;
          rsesScore?: number;
          gad7Score?: number;
          gameScore?: number;
          type: string;
        }>();

        // First pass — add all questionnaire dates
        responses.forEach(response => {
          const dateKey = new Date(
            response.timestamp || response.date
          ).toDateString();
          allDates.set(dateKey, {
            timestamp: response.timestamp || response.date,
            phq9Score: response.phq9Score ?? response.score ?? undefined,
            pssScore: response.pssScore ?? undefined,
            rsesScore: response.rsesScore ?? undefined,
            gad7Score: response.gad7Score ?? undefined,
            gameScore: undefined,
            type: response.type || 'full',
          });
        });

        // Second pass — add game-only dates and compute gameScore
        // Group games by date
        const gamesByDate = new Map<string, any[]>();
        gameMetrics.forEach(game => {
          const dateKey = new Date(game.timestamp).toDateString();
          if (!gamesByDate.has(dateKey)) gamesByDate.set(dateKey, []);
          gamesByDate.get(dateKey)!.push(game);
        });

        gamesByDate.forEach((games, dateKey) => {
          const scores = games.map(game => {
            if (game.type === 'gonogo') return game.inhibitionScore || 0;
            if (game.type === 'attention') return game.accuracy || 0;
            if (game.type === 'memory') return game.accuracy || 0;
            if (game.type === 'counting') return game.accuracy || 0;
            return game.accuracy || 0;
          });
          const avgScore = Math.round(
            scores.reduce((a, b) => a + b, 0) / scores.length
          );

          if (allDates.has(dateKey)) {
            allDates.get(dateKey)!.gameScore = avgScore;
          } else {
            const game = games[0];
            allDates.set(dateKey, {
              timestamp: game.timestamp,
              gameScore: avgScore,
              type: 'individual',
            });
          }
        });

        // Convert map to sorted array
        const transformedData = Array.from(allDates.values())
          .sort((a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        setHistory(transformedData);
      } catch (error) {
        console.error('Error loading user data:', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  const getFilteredData = () => {
    const days = parseInt(timeRange);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return history
      .filter(entry => new Date(entry.timestamp).getTime() >= cutoff.getTime())
      .map(entry => ({
        date: new Date(entry.timestamp).toLocaleDateString(
          'en-US', { month: 'short', day: 'numeric' }
        ),
        'Mood': entry.phq9Score ?? null,
        'Anxiety': entry.gad7Score ?? null,
        'Stress': entry.pssScore ?? null,
        'Self-Esteem': entry.rsesScore ?? null,
      }));
  };

  const chartData = getFilteredData();

  const getLatestScores = () => {
    if (history.length === 0) return null;
    
    // Find most recent score for EACH metric independently
    const latestPhq9 = [...history].reverse().find(e => e.phq9Score != null)?.phq9Score;
    const latestGad7 = [...history].reverse().find(e => e.gad7Score != null)?.gad7Score;
    const latestPss = [...history].reverse().find(e => e.pssScore != null)?.pssScore;
    const latestRses = [...history].reverse().find(e => e.rsesScore != null)?.rsesScore;

    if (latestPhq9 == null && latestGad7 == null && latestPss == null && latestRses == null) return null;

    return {
      phq9: latestPhq9 ?? null,
      gad7: latestGad7 ?? null,
      pss: latestPss ?? null,
      rses: latestRses ?? null,
    };
  };

  const getAverageScores = () => {
    if (history.length === 0) return null;
    
    const filtered = history.filter(entry => {
      const days = parseInt(timeRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      return new Date(entry.date) >= cutoff;
    });
    
    const avgPhq9 = filtered.reduce((sum, e) => sum + (e.phq9Score || 0), 0) / filtered.length;
    const avgGad7 = filtered.reduce((sum, e) => sum + (e.gad7Score || 0), 0) / filtered.length;
    const avgPss = filtered.reduce((sum, e) => sum + (e.pssScore || 0), 0) / filtered.length;
    const avgRses = filtered.reduce((sum, e) => sum + (e.rsesScore || 0), 0) / filtered.length;
    
    return {
      phq9: Math.round(avgPhq9),
      gad7: Math.round(avgGad7),
      pss: Math.round(avgPss),
      rses: Math.round(avgRses)
    };
  };

  const getTrendDirection = (metric: 'phq9' | 'gad7' | 'pss' | 'rses') => {
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-5);
    const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
    const secondHalf = recent.slice(Math.ceil(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, e) => sum + (e[`${metric}Score`] || 0), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, e) => sum + (e[`${metric}Score`] || 0), 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    if (metric === 'rses') {
      // For self-esteem, higher is better
      if (diff > 2) return 'improving';
      if (diff < -2) return 'declining';
    } else {
      // For PHQ-9, GAD-7, and PSS, lower is better
      if (diff < -2) return 'improving';
      if (diff > 2) return 'declining';
    }
    
    return 'stable';
  };

  const getInsight = () => {
    if (history.length < 3) {
      return "Complete a few more check-ins to see personalized insights about your patterns.";
    }
    
    const moodTrend = getTrendDirection('phq9');
    const anxietyTrend = getTrendDirection('gad7');
    const stressTrend = getTrendDirection('pss');
    const esteemTrend = getTrendDirection('rses');
    
    // Check for overall improvement across metrics
    const improvingCount = [moodTrend, anxietyTrend, stressTrend].filter(t => t === 'improving').length;
    const decliningCount = [moodTrend, anxietyTrend, stressTrend].filter(t => t === 'declining').length;
    
    if (improvingCount >= 2) {
      return "Multiple wellness measures are trending positively! Keep doing what's working for you.";
    }
    
    if (moodTrend === 'improving' && anxietyTrend === 'improving') {
      return "Both your mood and anxiety levels have been improving. This is wonderful progress!";
    }
    
    if (esteemTrend === 'improving') {
      return "Your self-esteem has been increasing lately. Notice what's been helping you feel more confident.";
    }
    
    if (decliningCount >= 2) {
      return "A few measures are showing higher scores lately. Consider what's changed and whether you need extra support.";
    }
    
    if (stressTrend === 'declining' && anxietyTrend === 'declining') {
      return "Both stress and anxiety seem elevated recently. Be gentle with yourself and reach out if you need support.";
    }
    
    return "Your check-ins show natural variation. Consider noting what's different on days when scores change — it can reveal helpful patterns.";
  };

  const latestScores = getLatestScores();
  const avgScores = getAverageScores();

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <div className="text-center space-y-6">
          <div className="text-6xl">📊</div>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Loading data...</h2>
          <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} max-w-sm`}>
            Please wait while we fetch your wellness patterns
          </p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} flex items-center justify-center p-6`}>
        <div className="text-center space-y-6">
          <div className="text-6xl">📊</div>
          <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>No data yet</h2>
          <p className={`${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} max-w-sm`}>
            Complete your first check-in to start tracking your wellness patterns over time
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#1a1410]' : 'bg-[#ece5de]'} overflow-y-auto pb-20`}>
      <div className="p-5 space-y-5">
        {/* Header */}
        <div className="pt-8">
          {onBack && (
            <BackButton onClick={onBack} isDarkMode={isDarkMode} className="mb-4" />
          )}
          <h1 className={`text-3xl font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>Your Trends</h1>
          <p className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>Patterns and insights over time</p>
        </div>

        {/* Time Range Filter */}
        <div className="flex items-center gap-2">
          <Filter className={`w-4 h-4 ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'}`} />
          <div className={`flex ${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/60'} rounded-xl p-1 gap-1`}>
            {['7', '30', '90'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-[#ffb757] text-white shadow-sm'
                    : isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'
                }`}
              >
                {range} days
              </button>
            ))}
          </div>
        </div>

        {/* Latest Scores Summary */}
        {latestScores && (
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 text-center shadow-sm`}
            >
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                {latestScores.phq9 != null ? latestScores.phq9 : '-'}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Mood</div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>PHQ-9</div>
              <div className="mt-2">
                {getTrendDirection('phq9') === 'improving' && <span className="text-green-500 text-xs">↓ Better</span>}
                {getTrendDirection('phq9') === 'declining' && <span className="text-orange-500 text-xs">↑ Watch</span>}
                {getTrendDirection('phq9') === 'stable' && <span className={`${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'} text-xs`}>→ Stable</span>}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 text-center shadow-sm`}
            >
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                {latestScores.gad7 != null ? latestScores.gad7 : '-'}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Anxiety</div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>GAD-7</div>
              <div className="mt-2">
                {getTrendDirection('gad7') === 'improving' && <span className="text-green-500 text-xs">↓ Better</span>}
                {getTrendDirection('gad7') === 'declining' && <span className="text-orange-500 text-xs">↑ Watch</span>}
                {getTrendDirection('gad7') === 'stable' && <span className={`${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'} text-xs`}>→ Stable</span>}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 text-center shadow-sm`}
            >
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                {latestScores.pss != null ? latestScores.pss : '-'}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Stress</div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>PSS</div>
              <div className="mt-2">
                {getTrendDirection('pss') === 'improving' && <span className="text-green-500 text-xs">↓ Better</span>}
                {getTrendDirection('pss') === 'declining' && <span className="text-orange-500 text-xs">↑ Watch</span>}
                {getTrendDirection('pss') === 'stable' && <span className={`${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'} text-xs`}>→ Stable</span>}
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-4 text-center shadow-sm`}
            >
              <div className={`text-2xl font-bold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-1`}>
                {latestScores.rses != null ? latestScores.rses : '-'}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}`}>Self-Esteem</div>
              <div className={`text-xs ${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'}`}>RSES</div>
              <div className="mt-2">
                {getTrendDirection('rses') === 'improving' && <span className="text-green-500 text-xs">↑ Better</span>}
                {getTrendDirection('rses') === 'declining' && <span className="text-orange-500 text-xs">↓ Watch</span>}
                {getTrendDirection('rses') === 'stable' && <span className={`${isDarkMode ? 'text-[#ece5de]/40' : 'text-[#8d654c]/40'} text-xs`}>→ Stable</span>}
              </div>
            </motion.div>
          </div>
        )}

        {/* Chart */}
        {chartData.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-sm`}
          >
            <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-4 flex items-center gap-2`}>
              <TrendingUp className="w-5 h-5" />
              Score Trends
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#ffb757' : '#ddc4af'} opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke={isDarkMode ? '#ece5de' : '#8d654c'}
                  fontSize={11}
                  opacity={0.6}
                  padding={{ left: 30, right: 30 }}
                />
                <YAxis 
                  stroke={isDarkMode ? '#ece5de' : '#8d654c'}
                  fontSize={11}
                  opacity={0.6}
                  domain={([dataMin, dataMax]: [number, number]) => [
                    Math.max(0, Math.floor(dataMin) - 3),
                    Math.ceil(dataMax) + 3
                  ]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#2a2218' : 'white',
                    border: `1px solid ${isDarkMode ? '#ffb757' : '#ddc4af'}`,
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: isDarkMode ? '#ece5de' : '#8d654c'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Mood"
                  stroke="#c4856f"
                  strokeWidth={2.5}
                  dot={{ fill: '#c4856f', r: 4 }}
                  name="Mood (PHQ-9)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Anxiety"
                  stroke="#a67c5f"
                  strokeWidth={2.5}
                  dot={{ fill: '#a67c5f', r: 4 }}
                  name="Anxiety (GAD-7)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Stress"
                  stroke="#d4a574"
                  strokeWidth={2.5}
                  dot={{ fill: '#d4a574', r: 4 }}
                  name="Stress (PSS)"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="Self-Esteem"
                  stroke="#8fbc8f"
                  strokeWidth={2.5}
                  dot={{ fill: '#8fbc8f', r: 4 }}
                  name="Self-Esteem (RSES)"
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#c4856f]" />
                <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>Mood</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#a67c5f]" />
                <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>Anxiety</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#d4a574]" />
                <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>Stress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#8fbc8f]" />
                <span className={`text-xs ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'}`}>Self-Esteem</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Cognitive Games Trends */}
        <CognitiveGamesTrends isDarkMode={isDarkMode} timeRange={timeRange} />

        {/* Mood Trends */}
        <MoodTrends isDarkMode={isDarkMode} timeRange={timeRange === '7' ? 'week' : timeRange === '30' ? 'month' : '3months'} />

        {/* Check-in Frequency */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={`${isDarkMode ? 'bg-[#2a2218]' : 'bg-white/80'} rounded-2xl p-5 shadow-sm`}
        >
          <h3 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'} mb-3 flex items-center gap-2`}>
            <Calendar className="w-5 h-5" />
            Consistency
          </h3>
          
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold text-[#ffb757]">{history.length}</span>
            <span className={isDarkMode ? 'text-[#ece5de]/60' : 'text-[#8d654c]/60'}>check-ins completed</span>
          </div>

          <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
            Regular check-ins help you notice patterns and changes more clearly. Keep going at your own pace!
          </p>
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`${isDarkMode ? 'bg-[#ffb757]/20 border-[#ffb757]/40' : 'bg-[#ffb757]/10 border-[#ffb757]/30'} border-2 rounded-2xl p-5`}
        >
          <div className="flex gap-3">
            <Lightbulb className="w-5 h-5 text-[#ffb757] flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className={`font-semibold ${isDarkMode ? 'text-[#ece5de]' : 'text-[#8d654c]'}`}>Pattern Insight</h4>
              <p className={`text-sm ${isDarkMode ? 'text-[#ece5de]/70' : 'text-[#8d654c]/70'} leading-relaxed`}>
                {getInsight()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`text-center text-xs ${isDarkMode ? 'text-[#ece5de]/50' : 'text-[#8d654c]/50'} px-4`}
        >
          Trends are for self-reflection. For clinical concerns, consult a healthcare professional.
        </motion.div>
      </div>
    </div>
  );
}