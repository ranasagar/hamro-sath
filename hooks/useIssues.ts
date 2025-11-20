import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

export interface IssuePhoto {
  id: number;
  url: string;
  uploaded_at: string;
}

export interface IssueVolunteer {
  id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  volunteered_at: string;
}

export interface IssueUpdate {
  id: number;
  message: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
}

export interface Issue {
  id: number;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  latitude?: number;
  longitude?: number;
  ward_id: number;
  ward_name?: string;
  reporter_id: number;
  reporter_name: string;
  reporter_avatar?: string;
  upvotes_count: number;
  volunteers_count: number;
  image_url?: string;
  photos?: IssuePhoto[];
  volunteers?: IssueVolunteer[];
  updates?: IssueUpdate[];
  user_has_upvoted?: boolean;
  user_is_volunteer?: boolean;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface CreateIssueData {
  title: string;
  description: string;
  category: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  latitude?: number;
  longitude?: number;
  ward_id?: number;
  image_url?: string;
}

export interface IssueFilters {
  status?: string;
  category?: string;
  ward_id?: number;
  severity?: string;
  page?: number;
  limit?: number;
}

export const useIssues = (filters?: IssueFilters) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchIssues = async (customFilters?: IssueFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params = { ...filters, ...customFilters };
      const response = await apiClient.get<{ issues: Issue[]; total: number; page: number }>(
        '/api/v1/issues',
        { params }
      );
      setIssues(response.issues);
      setTotalCount(response.total);
      setCurrentPage(response.page);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
      return { issues: [], total: 0, page: 1 };
    } finally {
      setLoading(false);
    }
  };

  const fetchIssueById = async (id: number): Promise<Issue | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ issue: Issue }>(`/api/v1/issues/${id}`);
      return response.issue;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch issue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createIssue = async (data: CreateIssueData): Promise<Issue | null> => {
    if (!user) {
      setError('You must be logged in to report an issue');
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<{ issue: Issue }>('/api/v1/issues', data);
      // Add new issue to the beginning of the list
      setIssues(prev => [response.issue, ...prev]);
      return response.issue;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create issue');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const upvoteIssue = async (issueId: number): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to upvote');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.put(`/api/v1/issues/${issueId}/upvote`);
      
      // Optimistic update
      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId
            ? {
                ...issue,
                upvotes_count: issue.user_has_upvoted
                  ? issue.upvotes_count - 1
                  : issue.upvotes_count + 1,
                user_has_upvoted: !issue.user_has_upvoted,
              }
            : issue
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upvote issue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const volunteerForIssue = async (issueId: number): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to volunteer');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.put(`/api/v1/issues/${issueId}/volunteer`);
      
      // Optimistic update
      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId
            ? {
                ...issue,
                volunteers_count: issue.user_is_volunteer
                  ? issue.volunteers_count - 1
                  : issue.volunteers_count + 1,
                user_is_volunteer: !issue.user_is_volunteer,
              }
            : issue
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to volunteer');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateIssue = async (issueId: number, data: Partial<CreateIssueData>): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to update issues');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put<{ issue: Issue }>(`/api/v1/issues/${issueId}`, data);
      
      // Update issue in list
      setIssues(prev =>
        prev.map(issue => (issue.id === issueId ? response.issue : issue))
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update issue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resolveIssue = async (issueId: number): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to resolve issues');
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      await apiClient.put(`/api/v1/issues/${issueId}/complete`);
      
      // Update issue status in list
      setIssues(prev =>
        prev.map(issue =>
          issue.id === issueId
            ? { ...issue, status: 'resolved' as const, resolved_at: new Date().toISOString() }
            : issue
        )
      );
      return true;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resolve issue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshIssues = () => {
    fetchIssues(filters);
  };

  // Auto-fetch on mount and filter changes
  useEffect(() => {
    fetchIssues();
  }, [JSON.stringify(filters)]);

  return {
    issues,
    loading,
    error,
    totalCount,
    currentPage,
    fetchIssues,
    fetchIssueById,
    createIssue,
    upvoteIssue,
    volunteerForIssue,
    updateIssue,
    resolveIssue,
    refreshIssues,
  };
};
