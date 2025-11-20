import { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Challenge {
  id: number;
  title: string;
  description: string;
  ward_id: number | null;
  ward_name: string | null;
  target_points: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_by: number;
  creator_name: string;
  created_at: string;
}

interface ChallengeLeaderboardEntry {
  user_id: number;
  full_name: string;
  avatar_url: string | null;
  points_earned: number;
  rank: number;
}

interface ChallengeFilters {
  ward_id?: number;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export const useChallenges = (filters?: ChallengeFilters) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
    hasMore: false,
  });

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (filters?.ward_id) params.append('ward_id', filters.ward_id.toString());
      if (filters?.is_active !== undefined)
        params.append('is_active', filters.is_active.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await api.get<{
        challenges: Challenge[];
        pagination: { total: number; page: number; totalPages: number; hasMore: boolean };
      }>(`/api/v1/challenges?${params.toString()}`);
      setChallenges(response.challenges);
      setPagination(response.pagination);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to fetch challenges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [filters?.ward_id, filters?.is_active, filters?.page, filters?.limit]);

  return { challenges, loading, error, pagination, refetch: fetchChallenges };
};

export const useChallengeById = (challengeId: number | null) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    const fetchChallenge = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<Challenge>(`/api/v1/challenges/${challengeId}`);
        setChallenge(response);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to fetch challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [challengeId]);

  return { challenge, loading, error };
};

export const useChallengeLeaderboard = (challengeId: number | null, limit = 50) => {
  const [leaderboard, setLeaderboard] = useState<ChallengeLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) {
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get<ChallengeLeaderboardEntry[]>(
          `/api/v1/challenges/${challengeId}/leaderboard?limit=${limit}`
        );
        setLeaderboard(response);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [challengeId, limit]);

  return { leaderboard, loading, error };
};

export const createChallenge = async (data: {
  title: string;
  description: string;
  ward_id?: number | null;
  target_points: number;
  start_date: string;
  end_date: string;
}) => {
  const response = await api.post<Challenge>('/api/v1/challenges', data);
  return response;
};

export const updateChallenge = async (
  challengeId: number,
  data: Partial<{
    title: string;
    description: string;
    ward_id: number | null;
    target_points: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
  }>
) => {
  const response = await api.put<Challenge>(`/api/v1/challenges/${challengeId}`, data);
  return response;
};

export const deleteChallenge = async (challengeId: number) => {
  await api.delete(`/api/v1/challenges/${challengeId}`);
};
