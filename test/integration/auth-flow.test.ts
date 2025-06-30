import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import LoginPage from 'src/pages/auth/LoginPage.vue'
import DashboardPage from 'src/pages/DashboardPage.vue'
import { useAuthStore } from 'src/stores/auth'

// Mock Supabase
vi.mock('src/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    }
  }
}))

describe('Authentication Flow Integration', () => {
  let router: any
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    
    router = createRouter({
      history: createWebHistory(),
      routes: [
        { path: '/', component: DashboardPage, meta: { requiresAuth: true } },
        { path: '/login', component: LoginPage },
        { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } }
      ]
    })
  })

  describe('Login Flow', () => {
    it('should allow demo login and redirect to dashboard', async () => {
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Find form elements
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const loginButton = wrapper.find('button[type="submit"]')

      // Fill in demo credentials
      await emailInput.setValue('demo@medstock-pro.com')
      await passwordInput.setValue('demo123')

      // Submit form
      await loginButton.trigger('click')

      // Wait for async operations
      await wrapper.vm.$nextTick()

      // Verify auth store state
      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.userEmail).toBe('demo@medstock-pro.com')
    })

    it('should show error message for invalid credentials', async () => {
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const loginButton = wrapper.find('button[type="submit"]')

      // Fill in invalid credentials
      await emailInput.setValue('invalid@example.com')
      await passwordInput.setValue('wrongpassword')

      // Submit form
      await loginButton.trigger('click')

      // Wait for error message
      await wrapper.vm.$nextTick()

      // Should show error notification
      expect(wrapper.text()).toContain('error')
    })

    it('should validate form fields before submission', async () => {
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      const loginButton = wrapper.find('button[type="submit"]')

      // Try to submit empty form
      await loginButton.trigger('click')

      // Should show validation errors
      expect(wrapper.text()).toContain('verplicht') // Dutch for required
    })
  })

  describe('Dashboard Access Control', () => {
    it('should redirect unauthenticated users to login', async () => {
      const wrapper = mount(DashboardPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      // User should be redirected to login
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow authenticated users to access dashboard', async () => {
      // First authenticate
      const authStore = useAuthStore()
      await authStore.login('demo@medstock-pro.com', 'demo123')

      const wrapper = mount(DashboardPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Should be able to access dashboard
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-test="dashboard-content"]').exists()).toBe(true)
    })
  })

  describe('Logout Flow', () => {
    it('should clear auth state and redirect on logout', async () => {
      // First authenticate
      const authStore = useAuthStore()
      await authStore.login('demo@medstock-pro.com', 'demo123')
      
      expect(authStore.isAuthenticated).toBe(true)

      // Logout
      await authStore.logout()

      // Should clear auth state
      expect(authStore.isAuthenticated).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.session).toBeNull()
    })
  })

  describe('Session Persistence', () => {
    it('should restore session from localStorage', async () => {
      // Mock localStorage with saved session
      const mockSession = {
        user: { id: 'demo-user', email: 'demo@medstock-pro.com' },
        access_token: 'mock-token'
      }
      
      vi.mocked(localStorage.getItem).mockImplementation((key) => {
        if (key === 'medstock_auth_session') return JSON.stringify(mockSession)
        if (key === 'medstock_auth_user') return JSON.stringify(mockSession.user)
        return null
      })

      const authStore = useAuthStore()
      await authStore.initialize()

      expect(authStore.isAuthenticated).toBe(true)
      expect(authStore.userEmail).toBe('demo@medstock-pro.com')
    })

    it('should handle corrupted localStorage gracefully', async () => {
      // Mock corrupted localStorage data
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        return 'invalid-json-data'
      })

      const authStore = useAuthStore()
      await authStore.initialize()

      // Should not crash and should clear corrupted data
      expect(authStore.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalled()
    })
  })

  describe('Error Scenarios', () => {
    it('should handle network errors during login', async () => {
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      // Mock network error
      const networkError = new Error('Network error')
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(networkError)

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const loginButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password')
      await loginButton.trigger('click')

      await wrapper.vm.$nextTick()

      // Should handle error gracefully
      expect(wrapper.text()).toContain('error')
      
      const authStore = useAuthStore()
      expect(authStore.isAuthenticated).toBe(false)
    })
  })

  describe('Performance', () => {
    it('should complete login flow within reasonable time', async () => {
      const startTime = Date.now()
      
      const wrapper = mount(LoginPage, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')
      const loginButton = wrapper.find('button[type="submit"]')

      await emailInput.setValue('demo@medstock-pro.com')
      await passwordInput.setValue('demo123')
      await loginButton.trigger('click')

      await wrapper.vm.$nextTick()

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })
  })
}) 