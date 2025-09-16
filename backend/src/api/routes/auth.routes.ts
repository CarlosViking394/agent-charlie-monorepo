import { Router, Request, Response } from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcryptjs';
import { AuthService } from '../../services/auth/auth.service';
import { authMiddleware, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AuthProvider, AuthenticationError } from '../../types';

const router = Router();
const authService = new AuthService();

// Configure Passport strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const deviceInfo = {
      platform: 'web',
      browser: 'unknown',
      version: '1.0.0',
      isMobile: false
    };

    const result = await authService.handleOAuthCallback(
      AuthProvider.GOOGLE,
      accessToken,
      deviceInfo,
      '0.0.0.0', // Will be set from request
      'OAuth'
    );

    return done(null, result);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const deviceInfo = {
      platform: 'web',
      browser: 'unknown', 
      version: '1.0.0',
      isMobile: false
    };

    const result = await authService.handleOAuthCallback(
      AuthProvider.GITHUB,
      accessToken,
      deviceInfo,
      '0.0.0.0',
      'OAuth'
    );

    return done(null, result);
  } catch (error) {
    return done(error, null);
  }
}));

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!
}, async (payload, done) => {
  try {
    const user = await authService.verifyToken(payload.accessToken);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

// Auth Routes

// Get available auth providers
router.get('/providers', (req: Request, res: Response) => {
  res.json({
    providers: [
      { 
        id: 'google', 
        name: 'Google',
        icon: '🔍',
        url: authService.getOAuthURL(AuthProvider.GOOGLE, req.query.redirect as string || '/') 
      },
      { 
        id: 'github', 
        name: 'GitHub',
        icon: '🐙',
        url: authService.getOAuthURL(AuthProvider.GITHUB, req.query.redirect as string || '/') 
      },
      { 
        id: 'microsoft', 
        name: 'Microsoft',
        icon: '🪟',
        url: authService.getOAuthURL(AuthProvider.MICROSOFT, req.query.redirect as string || '/') 
      },
      { 
        id: 'apple', 
        name: 'Apple',
        icon: '🍎',
        url: authService.getOAuthURL(AuthProvider.APPLE, req.query.redirect as string || '/') 
      }
    ]
  });
});

// Email/Password sign up
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password, and name are required'
      });
    }

    const deviceInfo = authMiddleware.getDeviceInfo(req);
    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';

    const result = await authService.signUpWithEmail(
      email, 
      password, 
      name,
      deviceInfo,
      ipAddress,
      userAgent
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', result.token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax'
    });

    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatar: result.user.avatar
      },
      session: {
        id: result.session.id,
        expiresAt: result.token.expiresAt
      }
    });
  } catch (error) {
    console.error('Sign-up error:', error);
    
    if (error instanceof AuthenticationError) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Email/Password sign in
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    const deviceInfo = authMiddleware.getDeviceInfo(req);
    const ipAddress = req.ip || '0.0.0.0';
    const userAgent = req.headers['user-agent'] || '';

    const result = await authService.signInWithEmail(
      email,
      password,
      deviceInfo,
      ipAddress,
      userAgent
    );

    // Set HTTP-only cookie
    res.cookie('auth_token', result.token.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatar: result.user.avatar
      },
      session: {
        id: result.session.id,
        expiresAt: result.token.expiresAt
      }
    });
  } catch (error) {
    console.error('Sign-in error:', error);
    
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// OAuth Routes
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req: Request, res: Response) => {
    try {
      const result = req.user as any;
      
      res.cookie('auth_token', result.token.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });

      res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

router.get('/github', passport.authenticate('github', { 
  scope: ['user:email'] 
}));

router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/login?error=oauth_failed' }),
  async (req: Request, res: Response) => {
    try {
      const result = req.user as any;
      
      res.cookie('auth_token', result.token.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });

      res.redirect(`${process.env.FRONTEND_URL}/?auth=success`);
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

// Sign out
router.post('/signout', authMiddleware.requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.session?.id) {
      await authService.signOut(req.session.id);
    }

    res.clearCookie('auth_token');
    res.json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Sign-out error:', error);
    res.status(500).json({ error: 'Sign-out failed' });
  }
});

// Get current user
router.get('/me', authMiddleware.requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      avatar: req.user.avatar,
      preferences: req.user.preferences
    }
  });
});

// Update user preferences
router.put('/preferences', authMiddleware.requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { preferences } = req.body;
    
    // TODO: Update user preferences in database
    // For now, return success
    res.json({ 
      success: true, 
      message: 'Preferences updated',
      preferences 
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Refresh token
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const newToken = await authService.refreshToken(refreshToken);
    
    res.cookie('auth_token', newToken.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({
      success: true,
      expiresAt: newToken.expiresAt
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// Get user sessions
router.get('/sessions', authMiddleware.requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sessions = await authService.getUserSessions(req.user.id);
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to retrieve sessions' });
  }
});

export default router;

