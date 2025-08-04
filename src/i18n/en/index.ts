import filters from './filters';

export default {
  // Filters
  filters,

  // Brand
  brand: {
    name: 'Remcura',
    tagline: 'Professional Medical Inventory',
  },

  // Clinic
  clinic: {
    defaultName: 'Demo Clinic',
    settings: 'Clinic Settings',
    information: 'Clinic Information',
  },

  // Common/Global
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    moreActions: 'More actions',
    allLocations: 'All locations',
    allStatuses: 'All statuses',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    refresh: 'Refresh',
    loading: 'Loading...',
    noData: 'No data available',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    all: 'All',
    none: 'None',
    select: 'Select',
    update: 'Update',
    dismiss: 'Dismiss',
    closeDialog: 'Close dialog',
    actions: 'Actions',
    open: 'Open',
    unknownProduct: 'Unknown Product',
    unknownLocation: 'Unknown Location',
    unknownSupplier: 'Unknown Supplier',
    noSku: 'No SKU',
    uncategorized: 'Uncategorized',
    defaultUnit: 'pcs',
    create: 'Create',
    reset: 'Reset',
    export: 'Export',
    import: 'Import',
    download: 'Download',
    upload: 'Upload',
    view: 'View',
    print: 'Print',
    copy: 'Copy',
    share: 'Share',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    enabled: 'Enabled',
    disabled: 'Disabled',
    name: 'Name',
    description: 'Description',
    date: 'Date',
    time: 'Time',
    today: 'Today',
    yesterday: 'Yesterday',
    comingSoon: 'Coming soon',
    dataRefreshed: 'Data refreshed successfully',
    clearFilters: 'Clear filters',
    submit: 'Submit',
    fromDate: 'From date',
    toDate: 'To date',
    
    // Accessibility labels
    accessibility: {
      mainNavigation: 'Main navigation',
      pageMetadata: 'Page metadata',
      pageActions: 'Page actions',
      navigationActions: 'Navigation actions',
      quickNavigation: 'Quick navigation',
      userMenu: 'User menu',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      toggleTheme: 'Toggle theme',
      searchButton: 'Search',
      notificationPanel: 'Notification panel',
    },
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    orders: 'Orders',
    invoices: 'Invoices',
    settings: 'Settings',
    logout: 'Logout',
    profile: 'Profile',
    helpSupport: 'Help & support',
    navigation: 'Navigation',
    quickStats: 'Quick stats',
    upgradePlan: 'Upgrade plan',
    getAdvancedFeatures: 'Get advanced features',
    inventory: 'Inventory',
    analytics: 'Analytics',
    suppliers: 'Suppliers',
    admin: 'Admin',
    products: 'Products',
    overviewAnalytics: 'Overview & analytics',
    stockManagement: 'Stock levels and inventory tracking',
    inventoryManagement: 'Inventory management',
    productManagement: 'Product overview and ordering',
    purchaseOrders: 'Purchase orders',
    reportsInsights: 'Reports & insights',
    vendorManagement: 'Vendor management',
    systemAdmin: 'System administration',
    openNavigation: 'Open navigation',
    notifications: 'Notifications',
    alertsNotifications: 'Alerts & notifications',
    darkMode: 'Dark mode',
    lightMode: 'Light mode',
    userMenu: 'User menu',
    shoppingCart: 'Shopping cart',
    styleGuide: 'Style guide',
    designSystem: 'Design system reference',
    
    sections: {
      main: 'Overview',
      inventory: 'Inventory Management',
      supplyChain: 'Supply Chain',
      analytics: 'Analytics & Reports',
      administration: 'Administration',
    },
    
    inventoryLevels: 'Inventory levels',
    currentStock: 'Current stock overview',
    locations: 'Locations',
    warehouseManagement: 'Warehouse & location management',
    stockCounting: 'Stock counting',
    physicalCounts: 'Physical counts & audits',
    movements: 'Stock movements',
    stockMovements: 'Stock ins and outs',
  },

  // Authentication
  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    hidePassword: 'Hide password',
    showPassword: 'Show password',
    loginError: 'Login failed. Please check your credentials.',
    sessionExpired: 'Your session has expired. Please log in again.',
    loginSuccess: 'Login successful',
    logoutSuccess: 'Logout successful',
    pleaseLogin: 'Please log in to continue',
    demoAccount: 'Demo account',
    or: 'or',
    secureConnection: 'Secure connection',
    privacyPolicy: 'Privacy policy',
    termsOfService: 'Terms of service',
    support: 'Support',
    allRightsReserved: 'All rights reserved',
    professionalInventory: 'Professional medical inventory management',
    platformDescription: 'Streamline your medical inventory management with our enterprise-grade platform. Track stock, manage orders, and ensure compliance with ease.',
    realtimeTracking: 'Real-time inventory tracking',
    automatedAlerts: 'Automated reorder alerts',
    complianceReporting: 'Compliance reporting',
    multilocationSupport: 'Multi-location support',
    demoCredentialsFilled: 'Demo credentials filled. Click Login to continue.',
    passwordResetComingSoon: 'Password reset functionality coming soon.',
    copyright: '© {year} {company}. All rights reserved.',
    passwordHelp: 'Enter your password to securely log in',
    demoHelp: 'Use demo@remcura.com with password demo123 for demonstration',
    signingIn: 'Signing in...',
    fullName: 'Full name',
  },

  // Demo Account
  demo: {
    title: 'Demo account',
    subtitle: 'You are logged in with the demo account',
    resetData: 'Reset demo data',
    resetDataConfirm: 'Are you sure you want to reset all demo data?',
    resetDataSuccess: 'Demo data reset successfully',
    resetDataError: 'Error resetting demo data',
    limitations: 'Demo limitations',
    limitationsText: 'This is a demo account. All changes are visible but can be reset.',
    practice: 'Remka demo clinic',
    practiceDescription: 'Fully functional demo environment with realistic data',
    resetInfo: 'This will delete all demo data and create fresh data',
    onlyDemoUserCanReset: 'Only demo user can reset demo data',
    changesCanBeReset: 'All changes are saved but can be reset via the Admin page.',
    resetInProgress: 'Resetting demo data...',
    reloadingAfterReset: 'Reloading page with fresh data...',
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
    user: 'User',
    clinicInfo: 'Clinic information',
    stockSummary: 'Stock summary',
    lowStockItems: 'Low stock items',
    outOfStockItems: 'Out of stock',
    reorderSuggestions: 'Reorder suggestions',
    outOfStock: 'Out of stock',
    lowStock: 'Low stock',
    inStock: 'In stock',
    noLowStock: 'All stock levels good!',
    viewMore: 'View {count} more',
    quickActions: 'Quick actions',
    manageStock: 'Manage stock',
    updateStockLevels: 'Update stock levels and settings',
    viewOrders: 'View orders',
    manageOrders: 'Manage orders and order history',
    configureSystem: 'Configure system settings',
    dataRefreshed: 'Data refreshed successfully',
    recentActivity: 'Recent activity',
    itemsRequiringAttention: 'Items requiring attention',
    commonTasks: 'Common tasks',
    exportToCsv: 'Export to CSV',
    currentMin: 'Current / min',
    latestUpdates: 'Latest updates',
    viewAnalytics: 'View analytics',
    welcomeTitle: 'Welcome to Remcura',
    welcomeSubtitle: 'Your professional medical inventory management system',
    welcomeDescription: 'Manage your inventory efficiently with our advanced tools and real-time tracking.',
    systemStatus: 'System status',
    systemStatusSubtitle: 'Current status of your system',
    systemOnline: 'System online',
    dataSynced: 'Data synchronized',
    secureConnection: 'Secure connection',
    vsLastMonth: 'vs last month',
    summaryOverview: 'Summary overview',
    moreOptions: 'More options',
    quickActionsList: 'Quick actions list',
    optionsMenu: 'Options menu',
    lowStockItemsList: 'Low stock items list',
    dashboardSummary: 'Dashboard summary',
    failedToLoadData: 'Failed to load dashboard data',
    dataRefreshedSuccessfully: 'Data refreshed successfully',
    failedToRefreshData: 'Failed to refresh data',
    widgetTypeNotSupported: 'Widget type not supported',

    // Empty state
    empty: {
      title: 'Configure dashboard',
      subtitle: 'Add widgets to personalize your dashboard',
      addWidgets: 'Add widgets',
    },

    // Customize dialog
    customize: {
      title: 'Customize dashboard',
      comingSoon: 'Personalization options coming soon',
    },

    // Role titles
    titles: {
      assistant: 'Assistant dashboard',
      manager: 'Manager dashboard', 
      owner: 'Owner dashboard',
      default: 'Dashboard',
    },

    // Actions
    actions: {
      refresh: 'Refresh dashboard',
      customize: 'Customize dashboard',
      refreshed: 'Dashboard refreshed',
    },

    // Role switching
    roleSwitch: {
      success: 'Role changed successfully',
      caption: 'Dashboard has been adapted to your new role',
    },

    // Error messages
    errors: {
      loadFailed: 'Failed to load dashboard',
      tryRefresh: 'Try refreshing the page',
      switchFailed: 'Failed to switch role',
      tryAgain: 'Please try again',
    },

    // Roles
    roles: {
      assistant: '🩺 Assistant - Inventory & orders',
      manager: '📊 Manager - Analytics & overviews',
      owner: '👑 Owner - Full control',
    },

    // Service layer translations
    service: {
      subtitles: {
        assistant: 'Manage orders and inventory updates',
        manager: 'Overviews and analytics for better decision making',
        owner: 'Full control and administration of your practice',
      },
      widgets: {
        stockAlerts: 'Stock alerts',
        orderSuggestions: 'Order suggestions',
        recentOrders: 'Recent orders',
        quickScan: 'Quick scan',
        quickScanDescription: 'Scan a product barcode for quick inventory updates',
        analyticsOverview: 'Analytics overview',
        businessOverview: 'Business overview',
        financialSummary: 'Financial overview',
        monthlyRevenue: 'Revenue this month',
        inventoryCosts: 'Inventory costs',
        netProfit: 'Net profit',
        userManagement: 'User management',
        systemHealth: 'System health',
        systemStatus: 'System status',
        ownerLastActive: 'Owner - Last active: {time}',
        managerOnlineNow: 'Manager - Online now',
        assistantLastActive: 'Assistant - Last active: {time}',
      },
      quickActions: {
        scanProduct: 'Scan product',
        createOrder: 'New order',
        updateStock: 'Update stock',
        viewLowStock: 'Low stock',
        viewAnalytics: 'View analytics',
        manageSuppliers: 'Manage suppliers',
        approveOrders: 'Approve orders',
        exportReports: 'Export reports',
        manageUsers: 'Manage users',
        systemSettings: 'System settings',
        financialReports: 'Financial reports',
        backupData: 'Data backup',
      },
      alerts: {
        viewStock: 'View stock',
        viewReport: 'View report',
        updateNow: 'Update now',
        lowStockMessage: '{count} products have low stock',
        monthlyReportAvailable: 'Monthly analysis report available',
        systemUpdateAvailable: 'System update available',
      },
    },
  },

  // Errors
  errors: {
    generic: 'An error occurred. Please try again.',
    network: 'Network error. Please check your internet connection.',
    unauthorized: 'You are not authorized for this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Validation error. Please check the entered data.',
    serverError: 'Server error. Please try again later.',
    failedToGenerateSuggestion: 'Failed to generate suggestion',
    failedToRefreshData: 'Failed to refresh data',
    failed: 'Action failed',
    failedToLoadData: 'Failed to load data',
    failedToGenerateReport: 'Failed to generate report',
    failedToRegisterBatch: 'Failed to register batch',
  },

  // Error pages
  error: {
    pageNotFound: 'Page not found',
    pageNotFoundDescription: "Sorry, the page you're looking for can't be found. It may have been moved, deleted, or you entered a wrong URL.",
    goHome: 'Go home',
    goBack: 'Go back',
    tryThesePages: 'Try visiting one of these popular pages instead:',
  },

  // Validation
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    numeric: 'Only numbers allowed',
    positive: 'Value must be positive',
    positiveNumber: 'Value must be a positive number',
    integer: 'Only whole numbers allowed',
    mustBePositive: 'Value must be positive',
    textMustMatch: 'Text must match {text}',
    formErrors: 'Form contains errors',
  },

  // Product (for form fields and references)
  product: {
    product: 'Product',
    selectProduct: 'Select product',
    samples: {
      syringeBD: 'BD Plastipak Syringe',
      needleBD: 'BD Microlance Needle',
    },
  },

  // Location (for form fields and references)
  location: {
    location: 'Location',
    selectLocation: 'Select location',
    sampleData: {
      mainWarehouse: {
        name: 'Main Warehouse',
        type: 'Warehouse',
        description: 'Central storage warehouse',
      },
      pharmacy: {
        name: 'Pharmacy Storage',
        type: 'Pharmacy',
        description: 'Medication storage',
      },
      treatmentRoom: {
        name: 'Treatment Room A',
        type: 'Treatment Room',
        description: 'Stock for treatment room A',
      },
    },
    samples: {
      emergencyStock: 'Emergency Cabinet',
    },
  },

  // Inventory & Stock Management
  inventory: {
    title: 'Inventory',
    stockLevels: 'Stock levels',
    stockMovements: 'Stock movements',
    locations: 'Locations',
    suppliers: 'Suppliers',
    orders: 'Orders',
    stockCounting: 'Stock counting',
    overview: 'Inventory overview',
    totalProducts: 'Total products',
    products: 'Products',
    stockLocations: 'Stock locations',
    activeLocations: 'Active locations',
    dataLoaded: 'Data loaded',
    upToDate: 'Up to date',
    status: 'Status',
    lastUpdated: 'Last updated',
    refreshData: 'Refresh data',
    time: 'Time',
    searchProducts: 'Search products',
    stockStatus: 'Stock status',
    category: 'Category',
    items: 'Items',
    totalValue: 'Total value',
    lowStockItems: 'Low stock items',
    outOfStockItems: 'Out of stock items',
    stockAccuracy: 'Stock accuracy',
    lastFullCount: 'Last full count',
    allLocations: 'All locations',
    currentLocation: 'Current location',
    switchLocation: 'Switch location',
    startCounting: 'Start counting',
    startCountingSession: 'Start counting session',
    quickAdjustment: 'Quick adjustment',
    adjustStock: 'Adjust stock',
    transferStock: 'Transfer stock',
    viewMovements: 'View movements',
    exportData: 'Export data',
    scanBarcode: 'Scan Barcode',
    barcodeFound: 'Product found: {product}',
    barcodeNotFound: 'No product found for barcode: {barcode}',
    searchProduct: 'Search product',
    noProductsFound: 'No products found',
    barcodeScanned: 'Barcode scanned: {barcode}',
    changeProduct: 'Change product',
    inStock: 'In stock',
    lowStock: 'Low stock',
    outOfStock: 'Out of stock',
    overStock: 'Overstock',
    recentActivity: 'Recent activity',
    recentMovements: 'Recent movements',
    noRecentActivity: 'No recent activity',
    stockAlerts: 'Stock alerts',
    criticalAlerts: 'Critical alerts',
    urgentAttention: 'Requires urgent attention',
    noAlerts: 'No alerts',
    countingStatus: 'Counting status',
    activeSession: 'Active session',
    noActiveSession: 'No active counting',
    syncStatus: 'Sync status',
    lastSync: 'Last sync',
    syncNow: 'Sync now',
    loadingData: 'Loading inventory data...',
    refreshingData: 'Refreshing data...',
    manualOrder: 'Manual order',
    apiOrder: 'API order',
    downloadPdf: 'Download PDF',
    placeOrder: 'Place order',
    setMinimum: 'Set minimum',
    setMaximum: 'Set maximum',
    reorderPoint: 'Reorder point',
    pieces: 'pieces',
    units: 'units',
    quantity: 'Quantity',
    today: 'today',
    yesterday: 'yesterday',
    thisWeek: 'this week',
    thisMonth: 'this month',
    neverCounted: 'never counted',
    sessionName: 'Session name',
    sessionNamePlaceholder: 'Enter a name for the counting session',
    sessionType: 'Session type',
    selectLocations: 'Select locations',
    allowNegativeCounts: 'Allow negative counts',
    requireApproval: 'Require approval',
    autoAdjustStock: 'Auto adjust stock',
    sessionNotesPlaceholder: 'Optional notes for this counting session',
    partialCount: 'Partial count',
    fullCount: 'Full count',
    spotCheck: 'Spot check',
    cycleCount: 'Cycle count',
    partialCountDescription: 'Count only selected products',
    fullCountDescription: 'Count all products in selected locations',
    spotCheckDescription: 'Quick check of specific items',
    cycleCountDescription: 'Systematic counting according to schedule',
    defaultSessionName: 'Count {date} {time}',
    sessionCreated: 'Counting session created',
    sessionCreationFailed: 'Failed to create counting session',
    selectLocation: 'Select location',
    searchProductPlaceholder: 'Type to search...',
    quantityMustNotBeZero: 'Quantity must not be zero',
    quantityChangeHint: 'Use + to add, - to remove',
    adjustmentNotesPlaceholder: 'Reason for adjustment...',
    stockAdjusted: 'Stock adjusted',
    adjustmentFailed: 'Stock adjustment failed',
    fromLocation: 'From location',
    toLocation: 'To location',
    locationsMustBeDifferent: 'Locations must be different',
    enterQuantity: 'Enter quantity',
    transferNotesPlaceholder: 'Notes for transfer...',
    stockTransferred: 'Stock transferred',
    transferFailed: 'Stock transfer failed',
    movementHistory: 'Movement history',
    movementType: 'Movement type',
    movementDetails: 'Movement details',
    quantityChange: 'Quantity change',
    quantityBefore: 'Quantity before',
    quantityAfter: 'Quantity after',
    reasonCode: 'Reason code',
    loadingMovements: 'Loading movements...',
    noMovementsFound: 'No movements found',
    stockFilter: 'Stock filter',
    currentStock: 'Current stock',
    thresholds: 'Thresholds',
    min: 'Min',
    max: 'Max',
    value: 'Value',
    lastMovement: 'Last movement',
    noMovements: 'No movements',
    viewHistory: 'View history',
    overStockItems: 'Overstocked items',
    batchTrackingWarning: 'This product requires batch tracking',
    cannotAdjustBatchTrackedProduct: 'Cannot manually adjust batch-tracked product',
    redirectingToBatchManagement: 'Redirecting to batch management',
    
    // Quick Adjustment Dialog
    adjustmentType: 'Adjustment type',
    increase: 'Increase',
    decrease: 'Decrease',
    setTo: 'Set to',
    quantityToAdd: 'Quantity to add',
    quantityToRemove: 'Quantity to remove',
    newQuantity: 'New quantity',
    preview: 'Preview',
    change: 'Change',
    reason: 'Reason',
    notes: 'Notes',
    notesPlaceholder: 'Optional notes for this adjustment...',
    stockUpdated: 'Stock updated',
    errorUpdatingStock: 'Error updating stock',
    dataRefreshed: 'Data refreshed',

    movement: {
      receipt: 'Receipt',
      usage: 'Usage',
      transfer: 'Transfer',
      adjustment: 'Adjustment',
      count: 'Count',
      waste: 'Waste',
    },

    reasons: {
      normal_usage: 'Normal usage',
      expired: 'Expired',
      damaged: 'Damaged',
      lost: 'Lost',
      found: 'Found',
      transfer_in: 'Transfer in',
      transfer_out: 'Transfer out',
      adjustment: 'Adjustment',
      count_correction: 'Count correction',
    },

    // Stock Transfer Dialog
    stockTransfer: 'Stock Transfer',
    quantityToTransfer: 'Quantity to transfer',
    transferReason: 'Transfer reason',
    executeTransfer: 'Execute transfer',
    transferPreview: 'Transfer preview',
    remaining: 'remaining',
    newTotal: 'new total',
    selectBatch: 'Select batch',
    expiryDate: 'Expiry date',
    available: 'available',
    expiresSoon: 'Expires soon',
    expiresThisMonth: 'Expires this month',
    fresh: 'Fresh',
    maxAvailable: 'Max available',
    
    // Transfer reasons
    locationRebalance: 'Location rebalancing',
    stockReplenishment: 'Stock replenishment',
    emergencyTransfer: 'Emergency transfer',
    expiryManagement: 'Expiry management',
    maintenanceRelocation: 'Maintenance relocation',

  },

  // Counting System
  counting: {
    title: 'Stock counting',
    overview: 'Manage your inventory counting sessions and track stock accuracy',
    sessionStatus: 'Session status',
    startSession: 'Start counting session',
    activeSession: 'Active counting session',
    progress: 'Progress',
    sessionType: 'Session type',
    discrepancies: 'Discrepancies',
    continueSession: 'Continue session',
    completeSession: 'Complete session',
    sessionsOverview: 'Counting sessions overview',
    loadingSessions: 'Loading counting sessions...',
    noSessionsFound: 'No counting sessions found',
    sessionName: 'Session name',
    status: 'Status',
    sessionSummary: 'Session summary',
    totalProducts: 'Total products',
    countedProducts: 'Counted products',
    loadingSession: 'Loading counting session...',
    sessionNotFound: 'Session not found',
    sessionNotFoundDescription: 'The counting session you are looking for could not be found',
    countingResults: 'Counting results',
    viewResults: 'View counting results and discrepancies',
    noResultsFound: 'No counting results found',
    product: 'Product',
    variance: 'Variance',
    approveSession: 'Approve session',
  },

  // Batch Management
  batch: {
    batchManagement: 'Batch management',
    manageBatchesSubtitle: 'Manage your product batches and expiry dates effectively',
    title: 'Batch management',
    batchNumber: 'Batch number',
    lotNumber: 'Lot number',
    supplierBatchNumber: 'Supplier batch number',
    supplierBatch: 'Supplier batch',
    expiryDate: 'Expiry date',
    houdbaarheidstot: 'Best before',
    receivedDate: 'Received date',
    initialQuantity: 'Initial quantity',
    currentQuantity: 'Current quantity',
    availableQuantity: 'Available quantity',
    available: 'Available',
    reservedQuantity: 'Reserved quantity',
    batchStatus: 'Batch status',
    unitCost: 'Unit cost',
    totalCost: 'Total cost',
    qualityCheck: 'Quality check',
    qualityPassed: 'Quality passed',
    qualityApproved: 'Quality approved',
    qualityFailed: 'Quality failed',
    qualityNotes: 'Quality notes',
    quarantineUntil: 'Quarantine until',
    addBatch: 'Add batch',
    totalBatches: 'Total batches',
    expiringSoon: 'Expiring soon',
    activeBatches: 'Active batches',
    totalValue: 'Total value',
    quickActions: 'Quick actions',
    scanBatch: 'Scan batch',
    viewExpiring: 'View expiring',
    exportBatches: 'Export batches',
    criticalAlert: 'Critical alert',
    nearExpiry: 'Near expiry',
    criticalExpiryText: 'There are {count} batches expiring within 7 days',
    criticalBatchesFound: 'There are {count} critical batches found',
    viewCritical: 'View critical',
    manageExpiring: 'Manage expiring',
    fifoManagement: 'FIFO management',
    fifoSubtitle: 'First In, First Out inventory rotation',
    useBatch: 'Use batch',
    registerBatch: 'Register batch',
    batchOverview: 'Batch overview',
    overview: 'Overview',
    expiring: 'Expiring',
    batchReports: 'Batch reports',
    reports: 'Reports',
    expiringBatches: 'Expiring batches',
    batchHistory: 'Batch history',
    exportSuccess: 'Batches exported successfully',
    batchNotFound: 'Batch {batchNumber} not found',
    quarantine: 'Quarantine',
    quarantineSuccess: 'Batch quarantined successfully',
    expiredDaysAgo: 'Expired {days} days ago',
    expiresToday: 'Expires today',
    expiresTomorrow: 'Expires tomorrow',
    expiresInDays: 'Expires in {days} days',
    fifoSuggestion: 'FIFO suggestion',
    generateFifoSuggestion: 'Generate FIFO suggestion',
    fifoResults: 'FIFO results',
    noFifoResults: 'No FIFO results available',
    fifoSuggestionGenerated: 'FIFO suggestion generated successfully',
    applyFifoSuggestion: 'Apply FIFO suggestion',
    confirmFifoApplication: 'Confirm FIFO application',
    confirmFifoMessage: 'Are you sure you want to apply this FIFO suggestion?',
    fifoAppliedSuccessfully: 'FIFO suggestion applied successfully',
    useQuantity: 'Use quantity',
    selectReport: 'Select report',
    generateReport: 'Generate report',
    exportReport: 'Export report',
    reportResults: 'Report results',
    reportConfiguration: 'Report configuration',
    reportGenerated: 'Report generated successfully',
    reportExported: 'Report exported successfully',
    expiredBatches: 'Expired batches',
    expiryAnalysis: 'Expiry analysis',
    expiryAnalysisDesc: 'Analyze expiry dates and urgency of batches',
    batchUsage: 'Batch usage',
    batchUsageDesc: 'View how batches are used',
    fifoCompliance: 'FIFO compliance',
    fifoComplianceDesc: 'Check FIFO compliance',
    batchCosts: 'Batch costs',
    batchCostsDesc: 'Analyze costs per batch',
    batchDetails: 'Batch Details',
    batchInformation: 'Batch Information',
    quantityStatus: 'Quantity Status',
    expiryInformation: 'Expiry Information',
    statusInformation: 'Status Information',
    costInformation: 'Cost Information',
    currentValue: 'Current Value',
    quantityToUse: 'Quantity to Use',
    usageReason: 'Usage Reason',
    usageNotes: 'Usage Notes',
    usageNotesHint: 'Optional notes for this usage',
    useAll: 'Use All',
    usageSummary: 'Usage Summary',
    quantityUsed: 'Quantity Used',
    remainingQuantity: 'Remaining Quantity',
    costImpact: 'Cost Impact',
    newStatus: 'New Status',
    confirmUsage: 'Confirm Usage',
    purchaseInformation: 'Purchase Information',
    purchaseOrderNumber: 'Purchase order number',
    invoiceNumber: 'Invoice number',
    currency: 'Currency',
    registerNewBatch: 'Register new batch',
    batchRegisteredSuccessfully: 'Batch registered successfully',
    urgencyLevel: 'Urgency level',
    expiryAlert: 'Expiry alert',
    batchesExpiringSoon: '{count} batches expiring soon',
    noBatchesFound: 'No batches found',
    noExpiringBatches: 'No expiring batches',
    daysUntilExpiry: 'Days until expiry',
    filterByStatus: 'Filter by status',
    filterByExpiry: 'Filter by expiry',
    showExpiring: 'Show expiring batches',
    showExpired: 'Show expired batches',
    showActive: 'Show active batches',
    requestedQuantity: 'Requested Quantity',

    validation: {
      expiryDateInPast: 'Expiry date cannot be in the past',
      exceededAvailable: 'Exceeds available quantity',
      mustBePositive: 'Must be a positive value',
    },

    urgency: {
      expired: 'Expired',
      critical: 'Critical',
      warning: 'Warning',
      normal: 'Normal',
    },

    status: {
      available: 'Available',
      reserved: 'Reserved',
      expired: 'Expired',
      quarantine: 'Quarantine',
      used: 'Used',
      active: 'Active',
      inactive: 'Inactive',
    },

    usage: {
      consumption: 'Consumption',
      expired: 'Expired',
      damaged: 'Damaged',
      transfer: 'Transfer',
      adjustment: 'Adjustment',
      other: 'Other',
    },
  },

  // Products
  products: {
    title: 'Products',
    product: 'Product',
    sku: 'SKU',
    name: 'Product name',
    category: 'Category',
    subcategory: 'Subcategory',
    brand: 'Brand',
    description: 'Description',
    unit: 'Unit',
    price: 'Price',
    minimumStock: 'Minimum Stock',
    maximumStock: 'Maximum Stock',
    reorderPoint: 'Reorder Point',
    preferredSupplier: 'Preferred Supplier',
    active: 'Active',
    inactive: 'Inactive',
    discontinued: 'Discontinued',
  },

  // Products Page
  productsPage: {
    title: 'Products',
    subtitle: 'Overview of all available products from Remka and external suppliers',

    table: {
      name: 'Name',
      sku: 'SKU',
      description: 'Description',
      stockStatus: 'Stock Status',
      supplier: 'Supplier',
      price: 'Price',
      actions: 'Actions',
      category: 'Category',
      currentStock: 'Current Stock',
      lastUpdated: 'Last Updated',
      batchStatus: 'Batch Status',
      gs1Status: 'GS1 Status',
    },

    searchPlaceholder: 'Search by name, SKU or GTIN...',
    viewCart: 'View Cart',
    filterByCategory: 'Filter by category',
    filterBySupplier: 'Filter by supplier',
    filterByStockStatus: 'Filter by stock status',
    sortBy: 'Sort by',
    clearFilters: 'Clear filters',
    
    // GTIN Search
    gtinDetected: 'GTIN detected',
    gtinSearchTooltip: 'Searching by GTIN barcode',
    gtinFound: 'GTIN found: {product}',
    gtinSearching: 'Searching for GTIN: {gtin}',
    gtinNotFound: 'GTIN not found: {gtin}',
    viewProduct: 'View product',

    // GS1 Badges
    badges: {
      gtin: 'GTIN',
      orderable: 'Orderable',
      despatchable: 'Despatchable',
      noGS1: 'No GS1',
    },

    filters: {
      title: 'Filters',
      category: 'Category',
      stockStatus: 'Stock Status',
      supplier: 'Supplier',
      priceRange: 'Price Range',
      selectCategory: 'Select category',
      selectStockStatus: 'Select stock status',
      selectSupplier: 'Select supplier',
      minPrice: 'Min price',
      maxPrice: 'Max price',
      all: 'All',
      allCategories: 'All categories',
      allSuppliers: 'All suppliers',
      remka: 'Remka',
      external: 'External suppliers',
      // GS1 Filters
      gs1Filters: 'GS1 Filters',
      gtinPlaceholder: 'Search by GTIN...',
      selectCountry: 'Select country of origin',
      selectGpc: 'Select GPC category',
      selectLifecycle: 'Select lifecycle status',
      orderableOnly: 'Orderable products only',
      scanGtin: 'Scan GTIN barcode',
    },

    stats: {
      totalProducts: 'Total Products',
      inStockProducts: 'In Stock',
      lowStockProducts: 'Low Stock',
      outOfStockProducts: 'Out of Stock',
      suppliersCount: 'Suppliers',
      categoriesCount: 'Categories',
    },

    stockStatus: {
      in_stock: 'In Stock',
      low_stock: 'Low Stock',
      out_of_stock: 'Out of Stock',
      unavailable: 'Unavailable',
    },

    batchStatus: {
      good: 'Good',
      expiring: 'Expiring Soon',
      expired: 'Expired',
    },

    lifecycleStatus: {
      active: 'Active',
      discontinued: 'Discontinued',
      new: 'New',
      phase_out: 'Phase Out',
    },

    productDetails: 'Product Details',
    description: 'Description',
    category: 'Category',
    unit: 'Unit',
    suppliers: 'Suppliers',
    stockLevels: 'Stock levels',
    batches: 'batches',
    noBatches: 'No batches',
    bestPrice: 'Best price',

    viewDetails: 'View Details',
    addToCart: 'Add to Cart',
    addToOrderList: 'Add to Order List',
    expandDetails: 'Expand Details',

    addedToCart: '{productName} added to cart',
    cartAddError: 'Error adding product to cart',
    dataRefreshed: 'Data refreshed successfully',
    productLoadError: 'Error loading products',
    noProductsForFilter: 'No products found for current filters',
    loadingProducts: 'Loading products...',
    unknownGpc: 'Unknown GPC category',

    details: {
      title: 'Product Details',
      basicInfo: 'Basic Information',
      stockInfo: 'Stock Information',
      supplierInfo: 'Supplier Information',
      orderHistory: 'Order History',
      sku: 'SKU',
      name: 'Name',
      description: 'Description',
      category: 'Category',
      brand: 'Brand',
      unit: 'Unit',
      price: 'Price',
      currentStock: 'Current Stock',
      minimumStock: 'Minimum Stock',
      locations: 'Stock Locations',
      suppliers: 'Suppliers',
      lastOrderDate: 'Last Order Date',
      averageOrderQuantity: 'Average Order Quantity',
      totalOrdered: 'Total Ordered',
      image: 'Product Image',
      noImage: 'No image available',
      noDescription: 'No description available',
      priceNotAvailable: 'Price not available',
      
      // GS1 Fields
      gs1Info: 'GS1 Information',
      gtin: 'GTIN',
      gpcBrickCode: 'GPC Brick Code',
      countryOfOrigin: 'Country of Origin',
      lifecycleStatus: 'Lifecycle Status',
      netContent: 'Net Content',
      weight: 'Weight',
      netWeight: 'Net Weight',
      grossWeight: 'Gross Weight',
      validityPeriod: 'Validity Period',
      from: 'From',
      to: 'To',
      unitIndicators: 'Unit Indicators',
      baseUnit: 'Base Unit',
      orderable: 'Orderable',
      despatchable: 'Despatchable',
    },
  },

  // Orders
  orders: {
    title: 'Orders',
    export: 'Export',
    createOrder: 'Create Order',
    bulkExport: 'Export Selected',
    bulkEmail: 'Email Selected',
    downloadPDF: 'Download PDF',
    downloadCSV: 'Download CSV',
    sendEmail: 'Send Email',
    submitToMagento: 'Submit to Magento',
    duplicate: 'Duplicate',
    cancel: 'Cancel Order',

    status: {
      draft: 'Draft',
      submitted: 'Submitted',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },

    filters: {
      title: 'Filters',
      status: 'Status',
      supplier: 'Supplier',
      dateFrom: 'Date From',
      dateTo: 'Date To',
      allSuppliers: 'All Suppliers',
    },

    columns: {
      orderNumber: 'Order Number',
      orderDate: 'Order Date',
      status: 'Status',
      supplier: 'Supplier',
      totalItems: 'Items',
      totalAmount: 'Total',
    },

    exportFormat: {
      csv: 'CSV Format',
      pdf: 'PDF Format',
    },

    exportScope: {
      all: 'All Orders',
      filtered: 'Filtered Orders',
      selected: 'Selected Orders',
    },

    email: {
      recipient: 'Recipient email',
      subject: 'Subject',
      message: 'Message',
      send: 'Send Email',
    },

    analytics: {
      totalOrders: 'Total Orders',
      totalValue: 'Total Value',
      avgOrderSize: 'Average Order Size',
      orderFrequency: 'Orders/Day',
      orderTrends: 'Order Trends',
      chartsComingSoon: 'Charts and detailed analytics coming soon!',
    },

    notifications: {
      pdfDownloaded: 'PDF downloaded successfully',
      csvDownloaded: 'CSV downloaded successfully',
      emailSent: 'Email sent successfully',
      magentoSubmitted: 'Order submitted to Magento: {orderNumber}',
      orderCancelled: 'Order cancelled successfully',
      exportCompleted: 'Export completed: {count} orders',
      pdfBulkNotSupported: 'PDF bulk export not yet supported',
      bulkEmailComingSoon: 'Bulk email feature coming soon',
    },

    errors: {
      loadFailed: 'Failed to load orders',
      pdfFailed: 'Failed to generate PDF',
      csvFailed: 'Failed to generate CSV',
      emailFailed: 'Failed to send email',
      magentoFailed: 'Failed to submit to Magento',
      cancelFailed: 'Failed to cancel order',
      exportFailed: 'Failed to export orders',
      noOrdersToExport: 'No orders to export',
      noPracticeSelected: 'Please select a practice first to view orders',
    },

    exportFilteredNote: 'Export {count} filtered orders',
    exportSelectedNote: 'Export {count} selected orders',
    emailRequired: 'Email is required',
    noPracticeSelected: 'No practice selected',
  },

  // Order Lists
  orderLists: {
    title: 'Order Lists',
    subtitle: 'Manage your practice order lists',
    create: 'New order list',
    edit: 'Edit order list',
    duplicate: 'Duplicate',
    delete: 'Delete',
    noLists: 'No order lists found',
    createNew: 'Create a new order list to get started',

    name: 'Name',
    description: 'Description',
    supplier: 'Supplier',
    totalItems: 'Total items',
    totalAmount: 'Total amount',
    status: 'Status',
    createdAt: 'Created at',
    updatedAt: 'Updated at',

    draft: 'Draft',
    ready: 'Ready',
    submitted: 'Submitted',
    confirmed: 'Confirmed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',

    addToCart: 'Add to cart',
    processOrder: 'Process order',
    autoFill: 'Auto fill',
    autoFillDescription: 'Auto fill based on stock levels',

    createDialog: 'Create new order list',
    editDialog: 'Edit order list',
    details: 'Details',
    summary: 'Summary',
    deleteDialog: 'Delete order list',
    deleteConfirm: 'Are you sure you want to delete this order list?',
    duplicateDialog: 'Duplicate order list',
    duplicateName: 'Copy of {name}',

    nameRequired: 'Name is required',
    nameMinLength: 'Name must be at least 3 characters',
    selectSupplier: 'Select supplier',
    supplierRequired: 'Supplier is required',

    addProduct: 'Add product',
    removeProduct: 'Remove product',
    productName: 'Product name',
    quantity: 'Quantity',
    unitPrice: 'Unit price',
    totalPrice: 'Total price',
    notes: 'Notes',
    urgent: 'Urgent',
    exportOrderList: 'Export order list',
    noProducts: 'No products added',
    selectProduct: 'Select product',

    created: 'Order list created successfully',
    updated: 'Order list updated successfully',
    deleted: 'Order list deleted successfully',
    duplicated: 'Order list duplicated successfully',
    addedToCart: 'Products added to cart',
    autoFilled: 'Order list auto-filled',

    loadError: 'Error loading order lists',
    saveError: 'Error saving order list',
    deleteError: 'Error deleting order list',
    cartError: 'Error adding to cart',
    autoFillError: 'Error auto-filling order list',
  },

  // Locations
  locations: {
    title: 'Locations',
    manage: 'Manage storage locations and warehouse areas',
    add: 'Add location',
    edit: 'Edit location',
    delete: 'Delete location',
    name: 'Location name',
    description: 'Description',
    type: 'Location type',
    capacity: 'Capacity',
    sampleData: {
      mainWarehouse: {
        name: 'Main Warehouse',
        type: 'Warehouse',
        description: 'Central storage warehouse',
      },
      pharmacy: {
        name: 'Pharmacy Storage',
        type: 'Pharmacy',
        description: 'Medication storage',
      },
      treatmentRoom: {
        name: 'Treatment Room A',
        type: 'Treatment Room',
        description: 'Stock for treatment room A',
      },
    },
    noLocations: 'No locations found',
    mainLocations: 'Main locations',
    allLocations: 'All locations',
    search: 'Search locations...',
    comingSoonDescription: 'Location management features coming soon. You will be able to create and manage different storage areas for your inventory.',
    capacityItems: '{count} items',
    samples: {
      emergencyStock: 'Emergency Cabinet',
    },
  },

  // Stock Movements
  movements: {
    title: 'Stock movements',
    movementType: 'Movement type',
    quantityChange: 'Quantity change',
    quantityBefore: 'Quantity before',
    quantityAfter: 'Quantity after',
    performedBy: 'Performed by',
    reasonCode: 'Reason code',

    count: 'Count adjustment',
    receipt: 'Stock receipt',
    usage: 'Stock usage',
    transfer: 'Stock transfer',
    adjustment: 'Manual adjustment',
    waste: 'Waste/disposal',

    normalUsage: 'Normal usage',
    expired: 'Expired',
    damaged: 'Damaged',
    lost: 'Lost',
    found: 'Found',
    transferred: 'Transferred',
    corrected: 'Corrected',
  },

  // Analytics
  analytics: {
    title: 'Analytics',
    subtitle: 'Comprehensive reports and insights for your inventory',
    comingSoon: 'Coming soon',
    comingSoonDescription: 'Advanced analytics and reporting features will be added soon.',
    overview: 'Overview',
    trends: 'Trends',
    reports: 'Reports',
    insights: 'Insights',
    period: 'Period',
    lastWeek: 'Last week',
    lastMonth: 'Last month',
    lastQuarter: 'Last quarter',
    lastYear: 'Last year',
    stockTurnover: 'Stock turnover',
    orderFrequency: 'Order frequency',
    supplierPerformance: 'Supplier performance',
    costAnalysis: 'Cost analysis',
    
    dashboard: 'Dashboard analytics',
    usage: 'Usage statistics',
    patterns: 'Usage patterns',
    
    events: {
      login: 'Login',
      logout: 'Logout',
      stock_update: 'Stock update',
      order_create: 'Order created',
      product_view: 'Product viewed',
      batch_register: 'Batch registered',
    },

    metrics: {
      averageSession: 'Average session time',
      peakHours: 'Peak hours',
    },
  },

  // Offline Services
  offline: {
    title: 'Offline mode',
    
    data: {
      download: 'Download offline data',
      downloadDescription: 'Download latest data for offline use',
      lastDownload: 'Last downloaded',
      dataSize: 'Data size',
    },

    sync: {
      forceSync: 'Force sync',
      syncNow: 'Sync now',
      autoSync: 'Auto sync',
      syncStatus: 'Sync status',
      lastSync: 'Last sync',
      pendingActions: 'Pending actions',
    },

    messages: {
      syncCompleted: 'Sync completed',
      syncFailed: 'Sync failed',
      downloadCompleted: 'Download completed',
      downloadFailed: 'Download failed',
      offlineMode: 'Offline mode active',
      onlineMode: 'Online mode active',
    },

    errors: {
      syncFailed: 'Sync failed',
      downloadFailed: 'Failed to download offline data',
      networkUnavailable: 'Network unavailable',
    },
    
    newVersionAvailable: 'A new version of the app is available. Would you like to reload now?',
  },

  // Exports
  exports: {
    title: 'Exports',
    subtitle: 'Data export and reporting',
    selectFormat: 'Select format',
    selectData: 'Select data',
    generateExport: 'Generate export',
    downloadExport: 'Download export',
    
    formats: {
      csv: 'CSV file',
      pdf: 'PDF document',
      excel: 'Excel spreadsheet',
      json: 'JSON data',
    },

    dataTypes: {
      inventory: 'Inventory data',
      orders: 'Orders',
      suppliers: 'Suppliers',
      analytics: 'Analytics',
      users: 'Users',
    },

    messages: {
      exportGenerated: 'Export generated successfully',
      exportFailed: 'Failed to generate export',
      exportDownloaded: 'Export downloaded',
    },
  },

  // Analytics Page
  analyticsPage: {
    title: 'Analytics',
    subtitle: 'Comprehensive reports and insights for your inventory',
    period: 'Period',
    totalEvents: 'Total events',
    activeUsers: 'Active users',
    totalOrders: 'Total orders',
    productUpdates: 'Product updates',
    dailyActivity: 'Daily activity',
    topEvents: 'Top events',
    frequentlyOrderedItems: 'Frequently ordered items',
    mostUpdatedProducts: 'Most updated products',
    userActivity: 'User activity',
    export: 'Export',
    
    periods: {
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 90 days',
      '1y': 'Last year',
    },

    user: 'User',
    activityCount: 'Activity count',
    lastActivity: 'Last activity',
    product: 'Product',
    totalQuantity: 'Total quantity',
    orderCount: 'Order count',
    updates: 'Updates',

    loadError: 'Error loading analytics data',
    exportSuccess: 'Analytics exported successfully',
    exportError: 'Error exporting analytics',
  },

  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Configure your system and preferences',
    general: 'General',
    notifications: 'Notifications',
    integrations: 'Integrations',
    users: 'Users',
    backup: 'Backup',
    language: 'Language',
    theme: 'Theme',
    timezone: 'Timezone',
    currency: 'Currency',
    dateFormat: 'Date format',
    timeFormat: 'Time format',
    emailNotifications: 'Email notifications',
    pushNotifications: 'Push notifications',
    stockAlerts: 'Stock alerts',
    orderAlerts: 'Order alerts',
    systemAlerts: 'System alerts',
    save: 'Save',
    saved: 'Settings saved',
    saveError: 'Error saving settings',
    reset: 'Reset',
    resetToDefaults: 'Reset to defaults',
    confirmReset: 'Are you sure you want to reset to defaults?',
    
    manageSettingsSubtitle: 'Manage your system settings and preferences for optimal experience',
    profile: 'Profile',
    profileSubtitle: 'Your personal user information',
    appearanceTitle: 'Appearance',
    appearanceSubtitle: 'Customize the look and feel of the application',
    darkModeDescription: 'Switch between light and dark mode for better visibility',
    selectLanguage: 'Choose your preferred language for the interface',
    colorSchemeTitle: 'Color scheme',
    colorSchemeDescription: 'Select the color scheme that suits your preference',
    clinic: 'Clinic',
    clinicInfoSubtitle: 'Contact details and business information',
    contactSettingsNotice: 'Contact details can only be modified by an administrator',
    notificationSettingsSubtitle: 'Manage your alerts and notifications',
    stockAlertsLabel: 'Stock alerts',
    stockAlertsDescription: 'Receive notifications when stock is low',
    emailNotificationsLabel: 'Email notifications',
    emailNotificationsDescription: 'Receive important updates via email',
    browserNotificationsLabel: 'Browser notifications',
    browserNotificationsDescription: 'Push notifications in your browser',
    systemInfoTitle: 'System information',
    systemInfoSubtitle: 'Version information and support',
    versionLabel: 'Version',
    lastUpdateLabel: 'Last update',
    supportLabel: 'Support',
    languageChanged: 'Language changed to {language}',
    clinicName: 'Clinic name',
    contactEmail: 'Contact email',
    phoneNumber: 'Phone number',
    address: 'Address',
    role: 'Role',
    darkModeEnabled: 'Dark mode is enabled',
    lightModeEnabled: 'Light mode is enabled',
    settingsSaved: 'Settings saved successfully',
    settingsSaveError: 'An error occurred while saving',
    saveSettings: 'Save settings',

    styleGuideTitle: 'Remcura Style Guide',
    styleGuideSubtitle: 'Complete design system reference and component showcase',
    colorsSection: 'Colors',
    primaryColors: 'Primary colors',
    neutralColors: 'Neutral colors',
    typographySection: 'Typography',
    buttonsSection: 'Buttons',
    solidButtons: 'Solid buttons',
    outlinedButtons: 'Outlined buttons',
    flatButtons: 'Flat buttons',
    iconButtons: 'Icon buttons',
    cardsSection: 'Cards',

    primaryButton: 'Primary',
    secondaryButton: 'Secondary',
    successButton: 'Success',
    warningButton: 'Warning',
    dangerButton: 'Danger',
    infoButton: 'Info',
    addProductButton: 'Add product',
    editButton: 'Edit',
    deleteButton: 'Delete',
    saveButton: 'Save',
    downloadButton: 'Download',

    cards: {
      defaultCard: {
        title: 'Default card',
        subtitle: 'Standard card for general content',
        description: 'This is the default card variant with standard styling. It uses neutral backgrounds that adapt well to light and dark modes.',
        action: 'Action',
      },
      modernCard: {
        title: 'Modern card',
        subtitle: 'Enhanced modern styling with borders',
        description: 'Modern card variant with enhanced styling and subtle borders for a contemporary look.',
        action: 'Primary action',
      },
      elevatedCard: {
        title: 'Elevated card',
        subtitle: 'Card with enhanced shadow for emphasis',
        description: 'This card has elevated styling with enhanced shadows to create depth and hierarchy.',
        action: 'Elevated action',
      },
      glassCard: {
        title: 'Glass card',
        subtitle: 'Glassmorphism effect with transparency',
        description: 'Glassmorphism card with backdrop blur and transparency effects for a modern, sleek appearance.',
        action: 'Glass action',
      },
      outlinedCard: {
        title: 'Outlined card',
        subtitle: 'Card with border emphasis',
        description: 'This card uses borders instead of shadows for definition, perfect for minimal designs.',
        action: 'Outlined action',
      },
      warningCard: {
        title: 'Warning card',
        subtitle: 'Card with warning color theme',
        description: 'Example of using header colors to create thematic cards for different types of content.',
        action: 'Warning action',
      },
    },
  },

  // Suppliers
  suppliers: {
    title: 'Suppliers',
    name: 'Name',
    contactEmail: 'Contact email',
    contactPhone: 'Contact phone',
    website: 'Website',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal code',
    country: 'Country',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    notes: 'Notes',
    products: 'Products',
    orders: 'Orders',
    lastOrder: 'Last order',
    totalOrders: 'Total orders',
    averageDeliveryTime: 'Average delivery time',
    reliability: 'Reliability',
    qualityRating: 'Quality rating',
    priceCompetitiveness: 'Price competitiveness',
    communicationRating: 'Communication rating',
    paymentTerms: 'Payment terms',
    deliveryTerms: 'Delivery terms',
    minimumOrderAmount: 'Minimum order amount',
    leadTime: 'Lead time',
    packSize: 'Pack size',
    availability: 'Availability',
    backorderAllowed: 'Backorder allowed',
    addSupplier: 'Add supplier',
    editSupplier: 'Edit supplier',
    supplierDetails: 'Supplier Details',
    supplierCode: 'Supplier Code',
    contactPerson: 'Contact Person',
    paymentTermsDetailed: 'Payment Terms',
    minimumOrder: 'Minimum Order Value',
    shippingCost: 'Shipping Cost',
    freeShippingThreshold: 'Free shipping threshold',
    preferredOrderDay: 'Preferred order day',
    orderCutoffTime: 'Order cutoff time',
    apiIntegration: 'API Integration',
    syncEnabled: 'Sync Enabled',
    lastSyncTime: 'Last Sync',
    supplierProducts: 'Supplier Products',
    supplierSKU: 'Supplier SKU',
    supplierName: 'Supplier Name',
    unitPrice: 'Unit Price',
    minimumOrderQty: 'Minimum Order Quantity',
    leadTimeDays: 'Lead Time (days)',
  },

  // Admin
  admin: {
    title: 'Admin',
    settings: 'Settings',
    audit: 'Audit log',
    users: 'Users',
    locations: 'Locations',
    permissions: 'Permissions',
    analytics: 'Analytics',
    quickActions: 'Quick actions',
    
    stats: {
      totalUsers: 'Total users',
      activeUsers: 'Active users',
      activeToday: 'active today',
      totalLocations: 'Total locations',
      active: 'active',
      pendingSync: 'Pending sync',
      lastSync: 'Last sync',
      todayEvents: 'Events today',
      fromYesterday: 'from yesterday',
    },

    userManagement: {
      title: 'User management',
      invite: 'Invite user',
      email: 'Email address',
      roles: 'Roles',
      lastActive: 'Last active',
      resetPassword: 'Reset password',
      activate: 'Activate',
      deactivate: 'Deactivate',
    },

    errors: {
      loadUsersFailed: 'Error loading users',
      loadLocationsFailed: 'Error loading locations',
      loadPermissionsFailed: 'Error loading permissions',
      
      // Common admin errors
      noPracticeSelected: 'No practice selected',
      practiceOrUserNotFound: 'Practice or user not found',
      userNotFoundInPractice: 'User not found in practice',
      userEmailNotFound: 'User email not found',
      cannotDeactivatePracticeOwner: 'Cannot deactivate practice owner',
      cannotDeleteMainLocation: 'Cannot delete the main location',
      
      // Permission errors
      insufficientPermissionsToCreate: 'Insufficient permissions to create',
      insufficientPermissionsToUpdate: 'Insufficient permissions to update',
      insufficientPermissionsToDelete: 'Insufficient permissions to delete',
      insufficientPermissionsToView: 'Insufficient permissions to view',
      insufficientPermissionsToGrant: 'Insufficient permissions to grant permissions',
      insufficientPermissionsToRevoke: 'Insufficient permissions to revoke permissions',
      insufficientPermissionsToReset: 'Insufficient permissions to reset',
      insufficientPermissionsToToggle: 'Insufficient permissions to toggle',
      
      // Operation errors
      failedToCreate: 'Failed to create',
      failedToUpdate: 'Failed to update',
      failedToDelete: 'Failed to delete',
      failedToGet: 'Failed to get',
      failedToGrant: 'Failed to grant',
      failedToRevoke: 'Failed to revoke',
      failedToSend: 'Failed to send',
      failedToSet: 'Failed to set',
    },
    
    // Team Management
    teamOverview: 'Team Overview',
    teamOverviewSubtitle: 'Manage team members and their access methods',
    totalMembers: 'Total members',
    onlineNow: 'Online now',
    loadingTeam: 'Loading team...',
    noTeamMembers: 'No team members',
    noTeamMembersDescription: 'No team members have been invited yet',
    viewProfile: 'View profile',
    editMember: 'Edit member',
    loginMethods: 'Login methods',
    magicCode: 'Magic Code',
    emailPassword: 'Email + Password',
    deviceRemember: 'Device Remember',
    trustedDevices: '{count} trusted devices',
    lastLogin: 'Last login',
    loginCount: 'Login count',
    preferredMethod: 'Preferred method',
    sendMessage: 'Send message',
    viewSessions: 'View sessions',
    personalMagicCode: 'Personal Magic Code',
    magicCodeExplanation: 'This code can be used to login directly without a password',
    loadTeamError: 'Error loading team',
    never: 'Never',
    minutesAgo: '{count} minutes ago',
    hoursAgo: '{count} hours ago',
    daysAgo: '{count} days ago',
    confirmDeactivate: 'Deactivate member?',
    confirmActivate: 'Activate member?',
    confirmDeactivateMessage: 'Are you sure you want to deactivate {name}?',
    confirmActivateMessage: 'Are you sure you want to activate {name}?',
    deactivateSuccess: '{name} has been deactivated',
    activateSuccess: '{name} has been activated',
    statusChangeError: 'Error changing status',
    codeCopied: 'Code copied to clipboard',
    copyError: 'Error copying',
    magic_code: 'Magic Code',
    email_password: 'Email/Password',
    device_token: 'Device',
  },

  // Permissions
  permissions: {
    title: 'Permissions and access',
    user: 'User',
    permissionType: 'Permission type',
    resourceType: 'Resource type',
    expiresAt: 'Expires at',
    
    templates: {
      title: 'Permission templates',
      assistant: 'Assistant',
      manager: 'Manager',
      admin: 'Admin',
      owner: 'Owner',
      viewer: 'Viewer',
    },

    types: {
      read: 'Read',
      write: 'Write',
      delete: 'Delete',
      admin: 'Admin',
    },

    notifications: {
      revoked: 'Permission revoked',
      granted: 'Permission granted',
    },

    errors: {
      revokeFailed: 'Error revoking permission',
      grantFailed: 'Error granting permission',
    },
  },

  // Locations - Enhanced
  locationsAdmin: {
    isMain: 'Main location',
    setAsMain: 'Set as main location',
    manageAccess: 'Manage access',
    
    notifications: {
      mainLocationSet: 'Main location set',
      accessUpdated: 'Access updated',
    },

    errors: {
      setMainFailed: 'Error setting main location',
      accessUpdateFailed: 'Error updating access',
    },
  },

  // Suppliers Page
  suppliersPage: {
    title: 'Suppliers',
    subtitle: 'Manage your supplier relationships and vendor information',
    searchSuppliers: 'Search suppliers...',
    filterByStatus: 'Filter by status',
    importSuppliers: 'Import suppliers',
    addSupplier: 'Add supplier',
    editSupplier: 'Edit supplier',
    addNewSupplier: 'Add new supplier',
    supplierName: 'Supplier name',
    contactEmail: 'Contact email',
    contactPhone: 'Contact phone',
    website: 'Website',
    address: 'Address',
    city: 'City',
    postalCode: 'Postal code',
    country: 'Country',
    magentoVendorId: 'Magento vendor ID',
    notes: 'Notes',
    activeSupplier: 'Active supplier',
    contactInformation: 'Contact information',
    locationInfo: 'Location',
    magentoLink: 'Magento link',
    status: 'Status',
    actions: 'Actions',
    active: 'Active',
    inactive: 'Inactive',
    notLinked: 'Not linked',
    editSupplierTooltip: 'Edit supplier',
    linkToMagentoTooltip: 'Link to Magento',
    deleteSupplierTooltip: 'Delete supplier',
    cancel: 'Cancel',
    save: 'Save',
    nameRequired: 'Name is required',
    linkToMagento: 'Link to Magento',
    linkToMagentoPrompt: 'Enter the Magento vendor ID to link this supplier:',
    confirmDelete: 'Confirm delete',
    confirmDeleteMessage: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
    supplierCreated: 'Supplier created successfully',
    supplierUpdated: 'Supplier updated successfully',
    supplierDeleted: 'Supplier deleted successfully',
    supplierLinkedToMagento: 'Supplier linked to Magento successfully',
    loadSuppliersError: 'Error loading suppliers',
    saveSupplierError: 'Error saving supplier',
    deleteSupplierError: 'Error deleting supplier',
    linkMagentoError: 'Error linking supplier to Magento',
    importFeatureComingSoon: 'Import feature coming soon!',
  },

  // Notifications Page
  notificationsPage: {
    title: 'Notifications',
    subtitle: 'Manage your notifications and alert preferences',
    all: 'All',
    unread: 'Unread',
    read: 'Read',
    filterByCategory: 'Filter by category',
    markAllRead: 'Mark all read',
    settings: 'Settings',
    noNotifications: 'No notifications',
    allCaughtUp: "You're all caught up!",
    notificationStatistics: 'Notification statistics',
    unreadCount: 'Unread',
    total: 'Total',
    byCategory: 'By category',
    quickActions: 'Quick actions',
    testStockAlert: 'Test stock alert',
    testOrderUpdate: 'Test order update',
    clearAllNotifications: 'Clear all notifications',
    markAsReadTooltip: 'Mark as read',
    deleteTooltip: 'Delete',
    clearAllConfirm: 'Clear all notifications',
    clearAllConfirmMessage: 'Are you sure you want to delete all notifications? This action cannot be undone.',
    allMarkedAsRead: 'All notifications marked as read',
    notificationDeleted: 'Notification deleted',
    allNotificationsCleared: 'All notifications cleared',
    testStockAlertCreated: 'Test stock alert created',
    testOrderUpdateCreated: 'Test order update created',
    settingsFeatureComingSoon: 'Notification settings feature coming soon!',
    loadNotificationsError: 'Error loading notifications',

    categories: {
      stockAlert: 'Stock alerts',
      orderUpdate: 'Order updates',
      systemNotification: 'System notifications',
      reminder: 'Reminders',
    },

    types: {
      stock_alert: 'stock alert',
      order_update: 'order update',
      system_notification: 'system notification',
      reminder: 'reminder',
    },

    testMessages: {
      stockAlert: {
        title: 'Test Stock Alert',
        message: 'This is a test low stock notification',
      },
      orderUpdate: {
        title: 'Test Order Update',
        message: 'This is a test order update notification',
      },
    },
  },

  // Messages for user feedback
  messages: {
    addToCartComingSoon: 'Add to cart feature coming soon',
    addAllSuggestionsComingSoon: 'Add all suggestions feature coming soon',
    cartCleared: 'Cart cleared',
    cartSaved: 'Cart saved',
  },

  // Confirm dialog translations  
  dialogs: {
    typeToConfirm: 'Type {text} to confirm',
    confirmClose: 'Are you sure you want to close? Unsaved changes will be lost.',
  },

  // Magic Invite System - Revolutionary user management! 🚀
  magicInvite: {
    simpleTitle: 'Invite People',
    simpleDescription: 'Give colleagues instant access with a simple code - no passwords needed!',
    howItWorks: 'How does it work?',
    stepCreate: 'Create invitation',
    stepCreateDetail: 'Click below to make a unique code for your colleague',
    stepShare: 'Share the code',
    stepShareDetail: 'Send the code via WhatsApp, email, or just tell them',
    stepJoin: 'Instant access',
    stepJoinDetail: 'Your colleague goes to remcura.com/join and enters the code',
    
    createInvite: 'Create new invitation',
    whoAreYouInviting: 'Who are you inviting?',
    department: 'Department (optional)',
    departmentPlaceholder: 'E.g. Pharmacy, Reception, Treatment',
    generateInviteCode: 'Generate invitation code',
    
    inviteReady: '✅ Invitation ready!',
    shareThisCode: 'Share this code:',
    tellThem: 'Tell them:',
    shareMessage: 'Go to remcura.com/join and enter this code: {code}',
    
    shareWhatsApp: 'WhatsApp',
    showQR: 'QR Code',
    shareEmail: 'Email',
    qrCode: 'QR Code',
    qrInstructions: 'Let them scan this QR code with their phone',
    
    activeInvites: 'Active invitations',
    created: 'created',
    
    doctorNurse: 'Doctor/Nurse',
    assistant: 'Assistant',
    admin: 'Administrator',
    temporary: 'Temporary access',
    
    inviteCreated: 'Invitation created!',
    createError: 'Error creating invitation',
    codeCopied: 'Code copied to clipboard',
    deleteInvite: 'Delete invitation',
    deleteConfirm: 'Are you sure you want to delete code {code}?',
    inviteDeleted: 'Invitation deleted',
    
    whatsappMessage: 'Hi! You\'re invited to Remcura.\n\nGo to: {url}\nEnter this code: {code}\n\nYou\'ll have instant access! 👍',
    emailSubject: 'Remcura Invitation',
    emailMessage: 'Hi!\n\nYou\'ve been invited to use Remcura.\n\nStep 1: Go to {url}\nStep 2: Enter this code: {code}\n\nYou\'ll have immediate access to the system!\n\nBest regards',
  },

  magicJoin: {
    subtitle: 'Get instant access with your invitation code',
    enterCode: 'Enter your invitation code',
    codeExplanation: 'Received a code? Enter it here for immediate access.',
    placeholder: '🏥DEMO✨2024',
    joinNow: 'Join now',
    scanQR: 'Scan QR code',
    tryDemo: 'Try demo',
    howItWorks: 'How does it work?',
    step1: 'Receive invitation',
    step1Detail: 'You get a simple code from your clinic, like: 🏥AMSTERDAM✨2024',
    step2: 'Enter code',
    step2Detail: 'Type the code above - no password or account needed!',
    step3: 'Instant access',
    step3Detail: 'You\'re immediately logged in and can start working.',
    scanTitle: 'Scan QR code',
    scanInstructions: 'Point your camera at the QR code you received',
    demoAccess: 'Demo access - explore all features',
    memberAccess: 'Full system access',
    invalidCode: 'Invalid code - check the spelling',
    joinError: 'Something went wrong during login',
    welcomeTitle: 'Welcome!',
    welcomeMessage: 'You now have access to {practice}',
    getStarted: 'Get started!',
    
    // Smart Login Detection Messages
    welcomeBack: 'Welcome back, {name}!',
    personalCodeSuccess: 'Successfully logged in with personal code',
    personalCodeError: 'Invalid personal code',
    permanentInviteDetected: 'You\'ve been invited as a permanent team member!',
    guestAccessGranted: 'Guest access granted',
  },

  // Auto-Upgrade System - Permanent Team Members
  upgrade: {
    welcomeToTeam: 'Welcome to the team!',
    subtitle: 'You\'ve been invited as {role} for {practice}. Choose how you want to login from now on:',
    benefit1: 'Permanent access to the system',
    benefit2: 'Full functionality available',
    benefit3: 'Part of the team for daily use',
    
    // Magic Code Option
    magicCodeTitle: '⚡ Personal Code',
    magicCodeDescription: 'Get your own unique code that you can always use',
    yourPersonalCode: 'Your personal code will be:',
    magicBenefit1: 'Super fast login',
    magicBenefit2: 'Easy to remember',
    magicBenefit3: 'Works on any device',
    
    // Email + Password Option
    emailTitle: '🔐 Email + Password',
    emailDescription: 'Traditional login like you\'re used to',
    yourEmail: 'Your email address',
    choosePassword: 'Choose a password',
    emailBenefit1: 'Extra secure',
    emailBenefit2: 'Familiar system',
    emailBenefit3: 'Password recovery',
    
    // Device Remember Option
    deviceTitle: '📱 Remember Device',
    deviceDescription: 'Stay automatically logged in on this device',
    deviceBenefit1: 'Automatic login',
    deviceBenefit2: 'Secure per device',
    deviceBenefit3: '90 days valid',
    
    // Form & Actions
    yourFullName: 'Your full name',
    nameRequired: 'Name is required',
    chooseThis: 'Choose this option',
    createAccount: 'Create account',
    stayGuest: 'Stay guest (temporary)',
    accountCreated: 'Account successfully created! You can now always login.',
    createError: 'Error creating account',
    creatingAccount: 'Creating account...',
    yourCodeIs: 'Your personal code is',
  },

  // === MISSING TRANSLATIONS (AUTO-GENERATED) ===
  retry: 'retry',
  assistantDashboard: 'assistant dashboard',
  managerDashboard: 'manager dashboard',
  ownerDashboard: 'owner dashboard',
  orderSuggestions: 'order suggestions',
  recentOrders: 'recent orders',
  quickScan: 'quick scan',
  analyticsOverview: 'analytics overview',
  businessOverview: 'business overview',
  teamActivity: 'team activity',
  financialSummary: 'financial summary',
  userManagement: 'user management',
  systemHealth: 'system health',
  scanProduct: 'scan product',
  updateStock: 'Stock bijwerken',
  viewLowStock: 'Bekijk lage stock',
  manageSuppliers: 'Beheer Leveranciers',
  approveOrders: 'Keur orders goed',
  exportReports: 'Exporteer Rapporten',
  manageUsers: 'Beheer users',
  systemSettings: 'Systeminstellingen',
  financialReports: 'Financiële Rapporten',
  backupData: 'Backup Data',
  allStockLevelsOk: 'Alle stockniveaus zijn op orde',
  lowStockAlert: '{count} producten hebben lage stock',
  viewAllAlerts: 'Bekijk alle alerts',
  noOrderSuggestions: 'Geen bestel suggestions',
  noRecentOrders: 'Geen recente orders',
  loadingWidgets: 'Widgets laden...',
  errorLoadingWidget: 'Fout bij laden widget',
  tryAgain: 'Probeer innieuw',
  lowStockCount: 'Lage stock',
  pendingOrders: 'Openstaande orders',
  teamSize: 'Team Grootte',
  practiceHealth: 'Praktijk health',
  tryDifferentSearchTerm: 'Probeer een andere zoekterm',
  realTimeConnected: 'Live updates',
  realTimeDisconnected: 'Offline modus',
  stockUpdatedMessage: '{product}: nieuwe stock {quantity}',
  adjustStockLevels: 'Voorraden aanpassen en bijwerken',
  quickAmounts: 'Quick hoeveelheden',
  reasonRequired: 'Reden is verplicht',
  quantityMustBePositive: 'Quantity moet positief zijn',
  completeRequiredFields: 'Vul alle verplichte velden in',
  selectProductFirst: 'Selecteer eerst een product',
  selectLocationFirst: 'Selecteer eerst een locatie',
  noLocationSelected: 'No locatie geselecteerd',
  selectReason: 'Kies een reden',
  adjusting: 'Aanpassen...',
  adjust: 'Aanpassen',
  savingChanges: 'Wijzigingen inslaan...',
  current: 'Huidig',
  errorProductNotFound: 'Product, locatie of praktijk niet gevonden. ververs de pagina en probeer opnieuw.',
  errorUpdateInProgress: 'Een andere update is bezig. wacht even en probeer innieuw.',
  errorInvalidData: 'Ongeldige gegevens. controleer de invoer en probeer innieuw.',
  errorNegativeStock: 'Negatieve stock is niet toegestaan voor dit product.',
  stockUpdatedRealtime: 'Stock live bijgewerkt voor {product}',
  productInfoCard: 'Product informatie',
  productImageAlt: 'Productafbeelding voor {product}',
  productPrice: 'Prijs',
  euro: '€',
  selectProductTitle: 'Selecteer een product om de stock aan te passen',
  scanBarcodeTitle: 'Scan barcode van het product',
  adjustmentPreviewTitle: 'Bekijk de voorgestelde stockaanpassing',
  currentStockLevel: 'Huidige stockniveau',
  newStockLevel: 'Nieuwe stockniveau',
  stockDifference: 'Stockverschil',
  damage: 'Damaged',
  recount: 'Hertelling',
  correction: 'Correctie',

  // === AUTO-GENERATED TRANSLATIONS (101 keys) ===
  'productsPage.noProductsFound': 'Geen producten gevonden',
  'inventory.finalQuantity': 'inventory',
  'inventory.refreshFailed': 'inventory',
  'inventory.reason.normal_usage': 'inventory',
  'inventory.reason.expired': 'inventory',
  'inventory.reason.damaged': 'inventory',
  'inventory.reason.lost': 'inventory',
  'inventory.reason.found': 'inventory',
  'inventory.reason.transfer_in': 'inventory',
  'inventory.reason.transfer_out': 'inventory',
  'common.retry': 'Retry',
  'dashboard.assistantDashboard': 'dashboard',
  'dashboard.managerDashboard': 'dashboard',
  'dashboard.ownerDashboard': 'dashboard',
  'dashboard.stockAlerts': 'dashboard',
  'dashboard.orderSuggestions': 'dashboard',
  'dashboard.recentOrders': 'dashboard',
  'dashboard.quickScan': 'dashboard',
  'dashboard.analyticsOverview': 'dashboard',
  'dashboard.businessOverview': 'dashboard',
  'dashboard.costAnalysis': 'dashboard',
  'dashboard.supplierPerformance': 'dashboard',
  'dashboard.teamActivity': 'dashboard',
  'dashboard.financialSummary': 'dashboard',
  'dashboard.userManagement': 'dashboard',
  'dashboard.systemHealth': 'dashboard',
  'dashboard.scanProduct': 'dashboard',
  'dashboard.createOrder': 'dashboard',
  'dashboard.updateStock': 'dashboard',
  'dashboard.viewLowStock': 'dashboard',
  'dashboard.manageSuppliers': 'dashboard',
  'dashboard.approveOrders': 'dashboard',
  'dashboard.exportReports': 'dashboard',
  'dashboard.manageUsers': 'dashboard',
  'dashboard.systemSettings': 'dashboard',
  'dashboard.financialReports': 'dashboard',
  'dashboard.backupData': 'dashboard',
  'dashboard.noAlerts': 'dashboard',
  'dashboard.allStockLevelsOk': 'dashboard',
  'dashboard.lowStockAlert': 'dashboard',
  'dashboard.viewAllAlerts': 'dashboard',
  'dashboard.noOrderSuggestions': 'dashboard',
  'dashboard.noRecentOrders': 'dashboard',
  'dashboard.loadingWidgets': 'dashboard',
  'dashboard.errorLoadingWidget': 'dashboard',
  'dashboard.tryAgain': 'dashboard',
  'dashboard.totalProducts': 'dashboard',
  'dashboard.lowStockCount': 'dashboard',
  'dashboard.pendingOrders': 'dashboard',
  'dashboard.totalValue': 'dashboard',
  'dashboard.teamSize': 'dashboard',
  'dashboard.practiceHealth': 'dashboard',
  'inventory.barcodeFound.barcodeNotFound.tryDifferentSearchTerm': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.realTimeConnected': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.realTimeDisconnected': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.stockUpdated': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.stockUpdatedMessage': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.adjustStockLevels': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.quickAmounts': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.reasonRequired': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.quantityMustBePositive': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.completeRequiredFields': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.selectProductFirst': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.selectLocationFirst': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.selectLocation': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.noLocationSelected': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.selectReason': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.adjusting': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.adjust': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.savingChanges': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.current': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.errorProductNotFound': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.errorUpdateInProgress': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.errorInvalidData': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.errorNegativeStock': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.stockUpdatedRealtime': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.productInfoCard': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.productImageAlt': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.productPrice': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.euro': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.selectProductTitle': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.scanBarcodeTitle': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.adjustmentPreviewTitle': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.currentStockLevel': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.newStockLevel': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.stockDifference': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.reasons.damage': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.reasons.recount': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.reasons.correction': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.barcodeScanned.reasons.other': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.productsPage.noProductsFound': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.finalQuantity': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.refreshFailed': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.normal_usage': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.expired': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.damaged': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.lost': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.found': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.transfer_in': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.inventory.reason.transfer_out': 'inventory',
  'inventory.barcodeFound.barcodeNotFound.orders.notifications.magicInvite.shareMessage.whatsappMessage.common.retry': 'inventory',

  barcodeScanner: {
    title: 'Barcode Scanner',
    subtitle: 'Scan product barcodes or GTINs',
    cameraPermission: 'Camera Permission Required',
    permissionDescription: 'Allow camera access to scan barcodes and GTINs',
    enableCamera: 'Enable Camera',
    error: 'Scanner Error',
    scanning: 'Scanning...',
    instructions: 'Position the barcode within the frame',
    manualInput: 'Manual Input',
    enterBarcode: 'Enter barcode or GTIN manually',
    manualInputHelp: 'Enter 8, 12, 13, or 14 digit GTIN codes',
    switchCamera: 'Switch Camera',
    flashOn: 'Flash On',
    flashOff: 'Flash Off',
    validGtin: 'Valid GTIN scanned: {gtin}',
    invalidFormat: 'Invalid barcode format: {code}',
    permissionDenied: 'Camera permission denied. Please enable camera access in your browser settings.',
    noCameraFound: 'No camera found. Please ensure a camera is connected.',
    cameraError: 'Camera error occurred. Please try again.',
  },

    'batch.batchManagement': 'Batch management',

    'orderLists.title': 'Order lists',

    'dashboard.actions.refresh': 'Refresh dashboard',

    'dashboard.actions.customize': 'Customize dashboard',

    'dashboard.demoRoleSwitch.label': 'Switch demo role',

    'dashboard.roles.assistant': '🩺 Assistant - inventory & orders',

    'dashboard.roles.manager': '📊 Manager - analytics & reports',

    'dashboard.roles.owner': '👑 Owner - full control',

    'dashboard.quickActionLabels.scan': 'Quick scan',

    'dashboard.quickActionLabels.order': 'New order',

    'dashboard.quickActionLabels.update': 'Update inventory',

    'dashboard.quickActionLabels.export': 'Export data',

    'dashboard.quickActionLabels.default': 'Action',

    'dashboard.alerts.noWarnings': 'No warnings',

    'dashboard.alerts.allStockLevelsOk': 'All stock levels are ok',

    'dashboard.notifications.roleSwitch': 'Dashboard has been adapted to your new role',
  'quickAdjustment.noProduct': 'No product',

    'common.live': 'Live',

    'app.name': 'Remcura',

    'barcodeScanner.scanLabel': 'Scan product',

    'nav.dashboard': 'Dashboard',

    'nav.products': 'Products',

    'nav.orders': 'Orders',

    'barcodeScanner.enterBarcode': 'Enter barcode',

    'exports.formats.excel': 'Excel (.xlsx)',

    'exports.formats.csv': 'CSV (.csv)',

    'exports.formats.pdf': 'PDF (.pdf)',

    'settings.languages.dutch': 'Dutch',

    'settings.languages.english': 'English',

    'settings.languages.spanish': 'Spanish',

    'dashboard.widgets.teamMembers': 'Team members',

    'dashboard.widgets.systemStatus': 'System status',

      'currencies.eur': 'EUR (€)',
  'currencies.usd': 'USD ($)',
  'currencies.gbp': 'GBP (£)',

    'productsPage.title': 'Products',

    'productsPage.subtitle': 'Manage your product catalog and inventory',

    'common.refresh': 'Refresh',

    'products.createProduct': 'Create product',

    'productsPage.viewCart': 'View cart',

    'productsPage.noGs1Data': 'No GS1 data available',

    'productsPage.viewDetails': 'View details',

    'products.editProduct': 'Edit product',

    'products.deleteProduct': 'Delete product',

    'productsPage.addToCart': 'Add to cart',

    'productsPage.addToOrderList': 'Add to order list',

    'productsPage.productDetails': 'Product details',

    'productsPage.description': 'Description',

    'productsPage.unit': 'Unit',

    'productsPage.category': 'Category',

    'productsPage.gs1Information': 'GS1 information',

    'productsPage.lifecycle': 'Lifecycle',

    'productsPage.suppliers': 'Suppliers',

    'productsPage.stockLevels': 'Stock levels',

    'products.deleteConfirm': 'Delete product',

    'common.cancel': 'Cancel',

    'common.delete': 'Delete',

    'orders.title': 'Title',

    'orders.bulkExport': 'BulkExport',

    'orders.bulkEmail': 'BulkEmail',

    'orders.viewOrder': 'ViewOrder',

    'orders.editOrder': 'EditOrder',

    'orders.downloadOrder': 'DownloadOrder',

    'orders.export.title': 'Title',

    'orders.export.format': 'Format',

    'orders.export.dateFrom': 'DateFrom',

    'orders.export.dateTo': 'DateTo',

    'orders.export.export': 'Export',

    'orders.analytics.title': 'Title',

    'orders.analytics.comingSoon': 'ComingSoon',

    'common.close': 'Close',

    'orderLists.subtitle': 'Manage your order lists and send to suppliers',

    'orderLists.create': 'Create order list',

    'orderLists.supplier': 'Supplier',

    'orderLists.totalItems': 'Total items',

    'orderLists.totalAmount': 'Total amount',

    'orderLists.updatedAt': 'Updated at',

    'orderLists.edit': 'Edit',

    'orderLists.submit': 'Submit',

    'orderLists.sendToSupplier': 'Send to supplier',

    'orderLists.addToCart': 'Add to cart',

    'orderLists.duplicate': 'Duplicate',

    'orderLists.autoFill': 'Auto fill',

    'orderLists.delete': 'Delete',

    'orderLists.noLists': 'No order lists found',

    'orderLists.createNew': 'Create your first order list',

    'orderLists.deleteDialog': 'Delete order list',

    'orderLists.deleteConfirm': 'Are you sure you want to delete this order list?',

    'inventory.stockLevels': 'Stock levels',

    'inventory.overview': 'Overview',

    'inventory.totalProducts': 'Total products',

    'inventory.products': 'Products',

    'inventory.stockLocations': 'Stock locations',

    'inventory.activeLocations': 'Active locations',

    'inventory.locations': 'Locations',

    'inventory.dataLoaded': 'Data loaded',

    'inventory.upToDate': 'Up to date',

    'inventory.realTimeConnected': 'Real-time connected',

    'inventory.status': 'Status',

    'inventory.lastUpdated': 'Last updated',

    'inventory.refreshData': 'Refresh data',

    'inventory.lastSync': 'Last sync',

    'inventory.noStockLevels': 'No stock levels found',

    'inventory.adjustStock': 'Adjust stock',

    'inventory.viewHistory': 'View history',

    'inventory.countStock': 'Count stock',

    'inventory.currentStock': 'Current stock',

    'inventory.adjustmentType': 'Adjustment type',

    'inventory.quantity': 'Quantity',

    'validation.required': 'This field is required',

    'inventory.reason': 'Reason',

    'inventory.adjust': 'Adjust',

    'counting.title': 'Stock counting',

    'counting.overview': 'Counting sessions overview',

    'counting.sessionStatus': 'Session status',

    'counting.startSession': 'Start new session',

    'counting.activeSession': 'Active session',

    'counting.progress': 'Progress',

    'counting.sessionType': 'Session type',

    'common.startedAt': 'Started at',

    'counting.discrepancies': 'Discrepancies',

    'counting.continueSession': 'Continue session',

    'counting.completeSession': 'Complete session',

    'counting.sessionsOverview': 'Sessions overview',

    'counting.loadingSessions': 'Loading sessions...',

    'counting.noSessionsFound': 'No sessions found',

    'common.view': 'View',

    'counting.approveSession': 'Approve session',

    'counting.loadingSession': 'Loading session...',

    'counting.sessionNotFound': 'Session not found',

    'counting.sessionNotFoundDescription': 'The requested session does not exist or has been deleted',

    'common.goBack': 'Go back',

    'counting.sessionSummary': 'Session summary',

    'counting.totalProducts': 'Total products',

    'counting.countedProducts': 'Counted products',

    'common.completedAt': 'Completed at',

    'counting.countingResults': 'Counting results',

    'counting.viewResults': 'View the results of this count',

    'counting.noResultsFound': 'No results found',

    'locations.title': 'Locations',

    'locations.manage': 'Manage locations',

    'locations.allLocations': 'All locations',

    'locations.mainLocations': 'Main locations',

    'locations.comingSoonDescription': 'Location management coming soon',

    'locations.add': 'Add location',

    'locations.noLocations': 'No locations found',

    'inventory.stockMovements': 'Stock movements',

    'inventory.movementHistory': 'Movement history',

    'common.export': 'Export',

    'inventory.loadingMovements': 'Loading movements...',

    'inventory.noMovementsFound': 'No movements found',

    'common.unknownProduct': 'Unknown product',

    'common.unknownLocation': 'Unknown location',

    'inventory.movementDetails': 'Movement details',

    'inventory.movementType': 'Movement type',

    'inventory.product': 'Product',

    'common.noSku': 'No SKU',

    'inventory.location': 'Location',

    'inventory.quantityChange': 'Quantity change',

    'inventory.quantityBefore': 'Quantity before',

    'inventory.quantityAfter': 'Quantity after',

    'inventory.reasonCode': 'Reason code',

    'common.notes': 'Notes',

    'common.date': 'Date',

    'inventory.minimumStock': 'Minimum stock',

    'productsPage.table.stockType': 'Stock type',

    'orderLists.searchPlaceholder': 'Search order lists...',

    'orderLists.dateRange': 'Date range',

    'orderLists.amountRange': 'Amount range',

    'orderLists.onlyWithItems': 'Only with items',

    'filters.search.placeholder': 'Search...',

    'filters.location.label': 'Location',

    'filters.category.label': 'Category',

    'filters.status.label': 'Status',

    'orders.status.draft': 'Draft',

    'orders.status.pending': 'Pending',

    'orders.status.confirmed': 'Confirmed',

    'orders.status.shipped': 'Shipped',

    'orders.status.delivered': 'Delivered',

    'orders.status.cancelled': 'Cancelled',

    'orders.status.returned': 'Returned',

    'orders.table.orderNumber': 'Order number',

    'orders.table.supplier': 'Supplier',

    'orders.table.orderDate': 'Order date',

    'orders.table.status': 'Status',

    'orders.table.totalAmount': 'Total amount',

    'orders.table.expectedDelivery': 'Expected delivery',

    'orders.table.actions': 'Actions',

};