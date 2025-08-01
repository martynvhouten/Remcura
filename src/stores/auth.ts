import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { supabase } from '@/boot/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { UserProfile } from '@/types/supabase';
import { ErrorHandler } from '@/utils/service-error-handler';
import { authLogger } from '@/utils/logger';
import { monitoringService } from '@/services/monitoring';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';

export const useAuthStore = defineStore('auth', () => {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('auth-store');

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
    return id;
  });

  const selectedPractice = computed(() => {
    if (!userProfile.value?.clinic_id) return null;
    return {
      id: userProfile.value.clinic_id,
      name: userProfile.value.full_name || 'Practice',
    };
  });

  // Helper function to check and clear old demo data
  const checkAndClearOldDemoData = () => {
    const savedProfile = localStorage.getItem('remcura_auth_profile');
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
          const savedSession = localStorage.getItem('remcura_auth_session');
    const savedUser = localStorage.getItem('remcura_auth_user');
    const savedProfile = localStorage.getItem('remcura_auth_profile');

      if (savedSession && savedUser && !wasOldDataCleared) {
        try {
          const parsedSession = JSON.parse(savedSession);
          
          // CRITICAL: Set the session in Supabase client first
          // This ensures RLS policies work correctly
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token
          });
          
          if (sessionError) {
            authLogger.warn('Failed to restore session in Supabase client:', sessionError);
            clearAuthData();
          } else {
            // Only set local state if Supabase session was successful
            session.value = parsedSession;
            user.value = JSON.parse(savedUser);
            if (savedProfile) {
              userProfile.value = JSON.parse(savedProfile);
            }
            authLogger.info('Restored session from localStorage and updated Supabase client');

            // CRITICAL: Fetch profile AFTER setting Supabase session
            if (user.value) {
              await fetchUserProfile(user.value.id);
              
              // Set user context for monitoring
              monitoringService.setUserContext({
                id: user.value.id,
                ...(user.value.email && { email: user.value.email }),
              });
            }
            
            // Emit login event after everything is properly configured
            await eventEmitter.emit(StoreEvents.USER_LOGGED_IN, {
              user: user.value,
              profile: userProfile.value,
              clinicId: clinicId.value,
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
          await setAuthData(initialSession); // This will emit the event normally
        } else {
          authLogger.info('No active session found');
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        authLogger.info('Auth state changed', { event });

        if (event === 'SIGNED_IN' && newSession && !session.value) {
          // Only set auth data if we don't already have a session to prevent duplicates
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

      // Demo mode - use real Supabase auth for demo account but log it specially
      if (email === 'demo@remcura.com' && password === 'demo123') {
        authLogger.info('Demo login detected - using real Supabase auth for RLS compatibility');
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
      const result = await ErrorHandler.handleError(error, {
        service: 'auth',
        operation: 'login',
        userId: email, // Using email as identifier for failed login
        metadata: { email }
      }, {
        showToUser: false, // Let the UI handle showing login errors
        logLevel: 'error'
      });

      return {
        success: false,
        error: result.userMessage,
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
      const result = await ErrorHandler.handleError(error, {
        service: 'auth',
        operation: 'logout',
        userId: user.value?.id,
        metadata: {}
      }, {
        showToUser: false, // Let the UI handle logout errors
        logLevel: 'warn' // Logout errors are less critical
      });

      return {
        success: false,
        error: result.userMessage,
      };
    } finally {
      loading.value = false;
    }
  };

  const setAuthData = async (newSession: Session, skipEvent = false) => {
    session.value = newSession;
    user.value = newSession.user;

    // Set user context for monitoring
    monitoringService.setUserContext({
      id: newSession.user.id,
      ...(newSession.user.email && { email: newSession.user.email }),
    });

    // Persist to localStorage for page reload persistence
          localStorage.setItem('remcura_auth_session', JSON.stringify(newSession));
      localStorage.setItem('remcura_auth_user', JSON.stringify(newSession.user));

    // Fetch user profile
    if (newSession.user) {
      await fetchUserProfile(newSession.user.id);
    }

    // Only emit login event if not skipped (to prevent duplicate events)
    if (!skipEvent) {
      await eventEmitter.emit(StoreEvents.USER_LOGGED_IN, {
        user: newSession.user,
        profile: userProfile.value,
        clinicId: clinicId.value,
      });
    }
  };

  const clearAuthData = () => {
    const wasAuthenticated = !!user.value;
    
    user.value = null;
    session.value = null;
    userProfile.value = null;

    // Clear localStorage
    localStorage.removeItem('remcura_auth_session');
    localStorage.removeItem('remcura_auth_user');
    localStorage.removeItem('remcura_auth_profile');

    // Emit logout event only if user was previously authenticated
    if (wasAuthenticated) {
      eventEmitter.emit(StoreEvents.USER_LOGGED_OUT, {
        timestamp: new Date().toISOString(),
      });
    }
  };

  const setDemoAuthData = async () => {
    // Use the actual practice UUID from the database
    const demoPracticeId = '550e8400-e29b-41d4-a716-446655440000';
    const demoUserId = '550e8400-e29b-41d4-a716-446655440001';

    // Create mock session for demo
    const mockUser = {
      id: demoUserId,
      email: 'demo@remcura.com',
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
      email: 'demo@remcura.com',
      full_name: 'Demo User',
      role: 'admin',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Persist demo data to localStorage
          localStorage.setItem('remcura_auth_session', JSON.stringify(mockSession));
            localStorage.setItem('remcura_auth_user', JSON.stringify(mockUser));
      localStorage.setItem(
        'remcura_auth_profile',
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
          email: 'demo@remcura.com',
          full_name: 'Demo User',
          role: 'owner',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(
          'remcura_auth_profile',
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
          'remcura_auth_profile',
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
        'remcura_auth_profile',
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
    selectedPractice,

    // Actions
    initialize,
    login,
    logout,
    fetchUserProfile,
  };
});
