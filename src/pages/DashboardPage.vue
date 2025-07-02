<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('nav.dashboard')"
        :subtitle="`${$t('dashboard.welcome')}, ${userProfile?.full_name || $t('dashboard.user')}`"
        icon="space_dashboard"
      />
    </template>

    <!-- Dashboard Content -->
    <div class="dashboard-content">
      <!-- Welcome Card -->
      <BaseCard 
        variant="elevated"
        title="Welcome to MedStock Pro"
        subtitle="Your medical inventory management system"
        icon="local_hospital"
        header-color="primary"
      >
        <div class="welcome-content">
          <p>Welcome to your medical inventory management dashboard. This system will help you track and manage your medical supplies efficiently.</p>
          
          <div class="quick-actions-grid">
            <q-btn
              color="primary"
              icon="settings"
              label="Settings"
              @click="$router.push('/settings')"
              unelevated
              class="action-btn"
            />
            <q-btn
              color="positive"
              icon="assignment"
              label="Orders"
              @click="$router.push('/orders')"
              unelevated
              class="action-btn"
            />
            <q-btn
              color="info"
              icon="insights"
              label="Analytics"
              @click="$router.push('/analytics')"
              unelevated
              class="action-btn"
            />
          </div>
        </div>
      </BaseCard>

      <!-- System Status Card -->
      <BaseCard 
        variant="outlined"
        title="System Status"
        subtitle="Current system information"
        icon="info"
        header-color="info"
      >
        <div class="status-grid">
          <div class="status-item">
            <q-icon name="check_circle" color="positive" size="sm" />
            <span class="status-label">System Online</span>
          </div>
          <div class="status-item">
            <q-icon name="sync" color="primary" size="sm" />
            <span class="status-label">Data Synced</span>
          </div>
          <div class="status-item">
            <q-icon name="security" color="positive" size="sm" />
            <span class="status-label">Secure Connection</span>
          </div>
        </div>
      </BaseCard>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'
import BaseCard from 'src/components/base/BaseCard.vue'

const { t } = useI18n()
const authStore = useAuthStore()

// Computed properties
const userProfile = computed(() => authStore.userProfile)
</script>

<style lang="scss" scoped>
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.welcome-content {
  padding: var(--space-4);
  
  p {
    margin-bottom: var(--space-6);
    color: var(--text-muted);
    line-height: 1.6;
  }
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  
  .action-btn {
    min-height: 60px;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
}

.status-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--neutral-50);
  border-radius: var(--radius-lg);
  
  .status-label {
    font-weight: var(--font-weight-medium);
    color: var(--text-primary);
  }
}

// Dark mode
body.body--dark {
  .status-item {
    background: var(--neutral-200);
  }
}

@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style> 