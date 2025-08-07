import { i18n } from 'src/i18n';

/**
 * Translation utility for services that don't have access to useI18n composable
 *
 * This allows services to use internationalization by directly accessing
 * the global i18n instance.
 */

// Get the global translator function
const getTranslator = () => {
  if (i18n.mode === 'legacy') {
    return i18n.global.t;
  }
  return i18n.global.t;
};

/**
 * Translate a key in services
 * @param key - Translation key
 * @param values - Optional interpolation values
 * @returns Translated string
 */
export const t = (key: string, values?: Record<string, any>): string => {
  try {
    const translator = getTranslator();
    return translator(key, values);
  } catch (error) {
    console.warn(`[i18n-service] Translation failed for key "${key}":`, error);
    return key; // Return key as fallback
  }
};

/**
 * Get current locale
 */
export const getCurrentLocale = (): string => {
  return i18n.global.locale as string;
};

/**
 * Check if a translation key exists
 */
export const hasTranslation = (key: string): boolean => {
  try {
    const translator = getTranslator();
    const result = translator(key);
    return result !== key && !result.startsWith('[MISSING:');
  } catch {
    return false;
  }
};

export default {
  t,
  getCurrentLocale,
  hasTranslation,
};
