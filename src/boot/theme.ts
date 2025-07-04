import { boot } from "quasar/wrappers";
import { loadSavedTheme } from "src/composables/themeManager";

export default boot(() => {
  // Load and apply the saved theme on app initialization
  loadSavedTheme();
});
