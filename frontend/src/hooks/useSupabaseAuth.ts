import { useState, useEffect, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useActions } from '../store/context';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
}

interface SignUpData {
  email: string;
  password: string;
  name?: string;
}

interface SignInData {
  email: string;
  password: string;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const actions = useActions();

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        loading: false,
        error,
      }));

      // Update global state
      if (session?.user) {
        actions.user.updateProfile({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || '',
          email: session.user.email || '',
        });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        loading: false,
        error: null,
      }));

      // Update global state
      if (session?.user) {
        actions.user.updateProfile({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || '',
          email: session.user.email || '',
        });
      } else if (event === 'SIGNED_OUT') {
        actions.global.reset();
      }

      // Show notifications for auth events
      if (event === 'SIGNED_IN') {
        actions.ui.addNotification({
          id: `auth-${Date.now()}`,
          type: 'success',
          title: 'Welcome back!',
          message: 'You have been successfully signed in.',
          duration: 4000,
        });
      } else if (event === 'SIGNED_OUT') {
        actions.ui.addNotification({
          id: `auth-${Date.now()}`,
          type: 'info',
          title: 'Signed out',
          message: 'You have been signed out successfully.',
          duration: 3000,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [actions]);

  // Sign up
  const signUp = useCallback(async ({ email, password, name }: SignUpData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));

        actions.ui.addNotification({
          id: `auth-error-${Date.now()}`,
          type: 'error',
          title: 'Sign Up Failed',
          message: error.message,
          duration: 6000,
        });

        return { success: false, error };
      }

      setAuthState(prev => ({
        ...prev,
        loading: false,
        session: data.session,
        user: data.user,
      }));

      if (data.user && !data.session) {
        actions.ui.addNotification({
          id: `auth-confirm-${Date.now()}`,
          type: 'info',
          title: 'Check your email',
          message: 'Please check your email for a confirmation link to complete your sign up.',
          duration: 8000,
        });
      }

      return { success: true, data };

    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));

      actions.ui.addNotification({
        id: `auth-error-${Date.now()}`,
        type: 'error',
        title: 'Sign Up Failed',
        message: authError.message,
        duration: 6000,
      });

      return { success: false, error: authError };
    }
  }, [actions]);

  // Sign in
  const signIn = useCallback(async ({ email, password }: SignInData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));

        actions.ui.addNotification({
          id: `auth-error-${Date.now()}`,
          type: 'error',
          title: 'Sign In Failed',
          message: error.message,
          duration: 6000,
        });

        return { success: false, error };
      }

      setAuthState(prev => ({
        ...prev,
        loading: false,
        session: data.session,
        user: data.user,
      }));

      return { success: true, data };

    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));

      actions.ui.addNotification({
        id: `auth-error-${Date.now()}`,
        type: 'error',
        title: 'Sign In Failed',
        message: authError.message,
        duration: 6000,
      });

      return { success: false, error: authError };
    }
  }, [actions]);

  // Sign out
  const signOut = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false, error }));

        actions.ui.addNotification({
          id: `auth-error-${Date.now()}`,
          type: 'error',
          title: 'Sign Out Failed',
          message: error.message,
          duration: 6000,
        });

        return { success: false, error };
      }

      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });

      return { success: true };

    } catch (error) {
      const authError = error as AuthError;
      setAuthState(prev => ({ ...prev, loading: false, error: authError }));

      actions.ui.addNotification({
        id: `auth-error-${Date.now()}`,
        type: 'error',
        title: 'Sign Out Failed',
        message: authError.message,
        duration: 6000,
      });

      return { success: false, error: authError };
    }
  }, [actions]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        actions.ui.addNotification({
          id: `auth-error-${Date.now()}`,
          type: 'error',
          title: 'Password Reset Failed',
          message: error.message,
          duration: 6000,
        });

        return { success: false, error };
      }

      actions.ui.addNotification({
        id: `auth-success-${Date.now()}`,
        type: 'success',
        title: 'Password Reset Email Sent',
        message: 'Please check your email for password reset instructions.',
        duration: 8000,
      });

      return { success: true };

    } catch (error) {
      const authError = error as AuthError;

      actions.ui.addNotification({
        id: `auth-error-${Date.now()}`,
        type: 'error',
        title: 'Password Reset Failed',
        message: authError.message,
        duration: 6000,
      });

      return { success: false, error: authError };
    }
  }, [actions]);

  // Update profile
  const updateProfile = useCallback(async (updates: { name?: string; email?: string }) => {
    if (!authState.user) return { success: false, error: 'Not authenticated' };

    try {
      const { error } = await supabase.auth.updateUser({
        email: updates.email,
        data: {
          name: updates.name,
        },
      });

      if (error) {
        actions.ui.addNotification({
          id: `profile-error-${Date.now()}`,
          type: 'error',
          title: 'Profile Update Failed',
          message: error.message,
          duration: 6000,
        });

        return { success: false, error };
      }

      actions.ui.addNotification({
        id: `profile-success-${Date.now()}`,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been updated successfully.',
        duration: 4000,
      });

      return { success: true };

    } catch (error) {
      const authError = error as AuthError;

      actions.ui.addNotification({
        id: `profile-error-${Date.now()}`,
        type: 'error',
        title: 'Profile Update Failed',
        message: authError.message,
        duration: 6000,
      });

      return { success: false, error: authError };
    }
  }, [authState.user, actions]);

  return {
    // State
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: !!authState.user,

    // Actions
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };
}