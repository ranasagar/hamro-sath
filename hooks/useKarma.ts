import { useCallback, useEffect, useState } from 'react';
import { advancedFeaturesAPI } from '../api/advancedFeatures';
import type {
  AwardKarmaRequest,
  KarmaRedemption,
  KarmaStats,
  KarmaTransaction,
  LeaderboardEntry,
  Partner,
  RedeemKarmaRequest,
  UserNFTBadge,
} from '../types/advancedFeatures';

interface UseKarmaReturn {
  stats: KarmaStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  awardKarma: (request: AwardKarmaRequest) => Promise<boolean>;
  checkNewBadges: () => Promise<UserNFTBadge[]>;
}

/**
 * Hook for managing user karma stats
 * Includes automatic caching and refresh capabilities
 */
export const useKarma = (): UseKarmaReturn => {
  const [stats, setStats] = useState<KarmaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getKarmaStats();
      setStats(data);

      // Cache for 5 minutes
      localStorage.setItem(
        'karma-stats',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch karma stats');
      console.error('Error fetching karma stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const awardKarma = useCallback(
    async (request: AwardKarmaRequest): Promise<boolean> => {
      try {
        await advancedFeaturesAPI.awardKarma(request);
        await refreshStats();
        return true;
      } catch (err) {
        console.error('Error awarding karma:', err);
        return false;
      }
    },
    [refreshStats]
  );

  const checkNewBadges = useCallback(async (): Promise<UserNFTBadge[]> => {
    try {
      const response = await advancedFeaturesAPI.checkNewBadges();
      if (response.newBadges.length > 0) {
        await refreshStats();
      }
      return response.newBadges;
    } catch (err) {
      console.error('Error checking new badges:', err);
      return [];
    }
  }, [refreshStats]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('karma-stats');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 5 minutes old
      if (age < 5 * 60 * 1000) {
        setStats(data);
        setLoading(false);
        return;
      }
    }

    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats,
    awardKarma,
    checkNewBadges,
  };
};

interface UseLeaderboardReturn {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refreshLeaderboard: (wardId?: number) => Promise<void>;
}

/**
 * Hook for fetching karma leaderboard
 */
export const useLeaderboard = (wardId?: number): UseLeaderboardReturn => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (filterWardId?: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getLeaderboard(filterWardId);
      setLeaderboard(data);

      // Cache for 2 minutes
      const cacheKey = `leaderboard-${filterWardId || 'all'}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshLeaderboard = useCallback(
    async (filterWardId?: number) => {
      await fetchLeaderboard(filterWardId);
    },
    [fetchLeaderboard]
  );

  useEffect(() => {
    // Try to load from cache first
    const cacheKey = `leaderboard-${wardId || 'all'}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 2 minutes old
      if (age < 2 * 60 * 1000) {
        setLeaderboard(data);
        setLoading(false);
        return;
      }
    }

    fetchLeaderboard(wardId);
  }, [wardId, fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refreshLeaderboard,
  };
};

interface UseKarmaHistoryReturn {
  history: KarmaTransaction[];
  loading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

/**
 * Hook for fetching karma transaction history with pagination
 */
export const useKarmaHistory = (limit = 20): UseKarmaHistoryReturn => {
  const [history, setHistory] = useState<KarmaTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(
    async (currentOffset: number) => {
      try {
        setLoading(true);
        setError(null);
        const data = await advancedFeaturesAPI.getKarmaHistory(limit, currentOffset);

        if (data.length < limit) {
          setHasMore(false);
        }

        setHistory(prev => (currentOffset === 0 ? data : [...prev, ...data]));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch history');
        console.error('Error fetching karma history:', err);
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const newOffset = offset + limit;
    setOffset(newOffset);
    await fetchHistory(newOffset);
  }, [hasMore, loading, offset, limit, fetchHistory]);

  useEffect(() => {
    fetchHistory(0);
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    loadMore,
    hasMore,
  };
};

interface UsePartnersReturn {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  redeemKarma: (request: RedeemKarmaRequest) => Promise<KarmaRedemption | null>;
}

/**
 * Hook for managing partner redemptions
 */
export const usePartners = (): UsePartnersReturn => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getPartners();
      setPartners(data);

      // Cache for 30 minutes
      localStorage.setItem(
        'partners',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch partners');
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const redeemKarma = useCallback(
    async (request: RedeemKarmaRequest): Promise<KarmaRedemption | null> => {
      try {
        const redemption = await advancedFeaturesAPI.redeemKarma(request);
        return redemption;
      } catch (err) {
        console.error('Error redeeming karma:', err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('partners');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 30 minutes old
      if (age < 30 * 60 * 1000) {
        setPartners(data);
        setLoading(false);
        return;
      }
    }

    fetchPartners();
  }, [fetchPartners]);

  return {
    partners,
    loading,
    error,
    redeemKarma,
  };
};

interface UseBadgesReturn {
  badges: UserNFTBadge[];
  loading: boolean;
  error: string | null;
  refreshBadges: () => Promise<void>;
}

/**
 * Hook for fetching user's NFT badges
 */
export const useBadges = (): UseBadgesReturn => {
  const [badges, setBadges] = useState<UserNFTBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getUserBadges();
      setBadges(data);

      // Cache for 10 minutes
      localStorage.setItem(
        'user-badges',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch badges');
      console.error('Error fetching badges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshBadges = useCallback(async () => {
    await fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('user-badges');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 10 minutes old
      if (age < 10 * 60 * 1000) {
        setBadges(data);
        setLoading(false);
        return;
      }
    }

    fetchBadges();
  }, [fetchBadges]);

  return {
    badges,
    loading,
    error,
    refreshBadges,
  };
};
