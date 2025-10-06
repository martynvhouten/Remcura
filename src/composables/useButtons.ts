// Common button configurations and utilities
import type { ButtonConfig } from '@/types/ui';

// Predefined button themes
export const buttonThemes = {
  primary: {
    color: 'primary',
    class: 'btn-modern',
    noCaps: true,
  },
  secondary: {
    color: 'secondary',
    class: 'btn-modern',
    noCaps: true,
  },
  success: {
    color: 'positive',
    class: 'btn-modern',
    noCaps: true,
  },
  warning: {
    color: 'warning',
    class: 'btn-modern',
    noCaps: true,
  },
  danger: {
    color: 'negative',
    class: 'btn-modern',
    noCaps: true,
  },
  info: {
    color: 'info',
    class: 'btn-modern',
    noCaps: true,
  },
  // Action button variants
  primaryAction: {
    color: 'primary',
    class: 'btn-modern btn-action',
    noCaps: true,
    size: 'md' as const,
  },
  secondaryAction: {
    color: 'secondary',
    class: 'btn-modern',
    noCaps: true,
    variant: 'outline' as const,
  },
  // Table action buttons
  tableAction: {
    dense: true,
    flat: true,
    round: true,
    class: 'action-btn btn-hover',
  },
  tableActionDanger: {
    dense: true,
    flat: true,
    round: true,
    class: 'action-btn btn-hover btn-danger',
    color: 'negative',
  },
  // Dialog buttons
  dialogCancel: {
    label: 'Annuleren',
    flat: true,
    color: 'grey',
    noCaps: true,
  },
  dialogConfirm: {
    color: 'primary',
    class: 'btn-modern',
    noCaps: true,
  },
} as const;

export function useButtons() {
  // Helper to merge configs
  const mergeConfigs = (
    base: Partial<ButtonConfig>,
    override: Partial<ButtonConfig>
  ): ButtonConfig => {
    return {
      ...base,
      ...override,
      class: `${base.class || ''} ${override.class || ''}`.trim(),
    };
  };

  // Get a themed button config
  const getThemeConfig = (
    theme: keyof typeof buttonThemes,
    overrides?: Partial<ButtonConfig>
  ): Partial<ButtonConfig> => {
    const baseConfig = buttonThemes[theme] as Partial<ButtonConfig>;
    return overrides ? mergeConfigs(baseConfig, overrides) : baseConfig;
  };

  // Common action button groups
  const getActionGroup = (
    actions: Array<{
      theme: keyof typeof buttonThemes;
      props?: Partial<ButtonConfig>;
    }>
  ) => {
    return actions.map(action => getThemeConfig(action.theme, action.props));
  };

  // Quick action buttons for common use cases
  const quickActions = {
    // CRUD operations
    create: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('primaryAction', {
        icon: 'add',
        label: 'Toevoegen',
        ...overrides,
      }),
    edit: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('tableAction', {
        icon: 'edit',
        color: 'primary',
        ...overrides,
      }),
    delete: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('tableActionDanger', {
        icon: 'delete',
        ...overrides,
      }),
    view: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('tableAction', {
        icon: 'visibility',
        color: 'info',
        ...overrides,
      }),

    // Common actions
    save: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('primary', {
        icon: 'save',
        label: 'Opslaan',
        ...overrides,
      }),
    cancel: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('dialogCancel', overrides),
    confirm: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('dialogConfirm', {
        label: 'Bevestigen',
        ...overrides,
      }),

    // Data operations
    export: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('info', {
        icon: 'download',
        label: 'Exporteren',
        ...overrides,
      }),
    import: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('secondary', {
        icon: 'upload',
        label: 'Importeren',
        ...overrides,
      }),
    refresh: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('secondary', {
        icon: 'refresh',
        label: 'Vernieuwen',
        ...overrides,
      }),

    // Notification actions
    markAllRead: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('primary', {
        icon: 'mark_email_read',
        label: 'Alles als gelezen markeren',
        ...overrides,
      }),
    clearAll: (overrides?: Partial<ButtonConfig>) =>
      getThemeConfig('danger', {
        icon: 'clear_all',
        label: 'Alles wissen',
        ...overrides,
      }),
  };

  // Common button group patterns
  const buttonGroups = {
    // Dialog actions (cancel + confirm)
    dialogActions: (confirmLabel = 'Bevestigen', cancelLabel = 'Annuleren') => [
      getThemeConfig('dialogCancel', { label: cancelLabel }),
      getThemeConfig('dialogConfirm', { label: confirmLabel }),
    ],

    // Table row actions (view, edit, delete)
    tableRowActions: () => [
      quickActions.view(),
      quickActions.edit(),
      quickActions.delete(),
    ],

    // Admin quick actions
    adminActions: () => [
      getThemeConfig('primary', {
        icon: 'person_add',
        label: 'Gebruiker uitnodigen',
      }),
      getThemeConfig('secondary', {
        icon: 'add_location',
        label: 'Locatie toevoegen',
      }),
      getThemeConfig('info', { icon: 'download', label: 'Data downloaden' }),
      getThemeConfig('warning', { icon: 'sync', label: 'Geforceerde sync' }),
      getThemeConfig('success', { icon: 'table_chart', label: 'Exporteren' }),
    ],
  };

  return {
    mergeConfigs,
    getThemeConfig,
    getActionGroup,
    quickActions,
    buttonGroups,
    buttonThemes,
  };
}
