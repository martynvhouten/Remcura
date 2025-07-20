<template>
  <q-banner
    v-if="isDemoUser"
    class="demo-banner"
    icon="science"
    color="amber"
    text-color="white"
    dense
  >
    <div class="demo-banner-content">
      <div class="demo-title">
        <q-icon name="science" size="18px" class="q-mr-xs" />
        {{ $t('demo.title') }}
      </div>
      <div class="demo-subtitle">{{ $t('demo.subtitle') }}</div>
    </div>

    <template v-slot:action>
      <q-btn flat color="white" icon="info" size="sm" @click="showDemoInfo">
        <q-tooltip>{{ $t('demo.limitations') }}</q-tooltip>
      </q-btn>
    </template>
  </q-banner>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useAuthStore } from '@/stores/auth';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();

  // Computed
  const isDemoUser = computed(() => {
    return authStore.userEmail === 'demo@medstock-pro.com';
  });

  // Methods
  const showDemoInfo = () => {
    $q.dialog({
      title: t('demo.title'),
      message: `
      <div class="demo-info-dialog">
        <p><strong>${t('demo.practice')}:</strong> ${t(
        'demo.practiceDescription'
      )}</p>
        <p><strong>${t('demo.limitations')}:</strong> ${t(
        'demo.limitationsText'
      )}</p>
        <p><em>{{ $t('demo.changesCanBeReset') }}</em></p>
      </div>
    `,
      html: true,
      ok: {
        label: t('common.close'),
        color: 'primary',
      },
    });
  };
</script>

<style lang="scss" scoped>
  .demo-banner {
    border: none;
    background: linear-gradient(135deg, var(--q-amber-6), var(--q-amber-8));

    .demo-banner-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);

      .demo-title {
        display: flex;
        align-items: center;
        font-weight: 600;
        font-size: 0.9rem;
      }

      .demo-subtitle {
        font-size: 0.8rem;
        opacity: 0.9;
      }
    }
  }

  @media (max-width: 599px) {
    .demo-banner-content {
      .demo-title {
        font-size: 0.85rem;
      }

      .demo-subtitle {
        font-size: 0.75rem;
      }
    }
  }

  :deep(.demo-info-dialog) {
    p {
      margin-bottom: var(--space-3);

      &:last-child {
        margin-bottom: 0;
        font-style: italic;
        color: var(--q-grey-6);
      }
    }

    strong {
      color: var(--q-primary);
    }
  }
</style>
