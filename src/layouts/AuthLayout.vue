<template>
  <q-layout view="hHh lpR fFf" class="auth-layout-modern">
    <q-page-container>
      <q-page class="auth-page">
        <!-- Background Elements -->
        <div class="auth-background">
          <div class="bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
            <div class="shape shape-3"></div>
          </div>
          <div class="bg-gradient"></div>
        </div>

        <!-- Main Auth Container -->
        <div class="auth-container">
          <!-- Auth Card with Glass Morphism -->
          <div class="auth-card glass-card animate-scale-in">
            <!-- Header Section -->
            <div class="auth-header">
              <div class="brand-section">
                <q-avatar size="64px" class="brand-avatar">
                  <q-icon name="local_hospital" size="32px" color="primary" />
                </q-avatar>
                <div class="brand-text">
                  <h1 class="brand-title">{{ $t('brand.name') }}</h1>
                  <p class="brand-subtitle">{{ subtitleText }}</p>
                </div>
              </div>
            </div>

            <!-- Main Content -->
            <div class="auth-content" role="main">
              <router-view />
            </div>

            <!-- Footer Section -->
            <div class="auth-footer">
              <div class="footer-links">
                <a
                  href="#"
                  class="footer-link"
                  role="button"
                  tabindex="0"
                  :aria-label="$t('auth.privacyPolicy')"
                  >{{ $t('auth.privacyPolicy') }}</a
                >
                <span class="separator" aria-hidden="true">•</span>
                <a
                  href="#"
                  class="footer-link"
                  role="button"
                  tabindex="0"
                  :aria-label="$t('auth.termsOfService')"
                  >{{ $t('auth.termsOfService') }}</a
                >
                <span class="separator" aria-hidden="true">•</span>
                <a
                  href="#"
                  class="footer-link"
                  role="button"
                  tabindex="0"
                  :aria-label="$t('auth.support')"
                  >{{ $t('auth.support') }}</a
                >
              </div>
              <p class="copyright">
                {{
                  $t('auth.copyright', {
                    year: 2025,
                    company: $t('brand.name'),
                  })
                }}
              </p>
            </div>
          </div>

          <!-- Side Information Panel -->
          <div
            class="info-panel animate-slide-up"
            role="complementary"
            aria-labelledby="info-title"
          >
            <div class="info-content">
              <div class="info-icon">
                <q-icon name="medical_services" size="48px" />
              </div>
              <h2 id="info-title" class="info-title">
                {{ $t('auth.professionalInventory') }}
              </h2>
              <p class="info-description">
                {{ $t('auth.platformDescription') }}
              </p>

              <div class="features-list" role="list">
                <div class="feature-item" role="listitem">
                  <q-icon name="check_circle" color="positive" />
                  <span>{{ $t('auth.realtimeTracking') }}</span>
                </div>
                <div class="feature-item" role="listitem">
                  <q-icon name="check_circle" color="positive" />
                  <span>{{ $t('auth.automatedAlerts') }}</span>
                </div>
                <div class="feature-item" role="listitem">
                  <q-icon name="check_circle" color="positive" />
                  <span>{{ $t('auth.complianceReporting') }}</span>
                </div>
                <div class="feature-item" role="listitem">
                  <q-icon name="check_circle" color="positive" />
                  <span>{{ $t('auth.multilocationSupport') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  name: 'AuthLayout',
  setup() {
    const route = useRoute();
    const { t } = useI18n();

    // Dynamic subtitle based on current route
    const subtitleText = computed(() => {
      if (route.path.startsWith('/join')) {
        return t('magicJoin.subtitle');
      }
      return t('auth.pleaseLogin');
    });

    return {
      subtitleText
    };
  }
});
</script>

<style lang="scss" scoped>
  .auth-layout-modern {
    min-height: 100vh;
    position: relative;
    overflow: hidden;
  }

  .auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
    position: relative;
  }

  // Background styling
  .auth-background {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;

    .bg-gradient {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        var(--brand-primary) 0%,
        var(--brand-primary-light) 50%,
        var(--brand-secondary) 100%
      );
      opacity: 0.9;
    }

    .bg-shapes {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      overflow: hidden;

      .shape {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        animation: float 6s ease-in-out infinite;

        &.shape-1 {
          width: 300px;
          height: 300px;
          top: 10%;
          right: -100px;
          animation-delay: 0s;
        }

        &.shape-2 {
          width: 200px;
          height: 200px;
          bottom: 20%;
          left: -50px;
          animation-delay: 2s;
        }

        &.shape-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: 4s;
        }
      }
    }
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    33% {
      transform: translateY(-20px) rotate(120deg);
    }
    66% {
      transform: translateY(10px) rotate(240deg);
    }
  }

  // Dark mode background
  body.body--dark .auth-background {
    .bg-gradient {
      background: linear-gradient(
        135deg,
        var(--neutral-900) 0%,
        var(--neutral-800) 50%,
        var(--neutral-700) 100%
      );
    }
  }

  // Main container
  .auth-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-16);
    max-width: 1200px;
    width: 100%;
    align-items: center;
  }

  // Auth card styling
  .auth-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-2xl);
    padding: var(--space-8);
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-base);
    max-width: 480px;
    width: 100%;

    &:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-xl);
    }
  }

  body.body--dark .auth-card {
    background: rgba(23, 23, 23, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }

  // Header section
  .auth-header {
    text-align: center;
    margin-bottom: var(--space-8);

    .brand-section {
      .brand-avatar {
        background: white;
        box-shadow: var(--shadow-md);
        margin: 0 auto var(--space-6);
      }

      .brand-text {
        .brand-title {
          font-size: var(--text-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--neutral-900);
          margin: 0 0 var(--space-2);
          line-height: var(--leading-tight);
        }

        .brand-subtitle {
          font-size: var(--text-base);
          color: var(--neutral-600);
          margin: 0;
          font-weight: var(--font-weight-normal);
        }
      }
    }
  }

  body.body--dark .auth-header {
    .brand-text .brand-title {
      color: var(--neutral-900);
    }

    .brand-text .brand-subtitle {
      color: var(--neutral-600);
    }
  }

  // Content area
  .auth-content {
    margin-bottom: var(--space-8);
  }

  // Footer section
  .auth-footer {
    text-align: center;
    border-top: 1px solid var(--neutral-200);
    padding-top: var(--space-6);

    .footer-links {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);

      .footer-link {
        color: var(--neutral-600);
        text-decoration: none;
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        transition: color var(--transition-base);

        &:hover {
          color: var(--brand-primary);
        }
      }

      .separator {
        color: var(--neutral-400);
        font-size: var(--text-sm);
      }
    }

    .copyright {
      font-size: var(--text-xs);
      color: var(--neutral-500);
      margin: 0;
      font-weight: var(--font-weight-normal);
    }
  }

  body.body--dark .auth-footer {
    border-top-color: var(--neutral-300);

    .footer-links .footer-link {
      color: var(--neutral-400);

      &:hover {
        color: var(--brand-primary-light);
      }
    }

    .footer-links .separator {
      color: var(--neutral-500);
    }

    .copyright {
      color: var(--neutral-600);
    }
  }

  // Info panel (right side)
  .info-panel {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-2xl);
    padding: var(--space-8);
    color: white;
    text-align: center;

    .info-content {
      .info-icon {
        margin-bottom: var(--space-6);

        .q-icon {
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .info-title {
        font-size: var(--text-2xl);
        font-weight: var(--font-weight-bold);
        margin: 0 0 var(--space-4);
        line-height: var(--leading-tight);
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }

      .info-description {
        font-size: var(--text-base);
        line-height: var(--leading-relaxed);
        margin: 0 0 var(--space-8);
        color: rgba(255, 255, 255, 0.95);
        font-weight: var(--font-weight-normal);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
      }

      .features-list {
        text-align: left;

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          font-size: var(--text-sm);
          font-weight: var(--font-weight-medium);
          color: rgba(255, 255, 255, 0.95);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }

  // Responsive design
  @media (max-width: 1200px) {
    .auth-container {
      grid-template-columns: 1fr;
      gap: var(--space-8);
      max-width: 480px;
    }

    .info-panel {
      order: -1;
      padding: var(--space-6);

      .info-content {
        .info-title {
          font-size: var(--text-xl);
        }

        .info-description {
          font-size: var(--text-sm);
        }
      }
    }
  }

  @media (max-width: 768px) {
    .auth-page {
      padding: var(--space-4);
    }

    .auth-card {
      padding: var(--space-6);
    }

    .info-panel {
      padding: var(--space-4);

      .info-content {
        .info-title {
          font-size: var(--text-lg);
        }

        .features-list .feature-item {
          font-size: var(--text-xs);
        }
      }
    }

    .auth-header .brand-section {
      .brand-avatar {
        width: 56px;
        height: 56px;

        .q-icon {
          font-size: 28px;
        }
      }

      .brand-text .brand-title {
        font-size: var(--text-2xl);
      }
    }
  }

  @media (max-width: 480px) {
    .auth-page {
      padding: var(--space-2);
    }

    .auth-card {
      padding: var(--space-4);
    }

    .auth-header {
      margin-bottom: var(--space-6);
    }

    .auth-footer {
      .footer-links {
        flex-direction: column;
        gap: var(--space-2);

        .separator {
          display: none;
        }
      }
    }
  }

  // Animation timing adjustments for reduced motion
  @media (prefers-reduced-motion: reduce) {
    .bg-shapes .shape {
      animation: none;
    }

    .auth-card {
      animation: none;
    }

    .info-panel {
      animation: none;
    }
  }
</style>
