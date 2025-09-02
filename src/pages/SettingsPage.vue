<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('settings.title')"
        :subtitle="$t('settings.manageSettingsSubtitle')"
        icon="tune"
        :meta="[
          { icon: 'person', text: userProfile?.full_name || 'User' },
          { icon: 'domain', text: clinicName },
        ]"
      >
        <template #actions>
          <q-btn
            flat
            round
            icon="refresh"
            size="md"
            @click="loadSettings"
            :loading="loading"
            class="app-btn-refresh"
          >
            <q-tooltip>{{ $t('common.refresh') }}</q-tooltip>
          </q-btn>
          <q-btn
            icon="save"
            :label="$t('settings.saveSettings')"
            @click="saveSettings"
            :loading="saving"
            unelevated
            no-caps
            class="app-btn-success"
          />
        </template>
      </PageTitle>
    </template>

    <!-- Settings Grid -->
    <div class="settings-grid animate-slide-up">
      <!-- User Profile Settings -->
      <div class="settings-section">
        <BaseCard
          :title="$t('settings.profile')"
          :subtitle="$t('settings.profileSubtitle')"
          icon="person"
          icon-color="primary"
        >
          <div class="form-grid" role="group" aria-labelledby="profile-title">
            <q-input
              v-model="userSettings.fullName"
              :label="$t('auth.fullName')"
              outlined
              readonly
              :aria-label="`${$t('auth.fullName')}: ${userSettings.fullName}`"
            >
              <template v-slot:prepend>
                <q-icon name="person" aria-hidden="true" />
              </template>
            </q-input>

            <q-input
              v-model="userSettings.email"
              :label="$t('auth.email')"
              outlined
              readonly
              :aria-label="`${$t('auth.email')}: ${userSettings.email}`"
            >
              <template v-slot:prepend>
                <q-icon name="email" aria-hidden="true" />
              </template>
            </q-input>

            <q-input
              v-model="userSettings.role"
              :label="$t('settings.role')"
              outlined
              readonly
              :aria-label="`${$t('settings.role')}: ${userSettings.role}`"
            >
              <template v-slot:prepend>
                <q-icon name="badge" aria-hidden="true" />
              </template>
            </q-input>
          </div>
        </BaseCard>
      </div>

      <!-- Appearance Settings -->
      <div class="settings-section">
        <BaseCard
          :title="$t('settings.appearanceTitle')"
          :subtitle="$t('settings.appearanceSubtitle')"
          icon="palette"
          icon-color="secondary"
        >
          <div
            class="settings-options"
            role="group"
            aria-labelledby="appearance-title"
          >
            <!-- Dark Mode Toggle -->
            <BaseCard padding="sm">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label" id="dark-mode-label">
                    {{ $t('settings.darkMode') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.darkModeDescription') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-toggle
                    v-model="isDarkMode"
                    @update:model-value="toggleDarkMode"
                    color="primary"
                    size="lg"
                    :aria-labelledby="'dark-mode-label'"
                    :aria-describedby="'dark-mode-description'"
                  />
                  <div id="dark-mode-description" class="sr-only">
                    {{
                      isDarkMode
                        ? $t('settings.darkModeEnabled')
                        : $t('settings.lightModeEnabled')
                    }}
                  </div>
                </div>
              </div>
            </BaseCard>

            <!-- Language Setting (hidden for NL-only) -->
            <!-- Removed language selector until multi-locale returns -->

            <!-- Theme Setting -->
            <BaseCard padding="sm">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label" id="theme-label">
                    {{ $t('settings.colorSchemeTitle') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.colorSchemeDescription') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-select
                    v-model="selectedTheme"
                    :options="themeOptions"
                    @update:model-value="changeTheme"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    outlined
                    dense
                    style="width: 150px"
                    :aria-labelledby="'theme-label'"
                  />
                </div>
              </div>
            </BaseCard>
          </div>
        </BaseCard>
      </div>

      <!-- Clinic Information -->
      <div class="settings-section full-width">
        <BaseCard
          :title="$t('settings.clinic')"
          :subtitle="$t('settings.clinicInfoSubtitle')"
          icon="business"
          icon-color="info"
        >
          <div
            class="clinic-form-grid"
            role="group"
            aria-labelledby="clinic-title"
          >
            <q-input
              v-model="clinicSettings.name"
              :label="$t('settings.clinicName')"
              outlined
              readonly
              class="input-modern"
              :aria-label="`${$t('settings.clinicName')}: ${
                clinicSettings.name
              }`"
            >
              <template v-slot:prepend>
                <q-icon name="business" aria-hidden="true" />
              </template>
            </q-input>

            <q-input
              v-model="clinicSettings.contactEmail"
              :label="$t('settings.contactEmail')"
              outlined
              readonly
              class="input-modern"
              :aria-label="`${$t('settings.contactEmail')}: ${
                clinicSettings.contactEmail
              }`"
            >
              <template v-slot:prepend>
                <q-icon name="email" aria-hidden="true" />
              </template>
            </q-input>

            <q-input
              v-model="clinicSettings.contactPhone"
              :label="$t('settings.phoneNumber')"
              outlined
              readonly
              class="input-modern"
              :aria-label="`${$t('settings.phoneNumber')}: ${
                clinicSettings.contactPhone
              }`"
            >
              <template v-slot:prepend>
                <q-icon name="phone" aria-hidden="true" />
              </template>
            </q-input>

            <q-input
              v-model="clinicSettings.address"
              :label="$t('settings.address')"
              outlined
              readonly
              class="input-modern"
              :aria-label="`${$t('settings.address')}: ${
                clinicSettings.address
              }`"
            >
              <template v-slot:prepend>
                <q-icon name="location_on" aria-hidden="true" />
              </template>
            </q-input>
          </div>

          <div class="clinic-notice">
            <AlertCard
              severity="info"
              :title="$t('settings.contactSettingsNotice')"
              padding="sm"
            />
          </div>
        </BaseCard>
      </div>

      <!-- Notification Settings -->
      <div class="settings-section">
        <BaseCard
          :title="$t('settings.notifications')"
          :subtitle="$t('settings.notificationSettingsSubtitle')"
          icon="notifications"
          icon-color="warning"
        >
          <div class="settings-options">
            <!-- Low Stock Alerts -->
            <BaseCard padding="sm">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label">
                    {{ $t('settings.stockAlertsLabel') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.stockAlertsDescription') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-toggle
                    v-model="notificationSettings.lowStockAlerts"
                    color="primary"
                  />
                </div>
              </div>
            </BaseCard>

            <!-- Email Notifications -->
            <BaseCard padding="sm">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label">
                    {{ $t('settings.emailNotificationsLabel') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.emailNotificationsDescription') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-toggle
                    v-model="notificationSettings.emailNotifications"
                    color="primary"
                  />
                </div>
              </div>
            </BaseCard>

            <!-- Browser Notifications -->
            <BaseCard padding="sm">
              <div class="setting-item">
                <div class="setting-info">
                  <div class="setting-label">
                    {{ $t('settings.browserNotificationsLabel') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.browserNotificationsDescription') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-toggle
                    v-model="notificationSettings.browserNotifications"
                    color="primary"
                  />
                </div>
              </div>
            </BaseCard>
          </div>
        </BaseCard>
      </div>

      <!-- System Information -->
      <div class="settings-section">
        <BaseCard
          :title="$t('settings.systemInfoTitle')"
          :subtitle="$t('settings.systemInfoSubtitle')"
          icon="info"
          icon-color="info"
        >
          <div class="system-info">
            <div class="info-item">
              <div class="info-label">{{ $t('settings.versionLabel') }}</div>
              <div class="info-value">1.0.0</div>
            </div>

            <div class="info-item">
              <div class="info-label">
                {{ $t('settings.lastUpdateLabel') }}
              </div>
              <div class="info-value">
                {{ new Date().toLocaleDateString('nl-NL') }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-label">{{ $t('settings.supportLabel') }}</div>
              <div class="info-value">
                <a href="mailto:support@remcura.com" class="support-link">
                  support@remcura.com
                </a>
              </div>
            </div>
          </div>
        </BaseCard>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useQuasar } from 'quasar';
  import { useI18n } from 'vue-i18n';
  import { useAuthStore } from 'src/stores/auth';
  import { useClinicStore } from 'src/stores/clinic';
  import { useThemeManager } from 'src/composables/themeManager';
  import {
    setI18nLanguage,
    getCurrentLocale,
    type SupportedLocale,
  } from 'src/i18n';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard, InteractiveCard, AlertCard } from 'src/components/cards';

  const $q = useQuasar();
  const { t } = useI18n();
  const authStore = useAuthStore();
  const clinicStore = useClinicStore();
  const { themeOptions, currentTheme, applyTheme, getCurrentThemeName } =
    useThemeManager();

  // State
  const saving = ref(false);
  const isDarkMode = ref($q.dark.isActive);
  const selectedTheme = ref(getCurrentThemeName());

  // Computed properties
  const userProfile = computed(() => authStore.userProfile);
  const clinicName = computed(() => clinicStore.clinic?.name || 'Kliniek');

  // Form data
  const userSettings = ref({
    fullName: userProfile.value?.full_name || '',
    email: authStore.userEmail || '',
    role: 'Administrator', // This would come from your role system
  });

  const clinicSettings = ref({
    name: clinicName.value,
    contactEmail: 'contact@example.com',
    contactPhone: '+31 20 123 4567',
    address: 'Voorbeeldstraat 123, Amsterdam',
  });

  const notificationSettings = ref({
    lowStockAlerts: true,
    emailNotifications: true,
    browserNotifications: false,
  });

  // Methods
  const toggleDarkMode = (value: boolean) => {
    $q.dark.set(value);

    $q.notify({
      type: 'positive',
      message: value
        ? t('settings.darkModeEnabled')
        : t('settings.lightModeEnabled'),
      position: 'top-right',
      timeout: 2000,
    });
  };

  const changeTheme = (themeName: string) => {
    selectedTheme.value = themeName;
    applyTheme(themeName);

    const themeLabel =
      themeOptions.value.find(option => option.value === themeName)?.label ||
      themeName;
    $q.notify({
      type: 'positive',
      message: t('settings.colorSchemeTitle') + `: ${themeLabel} toegepast`,
      position: 'top-right',
      timeout: 2000,
    });
  };

  const saveSettings = async () => {
    saving.value = true;

    try {
      // Here you would save the settings to your backend/store
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      $q.notify({
        type: 'positive',
        message: t('settings.settingsSaved'),
        position: 'top-right',
        timeout: 3000,
      });
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: t('settings.settingsSaveError'),
        position: 'top-right',
        timeout: 3000,
      });
    } finally {
      saving.value = false;
    }
  };

  // Initialize data
  onMounted(() => {
    // Load settings from store/localStorage if available
    const savedDarkMode = $q.localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const darkModeValue = savedDarkMode === 'true';
      isDarkMode.value = darkModeValue;
      $q.dark.set(darkModeValue);
    }
  });
</script>

<style lang="scss" scoped>
  // Settings grid
  .settings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: var(--space-6);

    .settings-section {
      &.full-width {
        grid-column: 1 / -1;
      }
    }
  }

  // Form grids
  .form-grid {
    display: grid;
    gap: var(--space-4);
  }

  .clinic-form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .clinic-notice {
    margin-top: var(--space-4);
  }

  // Settings options within BaseCards
  .settings-options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .setting-info {
    flex: 1;

    .setting-label {
      font-size: var(--text-base);
      font-weight: var(--font-weight-medium);
      color: var(--neutral-900);
      margin-bottom: var(--space-1);
    }

    .setting-description {
      font-size: var(--text-sm);
      color: var(--neutral-600);
      margin: 0;
    }
  }

  .setting-control {
    margin-left: var(--space-4);
  }

  // All input styling is now handled by global field system

  // All card styling is now handled by BaseCard components

  // System info
  .system-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);

    .info-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--space-3) 0;
      border-bottom: 1px solid var(--neutral-200);

      &:last-child {
        border-bottom: none;
      }

      .info-label {
        font-weight: var(--font-weight-medium);
        color: var(--neutral-700);
      }

      .info-value {
        color: var(--neutral-900);

        .support-link {
          color: var(--brand-primary);
          text-decoration: none;
          transition: color var(--transition-base);

          &:hover {
            color: var(--brand-primary-dark);
          }
        }
      }
    }
  }

  // Responsive design
  @media (max-width: 768px) {
    .settings-grid {
      grid-template-columns: 1fr;
      gap: var(--space-4);
    }

    .clinic-form-grid {
      grid-template-columns: 1fr;
    }

    .setting-item {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-3);

      .setting-control {
        margin-left: 0;
        align-self: flex-end;
      }
    }
  }

  // Dark mode is handled by CSS variables and BaseCard components

  // Screen reader only content (now in global app.scss)

  // Focus styles are handled by global field system
</style>
