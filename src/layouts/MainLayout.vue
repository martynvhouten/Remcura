<template>
  <q-layout view="lHh Lpr lFf" class="layout-modern">
    <!-- Modern Header with Glass Morphism Effect -->
    <q-header 
      elevated 
      class="header-modern glass"
      :class="{ 'header-scrolled': isScrolled }"
    >
      <q-toolbar class="toolbar-modern">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="menu-toggle-btn"
        />

        <div class="brand-section">
          <q-avatar size="32px" color="white" text-color="primary" class="brand-avatar">
            <q-icon name="local_hospital" size="18px" />
          </q-avatar>
          <div class="brand-text">
            <div class="brand-title">MedStock Pro</div>
            <div class="brand-subtitle">Enterprise Edition</div>
          </div>
        </div>

        <q-space />

        <div class="header-actions">
          <!-- Notifications -->
          <q-btn
            flat
            round
            dense
            icon="notifications"
            class="action-btn"
          >
            <q-badge color="danger" floating>3</q-badge>
            <q-tooltip>Notifications</q-tooltip>
          </q-btn>

          <!-- Dark mode toggle -->
          <q-btn
            flat
            round
            dense
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="toggleDarkMode"
            class="action-btn"
          >
            <q-tooltip>{{ $q.dark.isActive ? 'Light Mode' : 'Dark Mode' }}</q-tooltip>
          </q-btn>
          
          <!-- User menu -->
          <q-btn-dropdown
            flat
            round
            dense
            class="user-menu-btn"
            dropdown-icon="none"
          >
            <template v-slot:label>
              <q-avatar size="32px" color="primary">
                <img v-if="userProfile?.avatar_url" :src="userProfile.avatar_url" />
                <span v-else>{{ getUserInitials() }}</span>
              </q-avatar>
            </template>

            <q-list class="user-menu-list">
              <q-item class="user-info-item">
                <q-item-section avatar>
                  <q-avatar size="40px" color="primary">
                    <img v-if="userProfile?.avatar_url" :src="userProfile.avatar_url" />
                    <span v-else>{{ getUserInitials() }}</span>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ userProfile?.full_name || 'User' }}
                  </q-item-label>
                  <q-item-label caption>{{ userEmail }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-separator class="q-my-sm" />
              
              <q-item clickable v-close-popup @click="goToSettings" class="menu-item">
                <q-item-section avatar>
                  <q-icon name="settings" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('nav.settings') }}</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-item clickable v-close-popup class="menu-item">
                <q-item-section avatar>
                  <q-icon name="help_outline" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Help & Support</q-item-label>
                </q-item-section>
              </q-item>
              
              <q-separator class="q-my-sm" />
              
              <q-item clickable v-close-popup @click="handleLogout" class="menu-item logout-item">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ $t('nav.logout') }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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
    >
      <!-- Clinic Info Section -->
      <div class="clinic-info-section">
        <div class="clinic-avatar">
          <q-avatar size="48px" color="primary" text-color="white">
            <q-icon name="domain" size="24px" />
          </q-avatar>
        </div>
        <div class="clinic-details">
          <div class="clinic-name">{{ clinicName }}</div>
          <div class="clinic-plan">Professional Plan</div>
        </div>
      </div>

      <!-- Main Navigation -->
      <q-list class="navigation-list">
        <q-item-label header class="navigation-header">
          Navigation
        </q-item-label>

        <q-item
          v-for="link in navigationLinks"
          :key="link.title"
          :to="link.to"
          clickable
          v-ripple
          :active="$route.name === link.routeName"
          active-class="nav-item-active"
          class="nav-item"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" size="20px" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="nav-item-label">{{ link.title }}</q-item-label>
            <q-item-label caption class="nav-item-caption">{{ link.caption }}</q-item-label>
          </q-item-section>

          <q-item-section side v-if="link.badge">
            <q-badge :color="link.badgeColor || 'primary'" :label="link.badge" />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Quick Stats Section -->
      <div class="quick-stats-section">
        <q-item-label header class="navigation-header">
          Quick Stats
        </q-item-label>
        
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ totalProducts }}</div>
            <div class="stat-label">Products</div>
          </div>
          <div class="stat-item">
            <div class="stat-number text-warning">{{ lowStockCount }}</div>
            <div class="stat-label">Low Stock</div>
          </div>
        </div>
      </div>

      <!-- Spacer -->
      <q-space />

      <!-- Footer Section -->
      <div class="drawer-footer">
        <q-item class="upgrade-item glass-card">
          <q-item-section avatar>
            <q-icon name="upgrade" color="accent" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Upgrade Plan</q-item-label>
            <q-item-label caption>Get advanced features</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- Page Container with Enhanced Styling -->
    <q-page-container class="page-container-modern">
      <!-- Stock alerts banner with modern styling -->
      <StockAlertsBanner />
      
      <!-- Main content area -->
      <div class="page-content">
      <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { useClinicStore } from 'src/stores/clinic'
import StockAlertsBanner from 'src/components/StockAlertsBanner.vue'

const $q = useQuasar()
const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const clinicStore = useClinicStore()

// State
const leftDrawerOpen = ref(false)
const isScrolled = ref(false)

// Computed properties
const userProfile = computed(() => authStore.userProfile)
const userEmail = computed(() => authStore.userEmail)
const clinicName = computed(() => clinicStore.clinic?.name || 'Kliniek')

// Mock stats - these would come from your store in a real app
const totalProducts = computed(() => 247)
const lowStockCount = computed(() => 12)

// Enhanced navigation links with more details
const navigationLinks = computed(() => [
  {
    title: t('nav.dashboard'),
    caption: 'Overview & analytics',
    icon: 'dashboard',
    to: '/',
    routeName: 'dashboard'
  },
  {
    title: t('nav.products'),
    caption: 'Inventory management',
    icon: 'inventory_2',
    to: '/products',
    routeName: 'products',
    badge: lowStockCount.value > 0 ? lowStockCount.value : null,
    badgeColor: 'warning'
  },
  {
    title: t('nav.orders'),
    caption: 'Purchase orders',
    icon: 'shopping_cart',
    to: '/orders',
    routeName: 'orders'
  },
  {
    title: 'Analytics',
    caption: 'Reports & insights',
    icon: 'analytics',
    to: '/analytics',
    routeName: 'analytics'
  },
  {
    title: 'Suppliers',
    caption: 'Vendor management',
    icon: 'store',
    to: '/suppliers',
    routeName: 'suppliers'
  }
])

// Methods
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const toggleDarkMode = () => {
  $q.dark.toggle()
  $q.localStorage.set('darkMode', $q.dark.isActive.toString())
}

const goToSettings = () => {
  router.push({ name: 'settings' })
}

const getUserInitials = () => {
  const name = userProfile.value?.full_name || userEmail.value || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleLogout = async () => {
  const result = await authStore.logout()
  if (result.success) {
    $q.notify({
      type: 'positive',
      message: t('auth.logoutSuccess'),
      position: 'top'
    })
    router.push({ name: 'login' })
  } else {
    $q.notify({
      type: 'negative',
      message: result.error || t('errors.generic'),
      position: 'top'
    })
  }
}

// Scroll detection for header effects
const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.layout-modern {
  // Modern header styling
  .header-modern {
    background: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    transition: all var(--transition-base);
    
    &.header-scrolled {
      background: rgba(255, 255, 255, 0.95) !important;
      box-shadow: var(--shadow-sm);
    }
  }
  
  .toolbar-modern {
    padding: var(--space-4) var(--space-6);
    min-height: 72px;
    
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

// Dark mode header
body.body--dark .layout-modern .header-modern {
  background: rgba(23, 23, 23, 0.85) !important;
  border-bottom-color: rgba(255, 255, 255, 0.1);
  
  &.header-scrolled {
    background: rgba(23, 23, 23, 0.95) !important;
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
      
      &.nav-item-active {
        background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-light));
        color: white;
        transform: translateX(6px);
        box-shadow: var(--shadow-sm);
        
        .q-icon {
    color: white;
        }
        
        .nav-item-caption {
          color: rgba(255, 255, 255, 0.8);
        }
      }
      
      .nav-item-label {
        font-weight: var(--font-weight-medium);
        font-size: 0.925rem;
      }
      
      .nav-item-caption {
        font-size: 0.75rem;
        opacity: 0.8;
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
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
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

// User menu styling
.user-menu-list {
  min-width: 280px;
  border-radius: var(--radius-xl);
  padding: var(--space-2);
  
  .user-info-item {
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    background: var(--neutral-50);
    margin-bottom: var(--space-2);
  }
  
  .menu-item {
    border-radius: var(--radius-lg);
    margin: var(--space-1) 0;
    transition: all var(--transition-base);
    
    &:hover {
      background-color: var(--neutral-100);
      transform: translateX(4px);
    }
    
    &.logout-item:hover {
      background-color: rgba(var(--brand-danger), 0.1);
      color: var(--brand-danger);
    }
  }
}

body.body--dark .user-menu-list {
  .user-info-item {
    background: var(--neutral-200);
  }
  
  .menu-item:hover {
    background-color: var(--neutral-200);
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
    
    .header-actions {
      gap: var(--space-1);
    }
  }
}
</style> 