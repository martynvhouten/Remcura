<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "./stores/auth";
import { useOffline, registerServiceWorker } from "./composables/useOffline";

const $q = useQuasar();
const authStore = useAuthStore();
const { isOnline } = useOffline();

onMounted(async () => {
  // Initialize the auth store and check for existing session
  await authStore.initialize();

  // Set up dark mode based on user preference or system
  const darkMode = $q.localStorage.getItem("darkMode");
  if (darkMode === "true" || darkMode === "false") {
    $q.dark.set(darkMode === "true");
  } else {
    $q.dark.set("auto");
  }

  // Register service worker for PWA functionality
  registerServiceWorker();
});
</script>

<style lang="scss">
// Global app styles
#q-app {
  height: 100vh;
  width: 100%;
}

// Custom brand colors and theme overrides will go here
</style>
