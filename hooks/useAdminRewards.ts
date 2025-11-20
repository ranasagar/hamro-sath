import { useState } from 'react';
import { apiClient } from '../services/api';

export interface Reward {
  id: number;
  name: string;
  description: string;
  category: string;
  points_required: number;
  quantity_available: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdminRewards = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReward = async (data: {
    name: string;
    description: string;
    category: string;
    points_required: number;
    quantity_available?: number;
    image_url?: string;
  }): Promise<Reward | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{ reward: Reward }>('/api/v1/rewards', data);
      return response.reward;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reward');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReward = async (
    id: number,
    data: {
      name?: string;
      description?: string;
      category?: string;
      points_required?: number;
      quantity_available?: number;
      image_url?: string;
      is_active?: boolean;
    }
  ): Promise<Reward | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<{ reward: Reward }>(`/api/v1/rewards/${id}`, data);
      return response.reward;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update reward');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteReward = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/api/v1/rewards/${id}`);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete reward');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createReward,
    updateReward,
    deleteReward,
  };
};
