import React, { useEffect, useState } from 'react';
import { useRatings } from '../hooks/useRatings';
import { Reward } from '../hooks/useRewards';
import { RewardRating } from '../types';
import { StarIcon } from './Icons';

interface RewardModalProps {
  reward: Reward;
  userPoints: number;
  onClose: () => void;
  onRedeem: (rewardId: number, deliveryAddress?: string, contactPhone?: string) => void;
}

const RewardModal3D: React.FC<RewardModalProps> = ({ reward, userPoints, onClose, onRedeem }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Rating state
  const [ratings, setRatings] = useState<RewardRating[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { submitRating, getRatingsForReward, getAverageRating } = useRatings();
  const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });

  useEffect(() => {
    loadRatings();
  }, [reward.id]);

  const loadRatings = async () => {
    const ratingsData = await getRatingsForReward(reward.id);
    setRatings(ratingsData);
    const avg = await getAverageRating(reward.id);
    setAvgRating(avg);
  };

  const canAfford = userPoints >= reward.points_required;
  const needsDelivery = reward.category === 'merchandise' || reward.category === 'safety_kit';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAfford) return;

    if (needsDelivery && (!deliveryAddress.trim() || !contactPhone.trim())) {
      alert('Please provide delivery address and contact phone');
      return;
    }

    setIsRedeeming(true);
    await onRedeem(
      reward.id,
      needsDelivery ? deliveryAddress : undefined,
      needsDelivery ? contactPhone : undefined
    );
    setIsRedeeming(false);
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();

    if (userRating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmittingRating(true);

    const result = await submitRating({
      reward_id: reward.id,
      rating: userRating,
      review: userReview.trim() || undefined,
    });

    if (result) {
      await loadRatings();
      setUserRating(0);
      setUserReview('');
      alert('Thank you for your rating!');
    }

    setIsSubmittingRating(false);
  };

  const renderStars = (rating: number, interactive = false) => {
    return [...Array(5)].map((_, i) => {
      const starValue = i + 1;
      const isFilled = interactive ? (hoverRating || userRating) >= starValue : rating >= starValue;

      return (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setUserRating(starValue)}
          onMouseEnter={() => interactive && setHoverRating(starValue)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          className={`${interactive ? 'cursor-pointer transform hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <StarIcon
            className={`w-6 h-6 ${isFilled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      style={{ perspective: '1500px' }}
    >
      <div
        className="relative w-full max-w-3xl h-[90vh] max-h-[800px]"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={e => e.stopPropagation()}
      >
        {/* 3D Flip Container */}
        <div
          className="relative w-full h-full transition-transform duration-700"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT SIDE - Product Details */}
          <div
            className="absolute w-full h-full bg-white rounded-xl shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <div className="h-full overflow-y-auto">
              <div className="relative">
                <img
                  src={reward.image_url}
                  alt={reward.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all hover:scale-110"
                >
                  ✕
                </button>

                {/* Flip to Ratings Button */}
                <button
                  onClick={() => setIsFlipped(true)}
                  className="absolute bottom-4 right-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  <StarIcon className="w-5 h-5" />
                  View Ratings & Reviews
                </button>

                <div className="absolute bottom-4 left-4">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${
                      reward.category === 'merchandise'
                        ? 'bg-blue-500 text-white'
                        : reward.category === 'coupon'
                          ? 'bg-purple-500 text-white'
                          : reward.category === 'event'
                            ? 'bg-pink-500 text-white'
                            : reward.category === 'service'
                              ? 'bg-indigo-500 text-white'
                              : 'bg-red-500 text-white'
                    }`}
                  >
                    {reward.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-2xl font-bold text-brand-gray-dark">{reward.name}</h2>
                  {avgRating.count > 0 && (
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold">{avgRating.average.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({avgRating.count})</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div>
                    <p className="text-3xl font-bold text-brand-green">
                      {reward.points_required} KP
                    </p>
                    <p className="text-sm text-gray-500">Points Required</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">{userPoints} KP</p>
                    <p className="text-sm text-gray-500">Your Balance</p>
                  </div>
                </div>

                {!canAfford && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="font-semibold">Insufficient Points</p>
                    <p className="text-sm">
                      You need {reward.points_required - userPoints} more KP to redeem this reward.
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-600">{reward.description}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Availability:</span> {reward.quantity_available}{' '}
                    remaining
                  </p>
                  {reward.redemption_count !== undefined && (
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Redeemed:</span> {reward.redemption_count}{' '}
                      times
                    </p>
                  )}
                </div>

                {canAfford && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {needsDelivery && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Delivery Address *
                          </label>
                          <textarea
                            value={deliveryAddress}
                            onChange={e => setDeliveryAddress(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                            rows={3}
                            placeholder="Enter your full delivery address"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Contact Phone *
                          </label>
                          <input
                            type="tel"
                            value={contactPhone}
                            onChange={e => setContactPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isRedeeming || reward.quantity_available <= 0}
                        className="flex-1 px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isRedeeming ? 'Redeeming...' : `Redeem for ${reward.points_required} KP`}
                      </button>
                    </div>
                  </form>
                )}

                {!canAfford && (
                  <button
                    onClick={onClose}
                    className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* BACK SIDE - Ratings & Reviews */}
          <div
            className="absolute w-full h-full bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="h-full overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                <button
                  onClick={() => setIsFlipped(false)}
                  className="absolute top-4 left-4 bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ←
                </button>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center transition-all"
                >
                  ✕
                </button>
                <div className="text-center mt-8">
                  <h2 className="text-2xl font-bold mb-2">Ratings & Reviews</h2>
                  <p className="text-yellow-100">{reward.name}</p>

                  {avgRating.count > 0 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="text-4xl font-bold">{avgRating.average.toFixed(1)}</div>
                      <div>
                        <div className="flex gap-1">{renderStars(avgRating.average)}</div>
                        <div className="text-sm text-yellow-100">{avgRating.count} reviews</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Rating Form */}
              <div className="p-6 bg-white border-b">
                <h3 className="font-bold text-lg mb-4">Rate This Reward</h3>
                <form onSubmit={handleSubmitRating} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Rating *
                    </label>
                    <div className="flex gap-2">{renderStars(userRating, true)}</div>
                    {(hoverRating || userRating) > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {hoverRating || userRating} out of 5 stars
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Review (Optional)
                    </label>
                    <textarea
                      value={userReview}
                      onChange={e => setUserReview(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows={3}
                      placeholder="Share your experience with this reward..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={userRating === 0 || isSubmittingRating}
                    className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="p-6 space-y-4">
                <h3 className="font-bold text-lg">Customer Reviews ({ratings.length})</h3>

                {ratings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <StarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No reviews yet. Be the first to rate this reward!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map(rating => (
                      <div key={rating.id} className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-start gap-3">
                          <img
                            src={rating.user_avatar}
                            alt={rating.user_name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold">{rating.user_name}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(rating.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-1 mb-2">{renderStars(rating.rating)}</div>
                            {rating.review && (
                              <p className="text-gray-700 text-sm">{rating.review}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardModal3D;
