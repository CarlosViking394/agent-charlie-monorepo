import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { AuthenticationError } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // Require authentication
  requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      
      if (!token) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'MISSING_TOKEN'
        });
      }

      const user = await this.authService.verifyToken(token);
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ 
        error: 'Authentication failed',
        code: 'AUTH_FAILED'
      });
    }
  };

  // Optional authentication (user data if available)
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const token = this.extractToken(req);
      
      if (token) {
        const user = await this.authService.verifyToken(token);
        if (user) {
          req.user = user;
        }
      }
      
      next();
    } catch (error) {
      console.error('Optional auth error:', error);
      // Continue without user data
      next();
    }
  };

  // Rate limiting per user
  rateLimitByUser = (maxRequests: number = 100, windowMs: number = 60000) => {
    const userRequests = new Map<string, { count: number; resetTime: number }>();

    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const userId = req.user?.id || req.ip;
      const now = Date.now();
      
      const userLimit = userRequests.get(userId);
      
      if (!userLimit || now > userLimit.resetTime) {
        userRequests.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }
      
      if (userLimit.count >= maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          resetTime: new Date(userLimit.resetTime).toISOString()
        });
      }
      
      userLimit.count++;
      next();
    };
  };

  // Extract JWT token from request
  private extractToken(req: Request): string | null {
    // Try Authorization header first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Try cookie
    const cookieToken = req.cookies?.auth_token;
    if (cookieToken) {
      return cookieToken;
    }

    // Try query parameter (less secure, for development)
    const queryToken = req.query.token as string;
    if (queryToken) {
      return queryToken;
    }

    return null;
  }

  // Device fingerprinting
  getDeviceInfo(req: Request): DeviceInfo {
    const userAgent = req.headers['user-agent'] || '';
    
    return {
      platform: this.extractPlatform(userAgent),
      browser: this.extractBrowser(userAgent),
      version: this.extractVersion(userAgent),
      isMobile: this.isMobileDevice(userAgent)
    };
  }

  private extractPlatform(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('iPhone')) return 'iOS';
    if (userAgent.includes('Android')) return 'Android';
    return 'Unknown';
  }

  private extractBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private extractVersion(userAgent: string): string {
    const versionMatch = userAgent.match(/(?:Chrome|Firefox|Safari|Edge|Opera)\/([0-9.]+)/);
    return versionMatch ? versionMatch[1] : 'Unknown';
  }

  private isMobileDevice(userAgent: string): boolean {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }
}

export const authMiddleware = new AuthMiddleware();
