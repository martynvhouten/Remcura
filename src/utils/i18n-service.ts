import { i18n } from '@/i18n';

/**
 * Translation utility for services that don't have access to useI18n composable
 *
 * This allows services to use internationalization by directly accessing
 * the global i18n instance.
 */

export const translate = <Values extends Record<string, unknown> | undefined>(
  key: string,
  values?: Values
): string => {
  const translator = i18n.global.t.bind(i18n.global);
  if (values && Array.isArray(values)) {
    return translator(key, values);
  }
  return translator(key, (values ?? {}) as Record<string, unknown>);
};

export const t = <Values extends Record<string, unknown> | undefined>(
  key: string,
  values?: Values
): string => {
  try {
    return translate(key, values);
  } catch (error) {
    console.warn(`[i18n-service] Translation failed for key "${key}":`, error);
    return key;
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
    const translator = i18n.global.t.bind(i18n.global);
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
