export default {
  // Brand
  brand: {
    name: 'MedStock Pro',
    edition: 'Enterprise Edition'
  },

  // Clinic
  clinic: {
    professionalPlan: 'Professional Plan',
    defaultName: 'Clinic'
  },

  // Common/Global
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    yes: 'Yes',
    no: 'No',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    refresh: 'Refresh',
    comingSoon: 'Coming Soon',
    update: 'Update'
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    invoices: 'Invoices',
    settings: 'Settings',
    logout: 'Logout',
    profile: 'Profile',
    helpSupport: 'Help & Support',
    navigation: 'Navigation',
    quickStats: 'Quick Stats',
    upgradePlan: 'Upgrade Plan',
    getAdvancedFeatures: 'Get advanced features',
    analytics: 'Analytics',
    suppliers: 'Suppliers',
    overviewAnalytics: 'Overview & analytics',
    inventoryManagement: 'Inventory management',
    purchaseOrders: 'Purchase orders',
    reportsInsights: 'Reports & insights',
    vendorManagement: 'Vendor management'
  },

  // Authentication
  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    loginError: 'Login failed. Please check your credentials.',
    sessionExpired: 'Your session has expired. Please log in again.',
    loginSuccess: 'Successfully logged in',
    logoutSuccess: 'Successfully logged out',
    pleaseLogin: 'Please log in to continue',
    demoAccount: 'Demo account',
    or: 'or',
    secureConnection: 'Secure connection',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
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
    copyright: '© {year} {company}. All rights reserved.'
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
    totalProducts: 'Total products',
    reorderSuggestions: 'Reorder suggestions',
    outOfStock: 'Out of stock',
    lowStock: 'Low stock',
    inStock: 'In stock',
    noLowStock: 'All items in stock!',
    allProductsWellStocked: 'All products are well stocked',
    viewAllProducts: 'View all products',
    viewMore: 'View {count} more',
    quickActions: 'Quick actions',
    addProduct: 'Add product',
    addNewProduct: 'Add a new product to your inventory',
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
    viewAnalytics: 'View Analytics',
    vsLastMonth: 'vs last month'
  },

  // Products
  products: {
    title: 'Products',
    productName: 'Product name',
    productSku: 'Product SKU',
    currentStock: 'Current stock',
    minimumStock: 'Minimum stock',
    maximumStock: 'Maximum stock',
    reorderEnabled: 'Auto reorder',
    lowStockAlert: 'Low stock alert',
    addProduct: 'Add product',
    editProduct: 'Edit product',
    deleteProduct: 'Delete product',
    stockLevel: 'Stock level',
    reorderSuggestion: 'Order {quantity} units to reach maximum stock',
    lowStockWarning: 'Low stock! Current: {current}, minimum: {minimum}',
    outOfStockWarning: 'Out of stock!',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    lowStock: 'Low stock',
    description: 'Description',
    manageInventorySubtitle: 'Manage your medical inventory and receive automated reorder alerts',
    inventoryManagement: 'Inventory management',
    totalProductsCount: '{count} products',
    filterByStockStatus: 'Filter by stock status',
    maxStockHint: 'Maximum stock',
    lowStockWarningPreview: 'This product will be marked as \'Low Stock\''
  },

  // Stock Alerts
  alerts: {
    lowStock: 'Low stock warning',
    outOfStock: 'Out of stock',
    reorderSuggestion: 'Reorder suggestion',
    stockUpdated: 'Stock updated',
    productAdded: 'Product added',
    productUpdated: 'Product updated',
    productDeleted: 'Product deleted',
    lowStockAttention: '{count} products need attention',
    outOfStockUnavailable: '{count} products are unavailable',
    lowStockSingular: '1 product needs attention',
    lowStockPlural: '{count} products need attention',
    outOfStockSingular: '1 product is unavailable',
    outOfStockPlural: '{count} products are unavailable'
  },

  // Errors
  errors: {
    generic: 'An error occurred. Please try again.',
    network: 'Network error. Please check your internet connection.',
    unauthorized: 'You are not authorized for this action.',
    notFound: 'The requested resource was not found.',
    validation: 'Validation error. Please check the entered data.',
    serverError: 'Server error. Please try again later.'
  },

  // Error pages
  error: {
    pageNotFound: 'Page not found',
    pageNotFoundDescription: 'Sorry, the page you are looking for cannot be found. It might have been moved, deleted, or you entered the wrong URL.',
    goHome: 'Go home',
    goBack: 'Go back',
    tryThesePages: 'Try visiting one of these popular pages instead:'
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
    integer: 'Only whole numbers allowed'
  },

  // Settings
  settings: {
    title: 'Settings',
    general: 'General',
    darkMode: 'Dark mode',
    language: 'Language',
    notifications: 'Notifications',
    clinic: 'Clinic settings',
    profile: 'Profile settings',
    manageSettingsSubtitle: 'Manage your settings and preferences for an optimal experience',
    saveSettings: 'Save settings',
    role: 'Role',
    clinicName: 'Clinic name',
    contactEmail: 'Contact email',
    phoneNumber: 'Phone number',
    address: 'Address'
  },

  // Orders
  orders: {
    manageOrdersSubtitle: 'View and manage your orders with our advanced order management system',
    backToDashboard: 'Back to Dashboard',
    technicalInfoForDevelopers: 'Technical information (for developers)'
  }
} 