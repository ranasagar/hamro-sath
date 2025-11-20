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
      const response = await apiClient.get<any>(endpoint);
      // Mock server returns { success: true, data: { user data } }
      // Handle both response.data.data and response.data patterns
      const userData = response.data?.data || response.data || response.user || response;

      // Ensure we have valid user data
      if (!userData || !userData.id) {
        console.error('Invalid profile data received:', response);
        throw new Error('Invalid profile data received');
      }

      // Normalize the data structure
      const normalizedProfile: UserProfileData = {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
        avatar_url: userData.avatar_url,
        ward_id: userData.ward_id,
        karma_balance: userData.karma_balance,
        role: userData.role || 'citizen',
        is_verified: userData.is_verified || false,
        created_at: userData.created_at,
        phone: userData.phone || null,
        stats: userData.stats || {
          total_points: userData.karma_balance || 0,
          issues_reported: 0,
          issues_resolved: 0,
          recycle_count: 0,
          recycle_weight_kg: 0,
          volunteer_hours: 0,
          current_streak: 0,
          longest_streak: 0,
        },
        badges: userData.badges || [],
      };

      setProfile(normalizedProfile);
      return normalizedProfile;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      console.error('fetchProfile error:', err);
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
      const response = await apiClient.get<any>(`/api/v1/users/${targetId}/activities`, {
        params: { limit, offset },
      });
      // Handle both response.data and response.activities patterns
      const activitiesData = response.data || response.activities || [];
      setActivities(activitiesData);
      return { activities: activitiesData, total: response.total || activitiesData.length };
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
