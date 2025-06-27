import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from 'src/stores/auth'
import { supabase } from 'src/boot/supabase'
import { ErrorHandler } from 'src/utils/error-handler'

// Mock Supabase
vi.mock('src/boot/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    }))
  }
}))

// Mock ErrorHandler
vi.mock('src/utils/error-handler', () => ({
  ErrorHandler: {
    handle: vi.fn(),
    getErrorMessage: vi.fn((error) => error.message || 'Generic error')
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const authStore = useAuthStore()
      
      expect(authStore.user).toBeNull()
      expect(authStore.session).toBeNull()
      expect(authStore.userProfile).toBeNull()
      expect(authStore.loading).toBe(false)
      expect(authStore.initialized).toBe(false)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.userEmail).toBeUndefined()
      expect(authStore.clinicId).toBeUndefined()
    })
  })

  describe('demo login', () => {
    it('should login successfully with demo credentials', async () => {
      const authStore = useAuthStore()
      
      const result = await authStore.login('demo@medstock-pro.com', 'demo123')
      
      expect(result.success).toBe(true)
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.userEmail).toBe('demo@medstock-pro.com')
      expect(authStore.clinicId).toBe('demo-clinic-id')
      expect(authStore.userProfile?.full_name).toBe('Demo User')
    })
  })

  describe('regular login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com'
        }
      }
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })
      
      const authStore = useAuthStore()
      const result = await authStore.login('test@example.com', 'password')
      
      expect(result.success).toBe(true)
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password'
      })
    })

    it('should handle login failure', async () => {
      const mockError = new Error('Invalid credentials')
      
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null },
        error: mockError
      })
      
      const authStore = useAuthStore()
      const result = await authStore.login('test@example.com', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(ErrorHandler.getErrorMessage).toHaveBeenCalledWith(mockError)
    })
  })

  describe('logout', () => {
    it('should logout successfully', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: null
      })
      
      const authStore = useAuthStore()
      
      // First login with demo account
      await authStore.login('demo@medstock-pro.com', 'demo123')
      expect(authStore.isAuthenticated).toBe(true)
      
      // Then logout
      const result = await authStore.logout()
      
      expect(result.success).toBe(true)
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.session).toBeNull()
      expect(authStore.userProfile).toBeNull()
    })

    it('should handle logout failure', async () => {
      const mockError = new Error('Logout failed')
      
      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: mockError
      })
      
      const authStore = useAuthStore()
      const result = await authStore.logout()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Logout failed')
      expect(ErrorHandler.getErrorMessage).toHaveBeenCalledWith(mockError)
    })
  })

  describe('initialization', () => {
    it('should initialize without existing session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null
      })
      
      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
      
      const authStore = useAuthStore()
      await authStore.initialize()
      
      expect(authStore.initialized).toBe(true)
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should handle initialization error', async () => {
      const mockError = new Error('Initialization failed')
      
      vi.mocked(supabase.auth.getSession).mockRejectedValue(mockError)
      
      const authStore = useAuthStore()
      await authStore.initialize()
      
      expect(ErrorHandler.handle).toHaveBeenCalledWith(mockError, 'Auth Initialization')
    })

    it('should not reinitialize if already initialized', async () => {
      const authStore = useAuthStore()
      
      // First initialization
      await authStore.initialize()
      expect(authStore.initialized).toBe(true)
      
      // Clear mocks
      vi.clearAllMocks()
      
      // Second initialization should not call Supabase again
      await authStore.initialize()
      expect(supabase.auth.getSession).not.toHaveBeenCalled()
    })
  })

  describe('loading states', () => {
    it('should set loading state during login', async () => {
      let loadingDuringLogin = false
      
      vi.mocked(supabase.auth.signInWithPassword).mockImplementation(async () => {
        const authStore = useAuthStore()
        loadingDuringLogin = authStore.loading
        return { data: { session: null }, error: new Error('Test') }
      })
      
      const authStore = useAuthStore()
      await authStore.login('test@example.com', 'password')
      
      expect(loadingDuringLogin).toBe(true)
      expect(authStore.loading).toBe(false)
    })

    it('should set loading state during logout', async () => {
      let loadingDuringLogout = false
      
      vi.mocked(supabase.auth.signOut).mockImplementation(async () => {
        const authStore = useAuthStore()
        loadingDuringLogout = authStore.loading
        return { error: null }
      })
      
      const authStore = useAuthStore()
      await authStore.logout()
      
      expect(loadingDuringLogout).toBe(true)
      expect(authStore.loading).toBe(false)
    })
  })
}) 