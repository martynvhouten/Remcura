// Internationalization types
export type SupportedLocale = 'nl';

export type MessageLanguages = SupportedLocale;

export interface LocaleInfo {
  code: SupportedLocale;
  name: string;
  flag: string;
  rtl?: boolean;
}
