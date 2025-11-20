import { useCallback, useEffect, useState } from 'react';
import { advancedFeaturesAPI } from '../api/advancedFeatures';
import type {
  ChatbotResponse,
  CommunityProject,
  ProposeProjectRequest,
  TerrainTip,
  VoteOnProjectRequest,
  WardCleanlinessScore,
  WardDashboardData,
} from '../types/advancedFeatures';

interface UseWardScoresReturn {
  scores: WardCleanlinessScore[];
  loading: boolean;
  error: string | null;
  refreshScores: () => Promise<void>;
}

/**
 * Hook for fetching ward cleanliness scores
 */
export const useWardScores = (): UseWardScoresReturn => {
  const [scores, setScores] = useState<WardCleanlinessScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getWardScores();
      setScores(data);

      // Cache for 10 minutes
      localStorage.setItem(
        'ward-scores',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ward scores');
      console.error('Error fetching ward scores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshScores = useCallback(async () => {
    await fetchScores();
  }, [fetchScores]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('ward-scores');
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 10 minutes old
      if (age < 10 * 60 * 1000) {
        setScores(data);
        setLoading(false);
        return;
      }
    }

    fetchScores();
  }, [fetchScores]);

  return {
    scores,
    loading,
    error,
    refreshScores,
  };
};

interface UseWardDashboardReturn {
  dashboard: WardDashboardData | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
}

/**
 * Hook for fetching comprehensive ward dashboard data
 */
export const useWardDashboard = (wardId: number): UseWardDashboardReturn => {
  const [dashboard, setDashboard] = useState<WardDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getWardDashboard(wardId);
      setDashboard(data);

      // Cache for 5 minutes
      localStorage.setItem(
        `ward-dashboard-${wardId}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ward dashboard');
      console.error('Error fetching ward dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [wardId]);

  const refreshDashboard = useCallback(async () => {
    await fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem(`ward-dashboard-${wardId}`);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 5 minutes old
      if (age < 5 * 60 * 1000) {
        setDashboard(data);
        setLoading(false);
        return;
      }
    }

    fetchDashboard();
  }, [wardId, fetchDashboard]);

  return {
    dashboard,
    loading,
    error,
    refreshDashboard,
  };
};

interface UseCommunityProjectsReturn {
  projects: CommunityProject[];
  loading: boolean;
  error: string | null;
  refreshProjects: () => Promise<void>;
  proposeProject: (request: ProposeProjectRequest) => Promise<boolean>;
  voteOnProject: (request: VoteOnProjectRequest) => Promise<boolean>;
}

/**
 * Hook for managing community projects
 */
export const useCommunityProjects = (
  status?: 'proposed' | 'approved' | 'in_progress' | 'completed',
  wardId?: number
): UseCommunityProjectsReturn => {
  const [projects, setProjects] = useState<CommunityProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await advancedFeaturesAPI.getCommunityProjects(status, wardId);
      setProjects(data);

      // Cache for 3 minutes
      const cacheKey = `projects-${status || 'all'}-${wardId || 'all'}`;
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }, [status, wardId]);

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  const proposeProject = useCallback(
    async (request: ProposeProjectRequest): Promise<boolean> => {
      try {
        await advancedFeaturesAPI.proposeProject(request);
        await refreshProjects();
        return true;
      } catch (err) {
        console.error('Error proposing project:', err);
        return false;
      }
    },
    [refreshProjects]
  );

  const voteOnProject = useCallback(
    async (request: VoteOnProjectRequest): Promise<boolean> => {
      try {
        await advancedFeaturesAPI.voteOnProject(request);
        await refreshProjects();
        return true;
      } catch (err) {
        console.error('Error voting on project:', err);
        return false;
      }
    },
    [refreshProjects]
  );

  useEffect(() => {
    // Try to load from cache first
    const cacheKey = `projects-${status || 'all'}-${wardId || 'all'}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Use cache if less than 3 minutes old
      if (age < 3 * 60 * 1000) {
        setProjects(data);
        setLoading(false);
        return;
      }
    }

    fetchProjects();
  }, [status, wardId, fetchProjects]);

  return {
    projects,
    loading,
    error,
    refreshProjects,
    proposeProject,
    voteOnProject,
  };
};

interface UseChatbotReturn {
  chat: (message: string) => Promise<ChatbotResponse | null>;
  conversationId: string | null;
  loading: boolean;
  error: string | null;
  clearConversation: () => void;
}

/**
 * Hook for AI chatbot interaction
 */
export const useChatbot = (): UseChatbotReturn => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chat = useCallback(
    async (message: string): Promise<ChatbotResponse | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await advancedFeaturesAPI.chatWithBot(
          message,
          conversationId || undefined
        );
        setConversationId(response.conversationId);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        console.error('Error chatting with bot:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  const clearConversation = useCallback(() => {
    setConversationId(null);
    setError(null);
  }, []);

  return {
    chat,
    conversationId,
    loading,
    error,
    clearConversation,
  };
};

interface UseTerrainTipsReturn {
  tips: TerrainTip[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook for fetching terrain-specific tips
 */
export const useTerrainTips = (wardId: number): UseTerrainTipsReturn => {
  const [tips, setTips] = useState<TerrainTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await advancedFeaturesAPI.getTerrainTips(wardId);
        setTips(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tips');
        console.error('Error fetching terrain tips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, [wardId]);

  return {
    tips,
    loading,
    error,
  };
};
