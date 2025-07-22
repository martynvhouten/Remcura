<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="dashboardConfig.title"
        :subtitle="dashboardConfig.subtitle"
        icon="space_dashboard"
      >
        <template #actions>
          <!-- Demo Role Switcher -->
          <q-select
            v-model="selectedDemoRole"
            :options="demoRoleOptions"
            option-value="value"
            option-label="label"
            dense
            outlined
            style="min-width: 250px; margin-right: 12px;"
            label="Switch Demo Rol"
            @update:model-value="switchDemoRole"
            color="primary"
            :loading="loading"
            class="demo-role-switcher"
          >
            <template #prepend>
              <q-icon name="swap_horiz" />
            </template>
            
            <template #option="scope">
              <q-item v-bind="scope.itemProps" class="role-option-item">
                <q-item-section avatar>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            
            <template #selected-item="scope">
              <div class="row items-center q-gutter-xs">
                <q-icon :name="scope.opt.icon" size="sm" />
                <span>{{ scope.opt.label }}</span>
              </div>
            </template>
          </q-select>
          
          <q-btn
            flat
            round
            dense
            icon="refresh"
            @click="refreshDashboard"
            :loading="loading"
          >
            <q-tooltip>Dashboard vernieuwen</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="tune"
            @click="showCustomizeDialog = true"
          >
            <q-tooltip>Dashboard aanpassen</q-tooltip>
          </q-btn>
        </template>
      </PageTitle>
    </template>

    <!-- Role-based Dashboard Content -->
    <div class="dashboard-container">
      <!-- Quick Actions Bar -->
      <div v-if="quickActions.length" class="quick-actions-section">
        <div class="quick-actions-grid">
          <q-btn
            v-for="action in quickActions"
            :key="action.id"
            :color="action.color"
            :icon="action.icon"
            :label="action.label"
            @click="$router.push(action.route)"
            unelevated
            no-caps
            class="quick-action-btn"
          />
        </div>
      </div>

      <!-- Alerts Section -->
      <div v-if="alerts.length" class="alerts-section">
        <q-banner
          v-for="alert in alerts"
          :key="alert.id"
          :class="`banner-${alert.type}`"
          rounded
          class="alert-banner"
        >
          <template #avatar>
            <q-icon 
              :name="getAlertIcon(alert.type)" 
              :color="alert.type === 'warning' ? 'warning' : alert.type"
            />
          </template>
          {{ alert.message }}
          <template v-if="alert.action" #action>
            <q-btn
              flat
              :label="alert.actionLabel"
              @click="$router.push(alert.action)"
            />
          </template>
        </q-banner>
      </div>

      <!-- Widgets Grid -->
      <transition name="dashboard-transition" mode="out-in">
        <div :key="selectedDemoRole" class="widgets-grid">
          <div
            v-for="widget in widgets"
            :key="widget.id"
            :class="getWidgetGridClass(widget)"
            class="widget-grid-item"
          >
            <DashboardWidget
              :widget="widget"
              :loading="loading"
            />
          </div>
        </div>
      </transition>

      <!-- Empty State -->
      <div v-if="!widgets.length && !loading" class="empty-dashboard">
        <q-icon name="widgets" size="4rem" color="grey-5" />
        <h5>Dashboard configureren</h5>
        <p>Voeg widgets toe om uw dashboard te personaliseren</p>
        <q-btn
          color="primary"
          label="Widgets toevoegen"
          @click="showCustomizeDialog = true"
        />
      </div>
    </div>

    <!-- Customize Dialog -->
    <q-dialog v-model="showCustomizeDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Dashboard aanpassen</div>
        </q-card-section>
        <q-card-section>
          <p>Personalisatie opties komen binnenkort beschikbaar.</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Sluiten" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useAuthStore } from 'src/stores/auth';
  import { dashboardService } from 'src/services/dashboard';
  import type { DashboardData, DashboardWidget as DashboardWidgetType } from 'src/services/dashboard';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import DashboardWidget from 'src/components/dashboard/DashboardWidget.vue';

  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();

  // State
  const loading = ref(false);
  const showCustomizeDialog = ref(false);
  const dashboardData = ref<DashboardData | null>(null);

  // Computed properties
  const userProfile = computed(() => authStore.userProfile);
  const userRole = computed(() => userProfile.value?.role || 'assistant');
  const selectedDemoRole = ref(userRole.value);
  
  const dashboardConfig = computed(() => 
    dashboardService.getRoleConfig(selectedDemoRole.value)
  );

  const widgets = computed(() => dashboardData.value?.widgets || []);
  const quickActions = computed(() => dashboardData.value?.quickActions || []);
  const alerts = computed(() => dashboardData.value?.alerts || []);
  
  const demoRoleOptions = computed(() => [
    { 
      label: '🩺 Assistent - Voorraad & Bestellingen', 
      value: 'assistant',
      icon: 'medical_services'
    },
    { 
      label: '📊 Manager - Analytics & Overzichten', 
      value: 'manager',
      icon: 'analytics'
    },
    { 
      label: '👑 Eigenaar - Volledige Controle', 
      value: 'owner',
      icon: 'admin_panel_settings'
    }
  ]);

  // Methods
  function getWidgetGridClass(widget: DashboardWidgetType): string {
    const baseClass = 'widget-grid-item';
    const sizeClass = `widget-${widget.size}`;
    return `${baseClass} ${sizeClass}`;
  }

  function getAlertIcon(type: string): string {
    switch (type) {
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      case 'success': return 'check_circle';
      default: return 'info';
    }
  }

  async function loadDashboard() {
    try {
      loading.value = true;
      console.log('📊 Loading dashboard for role:', selectedDemoRole.value);
      dashboardData.value = await dashboardService.getDashboardData(selectedDemoRole.value);
      console.log('✅ Dashboard loaded:', dashboardData.value?.widgets?.length, 'widgets');
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      $q.notify({
        type: 'negative',
        message: 'Fout bij laden dashboard',
        caption: 'Probeer de pagina te vernieuwen'
      });
    } finally {
      loading.value = false;
    }
  }

  async function refreshDashboard() {
    await loadDashboard();
    $q.notify({
      type: 'positive',
      message: 'Dashboard vernieuwd',
      timeout: 1000
    });
  }

  async function switchDemoRole(newRole: string | any) {
    // Extract string value if object is passed
    const roleValue = typeof newRole === 'object' ? newRole.value : newRole;
    
    console.log('🔄 Switching role from', selectedDemoRole.value, 'to', roleValue);
    
    if (roleValue === selectedDemoRole.value) return;
    
    selectedDemoRole.value = roleValue;
    
    // Reload dashboard with new role
    try {
      loading.value = true;
      
      // Clear current data first for visual effect
      dashboardData.value = null;
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Load new dashboard data
      dashboardData.value = await dashboardService.getDashboardData(roleValue);
      
      $q.notify({
        type: 'positive',
        message: `Omgeschakeld naar ${getDemoRoleLabel(roleValue)}`,
        caption: 'Dashboard is aangepast aan je nieuwe rol',
        timeout: 2500,
        icon: 'swap_horiz'
      });
    } catch (error) {
      console.error('Failed to switch demo role:', error);
      $q.notify({
        type: 'negative',
        message: 'Fout bij wisselen van rol',
        caption: 'Probeer het opnieuw'
      });
    } finally {
      loading.value = false;
    }
  }

  function getDemoRoleLabel(role: string): string {
    switch (role) {
      case 'assistant': return 'Assistent Dashboard';
      case 'manager': return 'Manager Dashboard';
      case 'owner': return 'Eigenaar Dashboard';
      default: return 'Dashboard';
    }
  }

  // Watchers
  watch(userRole, (newRole) => {
    // Only update if we haven't manually selected a different role
    if (selectedDemoRole.value === userRole.value) {
      selectedDemoRole.value = newRole;
    }
  }, { immediate: true });

  // Lifecycle
  onMounted(() => {
    loadDashboard();
  });
</script>

<style lang="scss" scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

// Quick Actions Section
.quick-actions-section {
  .quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    
    .quick-action-btn {
      min-height: 60px;
      font-weight: var(--font-weight-medium);
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }
  }
}

// Alerts Section
.alerts-section {
  .alert-banner {
    margin-bottom: var(--space-3);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    &.banner-warning {
      background: var(--warning-50);
      border-color: var(--warning-200);
    }
    
    &.banner-error {
      background: var(--negative-50);
      border-color: var(--negative-200);
    }
    
    &.banner-info {
      background: var(--info-50);
      border-color: var(--info-200);
    }
  }
}

// Widgets Grid
.widgets-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-6);
  auto-rows: min-content;
  
  .widget-grid-item {
    &.widget-small {
      grid-column: span 6;
      
      @media (max-width: 1024px) {
        grid-column: span 12;
      }
    }
    
    &.widget-medium {
      grid-column: span 6;
      
      @media (max-width: 768px) {
        grid-column: span 12;
      }
    }
    
    &.widget-large {
      grid-column: span 12;
    }
  }
}

// Empty State
.empty-dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-8);
  margin: var(--space-8) 0;
  
  h5 {
    margin: var(--space-4) 0 var(--space-2) 0;
    color: var(--text-primary);
    font-weight: var(--font-weight-semibold);
  }
  
  p {
    margin: 0 0 var(--space-6) 0;
    color: var(--text-muted);
    max-width: 400px;
  }
}

// Dark mode
body.body--dark {
  .alerts-section .alert-banner {
    &.banner-warning {
      background: var(--warning-900);
      border-color: var(--warning-700);
    }
    
    &.banner-error {
      background: var(--negative-900);
      border-color: var(--negative-700);
    }
    
    &.banner-info {
      background: var(--info-900);
      border-color: var(--info-700);
    }
  }
  
  .empty-dashboard h5 {
    color: var(--text-primary-dark);
  }
}

// Mobile optimizations
@media (max-width: 768px) {
  .dashboard-container {
    gap: var(--space-4);
  }
  
  .quick-actions-section .quick-actions-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
    
    .quick-action-btn {
      min-height: 50px;
      font-size: var(--text-sm);
    }
  }
  
  .widgets-grid {
    gap: var(--space-4);
    
    .widget-grid-item {
      grid-column: span 12 !important;
    }
  }
  
  .empty-dashboard {
    padding: var(--space-6);
    margin: var(--space-6) 0;
  }
}

// Enhanced responsive grid
@media (min-width: 1400px) {
  .widgets-grid {
    grid-template-columns: repeat(16, 1fr);
    
    .widget-grid-item {
      &.widget-small {
        grid-column: span 4;
      }
      
      &.widget-medium {
        grid-column: span 8;
      }
      
      &.widget-large {
        grid-column: span 16;
      }
    }
  }
}

// Animation for widget loading
.widget-grid-item {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
}

// Loading states
.q-loading-bar {
  background: var(--primary);
}

// Demo Role Switcher Styling
.demo-role-switcher {
  .q-field {
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    
    .q-field__control {
      border-color: var(--primary-300);
    }
    
    .q-field__label {
      color: var(--primary-600);
      font-weight: var(--font-weight-medium);
    }
  }
}

// Role option styling
.role-option-item {
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--primary-50);
  }
  
  .q-item__section--avatar {
    color: var(--primary);
  }
}

// Dashboard transition animations
.dashboard-transition-enter-active,
.dashboard-transition-leave-active {
  transition: all 0.4s ease;
}

.dashboard-transition-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.dashboard-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.05);
}

.dashboard-transition-enter-to,
.dashboard-transition-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

// Title transition (for future use)
.title-transition-enter-active,
.title-transition-leave-active {
  transition: all 0.3s ease;
}

.title-transition-enter-from,
.title-transition-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
