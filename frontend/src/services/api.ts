import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5678';
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook';
const ENABLE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA === 'true';

// API Client Configuration
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        
        // Handle auth errors
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}

// Create API client instance
export const apiClient = new ApiClient();

// N8N Webhook Services
export class N8NService {
  static async callWebhook(endpoint: string, data: any) {
    try {
      const response = await axios.post(`${N8N_WEBHOOK_URL}/${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds for workflows
      });
      return response.data;
    } catch (error) {
      console.error(`N8N Webhook Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Text-to-Speech webhook
  static async textToSpeech(text: string, voiceId?: string) {
    return this.callWebhook('tts', { text, voice_id: voiceId });
  }

  // Agent search workflow
  static async searchAgents(query: string, filters?: any) {
    if (ENABLE_MOCK_DATA) {
      // Return mock data in development
      console.log('Using mock data for agent search');
      return { agents: [], total: 0 };
    }
    
    return this.callWebhook('search-agents', { query, filters });
  }

  // Agent booking workflow
  static async bookAgent(agentId: string, bookingDetails: any) {
    return this.callWebhook('book-agent', { agentId, bookingDetails });
  }

  // Chat with agent workflow
  static async chatWithAgent(agentId: string, message: string, context?: any) {
    return this.callWebhook('chat', { agentId, message, context });
  }
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response utilities
export const handleApiResponse = <T>(
  response: AxiosResponse<T>,
  fallback?: T
): T => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  
  if (fallback !== undefined) {
    console.warn('API call failed, using fallback data');
    return fallback;
  }
  
  throw new ApiError(
    `API request failed with status ${response.status}`,
    response.status
  );
};

// Health check
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

export default apiClient;