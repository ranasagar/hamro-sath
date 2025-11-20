import { AnimatePresence, motion } from 'framer-motion';
import { Award, Lock, Sparkles, Star, TrendingUp, X } from 'lucide-react';
import React, { useState } from 'react';
import { useBadges } from '../hooks/useKarma';

interface BadgeDetailModalProps {
  badge: {
    id: number;
    badgeName: string;
    badgeDescription: string;
    badgeIcon: string;
    badgeRarity: 'common' | 'rare' | 'epic' | 'legendary';
    earnedAt: number;
    blockchainToken?: string;
    nftMetadata?: any;
  };
  onClose: () => void;
}

const BadgeDetailModal: React.FC<BadgeDetailModalProps> = ({ badge, onClose }) => {
  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
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
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Display */}
        <motion.div
          animate={{
            rotateY: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`w-32 h-32 mx-auto mb-6 bg-gradient-to-br ${rarityColors[badge.badgeRarity]} rounded-full flex items-center justify-center text-6xl shadow-2xl`}
        >
          {badge.badgeIcon}
        </motion.div>

        {/* Badge Info */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-800">{badge.badgeName}</h2>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full text-white bg-gradient-to-r ${rarityColors[badge.badgeRarity]}`}
            >
              {badge.badgeRarity.toUpperCase()}
            </span>
          </div>
          <p className="text-gray-600 mb-4">{badge.badgeDescription}</p>
          <p className="text-sm text-gray-500">
            Earned on {new Date(badge.earnedAt).toLocaleDateString()}
          </p>
        </div>

        {/* Blockchain Info */}
        {badge.blockchainToken && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">NFT Badge</span>
            </div>
            <p className="text-xs text-gray-600 font-mono break-all">{badge.blockchainToken}</p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow">
            Share
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            View on Chain
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface NFTBadgeGalleryProps {
  onClose?: () => void;
}

export const NFTBadgeGallery: React.FC<NFTBadgeGalleryProps> = ({ onClose }) => {
  const { badges, loading, error } = useBadges();
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'common' | 'rare' | 'epic' | 'legendary'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rarity' | 'name'>('recent');

  const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };

  const filteredAndSortedBadges = badges
    .filter(badge => filter === 'all' || badge.badgeRarity === filter)
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return b.earnedAt - a.earnedAt;
      } else if (sortBy === 'rarity') {
        return rarityOrder[b.badgeRarity] - rarityOrder[a.badgeRarity];
      } else {
        return a.badgeName.localeCompare(b.badgeName);
      }
    });

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-yellow-400 to-orange-600',
  };

  const rarityStats = {
    common: badges.filter(b => b.badgeRarity === 'common').length,
    rare: badges.filter(b => b.badgeRarity === 'rare').length,
    epic: badges.filter(b => b.badgeRarity === 'epic').length,
    legendary: badges.filter(b => b.badgeRarity === 'legendary').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="aspect-square bg-white/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops!</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Award className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">NFT Badge Gallery</h1>
          </div>
          <p className="text-gray-600">Your collection of {badges.length} unique achievements</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {Object.entries(rarityStats).map(([rarity, count], index) => (
            <motion.div
              key={rarity}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-md"
            >
              <div
                className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-br ${
                  rarityColors[rarity as keyof typeof rarityColors]
                } rounded-full flex items-center justify-center`}
              >
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{count}</div>
                <div className="text-xs text-gray-600 capitalize">{rarity}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters & Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 shadow-md"
        >
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'legendary', 'epic', 'rare', 'common'] as const).map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setFilter(rarity)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === rarity
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="recent">Most Recent</option>
              <option value="rarity">By Rarity</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </motion.div>

        {/* Badge Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => setSelectedBadge(badge)}
                className="cursor-pointer"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-shadow">
                  {/* 3D Flip Animation on Hover */}
                  <motion.div
                    className="relative"
                    whileHover={{ rotateY: 180 }}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front */}
                    <div className="backface-hidden" style={{ backfaceVisibility: 'hidden' }}>
                      <div
                        className={`w-24 h-24 mx-auto mb-4 bg-gradient-to-br ${
                          rarityColors[badge.badgeRarity]
                        } rounded-full flex items-center justify-center text-5xl shadow-xl relative`}
                      >
                        {badge.badgeIcon}
                        {badge.blockchainToken && (
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                          >
                            <Sparkles className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>

                      <h3 className="text-center font-bold text-gray-800 mb-1 truncate">
                        {badge.badgeName}
                      </h3>
                      <p className="text-center text-xs text-gray-500 line-clamp-2 mb-2">
                        {badge.badgeDescription}
                      </p>
                      <div
                        className={`mx-auto w-fit px-2 py-1 text-xs font-semibold rounded-full text-white bg-gradient-to-r ${
                          rarityColors[badge.badgeRarity]
                        }`}
                      >
                        {badge.badgeRarity.toUpperCase()}
                      </div>
                    </div>

                    {/* Back (shown on hover) */}
                    <div
                      className="absolute inset-0 backface-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                        <TrendingUp className="w-12 h-12 text-purple-600 mb-2" />
                        <p className="text-sm text-center font-semibold text-gray-700">
                          Click to view details
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredAndSortedBadges.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No badges found</h3>
            <p className="text-gray-500">
              {filter !== 'all'
                ? `You haven't earned any ${filter} badges yet`
                : 'Start completing actions to earn badges!'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Badge Detail Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetailModal badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NFTBadgeGallery;
