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

// Card design guidelines
export const CARD_DESIGN_TOKENS = {
  // Border radius
  borderRadius: '12px',

  // Shadows
  baseShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
  interactiveShadow:
    '0 2px 4px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
  hoverShadow: '0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 10px rgba(0, 0, 0, 0.08)',

  // Transitions
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

  // Hover transforms
  hoverTransform: 'translateY(-3px)',
  activeTransform: 'translateY(-1px)',

  // Spacing
  padding: {
    sm: '12px 16px',
    md: '16px 20px',
    lg: '20px 24px',
  },

  // Typography
  titleSize: '16px',
  titleWeight: '600',
  subtitleSize: '14px',

  // Icon sizes
  iconSize: '20px',
  iconContainerSize: '32px',

  // Colors
  border: 'rgba(0, 0, 0, 0.08)',
  background: '#ffffff',
} as const;
