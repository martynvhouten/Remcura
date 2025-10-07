<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="dashboardConfig.title"
        :subtitle="dashboardConfig.subtitle"
        icon="space_dashboard"
      >
        <template #actions>
          <!-- Practice Switcher (only for platform owners) -->
          <q-select
            v-if="isPlatformOwner"
            v-model="selectedPracticeId"
            :options="practiceOptions"
            option-value="id"
            option-label="name"
            emit-value
            map-options
            dense
            outlined
            style="min-width: 260px; margin-right: 12px"
            :label="$t('dashboard.selectPractice')"
            :loading="loadingPractices"
            @update:model-value="handlePracticeChange"
          >
            <template #prepend>
              <q-icon name="business" />
            </template>
          </q-select>

          <!-- Demo Role Switcher -->
          <q-select
            v-model="selectedDemoRole"
            :options="demoRoleOptions"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            dense
            outlined
            style="min-width: 250px; margin-right: 12px"
            :label="$t('dashboard.demoRoleSwitch.label')"
            color="primary"
            :loading="loading"
            class="demo-role-switcher"
            @update:model-value="switchDemoRole"
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

            <!-- use default selected rendering -->
          </q-select>

          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            :loading="loading"
            class="app-btn-refresh"
            @click="refreshDashboard"
          >
            <q-tooltip>{{ $t('dashboard.actions.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="tune"
            size="md"
            class="app-btn-refresh"
            @click="showCustomizeDialog = true"
          >
            <q-tooltip>{{ $t('dashboard.actions.customize') }}</q-tooltip>
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
            :icon="action.icon"
            :label="action.label"
            unelevated
            no-caps
            :class="getActionButtonClass(action.type)"
            @click="$router.push(action.route)"
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
            <DynamicWidget
              :widget="widget"
              :loading="loading"
              @refresh="refreshWidget"
            />
          </div>
        </div>
      </transition>

      <!-- Platform Owner Message -->
      <div
        v-if="selectedDemoRole === 'platform_owner'"
        class="platform-owner-message"
      >
        <q-banner class="bg-deep-purple-1 text-deep-purple-8" rounded>
          <template #avatar>
            <q-icon name="settings" color="deep-purple" />
          </template>
          <div class="text-weight-medium">
            {{ $t('dashboard.platformOwner.title') }}
          </div>
          <div class="text-body2 q-mt-xs">
            {{ $t('dashboard.platformOwner.description') }}
          </div>

          <template #action>
            <q-btn
              :label="$t('dashboard.platformOwner.goToPlatform')"
              color="deep-purple"
              to="/platform"
              unelevated
              no-caps
            />
          </template>
        </q-banner>
      </div>

      <!-- Empty State -->
      <div v-else-if="!widgets.length && !loading" class="empty-dashboard">
        <q-icon name="widgets" class="icon-size-3xl" color="grey-5" />
        <h5>{{ $t('dashboard.empty.title') }}</h5>
        <p>{{ $t('dashboard.empty.subtitle') }}</p>
        <q-btn
          :label="$t('dashboard.empty.addWidgets')"
          unelevated
          no-caps
          class="app-btn-primary"
          @click="showCustomizeDialog = true"
        />
      </div>
    </div>

    <!-- Customize Dialog -->
    <BaseDialog
      v-model="showCustomizeDialog"
      :title="$t('dashboard.customize.title')"
      icon="tune"
      size="sm"
      @close="showCustomizeDialog = false"
    >
      <div class="customize-dialog-content">
        <p>{{ $t('dashboard.customize.comingSoon') }}</p>
      </div>

      <template #actions>
        <q-btn
          flat
          :label="$t('common.close')"
          color="primary"
          @click="showCustomizeDialog = false"
        />
      </template>
    </BaseDialog>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from 'src/stores/auth';
  import { supabase } from '@/boot/supabase';
  import {
    practiceDashboardService,
    type PracticeDashboardData,
    type PracticeWidget as DashboardWidgetType,
  } from '@/services/dashboard/practice-dashboard';
  import { roleDashboardConfig } from '@/services/dashboard/role-config';
  import type { UserRole } from '@/types/permissions';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import DynamicWidget from 'src/components/dashboard/DynamicWidget.vue';
  import BaseDialog from 'src/components/base/BaseDialog.vue';

  const { t } = useI18n();
  const $q = useQuasar();
  const router = useRouter();
  const authStore = useAuthStore();

  // State
  const loading = ref(false);
  const showCustomizeDialog = ref(false);
  const dashboardData = ref<PracticeDashboardData | null>(null);

  // Computed properties
  const userProfile = computed(() => authStore.userProfile);
  const userRole = computed(
    () => (userProfile.value?.role || 'assistant') as UserRole
  );
  const selectedDemoRole = ref(userRole.value);
  const isPlatformOwner = computed(() => userRole.value === 'platform_owner');

  // Practice selection for platform owners
  const practices = ref<Array<{ id: string; name: string }>>([]);
  const selectedPracticeId = ref<string | null>(authStore.clinicId || null);
  const loadingPractices = ref(false);
  const practiceOptions = computed(() => practices.value);

  const dashboardConfig = computed(() =>
    practiceDashboardService.getRoleConfig(selectedDemoRole.value)
  );

  const widgets = computed(() => dashboardData.value?.widgets || []);
  const quickActions = computed(() => dashboardData.value?.quickActions || []);
  const alerts = computed(() => dashboardData.value?.alerts || []);

  const demoRoleOptions = computed(() =>
    roleDashboardConfig.getDemoRoleOptions()
  );

  const selectedRoleIcon = computed(() => {
    const option = demoRoleOptions.value.find(
      opt => opt.value === selectedDemoRole.value
    );
    return option?.icon || 'person';
  });

  const selectedRoleLabel = computed(() => {
    const option = demoRoleOptions.value.find(
      opt => opt.value === selectedDemoRole.value
    );
    return option?.label || selectedDemoRole.value;
  });

  // Methods
  function getWidgetGridClass(widget: DashboardWidgetType): string {
    const baseClass = 'widget-grid-item';
    const sizeClass = `widget-${widget.size}`;
    return `${baseClass} ${sizeClass}`;
  }

  function getAlertIcon(type: string): string {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'success':
        return 'check_circle';
      default:
        return 'info';
    }
  }

  async function loadDashboard() {
    try {
      loading.value = true;
      const role = selectedDemoRole.value || userRole.value || 'assistant';
      const practiceId =
        selectedPracticeId.value ||
        authStore.clinicId ||
        authStore.selectedPractice?.id;

      if (!practiceId) {
        throw new Error(t('dashboard.errors.practiceIdMissing'));
      }

      dashboardData.value = await practiceDashboardService.getDashboardData(
        role as UserRole,
        practiceId
      );
      // Dashboard loaded successfully
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      $q.notify({
        type: 'negative',
        message: t('dashboard.errors.loadFailed'),
        caption: t('dashboard.errors.tryRefresh'),
      });
    } finally {
      loading.value = false;
    }
  }

  async function refreshDashboard() {
    await loadDashboard();
    $q.notify({
      type: 'positive',
      message: t('dashboard.actions.refreshed'),
      timeout: 1000,
    });
  }

  async function refreshWidget(widgetId: string) {
    // Refresh specific widget - for now just refresh all data
    await loadDashboard();
    $q.notify({
      type: 'positive',
      message: t('dashboard.widgetRefreshed', { widget: widgetId }),
      timeout: 1000,
    });
  }

  async function switchDemoRole(newRole: string | any) {
    // Extract string value if object is passed
    const roleValue = typeof newRole === 'object' ? newRole.value : newRole;

    // Switching demo role

    if (roleValue === selectedDemoRole.value) {
      return;
    }

    selectedDemoRole.value = roleValue;

    // Reload dashboard with new role
    try {
      loading.value = true;

      // Clear current data first for visual effect
      dashboardData.value = null;

      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Load new dashboard data
      const practiceId =
        selectedPracticeId.value ||
        authStore.clinicId ||
        authStore.selectedPractice?.id;
      if (practiceId) {
        dashboardData.value = await practiceDashboardService.getDashboardData(
          roleValue as UserRole,
          practiceId
        );
      }

      $q.notify({
        type: 'positive',
        message: t('dashboard.roleSwitch.success'),
        caption: t('dashboard.roleSwitch.caption'),
        timeout: 2500,
        icon: 'swap_horiz',
      });
    } catch (error) {
      console.error('Failed to switch demo role:', error);
      $q.notify({
        type: 'negative',
        message: t('dashboard.errors.switchFailed'),
        caption: t('dashboard.errors.tryAgain'),
      });
    } finally {
      loading.value = false;
    }
  }

  async function loadPracticesForOwner() {
    if (!isPlatformOwner.value) return;
    loadingPractices.value = true;
    try {
      const { data, error } = await supabase
        .from('practices')
        .select('id, name')
        .order('name');
      if (error) throw error;
      practices.value = data || [];
      if (!selectedPracticeId.value && practices.value.length > 0) {
        selectedPracticeId.value = practices.value[0]?.id ?? '';
      }
    } catch (e) {
      console.error('Failed to load practices for owner', e);
    } finally {
      loadingPractices.value = false;
    }
  }

  async function handlePracticeChange() {
    await loadDashboard();
  }

  function getDemoRoleLabel(role: string): string {
    switch (role) {
      case 'assistant':
        return t('dashboard.titles.assistant');
      case 'manager':
        return t('dashboard.titles.manager');
      case 'owner':
        return t('dashboard.titles.owner');
      default:
        return t('dashboard.titles.default');
    }
  }

  // Watchers
  watch(
    userRole,
    newRole => {
      // Only update if we haven't manually selected a different role
      if (selectedDemoRole.value === userRole.value) {
        selectedDemoRole.value = newRole;
      }
    },
    { immediate: true }
  );

  // Lifecycle
  // Get button class based on action type
  const getActionButtonClass = (type: string) => {
    const classMap: Record<string, string> = {
      create: 'app-btn-success',
      view: 'app-btn-primary',
      manage: 'app-btn-secondary',
      analyze: 'app-btn-info',
      export: 'app-btn-secondary',
      settings: 'app-btn-secondary',
      default: 'app-btn-secondary',
    };
    return classMap[type] || classMap.default;
  };

  onMounted(async () => {
    await loadPracticesForOwner();
    await loadDashboard();
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

  // Widgets Grid - Verbeterde layout voor consistente uitlijning
  .widgets-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: var(--space-4);
    auto-rows: minmax(200px, auto); // Minimale hoogte voor consistentie

    .widget-grid-item {
      display: flex;
      flex-direction: column;

      // Small widgets: 4 kolommen op desktop, 6 op tablet, 12 op mobile
      &.widget-small {
        grid-column: span 4;

        @media (max-width: 1200px) {
          grid-column: span 6;
        }

        @media (max-width: 768px) {
          grid-column: span 12;
        }
      }

      // Medium widgets: 6 kolommen op desktop, 12 op tablet/mobile
      &.widget-medium {
        grid-column: span 6;

        @media (max-width: 1024px) {
          grid-column: span 12;
        }
      }

      // Large widgets: altijd volledige breedte
      &.widget-large {
        grid-column: span 12;
      }

      // Zorg dat alle widgets in een rij dezelfde hoogte hebben
      > * {
        flex: 1;
        min-height: 100%;
      }
    }

    // Automatische row heights voor betere uitlijning
    &::after {
      content: '';
      grid-column: 1 / -1;
      height: 0;
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
        grid-column: span 12;
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

  // Enforce consistent width for demo switcher in both light and dark
  .demo-role-switcher {
    width: 360px;
    max-width: 360px;
    flex: 0 0 360px;
  }

  body.body--dark .demo-role-switcher {
    width: 360px;
    max-width: 360px;
    flex: 0 0 360px;
  }

  // Role option styling
  .role-option-item {
    transition: all 0.2s ease;

    &:hover {
      background: var(--neutral-100);
    }

    .q-item__section--avatar {
      color: var(--primary);
    }
  }

  // Dark mode role option hover
  body.body--dark {
    .role-option-item:hover {
      background: var(--bg-tertiary);
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
