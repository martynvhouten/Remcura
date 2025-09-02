<template>
  <!-- Mini drawer icon-only navigation item with tooltip and a11y -->
  <q-item
    :to="to"
    clickable
    :active="active"
    active-class="nav-item-active"
    class="nav-icon-item relative group"
    role="menuitem"
    :aria-current="active ? 'page' : undefined"
    :aria-label="ariaLabel || label"
    tabindex="0"
  >
    <!-- Left active accent (optional) -->
    <div
      v-if="active && showActiveAccent"
      class="absolute left-1 inset-y-2 w-1 rounded-full"
      :style="{ background: 'var(--brand-primary)' }"
      aria-hidden="true"
    />

    <q-item-section avatar>
      <div
        class="pill rounded-xl px-2 py-2 transition duration-150 ease-out flex items-center justify-center"
      >
        <q-icon
          :name="icon"
          size="22px"
          :class="[
            'transition-colors duration-150',
            active ? 'text-white' : 'text-white/90',
            // hover color handled in scoped CSS to brand blue
          ]"
        />
      </div>
    </q-item-section>

    <q-tooltip
      v-if="mini"
      anchor="center right"
      self="center left"
      :offset="[8, 0]"
    >
      {{ tooltip || label }}
    </q-tooltip>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  icon: string;
  label: string;
  to?: string | Record<string, unknown> | null;
  active?: boolean;
  mini?: boolean;
  tooltip?: string;
  ariaLabel?: string;
  showActiveAccent?: boolean;
}

const props = defineProps<Props>();

// Defaults
const active = computed(() => props.active === true);
const mini = computed(() => props.mini === true);
const showActiveAccent = computed(() => props.showActiveAccent !== false);
</script>

<style scoped>
.nav-icon-item {
  min-height: 48px;
  justify-content: center;
  align-items: center;
}

/* Mini drawer hover/active/focus visuals using design tokens for dark mode safety */
.nav-icon-item .pill {
  background: transparent;
  transform: translateZ(0);
}
.nav-icon-item:hover .pill,
.nav-icon-item:focus .pill {
  background: rgba(var(--brand-primary-rgb), 0.18);
}
.nav-icon-item:hover .pill {
  transform: scale(1.05);
}
.nav-icon-item.nav-item-active .pill {
  background: rgba(var(--brand-primary-rgb), 0.22);
  box-shadow: inset 0 0 0 1px var(--sidebar-border);
}
.nav-icon-item:hover :deep(.q-icon),
.nav-icon-item:focus :deep(.q-icon) {
  color: var(--brand-primary);
}
.nav-icon-item:focus-visible .pill {
  outline: 2px solid rgba(var(--brand-primary-rgb), 0.4);
  outline-offset: 2px;
}
.nav-icon-item > .absolute {
  background: var(--brand-primary);
}
</style>


