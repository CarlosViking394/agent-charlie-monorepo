import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { AuthProvider, User, AuthToken, Session, DeviceInfo, AuthenticationError } from '../../types';

export class AuthService {
  private supabase;
  private jwtSecret: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE!
    );
    this.jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
  }

  // OAuth Provider URLs
  getOAuthURL(provider: AuthProvider, redirectUrl: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    switch (provider) {
      case AuthProvider.GOOGLE:
        return `${baseUrl}/auth/google?redirect=${encodeURIComponent(redirectUrl)}`;
      case AuthProvider.GITHUB:
        return `${baseUrl}/auth/github?redirect=${encodeURIComponent(redirectUrl)}`;
      case AuthProvider.MICROSOFT:
        return `${baseUrl}/auth/microsoft?redirect=${encodeURIComponent(redirectUrl)}`;
      case AuthProvider.APPLE:
        return `${baseUrl}/auth/apple?redirect=${encodeURIComponent(redirectUrl)}`;
      default:
        throw new AuthenticationError(`Unsupported provider: ${provider}`);
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(
    provider: AuthProvider, 
    code: string, 
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; token: AuthToken; session: Session }> {
    try {
      // Use Supabase Auth for OAuth handling
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: `${process.env.FRONTEND_URL}/auth/callback`
        }
      });

      if (error) {
        throw new AuthenticationError(`OAuth error: ${error.message}`, provider);
      }

      const user = await this.createOrUpdateUser({
        email: data.user?.email!,
        name: data.user?.user_metadata?.name || data.user?.email!,
        avatar: data.user?.user_metadata?.avatar_url,
        provider,
        providerId: data.user?.id!
      });

      const token = this.generateToken(user);
      const session = await this.createSession(user.id, deviceInfo, ipAddress, userAgent);

      return { user, token, session };
    } catch (error) {
      console.error(`OAuth callback error for ${provider}:`, error);
      throw error;
    }
  }

  // Email/Password Authentication
  async signInWithEmail(
    email: string, 
    password: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; token: AuthToken; session: Session }> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw new AuthenticationError(`Email auth error: ${error.message}`);
      }

      const user = await this.createOrUpdateUser({
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email!,
        provider: AuthProvider.EMAIL,
        providerId: data.user.id
      });

      const token = this.generateToken(user);
      const session = await this.createSession(user.id, deviceInfo, ipAddress, userAgent);

      return { user, token, session };
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  }

  // Sign up with email
  async signUpWithEmail(
    email: string,
    password: string,
    name: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<{ user: User; token: AuthToken; session: Session }> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });

      if (error) {
        throw new AuthenticationError(`Sign-up error: ${error.message}`);
      }

      const user = await this.createOrUpdateUser({
        email,
        name,
        provider: AuthProvider.EMAIL,
        providerId: data.user!.id
      });

      const token = this.generateToken(user);
      const session = await this.createSession(user.id, deviceInfo, ipAddress, userAgent);

      return { user, token, session };
    } catch (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = await this.getUserById(decoded.userId);
      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  // Sign out user
  async signOut(sessionId: string): Promise<void> {
    try {
      // Deactivate session
      await this.deactivateSession(sessionId);
      
      // Sign out from Supabase
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }

  // Private helper methods
  private async createOrUpdateUser(userData: {
    email: string;
    name: string;
    avatar?: string;
    provider: AuthProvider;
    providerId: string;
  }): Promise<User> {
    try {
      // Check if user exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        // Update existing user
        const { data: updatedUser } = await this.supabase
          .from('users')
          .update({
            name: userData.name,
            avatar: userData.avatar,
            last_login: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single();

        return this.mapDatabaseUserToUser(updatedUser);
      } else {
        // Create new user
        const newUser = {
          email: userData.email,
          name: userData.name,
          avatar: userData.avatar,
          provider: userData.provider,
          provider_id: userData.providerId,
          preferences: this.getDefaultPreferences(),
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          is_active: true
        };

        const { data: createdUser } = await this.supabase
          .from('users')
          .insert(newUser)
          .select()
          .single();

        return this.mapDatabaseUserToUser(createdUser);
      }
    } catch (error) {
      console.error('Create/update user error:', error);
      throw new AuthenticationError('Failed to create or update user');
    }
  }

  private generateToken(user: User): AuthToken {
    const payload = {
      userId: user.id,
      email: user.email,
      iat: Date.now()
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
    const refreshToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      scope: ['read', 'write', 'agents']
    };
  }

  private async createSession(
    userId: string,
    deviceInfo: DeviceInfo,
    ipAddress: string,
    userAgent: string
  ): Promise<Session> {
    const session = {
      user_id: userId,
      device_info: deviceInfo,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
      is_active: true
    };

    const { data: createdSession } = await this.supabase
      .from('sessions')
      .insert(session)
      .select()
      .single();

    return this.mapDatabaseSessionToSession(createdSession);
  }

  private async deactivateSession(sessionId: string): Promise<void> {
    await this.supabase
      .from('sessions')
      .update({ is_active: false })
      .eq('id', sessionId);
  }

  private async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      return user ? this.mapDatabaseUserToUser(user) : null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      return null;
    }
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      preferredAgents: [],
      communicationStyle: 'professional',
      timezone: 'UTC',
      language: 'en',
      notificationSettings: {
        email: true,
        sms: false,
        push: true
      }
    };
  }

  private mapDatabaseUserToUser(dbUser: any): User {
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      avatar: dbUser.avatar,
      provider: dbUser.provider,
      providerId: dbUser.provider_id,
      preferences: dbUser.preferences || this.getDefaultPreferences(),
      createdAt: new Date(dbUser.created_at),
      lastLogin: new Date(dbUser.last_login),
      isActive: dbUser.is_active
    };
  }

  private mapDatabaseSessionToSession(dbSession: any): Session {
    return {
      id: dbSession.id,
      userId: dbSession.user_id,
      deviceInfo: dbSession.device_info,
      ipAddress: dbSession.ip_address,
      userAgent: dbSession.user_agent,
      createdAt: new Date(dbSession.created_at),
      lastActivity: new Date(dbSession.last_activity),
      isActive: dbSession.is_active
    };
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as any;
      const user = await this.getUserById(decoded.userId);
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }

      return this.generateToken(user);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  // Get user sessions
  async getUserSessions(userId: string): Promise<Session[]> {
    const { data: sessions } = await this.supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('last_activity', { ascending: false });

    return sessions?.map(session => this.mapDatabaseSessionToSession(session)) || [];
  }
}
