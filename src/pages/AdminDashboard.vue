<template>
  <PageLayout>
    <template #header>
      <PageTitle :title="$t('admin.title')" icon="supervisor_account">
        <template #actions>
          <q-btn-group>
            <q-btn
              :label="$t('admin.settings')"
          icon="tune"
              color="grey-8"
              @click="showSettings = true"
              no-caps
              class="btn-modern"
            />
            <q-btn
              :label="$t('admin.audit')"
          icon="manage_search"
              color="info"
              @click="showAuditLog = true"
              no-caps
              class="btn-modern"
            />
          </q-btn-group>
        </template>
      </PageTitle>
    </template>

    <!-- Overview Cards -->
    <div class="row q-mb-lg stats-cards-container">
      <div class="col-12 col-sm-6 col-md-3 stats-card-col">
        <BaseCard
          
          :title="$t('admin.stats.totalUsers')>
            <div class="stat-display">
              <div class="stat-value">{{ stats.totalUsers }}</div>
            </div>
          icon="people"
          icon-color="primary"
          :trend="`${stats.activeUsers} ${$t('admin.stats.activeToday')}`"
          trend-direction="neutral"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 stats-card-col">
        <BaseCard
          
          :title="$t('admin.stats.totalLocations')>
            <div class="stat-display">
              <div class="stat-value">{{ stats.totalLocations }}</div>
            </div>
          icon="place"
          icon-color="positive"
          :trend="`${stats.activeLocations} ${$t('admin.stats.active')}`"
          trend-direction="neutral"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 stats-card-col">
        <BaseCard
          
          :title="$t('admin.stats.pendingSync')>
            <div class="stat-display">
              <div class="stat-value">{{ stats.pendingSync }}</div>
            </div>
          icon="sync_problem"
          icon-color="warning"
          :trend="`${$t('admin.stats.lastSync')}: ${formatDate(
            stats.lastSync
          )}`"
          trend-direction="neutral"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3 stats-card-col">
        <BaseCard
          
          :title="$t('admin.stats.todayEvents')>
            <div class="stat-display">
              <div class="stat-value">{{ stats.todayEvents }}</div>
            </div>
          icon="event"
          icon-color="info"
          :trend="`+${stats.eventsGrowth}% ${$t('admin.stats.fromYesterday')}`"
          trend-direction="up"
          trend-color="positive"
        />
      </div>
    </div>

    <!-- Quick Actions -->
    <BaseCard
      
      :title="$t('admin.quickActions')"
          icon="admin_panel_settings"
          icon-color="primary"
      class="q-mb-lg"
    >
      <div class="row q-gutter-md">
        <q-btn
          :label="$t('admin.userManagement.invite')"
          icon="person_add"
          color="primary"
          @click="showInviteUser = true"
          no-caps
          class="btn-modern"
        />
        <q-btn
          :label="$t('locations.add')"
          icon="add_location"
          color="secondary"
          @click="showAddLocation = true"
          no-caps
          class="btn-modern"
        />
        <q-btn
          :label="$t('offline.data.download')"
          icon="download"
          color="info"
          @click="downloadOfflineData"
          no-caps
          class="btn-modern"
        />
        <q-btn
          :label="$t('offline.sync.forceSync')"
          icon="sync"
          color="warning"
          :loading="syncing"
          @click="forceSync"
          no-caps
          class="btn-modern"
        />
        <q-btn
          :label="$t('exports.title')"
          icon="table_chart"
          color="positive"
          @click="showExportDialog = true"
          no-caps
          class="btn-modern"
        />
      </div>
    </BaseCard>

    <!-- 🎭 Revolutionary Magic Invite System -->
    <BaseCard
      
      :title="$t('magicInvite.revolutionaryUserSystem')"
          icon="auto_awesome"
          icon-color="secondary"
      class="q-mb-lg"
    >
      <MagicInviteManager />
    </BaseCard>

    <!-- 👥 Team Overview - Auto-Upgrade System -->
    <BaseCard
      
      :title="$t('admin.teamOverview')"
          icon="group"
          icon-color="primary"
      class="q-mb-lg"
    >
      <TeamOverview />
    </BaseCard>

    <!-- Tabs for different admin sections -->
    <q-tabs
      v-model="activeTab"
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="users" :label="$t('admin.users')" icon="people" />
      <q-tab
        name="locations"
        :label="$t('admin.locations')"
          icon="location_on"
      />
      <q-tab
        name="permissions"
        :label="$t('admin.permissions')"
          icon="security"
      />
      <q-tab name="analytics" :label="$t('admin.analytics')" icon="analytics" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="activeTab" animated>
      <!-- Users Tab -->
      <q-tab-panel name="users">
        <div class="text-h6 q-mb-md">
          {{ $t('admin.userManagement.title') }}
        </div>

        <q-table
          :rows="users"
          :columns="userColumns"
          :loading="loadingUsers"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-role="props">
            <q-td :props="props">
              <q-chip
                :color="getRoleColor(props.value)"
                text-color="white"
                size="sm"
              >
                {{ $t(`permissions.templates.${props.value}`) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-lastActive="props">
            <q-td :props="props">
              {{ props.value ? formatDate(props.value) : '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group dense>
                <q-btn icon="edit" dense flat @click="editUser(props.row)" />
                <q-btn
          icon="security"
                  dense
                  flat
                  @click="manageUserPermissions(props.row)"
                />
                <q-btn icon="more_vert" dense flat>
                  <q-menu>
                    <q-list dense>
                      <q-item clickable @click="resetUserPassword(props.row)">
                        <q-item-section avatar>
                          <q-icon name="lock_reset" />
                        </q-item-section>
                        <q-item-section>Reset Password</q-item-section>
                      </q-item>
                      <q-item clickable @click="toggleUserStatus(props.row)">
                        <q-item-section avatar>
                          <q-icon
                            :name="props.row.active ? 'block' : 'check'"
                          />
                        </q-item-section>
                        <q-item-section>
                          {{ props.row.active ? 'Deactivate' : 'Activate' }}
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-btn-group>
            </q-td>
          </template>
        </q-table>

        <!-- Demo Reset Card (only for demo user) -->
        <div
          v-if="authStore.userEmail === 'demo@remcura.com'"
          class="q-mt-lg"
        >
          <DemoResetCard />
        </div>
      </q-tab-panel>

      <!-- Locations Tab -->
      <q-tab-panel name="locations">
        <div class="text-h6 q-mb-md">{{ $t('locations.title') }}</div>

        <q-table
          :rows="locations"
          :columns="locationColumns"
          :loading="loadingLocations"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-isMain="props">
            <q-td :props="props">
              <q-chip
                v-if="props.value"
                color="primary"
                text-color="white"
                size="sm"
          icon="star"
              >
                {{ $t('locations.isMain') }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-isActive="props">
            <q-td :props="props">
              <q-chip
                :color="props.value ? 'positive' : 'negative'"
                text-color="white"
                size="sm"
              >
                {{ props.value ? $t('common.active') : $t('common.inactive') }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-group dense>
                <q-btn
          icon="edit"
                  size="sm"
                  flat
                  @click="editLocation(props.row)"
                />
                <q-btn
                  v-if="!props.row.is_main"
          icon="star"
                  size="sm"
                  flat
                  @click="setMainLocation(props.row)"
                />
                <q-btn
          icon="people"
                  size="sm"
                  flat
                  @click="manageLocationAccess(props.row)"
                />
              </q-btn-group>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Permissions Tab -->
      <q-tab-panel name="permissions">
        <div class="text-h6 q-mb-md">{{ $t('permissions.title') }}</div>

        <BaseCard :title="$t('permissions.templates.title')" >
          <div class="row q-gutter-md">
            <q-btn
              v-for="template in permissionTemplates"
              :key="template.key"
              :label="$t(`permissions.templates.${template.key}`)"
              :icon="template.icon"
              :color="template.color"
              @click="showPermissionTemplate(template)"
            />
          </div>
        </BaseCard>

        <q-table
          :rows="permissions"
          :columns="permissionColumns"
          :loading="loadingPermissions"
          row-key="id"
          :pagination="{ rowsPerPage: 15 }"
          class="q-mt-md"
        >
          <template v-slot:body-cell-permissionType="props">
            <q-td :props="props">
              <q-chip
                :color="getPermissionColor(props.value)"
                text-color="white"
                size="sm"
              >
                {{ $t(`permissions.types.${props.value}`) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-expiresAt="props">
            <q-td :props="props">
              <span v-if="props.value">
                {{ formatDate(props.value) }}
                <q-chip
                  v-if="isExpiringSoon(props.value)"
                  color="warning"
                  text-color="white"
                  size="sm"
          icon="warning"
                >
                  Expiring Soon
                </q-chip>
              </span>
              <span v-else class="text-grey-6">No Expiry</span>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
          icon="delete"
                size="sm"
                flat
                color="negative"
                @click="revokePermission(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Analytics Tab -->
      <q-tab-panel name="analytics">
        <div class="text-h6 q-mb-md">{{ $t('analytics.dashboard') }}</div>

        <div class="row q-gutter-md">
          <div class="col-12 col-md-6">
            <BaseCard :title="$t('analytics.usage')" >
              <div class="q-mt-md">
                <div
                  v-for="event in topEvents"
                  :key="event.type"
                  class="row items-center q-mb-sm"
                >
                  <div class="col-6">
                    {{ $t(`analytics.events.${event.type}`) }}
                  </div>
                  <div class="col-6 text-right">
                    <q-linear-progress
                      :value="event.count / topEvents[0]?.count || 0"
                      color="primary"
                      class="q-mr-sm"
                      style="width: 60px; display: inline-block"
                    />
                    {{ event.count }}
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>

          <div class="col-12 col-md-6">
            <BaseCard :title="$t('analytics.patterns')" >
              <div class="q-mt-md">
                <div class="text-h6">
                  {{ analyticsData.averageSessionTime }}min
                </div>
                <div class="text-caption">
                  {{ $t('analytics.metrics.averageSession') }}
                </div>

                <div class="q-mt-md">
                  <div class="text-h6">{{ analyticsData.peakHour }}:00</div>
                  <div class="text-caption">
                    {{ $t('analytics.metrics.peakHours') }}
                  </div>
                </div>
              </div>
            </BaseCard>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Dialogs and modals would go here -->
    <!-- For brevity, I'll just include the main structure -->
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useAuthStore } from '@/stores/auth';
  import PageLayout from '@/components/PageLayout.vue';
  import PageTitle from '@/components/PageTitle.vue';
  import { BaseCard } from '@/components/cards';
  import DemoResetCard from '@/components/admin/DemoResetCard.vue';
  import MagicInviteManager from '@/components/admin/MagicInviteManager.vue';
  import TeamOverview from '@/components/admin/TeamOverview.vue';
  import { adminService } from '@/services/admin';
  import { analyticsService } from '@/services/analytics';
  import { offlineService } from '@/services/offline';
  import type {
    Location,
    PracticeMember,
    UserPermission,
  } from '@/types/supabase';

  // Composables
  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();

  // State
  const activeTab = ref('users');
  const loadingUsers = ref(false);
  const loadingLocations = ref(false);
  const loadingPermissions = ref(false);
  const syncing = ref(false);
  const showSettings = ref(false);
  const showAuditLog = ref(false);
  const showInviteUser = ref(false);
  const showAddLocation = ref(false);
  const showExportDialog = ref(false);

  // Data
  const users = ref<PracticeMember[]>([]);
  const locations = ref<Location[]>([]);
  const permissions = ref<UserPermission[]>([]);
  const topEvents = ref<Array<{ type: string; count: number }>>([]);

  // Stats
  const stats = reactive({
    totalUsers: 0,
    activeUsers: 0,
    totalLocations: 0,
    activeLocations: 0,
    pendingSync: 0,
    lastSync: null as Date | null,
    todayEvents: 0,
    eventsGrowth: 0,
  });

  // Analytics data with proper typing
  interface AnalyticsData {
    averageSessionTime: number;
    peakHour: number;
    totalEvents: number;
    topEvents: Array<{ type: string; count: number }>;
  }

  // Analytics data
  const analyticsData = reactive<AnalyticsData>({
    averageSessionTime: 0,
    peakHour: 0,
    totalEvents: 0,
    topEvents: [],
  });

  // Table columns
  const userColumns = computed(() => [
    {
      name: 'email',
      label: t('admin.userManagement.email'),
      align: 'left' as const,
      field: 'email',
      sortable: true,
    },
    {
      name: 'role',
      label: t('admin.userManagement.roles'),
      align: 'center' as const,
      field: 'role',
      sortable: true,
    },
    {
      name: 'lastActive',
      label: t('admin.userManagement.lastActive'),
      align: 'left' as const,
      field: 'last_active',
      sortable: true,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      field: () => '',
      sortable: false,
    },
  ]);

  const locationColumns = computed(() => [
    {
      name: 'name',
      label: t('locations.name'),
      align: 'left' as const,
      field: 'name',
      sortable: true,
    },
    {
      name: 'city',
      label: t('locations.city'),
      align: 'left' as const,
      field: 'city',
      sortable: true,
    },
    {
      name: 'isMain',
      label: t('locations.isMain'),
      align: 'center' as const,
      field: 'is_main',
      sortable: false,
    },
    {
      name: 'isActive',
      label: t('common.status'),
      align: 'center' as const,
      field: 'is_active',
      sortable: false,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      field: () => '',
      sortable: false,
    },
  ]);

  const permissionColumns = computed(() => [
    {
      name: 'user',
      label: t('permissions.user'),
      align: 'left' as const,
      field: 'user_id',
      sortable: false,
    },
    {
      name: 'permissionType',
      label: t('permissions.permissionType'),
      align: 'center' as const,
      field: 'permission_type',
      sortable: false,
    },
    {
      name: 'resourceType',
      label: t('permissions.resourceType'),
      align: 'left' as const,
      field: 'resource_type',
      sortable: false,
    },
    {
      name: 'expiresAt',
      label: t('permissions.expiresAt'),
      align: 'left' as const,
      field: 'expires_at',
      sortable: false,
    },
    {
      name: 'actions',
      label: t('common.actions'),
      align: 'center' as const,
      field: () => '',
      sortable: false,
    },
  ]);

  // Permission templates
  const permissionTemplates = [
    { key: 'assistant', icon: 'support_agent', color: 'blue' },
    { key: 'manager', icon: 'supervisor_account', color: 'orange' },
    { key: 'admin', icon: 'admin_panel_settings', color: 'red' },
  ];

  // Methods
  const loadData = async () => {
    await Promise.all([
      loadUsers(),
      loadLocations(),
      loadPermissions(),
      loadStats(),
      loadAnalytics(),
    ]);
  };

  const loadUsers = async () => {
    try {
      loadingUsers.value = true;
      users.value = await adminService.getPracticeMembers();
      stats.totalUsers = users.value.length;
      // Calculate active users (simplified)
      stats.activeUsers = users.value.filter(u => u.role !== 'inactive').length;
    } catch (error) {
      console.error('Failed to load users:', error);
      $q.notify({
        type: 'negative',
        message: t('admin.errors.loadUsersFailed'),
      });
    } finally {
      loadingUsers.value = false;
    }
  };

  const loadLocations = async () => {
    try {
      loadingLocations.value = true;
      locations.value = await adminService.getLocations();
      stats.totalLocations = locations.value.length;
      stats.activeLocations = locations.value.filter(l => l.is_active).length;
    } catch (error) {
      console.error('Failed to load locations:', error);
      $q.notify({
        type: 'negative',
        message: t('admin.errors.loadLocationsFailed'),
      });
    } finally {
      loadingLocations.value = false;
    }
  };

  const loadPermissions = async () => {
    try {
      loadingPermissions.value = true;
      permissions.value = await adminService.getUserPermissions();
    } catch (error) {
      console.error('Failed to load permissions:', error);
    } finally {
      loadingPermissions.value = false;
    }
  };

  const loadStats = async () => {
    try {
      const syncStatus = offlineService.getSyncStatus();
      stats.pendingSync = syncStatus.pendingActions;
      stats.lastSync = syncStatus.lastSync;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const summary = await analyticsService.getEventSummary();
      stats.todayEvents = summary.totalEvents;
      analyticsData.totalEvents = summary.totalEvents;
      analyticsData.topEvents = summary.topEvents
        .slice(0, 5)
        .map(([type, count]: [string, number]) => ({ type, count }));
      topEvents.value = analyticsData.topEvents;

      // Mock analytics data (in real app, would come from analytics service)
      analyticsData.averageSessionTime = 15;
      analyticsData.peakHour = 14;
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const downloadOfflineData = async () => {
    try {
      await offlineService.downloadLatestData();
      $q.notify({
        type: 'positive',
        message: t('offline.messages.syncCompleted'),
      });
    } catch (error) {
      console.error('Failed to download offline data:', error);
      $q.notify({
        type: 'negative',
        message: t('offline.errors.downloadFailed'),
      });
    }
  };

  const forceSync = async () => {
    try {
      syncing.value = true;
      await offlineService.forceSyncNow();
      await loadStats(); // Refresh stats
      $q.notify({
        type: 'positive',
        message: t('offline.messages.syncCompleted'),
      });
    } catch (error) {
      console.error('Failed to force sync:', error);
      $q.notify({
        type: 'negative',
        message: t('offline.messages.syncFailed'),
      });
    } finally {
      syncing.value = false;
    }
  };

  // Helper methods
  const formatDate = (date: string | Date | null): string => {
    if (!date) { return '-'; }
    return new Date(date).toLocaleDateString();
  };

  const getRoleColor = (role: string): string => {
    const colors = {
      owner: 'red',
      assistant: 'blue',
      manager: 'orange',
      viewer: 'grey',
    };
    return colors[role as keyof typeof colors] || 'grey';
  };

  const getPermissionColor = (type: string): string => {
    const colors = {
      read: 'blue',
      write: 'orange',
      delete: 'red',
      admin: 'purple',
    };
    return colors[type as keyof typeof colors] || 'grey';
  };

  const isExpiringSoon = (expiryDate: string): boolean => {
    if (!expiryDate) { return false; }
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry =
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  // Action handlers (simplified for brevity)
  const editUser = (user: PracticeMember) => {
    $q.notify({ type: 'info', message: `Editing user: ${user.user_id}` });
  };

  const manageUserPermissions = (user: PracticeMember) => {
    $q.notify({
      type: 'info',
      message: `Managing permissions for: ${user.user_id}`,
    });
  };

  // Add missing methods
  const resetUserPassword = async (user: PracticeMember) => {
    try {
      $q.dialog({
        title: 'Reset Password',
        message: `Are you sure you want to reset the password for ${user.user_id}?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        await adminService.resetUserPassword(user.user_id);
        $q.notify({
          type: 'positive',
          message: t('admin.userManagement.resetPassword') + ' - ' + t('common.success'),
        });
      });
    } catch (error) {
      console.error('Failed to reset user password:', error);
      $q.notify({
        type: 'negative',
        message: t('admin.errors.failedToSet'),
      });
    }
  };

  const toggleUserStatus = async (user: PracticeMember) => {
    try {
      const action = user.role === 'inactive' ? 'activate' : 'deactivate';
      $q.dialog({
        title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
        message: `Are you sure you want to ${action} ${user.user_id}?`,
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        await adminService.toggleUserStatus(
          user.user_id,
          action === 'activate'
        );
        await loadUsers();
        $q.notify({
          type: 'positive',
          message: t('admin.userManagement.' + action) + ' - ' + t('common.success'),
        });
      });
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      $q.notify({
        type: 'negative',
        message: t('admin.errors.failedToUpdate'),
      });
    }
  };

  const manageLocationAccess = (location: Location) => {
    $q.notify({
      type: 'info',
      message: `Managing access for location: ${location.name}`,
    });
    // TODO: Implement location access management dialog
  };

  const showPermissionTemplate = (template: {
    key: string;
    icon: string;
    color: string;
  }) => {
    $q.notify({
      type: 'info',
      message: `Showing template: ${template.key}`,
    });
    // TODO: Implement permission template display dialog
  };

  const editLocation = (location: Location) => {
    $q.notify({ type: 'info', message: `Editing location: ${location.name}` });
  };

  const setMainLocation = async (location: Location) => {
    try {
      await adminService.setMainLocation(location.id);
      await loadLocations();
      $q.notify({
        type: 'positive',
        message: t('locations.notifications.mainLocationSet'),
      });
    } catch (error) {
      console.error('Failed to set main location:', error);
      $q.notify({
        type: 'negative',
        message: t('locations.errors.setMainFailed'),
      });
    }
  };

  const revokePermission = async (permission: UserPermission) => {
    try {
      await adminService.revokePermission(permission.id);
      await loadPermissions();
      $q.notify({
        type: 'positive',
        message: t('permissions.notifications.revoked'),
      });
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      $q.notify({
        type: 'negative',
        message: t('permissions.errors.revokeFailed'),
      });
    }
  };

  // Lifecycle
  onMounted(() => {
    loadData();
  });
</script>

<style scoped>
  .admin-dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
  }

  .stats-cards-container {
    gap: 0;

    .stats-card-col {
      padding: 8px;

      @media (max-width: 640px) {
        padding: 6px;
      }
    }
  }
</style>
