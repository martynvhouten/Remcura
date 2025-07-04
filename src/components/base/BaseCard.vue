<template>
  <q-card
    :class="cardClasses"
    v-bind="$attrs"
    :role="role"
    :aria-labelledby="titleId"
  >
    <!-- Card Header -->
    <q-card-section
      v-if="hasHeader"
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
    <q-separator v-if="hasHeader && separator" />

    <!-- Card Content -->
    <q-card-section
      v-if="hasContent"
      class="card-content"
      :class="contentClass"
    >
      <slot />
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
import { computed, useSlots, useAttrs } from "vue";

interface Props {
  // Content props
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconSize?: string;

  // Styling props
  variant?: "default" | "modern" | "elevated" | "glass" | "outlined";
  headerColor?:
    | "primary"
    | "secondary"
    | "positive"
    | "negative"
    | "warning"
    | "info";
  size?: "sm" | "md" | "lg" | "xl";

  // Layout props
  separator?: boolean;
  padding?: "none" | "sm" | "md" | "lg";

  // Custom classes
  cardClass?: string;
  headerClass?: string;
  contentClass?: string;
  actionsClass?: string;

  // Accessibility
  role?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: "default",
  iconSize: "24px",
  size: "md",
  separator: true,
  padding: "md",
  role: "article",
});

const slots = useSlots();
const attrs = useAttrs();

// Generate unique ID for title
const titleId = computed(() => {
  if (attrs.id) return `${attrs.id}-title`;
  if (props.title)
    return `card-title-${props.title.replace(/\s+/g, "-").toLowerCase()}`;
  return `card-title-${Date.now()}`;
});

// Check for slot content
const hasHeader = computed(
  () =>
    !!(
      props.title ||
      props.subtitle ||
      props.icon ||
      slots["header-content"] ||
      slots["header-actions"]
    )
);

const hasContent = computed(() => !!slots.default);

const hasActions = computed(() => !!slots.actions);

const hasHeaderActions = computed(() => !!slots["header-actions"]);

// Card classes
const cardClasses = computed(() => {
  const classes = ["base-card"];

  // Variant styles
  switch (props.variant) {
    case "modern":
      classes.push("card-modern");
      break;
    case "elevated":
      classes.push("card-modern", "card-elevated");
      break;
    case "glass":
      classes.push("glass-card");
      break;
    case "outlined":
      classes.push("card-outlined");
      break;
  }

  // Size classes
  classes.push(`card-${props.size}`);

  // Padding classes
  if (props.padding !== "md") {
    classes.push(`card-padding-${props.padding}`);
  }

  // Custom class
  if (props.cardClass) {
    classes.push(props.cardClass);
  }

  return classes.join(" ");
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
}
</style>
