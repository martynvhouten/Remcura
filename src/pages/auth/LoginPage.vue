<template>
  <div class="login-form-container">
    <q-form @submit.prevent="handleLogin" class="login-form" novalidate>
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
                showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')
              "
            />
          </template>
        </q-input>
        <div v-if="password.error.value" id="password-error" class="sr-only">
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

      <!-- Additional Actions -->
      <div class="form-footer">
        <div class="footer-actions">
          <q-btn
            :label="$t('auth.demoAccount')"
            @click="fillDemoCredentials"
            class="app-btn-secondary demo-btn"
            icon="person"
            unelevated
            no-caps
            :aria-describedby="'demo-help'"
          />

          <q-btn
            :label="$t('auth.forgotPassword')"
            @click="handleForgotPassword"
            class="app-btn-refresh forgot-btn"
            unelevated
            no-caps
          />
        </div>

        <div id="demo-help" class="sr-only">
          {{
            $t('auth.demoHelp')
          }}
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

  const fillDemoCredentials = () => {
    email.value.value = 'demo@remcura.com';
    password.value.value = 'demo123';

    $q.notify({
      type: 'info',
      message: t('auth.demoCredentialsFilled'),
      timeout: 3000,
      position: 'top-right',
      icon: 'info',
    });
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
        .demo-btn,
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

    // Dark mode adjustments
  body.body--dark {
    .login-form {
      .input-modern {
        :deep(.q-field__control) {
          background: var(--bg-secondary);
          border-color: var(--border-primary);
        }
        
        :deep(.q-field__native) {
          color: var(--text-primary);
        }

        // Border styling handled by global field system

        :deep(.q-field__label) {
          // Color handled by global dark mode styles to prevent conflicts
        }

        :deep(.q-field__prepend) {
          color: var(--neutral-400);
        }
      }

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

      // Dark mode styles handled by global button classes

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

        .demo-btn,
        .forgot-btn {
          height: 44px;
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
