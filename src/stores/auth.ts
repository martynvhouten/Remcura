import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { supabase } from 'src/boot/supabase'
import type { User, Session } from '@supabase/supabase-js'
import type { UserProfile } from 'src/types/supabase'
import { ErrorHandler } from 'src/utils/error-handler'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const userProfile = ref<UserProfile | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value && !!session.value)
  const userEmail = computed(() => user.value?.email)
  const clinicId = computed(() => userProfile.value?.clinic_id)

  // Actions
  const initialize = async () => {
    if (initialized.value) return

    loading.value = true
    try {
      // First check localStorage for persisted session
      const savedSession = localStorage.getItem('medstock_auth_session')
      const savedUser = localStorage.getItem('medstock_auth_user')
      const savedProfile = localStorage.getItem('medstock_auth_profile')
      
      if (savedSession && savedUser) {
        try {
          session.value = JSON.parse(savedSession)
          user.value = JSON.parse(savedUser)
          if (savedProfile) {
            userProfile.value = JSON.parse(savedProfile)
          }
        } catch (e) {
          // Clear corrupted localStorage data
          clearAuthData()
        }
      }

      // If no localStorage session, check Supabase
      if (!session.value) {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        
        if (initialSession) {
          await setAuthData(initialSession)
        }
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_IN' && newSession) {
          await setAuthData(newSession)
        } else if (event === 'SIGNED_OUT') {
          clearAuthData()
        }
      })

      initialized.value = true
    } catch (error) {
      ErrorHandler.handle(error as Error, 'Auth Initialization')
    } finally {
      loading.value = false
    }
  }

  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      // Demo mode - bypass Supabase for demo account
      if (email === 'demo@medstock-pro.com' && password === 'demo123') {
        await setDemoAuthData()
        return { success: true }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.session) {
        await setAuthData(data.session)
      }

      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: ErrorHandler.getErrorMessage(error)
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    loading.value = true
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      clearAuthData()
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: ErrorHandler.getErrorMessage(error)
      }
    } finally {
      loading.value = false
    }
  }

  const setAuthData = async (newSession: Session) => {
    session.value = newSession
    user.value = newSession.user

    // Persist to localStorage for page reload persistence
    localStorage.setItem('medstock_auth_session', JSON.stringify(newSession))
    localStorage.setItem('medstock_auth_user', JSON.stringify(newSession.user))

    // Fetch user profile
    if (newSession.user) {
      await fetchUserProfile(newSession.user.id)
    }
  }

  const clearAuthData = () => {
    user.value = null
    session.value = null
    userProfile.value = null
    
    // Clear localStorage
    localStorage.removeItem('medstock_auth_session')
    localStorage.removeItem('medstock_auth_user')
    localStorage.removeItem('medstock_auth_profile')
  }

  const setDemoAuthData = async () => {
    // Create mock session for demo
    const mockUser = {
      id: 'demo-user-id',
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
      is_anonymous: false
    }

    const mockSession = {
      access_token: 'demo-access-token',
      refresh_token: 'demo-refresh-token',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: mockUser
    }

    user.value = mockUser as any
    session.value = mockSession as any
    
    // Set demo user profile
    userProfile.value = {
      id: 'demo-user-id',
      clinic_id: 'demo-clinic-id',
      email: 'demo@medstock-pro.com',
      full_name: 'Demo User',
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Persist demo data to localStorage
    localStorage.setItem('medstock_auth_session', JSON.stringify(mockSession))
    localStorage.setItem('medstock_auth_user', JSON.stringify(mockUser))
    localStorage.setItem('medstock_auth_profile', JSON.stringify(userProfile.value))
  }

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        ErrorHandler.handle(error, 'Fetch User Profile')
        return
      }

      userProfile.value = data
      
      // Persist user profile to localStorage
      localStorage.setItem('medstock_auth_profile', JSON.stringify(data))
    } catch (error) {
      ErrorHandler.handle(error as Error, 'Fetch User Profile')
    }
  }

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
    fetchUserProfile
  }
}) 