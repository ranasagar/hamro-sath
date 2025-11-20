import { API_ENDPOINTS } from '../config';
import { apiClient } from './api';

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  username: string;
  fullName: string;
  wardId?: number;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  ward_id: number | null;
  avatar_url: string | null;
  role: 'citizen' | 'volunteer' | 'admin' | 'mayor';
  is_verified: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  phone: string | null;
  stats?: {
    total_points: number;
    issues_reported: number;
    issues_resolved: number;
    recycle_count: number;
    recycle_weight_kg: number;
    volunteer_hours: number;
    current_streak: number;
    longest_streak: number;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.REGISTER, data);

    // Store tokens
    apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken);

    return response;
  }
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_ENDPOINTS.LOGIN, credentials);

    // Store tokens
    apiClient.setTokens(response.tokens.accessToken, response.tokens.refreshToken);

    return response;
  }
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT);
    } finally {
      // Always clear tokens, even if API call fails
      apiClient.clearTokens();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = apiClient.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ accessToken: string }>(API_ENDPOINTS.REFRESH_TOKEN, {
      refreshToken,
    });

    // Store new access token
    apiClient.setAccessToken(response.accessToken);

    return response.accessToken;
  }

  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<any>(API_ENDPOINTS.GET_PROFILE);
    // Mock server returns { success: true, data: { user data } }
    const userData = response.data || response.user || response;

    if (!userData || !userData.id) {
      throw new Error('Invalid profile data received');
    }

    // Normalize the response to UserProfile format
    return {
      id: userData.id,
      email: userData.email,
      username: userData.username,
      full_name: userData.full_name,
      ward_id: userData.ward_id,
      avatar_url: userData.avatar_url,
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
    };
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return apiClient.put<UserProfile>(API_ENDPOINTS.UPDATE_PROFILE, data);
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  getAccessToken(): string | null {
    return apiClient.getAccessToken();
  }

  clearTokens(): void {
    apiClient.clearTokens();
  }
}

export const authService = new AuthService();
