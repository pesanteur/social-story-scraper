import axios from 'axios';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  APIKey,
  APIKeyCreate,
  UserPreferences,
  UserPreferencesUpdate,
  ScrapeJob,
  Tweet,
  TrendingTopic,
  ContentIdea,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
            params: { refresh_token: refreshToken },
          });
          const { access_token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', newRefreshToken);
          error.config.headers.Authorization = `Bearer ${access_token}`;
          return api.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post('/auth/login', data);
    const { access_token, refresh_token } = response.data;
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Settings APIs
export const settingsAPI = {
  getAPIKeys: async (): Promise<APIKey[]> => {
    const response = await api.get('/settings/api-keys');
    return response.data;
  },

  createAPIKey: async (data: APIKeyCreate): Promise<APIKey> => {
    const response = await api.post('/settings/api-keys', data);
    return response.data;
  },

  deleteAPIKey: async (serviceName: string): Promise<void> => {
    await api.delete(`/settings/api-keys/${serviceName}`);
  },

  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get('/settings/preferences');
    return response.data;
  },

  updatePreferences: async (data: UserPreferencesUpdate): Promise<UserPreferences> => {
    const response = await api.put('/settings/preferences', data);
    return response.data;
  },
};

// Scrape APIs
export const scrapeAPI = {
  getScrapeJobs: async (skip = 0, limit = 20): Promise<ScrapeJob[]> => {
    const response = await api.get('/scrapes/', { params: { skip, limit } });
    return response.data;
  },

  getScrapeJob: async (jobId: string): Promise<ScrapeJob> => {
    const response = await api.get(`/scrapes/${jobId}`);
    return response.data;
  },

  createScrapeJob: async (): Promise<ScrapeJob> => {
    const response = await api.post('/scrapes/', { trigger_type: 'manual' });
    return response.data;
  },

  getJobTweets: async (jobId: string): Promise<Tweet[]> => {
    const response = await api.get(`/scrapes/${jobId}/tweets`);
    return response.data;
  },

  getJobTopics: async (jobId: string): Promise<TrendingTopic[]> => {
    const response = await api.get(`/scrapes/${jobId}/topics`);
    return response.data;
  },

  getJobIdeas: async (jobId: string): Promise<ContentIdea[]> => {
    const response = await api.get(`/scrapes/${jobId}/ideas`);
    return response.data;
  },
};

// Export APIs
export const exportAPI = {
  exportTweets: async (jobId: string): Promise<Blob> => {
    const response = await api.get(`/export/${jobId}/tweets`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportTopics: async (jobId: string): Promise<Blob> => {
    const response = await api.get(`/export/${jobId}/topics`, {
      responseType: 'blob',
    });
    return response.data;
  },

  exportIdeas: async (jobId: string): Promise<Blob> => {
    const response = await api.get(`/export/${jobId}/ideas`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default api;
