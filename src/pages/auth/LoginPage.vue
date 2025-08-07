<template>
  <div class="login-form-container">
    <q-form @submit.prevent="handleLogin" class="login-form" novalidate>
      <!-- Manual Login Form (collapsible) -->
      <q-slide-transition>
        <div v-show="showManualLogin" class="manual-login-form">
          <!-- Email Input -->
          <div class="form-field">
            <q-input
              v-model="email.value.value"
              type="email"
              :label="$t('auth.email')"
              outlined
              :error="!!email.error.value"
              :error-message="email.error.value"
              class="input-modern"
              autocomplete="email"
              required
              :aria-describedby="email.error.value ? 'email-error' : undefined"
            >
              <template v-slot:prepend>
                <q-icon name="email" aria-hidden="true" />
              </template>
            </q-input>
            <div v-if="email.error.value" id="email-error" class="sr-only">
              {{ email.error.value }}
            </div>
          </div>

          <!-- Password Input -->
          <div class="form-field">
            <q-input
              v-model="password.value.value"
              :type="showPassword ? 'text' : 'password'"
              :label="$t('auth.password')"
              outlined
              :error="!!password.error.value"
              :error-message="password.error.value"
              class="input-modern"
              autocomplete="current-password"
              required
              :aria-describedby="
                password.error.value ? 'password-error' : 'password-help'
              "
            >
              <template v-slot:prepend>
                <q-icon name="lock" aria-hidden="true" />
              </template>
              <template v-slot:append>
                <q-btn
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  @click="showPassword = !showPassword"
                  class="password-toggle"
                  tabindex="-1"
                  :aria-label="
                    showPassword
                      ? $t('auth.hidePassword')
                      : $t('auth.showPassword')
                  "
                />
              </template>
            </q-input>
            <div
              v-if="password.error.value"
              id="password-error"
              class="sr-only"
            >
              {{ password.error.value }}
            </div>
            <div id="password-help" class="sr-only">
              {{ $t('auth.passwordHelp') }}
            </div>
          </div>

          <!-- Login Button -->
          <div class="form-actions">
            <q-btn
              :loading="loading"
              type="submit"
              class="app-btn-primary login-btn"
              :label="$t('auth.login')"
              unelevated
              no-caps
              :aria-describedby="loading ? 'login-loading' : undefined"
            />
            <div v-if="loading" id="login-loading" class="sr-only">
              {{ $t('auth.signingIn') }}
            </div>
          </div>

          <!-- Separator -->
          <div class="form-separator" role="separator" aria-label="or">
            <q-separator class="separator-line" />
            <span class="separator-text">{{ $t('auth.or') }}</span>
            <q-separator class="separator-line" />
          </div>
        </div>
      </q-slide-transition>

      <!-- Quick Login Options -->
      <div class="quick-login-section">
        <div class="quick-login-title">
          <h3>{{ $t('auth.quickLogin.title') }}</h3>
          <p>{{ $t('auth.quickLogin.subtitle') }}</p>
        </div>

        <div class="quick-login-buttons">
          <q-btn
            :label="$t('auth.quickLogin.demo')"
            @click="handleDemoLogin"
            class="app-btn-primary demo-login-btn"
            icon="medical_services"
            unelevated
            no-caps
            :loading="demoLoading"
            size="lg"
          >
            <q-tooltip>{{ $t('auth.quickLogin.demoTooltip') }}</q-tooltip>
          </q-btn>

          <q-btn
            :label="$t('auth.quickLogin.owner')"
            @click="handleOwnerLogin"
            class="app-btn-success owner-login-btn"
            icon="admin_panel_settings"
            unelevated
            no-caps
            :loading="ownerLoading"
            size="lg"
          >
            <q-tooltip>{{ $t('auth.quickLogin.ownerTooltip') }}</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Additional Actions -->
      <div class="form-footer">
        <div class="footer-actions">
          <q-btn
            :label="$t('auth.manualLogin')"
            @click="showManualLogin = !showManualLogin"
            class="app-btn-secondary manual-login-btn"
            :icon="
              showManualLogin ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
            "
            unelevated
            no-caps
          />

          <q-btn
            :label="$t('auth.forgotPassword')"
            @click="handleForgotPassword"
            class="app-btn-refresh forgot-btn"
            unelevated
            no-caps
          />
        </div>

        <!-- Security Notice -->
        <div class="security-notice" role="status" aria-live="polite">
          <q-icon name="shield" size="16px" aria-hidden="true" />
          <span>{{ $t('auth.secureConnection') }}</span>
        </div>
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { useQuasar } from 'quasar';
  import { useAuthStore } from 'src/stores/auth';
  import { useFormValidation } from 'src/composables/useFormValidation';
  import { useErrorHandler } from 'src/utils/error-handler';

  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();
  const { rules, createField, validateForm } = useFormValidation();
  const { handleError } = useErrorHandler();

  // Form fields with validation
  const email = createField('', [rules.required, rules.email]);
  const password = createField('', [rules.required]);

  // UI state
  const showPassword = ref(false);
  const loading = ref(false);
  const demoLoading = ref(false);
  const ownerLoading = ref(false);
  const showManualLogin = ref(false);

  // Methods
  const handleLogin = async () => {
    // Validate form
    if (!validateForm([email, password])) {
      return;
    }

    loading.value = true;

    try {
      const result = await authStore.login(
        email.value.value,
        password.value.value
      );

      if (result.success) {
        $q.notify({
          type: 'positive',
          message: t('auth.loginSuccess'),
          position: 'top-right',
          timeout: 3000,
          icon: 'check_circle',
        });

        // Check for intended route from sessionStorage
        const intendedRoute = sessionStorage.getItem('remcura_intended_route');
        sessionStorage.removeItem('remcura_intended_route');

        // Redirect to intended page or dashboard
        const redirectPath = intendedRoute || '/';
        await router.push(redirectPath);
      } else {
        $q.notify({
          type: 'negative',
          message: result.error || t('auth.loginError'),
          position: 'top-right',
          timeout: 4000,
          icon: 'error',
        });
      }
    } catch (error) {
      handleError(error as Error, t('auth.login'));
    } finally {
      loading.value = false;
    }
  };

  const handleDemoLogin = async () => {
    demoLoading.value = true;

    try {
      const result = await authStore.loginAsDemo();

      if (result.success) {
        $q.notify({
          type: 'positive',
          message: t('auth.demoLoginSuccess'),
          position: 'top-right',
          timeout: 3000,
          icon: 'medical_services',
        });

        // Redirect to dashboard
        await router.push('/');
      } else {
        $q.notify({
          type: 'negative',
          message: result.error || t('auth.loginError'),
          position: 'top-right',
          timeout: 4000,
          icon: 'error',
        });
      }
    } catch (error) {
      handleError(error as Error, t('auth.demoLogin'));
    } finally {
      demoLoading.value = false;
    }
  };

  const handleOwnerLogin = async () => {
    ownerLoading.value = true;

    try {
      const result = await authStore.loginAsOwner();

      if (result.success) {
        $q.notify({
          type: 'positive',
          message: t('auth.ownerLoginSuccess'),
          position: 'top-right',
          timeout: 3000,
          icon: 'admin_panel_settings',
        });

        // Redirect to platform dashboard
        await router.push('/platform');
      } else {
        $q.notify({
          type: 'negative',
          message: result.error || t('auth.loginError'),
          position: 'top-right',
          timeout: 4000,
          icon: 'error',
        });
      }
    } catch (error) {
      handleError(error as Error, t('auth.ownerLogin'));
    } finally {
      ownerLoading.value = false;
    }
  };

  const handleForgotPassword = () => {
    $q.notify({
      type: 'info',
      message: t('auth.passwordResetComingSoon'),
      timeout: 3000,
      position: 'top-right',
      icon: 'info',
    });
  };
</script>

<style lang="scss" scoped>
  .login-form-container {
    width: 100%;
    max-width: 100%;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);

    .form-field {
      position: relative;
    }

    // Field styling is now fully handled by global field system
    // This ensures consistent sizing and prevents field jumping on focus

    // Password toggle button
    .password-toggle {
      color: var(--neutral-500);
      transition: color var(--transition-base);

      &:hover {
        color: var(--brand-primary);
      }
    }

    // Form actions
    .form-actions {
      margin-top: var(--space-2);
      display: flex;
      justify-content: center;

      .login-btn {
        width: 100%;
        max-width: 300px;
        height: 56px;

        :deep(.q-btn__content) {
          gap: var(--space-2);
        }
      }
    }

    // Form separator
    .form-separator {
      display: flex;
      align-items: center;
      margin: var(--space-4) 0;

      .separator-line {
        flex: 1;
        border-color: var(--neutral-300);
      }

      .separator-text {
        padding: 0 var(--space-4);
        font-size: var(--text-sm);
        color: var(--neutral-500);
        font-weight: var(--font-weight-medium);
      }
    }

    // Quick Login Section
    .quick-login-section {
      text-align: center;
      margin: var(--space-6) 0;

      .quick-login-title {
        margin-bottom: var(--space-6);

        h3 {
          margin: 0 0 var(--space-2) 0;
          color: var(--text-primary);
          font-size: var(--text-lg);
          font-weight: var(--font-weight-semibold);
        }

        p {
          margin: 0;
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
      }

      .quick-login-buttons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-4);

        .demo-login-btn,
        .owner-login-btn {
          height: 64px;
          border-radius: var(--radius-lg);
          transition: all 0.2s ease;

          :deep(.q-btn__content) {
            flex-direction: column;
            gap: var(--space-1);

            .q-icon {
              font-size: 1.5rem;
            }
          }

          &:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-lg);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }

    // Manual Login Form
    .manual-login-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      margin-bottom: var(--space-6);
    }

    // Form footer
    .form-footer {
      display: flex;
      flex-direction: column;
      gap: var(--space-6);

      .footer-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-3);

        // Let the global app-btn-* classes handle the styling
        .manual-login-btn,
        .forgot-btn {
          height: 48px;

          :deep(.q-btn__content) {
            gap: var(--space-2);
          }
        }
      }

      .security-notice {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-2);
        font-size: var(--text-xs);
        color: var(--neutral-500);

        .q-icon {
          color: var(--brand-success);
        }
      }
    }
  }

  // Dark mode adjustments (minimal; rely on global field/button system)
  body.body--dark {
    .login-form {
      .password-toggle {
        color: var(--neutral-400);

        &:hover {
          color: var(--brand-primary);
        }
      }

      .separator-line {
        border-color: var(--neutral-600);
      }
      .separator-text {
        color: var(--neutral-400);
      }
      .security-notice {
        color: var(--neutral-400);
      }
    }
  }

  // Responsive design
  @media (max-width: 599px) {
    .login-form {
      gap: var(--space-5);

      .form-actions .login-btn {
        height: 52px;
      }

      .footer-actions {
        grid-template-columns: 1fr;

        .manual-login-btn,
        .forgot-btn {
          height: 44px;
        }
      }

      .quick-login-buttons {
        grid-template-columns: 1fr;
        gap: var(--space-3);

        .demo-login-btn,
        .owner-login-btn {
          height: 56px;
        }
      }
    }
  }

  // All focus styling is handled by global .q-field system

  // Screen reader only content
  // Screen reader only content (now in global app.scss)

  // Focus styles for buttons
  .demo-btn:focus,
  .forgot-btn:focus,
  .login-btn:focus {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
  }

  .password-toggle:focus {
    outline: 2px solid var(--brand-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  // Loading state
  .login-btn:has(.q-spinner) {
    pointer-events: none;

    :deep(.q-btn__content) {
      opacity: 0.7;
    }
  }

  // Animation for form appearance
  .login-form-container {
    animation: loginFormSlideIn 0.4s ease-out;
  }

  @keyframes loginFormSlideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
