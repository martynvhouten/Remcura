<template>
  <PageLayout>
    <template #header>
      <PageTitle
        :title="$t('settings.title')"
        subtitle="Beheer je instellingen en voorkeuren voor een optimale ervaring"
        icon="settings"
        :meta="[
          { icon: 'person', text: userProfile?.full_name || 'User' },
          { icon: 'domain', text: clinicName }
        ]"
      >
        <template #actions>
          <q-btn
            color="primary"
            icon="save"
            label="Instellingen opslaan"
            @click="saveSettings"
            :loading="saving"
            class="btn-modern"
            unelevated
          />
        </template>
      </PageTitle>
    </template>

    <!-- Settings Grid -->
    <div class="settings-grid animate-slide-up">
      <!-- User Profile Settings -->
      <div class="settings-section">
        <q-card class="card-modern card-elevated">
          <q-card-section class="card-header">
            <div class="card-header-content">
              <div class="card-title-section">
                <q-icon name="person" color="primary" size="24px" />
                <div>
                  <h3 class="card-title">{{ $t('settings.profile') }}</h3>
                  <p class="card-subtitle">Persoonlijke accountgegevens</p>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="form-grid">
                <q-input
                  v-model="userSettings.fullName"
                  :label="$t('auth.fullName')"
                  outlined
                  readonly
                class="input-modern"
                >
                <template v-slot:prepend>
                    <q-icon name="person" />
                  </template>
                </q-input>

                <q-input
                  v-model="userSettings.email"
                  :label="$t('auth.email')"
                  outlined
                  readonly
                class="input-modern"
                >
                <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-input
                  v-model="userSettings.role"
                  label="Rol"
                  outlined
                  readonly
                class="input-modern"
                >
                <template v-slot:prepend>
                    <q-icon name="badge" />
                  </template>
                </q-input>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Appearance Settings -->
      <div class="settings-section">
        <q-card class="card-modern card-elevated">
          <q-card-section class="card-header">
            <div class="card-header-content">
              <div class="card-title-section">
                <q-icon name="palette" color="secondary" size="24px" />
                <div>
                  <h3 class="card-title">Weergave</h3>
                  <p class="card-subtitle">Interface en taalinstellingen</p>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="settings-items">
              <!-- Dark Mode Toggle -->
              <div class="setting-item glass-card">
                <div class="setting-info">
                  <div class="setting-label">{{ $t('settings.darkMode') }}</div>
                  <div class="setting-description">
                      Schakel tussen lichte en donkere modus
                  </div>
                </div>
                <div class="setting-control">
                    <q-toggle
                      v-model="isDarkMode"
                      @update:model-value="toggleDarkMode"
                      color="primary"
                      size="lg"
                    class="toggle-modern"
                    />
                  </div>
                </div>

              <!-- Language Setting -->
              <div class="setting-item glass-card">
                <div class="setting-info">
                  <div class="setting-label">Taal</div>
                  <div class="setting-description">
                      Selecteer je voorkeurstaal (alleen Nederlands beschikbaar)
                  </div>
                </div>
                <div class="setting-control">
                    <q-select
                      v-model="selectedLanguage"
                      :options="languageOptions"
                      outlined
                      dense
                    class="select-modern"
                    readonly
                      style="width: 150px"
                    />
                </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Clinic Information -->
      <div class="settings-section full-width">
        <q-card class="card-modern card-elevated">
          <q-card-section class="card-header">
            <div class="card-header-content">
              <div class="card-title-section">
                <q-icon name="business" color="info" size="24px" />
                <div>
                  <h3 class="card-title">{{ $t('settings.clinic') }}</h3>
                  <p class="card-subtitle">Kliniek informatie en contactgegevens</p>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="clinic-form-grid">
                  <q-input
                    v-model="clinicSettings.name"
                    label="Kliniek naam"
                    outlined
                    readonly
                class="input-modern"
                  >
                <template v-slot:prepend>
                      <q-icon name="business" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="clinicSettings.contactEmail"
                    label="Contact e-mail"
                    outlined
                    readonly
                class="input-modern"
                  >
                <template v-slot:prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="clinicSettings.contactPhone"
                    label="Telefoonnummer"
                    outlined
                    readonly
                class="input-modern"
                  >
                <template v-slot:prepend>
                      <q-icon name="phone" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="clinicSettings.address"
                    label="Adres"
                    outlined
                    readonly
                class="input-modern"
                  >
                <template v-slot:prepend>
                      <q-icon name="location_on" />
                    </template>
                  </q-input>
              </div>

            <div class="clinic-notice">
              <q-banner class="notice-banner glass-card" rounded>
                  <template v-slot:avatar>
                  <q-icon name="info" color="info" />
                  </template>
                <div class="notice-text">
                  Voor wijzigingen aan kliniek gegevens, neem contact op met de beheerder.
                </div>
                </q-banner>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Notification Settings -->
      <div class="settings-section">
        <q-card class="card-modern card-elevated">
          <q-card-section class="card-header">
            <div class="card-header-content">
              <div class="card-title-section">
                <q-icon name="notifications" color="warning" size="24px" />
                <div>
                  <h3 class="card-title">{{ $t('settings.notifications') }}</h3>
                  <p class="card-subtitle">Meldingen en waarschuwingen</p>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="settings-items">
              <!-- Low Stock Alerts -->
              <div class="setting-item glass-card">
                <div class="setting-info">
                  <div class="setting-label">Voorraad waarschuwingen</div>
                  <div class="setting-description">
                      Ontvang meldingen bij lage voorraad
                  </div>
                </div>
                <div class="setting-control">
                    <q-toggle
                      v-model="notificationSettings.lowStockAlerts"
                      color="primary"
                    class="toggle-modern"
                    />
                  </div>
                </div>

              <!-- Email Notifications -->
              <div class="setting-item glass-card">
                <div class="setting-info">
                  <div class="setting-label">E-mail notificaties</div>
                  <div class="setting-description">
                      Ontvang belangrijke updates via e-mail
                  </div>
                </div>
                <div class="setting-control">
                    <q-toggle
                      v-model="notificationSettings.emailNotifications"
                      color="primary"
                    class="toggle-modern"
                    />
                  </div>
                </div>

              <!-- Browser Notifications -->
              <div class="setting-item glass-card">
                <div class="setting-info">
                  <div class="setting-label">Browser notificaties</div>
                  <div class="setting-description">
                      Sta browser notificaties toe
                  </div>
                </div>
                <div class="setting-control">
                    <q-toggle
                      v-model="notificationSettings.browserNotifications"
                      color="primary"
                    class="toggle-modern"
                    />
                </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- System Information -->
      <div class="settings-section">
        <q-card class="card-modern card-elevated">
          <q-card-section class="card-header">
            <div class="card-header-content">
              <div class="card-title-section">
                <q-icon name="info" color="accent" size="24px" />
                <div>
                  <h3 class="card-title">Systeem informatie</h3>
                  <p class="card-subtitle">Versie en ondersteuning</p>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="card-content">
            <div class="system-info">
              <div class="info-item">
                <div class="info-label">Versie</div>
                <div class="info-value">1.0.0</div>
              </div>
              
              <div class="info-item">
                <div class="info-label">Laatste update</div>
                <div class="info-value">{{ new Date().toLocaleDateString('nl-NL') }}</div>
              </div>
              
              <div class="info-item">
                <div class="info-label">Support</div>
                <div class="info-value">
                  <a href="mailto:support@medstock-pro.com" class="support-link">
                    support@medstock-pro.com
                  </a>
                </div>
              </div>
            </div>
            </q-card-section>
          </q-card>
      </div>
    </div>
  </PageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from 'src/stores/auth'
import { useClinicStore } from 'src/stores/clinic'
import PageLayout from 'src/components/PageLayout.vue'
import PageTitle from 'src/components/PageTitle.vue'

const $q = useQuasar()
const { t } = useI18n()
const authStore = useAuthStore()
const clinicStore = useClinicStore()

// State
const saving = ref(false)
const isDarkMode = ref($q.dark.isActive)
const selectedLanguage = ref('nl')

// Computed properties
const userProfile = computed(() => authStore.userProfile)
const clinicName = computed(() => clinicStore.clinic?.name || 'Kliniek')

// Form data
const userSettings = ref({
  fullName: userProfile.value?.full_name || '',
  email: authStore.userEmail || '',
  role: 'Administrator' // This would come from your role system
})

const clinicSettings = ref({
  name: clinicName.value,
  contactEmail: 'contact@example.com',
  contactPhone: '+31 20 123 4567',
  address: 'Voorbeeldstraat 123, Amsterdam'
})

const notificationSettings = ref({
  lowStockAlerts: true,
  emailNotifications: true,
  browserNotifications: false
})

const languageOptions = [
  { label: 'Nederlands', value: 'nl' }
]

// Methods
const toggleDarkMode = (value: boolean) => {
  $q.dark.set(value)
  
  $q.notify({
    type: 'positive',
    message: value ? 'Donkere modus ingeschakeld' : 'Lichte modus ingeschakeld',
    position: 'top-right',
    timeout: 2000
  })
}

const saveSettings = async () => {
  saving.value = true
  
  try {
    // Here you would save the settings to your backend/store
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
    
    $q.notify({
      type: 'positive',
      message: 'Instellingen succesvol opgeslagen',
      position: 'top-right',
      timeout: 3000
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Er is een fout opgetreden bij het opslaan',
      position: 'top-right',
      timeout: 3000
    })
  } finally {
    saving.value = false
  }
}

// Initialize data
onMounted(() => {
  // Load settings from store/localStorage if available
  const savedDarkMode = $q.localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode
    $q.dark.set(savedDarkMode)
  }
})
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
  .notice-banner {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-backdrop);
    border: 1px solid var(--glass-border);
    
    .notice-text {
      font-size: var(--text-sm);
      color: var(--neutral-700);
    }
  }
}

// Settings items
.settings-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--neutral-200);
  transition: all var(--transition-base);
  
  &:hover {
    border-color: var(--neutral-300);
    box-shadow: var(--shadow-sm);
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
}

// Input styling
.input-modern {
  .q-field__control {
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
    
    &:hover {
      box-shadow: var(--shadow-sm);
    }
  }
}

.select-modern {
  border-radius: var(--radius-lg);
}

.toggle-modern {
  .q-toggle__track {
    border-radius: var(--radius-full);
  }
  
  .q-toggle__thumb {
    border-radius: var(--radius-full);
  }
}

// Card header styling
.card-header {
  .card-header-content {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    
    .card-title-section {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      
      .q-icon {
        margin-top: 2px; // Align icon with first line of title text
        flex-shrink: 0;
      }
      
      .card-title {
        font-size: var(--text-xl);
        font-weight: var(--font-weight-semibold);
        color: var(--neutral-900);
        margin: 0;
      }
      
      .card-subtitle {
        font-size: var(--text-sm);
        color: var(--neutral-600);
        margin: 0;
        margin-top: var(--space-1);
      }
    }
  }
}

// Card content
.card-content {
  padding: var(--space-6);
}

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

// Dark mode adjustments
body.body--dark {
  .setting-item {
    border-color: var(--neutral-300);
    
    &:hover {
      border-color: var(--neutral-400);
    }
    
    .setting-label {
      color: var(--neutral-900);
    }
    
    .setting-description {
      color: var(--neutral-600);
    }
  }
  
  .clinic-notice .notice-banner .notice-text {
    color: var(--neutral-600);
  }
  
  .card-title {
    color: var(--neutral-900);
  }
  
  .card-subtitle {
    color: var(--neutral-600);
  }
}
</style> 