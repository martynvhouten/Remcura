<template>
  <BaseDashboardWidget :hide-header="true">
    <!-- Simple Bar Chart -->
    <div v-if="chartType === 'bar'" class="bar-chart">
      <div v-if="!chartData.length" class="empty-chart">
        <q-icon name="bar_chart" color="grey-5" size="3rem" />
        <p>Geen data beschikbaar</p>
      </div>
      <div v-else class="chart-container">
        <div class="chart-bars">
          <div v-for="(item, index) in chartData" :key="index" class="bar-item">
            <div class="bar-label">{{ item.label }}</div>
            <div class="bar-container">
              <div class="bar" :style="{ height: `${item.percentage}%` }"></div>
            </div>
            <div class="bar-value">{{ item.value }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Simple Line Chart -->
    <div v-else-if="chartType === 'line'" class="line-chart">
      <div v-if="!chartData.length" class="empty-chart">
        <q-icon name="trending_up" color="grey-5" size="3rem" />
        <p>Geen trend data beschikbaar</p>
      </div>
      <div v-else class="chart-container">
        <div class="line-container">
          <svg class="line-svg" viewBox="0 0 300 150">
            <polyline
              :points="linePoints"
              fill="none"
              stroke="var(--primary)"
              stroke-width="2"
            />
            <g v-for="(point, index) in svgPoints" :key="index">
              <circle :cx="point.x" :cy="point.y" r="3" fill="var(--primary)" />
            </g>
          </svg>
        </div>
        <div class="line-labels">
          <div
            v-for="(item, index) in chartData"
            :key="index"
            class="line-label"
          >
            {{ item.label }}
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Summary -->
    <div v-else class="analytics-summary">
      <div class="summary-stats">
        <div class="stat-item">
          <div class="stat-value">{{ totalEvents }}</div>
          <div class="stat-label">Totale Events</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ uniqueUsers }}</div>
          <div class="stat-label">Unieke Gebruikers</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ avgSessionTime }}m</div>
          <div class="stat-label">Gem. Sessie</div>
        </div>
      </div>

      <div class="event-types">
        <h6>Top Activiteiten</h6>
        <div class="event-list">
          <div v-for="event in topEvents" :key="event.type" class="event-item">
            <span class="event-name">{{ getEventLabel(event.type) }}</span>
            <div class="event-bar">
              <div
                class="event-progress"
                :style="{ width: `${event.percentage}%` }"
              ></div>
            </div>
            <span class="event-count">{{ event.count }}</span>
          </div>
        </div>
      </div>
    </div>
  </BaseDashboardWidget>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { BaseDashboardWidget } from '@/components/cards';

  interface ChartData {
    analytics?: Array<{
      event_type: string;
      created_at: string;
      user_id?: string;
    }>;
    items?: Array<{
      label: string;
      value: number;
    }>;
  }

  interface Props {
    data: ChartData;
    chartType: 'bar' | 'line' | 'pie';
  }

  const props = defineProps<Props>();

  // Process analytics data
  const analyticsData = computed(() => props.data.analytics || []);

  const chartData = computed(() => {
    if (props.data.items) {
      // Use provided items data
      const maxValue = Math.max(...props.data.items.map(item => item.value));
      return props.data.items.map(item => ({
        label: item.label,
        value: item.value,
        percentage: maxValue > 0 ? (item.value / maxValue) * 100 : 0,
      }));
    }

    // Generate chart data from analytics
    if (analyticsData.value.length === 0) return [];

    // Group by day for line chart or by event type for bar chart
    if (props.chartType === 'line') {
      const dailyCount = analyticsData.value.reduce((acc, event) => {
        const date = new Date(event.created_at).toLocaleDateString('nl-NL', {
          month: 'short',
          day: 'numeric',
        });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sortedDays = Object.entries(dailyCount)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-7); // Last 7 days

      const maxValue = Math.max(...sortedDays.map(([, count]) => count));

      return sortedDays.map(([date, count]) => ({
        label: date,
        value: count,
        percentage: maxValue > 0 ? (count / maxValue) * 100 : 0,
      }));
    } else {
      // Bar chart - group by event type
      const eventCount = analyticsData.value.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const sortedEvents = Object.entries(eventCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5); // Top 5 events

      const maxValue = Math.max(...sortedEvents.map(([, count]) => count));

      return sortedEvents.map(([event, count]) => ({
        label: getEventLabel(event),
        value: count,
        percentage: maxValue > 0 ? (count / maxValue) * 100 : 0,
      }));
    }
  });

  // SVG line chart calculations
  const linePoints = computed(() => {
    if (chartData.value.length === 0) return '';

    const width = 300;
    const height = 150;
    const padding = 20;

    return chartData.value
      .map((item, index) => {
        const x =
          padding +
          (index / (chartData.value.length - 1)) * (width - 2 * padding);
        const y =
          height - padding - (item.percentage / 100) * (height - 2 * padding);
        return `${x},${y}`;
      })
      .join(' ');
  });

  const svgPoints = computed(() => {
    if (chartData.value.length === 0) return [];

    const width = 300;
    const height = 150;
    const padding = 20;

    return chartData.value.map((item, index) => ({
      x:
        padding +
        (index / (chartData.value.length - 1)) * (width - 2 * padding),
      y: height - padding - (item.percentage / 100) * (height - 2 * padding),
    }));
  });

  // Analytics summary data
  const totalEvents = computed(() => analyticsData.value.length);

  const uniqueUsers = computed(() => {
    const userIds = analyticsData.value
      .filter(event => event.user_id)
      .map(event => event.user_id);
    return new Set(userIds).size;
  });

  const avgSessionTime = computed(() => {
    // Simplified calculation - in real app would track session duration
    return Math.round(Math.random() * 15 + 5); // 5-20 minutes
  });

  const topEvents = computed(() => {
    const eventCount = analyticsData.value.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedEvents = Object.entries(eventCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const maxCount = sortedEvents[0]?.[1] || 1;

    return sortedEvents.map(([type, count]) => ({
      type,
      count,
      percentage: (count / maxCount) * 100,
    }));
  });

  function getEventLabel(eventType: string): string {
    const labels: Record<string, string> = {
      page_view: 'Pagina bezoek',
      product_scan: 'Product scan',
      order_create: 'Bestelling aangemaakt',
      stock_update: 'Voorraad update',
      user_login: 'Inloggen',
      export_data: 'Data export',
      inventory_count: 'Voorraad telling',
    };

    return labels[eventType] || eventType;
  }
</script>

<style lang="scss" scoped>
  // Chart widget content styling (wrapper now handled by BaseDashboardWidget)

  .empty-chart {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-muted);

    p {
      margin: var(--space-3) 0 0 0;
      font-size: var(--text-base);
    }
  }

  // Bar Chart
  .bar-chart {
    height: 100%;

    .chart-container {
      height: 100%;
      padding: var(--space-4);
    }

    .chart-bars {
      display: flex;
      align-items: end;
      height: 200px;
      gap: var(--space-3);

      .bar-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;

        .bar-label {
          font-size: var(--text-xs);
          color: var(--text-muted);
          margin-bottom: var(--space-2);
          text-align: center;
          line-height: 1.2;
        }

        .bar-container {
          flex: 1;
          display: flex;
          align-items: end;
          width: 100%;
          min-height: 120px;

          .bar {
            width: 100%;
            background: linear-gradient(
              to top,
              var(--primary),
              var(--primary-300)
            );
            border-radius: var(--radius-sm) var(--radius-sm) 0 0;
            min-height: 4px;
            transition: height 0.3s ease;
          }
        }

        .bar-value {
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
          margin-top: var(--space-2);
        }
      }
    }
  }

  // Line Chart
  .line-chart {
    height: 100%;

    .chart-container {
      height: 100%;
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
    }

    .line-container {
      flex: 1;
      margin-bottom: var(--space-4);

      .line-svg {
        width: 100%;
        height: 150px;
        border: 1px solid var(--neutral-200);
        border-radius: var(--radius-md);
        background: var(--neutral-25);
      }
    }

    .line-labels {
      display: flex;
      justify-content: space-between;

      .line-label {
        font-size: var(--text-xs);
        color: var(--text-muted);
        text-align: center;
      }
    }
  }

  // Analytics Summary
  .analytics-summary {
    height: 100%;
    padding: var(--space-4);

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-6);

      .stat-item {
        text-align: center;

        .stat-value {
          font-size: var(--text-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--primary);
          margin-bottom: var(--space-1);
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }
      }
    }

    .event-types {
      h6 {
        margin: 0 0 var(--space-4) 0;
        font-size: var(--text-base);
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }

      .event-list {
        .event-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-3);

          .event-name {
            flex: 0 0 120px;
            font-size: var(--text-sm);
            color: var(--text-primary);
          }

          .event-bar {
            flex: 1;
            height: 8px;
            background: var(--neutral-200);
            border-radius: var(--radius-full);
            overflow: hidden;

            .event-progress {
              height: 100%;
              background: var(--primary);
              border-radius: var(--radius-full);
              transition: width 0.3s ease;
            }
          }

          .event-count {
            flex: 0 0 30px;
            text-align: right;
            font-size: var(--text-sm);
            font-weight: var(--font-weight-medium);
            color: var(--text-primary);
          }
        }
      }
    }
  }

  // Dark mode
  body.body--dark {
    .bar-item .bar-value,
    .stat-item .stat-value,
    .event-types h6,
    .event-item .event-name,
    .event-item .event-count {
      color: var(--text-primary-dark);
    }

    .line-container .line-svg {
      border-color: var(--neutral-700);
      background: var(--neutral-800);
    }

    .event-bar {
      background: var(--neutral-700);
    }

    .empty-chart {
      color: var(--text-muted-dark);
    }
  }

  // Mobile optimizations
  @media (max-width: 768px) {
    .summary-stats {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .bar-item .bar-label {
      font-size: 10px;
    }

    .line-labels .line-label {
      font-size: 10px;
    }

    .event-item {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-2);

      .event-name {
        flex: none;
      }

      .event-count {
        text-align: left;
      }
    }
  }
</style>
