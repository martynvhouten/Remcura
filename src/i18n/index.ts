import { createI18n } from 'vue-i18n'
import en from './en'
import nl from './nl'
import es from './es'

// Supported locales
export type SupportedLocale = 'en' | 'nl' | 'es'

// All messages loaded upfront for now (we can optimize later if needed)
const messages = {
  en,
  nl,
  es
}

// Get saved locale from localStorage or default to 'nl'
const getSavedLocale = (): SupportedLocale => {
  const saved = localStorage.getItem('medstock_locale')
  if (saved && ['en', 'nl', 'es'].includes(saved)) {
    return saved as SupportedLocale
  }
  return 'nl'
}

// Create i18n instance with all translations loaded
export const i18n = createI18n({
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
})

// Locale setter with persistence
export const setI18nLanguage = (locale: SupportedLocale) => {
  i18n.global.locale.value = locale
  document.querySelector('html')?.setAttribute('lang', locale)
  localStorage.setItem('medstock_locale', locale)
  return locale
}

// Get current locale
export const getCurrentLocale = (): SupportedLocale => {
  return i18n.global.locale.value as SupportedLocale
}

export default i18n 