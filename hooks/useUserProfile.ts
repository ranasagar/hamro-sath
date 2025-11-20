import { useEffect, useState } from 'react';
import { apiClient } from '../services/api';
import { User } from '../services/auth';

export interface UserActivity {
  id: number;
  activity_type: string;
  description: string;
  points_earned: number;
  created_at: string;
  metadata?: any;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  points_reward: number;
  earned_at?: string;
}

export interface UserProfileData extends User {
  phone: string | null;
  stats: {
    total_points: number;
    issues_reported: number;
    issues_resolved: number;
    recycle_count: number;
    recycle_weight_kg: number;
    volunteer_hours: number;
    current_streak: number;
    longest_streak: number;
  };
  badges: Badge[];
}

export const useUserProfile = (userId?: number) => {
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async (id?: number) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = id ? `/api/v1/users/${id}` : '/api/v1/users/me';
      const response = await apiClient.get<{ user: UserProfileData }>(endpoint);
      const userData = response.user || response;
      if (!userData || !userData.id) {
        throw new Error('Invalid profile data received');
      }
      setProfile(userData as UserProfileData);
      return userData as UserProfileData;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      setError(errorMessage);
      setProfile(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (id?: number, limit = 20, offset = 0) => {
    try {
      const targetId = id || profile?.id;
      if (!targetId) {
        console.warn('No user ID available for fetching activities');
        return { activities: [], total: 0 };
      }
      const response = await apiClient.get<{ activities: UserActivity[]; total: number }>(
        `/api/v1/users/${targetId}/activities`,
        { params: { limit, offset } }
      );
      setActivities(response.activities || []);
      return response;
    } catch (err: unknown) {
      console.error('Failed to fetch activities:', err);
      // Don't set error state for activities - just log it
      // This prevents breaking the whole profile page
      return { activities: [], total: 0 };
    }
  };

  const updateProfile = async (data: {
    fullName?: string;
    phone?: string;
    wardId?: number;
    avatarUrl?: string;
  }) => {
    if (!profile) return null;

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<{ user: UserProfileData }>(
        `/api/v1/users/${profile.id}`,
        data
      );
      setProfile(response.user);
      return response.user;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId !== undefined) {
      fetchProfile(userId);
    }
  }, [userId]);

  return {
    profile,
    activities,
    loading,
    error,
    fetchProfile,
    fetchActivities,
    updateProfile,
  };
};
