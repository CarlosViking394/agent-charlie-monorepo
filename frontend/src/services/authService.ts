import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: any;
}

export interface AuthProvider {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export class AuthService {
  private static user: User | null = null;
  private static isInitialized = false;

  // Initialize auth service
  static async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      await this.checkAuthStatus();
      this.isInitialized = true;
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.isInitialized = true; // Still mark as initialized
    }
  }

  // Check if user is authenticated
  static async checkAuthStatus(): Promise<User | null> {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        withCredentials: true
      });
      
      this.user = response.data.user;
      return this.user;
    } catch (error) {
      this.user = null;
      return null;
    }
  }

  // Get available auth providers
  static async getAuthProviders(redirectUrl?: string): Promise<AuthProvider[]> {
    try {
      const response = await axios.get(`${API_URL}/auth/providers`, {
        params: { redirect: redirectUrl }
      });
      
      return response.data.providers;
    } catch (error) {
      console.error('Failed to get auth providers:', error);
      return [];
    }
  }

  // Sign up with email/password
  static async signUp(email: string, password: string, name: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        name
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        this.user = response.data.user;
        return { success: true, user: this.user };
      }
      
      return { success: false, error: 'Signup failed' };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signup failed' 
      };
    }
  }

  // Sign in with email/password
  static async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        this.user = response.data.user;
        return { success: true, user: this.user };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error: any) {
      console.error('Signin error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Signin failed' 
      };
    }
  }

  // Sign out
  static async signOut(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/signout`, {}, {
        withCredentials: true
      });
      
      this.user = null;
    } catch (error) {
      console.error('Signout error:', error);
      // Clear local state even if request fails
      this.user = null;
    }
  }

  // OAuth sign in (redirect to provider)
  static signInWithOAuth(provider: string, redirectUrl?: string): void {
    const params = redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : '';
    window.location.href = `${API_URL}/auth/${provider}${params}`;
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.user;
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return this.user !== null;
  }

  // Update user preferences
  static async updatePreferences(preferences: any): Promise<boolean> {
    try {
      const response = await axios.put(`${API_URL}/auth/preferences`, {
        preferences
      }, {
        withCredentials: true
      });

      if (response.data.success && this.user) {
        this.user.preferences = preferences;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update preferences error:', error);
      return false;
    }
  }

  // Chat with agents
  static async chatWithAgents(
    message: string, 
    conversationId?: string,
    context?: any
  ): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/api/agents/chat`, {
        message,
        conversationId,
        context
      }, {
        withCredentials: true
      });

      return response.data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  // Get available agents
  static async getAgents(): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/api/agents`, {
        withCredentials: true
      });

      return response.data.agents || [];
    } catch (error) {
      console.error('Get agents error:', error);
      return [];
    }
  }
}

export default AuthService;

