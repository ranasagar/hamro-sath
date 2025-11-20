import { useCallback, useEffect, useState } from 'react';
import { advancedFeaturesAPI } from '../api/advancedFeatures';
import type {
  CarbonChallenge,
  CarbonStats,
  EcoBrand,
  EcoPurchase,
  LeaderboardEntry,
  LogCarbonActivityRequest,
  LogTransportRequest,
  PurchaseEcoProductRequest,
  RecommendedAction,
  SajhaBusInfo,
  TransportReward,
} from '../types/advancedFeatures';

interface UseCarbonFootprintReturn {
  stats: CarbonStats | null;
  loading: boolean;
  error: string | null;
  logActivity: (request: LogCarbonActivityRequest) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

/**
 * Hook for managing carbon footprint tracking
 */
export const useCarbonFootprint = (): UseCarbonFootprintReturn => {
  const [stats, setStats] = useState<CarbonStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getCarbonStats();
      setStats(data);

      // Cache for 5 minutes
      localStorage.setItem(
        'carbon-stats',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch carbon stats');
      console.error('Error fetching carbon stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const logActivity = useCallback(
    async (request: LogCarbonActivityRequest): Promise<boolean> => {
      try {
        await advancedFeaturesAPI.logCarbonActivity(request);
        await refreshStats();
        return true;
      } catch (err) {
        console.error('Error logging carbon activity:', err);
        return false;
      }
    },
    [refreshStats]
  );

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('carbon-stats');
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
    logActivity,
    refreshStats,
  };
};

interface UseTransportReturn {
  loading: boolean;
  error: string | null;
  logTransport: (request: LogTransportRequest) => Promise<TransportReward | null>;
  leaderboard: LeaderboardEntry[];
  loadLeaderboard: () => Promise<void>;
}

/**
 * Hook for transport tracking with Sajha bus bonus
 */
export const useTransport = (): UseTransportReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const logTransport = useCallback(
    async (request: LogTransportRequest): Promise<TransportReward | null> => {
      try {
        setLoading(true);
        setError(null);
        const reward = await advancedFeaturesAPI.logTransport(request);
        return reward;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to log transport');
        console.error('Error logging transport:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadLeaderboard = useCallback(async () => {
    try {
      const data = await advancedFeaturesAPI.getTransportLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading transport leaderboard:', err);
    }
  }, []);

  return {
    loading,
    error,
    logTransport,
    leaderboard,
    loadLeaderboard,
  };
};

interface UseEcoBrandsReturn {
  brands: EcoBrand[];
  loading: boolean;
  error: string | null;
  purchaseProduct: (request: PurchaseEcoProductRequest) => Promise<EcoPurchase | null>;
}

/**
 * Hook for eco-friendly brands and purchases
 */
export const useEcoBrands = (): UseEcoBrandsReturn => {
  const [brands, setBrands] = useState<EcoBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getEcoBrands();
      setBrands(data);

      // Cache for 30 minutes
      localStorage.setItem(
        'eco-brands',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch eco brands');
      console.error('Error fetching eco brands:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const purchaseProduct = useCallback(
    async (request: PurchaseEcoProductRequest): Promise<EcoPurchase | null> => {
      try {
        const purchase = await advancedFeaturesAPI.purchaseEcoProduct(request);
        return purchase;
      } catch (err) {
        console.error('Error purchasing eco product:', err);
        return null;
      }
    },
    []
  );

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('eco-brands');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 30 minutes old
      if (age < 30 * 60 * 1000) {
        setBrands(data);
        setLoading(false);
        return;
      }
    }

    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    purchaseProduct,
  };
};

interface UseRecommendationsReturn {
  recommendations: RecommendedAction[];
  loading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
}

/**
 * Hook for personalized sustainability recommendations
 */
export const useRecommendations = (): UseRecommendationsReturn => {
  const [recommendations, setRecommendations] = useState<RecommendedAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getRecommendations();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRecommendations = useCallback(async () => {
    await fetchRecommendations();
  }, [fetchRecommendations]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return {
    recommendations,
    loading,
    error,
    refreshRecommendations,
  };
};

interface UseSajhaBusReturn {
  info: SajhaBusInfo | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for Sajha bus information
 */
export const useSajhaBus = (): UseSajhaBusReturn => {
  const [info, setInfo] = useState<SajhaBusInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await advancedFeaturesAPI.getSajhaBusInfo();
        setInfo(data);

        // Cache for 1 hour
        localStorage.setItem(
          'sajha-bus-info',
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Sajha bus info');
        console.error('Error fetching Sajha bus info:', err);
      } finally {
        setLoading(false);
      }
    };

    // Try to load from cache first
    const cached = localStorage.getItem('sajha-bus-info');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 1 hour old
      if (age < 60 * 60 * 1000) {
        setInfo(data);
        setLoading(false);
        return;
      }
    }

    fetchInfo();
  }, []);

  return {
    info,
    loading,
    error,
  };
};

interface UseCarbonChallengesReturn {
  challenges: CarbonChallenge[];
  loading: boolean;
  error: string | null;
  refreshChallenges: () => Promise<void>;
}

/**
 * Hook for carbon challenges
 */
export const useCarbonChallenges = (): UseCarbonChallengesReturn => {
  const [challenges, setChallenges] = useState<CarbonChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getCarbonChallenges();
      setChallenges(data);

      // Cache for 1 hour
      localStorage.setItem(
        'carbon-challenges',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch challenges');
      console.error('Error fetching carbon challenges:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshChallenges = useCallback(async () => {
    await fetchChallenges();
  }, [fetchChallenges]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('carbon-challenges');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 1 hour old
      if (age < 60 * 60 * 1000) {
        setChallenges(data);
        setLoading(false);
        return;
      }
    }

    fetchChallenges();
  }, [fetchChallenges]);

  return {
    challenges,
    loading,
    error,
    refreshChallenges,
  };
};
