import { boot } from "quasar/wrappers";
import { i18n, type SupportedLocale } from "src/i18n";

export type MessageLanguages = SupportedLocale;

export { i18n };

export default boot(({ app }) => {
  // Set i18n instance on app
  app.use(i18n);
});
