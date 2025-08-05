// Internationalization types
export type SupportedLocale = 'en' | 'nl' | 'es';

export type MessageLanguages = SupportedLocale;

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  flag: string;
  rtl?: boolean;
}