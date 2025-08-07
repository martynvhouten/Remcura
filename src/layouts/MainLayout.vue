<template>
  <q-layout view="lHh Lpr lFf" class="layout-modern">
    <!-- Modern Header with Glass Morphism Effect -->
    <q-header
      elevated
      class="header-modern glass"
      :class="{ 'header-scrolled': isScrolled }"
      role="banner"
    >
      <q-toolbar class="toolbar-modern">
        <q-btn
          flat
          round
          size="lg"
          icon="view_sidebar"
          class="menu-toggle-btn"
          :aria-label="t('nav.openNavigation') || 'Open navigation menu'"
          @click="toggleLeftDrawer"
        />

        <div class="brand-section">
          <q-avatar
            size="32px"
            color="white"
            text-color="primary"
            class="brand-avatar"
          >
            <q-icon name="local_hospital" class="icon-size-sm" />
          </q-avatar>
          <div class="brand-text">
            <div class="brand-title">{{ t('brand.name') }}</div>
          </div>
        </div>

        <q-space />

        <!-- Header Actions -->
        <div class="header-actions">
          <!-- Notifications -->
          <q-btn
            flat
            round
            icon="notifications"
            @click="goToNotifications"
            :aria-label="t('nav.notifications')"
            class="action-btn"
          >
            <q-badge
              v-if="notificationStore.hasUnreadNotifications"
              color="red"
              floating
              aria-live="polite"
              aria-atomic="true"
              role="status"
            >
              {{ notificationStore.unreadCount }}
            </q-badge>
            <q-tooltip>{{ t('nav.notifications') }}</q-tooltip>
          </q-btn>

          <!-- Theme Toggle -->
          <q-btn
            flat
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
            :aria-label="
              $q.dark.isActive ? t('nav.lightMode') : t('nav.darkMode')
            "
            class="action-btn"
          >
            <q-tooltip>{{
              $q.dark.isActive ? t('nav.lightMode') : t('nav.darkMode')
            }}</q-tooltip>
          </q-btn>

          <!-- User Menu -->
          <q-btn
            flat
            round
            icon="person"
            :aria-label="t('nav.userMenu')"
            class="user-menu-btn"
          >
            <!-- Demo indicator badge -->
            <q-badge
              v-if="isDemoUser"
              color="amber"
              floating
              class="demo-badge"
            >
              <q-icon name="science" class="icon-size-xs" />
            </q-badge>
            <q-menu>
              <q-list>
                <q-item class="user-info">
                  <q-item-section avatar>
                    <q-avatar color="primary">
                      <img
                        v-if="userProfile?.avatar_url"
                        :src="userProfile.avatar_url"
                      />
                      <span v-else>{{ getUserInitials() }}</span>
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{
                      userProfile?.full_name || 'User'
                    }}</q-item-label>
                    <q-item-label caption>{{ userEmail }}</q-item-label>
                    <!-- Demo account indicator -->
                    <q-item-label v-if="isDemoUser" caption class="demo-status">
                      <q-icon
                        name="science"
                        size="12px"
                        class="q-mr-xs"
                        color="amber"
                      />
                      {{ t('demo.title') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="goToSettings">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>{{ t('nav.settings') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup>
                  <q-item-section avatar>
                    <q-icon name="help" />
                  </q-item-section>
                  <q-item-section>{{ t('nav.helpSupport') }}</q-item-section>
                </q-item>

                <q-separator />

                <q-item
                  clickable
                  v-close-popup
                  @click="handleLogout"
                  class="text-negative"
                >
                  <q-item-section avatar>
                    <q-icon name="logout" />
                  </q-item-section>
                  <q-item-section>{{ t('nav.logout') }}</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Enhanced Navigation Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      dark
      class="navigation-drawer"
      :width="280"
      :mini="isMiniDrawer"
      :mini-width="72"
      role="navigation"
      :aria-label="t('common.accessibility.mainNavigation')"
    >
      <!-- Clinic Info Section -->
      <div class="clinic-info-section" role="banner">
        <div class="clinic-avatar">
          <q-avatar size="48px" color="primary" text-color="white">
            <q-icon name="apartment" class="icon-size-lg" />
          </q-avatar>
        </div>
        <div class="clinic-details">
          <div class="clinic-name">{{ clinicName }}</div>
        </div>
      </div>

      <!-- Main Navigation -->
      <q-list class="navigation-list">
        <!-- Iterate through sections -->
        <template v-for="section in navigationLinks" :key="section.id">
          <!-- Section Header -->
          <q-item-label
            header
            class="navigation-section-header"
            :class="`section-${section.id}`"
          >
            {{ section.title }}
          </q-item-label>

          <!-- Section Items -->
          <template v-for="item in section.items" :key="item.title">
            <q-item
              :to="item.submenu ? undefined : item.to"
              clickable
              :active="$route.name === item.routeName || isParentActive(item)"
              active-class="nav-item-active"
              class="nav-item"
              :class="{ 'has-submenu': item.submenu }"
              :aria-label="
                item.title + (item.badge ? ' (' + item.badge + ' items)' : '')
              "
              :aria-expanded="
                item.submenu ? isSubmenuExpanded(item.routeName) : undefined
              "
              @click="handleItemClick(item)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" class="icon-size-base" />
              </q-item-section>

              <q-item-section class="hide-when-mini">
                <q-item-label class="nav-item-label" :title="item.title">{{
                  item.title
                }}</q-item-label>
              </q-item-section>

              <q-item-section side v-if="item.badge" class="hide-when-mini">
                <q-badge
                  :color="item.badgeColor || 'primary'"
                  :label="item.badge"
                  :aria-label="`${item.badge} items requiring attention`"
                  class="nav-badge"
                />
              </q-item-section>

              <!-- Expand/Collapse for submenu -->
              <q-item-section
                side
                v-if="item.submenu"
                class="submenu-chevron hide-when-mini"
              >
                <q-icon
                  name="expand_more"
                  size="20px"
                  :class="[
                    'chevron-icon',
                    { expanded: isSubmenuExpanded(item.routeName) },
                  ]"
                />
              </q-item-section>
            </q-item>

            <!-- Submenu Items -->
            <q-slide-transition v-if="item.submenu">
              <div v-show="isSubmenuExpanded(item.routeName)">
                <q-item
                  v-for="subItem in item.submenu"
                  :key="subItem.title"
                  :to="subItem.to"
                  clickable
                  :active="$route.name === subItem.routeName"
                  active-class="nav-item-active"
                  class="nav-item nav-sub-item"
                  :aria-label="subItem.title"
                >
                  <q-item-section avatar class="sub-item-avatar">
                    <q-icon :name="subItem.icon" class="icon-size-sm" />
                  </q-item-section>

                  <q-item-section class="hide-when-mini">
                    <q-item-label
                      class="nav-item-label"
                      :title="subItem.title"
                      >{{ subItem.title }}</q-item-label
                    >
                  </q-item-section>
                </q-item>
              </div>
            </q-slide-transition>
          </template>

          <!-- Section Separator (except for last section) -->
          <q-separator
            v-if="
              section.id !== navigationLinks[navigationLinks.length - 1]?.id
            "
            class="navigation-separator"
          />
        </template>
      </q-list>

      <!-- Spacer -->
      <q-space />

      <!-- Footer Section -->
      <div class="drawer-footer">
        <q-item
          class="upgrade-item glass-card"
          clickable
          tabindex="0"
          role="button"
          :aria-label="t('nav.upgradePlan')"
        >
          <q-item-section avatar>
            <q-icon name="upgrade" color="accent" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{
              t('nav.upgradePlan')
            }}</q-item-label>
            <q-item-label caption>{{
              t('nav.getAdvancedFeatures')
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- Page Container with Enhanced Styling -->
    <q-page-container class="page-container-modern">
      <!-- Main content area -->
      <div class="page-content" role="main">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useQuasar } from 'quasar';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from 'src/stores/auth';
  import { useClinicStore } from 'src/stores/clinic';
  import { useNotificationStore } from 'src/stores/notifications';

  // Type definitions for navigation
  interface NavigationItem {
    title: string;
    icon: string;
    to: string;
    routeName: string;
    badge?: number;
    badgeColor?: string;
    submenu?: NavigationItem[];
  }

  interface NavigationSection {
    id: string;
    title: string;
    items: NavigationItem[];
  }

  const $q = useQuasar();
  const router = useRouter();
  const { t } = useI18n();
  const authStore = useAuthStore();
  const clinicStore = useClinicStore();
  const notificationStore = useNotificationStore();

  // State
  const leftDrawerOpen = ref(false);
  const isScrolled = ref(false);
  const expandedSubmenus = ref<string[]>([]);
  const isMiniDrawer = ref(false);

  // Computed properties
  const userProfile = computed(() => authStore.userProfile);
  const userEmail = computed(() => authStore.userEmail);
  const clinicName = computed(
    () => clinicStore.clinic?.name || t('clinic.defaultName')
  );
  const isDemoUser = computed(() => authStore.userEmail === 'demo@remcura.com');

  // Check if user has admin permissions
  const isAdmin = computed(() => {
    const role = userProfile.value?.role || '';
    return role === 'admin' || role === 'owner' || role === 'platform_owner';
  });

  // Enhanced navigation links with more details
  const navigationLinks = computed((): NavigationSection[] => {
    const sections = [
      // Main Section - Dashboard and notifications
      {
        id: 'main',
        title: t('nav.sections.main'),
        items: [
          {
            title: t('nav.dashboard'),
            icon: 'space_dashboard',
            to: '/',
            routeName: 'dashboard',
          },
          {
            title: t('nav.notifications'),
            icon: 'campaign',
            to: '/notifications',
            routeName: 'notifications',
            badge: notificationStore.unreadCount,
            badgeColor: 'red',
          },
        ],
      },

      // Inventory Management Section
      {
        id: 'inventory',
        title: t('nav.sections.inventory'),
        items: [
          {
            title: t('nav.inventory'),
            icon: 'inventory_2',
            to: '/inventory/levels', // Redirect directly to levels instead of main inventory
            routeName: 'inventory-levels',
            submenu: [
              {
                title: t('nav.inventoryLevels'),
                icon: 'analytics',
                to: '/inventory/levels',
                routeName: 'inventory-levels',
              },
              {
                title: t('nav.locations'),
                icon: 'location_on',
                to: '/inventory/locations',
                routeName: 'inventory-locations',
              },
              {
                title: t('nav.stockCounting'),
                icon: 'fact_check',
                to: '/inventory/counting',
                routeName: 'inventory-counting',
              },
              {
                title: t('nav.movements'),
                icon: 'swap_horiz',
                to: '/inventory/movements',
                routeName: 'inventory-movements',
              },
            ],
          },
          {
            title: t('batch.batchManagement'),
            icon: 'qr_code_scanner',
            to: '/batch-management',
            routeName: 'batch-management',
          },
        ],
      },

      // Supply Chain Section
      {
        id: 'supply',
        title: t('nav.sections.supplyChain'),
        items: [
          {
            title: t('nav.products'),
            icon: 'inventory',
            to: '/products',
            routeName: 'products',
          },
          {
            title: t('orderLists.title'),
            icon: 'list_alt',
            to: '/order-lists',
            routeName: 'order-lists',
          },
          {
            title: t('nav.orders'),
            icon: 'assignment',
            to: '/orders',
            routeName: 'orders',
          },
          {
            title: t('nav.suppliers'),
            icon: 'corporate_fare',
            to: '/suppliers',
            routeName: 'suppliers',
          },
        ],
      },

      // Analytics Section
      {
        id: 'analytics',
        title: t('nav.sections.analytics'),
        items: [
          {
            title: t('nav.analytics'),
            icon: 'insights',
            to: '/analytics',
            routeName: 'analytics',
          },
        ],
      },
    ];

    // Add admin section for admin users
    if (isAdmin.value) {
      sections.push({
        id: 'admin',
        title: t('nav.sections.administration'),
        items: [
          {
            title: t('nav.admin'),
            icon: 'supervisor_account',
            to: '/admin',
            routeName: 'admin',
          },
          {
            title: t('nav.styleGuide'),
            icon: 'palette',
            to: '/style-guide',
            routeName: 'style-guide',
          },
        ],
      });
    }

    // Add platform section for platform owner users
    if (userProfile.value?.role === 'platform_owner') {
      sections.push({
        id: 'platform',
        title: t('nav.sections.platform'),
        items: [
          {
            title: t('nav.platformDashboard'),
            icon: 'admin_panel_settings',
            to: '/platform',
            routeName: 'platform-dashboard',
          },
          {
            title: t('nav.practiceManagement'),
            icon: 'business',
            to: '/platform/practices',
            routeName: 'platform-practices',
          },
          {
            title: t('nav.systemMonitoring'),
            icon: 'monitor_heart',
            to: '/platform/monitoring',
            routeName: 'platform-monitoring',
          },
          {
            title: t('nav.databaseAdmin'),
            icon: 'storage',
            to: '/platform/database',
            routeName: 'platform-database',
          },
          {
            title: t('nav.systemLogs'),
            icon: 'description',
            to: '/platform/logs',
            routeName: 'platform-logs',
          },
          {
            title: t('nav.apiDocumentation'),
            icon: 'api',
            to: '/platform/api-docs',
            routeName: 'platform-api-docs',
          },
          {
            title: t('nav.backupRestore'),
            icon: 'backup',
            to: '/platform/backup',
            routeName: 'platform-backup',
          },
        ],
      });
    }

    return sections;
  });

  // Methods
  const toggleLeftDrawer = () => {
    // Toggle only the mini state for smooth inline collapse/expand
    isMiniDrawer.value = !isMiniDrawer.value;
    // Ensure drawer remains open while toggling mini
    if (!leftDrawerOpen.value) {
      leftDrawerOpen.value = true;
    }
  };

  const toggleDarkMode = () => {
    $q.dark.toggle();
    $q.localStorage.set('darkMode', $q.dark.isActive.toString());
  };

  const goToSettings = () => {
    router.push({ name: 'settings' });
  };

  const goToNotifications = () => {
    router.push({ name: 'notifications' });
  };

  const getUserInitials = () => {
    const name = userProfile.value?.full_name || userEmail.value || 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Submenu management
  const isSubmenuExpanded = (routeName: string) => {
    return expandedSubmenus.value.includes(routeName);
  };

  const toggleSubmenu = (routeName: string) => {
    const index = expandedSubmenus.value.indexOf(routeName);
    if (index > -1) {
      expandedSubmenus.value.splice(index, 1);
    } else {
      expandedSubmenus.value.push(routeName);
    }
  };

  // Handle item click - open submenu and/or navigate
  const handleItemClick = (item: NavigationItem) => {
    if (item.submenu && item.submenu.length > 0) {
      // For items with submenu, only toggle the submenu - don't navigate to the main page
      toggleSubmenu(item.routeName);
    } else {
      // No submenu, just navigate normally
      router.push(item.to);
    }
  };

  // Auto-expand submenu if current route is a child
  const checkAndExpandCurrentSubmenu = () => {
    const currentRoute = router.currentRoute.value.name as string;
    const sections = navigationLinks.value;

    for (const section of sections) {
      for (const item of section.items) {
        if (item.submenu && item.submenu.length > 0) {
          const hasActiveChild = item.submenu.some(
            (subItem: NavigationItem) => subItem.routeName === currentRoute
          );
          if (hasActiveChild && !isSubmenuExpanded(item.routeName)) {
            expandedSubmenus.value.push(item.routeName);
          }
        }
      }
    }
  };

  // Check if parent item should be highlighted (when child is active)
  const isParentActive = (item: NavigationItem) => {
    if (!item.submenu) {
      return false;
    }
    const currentRoute = router.currentRoute.value.name as string;
    return item.submenu.some(
      (subItem: NavigationItem) => subItem.routeName === currentRoute
    );
  };

  const handleLogout = async () => {
    const result = await authStore.logout();
    if (result.success) {
      $q.notify({
        type: 'positive',
        message: t('auth.logoutSuccess'),
        position: 'top',
      });
      router.push({ name: 'login' });
    } else {
      $q.notify({
        type: 'negative',
        message: result.error || t('errors.generic'),
        position: 'top',
      });
    }
  };

  // Scroll detection for header effects
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 10;
  };

  // Lifecycle

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    checkAndExpandCurrentSubmenu();

    // Load notifications for badge count
    notificationStore.loadNotifications();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  // Watch for route changes to auto-expand parent submenu
  watch(
    () => router.currentRoute.value.name,
    () => {
      checkAndExpandCurrentSubmenu();
    }
  );
</script>

<style lang="scss" scoped>
  .layout-modern {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    // Ensure all child elements don't overflow
    * {
      box-sizing: border-box;
    }

    // Modern header styling with CSS custom properties approach
    .header-modern {
      --header-bg: rgba(255, 255, 255, 0.8);
      --header-bg-scrolled: rgba(255, 255, 255, 0.95);

      background: var(--header-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      transition: all var(--transition-base);

      &.header-scrolled {
        background: var(--header-bg-scrolled);
        box-shadow: var(--shadow-sm);
      }
    }

    .toolbar-modern {
      padding: var(--space-4) var(--space-6);
      min-height: 72px;
      width: 100%;
      max-width: 100%;

      .menu-toggle-btn {
        color: var(--neutral-800);
        border-radius: var(--radius-full);
        transition:
          transform 180ms ease,
          background-color 180ms ease,
          color 180ms ease;
        width: 56px;
        height: 56px;

        .q-icon {
          font-size: 30px;
        }

        &:hover {
          background-color: rgba(var(--q-primary-rgb), 0.12);
          color: var(--brand-primary);
          transform: translateY(-1px);
        }
      }

      .brand-section {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-left: var(--space-4);

        .brand-avatar {
          box-shadow: var(--shadow-sm);
        }

        .brand-text {
          .brand-title {
            font-weight: var(--font-weight-bold);
            font-size: var(--text-2xl);
            color: var(--neutral-900);
            line-height: var(--leading-tight);
          }

          .brand-subtitle {
            font-size: 0.75rem;
            color: var(--neutral-500);
            font-weight: var(--font-weight-medium);
          }
        }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: var(--space-2);

        .action-btn {
          color: var(--neutral-700);
          border-radius: var(--radius-lg);
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            color 180ms ease;
          width: 56px;
          height: 56px;

          .q-icon {
            font-size: 28px;
          }

          &:hover {
            background-color: rgba(var(--q-primary-rgb), 0.12);
            color: var(--brand-primary);
            transform: translateY(-1px);
          }

          &:focus-visible {
            outline: 2px solid rgba(var(--brand-primary-rgb), 0.5);
            outline-offset: 2px;
            box-shadow: 0 0 0 2px rgba(var(--brand-primary-rgb), 0.15);
          }
        }

        .user-menu-btn {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-full);
          padding: var(--space-1);
          transition:
            transform 180ms ease,
            background-color 180ms ease,
            color 180ms ease;

          .q-icon {
            font-size: 30px;
          }

          &:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-sm);
            background-color: rgba(var(--q-primary-rgb), 0.12);
            color: var(--brand-primary);
          }
        }
      }
    }
  }

  // Dark mode header with CSS custom properties
  body.body--dark .layout-modern .header-modern {
    --header-bg: rgba(23, 23, 23, 0.85);
    --header-bg-scrolled: rgba(23, 23, 23, 0.95);

    background: var(--header-bg);
    border-bottom-color: rgba(255, 255, 255, 0.1);

    &.header-scrolled {
      background: var(--header-bg-scrolled);
    }

    .toolbar-modern {
      .brand-text {
        .brand-title {
          color: var(--neutral-900);
        }

        .brand-subtitle {
          color: var(--neutral-600);
        }
      }

      .menu-toggle-btn {
        color: var(--neutral-200);

        &:hover {
          background-color: rgba(255, 255, 255, 0.12);
          color: var(--brand-primary-light);
        }
      }

      .header-actions {
        .action-btn {
          color: var(--neutral-200);

          &:hover {
            background-color: rgba(255, 255, 255, 0.12);
            color: var(--brand-primary-light);
          }
        }
      }
    }
  }

  // Enhanced navigation drawer
  .navigation-drawer {
    // Softer dark background and subtle border using design tokens
    background: var(--sidebar-bg);
    border-right: 1px solid var(--sidebar-border);
    transition:
      width 220ms ease,
      transform 220ms ease;

    :deep(.q-drawer__content) {
      background: var(--sidebar-bg);
      transition:
        width 220ms ease,
        transform 220ms ease;
    }

    .clinic-info-section {
      padding: var(--space-6);
      border-bottom: 1px solid var(--sidebar-border);
      display: flex;
      align-items: center;
      gap: var(--space-4);

      .clinic-details {
        .clinic-name {
          font-weight: var(--font-weight-medium);
          font-size: var(--text-sm);
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
        }

        .clinic-plan {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.1);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          display: inline-block;
        }
      }
    }

    .navigation-list {
      padding: var(--space-4);
      transition: padding 220ms ease;

      .navigation-header {
        font-weight: var(--font-weight-semibold);
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-3);
      }

      .nav-item {
        border-radius: var(--radius-md);
        margin-bottom: var(--space-1);
        transition: all var(--transition-base);
        padding-right: var(--space-2);
        position: relative;
        border: 1px solid transparent; // prevent layout shift when active adds border

        &:hover {
          background-color: var(--nav-hover-bg);
          border-radius: var(--radius-lg);
        }

        &:focus {
          outline: none;
        }

        &:focus-visible {
          outline: 2px solid rgba(var(--brand-primary-rgb), 0.5);
          outline-offset: 2px;
          box-shadow: 0 0 0 2px rgba(var(--brand-primary-rgb), 0.15);
          background-color: var(--nav-hover-bg);
        }

        &.nav-item-active {
          background: var(--nav-active-bg);
          color: rgba(255, 255, 255, 0.95);
          transform: none;
          box-shadow: none;
          border: 1px solid var(--sidebar-border);
          border-radius: var(--radius-lg);

          // Left accent bar for active state
          &::before {
            content: '';
            position: absolute;
            left: -1px;
            top: 4px;
            bottom: 4px;
            width: 3px;
            background: var(--brand-primary);
            border-radius: var(--radius-full);
          }

          .q-icon {
            color: rgba(255, 255, 255, 0.95);
          }

          .nav-item-label {
            font-weight: var(--font-weight-bold);
          }
        }

        .nav-item-label {
          font-weight: var(--font-weight-medium);
          font-size: 0.925rem;
          color: rgba(255, 255, 255, 0.92);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        // Submenu chevron styling
        .submenu-chevron {
          min-width: 24px;

          .chevron-icon {
            color: rgba(255, 255, 255, 0.5);
            transition: all var(--transition-base);
            transform-origin: center;
          }
        }

        &.has-submenu:hover .chevron-icon {
          color: var(--brand-primary-light);
        }

        &.nav-item-active .chevron-icon {
          color: rgba(255, 255, 255, 0.95);
        }

        .chevron-icon.expanded {
          transform: rotate(180deg);
        }
      }

      // Section headers
      .navigation-section-header {
        font-size: 0.8rem;
        font-weight: var(--font-weight-bold);
        color: rgba(255, 255, 255, 0.6);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: var(--space-4);
        margin-bottom: var(--space-2);
        padding-left: var(--space-4);

        &:first-of-type {
          margin-top: var(--space-2);
        }

        // All sections use primary blue color (but lighter for dark background)
        &.section-main,
        &.section-inventory,
        &.section-supply,
        &.section-analytics,
        &.section-admin {
          color: var(--brand-primary-light);
        }
      }

      // Section separators
      .navigation-separator {
        margin: var(--space-4) var(--space-3);
        background: var(--sidebar-border);
      }

      // Submenu items
      .nav-sub-item {
        margin-left: var(--space-6);
        border-left: 2px solid var(--sidebar-border);
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
        transition: all var(--transition-base);
        position: relative;

        &:hover {
          border-left-color: var(--brand-primary);
          background: var(--nav-hover-bg);
          border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
        }

        &.nav-item-active {
          border-left-color: var(--brand-primary);
          background: var(--nav-active-bg);
          transform: none;
          margin-left: calc(var(--space-6) + 2px);
          border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
          // Inherit active colors from parent active style for consistency
          &::before {
            content: '';
            position: absolute;
            left: -2px;
            top: 2px;
            bottom: 2px;
            width: 3px;
            background: var(--brand-primary);
            border-radius: var(--radius-full);
          }
        }

        .sub-item-avatar {
          min-width: 32px;

          .q-icon {
            font-size: 16px;
            opacity: 0.85;
          }
        }

        .nav-item-label {
          font-size: 0.875rem;
        }
      }

      // Badge tweaks for better contrast
      .nav-badge :deep(.q-badge__content) {
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.4);
      }
    }

    .quick-stats-section {
      padding: var(--space-4);
      border-top: 1px solid var(--neutral-200);

      .stats-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-3);
        margin-top: var(--space-3);

        .stat-item {
          text-align: center;
          padding: var(--space-3);
          background: var(--neutral-100);
          border-radius: var(--radius-lg);
          transition: all var(--transition-base);
          cursor: pointer;

          &:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-sm);
          }

          &:focus {
            outline: 2px solid var(--brand-primary);
            outline-offset: 2px;
            background-color: var(--neutral-200);
          }

          .stat-number {
            font-size: 1.25rem;
            font-weight: var(--font-weight-bold);
            color: var(--neutral-900);
          }

          .stat-label {
            font-size: 0.75rem;
            color: var(--neutral-500);
            font-weight: var(--font-weight-medium);
          }
        }
      }
    }

    .drawer-footer {
      padding: var(--space-4);
      border-top: 1px solid var(--sidebar-border);

      .upgrade-item {
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-base);
        box-shadow: none;

        &:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        &:focus {
          outline: 2px solid var(--brand-primary);
          outline-offset: 2px;
          box-shadow: var(--shadow-sm);
        }
      }

      // removed old drawer-controls
    }

    // Mini drawer visual adjustments
    &.q-drawer--mini {
      .navigation-list {
        padding-left: var(--space-2);
        padding-right: var(--space-2);
      }

      .hide-when-mini {
        display: none;
      }

      .nav-item,
      .nav-sub-item {
        padding-right: 0;
      }

      // Compact clinic header and prevent logo clipping
      .clinic-info-section {
        padding: var(--space-3);
        justify-content: center;
        .clinic-details {
          display: none;
        }
        .clinic-avatar :deep(.q-avatar) {
          width: 40px;
          height: 40px;
        }
      }

      // Icon-only styling for hover/active
      .nav-item,
      .nav-sub-item {
        border: none;
        border-radius: var(--radius-lg);
      }
      .nav-item:hover,
      .nav-sub-item:hover {
        background: var(--nav-hover-bg);
        border-radius: var(--radius-lg);
      }
      .nav-item.nav-item-active,
      .nav-sub-item.nav-item-active {
        background: transparent;
      }
      .nav-item.nav-item-active::before,
      .nav-sub-item.nav-item-active::before {
        display: none;
      }
      .nav-item .q-item__section--avatar,
      .nav-sub-item .q-item__section--avatar {
        border-radius: var(--radius-full);
        transition:
          background-color 160ms ease,
          transform 160ms ease;
      }
      .nav-item:hover .q-item__section--avatar,
      .nav-sub-item:hover .q-item__section--avatar {
        background: var(--nav-hover-bg);
      }
      .nav-item.nav-item-active .q-item__section--avatar,
      .nav-sub-item.nav-item-active .q-item__section--avatar {
        background: rgba(var(--brand-primary-rgb), 0.15);
      }
      .nav-item.nav-item-active .q-item__section--avatar .q-icon,
      .nav-sub-item.nav-item-active .q-item__section--avatar .q-icon {
        color: var(--brand-primary);
      }
      .nav-sub-item {
        margin-left: 0;
        border-left: 0;
      }
    }
  }

  // Dark mode styling is now handled by Quasar's native dark prop
  // No custom dark mode CSS needed for navigation drawer

  // Header Actions
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 8px 12px 0 0; // Extra ruimte rechts voor floating badges
  }

  .header-actions .q-btn {
    border-radius: 12px;
    color: var(--neutral-600);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    transition:
      transform 180ms ease,
      background-color 180ms ease,
      color 180ms ease,
      box-shadow 180ms ease,
      border-color 180ms ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 6px; // Extra padding binnen de knop voor badges

    &:hover {
      color: var(--brand-primary);
      background: rgba(255, 255, 255, 0.92);
      border-color: rgba(var(--brand-primary-rgb), 0.25);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    &:focus {
      outline: none;
    }

    &:active {
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 2px solid rgba(var(--brand-primary-rgb), 0.5);
      outline-offset: 2px;
      box-shadow: 0 0 0 2px rgba(var(--brand-primary-rgb), 0.15);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(var(--brand-primary-rgb), 0.32);
    }
  }

  // Baseline sizes only for buttons without custom sizing classes
  .header-actions
    .q-btn:not(.action-btn):not(.user-menu-btn):not(.menu-toggle-btn) {
    width: 48px;
    height: 48px;
  }
  .header-actions
    .q-btn:not(.action-btn):not(.user-menu-btn):not(.menu-toggle-btn)
    .q-icon {
    font-size: 22px;
  }

  // Notification badge styling - floating next to icon
  .header-actions .q-btn .q-badge {
    font-size: 11px;
    font-weight: 600;
    min-width: 18px;
    height: 18px;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
    top: -6px;
    right: -10px;
    z-index: 10;
    position: absolute;
  }

  // Demo badge styling (geel icoontje) - floating next to icon
  .header-actions .q-btn .demo-badge {
    font-size: 10px;
    min-width: 16px;
    height: 16px;
    top: -5px;
    right: -8px;
    z-index: 10;
    position: absolute;
  }

  // User menu
  .header-actions .q-menu .q-list {
    min-width: 280px;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);

    .user-info {
      padding: 16px;
      background: rgba(var(--brand-primary-rgb), 0.05);
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid rgba(var(--brand-primary-rgb), 0.1);
    }

    .q-item {
      border-radius: 6px;
      margin: 2px 4px;
      transition: all 0.2s ease;

      &:hover:not(.user-info) {
        background: rgba(var(--brand-primary-rgb), 0.08);
        transform: translateX(2px);
      }

      &.text-negative:hover {
        background: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      }
    }
  }

  // Dark mode
  body.body--dark {
    .header-actions .q-btn {
      color: var(--neutral-300);
      background: rgba(0, 0, 0, 0.6);
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        color: var(--brand-primary);
        background: rgba(0, 0, 0, 0.8);
        border-color: rgba(var(--brand-primary-rgb), 0.4);
      }
    }

    .header-actions .q-menu .q-list {
      background: rgba(30, 30, 30, 0.95);
      border-color: rgba(255, 255, 255, 0.15);

      .user-info {
        background: rgba(var(--brand-primary-rgb), 0.1);
        border-color: rgba(var(--brand-primary-rgb), 0.2);
      }

      .q-item:hover:not(.user-info) {
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }

  // Page container
  .page-container-modern {
    background: var(--neutral-50);

    .page-content {
      min-height: 100vh;
      transition: background-color var(--transition-base);
    }
  }

  body.body--dark .page-container-modern {
    background: var(--neutral-100);
  }

  // Responsive design
  @media (max-width: 1023px) {
    .layout-modern .toolbar-modern {
      padding: var(--space-3) var(--space-4);
      min-height: 64px;

      .brand-text .brand-subtitle {
        display: none;
      }
    }

    .navigation-drawer {
      .clinic-info-section {
        padding: var(--space-4);
      }

      .quick-stats-section .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  }

  @media (max-width: 599px) {
    .layout-modern .toolbar-modern {
      .brand-section {
        margin-left: var(--space-2);

        .brand-text .brand-title {
          font-size: var(--text-xl);
        }
      }
    }

    .header-actions {
      gap: 8px;

      .q-btn {
        width: 42px;
        height: 42px;

        .q-icon {
          font-size: 20px;
        }
      }
    }
  }

  // Demo styling
  .demo-badge {
    :deep(.q-badge__content) {
      padding: 2px 4px;
    }
  }

  .demo-status {
    color: var(--q-amber-6);
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-top: 2px;
  }
</style>
