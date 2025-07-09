import { boot } from "quasar/wrappers";
import { i18n, type SupportedLocale } from "src/i18n";

export type MessageLanguages = SupportedLocale;

export { i18n };

export default boot(({ app }) => {
  // Debug logging
  console.log("🌐 i18n boot file executing...");
  console.log("🌐 i18n instance:", i18n);
  console.log("🌐 i18n mode:", i18n.mode);
  console.log("🌐 Current locale:", i18n.mode === 'legacy' ? i18n.global.locale : (i18n.global.locale as any).value);
  console.log("🌐 Available messages:", Object.keys(i18n.global.messages));
  console.log("🌐 Sample batch message:", i18n.global.messages.en?.batch?.batchManagement);
  
  // Set i18n instance on app
  try {
    app.use(i18n);
    console.log("✅ i18n plugin registered successfully");
    
    // Test global injection
    setTimeout(() => {
      console.log("🌐 Testing global $t:", app.config.globalProperties.$t);
      if (app.config.globalProperties.$t) {
        console.log("🌐 Test translation result:", app.config.globalProperties.$t('batch.batchManagement'));
      }
    }, 1000);
    
  } catch (error) {
    console.error("❌ Error registering i18n plugin:", error);
  }
});
