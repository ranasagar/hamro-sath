import { useCallback, useState } from 'react';
import { api } from '../services/api';
import { RewardRating } from '../types';

export interface SubmitRatingData {
  reward_id: number;
  rating: number;
  review?: string;
}

export const useRatings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitRating = useCallback(async (data: SubmitRatingData): Promise<RewardRating | null> => {
    setLoading(true);
    setError(null);

    try {
      // Try API first
      const response = (await api.post('/api/v1/rewards/ratings', data)) as {
        data?: { data?: RewardRating };
      };
      setLoading(false);
      return response.data?.data || null;
    } catch {
      // Fallback to localStorage
      const mockRating: RewardRating = {
        id: Date.now(),
        reward_id: data.reward_id,
        user_id: 1,
        user_name: localStorage.getItem('current_user_name') || 'Anonymous',
        user_avatar: localStorage.getItem('current_user_avatar') || '/avatars/default.png',
        rating: data.rating,
        review: data.review,
        created_at: new Date().toISOString(),
      };

      const existingRatings = JSON.parse(localStorage.getItem('reward_ratings') || '[]');
      const updatedRatings = [...existingRatings, mockRating];
      localStorage.setItem('reward_ratings', JSON.stringify(updatedRatings));

      setLoading(false);
      return mockRating;
    }
  }, []);

  const getRatingsForReward = useCallback(async (rewardId: number): Promise<RewardRating[]> => {
    setLoading(true);
    setError(null);

    try {
      const response = (await api.get(`/api/v1/rewards/${rewardId}/ratings`)) as {
        data?: { data?: RewardRating[] };
      };
      setLoading(false);
      return response.data?.data || [];
    } catch {
      const existingRatings = JSON.parse(localStorage.getItem('reward_ratings') || '[]');
      const rewardRatings = existingRatings.filter((r: RewardRating) => r.reward_id === rewardId);
      setLoading(false);
      return rewardRatings;
    }
  }, []);

  const getAverageRating = useCallback(
    async (rewardId: number): Promise<{ average: number; count: number }> => {
      const ratings = await getRatingsForReward(rewardId);

      if (ratings.length === 0) {
        return { average: 0, count: 0 };
      }

      const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
      const average = sum / ratings.length;

      return { average, count: ratings.length };
    },
    [getRatingsForReward]
  );

  return {
    loading,
    error,
    submitRating,
    getRatingsForReward,
    getAverageRating,
  };
};
