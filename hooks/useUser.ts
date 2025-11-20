import type { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  avatar_url?: string;
  ward_id: number;
  ward_name?: string;
  points: number;
  level: number;
  total_issues_reported: number;
  total_issues_resolved: number;
  total_recycle_weight: number;
  created_at: string;
}

export interface UserActivity {
  id: number;
  type: string;
  description: string;
  points_earned: number;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: number;
  name: string;
  avatar_url?: string;
  ward_name: string;
  points: number;
  level: number;
  rank: number;
  total_issues_reported: number;
  total_issues_resolved: number;
}

export const useUser = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<any> = await apiClient.get('/api/v1/users/profile');
      setProfile(response.data.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<any> = await apiClient.put('/api/v1/users/profile', data);
      const updatedUser = response.data.data.user;
      setProfile(updatedUser);
      updateUser(updatedUser);
      return updatedUser;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async (page = 1, limit = 20) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response: AxiosResponse<any> = await apiClient.get('/api/v1/users/activities', {
        params: { page, limit }
      });
      setActivities(response.data.data.activities);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    activities,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchActivities,
  };
};

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async (wardId?: number, limit = 100) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { limit };
      if (wardId) params.ward_id = wardId;
      
      const response: AxiosResponse<any> = await apiClient.get('/api/v1/users/leaderboard', { params });
      setLeaderboard(response.data.data.leaderboard);
      return response.data.data.leaderboard;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch leaderboard');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
  };
};
