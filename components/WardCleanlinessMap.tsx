import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  Users,
  Activity,
  X,
  ChevronRight,
} from 'lucide-react';
import { useWardScores, useWardDashboard } from '../hooks/useCivicHub';

interface WardDetailModalProps {
  wardId: number;
  onClose: () => void;
}

const WardDetailModal: React.FC<WardDetailModalProps> = ({ wardId, onClose }) => {
  const { dashboard, loading } = useWardDashboard(wardId);

  if (loading || !dashboard) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'declining') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ward Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Ward {dashboard.wardId}</h2>
              <p className="text-sm text-gray-600">{dashboard.wardName}</p>
            </div>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Cleanliness Score</span>
            {getTrendIcon(dashboard.trend)}
          </div>
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-emerald-600">{dashboard.score}</div>
            <div className="text-gray-600 mb-2">/ 100</div>
          </div>
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${dashboard.score}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-600">Rank</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">#{dashboard.rank}</div>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">Active Users</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dashboard.activeUsers || 0}
            </div>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">Issues Resolved</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dashboard.issuesResolved || 0}
            </div>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600">Projects</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {dashboard.activeProjects || 0}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        {dashboard.recentActivities && dashboard.recentActivities.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {dashboard.recentActivities.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <p className="text-sm text-gray-700 flex-1">{activity.description}</p>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium">
            View Projects
          </button>
          <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
            Report Issue
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface WardCleanlinessMapsProps {
  onNavigateToWard?: (wardId: number) => void;
}

export const WardCleanlinessMap: React.FC<WardCleanlinessMapsProps> = ({ onNavigateToWard }) => {
  const { scores, loading, error } = useWardScores();
  const [selectedWardId, setSelectedWardId] = useState<number | null>(null);
  const [filterTrend, setFilterTrend] = useState<'all' | 'improving' | 'stable' | 'declining'>(
    'all'
  );

  const filteredScores = useMemo(() => {
    if (filterTrend === 'all') return scores;
    return scores.filter((score) => score.trend === filterTrend);
  }, [scores, filterTrend]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-400 to-emerald-500';
    if (score >= 60) return 'from-yellow-400 to-orange-400';
    if (score >= 40) return 'from-orange-400 to-red-400';
    return 'from-red-500 to-red-700';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(32)].map((_, i) => (
              <div key={i} className="aspect-square bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Failed to Load</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const topPerformers = [...scores].sort((a, b) => b.score - a.score).slice(0, 3);
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Ward Cleanliness Map</h1>
          <p className="text-gray-600">Real-time cleanliness scores across 32 Kathmandu wards</p>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-md">
            <div className="text-sm text-gray-600 mb-1">Average Score</div>
            <div className="text-3xl font-bold text-gray-800">{avgScore.toFixed(1)}</div>
          </div>

          {topPerformers.map((ward, index) => (
            <div
              key={ward.wardId}
              className={`bg-gradient-to-br ${getScoreColor(
                ward.score
              )} rounded-xl p-4 shadow-md text-white`}
            >
              <div className="text-sm opacity-90 mb-1">#{index + 1} Ward {ward.wardId}</div>
              <div className="text-3xl font-bold">{ward.score}</div>
            </div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-600 self-center">Filter by trend:</span>
            {(['all', 'improving', 'stable', 'declining'] as const).map((trend) => (
              <button
                key={trend}
                onClick={() => setFilterTrend(trend)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  filterTrend === trend
                    ? 'bg-teal-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {trend}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Heat Map Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
        >
          {filteredScores.map((ward, index) => (
            <motion.div
              key={ward.wardId}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              onClick={() => setSelectedWardId(ward.wardId)}
              className="cursor-pointer"
            >
              <div
                className={`aspect-square bg-gradient-to-br ${getScoreColor(
                  ward.score
                )} rounded-2xl p-3 shadow-lg hover:shadow-2xl transition-shadow relative overflow-hidden`}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-white/10"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: index * 0.1,
                  }}
                />

                <div className="relative z-10 h-full flex flex-col justify-between text-white">
                  <div className="text-xs font-semibold opacity-90">W{ward.wardId}</div>
                  <div>
                    <div className="text-2xl font-bold">{ward.score}</div>
                    <div className="text-xs opacity-80">#{ward.rank}</div>
                  </div>
                </div>

                {/* Trend indicator */}
                <div className="absolute top-2 right-2">
                  {ward.trend === 'improving' && (
                    <TrendingUp className="w-4 h-4 text-white/80" />
                  )}
                  {ward.trend === 'declining' && (
                    <TrendingDown className="w-4 h-4 text-white/80" />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-md"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">Score Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded"></div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Excellent</div>
                <div className="text-xs text-gray-600">80-100</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-400 rounded"></div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Good</div>
                <div className="text-xs text-gray-600">60-79</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded"></div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Fair</div>
                <div className="text-xs text-gray-600">40-59</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded"></div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Needs Work</div>
                <div className="text-xs text-gray-600">0-39</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Ward Detail Modal */}
      <AnimatePresence>
        {selectedWardId && (
          <WardDetailModal wardId={selectedWardId} onClose={() => setSelectedWardId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WardCleanlinessMap;
