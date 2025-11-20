import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

export interface Reward {
  id: number;
  name: string;
  description: string;
  category: 'merchandise' | 'coupon' | 'event' | 'service' | 'safety_kit';
  points_required: number;
  quantity_available: number;
  image_url: string;
  is_active: boolean;
  redemption_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Redemption {
  id: number;
  user_id: number;
  reward_id: number;
  points_spent: number;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
  redeemed_at: string;
  completed_at?: string;
  reward_name?: string;
  reward_description?: string;
  reward_category?: string;
  reward_image_url?: string;
}

export interface RewardFilters {
  category?: string;
  min_points?: number;
  max_points?: number;
  page?: number;
  limit?: number;
}

export interface RedeemRewardData {
  reward_id: number;
  delivery_address?: string;
  contact_phone?: string;
  notes?: string;
}

export const useRewards = (filters?: RewardFilters) => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRewards = async (customFilters?: RewardFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, ...customFilters };
      const response = await apiClient.get<{ rewards: Reward[]; total: number; page: number }>(
        '/api/v1/rewards',
        { params }
      );
      setRewards(response.rewards);
      setTotalCount(response.total);
      setCurrentPage(response.page);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rewards');
      return { rewards: [], total: 0, page: 1 };
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardById = async (id: number): Promise<Reward | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ reward: Reward }>(`/api/v1/rewards/${id}`);
      return response.reward;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch reward');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redeemReward = async (data: RedeemRewardData): Promise<Redemption | null> => {
    if (!user) {
      setError('You must be logged in to redeem rewards');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{ redemption: Redemption }>(
        '/api/v1/rewards/redeem',
        data
      );
      // Refresh rewards list to update quantities
      await fetchRewards();
      return response.redemption;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to redeem reward');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyRedemptions = async (page = 1, limit = 20) => {
    if (!user) {
      setError('You must be logged in to view redemptions');
      return { redemptions: [], total: 0, page: 1 };
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{
        redemptions: Redemption[];
        total: number;
        page: number;
      }>('/api/v1/rewards/my-redemptions', {
        params: { page, limit },
      });
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch redemptions');
      return { redemptions: [], total: 0, page: 1 };
    } finally {
      setLoading(false);
    }
  };

  const refreshRewards = () => {
    fetchRewards(filters);
  };

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    fetchRewards();
  }, [JSON.stringify(filters)]);

  return {
    rewards,
    loading,
    error,
    totalCount,
    currentPage,
    fetchRewards,
    fetchRewardById,
    redeemReward,
    fetchMyRedemptions,
    refreshRewards,
  };
};
