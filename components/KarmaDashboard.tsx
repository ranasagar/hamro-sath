import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUp,
  Award,
  Flame,
  Gift,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useBadges, useKarma, useLeaderboard } from '../hooks/useKarma';

interface KarmaDashboardProps {
  userId?: string;
  onNavigateToRedemptions?: () => void;
  onNavigateToBadges?: () => void;
}

export const KarmaDashboard: React.FC<KarmaDashboardProps> = ({
  userId,
  onNavigateToRedemptions,
  onNavigateToBadges,
}) => {
  const { stats, loading, error, refreshStats, checkNewBadges } = useKarma();
  const { leaderboard } = useLeaderboard();
  const { badges } = useBadges();
  const [showNewBadgeAnimation, setShowNewBadgeAnimation] = useState(false);
  const [newBadgeCount, setNewBadgeCount] = useState(0);

  // Check for new badges on mount
  useEffect(() => {
    const checkBadges = async () => {
      const newBadges = await checkNewBadges();
      if (newBadges.length > 0) {
        setNewBadgeCount(newBadges.length);
        setShowNewBadgeAnimation(true);
        setTimeout(() => setShowNewBadgeAnimation(false), 3000);
      }
    };
    checkBadges();
  }, [checkNewBadges]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Skeleton loading */}
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops!</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshStats}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const userRank = leaderboard.findIndex(entry => entry.userId === userId) + 1;
  const levelProgress = ((stats.balance % 1000) / 1000) * 100;
  const nextLevel = Math.floor(stats.balance / 1000) + 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* New Badge Notification */}
        <AnimatePresence>
          {showNewBadgeAnimation && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.8 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 text-white px-6 py-4 rounded-2xl shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <span className="font-bold">
                  {newBadgeCount} New Badge{newBadgeCount > 1 ? 's' : ''} Earned! 🎉
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Karma Dashboard</h1>
          <p className="text-gray-600">Track your civic impact and rewards</p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Karma Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-90">Total Karma</span>
                <Sparkles className="w-5 h-5" />
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="text-5xl font-bold mb-2"
              >
                {stats.balance.toLocaleString()}
              </motion.div>

              <div className="flex items-center gap-2 text-sm">
                {stats.balance > (stats.previousBalance || 0) && (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    <span>
                      +{(stats.balance - (stats.previousBalance || 0)).toLocaleString()} this week
                    </span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Level Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Level</span>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>

            <div className="text-4xl font-bold text-gray-800 mb-2">{stats.level}</div>

            <div className="text-sm text-gray-600 mb-3">
              {stats.levelName || `Level ${stats.level}`}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              />
            </div>

            <div className="mt-2 text-xs text-gray-500">
              {1000 - (stats.balance % 1000)} karma to Level {nextLevel}
            </div>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden"
          >
            <motion.div
              className="absolute -right-4 -top-4"
              animate={{
                rotate: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Flame className="w-32 h-32 opacity-20" />
            </motion.div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-90">Streak</span>
                <Flame className="w-5 h-5" />
              </div>

              <div className="text-5xl font-bold mb-2">
                {stats.currentStreak}
                <span className="text-2xl ml-1">days</span>
              </div>

              <div className="text-sm opacity-90">Best: {stats.longestStreak} days 🔥</div>
            </div>
          </motion.div>
        </div>

        {/* Secondary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Rank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-gray-600 font-medium">Your Rank</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">#{userRank || '?'}</div>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onNavigateToBadges}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-600 font-medium">Badges</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{badges.length}</div>
          </motion.div>

          {/* Redemptions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={onNavigateToRedemptions}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-pink-500" />
              <span className="text-xs text-gray-600 font-medium">Redeemed</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">{stats.totalRedemptions || 0}</div>
          </motion.div>

          {/* Total Earned */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-600 font-medium">Total Earned</span>
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {stats.totalEarned?.toLocaleString() || stats.balance.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Recent Badges Preview */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Badges</h2>
              <button
                onClick={onNavigateToBadges}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View All →
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {badges.slice(0, 5).map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="flex-shrink-0 w-24 text-center"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-3xl mb-2 shadow-lg"
                  >
                    {badge.badgeIcon || '🏆'}
                  </motion.div>
                  <p className="text-xs font-medium text-gray-700 truncate">{badge.badgeName}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNavigateToRedemptions}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Gift className="w-6 h-6 mb-2" />
            <span className="font-semibold">Redeem Rewards</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Target className="w-6 h-6 mb-2" />
            <span className="font-semibold">View Challenges</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default KarmaDashboard;
