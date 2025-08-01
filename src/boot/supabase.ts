import { boot } from 'quasar/wrappers';
import { supabase, realtimeService } from 'src/services/supabase';

export { supabase, realtimeService };

export default boot(({ app }) => {
  // Make supabase available globally
  app.config.globalProperties.$supabase = supabase;
  app.provide('supabase', supabase);
});
