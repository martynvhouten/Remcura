import { config } from '@vue/test-utils'
import { Quasar, Notify, Dark, Dialog, Loading } from 'quasar'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'
import { vi, afterEach } from 'vitest'

// Create comprehensive i18n instance for testing
const i18n = createI18n({
  legacy: false,
  locale: 'nl',
  fallbackLocale: 'nl',
  messages: {
    nl: {
      validation: {
        required: 'Dit veld is verplicht',
        email: 'Voer een geldig e-mailadres in',
        minLength: 'Minimaal {min} karakters vereist',
        maxLength: 'Maximaal {max} karakters toegestaan',
        numeric: 'Alleen cijfers toegestaan',
        positive: 'Waarde moet positief zijn',
        integer: 'Alleen hele getallen toegestaan'
      },
      auth: {
        email: 'E-mailadres',
        password: 'Wachtwoord',
        login: 'Inloggen',
        loginSuccess: 'Succesvol ingelogd',
        loginError: 'Inloggen mislukt',
        forgotPassword: 'Wachtwoord vergeten?',
        pleaseLogin: 'Log in om verder te gaan'
      },
      nav: {
        dashboard: 'Dashboard',
        products: 'Producten',
        orders: 'Bestellingen',
        suppliers: 'Leveranciers',
        analytics: 'Analytics',
        settings: 'Instellingen',
        logout: 'Uitloggen'
      },
      dashboard: {
        lowStockItems: 'Lage voorraad items',
        itemsRequiringAttention: 'Items die aandacht vereisen',
        recentOrders: 'Recente bestellingen',
        stockSummary: 'Voorraad overzicht',
        quickActions: 'Snelle acties'
      },
      common: {
        save: 'Opslaan',
        cancel: 'Annuleren',
        delete: 'Verwijderen',
        edit: 'Bewerken',
        refresh: 'Vernieuwen',
        search: 'Zoeken',
        filter: 'Filteren',
        sort: 'Sorteren',
        loading: 'Laden...',
        noData: 'Geen gegevens beschikbaar'
      },
      errors: {
        generic: 'Er is een fout opgetreden',
        network: 'Netwerkfout - controleer je internetverbinding',
        unauthorized: 'Je bent niet geautoriseerd voor deze actie',
        notFound: 'De opgevraagde resource werd niet gevonden'
      }
    },
    en: {
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        minLength: 'Minimum {min} characters required',
        maxLength: 'Maximum {max} characters allowed',
        numeric: 'Only numbers allowed',
        positive: 'Value must be positive',
        integer: 'Only whole numbers allowed'
      },
      auth: {
        email: 'Email Address',
        password: 'Password',
        login: 'Login',
        loginSuccess: 'Successfully logged in',
        loginError: 'Login failed',
        forgotPassword: 'Forgot password?',
        pleaseLogin: 'Please log in to continue'
      },
      nav: {
        dashboard: 'Dashboard',
        products: 'Products',
        orders: 'Orders',
        suppliers: 'Suppliers',
        analytics: 'Analytics',
        settings: 'Settings',
        logout: 'Logout'
      },
      dashboard: {
        lowStockItems: 'Low stock items',
        itemsRequiringAttention: 'Items requiring attention',
        recentOrders: 'Recent orders',
        stockSummary: 'Stock summary',
        quickActions: 'Quick actions'
      },
      common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        refresh: 'Refresh',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        loading: 'Loading...',
        noData: 'No data available'
      },
      errors: {
        generic: 'An error occurred',
        network: 'Network error - check your internet connection',
        unauthorized: 'You are not authorized for this action',
        notFound: 'The requested resource was not found'
      }
    }
  }
})

// Configure Vue Test Utils with comprehensive setup
config.global.plugins = [
  [Quasar, {
    plugins: [Notify, Dark, Dialog, Loading]
  }],
  i18n,
  createPinia()
]

// Mock DOM APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', localStorageMock)

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('sessionStorage', sessionStorageMock)

// Mock console to reduce noise in tests (but allow explicit calls)
const originalConsole = { ...console }
vi.stubGlobal('console', {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
})

// Mock fetch for API testing
global.fetch = vi.fn()

// Mock geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  },
  writable: true,
})

// Mock crypto for UUID generation in tests
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: vi.fn(() => 'test-uuid-' + Math.random().toString(36).substr(2, 9)),
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
  },
})

// Global test utilities
export const testUtils = {
  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Wait for specific time
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock timer helpers
  advanceTimers: (ms: number) => vi.advanceTimersByTime(ms),
  
  // Create mock user event
  createMockEvent: (type: string, properties: Record<string, any> = {}) => 
    new Event(type, { bubbles: true, cancelable: true, ...properties }),
  
  // Mock API response
  mockApiResponse: (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
  
  // Reset all mocks
  resetAllMocks: () => vi.resetAllMocks(),
  
  // Clear all mocks
  clearAllMocks: () => vi.clearAllMocks(),
}

// Make test utilities globally available
vi.stubGlobal('testUtils', testUtils)

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
}) 