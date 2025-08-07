<template>
  <BaseDashboardWidget :hide-header="true">
    <q-list separator>
      <q-item v-for="(item, index) in listItems" :key="index" class="list-item">
        <q-item-section avatar v-if="item.icon || item.severity">
          <q-icon
            :name="item.icon || getSeverityIcon(item.severity)"
            :color="item.color || getSeverityColor(item.severity)"
            size="sm"
          />
        </q-item-section>

        <q-item-section>
          <q-item-label>{{
            item.title || item.description || item.message
          }}</q-item-label>
          <q-item-label caption v-if="item.subtitle || item.timestamp">
            {{ item.subtitle || formatTimestamp(item.timestamp) }}
          </q-item-label>
        </q-item-section>

        <q-item-section side v-if="item.value || item.count">
          <q-chip
            :color="item.chipColor || 'primary'"
            text-color="white"
            size="sm"
          >
            {{ item.value || item.count }}
          </q-chip>
        </q-item-section>
      </q-item>

      <q-item v-if="!listItems.length">
        <q-item-section class="text-center text-grey-6">
          <q-icon name="info" size="2em" class="q-mb-sm" />
          <div>{{ $t('common.noData') }}</div>
        </q-item-section>
      </q-item>
    </q-list>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BaseDashboardWidget } from '@/components/cards';

  const { t } = useI18n();

  // Props
  interface Props {
    data: {
      items?: any[];
      alerts?: any[];
    };
  }

  const props = defineProps<Props>();

  // Computed
  const listItems = computed(() => {
    return props.data.items || props.data.alerts || [];
  });

  // Methods
  function getSeverityIcon(severity?: string): string {
    switch (severity) {
      case 'error':
      case 'high':
        return 'error';
      case 'warning':
      case 'medium':
        return 'warning';
      case 'info':
      case 'low':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'circle';
    }
  }

  function getSeverityColor(severity?: string): string {
    switch (severity) {
      case 'error':
      case 'high':
        return 'negative';
      case 'warning':
      case 'medium':
        return 'warning';
      case 'info':
      case 'low':
        return 'info';
      case 'success':
        return 'positive';
      default:
        return 'grey';
    }
  }

  function formatTimestamp(timestamp?: string): string {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
</script>

<style lang="scss" scoped>
  // Platform list widget content styling (wrapper now handled by BaseDashboardWidget)

  .list-item {
    border-radius: 8px;
    margin-bottom: 4px;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(var(--q-primary-rgb), 0.05);
    }
  }
</style>
