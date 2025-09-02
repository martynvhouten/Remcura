import { boot } from 'quasar/wrappers';
import { i18n } from 'src/i18n';

export { i18n };

export default boot(({ app }) => {
  // Set i18n instance on app
  try {
    app.use(i18n);
  } catch (error) {
    console.error('❌ Error registering i18n plugin:', error);
  }
});
