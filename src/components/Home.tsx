import { Heart, Brain, TrendingUp, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface HomeProps {
  onStartAssessment: () => void;
  onViewDashboard: () => void;
}

export function Home({ onStartAssessment, onViewDashboard }: HomeProps) {
  const [lastAssessment, setLastAssessment] = useState<Date | null>(null);
  const [showNudge, setShowNudge] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('lastAssessmentDate');
    if (stored) {
      const date = new Date(stored);
      setLastAssessment(date);
      
      // Show nudge if it's been more than 7 days
      const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 7) {
        setShowNudge(true);
      }
    } else {
      setShowNudge(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50"></div>
              <div className="relative bg-white rounded-full p-6 shadow-lg">
                <Brain className="w-12 h-12 text-purple-600" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            MindfulMe
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            A gentle space to check in with yourself and track your mental wellness journey
          </p>
        </div>

        {/* Nudge Card */}
        {showNudge && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200 animate-pulse">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  {lastAssessment 
                    ? "Time for a check-in?" 
                    : "Welcome! Let's get started"
                  }
                </h3>
                <p className="text-purple-800 text-sm">
                  {lastAssessment 
                    ? "It's been a while since your last assessment. Taking a few minutes to reflect can help you understand your patterns better."
                    : "Taking a few moments to understand how you're feeling can be a powerful step toward wellness."
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid gap-4">
          <button
            onClick={onStartAssessment}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-200"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  Start Wellness Check
                </h2>
                <p className="text-gray-600">
                  Interactive questions and mindful activities • About 10 minutes
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">→</span>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={onViewDashboard}
            className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200"
          >
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl p-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                  View My Journey
                </h2>
                <p className="text-gray-600">
                  Track your progress and insights over time
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">→</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Info */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p>This tool is for self-reflection and awareness, not a substitute for professional care.</p>
          <p>If you're in crisis, please reach out to a mental health professional or crisis line.</p>
        </div>
      </div>
    </div>
  );
}
