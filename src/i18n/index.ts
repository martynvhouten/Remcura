import { createI18n } from 'vue-i18n';

// Supported locales
export type SupportedLocale = 'en' | 'nl' | 'es';

// Always use lazy loading to avoid require() issues in Vite
const ENABLE_LAZY_LOADING = true;

// Messages for upfront loading (empty for lazy loading)
let messages: Record<SupportedLocale, any> = {} as any;

// Get saved locale from localStorage or default to 'nl'
const getSavedLocale = (): SupportedLocale => {
  const saved = localStorage.getItem('remcura_locale');
  if (saved && ['en', 'nl', 'es'].includes(saved)) {
    return saved as SupportedLocale;
  }
  return 'nl';
};

// Check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development' || process.env.DEV === 'true';

// Custom missing handler for development feedback
const missingHandler = (locale: string, key: string, instance: any, type: string) => {
  if (isDevelopment) {
    console.warn(`🌐 [i18n] Missing translation for key "${key}" in locale "${locale}"`);
    // Return a visually distinct placeholder in development
    return `[MISSING: ${key}]`;
  }
  return key; // Return key as fallback in production
};

// Create i18n instance 
// Use legacy mode for better Quasar compatibility
export const i18n = createI18n({
  locale: getSavedLocale(),
  fallbackLocale: 'en',
  messages: ENABLE_LAZY_LOADING ? {} : messages, // Empty in production for lazy loading
  legacy: true, // Changed to true for better compatibility
  globalInjection: true,
  missingWarn: isDevelopment,
  fallbackWarn: isDevelopment,
  missing: missingHandler,
});

// Async loader for lazy loading
const loadedLanguages: Set<SupportedLocale> = new Set();

export const loadLanguageAsync = async (locale: SupportedLocale): Promise<void> => {
  if (!ENABLE_LAZY_LOADING) {
    // In development, everything is already loaded
    return Promise.resolve();
  }
  
  if (loadedLanguages.has(locale)) {
    // Already loaded
    return Promise.resolve();
  }
  
  try {
    const messages = await import(`./${locale}/index.ts`);
    i18n.global.setLocaleMessage(locale, messages.default);
    loadedLanguages.add(locale);
    
    if (isDevelopment) {
      // Lazy loaded translations
    }
  } catch (error) {
    console.error(`❌ [i18n] Failed to load ${locale} translations:`, error);
    throw error;
  }
};

// Initialize with Dutch language in production (lazy load)
if (ENABLE_LAZY_LOADING) {
  const initialLocale = getSavedLocale();
  loadLanguageAsync(initialLocale).then(() => {
    if (isDevelopment) {
      // Initial translations loaded
    }
  }).catch(error => {
    console.error('❌ [i18n] Failed to load initial translations:', error);
  });
}

// Locale setter with persistence and lazy loading
export const setI18nLanguage = async (locale: SupportedLocale): Promise<SupportedLocale> => {
  // Load the language if lazy loading is enabled
  if (ENABLE_LAZY_LOADING) {
    await loadLanguageAsync(locale);
  }
  
  // In legacy mode, locale is a string property
  // In composition mode, locale is a ref with .value
  if (i18n.mode === 'legacy') {
    (i18n.global.locale as any) = locale;
  } else {
    (i18n.global.locale as any).value = locale;
  }
  document.querySelector('html')?.setAttribute('lang', locale);
  localStorage.setItem('remcura_locale', locale);
  return locale;
};

// Get current locale
export const getCurrentLocale = (): SupportedLocale => {
  // In legacy mode, locale is a string property
  // In composition mode, locale is a ref with .value
  if (i18n.mode === 'legacy') {
    return i18n.global.locale as SupportedLocale;
  } else {
    return (i18n.global.locale as any).value as SupportedLocale;
  }
};

// Development helper: Check if a translation exists
export const hasTranslation = (key: string, locale?: SupportedLocale): boolean => {
  const targetLocale = locale || getCurrentLocale();
  return i18n.global.te(key, targetLocale);
};

// Development helper: Get missing translations for current locale
export const getMissingTranslations = (keys: string[], locale?: SupportedLocale): string[] => {
  const targetLocale = locale || getCurrentLocale();
  return keys.filter(key => !hasTranslation(key, targetLocale));
};

// Development helper: Log translation coverage stats  
export const logTranslationStats = () => {
      if (!isDevelopment) { return; }
  
  const locales: SupportedLocale[] = ['nl', 'en', 'es'];
  console.group('🌐 Translation Coverage Statistics');
  
  locales.forEach(locale => {
    if (ENABLE_LAZY_LOADING) {
      const isLoaded = loadedLanguages.has(locale);
      // Language loaded check
    } else {
      // Count keys for status
    }
  });
  
  console.groupEnd();
};

// Preload all languages (useful for offline apps)
export const preloadAllLanguages = async (): Promise<void> => {
  if (!ENABLE_LAZY_LOADING) {
    // Already loaded in development
    return Promise.resolve();
  }
  
  const locales: SupportedLocale[] = ['nl', 'en', 'es'];
  const loadPromises = locales.map(locale => loadLanguageAsync(locale));
  
  try {
    await Promise.all(loadPromises);
    if (isDevelopment) {
      // All languages preloaded successfully
    }
  } catch (error) {
    console.error('❌ [i18n] Failed to preload all languages:', error);
    throw error;
  }
};

// Check if lazy loading is enabled
export const isLazyLoadingEnabled = (): boolean => ENABLE_LAZY_LOADING;

// Helper function to recursively count keys in translation object
const countKeys = (obj: any, prefix = ''): number => {
  let count = 0;
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
    } else {
      count++;
    }
  }
  return count;
};

export default i18n;
