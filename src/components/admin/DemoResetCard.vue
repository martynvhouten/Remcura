<template>
  <BaseCard class="demo-reset-card">
    <template #header>
      <div class="card-header-content">
        <div class="card-title-section">
          <q-icon name="refresh" color="warning" size="24px" />
          <div>
            <h3 class="card-title">{{ $t("demo.resetData") }}</h3>
            <p class="card-subtitle">{{ $t("demo.limitations") }}</p>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <div class="demo-content">
        <div class="demo-info">
          <q-banner
            class="demo-banner"
            icon="info"
            color="info"
            text-color="white"
          >
            <div class="banner-content">
              <div class="banner-title">{{ $t("demo.practice") }}</div>
              <div class="banner-subtitle">
                {{ $t("demo.practiceDescription") }}
              </div>
            </div>
          </q-banner>

          <div class="demo-limitations">
            <q-icon name="warning" color="amber" size="20px" />
            <span>{{ $t("demo.limitationsText") }}</span>
          </div>
        </div>

        <div class="demo-actions">
          <q-btn
            @click="resetDemoData"
            :loading="resetting"
            color="warning"
            icon="refresh"
            :label="$t('demo.resetData')"
            class="reset-btn"
            :disable="resetting"
          />

          <div class="reset-info">
            <q-icon name="info_outline" color="grey-6" size="16px" />
            <span class="reset-info-text">
              Dit zal alle demo data verwijderen en vers opnieuw aanmaken
            </span>
          </div>
        </div>
      </div>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import BaseCard from "../base/BaseCard.vue";
import { useAuthStore } from "../../stores/auth";

// Composables
const { t } = useI18n();
const $q = useQuasar();
const authStore = useAuthStore();

// Reactive state
const resetting = ref(false);

// Methods
const resetDemoData = async () => {
  // Only allow demo user to reset
  if (authStore.userEmail !== "demo@medstock-pro.com") {
    $q.notify({
      type: "negative",
      message: "Alleen demo gebruiker kan demo data resetten",
      position: "top",
    });
    return;
  }

  // Confirmation dialog
  $q.dialog({
    title: t("demo.resetData"),
    message: t("demo.resetDataConfirm"),
    cancel: {
      label: t("common.cancel"),
      color: "grey",
    },
    ok: {
      label: t("demo.resetData"),
      color: "warning",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      resetting.value = true;

      // Call reset function via MCP or API
      const response = await fetch("/api/demo/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authStore.session?.access_token}`,
        },
      });

      if (response.ok) {
        $q.notify({
          type: "positive",
          message: t("demo.resetDataSuccess"),
          position: "top",
          timeout: 5000,
        });

        // Refresh the page to reload fresh data
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error("Reset failed");
      }
    } catch (error) {
      console.error("Demo reset error:", error);
      $q.notify({
        type: "negative",
        message: t("demo.resetDataError"),
        position: "top",
      });
    } finally {
      resetting.value = false;
    }
  });
};
</script>

<style lang="scss" scoped>
.demo-reset-card {
  border-left: 4px solid var(--q-warning);

  .demo-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .demo-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .demo-banner {
    border-radius: var(--border-radius-lg);

    .banner-content {
      .banner-title {
        font-weight: 600;
        font-size: 1.1rem;
        margin-bottom: var(--space-1);
      }

      .banner-subtitle {
        opacity: 0.9;
      }
    }
  }

  .demo-limitations {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: var(--border-radius-md);
    font-size: 0.9rem;
    color: var(--q-amber-8);
  }

  .demo-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);

    .reset-btn {
      padding: var(--space-3) var(--space-6);
      font-weight: 600;
    }

    .reset-info {
      display: flex;
      align-items: center;
      gap: var(--space-2);

      .reset-info-text {
        font-size: 0.85rem;
        color: var(--q-grey-6);
      }
    }
  }
}

.body--dark {
  .demo-limitations {
    background: rgba(255, 193, 7, 0.15);
    color: var(--q-amber-6);
  }
}
</style>
