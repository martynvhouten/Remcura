<template>
  <div class="error-page-modern" role="main">
    <!-- Background Elements -->
    <div class="error-background" aria-hidden="true">
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
      </div>
      <div class="bg-gradient"></div>
    </div>

    <!-- Main Content -->
    <div class="error-container">
      <div class="error-content animate-fade-in">
        <!-- Medical Icon with Animation -->
        <div class="error-icon-section" aria-hidden="true">
          <div class="medical-cross">
            <q-icon name="local_hospital" size="120px" />
          </div>
          <div class="pulse-rings">
            <div class="pulse-ring pulse-ring-1"></div>
            <div class="pulse-ring pulse-ring-2"></div>
            <div class="pulse-ring pulse-ring-3"></div>
          </div>
        </div>

        <!-- Error Number with Modern Typography -->
        <div class="error-number" aria-hidden="true">
          <span class="number-4">4</span>
          <span class="number-0">0</span>
          <span class="number-4">4</span>
        </div>

        <!-- Error Message -->
        <div class="error-message-section">
          <h1 class="error-title">{{ $t('error.pageNotFound') || 'Pagina niet gevonden' }}</h1>
          <p class="error-description">{{ $t('error.pageNotFoundDescription') || 'De pagina die je zoekt bestaat niet of is verplaatst.' }}</p>
        </div>

        <!-- Action Buttons -->
        <div class="error-actions" role="group" aria-label="Navigation actions">
          <q-btn
            color="primary"
            icon="home"
            :label="$t('error.goHome')"
            @click="goHome"
            class="btn-modern"
            unelevated
            no-caps
            :aria-label="$t('error.goHome') + ' - Navigeer naar het dashboard'"
          />
          <q-btn
            color="primary"
            icon="arrow_back"
            :label="$t('error.goBack') || 'Terug'"
            @click="goBack"
            class="btn-modern"
            outline
            no-caps
            :aria-label="($t('error.goBack') || 'Terug') + ' - Ga naar de vorige pagina'"
          />
        </div>

        <!-- Help Section -->
        <div class="error-help">
          <div class="help-grid" role="navigation" aria-label="Quick navigation">
            <div class="help-item" @click="navigateTo('/')" role="button" tabindex="0" :aria-label="`Navigate to ${$t('nav.dashboard')}`" @keydown.enter="navigateTo('/')" @keydown.space="navigateTo('/')">
              <q-icon name="space_dashboard" size="24px" aria-hidden="true" />
              <span>{{ $t('nav.dashboard') }}</span>
            </div>
            <div class="help-item" @click="navigateTo('/products')" role="button" tabindex="0" :aria-label="`Navigate to ${$t('nav.products')}`" @keydown.enter="navigateTo('/products')" @keydown.space="navigateTo('/products')">
              <q-icon name="medical_services" size="24px" aria-hidden="true" />
              <span>{{ $t('nav.products') }}</span>
            </div>
            <div class="help-item" @click="navigateTo('/orders')" role="button" tabindex="0" :aria-label="`Navigate to ${$t('nav.orders')}`" @keydown.enter="navigateTo('/orders')" @keydown.space="navigateTo('/orders')">
              <q-icon name="assignment" size="24px" aria-hidden="true" />
              <span>{{ $t('nav.orders') }}</span>
            </div>
            <div class="help-item" @click="navigateTo('/settings')" role="button" tabindex="0" :aria-label="`Navigate to ${$t('nav.settings')}`" @keydown.enter="navigateTo('/settings')" @keydown.space="navigateTo('/settings')">
              <q-icon name="tune" size="24px" aria-hidden="true" />
              <span>{{ $t('nav.settings') }}</span>
            </div>
          </div>
          <p class="help-text">{{ $t('error.tryThesePages') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.error-page-modern {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
}

// Background styling
.error-background {
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
    opacity: 0.95;
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
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      animation: float 8s ease-in-out infinite;
      
      &.shape-1 {
        width: 400px;
        height: 400px;
        top: -100px;
        right: -100px;
        animation-delay: 0s;
      }
      
      &.shape-2 {
        width: 300px;
        height: 300px;
        bottom: -50px;
        left: -100px;
        animation-delay: 3s;
      }
      
      &.shape-3 {
        width: 200px;
        height: 200px;
        top: 50%;
        left: 20%;
        animation-delay: 6s;
      }
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  33% {
    transform: translateY(-30px) rotate(120deg) scale(1.05);
  }
  66% {
    transform: translateY(15px) rotate(240deg) scale(0.95);
  }
}

// Main container
.error-container {
  max-width: 800px;
  width: 100%;
  padding: var(--space-8);
  text-align: center;
  position: relative;
  z-index: 1;
}

.error-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  padding: var(--space-12) var(--space-8);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  @media (max-width: 768px) {
    padding: var(--space-8) var(--space-6);
    margin: var(--space-4);
  }
}

// Medical icon with pulse animation
.error-icon-section {
  position: relative;
  margin-bottom: var(--space-8);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.medical-cross {
  position: relative;
  z-index: 2;
  color: var(--brand-primary);
  filter: drop-shadow(0 8px 16px rgba(99, 102, 241, 0.3));
  animation: breathe 3s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.pulse-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.pulse-ring {
  position: absolute;
  width: 180px;
  height: 180px;
  border: 2px solid var(--brand-primary);
  border-radius: 50%;
  opacity: 0;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse 3s ease-out infinite;
}

.pulse-ring-1 { animation-delay: 0s; }
.pulse-ring-2 { animation-delay: 1s; }
.pulse-ring-3 { animation-delay: 2s; }

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

// Error number styling
.error-number {
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: var(--space-6);
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 6rem;
  }
  
  span {
    display: inline-block;
    animation: bounceIn 0.8s ease-out;
    
    &.number-4:first-child { animation-delay: 0.2s; }
    &.number-0 { animation-delay: 0.4s; }
    &.number-4:last-child { animation-delay: 0.6s; }
  }
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3) translateY(-50px);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

// Message section
.error-message-section {
  margin-bottom: var(--space-8);
}

.error-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--neutral-800);
  margin-bottom: var(--space-4);
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: var(--text-xl);
  }
}

.error-description {
  font-size: var(--text-lg);
  color: var(--neutral-600);
  line-height: var(--leading-relaxed);
  max-width: 500px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    font-size: var(--text-base);
  }
}

// Action buttons
.error-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-bottom: var(--space-8);
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: center;
    
    .q-btn {
      width: 100%;
      max-width: 300px;
    }
  }
}

.btn-modern {
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.025em;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.15);
    box-shadow: var(--shadow-lg);
  }
  
  &:focus {
    outline: 2px solid white;
    outline-offset: 2px;
    background: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
  }
  
  &.btn-primary {
    background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-dark));
  }
  
  &.btn-secondary {
    border: 2px solid var(--brand-primary);
    color: var(--brand-primary);
    
    &:hover {
      background: var(--brand-primary);
      color: white;
    }
  }
}

// Help section
.error-help {
  border-top: 1px solid var(--neutral-200);
  padding-top: var(--space-6);
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.help-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  background: rgba(var(--brand-primary), 0.05);
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
  transition: all var(--transition-base);
  cursor: pointer;
  
  &:hover {
    background: rgba(var(--brand-primary), 0.1);
    transform: translateY(-1px);
  }
  
  .q-icon {
    flex-shrink: 0;
  }
}

.help-text {
  font-size: var(--text-sm);
  color: var(--neutral-500);
  margin: 0;
}

// Animation classes
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Dark mode support
body.body--dark {
  .error-content {
    background: rgba(23, 23, 23, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .error-title {
    color: var(--neutral-100);
  }
  
  .error-description {
    color: var(--neutral-300);
  }
  
  .help-item {
    background: rgba(99, 102, 241, 0.1);
    
    &:hover {
      background: rgba(99, 102, 241, 0.2);
    }
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .medical-cross,
  .pulse-ring,
  .error-number span,
  .shape {
    animation: none !important;
  }
  
  .btn-modern:hover {
    transform: none !important;
  }
}
</style> 