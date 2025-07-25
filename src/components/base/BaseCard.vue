<template>
  <q-card
    :class="cardClasses"
    v-bind="$attrs"
    :role="role"
    :aria-labelledby="titleId"
  >
    <!-- Card Header (not shown for stats variant) -->
    <q-card-section
      v-if="hasHeader && variant !== 'stats'"
      class="card-header"
      :class="[headerClass, headerColor ? `header-${headerColor}` : '']"
    >
      <div class="card-header-content">
        <div class="card-title-section">
          <!-- Icon -->
          <q-icon
            v-if="icon"
            :name="icon"
            :color="iconColor || headerColor"
            :size="iconSize"
            aria-hidden="true"
          />

          <!-- Title and Subtitle -->
          <div v-if="title || subtitle" class="card-text-content">
            <h2 v-if="title" class="card-title" :id="titleId">{{ title }}</h2>
            <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </div>

          <!-- Custom header content -->
          <slot name="header-content" />
        </div>

        <!-- Header actions -->
        <div v-if="hasHeaderActions" class="card-header-actions">
          <slot name="header-actions" />
        </div>
      </div>
    </q-card-section>

    <!-- Header separator -->
    <q-separator v-if="hasHeader && separator && variant !== 'stats'" />

    <!-- Card Content -->
    <q-card-section
      v-if="hasContent || variant === 'stats' || variant === 'quick-action'"
      class="card-content"
      :class="contentClass"
    >
      <!-- Quick Action variant specific content -->
      <div v-if="variant === 'quick-action'" class="quick-action-content">
        <div class="quick-action-main">
          <div class="quick-action-icon-container" :class="`gradient-${gradientDirection || 'blue'}`">
            <q-icon 
              :name="actionIcon || icon || 'star'" 
              size="2rem" 
              :color="actionIconColor || 'white'" 
            />
            <q-badge 
              v-if="actionBadge"
              :label="actionBadge"
              :color="gradientDirection || 'primary'"
              floating
              rounded
            />
          </div>
          <div class="quick-action-text">
            <div class="quick-action-title">{{ title }}</div>
            <div class="quick-action-description">{{ actionDescription || subtitle }}</div>
          </div>
        </div>
        <div v-if="actionProgress !== undefined" class="quick-action-progress-container">
          <q-linear-progress 
            :value="actionProgress / 100" 
            :color="`${gradientDirection || 'blue'}-7`"
            size="2px" 
            class="quick-action-progress"
          />
        </div>
      </div>

      <!-- Stats variant specific content -->
      <div v-else-if="variant === 'stats'" class="stats-content">
        <div class="stats-main">
          <div class="stats-value-section">
            <div class="stats-value">{{ value }}</div>
            <div
              v-if="trend !== undefined"
              class="stats-trend"
              :class="trendClasses"
            >
              <q-icon :name="trendIcon" size="16px" class="trend-icon" />
              {{ trend }}
            </div>
          </div>
          <div v-if="icon" class="stats-icon">
            <q-icon :name="icon" :size="iconSize" :color="computedIconColor" />
          </div>
        </div>
        <div class="stats-label">{{ label }}</div>
      </div>

      <!-- Default content slot -->
      <slot v-else />
    </q-card-section>

    <!-- Actions separator -->
    <q-separator v-if="hasActions && separator" />

    <!-- Card Actions -->
    <q-card-section
      v-if="hasActions"
      class="card-actions"
      :class="actionsClass"
    >
      <slot name="actions" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { computed, useSlots, useAttrs } from 'vue';

  interface Props {
    // Content props
    title?: string;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    iconSize?: string;

    // Styling props
    variant?:
      | 'default'
      | 'modern'
      | 'elevated'
      | 'glass'
      | 'glass-modern'
      | 'neumorph'
      | 'gradient'
      | 'outlined'
      | 'quick-action'
      | 'premium'
      | 'stats';
    headerColor?:
      | 'primary'
      | 'secondary'
      | 'positive'
      | 'negative'
      | 'warning'
      | 'info';
    size?: 'sm' | 'md' | 'lg' | 'xl';

    // Stats variant specific props
    value?: string | number;
    label?: string;
    trend?: string | number;
    trendDirection?: 'up' | 'down' | 'neutral';
    trendColor?: 'positive' | 'negative' | 'neutral';

    // Quick action variant props
    actionIcon?: string;
    actionIconColor?: string;
    actionDescription?: string;
    actionProgress?: number;
    actionBadge?: string | number;
    gradientDirection?: 'blue' | 'orange' | 'green' | 'purple' | 'red';

    // Layout props
    separator?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';

    // Custom classes
    cardClass?: string;
    headerClass?: string;
    contentClass?: string;
    actionsClass?: string;

    // Accessibility
    role?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default',
    iconSize: '24px',
    size: 'md',
    separator: true,
    padding: 'md',
    role: 'article',
  });

  const slots = useSlots();
  const attrs = useAttrs();

  // Generate unique ID for title
  const titleId = computed(() => {
    if (attrs.id) return `${attrs.id}-title`;
    if (props.title)
      return `card-title-${props.title.replace(/\s+/g, '-').toLowerCase()}`;
    return `card-title-${Date.now()}`;
  });

  // Check for slot content
  const hasHeader = computed(() => {
    // Stats variant never shows header
    if (props.variant === 'stats') return false;

    return !!(
      props.title ||
      props.subtitle ||
      props.icon ||
      slots['header-content'] ||
      slots['header-actions']
    );
  });

  const hasContent = computed(() => !!slots.default);

  const hasActions = computed(() => !!slots.actions);

  const hasHeaderActions = computed(() => !!slots['header-actions']);

  // Card classes
  const cardClasses = computed(() => {
    const classes = ['base-card'];

    // Variant styles
    switch (props.variant) {
      case 'modern':
        classes.push('card-modern');
        break;
      case 'elevated':
        classes.push('card-modern', 'card-elevated');
        break;
      case 'glass':
        classes.push('glass-card');
        break;
      case 'glass-modern':
        classes.push('glass-card-modern');
        break;
      case 'neumorph':
        classes.push('card-neumorph');
        break;
      case 'gradient':
        classes.push('card-gradient');
        break;
      case 'outlined':
        classes.push('card-outlined');
        break;
      case 'quick-action':
        classes.push('quick-action-card', props.gradientDirection ? `quick-action-${props.gradientDirection}` : 'quick-action-blue');
        break;
      case 'premium':
        classes.push('card-premium');
        break;
      case 'stats':
        classes.push('card-stats');
        break;
    }

    // Size classes
    classes.push(`card-${props.size}`);

    // Padding classes
    if (props.padding !== 'md') {
      classes.push(`card-padding-${props.padding}`);
    }

    // Custom class
    if (props.cardClass) {
      classes.push(props.cardClass);
    }

    return classes.join(' ');
  });

  // Stats variant computed properties
  const trendClasses = computed(() => {
    const classes = ['stats-trend'];
    if (props.trendColor) {
      classes.push(`trend-${props.trendColor}`);
    } else if (props.trendDirection) {
      // Auto-assign colors based on direction if no explicit color
      if (props.trendDirection === 'up') classes.push('trend-positive');
      else if (props.trendDirection === 'down') classes.push('trend-negative');
      else classes.push('trend-neutral');
    }
    return classes;
  });

  const trendIcon = computed(() => {
    if (props.trendDirection === 'up') return 'trending_up';
    if (props.trendDirection === 'down') return 'trending_down';
    return 'trending_flat';
  });

  const computedIconColor = computed(() => {
    return props.iconColor || 'primary';
  });
</script>

<style scoped lang="scss">
  // Base card styles
  .base-card {
    border-radius: var(--radius-xl);
    transition: all var(--transition-base);
    overflow: hidden;
    background: white;
    color: var(--text-primary);
    box-shadow: var(--shadow-sm);

    // Dark mode support
    .body--dark & {
      background: var(--bg-secondary);
    }
  }

  // Card header styles
  .card-header {
    background: white;
    border-bottom: 1px solid var(--border-primary);
    padding: var(--space-5) var(--space-6);

    // Dark mode support
    .body--dark & {
      background: var(--bg-secondary);
    }

    .card-header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .card-title-section {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex: 1;
    }

    .card-text-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .card-title {
      font-size: var(--text-lg);
      font-weight: var(--font-weight-semibold);
      line-height: var(--leading-tight);
      margin: 0;
      color: var(--text-primary);
    }

    .card-subtitle {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0;
      line-height: var(--leading-relaxed);
    }

    .card-header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }
  }

  // Card content styles
  .card-content {
    padding: var(--space-6);
    background: white;
    min-height: 60px;

    // Dark mode support
    .body--dark & {
      background: var(--bg-secondary);
    }
  }

  // Card actions styles
  .card-actions {
    padding: var(--space-4) var(--space-6);
    background: white;
    border-top: 1px solid var(--border-primary);

    // Dark mode support
    .body--dark & {
      background: var(--bg-secondary);
    }

    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    align-items: center;

    @media (max-width: 640px) {
      flex-direction: column-reverse;
      align-items: stretch;
      gap: var(--space-2);

      :deep(.q-btn) {
        width: 100%;
      }
    }
  }

  // Size variants
  .card-sm {
    .card-header {
      padding: var(--space-3) var(--space-4);

      .card-title {
        font-size: var(--text-base);
      }

      .card-subtitle {
        font-size: var(--text-xs);
      }
    }

    .card-content {
      padding: var(--space-4);
    }

    .card-actions {
      padding: var(--space-3) var(--space-4);
    }
  }

  // Stats variant specific styles
  .card-stats {
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
    cursor: default;

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .card-content {
      padding: var(--space-6);
    }

    .stats-content {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .stats-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
    }

    .stats-value-section {
      flex: 1;
    }

    .stats-value {
      font-size: var(--text-3xl);
      font-weight: var(--font-weight-bold);
      line-height: var(--leading-tight);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }

    .stats-trend {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--text-sm);
      font-weight: var(--font-weight-medium);

      .trend-icon {
        font-size: 16px;
      }

      &.trend-positive {
        color: var(--success-main);
      }

      &.trend-negative {
        color: var(--error-main);
      }

      &.trend-neutral {
        color: var(--neutral-500);
      }
    }

    .stats-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 48px;
      height: 48px;
      border-radius: var(--radius-full);
      background: rgba(var(--q-primary-rgb), 0.1);

      .q-icon {
        font-size: 24px;
      }
    }

    .stats-label {
      font-size: var(--text-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
    }

    // Dark mode support
    .body--dark & {
      .stats-icon {
        background: rgba(var(--q-primary-rgb), 0.15);
      }
    }

    // Responsive adjustments
    @media (max-width: 640px) {
      .card-content {
        padding: var(--space-4);
      }

      .stats-value {
        font-size: var(--text-2xl);
      }

      .stats-main {
        gap: var(--space-3);
      }

      .stats-icon {
        min-width: 40px;
        height: 40px;

        .q-icon {
          font-size: 20px;
        }
      }
    }
  }

  .card-lg {
    .card-header {
      padding: var(--space-6) var(--space-8);

      .card-title {
        font-size: var(--text-xl);
      }
    }

    .card-content {
      padding: var(--space-8);
    }

    .card-actions {
      padding: var(--space-5) var(--space-8);
    }
  }

  .card-xl {
    .card-header {
      padding: var(--space-8) var(--space-10);

      .card-title {
        font-size: var(--text-2xl);
      }
    }

    .card-content {
      padding: var(--space-10);
    }

    .card-actions {
      padding: var(--space-6) var(--space-10);
    }
  }

  // Padding variants
  .card-padding-none {
    .card-content {
      padding: 0;
    }
  }

  .card-padding-sm {
    .card-content {
      padding: var(--space-3);
    }

    .card-actions {
      padding: var(--space-2) var(--space-3);
    }
  }

  .card-padding-lg {
    .card-content {
      padding: var(--space-8);
    }

    .card-actions {
      padding: var(--space-5) var(--space-8);
    }
  }

  // Variant styles - these will inherit from global styles defined in app.scss
  .card-outlined {
    border: 2px solid var(--border-primary);
    box-shadow: none;

    &:hover {
      border-color: var(--neutral-300);
      box-shadow: var(--shadow-sm);
    }
  }

  // Header color variants - subtle colored borders and icons
  .card-header {
    &.header-primary {
      border-left: 4px solid var(--brand-primary);

      .q-icon {
        color: var(--brand-primary);
      }
    }

    &.header-secondary {
      border-left: 4px solid var(--brand-secondary);

      .q-icon {
        color: var(--brand-secondary);
      }
    }

    &.header-positive {
      border-left: 4px solid var(--brand-success);

      .q-icon {
        color: var(--brand-success);
      }
    }

    &.header-negative {
      border-left: 4px solid var(--brand-danger);

      .q-icon {
        color: var(--brand-danger);
      }
    }

    &.header-warning {
      border-left: 4px solid var(--brand-warning);

      .q-icon {
        color: var(--brand-warning);
      }
    }

    &.header-info {
      border-left: 4px solid var(--brand-info);

      .q-icon {
        color: var(--brand-info);
      }
    }
  }

  // ================== NEW MODERN CARD VARIANTS ==================

  // Glass Modern - Enhanced glassmorphism
  .glass-card-modern {
    background: linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.25) 0%,
      rgba(255, 255, 255, 0.15) 100%
    ) !important;
    backdrop-filter: blur(20px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 
      0 8px 32px rgba(31, 38, 135, 0.15),
      0 2px 8px rgba(31, 38, 135, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
      z-index: 1;
    }

    &:hover {
      transform: translateY(-6px) scale(1.02) !important;
      box-shadow: 
        0 20px 60px rgba(31, 38, 135, 0.3),
        0 8px 24px rgba(31, 38, 135, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
      border-color: rgba(59, 130, 246, 0.3) !important;
    }

    // Dark mode support
    .body--dark & {
      background: linear-gradient(
        145deg,
        rgba(30, 30, 30, 0.3) 0%,
        rgba(45, 45, 45, 0.2) 100%
      ) !important;
      border-color: rgba(255, 255, 255, 0.1) !important;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.4),
        0 2px 8px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;

      &:hover {
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.5),
          0 8px 24px rgba(0, 0, 0, 0.4),
          inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
        border-color: rgba(59, 130, 246, 0.4) !important;
      }
    }
  }

  // Neumorphism - Soft 3D effect
  .card-neumorph {
    background: #f0f0f3 !important;
    border-radius: var(--radius-2xl);
    box-shadow: 
      15px 15px 30px rgba(174, 174, 192, 0.4),
      -15px -15px 30px rgba(255, 255, 255, 0.9) !important;
    border: none !important;
    transition: all var(--transition-base);
    position: relative;

    &:hover {
      box-shadow: 
        8px 8px 16px rgba(174, 174, 192, 0.5),
        -8px -8px 16px rgba(255, 255, 255, 1) !important;
      transform: translateY(-3px);
    }

    &:active {
      box-shadow: 
        inset 8px 8px 16px rgba(174, 174, 192, 0.3),
        inset -8px -8px 16px rgba(255, 255, 255, 0.8) !important;
      transform: translateY(0);
    }

    // Dark mode support
    .body--dark & {
      background: #2a2d3e !important;
      box-shadow: 
        15px 15px 30px rgba(0, 0, 0, 0.5),
        -15px -15px 30px rgba(255, 255, 255, 0.05) !important;

      &:hover {
        box-shadow: 
          8px 8px 16px rgba(0, 0, 0, 0.6),
          -8px -8px 16px rgba(255, 255, 255, 0.08) !important;
      }
    }
  }

  // Gradient Card - Beautiful gradient borders
  .card-gradient {
    position: relative;
    background: transparent !important;
    border-radius: var(--radius-xl);
    padding: 3px;
    transition: all var(--transition-base);

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      padding: 3px;
      background: linear-gradient(
        135deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #06b6d4 50%,
        #10b981 75%,
        #f59e0b 100%
      ) !important;
      border-radius: inherit;
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: xor;
      -webkit-mask-composite: xor;
      animation: gradientRotate 4s linear infinite;
    }

    .card-content {
      background: white !important;
      border-radius: calc(var(--radius-xl) - 3px);
      margin: -3px;
      position: relative;
      z-index: 1;
    }

    &:hover {
      transform: translateY(-4px) scale(1.02);
      
      &::before {
        background: linear-gradient(
          135deg,
          #3b82f6 0%,
          #8b5cf6 20%,
          #06b6d4 40%,
          #10b981 60%,
          #f59e0b 80%,
          #ef4444 100%
        ) !important;
        animation: gradientRotate 2s linear infinite;
      }
    }

    // Dark mode support
    .body--dark & {
      .card-content {
        background: #1e1e1e !important;
      }
    }
  }

  // Premium Card - Luxury feel
  .card-premium {
    background: linear-gradient(
      145deg,
      #ffffff 0%,
      #f8fafc 50%,
      #f1f5f9 100%
    );
    border: 1px solid rgba(203, 213, 225, 0.6);
    border-radius: var(--radius-xl);
    box-shadow: 
      0 4px 16px rgba(15, 23, 42, 0.08),
      0 8px 32px rgba(15, 23, 42, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(203, 213, 225, 0.3);
    position: relative;
    overflow: hidden;
    transition: all var(--transition-base);

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(
        circle at center,
        rgba(59, 130, 246, 0.05) 0%,
        transparent 70%
      );
      opacity: 0;
      transition: opacity var(--transition-base);
    }

    &:hover {
      transform: translateY(-4px);
      box-shadow: 
        0 8px 32px rgba(15, 23, 42, 0.12),
        0 16px 64px rgba(15, 23, 42, 0.06),
        inset 0 1px 0 rgba(255, 255, 255, 1),
        inset 0 -1px 0 rgba(203, 213, 225, 0.4);
      border-color: rgba(148, 163, 184, 0.4);

      &::before {
        opacity: 1;
      }
    }

    // Dark mode support
    .body--dark & {
      background: linear-gradient(
        145deg,
        #1e293b 0%,
        #334155 50%,
        #475569 100%
      );
      border-color: rgba(100, 116, 139, 0.3);
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.2),
        0 8px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 -1px 0 rgba(100, 116, 139, 0.3);

      &:hover {
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.3),
          0 16px 64px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.15),
          inset 0 -1px 0 rgba(100, 116, 139, 0.4);
      }
    }
  }

  // Quick Action Card (from BatchManagementPage)
  .quick-action-card {
    border-radius: 16px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid rgba(0, 0, 0, 0.08);
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    position: relative;
    overflow: hidden;
    cursor: pointer;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.1);
      border-color: rgba(0, 0, 0, 0.15);

      &::before {
        opacity: 1;
      }

      .quick-action-icon-container {
        transform: scale(1.1);
      }

      .quick-action-progress {
        opacity: 1;
      }
    }

    // Color variants
    &.quick-action-blue::before {
      background: linear-gradient(90deg, #1976d2 0%, #42a5f5 100%);
    }

    &.quick-action-orange::before {
      background: linear-gradient(90deg, #ff9800 0%, #ffb74d 100%);
    }

    &.quick-action-green::before {
      background: linear-gradient(90deg, #4caf50 0%, #66bb6a 100%);
    }

    &.quick-action-purple::before {
      background: linear-gradient(90deg, #9c27b0 0%, #ba68c8 100%);
    }

    &.quick-action-red::before {
      background: linear-gradient(90deg, #f44336 0%, #ef5350 100%);
    }

    // Dark mode support
    .body--dark & {
      background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
      border-color: rgba(255, 255, 255, 0.1);

      &:hover {
        border-color: rgba(255, 255, 255, 0.2);
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.2);
      }
    }

    .quick-action-content {
      padding: var(--space-6);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .quick-action-main {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      flex: 1;
    }

    .quick-action-icon-container {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.3s ease;

      &.gradient-blue {
        background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
      }

      &.gradient-orange {
        background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
      }

      &.gradient-green {
        background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
      }

      &.gradient-purple {
        background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%);
      }

      &.gradient-red {
        background: linear-gradient(135deg, #f44336 0%, #ef5350 100%);
      }
    }

    .quick-action-text {
      flex: 1;
    }

    .quick-action-title {
      font-weight: var(--font-weight-semibold);
      font-size: var(--text-base);
      color: var(--text-primary);
      margin-bottom: var(--space-1);
    }

    .quick-action-description {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      line-height: var(--leading-relaxed);
    }

    .quick-action-progress-container {
      margin-top: var(--space-4);
    }

    .quick-action-progress {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
  }

  // Keyframes for animations
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes gradientRotate {
    0% {
      background: linear-gradient(
        0deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #06b6d4 50%,
        #10b981 75%,
        #f59e0b 100%
      );
    }
    25% {
      background: linear-gradient(
        90deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #06b6d4 50%,
        #10b981 75%,
        #f59e0b 100%
      );
    }
    50% {
      background: linear-gradient(
        180deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #06b6d4 50%,
        #10b981 75%,
        #f59e0b 100%
      );
    }
    75% {
      background: linear-gradient(
        270deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #06b6d4 50%,
        #10b981 75%,
        #f59e0b 100%
      );
    }
    100% {
      background: linear-gradient(
        360deg,
        #3b82f6 0%,
        #8b5cf6 25%,
        #06b6d4 50%,
        #10b981 75%,
        #f59e0b 100%
      );
    }
  }

  // Responsive adjustments
  @media (max-width: 768px) {
    .card-header {
      padding: var(--space-4);

      .card-header-content {
        gap: var(--space-3);
      }

      .card-title-section {
        gap: var(--space-3);

        .card-title {
          font-size: var(--text-base);
        }
      }
    }

    .card-content {
      padding: var(--space-4);
    }

    .card-actions {
      padding: var(--space-3) var(--space-4);
    }

    .quick-action-card {
      .quick-action-content {
        padding: var(--space-4);
      }
      
      .quick-action-icon-container {
        width: 56px;
        height: 56px;
      }
    }
  }
</style>
