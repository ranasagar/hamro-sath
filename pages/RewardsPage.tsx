import React, { useEffect, useState } from 'react';
import HeroSlider from '../components/HeroSlider';
import { GiftIcon } from '../components/Icons';
import RewardModal3D from '../components/RewardModal3D';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { Reward, useRewards } from '../hooks/useRewards';
import { useUserProfile } from '../hooks/useUserProfile';
import { HeroSlide } from '../types';

interface RewardsPageProps {
  heroSlides?: HeroSlide[];
}

const RewardsPage: React.FC<RewardsPageProps> = ({ heroSlides = [] }) => {
  const { user } = useAuth();
  const { fetchProfile } = useUserProfile();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const { rewards, loading, error, totalCount, fetchRewardById, redeemReward, refreshRewards } =
    useRewards({
      category: selectedCategory || undefined,
      limit: 50,
    });

  // Listen for localStorage changes from admin panel
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'safaNepal-rewards' && e.newValue) {
        refreshRewards();
      }
    };

    // Listen to storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also listen to custom event for same-tab updates
    const handleCustomRefresh = () => {
      refreshRewards();
    };
    window.addEventListener('rewardsUpdated', handleCustomRefresh);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('rewardsUpdated', handleCustomRefresh);
    };
  }, [refreshRewards]);

  const categories = [
    { value: '', label: '🎁 All Rewards', icon: '🎁' },
    { value: 'merchandise', label: '👕 Merchandise', icon: '👕' },
    { value: 'coupon', label: '🎟️ Coupons', icon: '🎟️' },
    { value: 'event', label: '🎪 Events', icon: '🎪' },
    { value: 'service', label: '⚡ Services', icon: '⚡' },
    { value: 'safety_kit', label: '🛡️ Safety Kits', icon: '🛡️' },
  ];

  const toggleFavorite = (rewardId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(rewardId)) {
        newFavorites.delete(rewardId);
      } else {
        newFavorites.add(rewardId);
      }
      return newFavorites;
    });
  };

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
      // Refresh user profile to update karma points
      await fetchProfile();
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
    <div className="pb-20 min-h-screen bg-gradient-to-b from-[#F5FAFF] via-[#E6F0FA] to-[#E6F0FA]">
      <Toast toast={toast} onClear={() => setToast(null)} />

      {/* Welcome Header - iOS Style */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-sm">
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {user?.avatar && (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                />
              )}
              <div>
                <p className="text-xs text-gray-500">Welcome Back</p>
                <p className="font-bold text-[#1C1C1E] flex items-center gap-1">
                  {user?.name || 'Guest'} <span className="text-red-500">❤️</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-4 py-2 rounded-full bg-white shadow-md">
                <span className="font-bold text-[#007AFF]">
                  {user?.stats?.total_points || 0} KP
                </span>
              </div>
              <button className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow">
                <GiftIcon className="w-6 h-6 text-[#4A90E2]" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="What's on your list?"
              className="w-full px-4 py-3 pl-11 rounded-2xl bg-gray-50/80 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/30 focus:bg-white transition-all text-sm"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/* Category Filter Chips */}
          <div className="overflow-x-auto hide-scrollbar -mx-4 px-4 mt-3">
            <div className="flex gap-2">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-[#007AFF] text-white shadow-lg shadow-blue-200'
                      : 'bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-[#4A90E2] hover:shadow-md'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Slider */}
      {heroSlides && heroSlides.length > 0 && (
        <div className="px-4 mt-4 mb-6">
          <HeroSlider slides={heroSlides} />
        </div>
      )}

      {/* Fallback Banner if no hero slides */}
      {(!heroSlides || heroSlides.length === 0) && (
        <div className="px-4 mt-4 mb-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3A8A] via-[#1E40AF] to-[#2563EB] shadow-xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiLz48L3N2Zz4=')] opacity-20"></div>
            <div className="relative p-6 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-white font-bold text-xl mb-2">
                  Get 30% OFF on Featured Rewards!
                </h3>
                <p className="text-blue-100 text-sm mb-4">Limited time offer. Shop now!</p>
                <button className="px-6 py-2.5 bg-[#FFD60A] hover:bg-[#FFC107] text-[#1C1C1E] font-bold rounded-full shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                  <GiftIcon className="w-4 h-4" />
                  Shop Now
                </button>
              </div>
              <div className="w-24 h-24 flex-shrink-0 opacity-90">
                <img
                  src="https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=200"
                  alt="Featured"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Featured Products Section */}
      <div className="px-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-[#1C1C1E] mb-3">Featured Rewards</h3>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2]"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 px-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 backdrop-blur-sm">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && rewards.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm">
                <GiftIcon className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No rewards available in this category.</p>
              </div>
            </div>
          )}

          {!loading && !error && rewards.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {rewards.map(reward => {
                const isFavorite = favorites.has(reward.id);
                const stockLeft = reward.quantity_available || 0;
                const isLowStock = stockLeft > 0 && stockLeft <= 15;

                return (
                  <div
                    key={reward.id}
                    className="bg-white/85 backdrop-blur-xl rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50"
                  >
                    {/* Image Container */}
                    <div
                      className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 cursor-pointer"
                      onClick={() => handleViewDetails(reward)}
                    >
                      <img
                        src={reward.image_url}
                        alt={reward.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Favorite Heart Button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(reward.id);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
                      >
                        {isFavorite ? (
                          <svg
                            className="w-5 h-5 text-[#FF3B30]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Low Stock Badge */}
                      {isLowStock && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-[#FFB800] rounded-lg shadow-md">
                          <p className="text-[#1C1C1E] text-xs font-bold">
                            {stockLeft} Stocks Left
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-3 cursor-pointer" onClick={() => handleViewDetails(reward)}>
                      {/* Price Badge */}
                      <div className="inline-block px-3 py-1 bg-[#007AFF] rounded-lg shadow-sm mb-2">
                        <span className="text-white font-bold text-sm">
                          {reward.points_required} KP
                        </span>
                      </div>

                      {/* Stock Info */}
                      {isLowStock && (
                        <p className="text-xs text-[#FF9528] font-medium mb-1">
                          {stockLeft} Stocks Left
                        </p>
                      )}

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map(star => (
                            <svg
                              key={star}
                              className="w-3 h-3 text-[#FF9528]"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">(201)</span>
                      </div>

                      {/* Product Name */}
                      <h3 className="font-medium text-sm text-[#1C1C1E] line-clamp-2 leading-tight">
                        {reward.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showRedeemModal && selectedReward && (
        <RewardModal3D
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
