import { boot } from 'quasar/wrappers';
import { supabase } from 'src/services/supabase';

export { supabase };

export default boot(({ app }) => {
  // Make supabase available globally
  app.config.globalProperties.$supabase = supabase;
  app.provide('supabase', supabase);
});
