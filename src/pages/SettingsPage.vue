<template>
  <PageLayout>
    <PageTitle
      :title="$t('settings.title')"
      :subtitle="$t('settings.subtitle')"
      icon="settings"
    />

    <div class="settings-page">
      <!-- Card Container for All Settings -->
      <q-card flat class="settings-main-card">
        <q-card-section>
          <!-- Appearance Settings -->
          <div class="settings-section">
            <h3 class="section-title">
              {{ $t('settings.appearance') }}
            </h3>
            <div
              class="settings-items"
              role="group"
              aria-labelledby="appearance-title"
            >
              <!-- Dark Mode Toggle -->
              <BaseCard>
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
                    class="toggle-modern"
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
              </BaseCard>

              <!-- Language Setting -->
              <BaseCard>
                <div class="setting-info">
                  <div class="setting-label" id="language-label">
                    {{ $t('settings.language') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.selectLanguage') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-select
                    v-model="selectedLocale"
                    :options="localeOptions"
                    emit-value
                    map-options
                    @update:model-value="changeLocale"
                    color="primary"
                    outlined
                    dense
                    :aria-labelledby="'language-label'"
                  />
                </div>
              </BaseCard>

              <!-- Theme Setting -->
              <BaseCard>
                <div class="setting-info">
                  <div class="setting-label" id="theme-label">
                    {{ $t('settings.theme') }}
                  </div>
                  <div class="setting-description">
                    {{ $t('settings.selectTheme') }}
                  </div>
                </div>
                <div class="setting-control">
                  <q-select
                    v-model="selectedTheme"
                    :options="themeOptions"
                    emit-value
                    map-options
                    @update:model-value="changeTheme"
                    color="primary"
                    outlined
                    dense
                    :aria-labelledby="'theme-label'"
                  />
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Personal Information Settings -->
          <div class="settings-section">
            <h3 class="section-title" id="personal-title">
              {{ $t('settings.personalInformation') }}
            </h3>

            <BaseCard>
              <div class="q-gutter-md">
                <q-input
                  v-model="firstName"
                  :label="$t('settings.firstName')"
                  color="primary"
                  outlined
                  :rules="[val => !!val || $t('settings.firstNameRequired')]"
                  class="col-12 col-md-6"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" aria-hidden="true" />
                  </template>
                </q-input>

                <q-input
                  v-model="lastName"
                  :label="$t('settings.lastName')"
                  color="primary"
                  outlined
                  :rules="[val => !!val || $t('settings.lastNameRequired')]"
                  class="col-12 col-md-6"
                >
                  <template v-slot:prepend>
                    <q-icon name="person" aria-hidden="true" />
                  </template>
                </q-input>

                <q-input
                  v-model="email"
                  :label="$t('settings.email')"
                  type="email"
                  color="primary"
                  outlined
                  readonly
                  :rules="[
                    val => !!val || $t('settings.emailRequired'),
                    val => /.+@.+\..+/.test(val) || $t('settings.emailInvalid')
                  ]"
                  class="col-12"
                >
                  <template v-slot:prepend>
                    <q-icon name="email" aria-hidden="true" />
                  </template>
                </q-input>
              </div>
            </BaseCard>
          </div>

          <!-- Clinic Settings -->
          <div class="settings-section">
            <h3 class="section-title" id="clinic-title">
              {{ $t('settings.clinic') }}
            </h3>

            <BaseCard>
              <div class="q-gutter-md">
                <q-input
                  v-model="clinicName"
                  :label="$t('settings.clinicName')"
                  color="primary"
                  outlined
                  :rules="[val => !!val || $t('settings.clinicNameRequired')]"
                  class="col-12"
                >
                  <template v-slot:prepend>
                    <q-icon name="local_hospital" aria-hidden="true" />
                  </template>
                </q-input>

                <q-input
                  v-model="clinicPhone"
                  :label="$t('settings.clinicPhone')"
                  type="tel"
                  color="primary"
                  outlined
                  class="col-12"
                >
                  <template v-slot:prepend>
                    <q-icon name="phone" aria-hidden="true" />
                  </template>
                </q-input>

                <q-input
                  v-model="clinicAddress"
                  :label="$t('settings.clinicAddress')"
                  color="primary"
                  outlined
                  class="col-12"
                >
                  <template v-slot:prepend>
                    <q-icon name="location_on" aria-hidden="true" />
                  </template>
                </q-input>
              </div>

              <div class="clinic-notice">
                <AlertCard 
                  type="info"
                  icon="info"
                  :title="$t('settings.contactSettingsNotice')"
                >
                  <div class="notice-text">
                    {{ $t('settings.contactSettingsNotice') }}
                    <a href="mailto:support@remcura.nl">support@remcura.nl</a>
                  </div>
                </AlertCard>
              </div>
            </BaseCard>
          </div>

          <!-- Notification Settings -->
          <div class="settings-section">
            <h3 class="section-title">
              {{ $t('settings.notifications') }}
            </h3>
            
            <!-- Email Notifications -->
            <BaseCard>
              <div class="setting-info">
                <div class="setting-label" id="email-notifications-label">
                  {{ $t('settings.emailNotifications') }}
                </div>
                <div class="setting-description">
                  {{ $t('settings.emailNotificationsDescription') }}
                </div>
              </div>
              <div class="setting-control">
                <q-toggle
                  v-model="emailNotifications"
                  @update:model-value="updateEmailNotifications"
                  color="primary"
                  size="lg"
                  class="toggle-modern"
                  :aria-labelledby="'email-notifications-label'"
                />
              </div>
            </BaseCard>

            <!-- SMS Settings -->
            <BaseCard>
              <div class="setting-info">
                <div class="setting-label" id="sms-notifications-label">
                  {{ $t('settings.smsNotifications') }}
                </div>
                <div class="setting-description">
                  {{ $t('settings.smsNotificationsDescription') }}
                </div>
              </div>
              <div class="setting-control">
                <q-toggle
                  v-model="smsNotifications"
                  @update:model-value="updateSmsNotifications"
                  color="primary"
                  size="lg"
                  class="toggle-modern"
                  :aria-labelledby="'sms-notifications-label'"
                />
              </div>
            </BaseCard>

            <!-- Backup Settings -->
            <BaseCard>
              <div class="setting-info">
                <div class="setting-label" id="auto-backup-label">
                  {{ $t('settings.autoBackup') }}
                </div>
                <div class="setting-description">
                  {{ $t('settings.autoBackupDescription') }}
                </div>
              </div>
              <div class="setting-control">
                <q-toggle
                  v-model="autoBackup"
                  @update:model-value="updateAutoBackup"
                  color="primary"
                  size="lg"
                  class="toggle-modern"
                  :aria-labelledby="'auto-backup-label'"
                />
              </div>
            </BaseCard>
          </div>

          <!-- Action Buttons -->
          <div class="settings-actions">
            <q-btn
              :label="$t('settings.saveChanges')"
              color="primary"
              unelevated
              @click="saveSettings"
              :loading="saving"
              :disable="!hasUnsavedChanges"
              class="save-btn"
            />
            
            <q-btn
              :label="$t('settings.resetToDefaults')"
              color="grey-7"
              outline
              @click="resetToDefaults"
              :disable="saving"
              class="reset-btn"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useQuasar, Dark } from 'quasar';
  import { useAuthStore } from 'src/stores/auth';
  import { useThemeStore } from 'src/stores/theme';
  import { useClinicsStore } from 'src/stores/clinics';
  import { settingsService } from 'src/services/settings';
  import { monitoringService } from 'src/services/monitoring';
  import PageLayout from 'src/components/PageLayout.vue';
  import PageTitle from 'src/components/PageTitle.vue';
  import { BaseCard, InteractiveCard, AlertCard } from 'src/components/cards';

  // Composables
  const { t, locale } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();
  const themeStore = useThemeStore();
  const clinicsStore = useClinicsStore();

  // State
  const saving = ref(false);
  const firstName = ref('');
  const lastName = ref('');
  const email = ref('');
  const clinicName = ref('');
  const clinicPhone = ref('');
  const clinicAddress = ref('');
  const selectedLocale = ref(locale.value);
  const selectedTheme = ref('auto');
  const emailNotifications = ref(true);
  const smsNotifications = ref(false);
  const autoBackup = ref(true);

  // Computed
  const isDarkMode = computed({
    get: () => Dark.isActive,
    set: (value: boolean) => {
      Dark.set(value);
    }
  });

  const localeOptions = computed(() => [
    { label: 'Nederlands', value: 'nl' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
  ]);

  const themeOptions = computed(() => [
    { label: t('settings.themeAuto'), value: 'auto' },
    { label: t('settings.themeLight'), value: 'light' },
    { label: t('settings.themeDark'), value: 'dark' }
  ]);

  const hasUnsavedChanges = computed(() => {
    // Add logic to detect unsaved changes
    return true; // Simplified for now
  });

  // Methods
  const toggleDarkMode = (value: boolean) => {
    Dark.set(value);
    themeStore.setDarkMode(value);
    monitoringService.trackEvent('theme_changed', { isDark: value });
  };

  const changeLocale = (newLocale: string) => {
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);
    $q.notify({
      type: 'positive',
      message: t('settings.languageChanged'),
      position: 'top'
    });
    monitoringService.trackEvent('language_changed', { locale: newLocale });
  };

  const changeTheme = (theme: string) => {
    selectedTheme.value = theme;
    themeStore.setTheme(theme);
    
    if (theme === 'auto') {
      Dark.set('auto');
    } else {
      Dark.set(theme === 'dark');
    }
    
    monitoringService.trackEvent('theme_changed', { theme });
  };

  const updateEmailNotifications = (value: boolean) => {
    emailNotifications.value = value;
    monitoringService.trackEvent('notification_setting_changed', { 
      type: 'email', 
      enabled: value 
    });
  };

  const updateSmsNotifications = (value: boolean) => {
    smsNotifications.value = value;
    monitoringService.trackEvent('notification_setting_changed', { 
      type: 'sms', 
      enabled: value 
    });
  };

  const updateAutoBackup = (value: boolean) => {
    autoBackup.value = value;
    monitoringService.trackEvent('backup_setting_changed', { enabled: value });
  };

  const saveSettings = async () => {
    saving.value = true;
    try {
      const settings = {
        firstName: firstName.value,
        lastName: lastName.value,
        clinicName: clinicName.value,
        clinicPhone: clinicPhone.value,
        clinicAddress: clinicAddress.value,
        emailNotifications: emailNotifications.value,
        smsNotifications: smsNotifications.value,
        autoBackup: autoBackup.value,
        theme: selectedTheme.value,
        locale: selectedLocale.value
      };

      await settingsService.updateSettings(settings);
      
      $q.notify({
        type: 'positive',
        message: t('settings.settingsSaved'),
        position: 'top'
      });

      monitoringService.trackEvent('settings_saved', { settingsCount: Object.keys(settings).length });
    } catch (error) {
      console.error('Error saving settings:', error);
      $q.notify({
        type: 'negative',
        message: t('settings.settingsSaveError'),
        position: 'top'
      });
    } finally {
      saving.value = false;
    }
  };

  const resetToDefaults = () => {
    $q.dialog({
      title: t('settings.resetToDefaultsConfirm'),
      message: t('settings.resetToDefaultsMessage'),
      cancel: true,
      persistent: true
    }).onOk(() => {
      // Reset to defaults
      selectedLocale.value = 'nl';
      selectedTheme.value = 'auto';
      emailNotifications.value = true;
      smsNotifications.value = false;
      autoBackup.value = true;
      
      $q.notify({
        type: 'info',
        message: t('settings.settingsReset'),
        position: 'top'
      });

      monitoringService.trackEvent('settings_reset');
    });
  };

  const loadUserData = async () => {
    try {
      const user = authStore.user;
      if (user) {
        email.value = user.email || '';
        firstName.value = user.user_metadata?.first_name || '';
        lastName.value = user.user_metadata?.last_name || '';
      }

      const clinic = clinicsStore.currentClinic;
      if (clinic) {
        clinicName.value = clinic.name || '';
        clinicPhone.value = clinic.phone || '';
        clinicAddress.value = clinic.address || '';
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Lifecycle
  onMounted(() => {
    loadUserData();
  });

  // Watchers
  watch(selectedLocale, (newLocale) => {
    if (newLocale !== locale.value) {
      changeLocale(newLocale);
    }
  });
</script>

<style scoped lang="scss">
@import 'src/css/variables.scss';
@import 'src/css/mixins.scss';
@import 'src/css/form-inputs.scss';

.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-4);

  .settings-main-card {
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-base);
  }

  .settings-section {
    margin-bottom: var(--space-8);

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin-bottom: var(--space-4);
      padding-bottom: var(--space-2);
      border-bottom: 2px solid var(--primary-100);
    }
  }

  .settings-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .setting-info {
    flex: 1;

    .setting-label {
      font-size: var(--text-base);
      font-weight: var(--font-medium);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }

    .setting-description {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: 1.4;
    }
  }

  .setting-control {
    margin-left: auto;
    min-width: 140px;

    .toggle-modern {
      transform: scale(1.1);
    }
  }

  .clinic-notice {
    margin-top: var(--space-4);
    
    .notice-text {
      font-size: var(--text-sm);
      
      a {
        color: var(--q-primary);
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .settings-actions {
    display: flex;
    gap: var(--space-3);
    justify-content: flex-end;
    margin-top: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--neutral-200);

    .save-btn {
      min-width: 140px;
    }

    .reset-btn {
      min-width: 120px;
    }
  }

  // Dark mode adjustments
  body.body--dark & {
    .section-title {
      color: var(--text-primary-dark);
      border-bottom-color: var(--primary-800);
    }

    .settings-actions {
      border-top-color: var(--neutral-700);
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    padding: var(--space-2);

    .settings-actions {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-2);

      .save-btn,
      .reset-btn {
        min-width: auto;
        width: 100%;
      }
    }

    .setting-control {
      margin-left: 0;
      align-self: flex-end;
    }
  }

  @media (max-width: 480px) {
    .settings-items {
      .setting-control {
        margin-left: 0;
        margin-top: var(--space-2);
      }
    }
  }
}

// Screen reader only class
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>