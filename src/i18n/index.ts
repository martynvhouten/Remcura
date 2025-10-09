import { createI18n } from 'vue-i18n';
import type { SupportedLocale } from '@/types/i18n';
export type { SupportedLocale } from '@/types/i18n';
import { logger } from '@/utils/logger';

// Always use lazy loading to avoid require() issues in Vite
const ENABLE_LAZY_LOADING = true;

// Messages for upfront loading (empty for lazy loading)
const messages: Record<SupportedLocale, any> = {} as any;

// Get saved locale from localStorage or default to 'nl'
const getSavedLocale = (): SupportedLocale => {
  const _saved = localStorage.getItem('remcura_locale');
  // We only support Dutch now; ignore any previously saved en/es
  return 'nl';
};

// Check if we're in development mode
export const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEV === 'true';

// Custom missing handler for development feedback
const missingHandler = (
  locale: string,
  key: string,
  _instance: any,
  _type: string
) => {
  if (isDevelopment) {
    logger.warn(`[i18n:missing] ${locale}:${key}`, 'I18N');
    return key; // show key in dev
  }
  return '';
};

// Create i18n instance
// Use composition mode for Vue 3 compatibility
export const i18n = createI18n({
  locale: getSavedLocale(),
  fallbackLocale: 'nl',
  messages: ENABLE_LAZY_LOADING ? {} : messages, // Empty in production for lazy loading
  legacy: false, // Use composition mode for Vue 3 compatibility
  globalInjection: true,
  missingWarn: isDevelopment,
  fallbackWarn: isDevelopment,
  missing: missingHandler as any,
});

// Async loader for lazy loading
const loadedLanguages: Set<SupportedLocale> = new Set();

export const loadLanguageAsync = async (
  locale: SupportedLocale
): Promise<void> => {
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
    logger.error(`Failed to load ${locale} translations`, 'I18N', error instanceof Error ? error : undefined);
    throw error;
  }
};

// Initialize with Dutch language in production (lazy load)
if (ENABLE_LAZY_LOADING) {
  const initialLocale = getSavedLocale();
  loadLanguageAsync(initialLocale)
    .then(() => {
      if (isDevelopment) {
        // Initial translations loaded
      }
    })
    .catch(error => {
      logger.error('Failed to load initial translations', 'I18N', error instanceof Error ? error : undefined);
    });
}

// Locale setter with persistence and lazy loading
export const setI18nLanguage = async (
  locale: SupportedLocale
): Promise<SupportedLocale> => {
  // Load the language if lazy loading is enabled
  if (ENABLE_LAZY_LOADING) {
    await loadLanguageAsync(locale);
  }

  // In composition mode, locale is a ref with .value
  (i18n.global.locale as any).value = locale;
  document.querySelector('html')?.setAttribute('lang', locale);
  localStorage.setItem('remcura_locale', locale);
  return locale;
};

// Get current locale
export const getCurrentLocale = (): SupportedLocale => {
  // In composition mode, locale is a ref with .value
  return (i18n.global.locale as any).value as SupportedLocale;
};

// Development helper: Check if a translation exists
export const hasTranslation = (
  key: string,
  locale?: SupportedLocale
): boolean => {
  const targetLocale = locale || getCurrentLocale();
  return i18n.global.te(key, targetLocale);
};

// Development helper: Get missing translations for current locale
export const getMissingTranslations = (
  keys: string[],
  locale?: SupportedLocale
): string[] => {
  const targetLocale = locale || getCurrentLocale();
  return keys.filter(key => !hasTranslation(key, targetLocale));
};

// Development helper: Log translation coverage stats
export const logTranslationStats = () => {
  if (!isDevelopment) {
    return;
  }

  const locales: SupportedLocale[] = ['nl'];
  logger.info('Translation Coverage Statistics', 'I18N');

  locales.forEach(locale => {
    if (ENABLE_LAZY_LOADING) {
      const _isLoaded = loadedLanguages.has(locale);
      // Language loaded check
    } else {
      // Count keys for status
    }
  });
};

// Preload all languages (useful for offline apps)
export const preloadAllLanguages = async (): Promise<void> => {
  if (!ENABLE_LAZY_LOADING) {
    // Already loaded in development
    return Promise.resolve();
  }

  const locales: SupportedLocale[] = ['nl'];
  const loadPromises = locales.map(locale => loadLanguageAsync(locale));

  try {
    await Promise.all(loadPromises);
    if (isDevelopment) {
      // All languages preloaded successfully
    }
  } catch (error) {
    logger.error('Failed to preload all languages', 'I18N', error instanceof Error ? error : undefined);
    throw error;
  }
};

// Check if lazy loading is enabled
export const isLazyLoadingEnabled = (): boolean => ENABLE_LAZY_LOADING;

// Helper function to recursively count keys in translation object (for future use)
// const countKeys = (obj: any, prefix = ''): number => {
//   let count = 0;
//   for (const key in obj) {
//     if (typeof obj[key] === 'object' && obj[key] !== null) {
//       count += countKeys(obj[key], prefix ? `${prefix}.${key}` : key);
//     } else {
//       count++;
//     }
//   }
//   return count;
// };

export default i18n;
