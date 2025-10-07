<template>
  <div class="real-time-indicator">
    <q-chip
      :color="statusColor"
      :icon="statusIcon"
      size="sm"
      :label="statusText"
      class="status-chip"
    />

    <div v-if="lastUpdate" class="last-update">
      <q-icon name="schedule" class="icon-size-xs" />
      <span>{{ formatTime(lastUpdate) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';

  interface Props {
    connected: boolean;
    lastUpdate?: Date | null;
    showLastUpdate?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    lastUpdate: null,
    showLastUpdate: true,
  });

  const { t } = useI18n();

  const statusColor = computed(() => {
    return props.connected ? 'positive' : 'grey-6';
  });

  const statusIcon = computed(() => {
    return props.connected ? 'sync' : 'sync_disabled';
  });

  const statusText = computed(() => {
    return props.connected
      ? t('inventory.realTimeConnected')
      : t('inventory.realTimeDisconnected');
  });

  const formatTime = (date: Date): string => {
    return new Intl.DateTimeFormat('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };
</script>

<style lang="scss" scoped>
  .real-time-indicator {
    display: flex;
    align-items: center;
    gap: 8px;

    .status-chip {
      font-size: 0.75rem;
    }

    .last-update {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      color: var(--q-grey-6);
    }
  }
</style>
