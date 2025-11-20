import React, { useState } from 'react';
import { Reward } from '../hooks/useRewards';

interface RewardModalProps {
  reward: Reward;
  userPoints: number;
  onClose: () => void;
  onRedeem: (rewardId: number, deliveryAddress?: string, contactPhone?: string) => void;
}

const RewardModal: React.FC<RewardModalProps> = ({ reward, userPoints, onClose, onRedeem }) => {
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

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

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative">
          <img 
            src={reward.image_url} 
            alt={reward.name}
            className="w-full h-64 object-cover rounded-t-xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center"
          >
            ✕
          </button>
          <div className="absolute bottom-4 left-4">
            <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
              reward.category === 'merchandise' ? 'bg-blue-500 text-white' :
              reward.category === 'coupon' ? 'bg-purple-500 text-white' :
              reward.category === 'event' ? 'bg-pink-500 text-white' :
              reward.category === 'service' ? 'bg-indigo-500 text-white' :
              'bg-red-500 text-white'
            }`}>
              {reward.category}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-brand-gray-dark mb-2">{reward.name}</h2>
          
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            <div>
              <p className="text-3xl font-bold text-brand-green">{reward.points_required} KP</p>
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
              <p className="text-sm">You need {reward.points_required - userPoints} more KP to redeem this reward.</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-600">{reward.description}</p>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Availability:</span> {reward.quantity_available} remaining
            </p>
            {reward.redemption_count !== undefined && (
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Redeemed:</span> {reward.redemption_count} times
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
  );
};

export default RewardModal;
