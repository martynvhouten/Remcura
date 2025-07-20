<template>
  <div class="page-title-component animate-fade-in">
    <div class="page-title-content">
      <div class="title-section">
        <div class="title-wrapper">
          <q-icon
            v-if="props.icon"
            :name="props.icon"
            :size="props.iconSize"
            :color="props.iconColor"
            class="title-icon"
            aria-hidden="true"
          />
          <div class="title-text">
            <h1
              class="page-title"
              :id="`page-title-${title.replace(/\s+/g, '-').toLowerCase()}`"
            >
              {{ props.title }}
            </h1>
            <p v-if="props.subtitle" class="page-subtitle">
              {{ props.subtitle }}
            </p>
          </div>
          <q-badge
            v-if="props.badge"
            :color="props.badgeColor"
            :label="props.badge"
            class="title-badge"
            :aria-label="`Status: ${props.badge}`"
          />
        </div>

        <div
          v-if="props.meta && props.meta.length > 0"
          class="title-meta"
          role="list"
          aria-label="Page metadata"
        >
          <div
            v-for="(item, index) in props.meta"
            :key="index"
            class="meta-item"
            role="listitem"
          >
            <q-icon :name="item.icon" size="16px" aria-hidden="true" />
            <span>{{ item.text }}</span>
          </div>
        </div>
      </div>

      <div
        v-if="slots.actions"
        class="title-actions"
        role="group"
        aria-label="Page actions"
      >
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  // No additional imports needed for this component

  interface MetaItem {
    icon: string;
    text: string;
  }

  interface Props {
    title: string;
    subtitle?: string;
    icon?: string;
    iconSize?: string;
    iconColor?: string;
    badge?: string;
    badgeColor?: string;
    meta?: MetaItem[];
  }

  const props = withDefaults(defineProps<Props>(), {
    iconSize: '24px',
    iconColor: 'primary',
    badgeColor: 'primary',
  });

  // Define slots using defineSlots instead of useSlots
  const slots = defineSlots<{
    actions?: () => any;
  }>();
</script>

<style lang="scss" scoped>
  .page-title-component {
    margin-bottom: var(--space-8);

    .page-title-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-6);
      flex-wrap: wrap;

      @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
        gap: var(--space-4);
      }
    }

    .title-section {
      flex: 1;
      min-width: 0;
    }

    .title-wrapper {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-2);

      .title-icon {
        flex-shrink: 0;
        align-self: flex-start;
        margin-top: 2px;
        // Font size handled by centralized icon system in app.scss
      }

      .title-text {
        flex: 1;
        min-width: 0;
      }

      .title-badge {
        align-self: flex-start;
        margin-top: var(--space-1);
        flex-shrink: 0;
      }
    }

    .page-title {
      font-size: var(--text-3xl);
      font-weight: var(--font-weight-bold);
      line-height: var(--leading-tight);
      color: var(--neutral-900);
      margin: 0;
      margin-bottom: var(--space-1);
      letter-spacing: -0.025em;

      @media (max-width: 768px) {
        font-size: var(--text-2xl);
      }
    }

    .page-subtitle {
      font-size: var(--text-base);
      font-weight: var(--font-weight-normal);
      line-height: var(--leading-relaxed);
      color: var(--neutral-600);
      margin: 0;
      max-width: 60ch;

      @media (max-width: 768px) {
        font-size: var(--text-sm);
      }
    }

    .title-meta {
      display: flex;
      align-items: center;
      gap: var(--space-6);
      margin-top: var(--space-3);
      flex-wrap: wrap;

      @media (max-width: 640px) {
        gap: var(--space-4);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--text-sm);
        font-weight: var(--font-weight-medium);
        color: var(--neutral-600);

        .q-icon {
          color: var(--brand-primary);
        }
      }
    }

    .title-actions {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      flex-wrap: wrap;
      padding-top: 8px; // Move buttons down slightly

      @media (max-width: 768px) {
        width: 100%;
        justify-content: flex-start;
        padding-top: 12px; // More space on mobile
      }

      @media (max-width: 480px) {
        :deep(.q-btn) {
          flex: 1;
          min-width: 120px;
        }
      }
    }
  }

  // Dark mode styles
  body.body--dark {
    .page-title {
      color: var(--neutral-900);
    }

    .page-subtitle {
      color: var(--neutral-600);
    }

    .meta-item {
      color: var(--neutral-600);
    }
  }

  // Animation
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
</style>
