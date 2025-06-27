import { config } from '@vue/test-utils'
import { Quasar, Notify, Dark, Dialog } from 'quasar'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

// Create i18n instance
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
        settings: 'Instellingen',
        logout: 'Uitloggen'
      },
      common: {
        save: 'Opslaan',
        cancel: 'Annuleren',
        delete: 'Verwijderen',
        refresh: 'Vernieuwen'
      },
      errors: {
        generic: 'Er is een fout opgetreden'
      }
    }
  }
})

// Configure Vue Test Utils
config.global.plugins = [
  [Quasar, {
    plugins: [Notify, Dark, Dialog]
  }],
  i18n,
  createPinia()
]

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
}) 