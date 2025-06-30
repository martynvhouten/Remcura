import { createI18n } from 'vue-i18n'
import en from './en'
import nl from './nl'

// Supported locales
export type SupportedLocale = 'en' | 'nl'

// All messages loaded upfront for now (we can optimize later if needed)
const messages = {
  en,
  nl
}

// Create i18n instance with all translations loaded
export const i18n = createI18n({
  locale: 'nl',
  fallbackLocale: 'en',
  messages,
  legacy: false,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
})

// Simple locale setter
export const setI18nLanguage = (locale: SupportedLocale) => {
  i18n.global.locale.value = locale
  document.querySelector('html')?.setAttribute('lang', locale)
  return locale
}

export default i18n 