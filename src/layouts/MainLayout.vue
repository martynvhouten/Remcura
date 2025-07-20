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
          dense
          round
          icon="menu"
          :aria-label="$t('nav.openNavigation') || 'Open navigation menu'"
          @click="toggleLeftDrawer"
        />

        <div class="brand-section">
          <q-avatar
            size="32px"
            color="white"
            text-color="primary"
            class="brand-avatar"
          >
            <q-icon name="local_hospital" size="18px" />
          </q-avatar>
          <div class="brand-text">
            <div class="brand-title">{{ $t('brand.name') }}</div>
            <div class="brand-subtitle">{{ $t('brand.edition') }}</div>
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
            :aria-label="$t('nav.notifications')"
          >
            <q-badge color="red" floating>3</q-badge>
            <q-tooltip>{{ $t('nav.notifications') }}</q-tooltip>
          </q-btn>

          <!-- Theme Toggle -->
          <q-btn
            flat
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
            :aria-label="
              $q.dark.isActive ? $t('nav.lightMode') : $t('nav.darkMode')
            "
          >
            <q-tooltip>{{
              $q.dark.isActive ? $t('nav.lightMode') : $t('nav.darkMode')
            }}</q-tooltip>
          </q-btn>

          <!-- User Menu -->
          <q-btn flat round icon="person" :aria-label="$t('nav.userMenu')">
            <!-- Demo indicator badge -->
            <q-badge
              v-if="isDemoUser"
              color="amber"
              floating
              class="demo-badge"
            >
              <q-icon name="science" size="10px" />
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
                      {{ $t('demo.title') }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item clickable v-close-popup @click="goToSettings">
                  <q-item-section avatar>
                    <q-icon name="settings" />
                  </q-item-section>
                  <q-item-section>{{ $t('nav.settings') }}</q-item-section>
                </q-item>

                <q-item clickable v-close-popup>
                  <q-item-section avatar>
                    <q-icon name="help" />
                  </q-item-section>
                  <q-item-section>{{ $t('nav.helpSupport') }}</q-item-section>
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
                  <q-item-section>{{ $t('nav.logout') }}</q-item-section>
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
      class="navigation-drawer"
      :width="280"
      role="navigation"
              :aria-label="$t('common.accessibility.mainNavigation')"
    >
      <!-- Clinic Info Section -->
      <div class="clinic-info-section" role="banner">
        <div class="clinic-avatar">
          <q-avatar size="48px" color="primary" text-color="white">
            <q-icon name="domain" size="24px" />
          </q-avatar>
        </div>
        <div class="clinic-details">
          <div class="clinic-name">{{ clinicName }}</div>
          <div class="clinic-plan">{{ $t('clinic.professionalPlan') }}</div>
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
              v-ripple
              :active="$route.name === item.routeName || isParentActive(item)"
              active-class="nav-item-active"
              class="nav-item"
              :class="{ 'has-submenu': item.submenu }"
              :aria-label="
                item.title + (item.badge ? ' (' + item.badge + ' items)' : '')
              "
              @click="handleItemClick(item)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="20px" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="nav-item-label">{{
                  item.title
                }}</q-item-label>
              </q-item-section>

              <q-item-section side v-if="item.badge">
                <q-badge
                  :color="item.badgeColor || 'primary'"
                  :label="item.badge"
                  :aria-label="`${item.badge} items requiring attention`"
                />
              </q-item-section>

              <!-- Expand/Collapse for submenu -->
              <q-item-section side v-if="item.submenu" class="submenu-chevron">
                <q-icon
                  :name="
                    isSubmenuExpanded(item.routeName)
                      ? 'expand_less'
                      : 'expand_more'
                  "
                  size="20px"
                  class="chevron-icon"
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
                  v-ripple
                  :active="$route.name === subItem.routeName"
                  active-class="nav-item-active"
                  class="nav-item nav-sub-item"
                  :aria-label="subItem.title"
                >
                  <q-item-section avatar class="sub-item-avatar">
                    <q-icon :name="subItem.icon" size="18px" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="nav-item-label">{{
                      subItem.title
                    }}</q-item-label>
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
          :aria-label="$t('nav.upgradePlan')"
        >
          <q-item-section avatar>
            <q-icon name="upgrade" color="accent" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">{{
              $t('nav.upgradePlan')
            }}</q-item-label>
            <q-item-label caption>{{
              $t('nav.getAdvancedFeatures')
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

  // Type definitions for navigation
  interface NavigationItem {
    title: string;
    caption?: string;
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

  // State
  const leftDrawerOpen = ref(false);
  const isScrolled = ref(false);
  const expandedSubmenus = ref<string[]>([]);

  // Computed properties
  const userProfile = computed(() => authStore.userProfile);
  const userEmail = computed(() => authStore.userEmail);
  const clinicName = computed(
    () => clinicStore.clinic?.name || t('clinic.defaultName')
  );
  const isDemoUser = computed(
    () => authStore.userEmail === 'demo@medstock-pro.com'
  );

  // Check if user has admin permissions
  const isAdmin = computed(() => {
    const role = userProfile.value?.role || '';
    return role === 'admin' || role === 'owner';
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
            badge: 3,
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
            to: '/inventory',
            routeName: 'inventory',
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
            to: '/inventory/batches',
            routeName: 'inventory-batches',
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

    return sections;
  });

  // Methods
  const toggleLeftDrawer = () => {
    leftDrawerOpen.value = !leftDrawerOpen.value;
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
      .map(n => n[0])
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
      const wasExpanded = isSubmenuExpanded(item.routeName);
      const isCurrentPage = router.currentRoute.value.name === item.routeName;

      if (!wasExpanded) {
        // Submenu is closed: open it and navigate to main page
        toggleSubmenu(item.routeName);
        if (!isCurrentPage) {
          router.push(item.to);
        }
      } else {
        // Submenu is open: if we're on main page, just close submenu
        // If we're on child page, navigate to main page
        if (isCurrentPage) {
          toggleSubmenu(item.routeName);
        } else {
          router.push(item.to);
        }
      }
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
    if (!item.submenu) return false;
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
        color: var(--neutral-700);
        border-radius: var(--radius-lg);
        transition: all var(--transition-base);

        &:hover {
          background-color: rgba(var(--q-primary-rgb), 0.1);
          color: var(--brand-primary);
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
          transition: all var(--transition-base);

          &:hover {
            background-color: rgba(var(--q-primary-rgb), 0.1);
            color: var(--brand-primary);
            transform: scale(1.05);
          }
        }

        .user-menu-btn {
          border-radius: var(--radius-full);
          padding: var(--space-1);
          transition: all var(--transition-base);

          &:hover {
            transform: scale(1.05);
            box-shadow: var(--shadow-sm);
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
        color: var(--neutral-800);

        &:hover {
          background-color: rgba(var(--q-primary-rgb), 0.15);
          color: var(--brand-primary-light);
        }
      }

      .header-actions {
        .action-btn {
          color: var(--neutral-800);

          &:hover {
            background-color: rgba(var(--q-primary-rgb), 0.15);
            color: var(--brand-primary-light);
          }
        }
      }
    }
  }

  // Enhanced navigation drawer
  .navigation-drawer {
    background: var(--neutral-50);
    border-right: 1px solid var(--neutral-200);

    .clinic-info-section {
      padding: var(--space-6);
      border-bottom: 1px solid var(--neutral-200);
      display: flex;
      align-items: center;
      gap: var(--space-4);

      .clinic-details {
        .clinic-name {
          font-weight: var(--font-weight-semibold);
          font-size: 1rem;
          color: var(--neutral-900);
          margin-bottom: var(--space-1);
        }

        .clinic-plan {
          font-size: 0.875rem;
          color: var(--neutral-500);
          background: var(--neutral-100);
          padding: var(--space-1) var(--space-2);
          border-radius: var(--radius-full);
          display: inline-block;
        }
      }
    }

    .navigation-list {
      padding: var(--space-4);

      .navigation-header {
        font-weight: var(--font-weight-semibold);
        color: var(--neutral-600);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: var(--space-3);
      }

      .nav-item {
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-1);
        transition: all var(--transition-base);

        &:hover {
          background-color: var(--neutral-100);
          transform: translateX(4px);
        }

        &:focus {
          outline: 2px solid var(--brand-primary);
          outline-offset: 2px;
          background-color: var(--neutral-100);
        }

        &.nav-item-active {
          background: linear-gradient(
            135deg,
            var(--brand-primary),
            var(--brand-primary-light)
          );
          color: white;
          transform: translateX(6px);
          box-shadow: var(--shadow-sm);

          .q-icon {
            color: white;
          }
        }

        .nav-item-label {
          font-weight: var(--font-weight-medium);
          font-size: 0.925rem;
        }

        // Submenu chevron styling
        .submenu-chevron {
          min-width: 24px;

          .chevron-icon {
            color: var(--neutral-500);
            transition: all var(--transition-base);
          }
        }

        &.has-submenu:hover .chevron-icon {
          color: var(--brand-primary);
        }

        &.nav-item-active .chevron-icon {
          color: white;
        }
      }

      // Section headers
      .navigation-section-header {
        font-size: 0.8rem;
        font-weight: var(--font-weight-bold);
        color: var(--neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-top: var(--space-4);
        margin-bottom: var(--space-2);
        padding-left: var(--space-4);

        &:first-of-type {
          margin-top: var(--space-2);
        }

        // All sections use primary blue color
        &.section-main,
        &.section-inventory,
        &.section-supply,
        &.section-analytics,
        &.section-admin {
          color: var(--brand-primary);
        }
      }

      // Section separators
      .navigation-separator {
        margin: var(--space-4) var(--space-3);
        background: var(--neutral-200);
      }

      // Submenu items
      .nav-sub-item {
        margin-left: var(--space-6);
        border-left: 2px solid var(--neutral-200);
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
        transition: all var(--transition-base);

        &:hover {
          border-left-color: var(--brand-primary);
          background: var(--neutral-50);
        }

        &.nav-item-active {
          border-left-color: var(--brand-primary);
          background: linear-gradient(
            90deg,
            rgba(var(--q-primary-rgb), 0.1),
            transparent
          );
          transform: none;
          margin-left: calc(var(--space-6) + 2px);

          // Override text colors for submenu items to keep them readable
          .nav-item-label {
            color: var(--brand-primary);
            font-weight: var(--font-weight-bold);
          }

          .q-icon {
            color: var(--brand-primary);
          }
        }

        .sub-item-avatar {
          min-width: 32px;

          .q-icon {
            font-size: 16px;
            opacity: 0.8;
          }
        }

        .nav-item-label {
          font-size: 0.875rem;
        }
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
      border-top: 1px solid var(--neutral-200);

      .upgrade-item {
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-base);

        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        &:focus {
          outline: 2px solid var(--brand-primary);
          outline-offset: 2px;
          box-shadow: var(--shadow-lg);
        }
      }
    }
  }

  // Dark mode drawer
  body.body--dark .navigation-drawer {
    background: var(--neutral-100);
    border-right-color: var(--neutral-300);

    .clinic-info-section {
      border-bottom-color: var(--neutral-300);

      .clinic-details .clinic-name {
        color: var(--neutral-900);
      }

      .clinic-details .clinic-plan {
        background: var(--neutral-200);
      }
    }

    .navigation-list {
      .nav-item:hover {
        background-color: var(--neutral-200);

        .chevron-icon {
          color: var(--brand-primary-light);
        }
      }

      .nav-item.nav-item-active .chevron-icon {
        color: white;
      }

      // Dark mode section headers
      .navigation-section-header {
        color: var(--neutral-500);

        &.section-main,
        &.section-inventory,
        &.section-supply,
        &.section-analytics,
        &.section-admin {
          color: var(--brand-primary-light);
        }
      }

      // Dark mode separators
      .navigation-separator {
        background: var(--neutral-300);
      }

      // Dark mode submenu items
      .nav-sub-item {
        border-left-color: var(--neutral-300);

        &:hover {
          border-left-color: var(--brand-primary-light);
          background: var(--neutral-200);
        }

        &.nav-item-active {
          border-left-color: var(--brand-primary-light);
          background: linear-gradient(
            90deg,
            rgba(var(--q-primary-rgb), 0.15),
            transparent
          );

          // Dark mode readable colors for submenu active items
          .nav-item-label {
            color: var(--brand-primary-light);
            font-weight: var(--font-weight-bold);
          }

          .q-icon {
            color: var(--brand-primary-light);
          }
        }
      }
    }

    .quick-stats-section {
      border-top-color: var(--neutral-300);

      .stat-item {
        background: var(--neutral-200);

        .stat-number {
          color: var(--neutral-900);
        }
      }
    }

    .drawer-footer {
      border-top-color: var(--neutral-300);
    }
  }

  // Header Actions
  .header-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-actions .q-btn {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    color: var(--neutral-600);
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .q-icon {
      font-size: 22px;
    }

    &:hover {
      color: var(--brand-primary);
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(var(--brand-primary-rgb), 0.3);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    }

    &:focus {
      outline: 2px solid var(--brand-primary);
      outline-offset: 2px;
    }

    &:active {
      transform: translateY(0);
    }
  }

  // Notification badge styling
  .header-actions .q-btn .q-badge {
    font-size: 11px;
    font-weight: 600;
    min-width: 18px;
    height: 18px;
    border: 2px solid white;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
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
    color: var(--q-amber-6) !important;
    font-weight: 500;
    display: flex;
    align-items: center;
    margin-top: 2px;
  }
</style>
