// API Configuration
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'https://hamro-saath-backend.vercel.app';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  
  // Users
  GET_PROFILE: '/api/v1/users/profile',
  UPDATE_PROFILE: '/api/v1/users/profile',
  GET_LEADERBOARD: '/api/v1/users/leaderboard',
  
  // Issues
  GET_ISSUES: '/api/v1/issues',
  CREATE_ISSUE: '/api/v1/issues',
  GET_ISSUE: (id: number) => `/api/v1/issues/${id}`,
  UPDATE_ISSUE: (id: number) => `/api/v1/issues/${id}`,
  UPVOTE_ISSUE: (id: number) => `/api/v1/issues/${id}/upvote`,
  VOLUNTEER_ISSUE: (id: number) => `/api/v1/issues/${id}/volunteer`,
  RESOLVE_ISSUE: (id: number) => `/api/v1/issues/${id}/complete`,
  
  // Uploads
  UPLOAD_IMAGE: '/api/v1/upload',
  
  // Health
  HEALTH: '/health',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};
