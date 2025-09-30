import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import { supabase } from '@/boot/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/types';
import type { ServiceErrorContext } from '@/types/logging';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import { authLogger } from '@/utils/logger';
import { monitoringService } from '@/services/monitoring';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';

type PracticeMember = Tables<'practice_members'>;

type AuthProfileRole = PracticeMember['role'] | 'platform_owner' | 'member';

interface AuthProfile {
  id: string;
  clinic_id: string | null;
  email: string;
  full_name: string;
  role: AuthProfileRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

type ImportMetaEnvWithPlatform = ImportMetaEnv & {
  readonly VITE_PLATFORM_OWNER_EMAIL?: string;
  readonly VITE_PLATFORM_OWNER_PASSWORD?: string;
};

export const useAuthStore = defineStore('auth', () => {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('auth-store');

  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const userProfile = ref<AuthProfile | null>(null);
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
    if (!userProfile.value?.clinic_id) {
      return null;
    }
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
    if (initialized.value) {
      return;
    }

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
            refresh_token: parsedSession.refresh_token,
          });

          if (sessionError) {
            authLogger.warn(
              'Failed to restore session in Supabase client:',
              sessionError
            );
            clearAuthData();
          } else {
            // Only set local state if Supabase session was successful
            session.value = parsedSession;
            user.value = JSON.parse(savedUser);
            if (savedProfile) {
              userProfile.value = JSON.parse(savedProfile) as AuthProfile;
            }
            authLogger.info(
              'Restored session from localStorage and updated Supabase client'
            );

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
      authLogger.error('Failed to initialize auth store', {
        error: error instanceof Error ? error.message : String(error),
      });
      monitoringService.captureError(error as Error, {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
      ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'AuthStore',
          operation: 'initialize',
          metadata: { context: 'Auth Initialization' },
        },
        { rethrow: false, logLevel: 'error' }
      );
    } finally {
      loading.value = false;
    }
  };

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      authLogger.info('Starting login process', { email });

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
    } catch (error: unknown) {
      const serviceError = ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'auth',
          operation: 'login',
          metadata: { email },
        },
        {
          rethrow: false,
          logLevel: 'error',
        }
      );

      return {
        success: false,
        error: serviceError.message,
      };
    } finally {
      loading.value = false;
    }
  };

  const loginAsDemo = async () => {
    loading.value = true;
    try {
      authLogger.info('Starting demo login process');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'demo@remcura.com',
        password: 'demo123',
      });

      if (error) {
        authLogger.warn('Demo login failed', { error: error.message });
        monitoringService.trackEvent('demo_login_failed', {
          error: error.message,
          method: 'supabase',
        });
        throw error;
      }

      if (data.session) {
        authLogger.info('Demo login successful', {
          userId: data.session.user.id,
        });
        await setAuthData(data.session);
        monitoringService.trackEvent('demo_login_success', {
          method: 'supabase',
        });
      }

      return { success: true };
    } catch (error: unknown) {
      const serviceError = ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'auth',
          operation: 'loginAsDemo',
        },
        {
          rethrow: false,
          logLevel: 'error',
        }
      );

      return {
        success: false,
        error: serviceError.message,
      };
    } finally {
      loading.value = false;
    }
  };

  const loginAsOwner = async () => {
    loading.value = true;
    try {
      authLogger.info('Starting platform owner login process');

      // Use dedicated platform owner credentials from environment
      const env = import.meta.env as ImportMetaEnvWithPlatform;
      const ownerEmail = env.VITE_PLATFORM_OWNER_EMAIL || 'owner@remcura.com';
      const ownerPassword = env.VITE_PLATFORM_OWNER_PASSWORD;

      if (!ownerPassword) {
        authLogger.warn(
          'Missing VITE_PLATFORM_OWNER_PASSWORD; aborting owner login'
        );
        throw new Error('Platform owner wachtwoord ontbreekt');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: ownerEmail,
        password: ownerPassword,
      });

      if (error) {
        authLogger.warn('Platform owner login failed', {
          error: error.message,
        });
        monitoringService.trackEvent('platform_owner_login_failed', {
          error: error.message,
          method: 'supabase',
        });
        throw error;
      }

      if (data.session) {
        authLogger.info('Platform owner login successful', {
          userId: data.session.user.id,
        });

        // Set auth data; role will be derived from JWT/app_metadata in fetchUserProfile
        await setAuthData(data.session);

        monitoringService.trackEvent('platform_owner_login_success', {
          method: 'supabase',
        });
      }

      return { success: true };
    } catch (error: unknown) {
      const serviceError = ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'auth',
          operation: 'loginAsOwner',
        },
        {
          rethrow: false,
          logLevel: 'error',
        }
      );

      return {
        success: false,
        error: serviceError.message,
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
    } catch (error: unknown) {
      const context: ServiceErrorContext = {
        service: 'auth',
        operation: 'logout',
        metadata: {},
      };

      if (user.value?.id) {
        context.userId = user.value.id;
      }

      const serviceError = ServiceErrorHandler.handle(error as Error, context, {
        rethrow: false,
        logLevel: 'warn',
      });

      return {
        success: false,
        error: serviceError.message,
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

  const fetchUserProfile = async (userId: string) => {
    try {
      const currentUser = user.value;

      // Platform owner: derive from Supabase helper (preferred) or JWT/app_metadata (fallback)
      let isPlatformOwner = false;
      try {
        const { data: isPo } = await supabase.rpc('is_platform_owner');
        if (isPo === true) {
          isPlatformOwner = true;
        }
      } catch (e) {
        // ignore and fallback to app_metadata
      }
      if (!isPlatformOwner && currentUser) {
        const appMetadata = currentUser.app_metadata as Record<string, unknown>;
        const role =
          typeof appMetadata?.role === 'string' ? appMetadata.role : null;
        if (role === 'platform_owner') {
          isPlatformOwner = true;
        }
      }

      if (isPlatformOwner) {
        userProfile.value = {
          id: userId,
          clinic_id: null,
          email: currentUser?.email || '',
          full_name:
            typeof currentUser?.user_metadata?.full_name === 'string'
              ? currentUser.user_metadata.full_name
              : 'Platform Owner',
          role: 'platform_owner',
          avatar_url:
            typeof currentUser?.user_metadata?.avatar_url === 'string'
              ? currentUser.user_metadata.avatar_url
              : null,
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
        .select('practice_id, role, created_at, updated_at, joined_at')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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
          full_name:
            typeof user.value?.user_metadata?.full_name === 'string'
              ? user.value.user_metadata.full_name
              : 'User',
          role: 'member',
          avatar_url:
            typeof user.value?.user_metadata?.avatar_url === 'string'
              ? user.value.user_metadata.avatar_url
              : null,
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
        clinic_id: data?.practice_id || null,
        email: user.value?.email || '',
        full_name:
          typeof user.value?.user_metadata?.full_name === 'string'
            ? user.value.user_metadata.full_name
            : 'User',
        role: data?.role ?? 'member',
        avatar_url:
          typeof user.value?.user_metadata?.avatar_url === 'string'
            ? user.value.user_metadata.avatar_url
            : null,
        created_at: data?.created_at || new Date().toISOString(),
        updated_at: data?.updated_at || new Date().toISOString(),
      };

      // Persist user profile to localStorage
      localStorage.setItem(
        'remcura_auth_profile',
        JSON.stringify(userProfile.value)
      );
    } catch (error) {
      authLogger.error('Error fetching user profile', {
        error: error instanceof Error ? error.message : String(error),
      });
      const context: ServiceErrorContext = {
        service: 'AuthStore',
        operation: 'fetchUserProfile',
        metadata: { context: 'Fetch User Profile' },
      };

      if (user.value?.id) {
        context.userId = user.value.id;
      }

      ServiceErrorHandler.handle(error as Error, context, {
        rethrow: false,
        logLevel: 'error',
      });
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
    loginAsDemo,
    loginAsOwner,
    logout,
    fetchUserProfile,
  };
});
