import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, Minus, Calendar, Brain, Heart, Zap } from 'lucide-react';
import { BackButton } from './ui/BackButton';

interface Assessment {
  date: string;
  phq9Score: number;
  stressScore: number;
  cognitiveScore: number;
}

interface DashboardProps {
  onBack: () => void;
  isDarkMode?: boolean;
}

export function Dashboard({ onBack, isDarkMode = false }: DashboardProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [timeRange, setTimeRange] = useState<'all' | '30' | '90'>('all');

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    setAssessments(history);
  }, []);

  const filteredAssessments = assessments.filter(a => {
    if (timeRange === 'all') return true;
    const days = timeRange === '30' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return new Date(a.date) >= cutoff;
  }).slice(-10); // Last 10 assessments

  const chartData = filteredAssessments.map(a => ({
    date: new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    'Depression (PHQ-9)': a.phq9Score,
    'Stress Level': a.stressScore,
    'Cognitive Health': a.cognitiveScore
  }));

  const latestAssessment = assessments[assessments.length - 1];
  const previousAssessment = assessments[assessments.length - 2];

  const getTrend = (current: number, previous: number | undefined) => {
    if (!previous) return null;
    if (current > previous) return 'up';
    if (current < previous) return 'down';
    return 'stable';
  };

  const getPhq9Severity = (score: number) => {
    if (score <= 4) return { level: 'Minimal', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 9) return { level: 'Mild', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score <= 14) return { level: 'Moderate', color: 'text-orange-600', bg: 'bg-orange-50' };
    if (score <= 19) return { level: 'Moderately Severe', color: 'text-red-600', bg: 'bg-red-50' };
    return { level: 'Severe', color: 'text-red-700', bg: 'bg-red-100' };
  };

  const getStressSeverity = (score: number) => {
    if (score <= 13) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-50' };
    if (score <= 26) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-50' };
  };

  if (assessments.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">📊</div>
          <h2 className="text-2xl font-semibold text-gray-900">No Data Yet</h2>
          <p className="text-gray-600">
            Complete your first wellness check to start tracking your mental health journey
          </p>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Start Your First Check
          </button>
        </div>
      </div>
    );
  }

  const phq9Severity = getPhq9Severity(latestAssessment.phq9Score);
  const stressSeverity = getStressSeverity(latestAssessment.stressScore);

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <BackButton
            onClick={onBack}
            isDarkMode={isDarkMode}
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeRange('30')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '30' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === '90' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Wellness Journey
          </h1>
          <p className="text-gray-600">
            Tracking {assessments.length} assessment{assessments.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Current Status Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* PHQ-9 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-lg p-3">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Depression</h3>
                  <p className="text-sm text-gray-500">PHQ-9 Score</p>
                </div>
              </div>
              {previousAssessment && getTrend(latestAssessment.phq9Score, previousAssessment.phq9Score) && (
                <div className="text-gray-400">
                  {getTrend(latestAssessment.phq9Score, previousAssessment.phq9Score) === 'up' && <TrendingUp className="w-5 h-5 text-orange-500" />}
                  {getTrend(latestAssessment.phq9Score, previousAssessment.phq9Score) === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
                  {getTrend(latestAssessment.phq9Score, previousAssessment.phq9Score) === 'stable' && <Minus className="w-5 h-5" />}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900">
                {latestAssessment.phq9Score}
                <span className="text-xl text-gray-400">/27</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${phq9Severity.bg} ${phq9Severity.color}`}>
                {phq9Severity.level}
              </div>
            </div>
          </div>

          {/* Stress */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg p-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Stress Level</h3>
                  <p className="text-sm text-gray-500">PSS Score</p>
                </div>
              </div>
              {previousAssessment && getTrend(latestAssessment.stressScore, previousAssessment.stressScore) && (
                <div className="text-gray-400">
                  {getTrend(latestAssessment.stressScore, previousAssessment.stressScore) === 'up' && <TrendingUp className="w-5 h-5 text-orange-500" />}
                  {getTrend(latestAssessment.stressScore, previousAssessment.stressScore) === 'down' && <TrendingDown className="w-5 h-5 text-green-500" />}
                  {getTrend(latestAssessment.stressScore, previousAssessment.stressScore) === 'stable' && <Minus className="w-5 h-5" />}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900">
                {latestAssessment.stressScore}
                <span className="text-xl text-gray-400">/40</span>
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${stressSeverity.bg} ${stressSeverity.color}`}>
                {stressSeverity.level} Stress
              </div>
            </div>
          </div>

          {/* Cognitive */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg p-3">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cognitive</h3>
                  <p className="text-sm text-gray-500">Game Score</p>
                </div>
              </div>
              {previousAssessment && getTrend(latestAssessment.cognitiveScore, previousAssessment.cognitiveScore) && (
                <div className="text-gray-400">
                  {getTrend(latestAssessment.cognitiveScore, previousAssessment.cognitiveScore) === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {getTrend(latestAssessment.cognitiveScore, previousAssessment.cognitiveScore) === 'down' && <TrendingDown className="w-5 h-5 text-orange-500" />}
                  {getTrend(latestAssessment.cognitiveScore, previousAssessment.cognitiveScore) === 'stable' && <Minus className="w-5 h-5" />}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-gray-900">
                {Math.round(latestAssessment.cognitiveScore)}
                <span className="text-xl text-gray-400">%</span>
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-600">
                Performance
              </div>
            </div>
          </div>
        </div>

        {/* Trends Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Trends Over Time</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="Depression (PHQ-9)" 
                  stroke="#ec4899" 
                  strokeWidth={2}
                  dot={{ fill: '#ec4899', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Stress Level" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="Cognitive Health" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-12">
              Complete more assessments to see trends
            </div>
          )}
        </div>

        {/* Support Message */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <Calendar className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <h3 className="font-semibold text-purple-900">
                Remember: You're not alone
              </h3>
              <p className="text-purple-800 text-sm">
                These assessments help you understand patterns, but they're not diagnostic tools. 
                If you're concerned about your mental health, please reach out to a mental health professional. 
                Regular check-ins (weekly or bi-weekly) can help you track your wellness journey more effectively.
              </p>
              <div className="pt-2">
                <a 
                  href="https://988lifeline.org/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-700 font-medium underline hover:text-purple-900"
                >
                  Crisis support is available 24/7 → 988 Lifeline
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}