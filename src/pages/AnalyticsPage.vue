<template>
  <PageLayout>
    <template #header>
      <PageTitle 
        :title="$t('analyticsPage.title')"
        :subtitle="$t('analyticsPage.subtitle')"
        icon="insights"
      >
        <template #actions>
          <q-btn
            v-bind="exportBtn"
            @click="exportAnalytics"
            :loading="exporting"
          />
        </template>
      </PageTitle>
    </template>

    <!-- Date Range Filter -->
    <div class="row q-gutter-md q-mb-lg">
      <q-select
        v-model="selectedPeriod"
        :options="periodOptions"
        :label="$t('analyticsPage.period')"
        style="min-width: 200px"
        outlined
        dense
        @update:model-value="loadAnalytics"
      />
    </div>

    <!-- Key Metrics Cards -->
    <div class="row q-gutter-md q-mb-lg">
      <div class="col-12 col-md-6 col-lg-3">
        <BaseCard 
          variant="elevated" 
          size="sm" 
          padding="sm"
          content-class="text-center"
        >
          <div class="text-h6 text-primary">{{ summary.totalEvents || 0 }}</div>
          <div class="text-body2 text-grey-7">{{ $t('analyticsPage.totalEvents') }}</div>
          <q-icon name="event" size="md" class="text-primary q-mt-sm" />
        </BaseCard>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <BaseCard 
          variant="elevated" 
          size="sm" 
          padding="sm"
          content-class="text-center"
        >
          <div class="text-h6 text-green">{{ summary.activeUsers || 0 }}</div>
          <div class="text-body2 text-grey-7">{{ $t('analyticsPage.activeUsers') }}</div>
          <q-icon name="people" size="md" class="text-green q-mt-sm" />
        </BaseCard>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <BaseCard 
          variant="elevated" 
          size="sm" 
          padding="sm"
          content-class="text-center"
        >
          <div class="text-h6 text-orange">{{ orderMetrics.totalOrders || 0 }}</div>
          <div class="text-body2 text-grey-7">{{ $t('analyticsPage.totalOrders') }}</div>
          <q-icon name="shopping_cart" size="md" class="text-orange q-mt-sm" />
        </BaseCard>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <BaseCard 
          variant="elevated" 
          size="sm" 
          padding="sm"
          content-class="text-center"
        >
          <div class="text-h6 text-purple">{{ productMetrics.totalUpdates || 0 }}</div>
          <div class="text-body2 text-grey-7">{{ $t('analyticsPage.productUpdates') }}</div>
          <q-icon name="inventory" size="md" class="text-purple q-mt-sm" />
        </BaseCard>
      </div>

      <div class="col-12 col-md-6 col-lg-3">
        <q-card class="analytics-card">
          <q-card-section class="text-center">
            <div class="text-h6 text-red">{{ productMetrics.lowStockAlerts || 0 }}</div>
            <div class="text-body2 text-grey-7">{{ $t('analyticsPage.lowStockAlerts') }}</div>
            <q-icon name="warning" size="md" class="text-red q-mt-sm" />
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-gutter-md q-mb-lg">
      <!-- Daily Activity Summary -->
      <div class="col-12 col-lg-8">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('analyticsPage.dailyActivity') }}</div>
            <div v-if="!loading && dailyChartData.length > 0" class="activity-summary">
              <div v-for="item in dailyChartData.slice(-7)" :key="item.date" class="activity-item q-mb-sm">
                <div class="row items-center">
                  <div class="col text-body2">{{ new Date(item.date).toLocaleDateString() }}</div>
                  <div class="col-auto text-weight-bold">{{ item.count }}</div>
                </div>
                <q-linear-progress 
                  :value="dailyChartData.length > 0 ? item.count / Math.max(...dailyChartData.map(d => d.count)) : 0" 
                  color="primary"
                  size="4px"
                  class="q-mt-xs"
                />
              </div>
            </div>
            <div v-else-if="loading" class="activity-placeholder">
              <q-spinner-dots size="50px" color="primary" />
            </div>
            <div v-else class="activity-placeholder">
              <div class="text-grey-6">No activity data available for selected period</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Top Events Chart -->
      <div class="col-12 col-lg-4">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('analyticsPage.topEvents') }}</div>
            <div v-if="summary.topEvents && summary.topEvents.length > 0">
                              <div v-for="([event, count], index) in (summary.topEvents || []).slice(0, 5)" :key="event" class="q-mb-sm">
                <div class="row items-center">
                  <div class="col text-body2">{{ formatEventType(event) }}</div>
                  <div class="col-auto text-weight-bold">{{ count }}</div>
                </div>
                <q-linear-progress 
                  :value="summary.topEvents && summary.topEvents.length > 0 && summary.topEvents[0] ? count / summary.topEvents[0][1] : 0" 
                  color="primary"
                  size="4px"
                  class="q-mt-xs"
                />
              </div>
            </div>
            <div v-else class="text-grey-6 text-center q-pa-md">
              No event data available
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Analytics Tables -->
    <div class="row q-gutter-md q-mb-lg">
      <!-- Frequently Ordered Items -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('analyticsPage.frequentlyOrderedItems') }}</div>
            <q-table
              :rows="orderMetrics.frequentlyOrderedItems || []"
              :columns="frequentlyOrderedColumns"
              row-key="product_id"
              :loading="loading"
              flat
              bordered
            >
              <template v-slot:no-data="{ message }">
                <div class="full-width row flex-center text-grey q-gutter-sm">
                  <q-icon size="2em" name="shopping_cart" />
                  <span>{{ message || 'No frequently ordered items found' }}</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Most Updated Products -->
      <div class="col-12 col-lg-6">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('analyticsPage.mostUpdatedProducts') }}</div>
            <q-table
              :rows="productMetrics.mostUpdatedProducts || []"
              :columns="mostUpdatedProductsColumns"
              row-key="product_id"
              :loading="loading"
              flat
              bordered
            >
              <template v-slot:no-data="{ message }">
                <div class="full-width row flex-center text-grey q-gutter-sm">
                  <q-icon size="2em" name="inventory" />
                  <span>{{ message || 'No product updates found' }}</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- User Activity Table -->
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section>
            <div class="text-h6 q-mb-md">{{ $t('analyticsPage.userActivity') }}</div>
            <q-table
              :rows="userActivity.userList || []"
              :columns="userActivityColumns"
              row-key="user_id"
              :loading="loading"
              flat
              bordered
            >
              <template v-slot:no-data="{ message }">
                <div class="full-width row flex-center text-grey q-gutter-sm">
                  <q-icon size="2em" name="people" />
                  <span>{{ message || 'No user activity found' }}</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Loading State -->
    <q-inner-loading :showing="loading">
      <q-spinner-dots size="50px" color="primary" />
    </q-inner-loading>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useButtons } from 'src/composables/useButtons'
import PageTitle from 'src/components/PageTitle.vue'
import PageLayout from 'src/components/PageLayout.vue'
import BaseCard from 'src/components/base/BaseCard.vue'
import { AnalyticsService } from 'src/services/analytics'
import { monitoringService } from 'src/services/monitoring'
import type { AnalyticsSummary, OrderMetrics, ProductMetrics, UserActivityMetrics } from 'src/services/analytics'

const $q = useQuasar()
const { t } = useI18n()
const { quickActions } = useButtons()

// Button configurations
const exportBtn = computed(() => quickActions.export({
  label: t('analyticsPage.export'),
  variant: 'outline'
}))

// Refs
const loading = ref(false)
const exporting = ref(false)

// Data
const selectedPeriod = ref('7d')
const summary = ref<AnalyticsSummary>({
  totalEvents: 0,
  activeUsers: 0,
  totalOrders: 0,
  productUpdates: 0,
  topEvents: [],
  userActivity: {},
  dailyActivity: {}
})
const orderMetrics = ref<OrderMetrics>({
  totalOrders: 0,
  totalOrderValue: 0,
  averageOrderSize: 0,
  ordersByStatus: {},
  frequentlyOrderedItems: [],
  orderTrends: {}
})
const productMetrics = ref<ProductMetrics>({
  totalUpdates: 0,
  productsScanned: 0,
  lowStockAlerts: 0,
  stockEntryTrends: {},
  mostUpdatedProducts: []
})
const userActivity = ref<UserActivityMetrics>({
  activeUsers: 0,
  totalSessions: 0,
  averageSessionDuration: 0,
  userList: []
})
const dailyChartData = ref<Array<{ date: string; count: number }>>([])

// Options
const periodOptions = [
  { label: t('analyticsPage.periods.7d'), value: '7d' },
  { label: t('analyticsPage.periods.30d'), value: '30d' },
  { label: t('analyticsPage.periods.90d'), value: '90d' },
  { label: t('analyticsPage.periods.1y'), value: '1y' }
]

// Table Columns
const userActivityColumns = [
  {
    name: 'user_id',
    label: t('analyticsPage.user'),
    align: 'left' as const,
    field: 'user_id',
    sortable: true,
    format: (val: string) => val.slice(0, 8) + '...'
  },
  {
    name: 'activity_count',
    label: t('analyticsPage.activityCount'),
    align: 'right' as const,
    field: 'activity_count',
    sortable: true
  },
  {
    name: 'total_events',
    label: t('analyticsPage.totalEvents'),
    align: 'right' as const,
    field: 'total_events',
    sortable: true
  },
  {
    name: 'last_activity',
    label: t('analyticsPage.lastActivity'),
    align: 'left' as const,
    field: 'last_activity',
    sortable: true,
    format: (val: string) => {
      if (!val) return '-'
      return new Date(val).toLocaleDateString()
    }
  }
]

const frequentlyOrderedColumns = [
  {
    name: 'product_name',
    label: t('analyticsPage.product'),
    align: 'left' as const,
    field: 'product_name',
    sortable: true
  },
  {
    name: 'total_quantity',
    label: t('analyticsPage.totalQuantity'),
    align: 'right' as const,
    field: 'total_quantity',
    sortable: true
  },
  {
    name: 'order_count',
    label: t('analyticsPage.orderCount'),
    align: 'right' as const,
    field: 'order_count',
    sortable: true
  }
]

const mostUpdatedProductsColumns = [
  {
    name: 'product_name',
    label: t('analyticsPage.product'),
    align: 'left' as const,
    field: 'product_name',
    sortable: true
  },
  {
    name: 'update_count',
    label: t('analyticsPage.updates'),
    align: 'right' as const,
    field: 'update_count',
    sortable: true
  }
]

// Methods
const calculateDateRange = (period: string) => {
  const endDate = new Date()
  const startDate = new Date()
  
  switch (period) {
    case '7d':
      startDate.setDate(endDate.getDate() - 7)
      break
    case '30d':
      startDate.setDate(endDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(endDate.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(endDate.getFullYear() - 1)
      break
  }

  return {
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString()
  }
}

const loadAnalytics = async () => {
  loading.value = true
  try {
    // Track page view
    await monitoringService.trackEvent('analytics_viewed', {
      period: selectedPeriod.value
    })

    const dateRange = calculateDateRange(selectedPeriod.value)

    // Load analytics data in parallel
    const [summaryData, orderData, productData, userActivityData] = await Promise.all([
      AnalyticsService.getSummary(dateRange),
      AnalyticsService.getOrderMetrics(dateRange),
      AnalyticsService.getProductMetrics(dateRange),
      AnalyticsService.getUserActivityMetrics(dateRange)
    ])

    summary.value = summaryData
    orderMetrics.value = orderData
    productMetrics.value = productData
    userActivity.value = userActivityData

    // Process daily chart data
    const dailyData = Object.entries(summary.value.dailyActivity || {})
      .map(([date, count]) => ({ date, count: count as number }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    dailyChartData.value = dailyData

    // Data processing complete

  } catch (error) {
    console.error('Error loading analytics:', error)
    $q.notify({
      type: 'negative',
      message: t('analyticsPage.loadError') || 'Failed to load analytics data'
    })
  } finally {
    loading.value = false
  }
}

const formatEventType = (eventType: string) => {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const exportAnalytics = async () => {
  exporting.value = true
  try {
    const exportData = {
      period: selectedPeriod.value,
      exportedAt: new Date().toISOString(),
      summary: summary.value,
      orderMetrics: orderMetrics.value,
      productMetrics: productMetrics.value,
      userActivity: userActivity.value
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    await monitoringService.trackEvent('analytics_exported', {
      period: selectedPeriod.value
    })

    $q.notify({
      type: 'positive',
      message: t('analyticsPage.exportSuccess') || 'Analytics exported successfully'
    })
  } catch (error) {
    console.error('Error exporting analytics:', error)
    $q.notify({
      type: 'negative',
      message: t('analyticsPage.exportError') || 'Failed to export analytics'
    })
  } finally {
    exporting.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped>
.analytics-card {
  min-height: 120px;
  transition: transform 0.2s ease;
}

.analytics-card:hover {
  transform: translateY(-2px);
}

.activity-summary {
  min-height: 200px;
}

.activity-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8px;
  flex-direction: column;
}
</style> 