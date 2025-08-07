// UI components and theme types
export interface ButtonConfig {
  label: string;
  icon?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'contained' | 'outlined' | 'text';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
}

export interface CardProps {
  title?: string;
  subtitle?: string;
  avatar?: string;
  image?: string;
  actions?: ButtonConfig[];
  elevation?: number;
  flat?: boolean;
  bordered?: boolean;
  dark?: boolean;
  dense?: boolean;
  loading?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

export interface InteractiveCardProps extends CardProps {
  hoverEffect?: boolean;
  selected?: boolean;
  selectable?: boolean;
}

export interface AlertCardProps extends CardProps {
  type: 'info' | 'warning' | 'error' | 'success';
  dismissible?: boolean;
  timeout?: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  dark: string;
  positive: string;
  negative: string;
  info: string;
  warning: string;
  // Additional custom colors
  surface: string;
  background: string;
  onSurface: string;
  onBackground: string;
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  dark: boolean;
}
