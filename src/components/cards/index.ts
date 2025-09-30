export { default as BaseCard } from './BaseCard.vue';
export { default as BaseDashboardWidget } from './BaseDashboardWidget.vue';
export { default as InteractiveCard } from './InteractiveCard.vue';
export { default as AlertCard } from './AlertCard.vue';

// Type definitions for easy reference
export interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?:
    | 'primary'
    | 'secondary'
    | 'positive'
    | 'negative'
    | 'warning'
    | 'info';
  iconVariant?: 'default' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  cardClass?: string;
  headerClass?: string;
  contentClass?: string;
  actionsClass?: string;
  role?: string;
}

export interface InteractiveCardProps extends CardProps {
  disabled?: boolean;
  loading?: boolean;
  showClickIndicator?: boolean;
}

export interface AlertCardProps extends CardProps {
  severity?: 'info' | 'success' | 'warning' | 'error';
  showStatusIcon?: boolean;
  dismissible?: boolean;
}

export interface BaseDashboardWidgetProps {
  /** Optional widget title displayed in header */
  title?: string;
  /** Show loading overlay when true */
  loading?: boolean;
  /** Hide the header section completely */
  hideHeader?: boolean;
  /** Additional CSS classes for the card */
  cardClass?: string;
}

// Card design guidelines - using CSS custom properties
export const CARD_DESIGN_TOKENS = {
  // Border radius
  borderRadius: 'var(--radius-lg)',

  // Shadows
  baseShadow: 'var(--shadow-sm)',
  interactiveShadow: 'var(--shadow-md)',
  hoverShadow: 'var(--shadow-lg)',

  // Transitions
  transition: 'var(--transition-base)',

  // Hover transforms
  hoverTransform: 'translateY(-3px)',
  activeTransform: 'translateY(-1px)',

  // Spacing
  padding: {
    sm: 'var(--space-3) var(--space-4)',
    md: 'var(--space-4) var(--space-5)',
    lg: 'var(--space-5) var(--space-6)',
  },

  // Typography
  titleSize: 'var(--text-lg)',
  titleWeight: 'var(--font-weight-semibold)',
  subtitleSize: 'var(--text-sm)',

  // Icon sizes
  iconSize: 'var(--icon-base)',
  iconContainerSize: '32px',

  // Colors
  border: 'var(--border-primary)',
  background: 'var(--surface)',
} as const;
