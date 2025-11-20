import React, { useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import { GiftIcon } from '../components/Icons';
import RewardModal from '../components/RewardModal';
import Toast from '../components/Toast';
import { INITIAL_HERO_SLIDES } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { Reward, useRewards } from '../hooks/useRewards';

interface RewardsPageProps {}

const RewardsPage: React.FC<RewardsPageProps> = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const { rewards, loading, error, totalCount, fetchRewardById, redeemReward, refreshRewards } =
    useRewards({
      category: selectedCategory || undefined,
      limit: 50,
    });

  const categories = [
    { value: '', label: 'All Rewards' },
    { value: 'merchandise', label: 'Merchandise' },
    { value: 'coupon', label: 'Coupons' },
    { value: 'event', label: 'Events' },
    { value: 'service', label: 'Services' },
    { value: 'safety_kit', label: 'Safety Kits' },
  ];

  const handleViewDetails = async (reward: Reward) => {
    try {
      const details = await fetchRewardById(reward.id);
      if (details) {
        setSelectedReward(details);
        setShowRedeemModal(true);
      } else {
        // If fetchRewardById returns null, use the reward object we already have
        setSelectedReward(reward);
        setShowRedeemModal(true);
      }
    } catch (err) {
      console.error('Error fetching reward details:', err);
      // Fall back to using the reward object we already have
      setSelectedReward(reward);
      setShowRedeemModal(true);
    }
  };

  const handleRedeem = async (
    rewardId: number,
    deliveryAddress?: string,
    contactPhone?: string
  ) => {
    const redemption = await redeemReward({
      reward_id: rewardId,
      delivery_address: deliveryAddress,
      contact_phone: contactPhone,
    });

    if (redemption) {
      setShowRedeemModal(false);
      setSelectedReward(null);
      setToast({
        message: `Successfully redeemed! Your redemption status: ${redemption.status}`,
        type: 'success',
      });
    } else {
      setToast({
        message: error || 'Failed to redeem reward. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 pb-24 space-y-8 animate-fade-in">
      <Toast toast={toast} onClear={() => setToast(null)} />
      {/* Hero Slider */}
      <HeroSlider slides={INITIAL_HERO_SLIDES} />{' '}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-brand-green/10 text-brand-green rounded-xl">
            <GiftIcon />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-brand-gray-dark">Rewards Marketplace</h2>
            <p className="text-gray-600 text-sm">Use your Karma Points for real rewards!</p>
          </div>
        </div>
        {user && (
          <div className="bg-brand-green text-white px-4 py-2 rounded-lg font-bold">
            {user.stats?.total_points || 0} Karma
          </div>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === cat.value
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {!loading && !error && rewards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No rewards available in this category.</p>
        </div>
      )}
      {!loading && !error && rewards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-slide-up">
          {rewards.map(reward => (
            <div
              key={reward.id}
              className="bg-white rounded-lg shadow-subtle overflow-hidden hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
              onClick={() => handleViewDetails(reward)}
            >
              <img
                src={reward.image_url}
                alt={reward.name}
                className="w-full h-48 object-cover transition-transform hover:scale-105"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-brand-gray-dark flex-1">{reward.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      reward.category === 'merchandise'
                        ? 'bg-blue-100 text-blue-700'
                        : reward.category === 'coupon'
                          ? 'bg-purple-100 text-purple-700'
                          : reward.category === 'event'
                            ? 'bg-pink-100 text-pink-700'
                            : reward.category === 'service'
                              ? 'bg-indigo-100 text-indigo-700'
                              : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {reward.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xl text-brand-green">
                    {reward.points_required} Karma
                  </span>
                  <span className="text-sm text-gray-500">{reward.quantity_available} left</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showRedeemModal && selectedReward && (
        <RewardModal
          reward={selectedReward}
          userPoints={user?.stats?.total_points || 0}
          onClose={() => {
            setShowRedeemModal(false);
            setSelectedReward(null);
          }}
          onRedeem={handleRedeem}
        />
      )}
    </div>
  );
};

export default RewardsPage;
