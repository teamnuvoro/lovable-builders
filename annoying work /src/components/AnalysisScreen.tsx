import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { 
  Heart, 
  TrendingUp, 
  Sparkles,
  ArrowLeft,
  Brain,
  Shield,
  Award
} from "lucide-react";

interface AnalysisScreenProps {
  aiName: string;
  userName: string;
  onClose: () => void;
}

export function AnalysisScreen({ aiName, userName, onClose }: AnalysisScreenProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // Simulate analyzing process
    const progressInterval = setInterval(() => {
      setCurrentProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, []);

  // Understanding level - this would typically come from actual analysis
  const understandingLevel = 42;

  if (isAnalyzing) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-b from-pink-100 via-purple-100 to-orange-100 items-center justify-center px-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-sm w-full">
          <div className="flex flex-col items-center">
            <div className="relative mb-6">
              <Brain className="w-20 h-20 text-purple-500 animate-pulse" />
              <Sparkles className="w-8 h-8 text-pink-400 absolute -top-2 -right-2 animate-bounce" />
            </div>
            <h2 className="text-2xl mb-2 text-gray-800 text-center">Analyzing Your Profile</h2>
            <p className="text-gray-600 text-center mb-6">
              {aiName} is understanding your relationship patterns...
            </p>
            <Progress value={currentProgress} className="w-full h-3 mb-2" />
            <p className="text-sm text-gray-500">{currentProgress}% Complete</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="flex flex-col h-full bg-white overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <button onClick={onClose} className="mb-4">
            <ArrowLeft className="w-6 h-6 text-purple-500" />
          </button>
          <h1 className="text-3xl text-gray-900 mb-2">Your Relationship Insights</h1>
          <p className="text-gray-500">Based on your conversations with {aiName}</p>
        </div>

        <div className="px-6 pb-6 space-y-6">
          {/* Understanding Level Card */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2 tracking-wide uppercase">Understanding Level</p>
                <div className="text-6xl mb-4 text-gray-900">{understandingLevel}%</div>
                <p className="text-gray-600 leading-relaxed">
                  {aiName} is learning about your ideal relationship. Keep chatting to build deeper insights.
                </p>
              </div>
              <div className="relative w-32 h-32 flex-shrink-0">
                {/* Circular progress indicator */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - understandingLevel / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 text-sm">
              <span className="text-gray-400">New</span>
              <span className="text-purple-600 font-medium">Getting to know you</span>
              <span className="text-gray-400">Deep connection</span>
            </div>
          </div>

          {/* Ideal Partner Vibe */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 border border-pink-200">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <div>
                <h3 className="text-xl mb-3 text-gray-900">Your Ideal Partner Vibe</h3>
                <p className="text-gray-700 leading-relaxed">
                  You connect best with someone warm, emotionally expressive, and grounded who values deep conversations.
                </p>
              </div>
            </div>
          </div>

          {/* Top 3 Traits */}
          <div>
            <h2 className="text-2xl text-gray-900 mb-4">Top 3 Traits You Value Most</h2>
            
            {/* Trait 1 - Emotional understanding */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-6 mb-4 border border-pink-100 relative overflow-hidden">
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-9xl text-pink-200/30 font-bold">1</div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl mb-1 text-gray-900">Emotional understanding</h3>
                  <p className="text-gray-600">Deep empathy and connection</p>
                </div>
              </div>
            </div>

            {/* Trait 2 - Playful communication */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 mb-4 border border-purple-100 relative overflow-hidden">
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-9xl text-purple-200/30 font-bold">2</div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl mb-1 text-gray-900">Playful communication</h3>
                  <p className="text-gray-600">Light-hearted and fun exchanges</p>
                </div>
              </div>
            </div>

            {/* Trait 3 - Shared ambition */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-3xl p-6 border border-cyan-100 relative overflow-hidden">
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-9xl text-cyan-200/30 font-bold">3</div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-500 flex items-center justify-center text-white flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl mb-1 text-gray-900">Shared ambition</h3>
                  <p className="text-gray-600">Growth-oriented mindset</p>
                </div>
              </div>
            </div>
          </div>

          {/* Growth Areas Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 uppercase tracking-wider">Growth Areas</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* What You Might Work On */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900">What You Might Work On</h2>
            </div>

            <div className="space-y-4">
              {/* Growth item 1 */}
              <div className="flex items-start gap-4 bg-white/60 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 rounded-full border-2 border-purple-400 border-dashed"></div>
                </div>
                <p className="text-gray-700 pt-2">Opening up more consistently about feelings</p>
              </div>

              {/* Growth item 2 */}
              <div className="flex items-start gap-4 bg-white/60 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-gray-700 pt-2">Practicing emotional clarity in conversations</p>
              </div>

              {/* Growth item 3 */}
              <div className="flex items-start gap-4 bg-white/60 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-gray-700 pt-2">Being more present during vulnerable moments</p>
              </div>
            </div>
          </div>

          {/* Next Time's Focus */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl text-gray-900">Next Time's Focus</h2>
            </div>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              These topics will help {aiName} understand you better and increase your confidence score
            </p>

            <div className="space-y-3">
              {/* Love Language */}
              <button className="w-full bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200 rounded-2xl px-5 py-4 flex items-center gap-3 hover:from-pink-100 hover:to-pink-200 transition-colors">
                <div className="text-2xl">💕</div>
                <span className="text-pink-600 font-medium text-lg">Love Language</span>
              </button>

              {/* Emotional Security */}
              <button className="w-full bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-2xl px-5 py-4 flex items-center gap-3 hover:from-purple-100 hover:to-purple-200 transition-colors">
                <Shield className="w-6 h-6 text-purple-500" />
                <span className="text-purple-600 font-medium text-lg">Emotional Security</span>
              </button>

              {/* Trust Patterns */}
              <button className="w-full bg-gradient-to-r from-cyan-50 to-cyan-100 border border-cyan-200 rounded-2xl px-5 py-4 flex items-center gap-3 hover:from-cyan-100 hover:to-cyan-200 transition-colors">
                <Award className="w-6 h-6 text-cyan-500" />
                <span className="text-cyan-600 font-medium text-lg">Trust Patterns</span>
              </button>
            </div>
          </div>

          {/* Current Insights Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Love Language Card */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-3xl p-5 border border-yellow-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <h3 className="text-gray-900 font-medium">Love Language</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">Words of Affirmation</p>
            </div>

            {/* Communication Card */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl p-5 border border-cyan-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 text-cyan-600">💬</div>
                <h3 className="text-gray-900 font-medium">Communication</h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">Thoughtful & Direct</p>
            </div>
          </div>

          {/* Last Updated */}
          <div className="text-center py-4">
            <p className="text-gray-400 text-sm">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} at {new Date().toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
            </p>
          </div>

          {/* Back to Chat Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 rounded-full shadow-lg transition-all"
          >
            Continue Conversation with {aiName}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}