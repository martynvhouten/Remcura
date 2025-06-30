import { createI18n } from 'vue-i18n'

// Supported locales
export type SupportedLocale = 'en' | 'nl'

// Base messages with minimal initial loading
const baseMessages = {
  en: {
    // Critical messages only - loaded immediately
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success'
    }
  },
  nl: {
    // Critical messages only - loaded immediately  
    common: {
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes'
    }
  }
}

// Lazy loading function for translations
const loadLocaleMessages = async (locale: SupportedLocale) => {
  try {
    const messages = await import(`./${locale}/index.ts`)
    return messages.default
  } catch (error) {
    console.warn(`Could not load locale messages for ${locale}:`, error)
    return {}
  }
}

// Create i18n instance with lazy loading
export const i18n = createI18n({
  locale: 'nl',
  fallbackLocale: 'en',
  messages: baseMessages,
  legacy: false,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
})

// Global locale setter with lazy loading
export const setI18nLanguage = async (locale: SupportedLocale) => {
  // Load messages if not already loaded
  if (!i18n.global.availableLocales.includes(locale)) {
    const messages = await loadLocaleMessages(locale)
    i18n.global.setLocaleMessage(locale, messages)
  }
  
  i18n.global.locale.value = locale
  document.querySelector('html')?.setAttribute('lang', locale)
  return locale
}

// Load default locale messages asynchronously
export const loadDefaultLocale = async () => {
  const defaultLocale = i18n.global.locale.value
  await setI18nLanguage(defaultLocale)
}

export default i18n 