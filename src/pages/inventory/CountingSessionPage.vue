<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="sessionName"
        :subtitle="sessionType"
        icon="checklist"
        :back-button="true"
        @back="handleBack"
      >
        <template #actions>
          <div class="header-actions">
            <!-- Session Status -->
            <q-chip
              :color="statusColor"
              :icon="statusIcon"
              text-color="white"
              :label="formatStatus(session?.status)"
              size="md"
            />

            <!-- Progress Info -->
            <div v-if="session" class="progress-info">
              <span class="progress-text">
                {{ session.products_counted }}/{{
                  session.total_products_to_count
                }}
              </span>
              <q-linear-progress
                :value="
                  session.products_counted / session.total_products_to_count
                "
                color="primary"
                size="4px"
                class="progress-bar"
              />
            </div>

            <!-- Action Buttons -->
            <q-btn
              v-if="session?.status === 'active'"
              color="positive"
              icon="check"
              :label="$t('counting.completeSession')"
              @click="completeSession"
              :disable="!canComplete"
              unelevated
            />

            <q-btn
              v-if="session?.status === 'completed'"
              color="info"
              icon="verified"
              :label="$t('counting.approveSession')"
              @click="approveSession"
              unelevated
            />
          </div>
        </template>
      </PageTitle>
    </template>

    <!-- Main Content -->
    <div class="counting-session-content">
      <!-- Loading State -->
      <div v-if="countingStore.loading" class="loading-container">
        <q-spinner-dots size="xl" color="primary" />
        <p class="loading-text">{{ $t('counting.loadingSession') }}</p>
      </div>

      <!-- Session Not Found -->
      <BaseCard v-else-if="!session" variant="modern" header-color="negative">
        <q-card-section class="text-center">
          <q-icon name="error_outline" size="xl" color="negative" />
          <div class="text-h6 q-mt-md">
            {{ $t('counting.sessionNotFound') }}
          </div>
          <div class="text-subtitle2 q-mt-sm">
            {{ $t('counting.sessionNotFoundDescription') }}
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            color="primary"
            :label="$t('common.goBack')"
            @click="$router.push('/inventory/counting')"
          />
        </q-card-actions>
      </BaseCard>

      <!-- Session Content -->
      <template v-else>
        <!-- Session Summary -->
        <BaseCard variant="modern" class="session-summary">
          <template #header>
            <q-card-section class="session-header">
              <div class="text-h6">{{ $t('counting.sessionSummary') }}</div>
            </q-card-section>
          </template>

          <q-card-section class="summary-content">
            <div class="summary-grid">
              <div class="summary-item">
                <div class="summary-label">
                  {{ $t('counting.sessionType') }}
                </div>
                <div class="summary-value">
                  {{ formatSessionType(session.session_type) }}
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-label">
                  {{ $t('counting.totalProducts') }}
                </div>
                <div class="summary-value">
                  {{ session.total_products_to_count }}
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-label">
                  {{ $t('counting.countedProducts') }}
                </div>
                <div class="summary-value">{{ session.products_counted }}</div>
              </div>

              <div class="summary-item">
                <div class="summary-label">
                  {{ $t('counting.discrepancies') }}
                </div>
                <div
                  class="summary-value"
                  :class="{
                    'has-discrepancies': session.discrepancies_found > 0,
                  }"
                >
                  {{ session.discrepancies_found }}
                </div>
              </div>

              <div class="summary-item">
                <div class="summary-label">{{ $t('common.startedAt') }}</div>
                <div class="summary-value">
                  {{ formatDateTime(session.started_at) }}
                </div>
              </div>

              <div v-if="session.completed_at" class="summary-item">
                <div class="summary-label">{{ $t('common.completedAt') }}</div>
                <div class="summary-value">
                  {{ formatDateTime(session.completed_at) }}
                </div>
              </div>
            </div>
          </q-card-section>
        </BaseCard>

        <!-- Mobile Counting Interface -->
        <MobileCountingInterface
          v-if="session.status === 'active'"
          :session="session"
          :products="countingProducts"
          @product-counted="onProductCounted"
          @session-complete="onSessionComplete"
        />

        <!-- Counting Results Table (for completed sessions) -->
        <BaseCard v-else variant="modern" class="counting-results">
          <template #header>
            <q-card-section class="results-header">
              <div class="text-h6">{{ $t('counting.countingResults') }}</div>
              <div class="text-subtitle2">{{ $t('counting.viewResults') }}</div>
            </q-card-section>
          </template>

          <q-table
            :rows="countingEntries"
            :columns="resultsColumns"
            row-key="id"
            :pagination="pagination"
            :loading="entriesLoading"
            :no-data-label="$t('counting.noResultsFound')"
            class="results-table"
            flat
          >
            <!-- Product Column -->
            <template v-slot:body-cell-product="props">
              <q-td :props="props">
                <div class="product-info">
                  <div class="product-name">
                    {{ props.row.product?.name || t('common.unknownProduct') }}
                  </div>
                  <div class="product-sku">
                    {{ props.row.product?.sku || '-' }}
                  </div>
                </div>
              </q-td>
            </template>

            <!-- Variance Column -->
            <template v-slot:body-cell-variance="props">
              <q-td :props="props">
                <q-chip
                  :color="varianceColor(props.value)"
                  :icon="varianceIcon(props.value)"
                  text-color="white"
                  :label="formatVariance(props.value)"
                  size="sm"
                />
              </q-td>
            </template>

            <!-- Status Column -->
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="entryStatusColor(props.value)"
                  :label="formatEntryStatus(props.value)"
                  size="sm"
                />
              </q-td>
            </template>
          </q-table>
        </BaseCard>
      </template>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from 'src/stores/auth';
  import { useCountingStore } from 'src/stores/counting';
  import type {
    CountingSession,
    CountingEntry,
    CountingProduct,
  } from 'src/types/inventory';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import BaseCard from 'src/components/base/BaseCard.vue';

  // Lazy loaded components
  const MobileCountingInterface = defineAsyncComponent(
    () => import('src/components/inventory/MobileCountingInterface.vue')
  );

  // Props
  const props = defineProps<{
    sessionId: string;
  }>();

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const countingStore = useCountingStore();

  // Reactive state
  const countingProducts = ref<CountingProduct[]>([]);
  const countingEntries = ref<CountingEntry[]>([]);
  const entriesLoading = ref(false);

  // Pagination
  const pagination = ref({
    sortBy: 'created_at',
    descending: false,
    page: 1,
    rowsPerPage: 25,
  });

  // Computed properties
  const session = computed(() => countingStore.currentSession);

  const sessionName = computed(
    () => session.value?.name || t('counting.unknownSession')
  );

  const sessionType = computed(() =>
    session.value ? formatSessionType(session.value.session_type) : ''
  );

  const statusColor = computed(() => {
    if (!session.value) return 'grey';
    switch (session.value.status) {
      case 'active':
        return 'primary';
      case 'completed':
        return 'positive';
      case 'cancelled':
        return 'negative';
      case 'approved':
        return 'info';
      default:
        return 'grey';
    }
  });

  const statusIcon = computed(() => {
    if (!session.value) return 'help';
    switch (session.value.status) {
      case 'active':
        return 'play_circle';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      case 'approved':
        return 'verified';
      default:
        return 'help';
    }
  });

  const canComplete = computed(() => {
    return session.value && session.value.products_counted > 0;
  });

  const resultsColumns = computed(() => [
    {
      name: 'product',
      label: t('counting.product'),
      field: 'product_id',
      sortable: true,
      align: 'left' as const,
      style: 'width: 200px',
    },
    {
      name: 'system_quantity',
      label: t('counting.systemQuantity'),
      field: 'system_quantity',
      align: 'center' as const,
      sortable: true,
    },
    {
      name: 'counted_quantity',
      label: t('counting.countedQuantity'),
      field: 'counted_quantity',
      align: 'center' as const,
      sortable: true,
    },
    {
      name: 'variance',
      label: t('counting.variance'),
      field: 'variance',
      align: 'center' as const,
      sortable: true,
    },
    {
      name: 'status',
      label: t('common.status'),
      field: 'status',
      align: 'center' as const,
      sortable: true,
    },
  ]);

  // Methods
  const loadSession = async () => {
    try {
      await countingStore.fetchSessions(authStore.userProfile?.clinic_id || '');
      if (
        session.value?.status === 'completed' ||
        session.value?.status === 'approved'
      ) {
        await loadCountingEntries();
      }
    } catch (error) {
      console.error('Error loading session:', error);
      $q.notify({
        type: 'negative',
        message: t('counting.sessionLoadFailed'),
        position: 'top',
      });
    }
  };

  const loadCountingEntries = async () => {
    entriesLoading.value = true;
    try {
      await countingStore.fetchCountingEntries(props.sessionId);
      countingEntries.value = countingStore.countingEntries;
    } catch (error) {
      console.error('Error loading counting entries:', error);
    } finally {
      entriesLoading.value = false;
    }
  };

  const completeSession = () => {
    $q.dialog({
      title: t('counting.completeSession'),
      message: t('counting.confirmComplete'),
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await countingStore.updateSession(props.sessionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: authStore.user?.id || '',
        });

        $q.notify({
          type: 'positive',
          message: t('counting.sessionCompleted'),
          position: 'top',
        });

        await loadSession();
      } catch (error) {
        console.error('Error completing session:', error);
        $q.notify({
          type: 'negative',
          message: t('counting.completeFailed'),
          position: 'top',
        });
      }
    });
  };

  const approveSession = () => {
    $q.dialog({
      title: t('counting.approveSession'),
      message: t('counting.confirmApprove'),
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      try {
        await countingStore.updateSession(props.sessionId, {
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: authStore.user?.id || '',
        });

        $q.notify({
          type: 'positive',
          message: t('counting.sessionApproved'),
          position: 'top',
        });

        await loadSession();
      } catch (error) {
        console.error('Error approving session:', error);
        $q.notify({
          type: 'negative',
          message: t('counting.approveFailed'),
          position: 'top',
        });
      }
    });
  };

  const handleBack = () => {
    router.push('/inventory/counting');
  };

  const onProductCounted = () => {
    // Refresh session data to update progress
    loadSession();
  };

  const onSessionComplete = () => {
    completeSession();
  };

  // Formatting helpers
  const formatSessionType = (type: string): string => {
    return t(`counting.${type}`, type);
  };

  const formatStatus = (status?: string): string => {
    if (!status) return '';
    return t(`counting.status.${status}`, status);
  };

  const formatEntryStatus = (status: string): string => {
    return t(`counting.entryStatus.${status}`, status);
  };

  const formatDateTime = (dateString: string): string => {
    return new Intl.DateTimeFormat('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatVariance = (variance: number): string => {
    if (variance === 0) return '0';
    return variance > 0 ? `+${variance}` : `${variance}`;
  };

  const varianceColor = (variance: number): string => {
    if (variance === 0) return 'positive';
    return variance > 0 ? 'warning' : 'negative';
  };

  const varianceIcon = (variance: number): string => {
    if (variance === 0) return 'check';
    return variance > 0 ? 'arrow_upward' : 'arrow_downward';
  };

  const entryStatusColor = (status: string): string => {
    switch (status) {
      case 'verified':
        return 'positive';
      case 'discrepancy':
        return 'warning';
      case 'pending':
        return 'info';
      default:
        return 'grey';
    }
  };

  // Lifecycle
  onMounted(() => {
    loadSession();
  });

  onBeforeUnmount(() => {
    // Cleanup to prevent async operations after unmount
  });
</script>

<style lang="scss" scoped>
  .counting-session-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-4);

    .progress-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-1);

      .progress-text {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .progress-bar {
        width: 100px;
      }
    }

    @media (max-width: 768px) {
      flex-direction: column;
      gap: var(--space-3);
    }
  }

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    gap: var(--space-4);

    .loading-text {
      color: var(--text-muted);
      font-size: var(--text-base);
      margin: 0;
    }
  }

  .summary-content {
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-6);

      .summary-item {
        .summary-label {
          font-size: var(--text-sm);
          color: var(--text-muted);
          margin-bottom: var(--space-1);
        }

        .summary-value {
          font-size: var(--text-lg);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);

          &.has-discrepancies {
            color: var(--warning);
          }
        }
      }

      @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-4);
      }
    }
  }

  .product-info {
    .product-name {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
    }

    .product-sku {
      font-size: var(--text-sm);
      color: var(--text-muted);
    }
  }
</style>
