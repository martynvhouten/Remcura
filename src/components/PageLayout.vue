<template>
  <q-page :class="pageClasses">
    <div class="page-layout-container">
      <!-- Page Header Slot -->
      <div v-if="hasHeader" class="page-header-section">
        <slot name="header" />
      </div>

      <!-- Main Content -->
      <div class="page-content-section">
        <slot />
      </div>

      <!-- Page Footer Slot -->
      <div v-if="hasFooter" class="page-footer-section">
        <slot name="footer" />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
  import { computed, useSlots } from 'vue';

  interface Props {
    maxWidth?: string | number;
    padding?: string;
    verticalSpacing?: string;
    fullWidth?: boolean;
    noTopPadding?: boolean;
    noBottomPadding?: boolean;
    noHorizontalPadding?: boolean;
    backgroundColor?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    maxWidth: '1400px',
    padding: 'lg',
    verticalSpacing: 'lg',
    fullWidth: false,
    noTopPadding: false,
    noBottomPadding: false,
    noHorizontalPadding: false,
  });

  const slots = useSlots();

  const hasHeader = computed(() => !!slots.header);
  const hasFooter = computed(() => !!slots.footer);

  const pageClasses = computed(() => {
    const classes = ['page-layout'];

    if (!props.noTopPadding && !props.noBottomPadding) {
      classes.push(`q-py-${props.verticalSpacing}`);
    } else {
      if (!props.noTopPadding) classes.push(`q-pt-${props.verticalSpacing}`);
      if (!props.noBottomPadding) classes.push(`q-pb-${props.verticalSpacing}`);
    }

    // Remove horizontal padding from Quasar classes - we handle it in CSS
    // if (!props.noHorizontalPadding) {
    //   classes.push(`q-px-${props.padding}`)
    // }

    return classes;
  });

  const containerStyles = computed(() => {
    const styles: Record<string, string> = {};

    if (!props.fullWidth) {
      if (typeof props.maxWidth === 'number') {
        styles.maxWidth = `${props.maxWidth}px`;
      } else {
        styles.maxWidth = props.maxWidth;
      }
    }

    if (props.backgroundColor) {
      styles.backgroundColor = props.backgroundColor;
    }

    return styles;
  });
</script>

<style lang="scss" scoped>
  .page-layout {
    min-height: 100%;

    .page-layout-container {
      max-width: v-bind('containerStyles.maxWidth');
      margin: 0 auto;
      width: 100%;
      background-color: v-bind('containerStyles.backgroundColor');
      box-sizing: border-box; // Ensure padding is included in width calculation
      overflow-x: hidden; // Prevent horizontal scroll only on the container

      // Apply consistent horizontal padding
      padding-left: var(--space-6);
      padding-right: var(--space-6);

      @media (max-width: 1280px) {
        padding-left: var(--space-4);
        padding-right: var(--space-4);
      }

      @media (max-width: 640px) {
        padding-left: var(--space-3);
        padding-right: var(--space-3);
      }
    }

    .page-header-section {
      margin-bottom: var(--space-8);

      @media (max-width: 768px) {
        margin-bottom: var(--space-6);
      }
    }

    .page-content-section {
      flex: 1;

      // Ensure proper spacing between content elements
      > * + * {
        margin-top: var(--space-6);

        @media (max-width: 768px) {
          margin-top: var(--space-4);
        }
      }
    }

    .page-footer-section {
      margin-top: var(--space-8);

      @media (max-width: 768px) {
        margin-top: var(--space-6);
      }
    }
  }

  // Ensure proper containment without breaking scroll behavior
  .page-layout {
    * {
      box-sizing: border-box;
    }

    // Ensure content doesn't exceed container width
    .page-content-section {
      width: 100%;
      max-width: 100%;

      // Apply to direct children to prevent overflow
      > * {
        max-width: 100%;
        box-sizing: border-box;
      }
    }
  }
</style>
