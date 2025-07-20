import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { supabase } from 'src/boot/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from 'src/types/supabase';
import { ErrorHandler } from 'src/utils/error-handler';
import { authLogger } from 'src/utils/logger';
import { monitoringService } from 'src/services/monitoring';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const userProfile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const initialized = ref(false);

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value);
  const userEmail = computed(() => user.value?.email);
  const clinicId = computed(() => {
    const id = userProfile.value?.clinic_id;
    console.log('clinicId computed - userProfile:', userProfile.value);
    console.log('clinicId computed - returning:', id);
    return id;
  });

  // Helper function to check and clear old demo data
  const checkAndClearOldDemoData = () => {
    const savedProfile = localStorage.getItem('medstock_auth_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.clinic_id === 'demo-clinic-id') {
          authLogger.warn(
            'Detected old demo data with clinic_id="demo-clinic-id", clearing localStorage'
          );
          clearAuthData();
          return true; // Indicates old data was cleared
        }
      } catch (e) {
        authLogger.warn('Error parsing saved profile, clearing localStorage');
        clearAuthData();
        return true;
      }
    }
    return false;
  };

  // Actions
  const initialize = async () => {
    if (initialized.value) return;

    loading.value = true;
    try {
      authLogger.info('Initializing authentication store');

      // Check for and clear old demo data first
      const wasOldDataCleared = checkAndClearOldDemoData();

      // First check localStorage for persisted session
      const savedSession = localStorage.getItem('medstock_auth_session');
      const savedUser = localStorage.getItem('medstock_auth_user');
      const savedProfile = localStorage.getItem('medstock_auth_profile');

      if (savedSession && savedUser && !wasOldDataCleared) {
        try {
          session.value = JSON.parse(savedSession);
          user.value = JSON.parse(savedUser);
          if (savedProfile) {
            userProfile.value = JSON.parse(savedProfile);
          }
          authLogger.info('Restored session from localStorage');

          // Set user context for monitoring
          if (user.value) {
            monitoringService.setUserContext({
              id: user.value.id,
              ...(user.value.email && { email: user.value.email }),
            });
          }
        } catch (e) {
          authLogger.warn('Corrupted localStorage data, clearing');
          // Clear corrupted localStorage data
          clearAuthData();
        }
      }

      // If no localStorage session, check Supabase
      if (!session.value) {
        authLogger.info('No localStorage session, checking Supabase');
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession) {
          authLogger.info('Found Supabase session');
          await setAuthData(initialSession);
        } else {
          authLogger.info('No active session found');
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        authLogger.info('Auth state changed', { event });

        if (event === 'SIGNED_IN' && newSession) {
          await setAuthData(newSession);
          monitoringService.trackEvent('auth_state_change', {
            event: 'signed_in',
          });
        } else if (event === 'SIGNED_OUT') {
          clearAuthData();
          monitoringService.trackEvent('auth_state_change', {
            event: 'signed_out',
          });
        }
      });

      initialized.value = true;
      authLogger.info('Authentication store initialized successfully');
    } catch (error) {
      authLogger.error('Failed to initialize auth store', error as Error);
      monitoringService.captureError(error as Error, {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      ErrorHandler.handle(error as Error, 'Auth Initialization');
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      authLogger.info('Starting login process', { email });

      // Demo mode - bypass Supabase for demo account
      if (email === 'demo@medstock-pro.com' && password === 'demo123') {
        authLogger.info('Demo login detected');
        await setDemoAuthData();
        monitoringService.trackEvent('login_success', { method: 'demo' });
        return { success: true };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        authLogger.warn('Login failed', { email, error: error.message });
        monitoringService.trackEvent('login_failed', {
          email,
          error: error.message,
          method: 'supabase',
        });
        throw error;
      }

      if (data.session) {
        authLogger.info('Login successful', { userId: data.session.user.id });
        await setAuthData(data.session);
        monitoringService.trackEvent('login_success', { method: 'supabase' });
      }

      return { success: true };
    } catch (error: any) {
      authLogger.error('Login error', error);
      monitoringService.captureError(error, {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error: ErrorHandler.getErrorMessage(error),
      };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      authLogger.info('Starting logout process');
      const { error } = await supabase.auth.signOut();
      if (error) {
        authLogger.error('Logout error', error);
        throw error;
      }

      authLogger.info('Logout successful');
      clearAuthData();
      monitoringService.trackEvent('logout_success');
      return { success: true };
    } catch (error: any) {
      authLogger.error('Logout failed', error);
      monitoringService.captureError(error, {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      return {
        success: false,
        error: ErrorHandler.getErrorMessage(error),
      };
    } finally {
      loading.value = false;
    }
  };

  const setAuthData = async (newSession: Session) => {
    session.value = newSession;
    user.value = newSession.user;

    // Set user context for monitoring
    monitoringService.setUserContext({
      id: newSession.user.id,
      ...(newSession.user.email && { email: newSession.user.email }),
    });

    // Persist to localStorage for page reload persistence
    localStorage.setItem('medstock_auth_session', JSON.stringify(newSession));
    localStorage.setItem('medstock_auth_user', JSON.stringify(newSession.user));

    // Fetch user profile
    if (newSession.user) {
      await fetchUserProfile(newSession.user.id);
    }
  };

  const clearAuthData = () => {
    user.value = null;
    session.value = null;
    userProfile.value = null;

    // Clear localStorage
    localStorage.removeItem('medstock_auth_session');
    localStorage.removeItem('medstock_auth_user');
    localStorage.removeItem('medstock_auth_profile');
  };

  const setDemoAuthData = async () => {
    // Use the actual practice UUID from the database
    const demoPracticeId = '550e8400-e29b-41d4-a716-446655440000';
    const demoUserId = '550e8400-e29b-41d4-a716-446655440001';

    // Create mock session for demo
    const mockUser = {
      id: demoUserId,
      email: 'demo@medstock-pro.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { full_name: 'Demo User' },
      aud: 'authenticated',
      confirmation_sent_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      role: 'authenticated',
      phone: '',
      phone_confirmed_at: undefined,
      recovery_sent_at: undefined,
      email_change_sent_at: undefined,
      new_email: undefined,
      invited_at: undefined,
      action_link: undefined,
      email_change: undefined,
      phone_change: undefined,
      is_anonymous: false,
    };

    const mockSession = {
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: mockUser,
    };

    user.value = mockUser as any;
    session.value = mockSession as any;

    // Set demo user profile with actual database practice ID
    userProfile.value = {
      id: demoUserId,
      clinic_id: demoPracticeId,
      email: 'demo@medstock-pro.com',
      full_name: 'Demo User',
      role: 'admin',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Persist demo data to localStorage
    localStorage.setItem('medstock_auth_session', JSON.stringify(mockSession));
    localStorage.setItem('medstock_auth_user', JSON.stringify(mockUser));
    localStorage.setItem(
      'medstock_auth_profile',
      JSON.stringify(userProfile.value)
    );
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      // For demo user, use the hardcoded demo profile
      if (userId === '550e8400-e29b-41d4-a716-446655440001') {
        userProfile.value = {
          id: userId,
          clinic_id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'demo@medstock-pro.com',
          full_name: 'Demo User',
          role: 'owner',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(
          'medstock_auth_profile',
          JSON.stringify(userProfile.value)
        );
        return;
      }

      // For real users, get practice membership data
      const { data, error } = await supabase
        .from('practice_members')
        .select(
          `
          *,
          practices:practice_id (*)
        `
        )
        .eq('user_id', userId)
        .single();

      if (error) {
        authLogger.warn('No practice membership found for user', {
          userId,
          error: error.message,
        });
        // Create a basic profile without clinic_id for users not yet assigned to a practice
        userProfile.value = {
          id: userId,
          clinic_id: null,
          email: user.value?.email || '',
          full_name: user.value?.user_metadata?.full_name || 'User',
          role: 'member',
          avatar_url: user.value?.user_metadata?.avatar_url || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(
          'medstock_auth_profile',
          JSON.stringify(userProfile.value)
        );
        return;
      }

      // Create user profile from practice membership
      userProfile.value = {
        id: userId,
        clinic_id: data.practice_id,
        email: user.value?.email || '',
        full_name: user.value?.user_metadata?.full_name || 'User',
        role: data.role,
        avatar_url: user.value?.user_metadata?.avatar_url || null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
      };

      // Persist user profile to localStorage
      localStorage.setItem(
        'medstock_auth_profile',
        JSON.stringify(userProfile.value)
      );
    } catch (error) {
      authLogger.error('Error fetching user profile', error as Error);
      ErrorHandler.handle(error as Error, 'Fetch User Profile');
    }
  };

  return {
    // State
    user: readonly(user),
    session: readonly(session),
    userProfile: readonly(userProfile),
    loading: readonly(loading),
    initialized: readonly(initialized),

    // Getters
    isAuthenticated,
    userEmail,
    clinicId,

    // Actions
    initialize,
    login,
    logout,
    fetchUserProfile,
  };
});
