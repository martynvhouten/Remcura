<template>
  <div class="dashboard-widget-examples space-y-6 p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      BaseDashboardWidget Examples
    </h2>

    <!-- Example 1: Basic Widget with Title -->
    <div class="example-section">
      <h3 class="text-lg font-semibold mb-4">Basic Widget with Title</h3>
      <BaseDashboardWidget title="Recent Orders">
        <div class="p-4">
          <p class="text-gray-600">
            This is a basic widget with just a title and content.
          </p>
          <div class="mt-4 space-y-2">
            <div class="flex justify-between p-3 bg-gray-50 rounded">
              <span>Order #001</span>
              <span class="text-green-600">€45.00</span>
            </div>
            <div class="flex justify-between p-3 bg-gray-50 rounded">
              <span>Order #002</span>
              <span class="text-green-600">€32.50</span>
            </div>
          </div>
        </div>
      </BaseDashboardWidget>
    </div>

    <!-- Example 2: Widget with Actions -->
    <div class="example-section">
      <h3 class="text-lg font-semibold mb-4">Widget with Actions</h3>
      <BaseDashboardWidget title="Stock Alerts">
        <template #actions>
          <q-btn
            :loading="refreshing"
            flat
            round
            dense
            icon="refresh"
            @click="refreshData"
          />
          <q-btn
            flat
            round
            dense
            icon="settings"
            @click="showSettings = true"
          />
        </template>

        <div class="p-4">
          <div class="space-y-3">
            <div
              class="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded"
            >
              <div class="flex items-center">
                <q-icon name="warning" color="red" class="mr-2" />
                <span>Paracetamol 500mg</span>
              </div>
              <span class="text-red-600 text-sm">2 remaining</span>
            </div>
            <div
              class="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded"
            >
              <div class="flex items-center">
                <q-icon name="info" color="orange" class="mr-2" />
                <span>Ibuprofen 400mg</span>
              </div>
              <span class="text-orange-600 text-sm">8 remaining</span>
            </div>
          </div>
        </div>
      </BaseDashboardWidget>
    </div>

    <!-- Example 3: Loading State -->
    <div class="example-section">
      <h3 class="text-lg font-semibold mb-4">Loading State</h3>
      <BaseDashboardWidget title="Analytics Overview" :loading="isLoading">
        <div class="p-4">
          <p class="text-gray-600">
            This widget shows the loading overlay when the loading prop is true.
          </p>
          <q-btn
            flat
            class="mt-4"
            :label="isLoading ? 'Stop Loading' : 'Start Loading'"
            @click="toggleLoading"
          />
        </div>
      </BaseDashboardWidget>
    </div>

    <!-- Example 4: No Header -->
    <div class="example-section">
      <h3 class="text-lg font-semibold mb-4">Widget without Header</h3>
      <BaseDashboardWidget hide-header>
        <div class="text-center p-8">
          <q-icon name="dashboard" size="3rem" color="primary" class="mb-4" />
          <h4 class="text-xl font-semibold text-gray-900 mb-2">Clean Widget</h4>
          <p class="text-gray-600">
            This widget has no header section, perfect for clean metric
            displays.
          </p>
          <div class="mt-6 grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">125</div>
              <div class="text-sm text-gray-500">Products</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-green-600">€2,450</div>
              <div class="text-sm text-gray-500">Value</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-orange-600">18</div>
              <div class="text-sm text-gray-500">Low Stock</div>
            </div>
          </div>
        </div>
      </BaseDashboardWidget>
    </div>

    <!-- Example 5: Custom Styling -->
    <div class="example-section">
      <h3 class="text-lg font-semibold mb-4">Custom Styling</h3>
      <BaseDashboardWidget
        title="Performance Metrics"
        card-class="border-2 border-blue-200 bg-blue-50"
      >
        <template #actions>
          <q-chip color="positive" text-color="white" icon="trending_up">
            +15%
          </q-chip>
        </template>

        <div class="p-4">
          <div
            class="h-32 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center"
          >
            <div class="text-center text-white">
              <div class="text-3xl font-bold">98.5%</div>
              <div class="text-sm opacity-90">Uptime</div>
            </div>
          </div>
        </div>
      </BaseDashboardWidget>
    </div>

    <!-- Settings Dialog -->
    <q-dialog v-model="showSettings">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Widget Settings</div>
        </q-card-section>
        <q-card-section>
          <p>Configure your widget settings here.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="showSettings = false" />
          <q-btn
            color="primary"
            :label="$t('common.save')"
            @click="saveSettings"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BaseDashboardWidget } from './index';

  // State
  const isLoading = ref(false);
  const refreshing = ref(false);
  const showSettings = ref(false);

  // Methods
  function toggleLoading() {
    isLoading.value = !isLoading.value;
  }

  async function refreshData() {
    refreshing.value = true;
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    refreshing.value = false;
  }
</script>

<style scoped>
  .example-section {
    @apply mb-8;
  }

  .dashboard-widget-examples h3 {
    color: #374151;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }
</style>
