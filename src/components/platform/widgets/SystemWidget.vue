<template>
  <BaseDashboardWidget :hide-header="true">
    <!-- Version Information -->
    <template v-if="isVersionInfo">
      <div class="version-section">
        <div class="version-header">
          <q-icon name="info" class="q-mr-sm" />
          <span class="text-h6">{{ $t('platform.system.versionInfo') }}</span>
        </div>

        <div class="version-details">
          <div class="version-item">
            <span class="version-label">{{
              $t('platform.system.appVersion')
            }}</span>
            <q-chip color="primary" text-color="white" class="version-value">
              v{{ data.app_version }}
            </q-chip>
          </div>

          <div class="version-item">
            <span class="version-label">{{
              $t('platform.system.buildNumber')
            }}</span>
            <span class="version-value">#{{ data.build_number }}</span>
          </div>

          <div class="version-item">
            <span class="version-label">{{
              $t('platform.system.environment')
            }}</span>
            <q-chip
              :color="environmentColor"
              text-color="white"
              class="version-value"
            >
              {{ data.environment }}
            </q-chip>
          </div>

          <div class="version-item">
            <span class="version-label">{{
              $t('platform.system.lastDeployment')
            }}</span>
            <span class="version-value">{{
              formatDateTime(data.last_deployment)
            }}</span>
          </div>
        </div>

        <!-- Dependencies -->
        <template v-if="data.dependencies">
          <q-separator class="q-my-md" />
          <div class="dependencies-section">
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="extension" class="q-mr-xs" />
              {{ $t('platform.system.dependencies') }}
            </div>
            <div class="dependencies-grid">
              <div
                v-for="(version, name) in data.dependencies"
                :key="name"
                class="dependency-item"
              >
                <span class="dependency-name">{{ name }}</span>
                <span class="dependency-version">{{ version }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </template>

    <!-- System Health -->
    <template v-else-if="isSystemHealth">
      <div class="health-section">
        <div class="health-header">
          <q-icon name="health_and_safety" class="q-mr-sm" />
          <span class="text-h6">{{ $t('platform.system.healthStatus') }}</span>
        </div>

        <div class="health-metrics">
          <div class="health-item">
            <div class="health-label">
              {{ $t('platform.system.overallStatus') }}
            </div>
            <q-chip
              :color="healthStatusColor"
              text-color="white"
              :icon="healthStatusIcon"
              class="health-value"
            >
              {{ $t(`platform.system.status.${data.overall_status}`) }}
            </q-chip>
          </div>

          <div class="health-item">
            <div class="health-label">
              {{ $t('platform.system.errors24h') }}
            </div>
            <div class="health-value text-h6">
              {{ data.error_count_24h || 0 }}
            </div>
          </div>

          <div class="health-item">
            <div class="health-label">
              {{ $t('platform.system.activePractices') }}
            </div>
            <div class="health-value text-h6">
              {{ data.active_practices_1h || 0 }}
            </div>
          </div>

          <div class="health-item">
            <div class="health-label">
              {{ $t('platform.system.databaseStatus') }}
            </div>
            <q-chip
              :color="
                data.database_status === 'connected' ? 'positive' : 'negative'
              "
              text-color="white"
              :icon="
                data.database_status === 'connected' ? 'check_circle' : 'error'
              "
              class="health-value"
            >
              {{ $t(`platform.system.database.${data.database_status}`) }}
            </q-chip>
          </div>
        </div>

        <div class="health-footer">
          <div class="text-caption text-grey-6">
            {{ $t('platform.system.lastCheck') }}:
            {{ formatDateTime(data.last_check) }}
          </div>
        </div>
      </div>
    </template>

    <!-- Database Status -->
    <template v-else-if="isDatabaseStatus">
      <div class="database-section">
        <div class="database-header">
          <q-icon name="storage" class="q-mr-sm" />
          <span class="text-h6">{{
            $t('platform.system.databaseStatus')
          }}</span>
        </div>

        <div class="database-metrics">
          <div class="database-item">
            <q-icon
              :name="data.status === 'connected' ? 'check_circle' : 'error'"
              :color="data.status === 'connected' ? 'positive' : 'negative'"
              size="sm"
              class="q-mr-sm"
            />
            <span>{{ $t(`platform.system.database.${data.status}`) }}</span>
          </div>

          <template v-if="data.response_time_ms">
            <div class="database-item">
              <q-icon name="speed" size="sm" class="q-mr-sm" />
              <span
                >{{ $t('platform.system.responseTime') }}:
                {{ data.response_time_ms }}ms</span
              >
            </div>
          </template>

          <template v-if="data.total_tables">
            <div class="database-item">
              <q-icon name="table_chart" size="sm" class="q-mr-sm" />
              <span
                >{{ $t('platform.system.totalTables') }}:
                {{ data.total_tables }}</span
              >
            </div>
          </template>

          <template v-if="data.largest_table">
            <div class="database-item">
              <q-icon name="dataset" size="sm" class="q-mr-sm" />
              <span
                >{{ $t('platform.system.largestTable') }}:
                {{ data.largest_table }}</span
              >
            </div>
          </template>
        </div>

        <template v-if="data.error">
          <q-separator class="q-my-md" />
          <div class="database-error">
            <q-icon name="error_outline" color="negative" class="q-mr-sm" />
            <span class="text-negative">{{ data.error }}</span>
          </div>
        </template>
      </div>
    </template>

    <!-- Generic System Information -->
    <template v-else>
      <div class="system-info">
        <div class="system-header">
          <q-icon name="computer" class="q-mr-sm" />
          <span class="text-h6">{{ $t('platform.system.information') }}</span>
        </div>

        <div class="system-details">
          <div
            v-for="(value, key) in filteredData"
            :key="key"
            class="system-item"
          >
            <span class="system-label">{{ formatLabel(key) }}</span>
            <span class="system-value">{{ formatValue(value) }}</span>
          </div>
        </div>
      </div>
    </template>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BaseDashboardWidget } from '@/components/cards';

  const { t } = useI18n();

  // Props
  interface Props {
    data: Record<string, any>;
  }

  const props = defineProps<Props>();

  // Computed properties
  const isVersionInfo = computed(() => {
    return (
      props.data.app_version !== undefined ||
      props.data.build_number !== undefined
    );
  });

  const isSystemHealth = computed(() => {
    return (
      props.data.overall_status !== undefined ||
      props.data.error_count_24h !== undefined
    );
  });

  const isDatabaseStatus = computed(() => {
    return (
      props.data.status !== undefined &&
      props.data.response_time_ms !== undefined
    );
  });

  const environmentColor = computed(() => {
    switch (props.data.environment) {
      case 'production':
        return 'negative';
      case 'staging':
        return 'warning';
      case 'development':
        return 'info';
      default:
        return 'grey';
    }
  });

  const healthStatusColor = computed(() => {
    switch (props.data.overall_status) {
      case 'healthy':
        return 'positive';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'negative';
      default:
        return 'grey';
    }
  });

  const healthStatusIcon = computed(() => {
    switch (props.data.overall_status) {
      case 'healthy':
        return 'check_circle';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'help';
    }
  });

  const filteredData = computed(() => {
    const filtered: Record<string, any> = {};

    // Exclude complex objects and metadata
    const excludeKeys = [
      'dependencies',
      'last_check',
      'overall_status',
      'error_count_24h',
    ];

    Object.keys(props.data).forEach(key => {
      if (
        !excludeKeys.includes(key) &&
        typeof props.data[key] !== 'object' &&
        props.data[key] !== undefined
      ) {
        filtered[key] = props.data[key];
      }
    });

    return filtered;
  });

  // Methods
  function formatDateTime(dateString?: string): string {
    if (!dateString) return t('common.unknown');

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  function formatLabel(key: string): string {
    // Convert snake_case to readable labels
    const formatted = key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    // Try to get translation first
    const translationKey = `platform.system.${key}`;
    const translated = t(translationKey);

    return translated !== translationKey ? translated : formatted;
  }

  function formatValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? t('common.yes') : t('common.no');
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    return String(value);
  }
</script>

<style lang="scss" scoped>
  // Platform system widget content styling (wrapper now handled by BaseDashboardWidget)

  // Version Info Styles
  .version-section {
    .version-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--q-primary);
    }

    .version-details {
      .version-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        &:last-child {
          border-bottom: none;
        }

        .version-label {
          font-weight: 500;
          color: var(--q-dark);
        }

        .version-value {
          font-family: var(--font-mono);
        }
      }
    }

    .dependencies-section {
      .dependencies-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 0.5rem;

        .dependency-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem;
          background: rgba(var(--q-primary-rgb), 0.05);
          border-radius: 6px;
          border-left: 3px solid var(--q-primary);

          .dependency-name {
            font-weight: 500;
            color: var(--q-dark);
          }

          .dependency-version {
            font-family: var(--font-mono);
            font-size: 0.875rem;
            color: var(--q-primary);
          }
        }
      }
    }
  }

  // Health Status Styles
  .health-section {
    .health-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--q-primary);
    }

    .health-metrics {
      .health-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        &:last-child {
          border-bottom: none;
        }

        .health-label {
          font-weight: 500;
          color: var(--q-dark);
        }

        .health-value {
          font-weight: 600;
        }
      }
    }

    .health-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.05);
    }
  }

  // Database Status Styles
  .database-section {
    .database-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--q-primary);
    }

    .database-metrics {
      .database-item {
        display: flex;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .database-error {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: rgba(244, 67, 54, 0.05);
      border-radius: 6px;
      border-left: 3px solid var(--q-negative);
    }
  }

  // System Info Styles
  .system-info {
    .system-header {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
      color: var(--q-primary);
    }

    .system-details {
      .system-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        &:last-child {
          border-bottom: none;
        }

        .system-label {
          font-weight: 500;
          color: var(--q-dark);
        }

        .system-value {
          font-family: var(--font-mono);
          color: var(--q-primary);
        }
      }
    }
  }

  // Dark mode
  .body--dark {
    .version-details .version-item,
    .health-metrics .health-item,
    .database-metrics .database-item,
    .system-details .system-item {
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .health-footer {
      border-top-color: rgba(255, 255, 255, 0.1);
    }

    .dependencies-grid .dependency-item {
      background: rgba(255, 255, 255, 0.05);
    }

    .database-error {
      background: rgba(244, 67, 54, 0.1);
    }
  }

  // Responsive design
  @media (max-width: 480px) {
    .dependencies-grid {
      grid-template-columns: 1fr;
    }

    .version-item,
    .health-item,
    .database-item,
    .system-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
  }
</style>
