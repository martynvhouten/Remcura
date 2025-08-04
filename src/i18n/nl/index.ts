import filters from './filters';

export default {
  // Filters
  filters,

  // Brand
  brand: {
    name: 'Remcura',

    tagline: 'Professioneel medisch voorraadbeheer',
  },

  // Clinic
  clinic: {
    defaultName: 'Demo kliniek',
    settings: 'Kliniek instellingen',
    information: 'Kliniek informatie',
  },

  // Common/Global
  common: {
    ok: 'OK',
    cancel: 'Annuleren',
    save: 'Opslaan',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    add: 'Toevoegen',
    remove: 'Verwijderen',
    moreActions: 'Meer acties',
    allLocations: 'Alle locaties',
    allStatuses: 'Alle statussen',
    search: 'Zoeken',
    filter: 'Filter',
    clear: 'Wissen',
    refresh: 'Vernieuwen',
    loading: 'Laden...',
    noData: 'Geen gegevens beschikbaar',
    error: 'Fout',
    success: 'Succes',
    warning: 'Waarschuwing',
    info: 'Informatie',
    confirm: 'Bevestigen',
    yes: 'Ja',
    no: 'Nee',
    close: 'Sluiten',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    retry: 'Opnieuw proberen',
    all: 'Alle',
    none: 'Geen',
    select: 'Selecteren',
    update: 'Bijwerken',
    dismiss: 'Afwijzen',
    closeDialog: 'Dialog sluiten',
    actions: 'Acties',
    open: 'Openen',
    unknownProduct: 'Onbekend product',
    unknownLocation: 'Onbekende locatie',
    unknownSupplier: 'Onbekende leverancier',
    noSku: 'Geen SKU',
    uncategorized: 'Niet gecategoriseerd',
    defaultUnit: 'st',
    create: 'Aanmaken',
    reset: 'Herstellen',
    export: 'Exporteren',
    import: 'Importeren',
    download: 'Downloaden',
    upload: 'Uploaden',
    view: 'Bekijken',
    print: 'Afdrukken',
    copy: 'Kopiëren',
    share: 'Delen',
    status: 'Status',
    active: 'Actief',
    inactive: 'Inactief',
    enabled: 'Ingeschakeld',
    disabled: 'Uitgeschakeld',
    name: 'Naam',
    description: 'Beschrijving',
    date: 'Datum',
    time: 'Tijd',
    today: 'Vandaag',
    yesterday: 'Gisteren',
    comingSoon: 'Binnenkort beschikbaar',
    dataRefreshed: 'Gegevens succesvol vernieuwd',
    clearFilters: 'Filters wissen',
    submit: 'Verzenden',
    fromDate: 'Vanaf datum',
    toDate: 'Tot datum',
    
    // Accessibility labels
    accessibility: {
      mainNavigation: 'Hoofdnavigatie',
      pageMetadata: 'Pagina metadata',
      pageActions: 'Pagina acties',
      navigationActions: 'Navigatie acties',
      quickNavigation: 'Snelle navigatie',
      userMenu: 'Gebruiker menu',
      openMenu: 'Menu openen',
      closeMenu: 'Menu sluiten',
      toggleTheme: 'Thema wisselen',
      searchButton: 'Zoeken',
      notificationPanel: 'Meldingen paneel',
    },
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    orders: 'Bestellingen',
    invoices: 'Facturen',
    settings: 'Instellingen',
    logout: 'Uitloggen',
    profile: 'Profiel',
    helpSupport: 'Help & ondersteuning',
    navigation: 'Navigatie',
    quickStats: 'Snelle statistieken',
    upgradePlan: 'Plan upgraden',
    getAdvancedFeatures: 'Geavanceerde functies verkrijgen',
    inventory: 'Voorraad',
    analytics: 'Analyses',
    suppliers: 'Leveranciers',
    admin: 'Beheer',
    products: 'Producten',
    overviewAnalytics: 'Overzicht & analyses',
    stockManagement: 'Voorraadniveaus en voorraad tracking',
    inventoryManagement: 'Voorraadbeheer',
    productManagement: 'Product overzicht en bestellen',
    purchaseOrders: 'Inkooporders',
    reportsInsights: 'Rapporten & inzichten',
    vendorManagement: 'Leveranciers beheer',
    systemAdmin: 'Systeembeheer',
    openNavigation: 'Navigatie openen',
    notifications: 'Meldingen',
    alertsNotifications: 'Waarschuwingen & meldingen',
    darkMode: 'Donkere modus',
    lightMode: 'Lichte modus',
    userMenu: 'Gebruikersmenu',
    shoppingCart: 'Winkelwagen',
    styleGuide: 'Stijlgids',
    designSystem: 'Ontwerp systeem referentie',
    
    sections: {
      main: 'Overzicht',
      inventory: 'Voorraadbeheer',
      supplyChain: 'Supply Chain',
      analytics: 'Analyses & Rapporten',
      administration: 'Beheer',
    },
    
    inventoryLevels: 'Voorraadniveaus',
    currentStock: 'Huidige voorraad overzicht',
    locations: 'Locaties',
    warehouseManagement: 'Magazijn & locatie beheer',
    stockCounting: 'Voorraadtelling',
    physicalCounts: 'Fysieke tellingen & audits',
    movements: 'Voorraadmutaties',
    stockMovements: 'Voorraad in- en uitgangen',
  },

  // Authentication
  auth: {
    login: 'Inloggen',
    logout: 'Uitloggen',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    forgotPassword: 'Wachtwoord vergeten?',
    resetPassword: 'Wachtwoord resetten',
    hidePassword: 'Wachtwoord verbergen',
    showPassword: 'Wachtwoord tonen',
    loginError: 'Inloggen mislukt. Controleer je gegevens.',
    sessionExpired: 'Je sessie is verlopen. Log opnieuw in.',
    loginSuccess: 'Succesvol ingelogd',
    logoutSuccess: 'Succesvol uitgelogd',
    pleaseLogin: 'Log in om verder te gaan',
    demoAccount: 'Demo account',
    or: 'of',
    secureConnection: 'Beveiligde verbinding',
    privacyPolicy: 'Privacybeleid',
    termsOfService: 'Servicevoorwaarden',
    support: 'Ondersteuning',
    allRightsReserved: 'Alle rechten voorbehouden',
    professionalInventory: 'Professioneel medisch voorraadbeheer',
    platformDescription: 'Stroomlijn je medische voorraadbeheer met ons enterprise-grade platform. Volg voorraad, beheer bestellingen, en zorg voor compliance met gemak.',
    realtimeTracking: 'Realtime voorraad tracking',
    automatedAlerts: 'Geautomatiseerde herbestel waarschuwingen',
    complianceReporting: 'Compliance rapportage',
    multilocationSupport: 'Multi-locatie ondersteuning',
    demoCredentialsFilled: 'Demo credentials ingevuld. Klik op Inloggen om door te gaan.',
    passwordResetComingSoon: 'Wachtwoord reset functionaliteit komt binnenkort.',
    copyright: '© {year} {company}. Alle rechten voorbehouden.',
    passwordHelp: 'Voer je wachtwoord in om veilig in te loggen',
    demoHelp: 'Gebruik demo@remcura.com met wachtwoord demo123 voor demonstratie',
    signingIn: 'Inloggen...',
    fullName: 'Volledige naam',
  },

  // Demo Account
  demo: {
    title: 'Demo account',
    subtitle: 'Je bent ingelogd met het demo account',
    resetData: 'Demo data resetten',
    resetDataConfirm: 'Weet je zeker dat je alle demo data wilt resetten?',
    resetDataSuccess: 'Demo data succesvol gereset',
    resetDataError: 'Fout bij het resetten van demo data',
    limitations: 'Demo beperkingen',
    limitationsText: 'Dit is een demo account. Alle wijzigingen zijn zichtbaar maar kunnen worden gereset.',
    practice: 'Remka demo kliniek',
    practiceDescription: 'Volledig functionele demo omgeving met realistische data',
    resetInfo: 'Dit zal alle demo data verwijderen en vers opnieuw aanmaken',
    onlyDemoUserCanReset: 'Alleen demo gebruiker kan demo data resetten',
    changesCanBeReset: 'Alle wijzigingen worden opgeslagen maar kunnen worden gereset via de Admin pagina.',
    resetInProgress: 'Demo data wordt gereset...',
    reloadingAfterReset: 'Pagina wordt herladen met nieuwe data...',
    // MISSING KEY:
    resetFailed: 'Reset mislukt'
  },

  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welkom',
    user: 'Gebruiker',
    clinicInfo: 'Kliniek informatie',
    stockSummary: 'Voorraad overzicht',
    lowStockItems: 'Artikelen met lage voorraad',
    outOfStockItems: 'Uitverkocht',
    reorderSuggestions: 'Bestel suggesties',
    outOfStock: 'Niet op voorraad',
    lowStock: 'Lage voorraad',
    inStock: 'Op voorraad',
    noLowStock: 'Alles op voorraad!',
    viewMore: 'Bekijk {count} meer',
    quickActions: 'Snelle acties',
    manageStock: 'Voorraad beheren',
    updateStockLevels: 'Voorraadniveaus en instellingen bijwerken',
    viewOrders: 'Bestellingen bekijken',
    manageOrders: 'Bestellingen en ordergeschiedenis beheren',
    configureSystem: 'Systeeminstellingen configureren',
    dataRefreshed: 'Gegevens succesvol vernieuwd',
    recentActivity: 'Recente activiteit',
    itemsRequiringAttention: 'Artikelen die aandacht nodig hebben',
    commonTasks: 'Algemene taken',
    exportToCsv: 'Exporteren naar CSV',
    currentMin: 'Huidig / min',
    latestUpdates: 'Laatste updates',
    viewAnalytics: 'Analyses bekijken',
    
    // === NEW DASHBOARD KEYS ===
    actions: {
      refresh: 'Dashboard vernieuwen',
      customize: 'Dashboard aanpassen',
      refreshed: 'Dashboard vernieuwd',
    },

    // Empty state
    empty: {
      title: 'Dashboard configureren',
      subtitle: 'Voeg widgets toe om uw dashboard te personaliseren',
      addWidgets: 'Widgets toevoegen',
    },

    // Customize dialog
    customize: {
      title: 'Dashboard aanpassen',
      comingSoon: 'Personalisatie opties komen binnenkort beschikbaar',
    },

    // Role titles
    titles: {
      assistant: 'Assistent dashboard',
      manager: 'Manager dashboard', 
      owner: 'Eigenaar dashboard',
      default: 'Dashboard',
    },
    
    demoRoleSwitch: {
      label: 'Switch demo rol',
    },
    
    roles: {
      assistant: '🩺 Assistent - Voorraad & bestellingen',
      manager: '📊 Manager - Analytics & overzichten',
      owner: '👑 Eigenaar - Volledige controle',
    },
    
    quickActionLabels: {
      scan: 'Snel scannen',
      order: 'Nieuwe bestelling',
      update: 'Voorraad bijwerken',
      export: 'Export data',
      default: 'Actie',
    },
    
    alerts: {
      noWarnings: 'Geen waarschuwingen',
      allStockLevelsOk: 'Alle voorraadniveaus zijn op orde',
    },
    
    // Role switching
    roleSwitch: {
      success: 'Rol succesvol gewijzigd',
      caption: 'Dashboard is aangepast aan je nieuwe rol',
    },

    // Error messages
    errors: {
      loadFailed: 'Laden dashboard mislukt',
      tryRefresh: 'Probeer de pagina te vernieuwen',
      switchFailed: 'Wisselen van rol mislukt',
      tryAgain: 'Probeer het opnieuw',
    },
    
    widgetTypeNotSupported: 'Widget type niet ondersteund',

    // Service layer translations
    service: {
      subtitles: {
        assistant: 'Beheer bestellingen en voorraad updates',
        manager: 'Overzichten en analyses voor betere besluitvorming',
        owner: 'Volledige controle en administratie van uw praktijk',
      },
      widgets: {
        stockAlerts: 'Voorraad waarschuwingen',
        orderSuggestions: 'Bestel suggesties',
        recentOrders: 'Recente bestellingen',
        quickScan: 'Snel scannen',
        quickScanDescription: 'Scan een product barcode voor snelle voorraad updates',
        analyticsOverview: 'Analytics overzicht',
        businessOverview: 'Business overzicht',
        financialSummary: 'Financieel overzicht',
        monthlyRevenue: 'Omzet deze maand',
        inventoryCosts: 'Voorraadkosten',
        netProfit: 'Netto winst',
        userManagement: 'Gebruikersbeheer',
        systemHealth: 'Systeem gezondheid',
        systemStatus: 'Systeem status',
        ownerLastActive: 'Eigenaar - Laatst actief: {time}',
        managerOnlineNow: 'Manager - Online nu',
        assistantLastActive: 'Assistent - Laatst actief: {time}',
      },
      quickActions: {
        scanProduct: 'Scan product',
        createOrder: 'Nieuwe bestelling',
        updateStock: 'Voorraad bijwerken',
        viewLowStock: 'Lage voorraad',
        viewAnalytics: 'Analytics bekijken',
        manageSuppliers: 'Leveranciers beheren',
        approveOrders: 'Bestellingen goedkeuren',
        exportReports: 'Rapporten exporteren',
        manageUsers: 'Gebruikers beheren',
        systemSettings: 'Systeeminstellingen',
        financialReports: 'Financiële rapporten',
        backupData: 'Data backup',
      },
      alerts: {
        viewStock: 'Bekijk voorraad',
        viewReport: 'Bekijk rapport',
        updateNow: 'Update nu',
        lowStockMessage: '{count} producten hebben lage voorraad',
        monthlyReportAvailable: 'Maandelijkse analyse rapport beschikbaar',
        systemUpdateAvailable: 'Systeemupdate beschikbaar',
      },
    },
    welcomeTitle: 'Welkom bij Remcura',
    welcomeSubtitle: 'Je professionele medische voorraadbeheersysteem',
    welcomeDescription: 'Beheer je voorraad efficiënt met onze geavanceerde tools en realtime tracking.',
    systemStatus: 'Systeemstatus',
    systemStatusSubtitle: 'Huidige status van je systeem',
    systemOnline: 'Systeem online',
    dataSynced: 'Data gesynchroniseerd',
    secureConnection: 'Beveiligde verbinding',
    vsLastMonth: 'vs vorige maand',
    summaryOverview: 'Samenvatting overzicht',
    moreOptions: 'Meer opties',
    quickActionsList: 'Snelle acties lijst',
    optionsMenu: 'Opties menu',
    lowStockItemsList: 'Artikelen met lage voorraad lijst',
    dashboardSummary: 'Dashboard samenvatting',
    failedToLoadData: 'Fout bij laden dashboard data',
    dataRefreshedSuccessfully: 'Gegevens succesvol vernieuwd',
    failedToRefreshData: 'Fout bij vernieuwen gegevens',
    
    // Role-based dashboards
    assistantDashboard: 'Assistent dashboard',
    managerDashboard: 'Manager dashboard', 
    ownerDashboard: 'Eigenaar dashboard',
    
    // Widget titles
    stockAlerts: 'Voorraad waarschuwingen',
    orderSuggestions: 'Bestel suggesties',
    recentOrders: 'Recente bestellingen',
    quickScan: 'Snel scannen',
    analyticsOverview: 'Analytics overzicht',
    businessOverview: 'Business overzicht',
    costAnalysis: 'Kosten analyse',
    supplierPerformance: 'Leverancier prestaties',
    teamActivity: 'Team activiteit',
    financialSummary: 'Financieel overzicht',
    userManagement: 'Gebruikersbeheer',
    systemHealth: 'Systeem gezondheid',
    
    // Quick actions
    scanProduct: 'Scan product',
    createOrder: 'Nieuwe bestelling',
    updateStock: 'Voorraad bijwerken',
    viewLowStock: 'Lage voorraad bekijken',
    manageSuppliers: 'Leveranciers beheren',
    approveOrders: 'Bestellingen goedkeuren',
    exportReports: 'Rapporten exporteren',
    manageUsers: 'Gebruikers beheren',
    systemSettings: 'Systeem instellingen',
    financialReports: 'Financiële Rapporten',
    backupData: 'Data backup',
    
    // Alerts and messages
    noAlerts: 'Geen waarschuwingen',
    allStockLevelsOk: 'Alle voorraadniveaus OK',
    lowStockAlert: '{count} producten hebben lage voorraad',
    viewAllAlerts: 'Bekijk alle waarschuwingen',
    noOrderSuggestions: 'Geen bestel suggesties',
    noRecentOrders: 'Geen recente bestellingen',
    
    // Loading and error states
    loadingWidgets: 'Widgets laden...',
    errorLoadingWidget: 'Fout bij laden widget',
    tryAgain: 'Probeer opnieuw',
    
    // Metrics and analytics
    totalProducts: 'Totaal producten',
    lowStockCount: 'Lage voorraad',
    pendingOrders: 'Openstaande bestellingen',
    totalValue: 'Totale waarde',
    teamSize: 'Team grootte',
    practiceHealth: 'Praktijk gezondheid',
  },

  // Errors
  errors: {
    generic: 'Er is een fout opgetreden. Probeer het opnieuw.',
    network: 'Netwerkfout. Controleer je internetverbinding.',
    unauthorized: 'Je bent niet geautoriseerd voor deze actie.',
    notFound: 'De gevraagde resource werd niet gevonden.',
    validation: 'Validatiefout. Controleer de ingevoerde gegevens.',
    serverError: 'Serverfout. Probeer het later opnieuw.',
    failedToGenerateSuggestion: 'Fout bij genereren van suggestie',
    failedToRefreshData: 'Fout bij vernieuwen van gegevens',
    failed: 'Actie mislukt',
    failedToLoadData: 'Fout bij laden van gegevens',
    failedToGenerateReport: 'Fout bij genereren van rapport',
    failedToRegisterBatch: 'Fout bij registreren van batch',
  },

  // Error pages
  error: {
    pageNotFound: 'Pagina niet gevonden',
    pageNotFoundDescription: 'Sorry, de pagina die je zoekt kan niet worden gevonden. Deze is mogelijk verplaatst, verwijderd, of je hebt een verkeerde URL ingevoerd.',
    goHome: 'Naar home',
    goBack: 'Terug',
    tryThesePages: "Probeer in plaats daarvan een van deze populaire pagina's te bezoeken:",
  },

  // Validation
  validation: {
    required: 'Dit veld is verplicht',
    email: 'Voer een geldig e-mailadres in',
    minLength: 'Minimaal {min} tekens vereist',
    maxLength: 'Maximaal {max} tekens toegestaan',
    numeric: 'Alleen nummers toegestaan',
    positive: 'Waarde moet positief zijn',
    positiveNumber: 'Waarde moet een positief getal zijn',
    integer: 'Alleen hele getallen toegestaan',
    mustBePositive: 'Waarde moet positief zijn',
    textMustMatch: 'Tekst moet overeenkomen met {text}',
    formErrors: 'Formulier bevat fouten',
  },

  // Product (for form fields and references)
  product: {
    product: 'Product',
    selectProduct: 'Product selecteren',
    samples: {
      syringeBD: 'BD Plastipak Spuit',
      needleBD: 'BD Microlance Naald',
    },
  },

  // Location (for form fields and references)
  location: {
    location: 'Locatie',
    selectLocation: 'Locatie selecteren',
    sampleData: {
      mainWarehouse: {
        name: 'Hoofdmagazijn',
        type: 'Magazijn',
        description: 'Centraal opslagmagazijn',
      },
      pharmacy: {
        name: 'Apotheek opslag',
        type: 'Apotheek',
        description: 'Geneesmiddelen opslag',
      },
      treatmentRoom: {
        name: 'Behandelkamer A',
        type: 'Behandelkamer',
        description: 'Voorraad voor behandelkamer A',
      },
    },
    samples: {
      emergencyStock: 'Spoedkast',
    },
  },

  // Inventory & Stock Management
  inventory: {
    title: 'Voorraad',
    stockLevels: 'Voorraadniveaus',
    stockMovements: 'Voorraadmutaties',
    locations: 'Locaties',
    suppliers: 'Leveranciers',
    orders: 'Bestellingen',
    stockCounting: 'Voorraadtelling',
    overview: 'Voorraad overzicht',
    totalProducts: 'Totaal producten',
    products: 'Producten',
    stockLocations: 'Voorraadlocaties',
    activeLocations: 'Actieve locaties',
    dataLoaded: 'Gegevens geladen',
    upToDate: 'Up-to-date',
    status: 'Status',
    lastUpdated: 'Laatst bijgewerkt',
    refreshData: 'Gegevens vernieuwen',
    time: 'Tijd',
    searchProducts: 'Producten zoeken',
    stockStatus: 'Voorraadstatus',
    category: 'Categorie',
    items: 'Items',
    totalValue: 'Totale waarde',
    lowStockItems: 'Artikelen met lage voorraad',
    outOfStockItems: 'Artikelen zonder voorraad',
    stockAccuracy: 'Voorraadnauwkeurigheid',
    lastFullCount: 'Laatste volledige telling',
    allLocations: 'Alle locaties',
    currentLocation: 'Huidige locatie',
    switchLocation: 'Locatie wisselen',
    startCounting: 'Telling starten',
    startCountingSession: 'Tellingsessie starten',
    quickAdjustment: 'Snelle aanpassing',
    adjustStock: 'Voorraad aanpassen',
    transferStock: 'Voorraad overbrengen',
    viewMovements: 'Mutaties bekijken',
    exportData: 'Gegevens exporteren',
    scanBarcode: 'Scan barcode',
    barcodeFound: 'Product gevonden: {product}',
    barcodeNotFound: 'Geen product gevonden voor barcode: {barcode}',
    searchProduct: 'Product zoeken',
    noProductsFound: 'Geen producten gevonden',
    tryDifferentSearchTerm: 'Probeer een andere zoekterm',
    
    // Real-time functionality
    realTimeConnected: 'Live updates',
    realTimeDisconnected: 'Offline modus',
    stockUpdated: 'Voorraad bijgewerkt',
    stockUpdatedMessage: '{product}: nieuwe voorraad {quantity}',
    
    // Enhanced UX functionality
    adjustStockLevels: 'Voorraden aanpassen en bijwerken',
    quickAmounts: 'Snelle hoeveelheden',
    reasonRequired: 'Reden is verplicht',
    quantityMustBePositive: 'Hoeveelheid moet positief zijn',
    completeRequiredFields: 'Vul alle verplichte velden in',
    selectProductFirst: 'Selecteer eerst een product',
    selectLocationFirst: 'Selecteer eerst een locatie',
    selectLocation: 'Selecteer locatie',
    noLocationSelected: 'Geen locatie geselecteerd',
    selectReason: 'Selecteer een reden',
    adjusting: 'Aanpassen...',
    adjust: 'Aanpassen',
    savingChanges: 'Wijzigingen opslaan...',
    current: 'Huidig',
    barcodeScanned: 'Barcode gescand: {barcode}',
    changeProduct: 'Product wijzigen',
    inStock: 'Op voorraad',
    lowStock: 'Lage voorraad',
    outOfStock: 'Niet op voorraad',
    overStock: 'Overvoorraad',
    
    // Table column headers
    product: 'Product',
    location: 'Locatie',
    currentStock: 'Huidige voorraad',
    minimumStock: 'Minimum voorraad',
    lastCounted: 'Laatst geteld',
    actions: 'Acties',
    recentActivity: 'Recente activiteit',
    recentMovements: 'Recente mutaties',
    noRecentActivity: 'Geen recente activiteit',
    stockAlerts: 'Voorraad waarschuwingen',
    criticalAlerts: 'Kritieke waarschuwingen',
    urgentAttention: 'Vereist urgente aandacht',
    noAlerts: 'Geen waarschuwingen',
    countingStatus: 'Telling status',
    activeSession: 'Actieve sessie',
    noActiveSession: 'Geen actieve telling',
    syncStatus: 'Sync status',
    lastSync: 'Laatste sync',
    syncNow: 'Nu synchroniseren',
    loadingData: 'Voorraadgegevens laden...',
    refreshingData: 'Gegevens vernieuwen...',
    manualOrder: 'Handmatige bestelling',
    apiOrder: 'API bestelling',
    downloadPdf: 'PDF downloaden',
    placeOrder: 'Bestelling plaatsen',
    setMinimum: 'Minimum instellen',
    setMaximum: 'Maximum instellen',
    reorderPoint: 'Herbestelpunt',
    pieces: 'stuks',
    units: 'eenheden',
    quantity: 'Hoeveelheid',
    today: 'vandaag',
    yesterday: 'gisteren',
    thisWeek: 'deze week',
    thisMonth: 'deze maand',
    neverCounted: 'nooit geteld',
    sessionName: 'Sessienaam',
    sessionNamePlaceholder: 'Voer een naam in voor de tellingsessie',
    sessionType: 'Sessietype',
    selectLocations: 'Locaties selecteren',
    allowNegativeCounts: 'Negatieve tellingen toestaan',
    requireApproval: 'Goedkeuring vereist',
    autoAdjustStock: 'Voorraad automatisch aanpassen',
    sessionNotesPlaceholder: 'Optionele notities voor deze tellingsessie',
    partialCount: 'Gedeeltelijke telling',
    fullCount: 'Volledige telling',
    spotCheck: 'Steekproef',
    cycleCount: 'Cyclische telling',
    partialCountDescription: 'Tel alleen geselecteerde producten',
    fullCountDescription: 'Tel alle producten in geselecteerde locaties',
    spotCheckDescription: 'Snelle controle van specifieke artikelen',
    cycleCountDescription: 'Systematisch tellen volgens schema',
    defaultSessionName: 'Telling {date} {time}',
    sessionCreated: 'Tellingsessie aangemaakt',
    sessionCreationFailed: 'Aanmaken tellingsessie mislukt',
    searchProductPlaceholder: 'Typ om te zoeken...',
    quantityMustNotBeZero: 'Hoeveelheid mag niet nul zijn',
    quantityChangeHint: 'Gebruik + om toe te voegen, - om te verwijderen',
    adjustmentNotesPlaceholder: 'Reden voor aanpassing...',
    stockAdjusted: 'Voorraad aangepast',
    adjustmentFailed: 'Voorraadaanpassing mislukt',
    fromLocation: 'Van locatie',
    toLocation: 'Naar locatie',
    locationsMustBeDifferent: 'Locaties moeten verschillend zijn',
    enterQuantity: 'Hoeveelheid invoeren',
    transferNotesPlaceholder: 'Notities voor overdracht...',
    stockTransferred: 'Voorraad overgebracht',
    transferFailed: 'Voorraadoverdracht mislukt',
    movementHistory: 'Mutatiegeschiedenis',
    movementType: 'Mutatietype',
    movementDetails: 'Mutatie details',
    quantityChange: 'Hoeveelheidsverandering',
    quantityBefore: 'Hoeveelheid voor',
    quantityAfter: 'Hoeveelheid na',
    reasonCode: 'Redencode',
    loadingMovements: 'Mutaties laden...',
    noMovementsFound: 'Geen mutaties gevonden',
    stockFilter: 'Voorraad filter',
    thresholds: 'Drempelwaarden',
    min: 'Min',
    max: 'Max',
    value: 'Waarde',
    lastMovement: 'Laatste mutatie',
    noMovements: 'Geen mutaties',
    viewHistory: 'Geschiedenis bekijken',
    overStockItems: 'Artikelen met overvoorraad',
    batchTrackingWarning: 'Dit product vereist batch tracking',
    cannotAdjustBatchTrackedProduct: 'Kan geen handmatige aanpassing doen voor batch-tracked product',
    redirectingToBatchManagement: 'Doorverwijzen naar batch beheer',
    
    // Quick Adjustment Dialog
    adjustmentType: 'Aanpassingstype',
    increase: 'Verhogen',
    decrease: 'Verlagen',
    setTo: 'Instellen op',
    quantityToAdd: 'Hoeveelheid toevoegen',
    quantityToRemove: 'Hoeveelheid verwijderen',
    newQuantity: 'Nieuwe hoeveelheid',
    preview: 'Voorbeeld',
    change: 'Verandering',
    reason: 'Reden',
    notes: 'Notities',
    notesPlaceholder: 'Optionele notities voor deze aanpassing...',
    errorUpdatingStock: 'Fout bij bijwerken voorraad',
    errorProductNotFound: 'Product, locatie of praktijk niet gevonden. Ververs de pagina en probeer opnieuw.',
    errorUpdateInProgress: 'Een andere update is bezig. Wacht even en probeer opnieuw.',
    errorInvalidData: 'Ongeldige gegevens. Controleer de invoer en probeer opnieuw.',
    errorNegativeStock: 'Negatieve voorraad is niet toegestaan voor dit product.',
    dataRefreshed: 'Gegevens ververst',
    stockUpdatedRealtime: 'Voorraad live bijgewerkt voor {product}',
    productInfoCard: 'Product informatie',
    productImageAlt: 'Productafbeelding voor {product}',
    productPrice: 'Prijs',
    euro: '€',
    selectProductTitle: 'Selecteer een product om de voorraad aan te passen',
    scanBarcodeTitle: 'Scan barcode van het product',
    adjustmentPreviewTitle: 'Bekijk de voorgestelde voorraadaanpassing',
    currentStockLevel: 'Huidige voorraadniveau',
    newStockLevel: 'Nieuwe voorraadniveau',
    stockDifference: 'Voorraadverschil',

    movement: {
      receipt: 'Ontvangst',
      usage: 'Gebruik',
      transfer: 'Overdracht',
      adjustment: 'Aanpassing',
      count: 'Telling',
      waste: 'Afval',
    },

    reasons: {
      normal_usage: 'Normaal gebruik',
      expired: 'Verlopen',
      damage: 'Beschadigd',
      damaged: 'Beschadigd',
      lost: 'Verloren',
      found: 'Gevonden',
      transfer_in: 'Overdracht in',
      transfer_out: 'Overdracht uit',
      adjustment: 'Aanpassing',
      recount: 'Hertelling',
      correction: 'Correctie',
      other: 'Anders',
      count_correction: 'Telling correctie',
    },

    // Stock Transfer Dialog
    stockTransfer: 'Voorraad Transfer',
    quantityToTransfer: 'Hoeveelheid om over te dragen',
    transferReason: 'Reden voor transfer',
    executeTransfer: 'Transfer uitvoeren',
    transferPreview: 'Transfer voorbeeld',
    remaining: 'resterend',
    newTotal: 'nieuw totaal',
    selectBatch: 'Selecteer batch',
    expiryDate: 'Vervaldatum',
    available: 'beschikbaar',
    expiresSoon: 'Vervalt binnenkort',
    expiresThisMonth: 'Vervalt deze maand',
    fresh: 'Vers',
    maxAvailable: 'Maximaal beschikbaar',
    
    // Transfer reasons
    locationRebalance: 'Locatie herbalancering',
    stockReplenishment: 'Voorraad aanvulling',
    emergencyTransfer: 'Spoed transfer',
    expiryManagement: 'Vervaldatum management',
    maintenanceRelocation: 'Onderhoud verplaatsing',

  },

  // Counting System
  counting: {
    title: 'Voorraadtelling',
    overview: 'Beheer je voorraadtellingsessies en volg voorraadnauwkeurigheid',
    sessionStatus: 'Sessie status',
    startSession: 'Tellingsessie starten',
    activeSession: 'Actieve tellingsessie',
    progress: 'Voortgang',
    sessionType: 'Sessietype',
    discrepancies: 'Discrepanties',
    continueSession: 'Sessie voortzetten',
    completeSession: 'Sessie voltooien',
    sessionsOverview: 'Tellingsessies overzicht',
    loadingSessions: 'Tellingsessies laden...',
    noSessionsFound: 'Geen tellingsessies gevonden',
    sessionName: 'Sessienaam',
    status: 'Status',
    sessionSummary: 'Sessie samenvatting',
    totalProducts: 'Totaal producten',
    countedProducts: 'Getelde producten',
    loadingSession: 'Tellingsessie laden...',
    sessionNotFound: 'Sessie niet gevonden',
    sessionNotFoundDescription: 'De tellingsessie die je zoekt kon niet worden gevonden',
    countingResults: 'Tellingsresultaten',
    viewResults: 'Bekijk tellingsresultaten en discrepanties',
    noResultsFound: 'Geen tellingsresultaten gevonden',
    product: 'Product',
    variance: 'Variantie',
    approveSession: 'Sessie goedkeuren',
  },

  // Batch Management
  batch: {
    batchManagement: 'Batchbeheer',
    manageBatchesSubtitle: 'Beheer je productbatches en vervaldatums effectief',
    title: 'Batchbeheer',
    batchNumber: 'Batchnummer',
    lotNumber: 'Lotnummer',
    supplierBatchNumber: 'Leverancier batchnummer',
    supplierBatch: 'Leverancier batch',
    expiryDate: 'Vervaldatum',
    houdbaarheidstot: 'Houdbaar tot',
    receivedDate: 'Ontvangstdatum',
    initialQuantity: 'Beginaantal',
    currentQuantity: 'Huidige hoeveelheid',
    availableQuantity: 'Beschikbare hoeveelheid',
    available: 'Beschikbaar',
    reservedQuantity: 'Gereserveerde hoeveelheid',
    batchStatus: 'Batch status',
    unitCost: 'Kostprijs per stuk',
    totalCost: 'Totale kosten',
    qualityCheck: 'Kwaliteitscontrole',
    qualityPassed: 'Kwaliteit goedgekeurd',
    qualityApproved: 'Kwaliteit goedgekeurd',
    qualityFailed: 'Kwaliteit afgekeurd',
    qualityNotes: 'Kwaliteitsnotities',
    quarantineUntil: 'Quarantaine tot',
    addBatch: 'Batch toevoegen',
    totalBatches: 'Totaal batches',
    expiringSoon: 'Binnenkort verlopend',
    activeBatches: 'Actieve batches',
    totalValue: 'Totale waarde',
    quickActions: 'Snelle acties',
    scanBatch: 'Scan batch',
    scanBatchSubtitle: 'Scan barcode om batch te vinden',
    viewExpiring: 'Bekijk verlopen',
    viewExpiringSubtitle: 'batches verlopen binnenkort',
    exportBatches: 'Exporteer batches',
    exportBatchesSubtitle: 'Download batch gegevens',
    criticalAlert: 'Kritieke waarschuwing',
    nearExpiry: 'Bijna verlopen',
    criticalExpiryText: 'Er zijn {count} batches die binnen 7 dagen verlopen',
    criticalBatchesFound: 'Er zijn {count} kritieke batches gevonden',
    viewCritical: 'Kritieke bekijken',
    manageExpiring: 'Verlopende beheren',
    fifoManagement: 'FIFO-beheer',
    fifoSubtitle: 'First In, First Out voorraadrotatie',
    useBatch: 'Batch gebruiken',
    registerBatch: 'Batch registreren',
    batchOverview: 'Batchoverzicht',
    overview: 'Overzicht',
    expiring: 'Verlopend',
    batchReports: 'Batchrapporten',
    reports: 'Rapporten',
    expiringBatches: 'Verlopende batches',
    batchHistory: 'Batchgeschiedenis',
    exportSuccess: 'Batches succesvol geëxporteerd',
    batchNotFound: 'Batch {batchNumber} niet gevonden',
    quarantine: 'Quarantaine',
    quarantineSuccess: 'Batch succesvol in quarantaine geplaatst',
    expiredDaysAgo: '{days} dagen geleden verlopen',
    expiresToday: 'Verloopt vandaag',
    expiresTomorrow: 'Verloopt morgen',
    expiresInDays: 'Verloopt over {days} dagen',
    fifoSuggestion: 'FIFO suggestie',
    generateFifoSuggestion: 'Genereer FIFO suggestie',
    fifoResults: 'FIFO Resultaten',
    noFifoResults: 'Geen FIFO resultaten beschikbaar',
    fifoSuggestionGenerated: 'FIFO suggestie succesvol gegenereerd',
    applyFifoSuggestion: 'FIFO suggestie toepassen',
    confirmFifoApplication: 'FIFO toepassing bevestigen',
    confirmFifoMessage: 'Weet je zeker dat je deze FIFO suggestie wilt toepassen?',
    fifoAppliedSuccessfully: 'FIFO suggestie succesvol toegepast',
    useQuantity: 'Gebruik hoeveelheid',
    selectReport: 'Selecteer rapport',
    generateReport: 'Genereer rapport',
    exportReport: 'Exporteer rapport',
    reportResults: 'Rapport resultaten',
    reportConfiguration: 'Rapport configuratie',
    reportGenerated: 'Rapport succesvol gegenereerd',
    reportExported: 'Rapport succesvol geëxporteerd',
    expiredBatches: 'Verlopen batches',
    expiryAnalysis: 'Vervaldatum analyse',
    expiryAnalysisDesc: 'Analyseer vervaldatums en urgentie van batches',
    batchUsage: 'Batch gebruik',
    batchUsageDesc: 'Bekijk hoe batches worden gebruikt',
    fifoCompliance: 'FIFO naleving',
    fifoComplianceDesc: 'Controleer FIFO naleving',
    batchCosts: 'Batch kosten',
    batchCostsDesc: 'Analyseer kosten per batch',
    batchDetails: 'Batch Details',
    batchInformation: 'Batch Informatie',
    quantityStatus: 'Hoeveelheid Status',
    expiryInformation: 'Vervaldatum Informatie',
    statusInformation: 'Status Informatie',
    costInformation: 'Kosten Informatie',
    currentValue: 'Huidige Waarde',
    quantityToUse: 'Te gebruiken hoeveelheid',
    usageReason: 'Gebruiksreden',
    usageNotes: 'Gebruiksnotities',
    usageNotesHint: 'Optionele notities voor dit gebruik',
    useAll: 'Alles Gebruiken',
    usageSummary: 'Gebruikssamenvatting',
    quantityUsed: 'Gebruikte Hoeveelheid',
    remainingQuantity: 'Resterende Hoeveelheid',
    costImpact: 'Kosten Impact',
    newStatus: 'Nieuwe Status',
    confirmUsage: 'Gebruik Bevestigen',
    purchaseInformation: 'Aankoop Informatie',
    purchaseOrderNumber: 'Inkoopordernummer',
    invoiceNumber: 'Factuurnummer',
    currency: 'Valuta',
    registerNewBatch: 'Nieuwe batch registreren',
    batchRegisteredSuccessfully: 'Batch succesvol geregistreerd',
    urgencyLevel: 'Urgentieniveau',
    expiryAlert: 'Vervalwaarschuwing',
    batchesExpiringSoon: '{count} batches verlopen binnenkort',
    noBatchesFound: 'Geen batches gevonden',
    noExpiringBatches: 'Geen verlopende batches',
    daysUntilExpiry: 'Dagen tot verval',
    filterByStatus: 'Filter op status',
    filterByExpiry: 'Filter op verval',
    showExpiring: 'Toon verlopende batches',
    showExpired: 'Toon verlopen batches',
    showActive: 'Toon actieve batches',
    requestedQuantity: 'Gevraagde Hoeveelheid',

    validation: {
      expiryDateInPast: 'Vervaldatum kan niet in het verleden liggen',
      exceededAvailable: 'Overschrijdt beschikbare hoeveelheid',
      mustBePositive: 'Moet een positieve waarde zijn',
    },

    urgency: {
      expired: 'Verlopen',
      critical: 'Kritiek',
      warning: 'Waarschuwing',
      normal: 'Normaal',
    },

    status: {
      available: 'Beschikbaar',
      reserved: 'Gereserveerd',
      expired: 'Verlopen',
      quarantine: 'Quarantaine',
      used: 'Gebruikt',
      active: 'Actief',
      inactive: 'Inactief',
    },

    usage: {
      consumption: 'Verbruik',
      expired: 'Verlopen',
      damaged: 'Beschadigd',
      transfer: 'Overdracht',
      adjustment: 'Aanpassing',
      other: 'Overig',
    },
  },

  // Products
  products: {
    title: 'Producten',
    subtitle: 'Beheer uw productcatalogus',
    name: 'Naam',
    sku: 'SKU',
    description: 'Beschrijving',
    category: 'Categorie',
    brand: 'Merk',
    unit: 'Eenheid',
    price: 'Prijs',
    barcode: 'Barcode',
    active: 'Actief',
    requiresBatchTracking: 'Vereist batchregistratie',
    gs1Information: 'GS1 informatie',
    gtinHint: 'Global Trade Item Number',
    gpcHint: 'Global Product Classification',
    countryOfOrigin: 'Land van herkomst',
    lifecycleStatus: 'Levenscyclus status',
    skuHint: 'Unieke productcode',
    barcodeHint: 'EAN/UPC barcode',
    scanBarcode: 'Scan barcode',
    createProduct: 'Product aanmaken',
    editProduct: 'Product bewerken',
    deleteProduct: 'Product verwijderen',
    deleteConfirm: 'Product verwijderen',
    deleteMessage: 'Weet je zeker dat je "{name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
    created: 'Product succesvol aangemaakt',
    updated: 'Product succesvol bijgewerkt', 
    deleted: 'Product "{name}" succesvol verwijderd',
    createError: 'Fout bij aanmaken van product',
    updateError: 'Fout bij bijwerken van product',
    deleteError: 'Fout bij verwijderen van product',
    units: {
      piece: 'Stuk',
      pack: 'Pak',
      box: 'Doos',
      bottle: 'Fles',
      tube: 'Tube',
      liter: 'Liter',
      kg: 'Kilogram',
      gram: 'Gram'
    },
    lifecycle: {
      active: 'Actief',
      discontinued: 'Uitgefaseerd',
      new: 'Nieuw',
      phaseOut: 'Wordt uitgefaseerd'
    }
  },

  // Products Page
  productsPage: {
    title: 'Producten',
    subtitle: 'Overzicht van alle beschikbare producten van Remka en externe leveranciers',

    table: {
      name: 'Naam',
      sku: 'SKU',
      description: 'Beschrijving',
      stockStatus: 'Voorraad Status',
      supplier: 'Leverancier',
      price: 'Prijs',
      actions: 'Acties',
      category: 'Categorie',
      currentStock: 'Huidige voorraad',
      lastUpdated: 'Laatst Bijgewerkt',
      batchStatus: 'Batch Status',
      gs1Status: 'GS1 Status',
    },

    searchPlaceholder: 'Zoek op naam, SKU of GTIN...',
    viewCart: 'Winkelwagen Bekijken',
    filterByCategory: 'Filter op categorie',
    filterBySupplier: 'Filter op leverancier',
    filterByStockStatus: 'Filter op voorraadstatus',
    sortBy: 'Sorteer op',
    clearFilters: 'Filters wissen',
    
    // GTIN Search
    gtinDetected: 'GTIN gedetecteerd',
    gtinSearchTooltip: 'Zoekt op GTIN barcode',
    gtinFound: 'GTIN gevonden: {product}',
    gtinSearching: 'Zoekt naar GTIN: {gtin}',
    gtinNotFound: 'GTIN niet gevonden: {gtin}',
    viewProduct: 'Product bekijken',

    // GS1 Badges
    badges: {
      gtin: 'GTIN',
      orderable: 'Bestelbaar',
      despatchable: 'Verzendbaar',
      noGS1: 'Geen GS1',
    },

    filters: {
      title: 'Filters',
      category: 'Categorie',
      stockStatus: 'Voorraad Status',
      supplier: 'Leverancier',
      priceRange: 'Prijsbereik',
      selectCategory: 'Selecteer categorie',
      selectStockStatus: 'Selecteer voorraadstatus',
      selectSupplier: 'Selecteer leverancier',
      minPrice: 'Min prijs',
      maxPrice: 'Max prijs',
      all: 'Alle',
      allCategories: 'Alle categorieën',
      allSuppliers: 'Alle leveranciers',
      remka: 'Remka',
      external: 'Externe leveranciers',
      // GS1 Filters
      gs1Filters: 'GS1 Filters',
      gtinPlaceholder: 'Zoek op GTIN...',
      selectCountry: 'Selecteer land van herkomst',
      selectGpc: 'Selecteer GPC categorie',
      selectLifecycle: 'Selecteer levenscyclus status',
      orderableOnly: 'Alleen bestelbare producten',
      scanGtin: 'Scan GTIN barcode',
    },

    stats: {
      totalProducts: 'Totaal producten',
      inStockProducts: 'Op Voorraad',
      lowStockProducts: 'Lage Voorraad',
      outOfStockProducts: 'Niet op voorraad',
      suppliersCount: 'Leveranciers',
      categoriesCount: 'Categorieën',
    },

    stockStatus: {
      in_stock: 'Op Voorraad',
      low_stock: 'Lage Voorraad',
      out_of_stock: 'Niet op voorraad',
      unavailable: 'Niet Beschikbaar',
    },

    batchStatus: {
      good: 'Goed',
      expiring: 'Binnenkort Verlopend',
      expired: 'Verlopen',
    },

    lifecycleStatus: {
      active: 'Actief',
      discontinued: 'Uitgefaseerd',
      new: 'Nieuw',
      phase_out: 'Uitfasering',
    },

    productDetails: 'Product details',
    description: 'Beschrijving',
    category: 'Categorie',
    unit: 'Eenheid',
    suppliers: 'Leveranciers',
    stockLevels: 'Voorraadniveaus',
    batches: 'batches',
    noBatches: 'Geen batches',
    bestPrice: 'Beste prijs',

    viewDetails: 'Details bekijken',
    addToCart: 'Toevoegen aan winkelwagen',
    addToOrderList: 'Toevoegen aan bestellijst',
    expandDetails: 'Details uitklappen',

    addedToCart: '{productName} toegevoegd aan winkelwagen',
    cartAddError: 'Fout bij toevoegen product aan winkelwagen',
    dataRefreshed: 'Gegevens succesvol vernieuwd',
    productLoadError: 'Fout bij laden producten',
    noProductsForFilter: 'Geen producten gevonden voor huidige filters',
    loadingProducts: 'Producten laden...',
    unknownGpc: 'Onbekende GPC categorie',

    details: {
      title: 'Productdetails',
      basicInfo: 'Basis informatie',
      stockInfo: 'Voorraad informatie',
      supplierInfo: 'Leverancier informatie',
      orderHistory: 'Bestelgeschiedenis',
      sku: 'SKU',
      name: 'Naam',
      description: 'Beschrijving',
      category: 'Categorie',
      brand: 'Merk',
      unit: 'Eenheid',
      price: 'Prijs',
      currentStock: 'Huidige voorraad',
      minimumStock: 'Minimum voorraad',
      locations: 'Voorraad Locaties',
      suppliers: 'Leveranciers',
      lastOrderDate: 'Laatste Besteldatum',
      averageOrderQuantity: 'Gemiddelde Bestelhoeveelheid',
      totalOrdered: 'Totaal Besteld',
      image: 'Product afbeelding',
      noImage: 'Geen afbeelding beschikbaar',
      
      // GS1 Fields
      gs1Info: 'GS1 informatie',
      gtin: 'GTIN',
      gpcBrickCode: 'GPC brick code',
      countryOfOrigin: 'Land van herkomst',
      lifecycleStatus: 'Levenscyclus Status',
      netContent: 'Netto Inhoud',
      weight: 'Gewicht',
      netWeight: 'Netto Gewicht',
      grossWeight: 'Bruto Gewicht',
      validityPeriod: 'Geldigheidsperiode',
      from: 'Van',
      to: 'Tot',
      unitIndicators: 'Eenheid Indicatoren',
      baseUnit: 'Basis Eenheid',
      orderable: 'Bestelbaar',
      despatchable: 'Verzendbaar',
      noDescription: 'Geen beschrijving beschikbaar',
      priceNotAvailable: 'Prijs niet beschikbaar',
    },
  },

  // Orders
  orders: {
    title: 'Bestellingen',
    export: 'Exporteren',
    createOrder: 'Bestelling aanmaken',
    analytics: 'Analyses',
    bulkExport: 'Geselecteerde exporteren',
    bulkEmail: 'Geselecteerde e-mailen',
    downloadPDF: 'PDF downloaden',
    downloadCSV: 'CSV downloaden',
    sendEmail: 'E-mail verzenden',
    submitToMagento: 'Verzenden naar Magento',
    duplicate: 'Dupliceren',
    cancel: 'Bestelling annuleren',
    
    // Table column headers
    orderNumber: 'Bestelnummer',
    orderDate: 'Besteldatum',
    supplier: 'Leverancier',
    totalAmount: 'Totaalbedrag',
    expectedDelivery: 'Verwachte levering',
    actions: 'Acties',

    status: {
      draft: 'Concept',
      submitted: 'Verzonden',
      confirmed: 'Bevestigd',
      shipped: 'Verzonden',
      delivered: 'Geleverd',
      cancelled: 'Geannuleerd',
    },

    filters: {
      title: 'Filters',
      status: 'Status',
      supplier: 'Leverancier',
      dateFrom: 'Vanaf datum',
      dateTo: 'Tot datum',
      allSuppliers: 'Alle leveranciers',
    },

    columns: {
      orderNumber: 'Bestelnummer',
      orderDate: 'Besteldatum',
      status: 'Status',
      supplier: 'Leverancier',
      totalItems: 'Artikelen',
      totalAmount: 'Totaal',
    },

    exportFormat: {
      csv: 'CSV formaat',
      pdf: 'PDF formaat',
    },

    exportScope: {
      all: 'Alle bestellingen',
      filtered: 'Gefilterde bestellingen',
      selected: 'Geselecteerde bestellingen',
    },

    email: {
      recipient: 'E-mailadres ontvanger',
      subject: 'Onderwerp',
      message: 'Bericht',
      send: 'E-mail verzenden',
    },

    notifications: {
      pdfDownloaded: 'PDF succesvol gedownload',
      csvDownloaded: 'CSV succesvol gedownload',
      emailSent: 'E-mail succesvol verzonden',
      magentoSubmitted: 'Bestelling verzonden naar Magento: {orderNumber}',
      orderCancelled: 'Bestelling succesvol geannuleerd',
      exportCompleted: 'Export voltooid: {count} bestellingen',
      pdfBulkNotSupported: 'PDF bulk export nog niet ondersteund',
      bulkEmailComingSoon: 'Bulk e-mail functie komt binnenkort',
    },

    errors: {
      loadFailed: 'Laden bestellingen mislukt',
      pdfFailed: 'PDF genereren mislukt',
      csvFailed: 'CSV genereren mislukt',
      emailFailed: 'E-mail verzenden mislukt',
      magentoFailed: 'Verzenden naar Magento mislukt',
      cancelFailed: 'Annuleren bestelling mislukt',
      exportFailed: 'Exporteren bestellingen mislukt',
      noOrdersToExport: 'Geen bestellingen om te exporteren',
      noPracticeSelected: 'Selecteer eerst een praktijk om bestellingen te bekijken',
    },

    exportFilteredNote: 'Exporteer {count} gefilterde bestellingen',
    exportSelectedNote: 'Exporteer {count} geselecteerde bestellingen',
    emailRequired: 'E-mail is verplicht',
    noPracticeSelected: 'Geen praktijk geselecteerd',
  },

  // Order Lists
  orderLists: {
    title: 'Orderlijsten',
    subtitle: 'Beheer uw inkooplijsten',
    create: 'Nieuwe orderlijst',
    edit: 'Bewerken',
    delete: 'Verwijderen',
    duplicate: 'Dupliceren',
    autoFill: 'Automatisch vullen',
    addToCart: 'Aan winkelwagen toevoegen',
    submit: 'Versturen',
    sendToSupplier: 'Naar leverancier versturen',
    submitConfirm: 'Orderlijst versturen',
    sendToSupplierConfirm: 'Naar leverancier versturen',
    submitMessage: 'Weet je zeker dat je "{name}" wilt versturen naar {supplier}?\n\nItems: {items}\nTotaalbedrag: {amount}',
    sendToSupplierMessage: 'Weet je zeker dat je "{name}" wilt versturen naar {supplier}?\n\nVerzendmethode: {method}',
    confirmSubmit: 'Ja, versturen',
    confirmSend: 'Versturen',
    submitted: 'Orderlijst "{name}" succesvol verstuurd',
    sentToSupplier: 'Orderlijst "{name}" succesvol verzonden naar leverancier via {method}',
    submitError: 'Fout bij versturen van orderlijst',
    sendError: 'Fout bij verzenden naar leverancier: {error}',
    viewSubmitted: 'Bekijk verstuurd',
    supplier: 'Leverancier',
    totalItems: 'Totaal items',
    totalAmount: 'Totaalbedrag',
    updatedAt: 'Bijgewerkt op',
    status: 'Status',
    draft: 'Concept',
    ready: 'Klaar',
    submittedStatus: 'Verstuurd',
    confirmed: 'Bevestigd',
    delivered: 'Geleverd',
    cancelled: 'Geannuleerd',
    noLists: 'Geen orderlijsten gevonden',
    createNew: 'Maak een nieuwe orderlijst om te beginnen',
    created: 'Orderlijst aangemaakt',
    updated: 'Orderlijst bijgewerkt',
    deleted: 'Orderlijst verwijderd',
    duplicated: 'Orderlijst gedupliceerd',
    addedToCart: 'Orderlijst toegevoegd aan winkelwagen',
    autoFilled: 'Orderlijst automatisch gevuld',
    saveError: 'Fout bij opslaan van orderlijst',
    deleteError: 'Fout bij verwijderen van orderlijst',
    cartError: 'Fout bij toevoegen aan winkelwagen',
    autoFillError: 'Fout bij automatisch vullen',
    loadError: 'Fout bij laden van orderlijsten',
    deleteDialog: 'Orderlijst verwijderen',
    deleteConfirm: 'Weet je zeker dat je deze orderlijst wilt verwijderen?',
    duplicateName: 'Kopie van {name}',
    // Dialog specific
    createDialog: 'Nieuwe orderlijst aanmaken',
    editDialog: 'Orderlijst bewerken',
    details: 'Details',
    selectProduct: 'Product selecteren',
    addProduct: 'Product toevoegen',
    quantity: 'Hoeveelheid',
    unitPrice: 'Stuksprijs',
    notes: 'Notities',
    selectSupplier: 'Leverancier selecteren',
    orderListName: 'Orderlijst naam',
    orderListNotes: 'Orderlijst notities',
    addToList: 'Toevoegen aan lijst',
    removeFromList: 'Verwijderen uit lijst'
  },

  // Locations
  locations: {
    title: 'Locaties',
    manage: 'Beheer opslaglocaties en magazijngebieden',
    add: 'Locatie toevoegen',
    edit: 'Locatie bewerken',
    delete: 'Locatie verwijderen',
    name: 'Locatienaam',
    description: 'Beschrijving',
    type: 'Locatietype',
    capacity: 'Capaciteit',
    sampleData: {
      mainWarehouse: {
        name: 'Hoofdmagazijn',
        type: 'Magazijn',
        description: 'Centraal opslagmagazijn',
      },
      pharmacy: {
        name: 'Apotheek opslag',
        type: 'Apotheek',
        description: 'Geneesmiddelen opslag',
      },
      treatmentRoom: {
        name: 'Behandelkamer A',
        type: 'Behandelkamer',
        description: 'Voorraad voor behandelkamer A',
      },
    },
    noLocations: 'Geen locaties gevonden',
    mainLocations: 'Hoofdlocaties',
    allLocations: 'Alle locaties',
    search: 'Locaties zoeken...',
    comingSoonDescription: 'Locatiebeheer functies komen binnenkort beschikbaar. Je zult verschillende opslaggebieden voor je voorraad kunnen aanmaken en beheren.',
    capacityItems: '{count} artikelen',
    samples: {
      emergencyStock: 'Spoedkast',
    },
  },

  // Stock Movements
  movements: {
    title: 'Voorraadmutaties',
    movementType: 'Mutatietype',
    quantityChange: 'Hoeveelheidsverandering',
    quantityBefore: 'Hoeveelheid voor',
    quantityAfter: 'Hoeveelheid na',
    performedBy: 'Uitgevoerd door',
    reasonCode: 'Redencode',

    count: 'Telling aanpassing',
    receipt: 'Voorraad ontvangst',
    usage: 'Voorraad gebruik',
    transfer: 'Voorraad overdracht',
    adjustment: 'Handmatige aanpassing',
    waste: 'Afval/verwijdering',

    normalUsage: 'Normaal gebruik',
    expired: 'Verlopen',
    damaged: 'Beschadigd',
    lost: 'Verloren',
    found: 'Gevonden',
    transferred: 'Overgedragen',
    corrected: 'Gecorrigeerd',
  },

  // Analytics
  analytics: {
    title: 'Analyses',
    subtitle: 'Uitgebreide rapporten en inzichten voor je voorraad',
    comingSoon: 'Binnenkort beschikbaar',
    comingSoonDescription: 'Geavanceerde analyses en rapportage functies worden binnenkort toegevoegd.',
    overview: 'Overzicht',
    trends: 'Trends',
    reports: 'Rapporten',
    insights: 'Inzichten',
    period: 'Periode',
    lastWeek: 'Vorige week',
    lastMonth: 'Vorige maand',
    lastQuarter: 'Vorig kwartaal',
    lastYear: 'Vorig jaar',
    stockTurnover: 'Voorraad omloop',
    orderFrequency: 'Bestelfrequentie',
    supplierPerformance: 'Leverancier prestaties',
    costAnalysis: 'Kostenanalyse',
    
    dashboard: 'Dashboard analyses',
    usage: 'Gebruik statistieken',
    patterns: 'Gebruikspatronen',
    
    events: {
      login: 'Inloggen',
      logout: 'Uitloggen',
      stock_update: 'Voorraad update',
      order_create: 'Bestelling aangemaakt',
      product_view: 'Product bekeken',
      batch_register: 'Batch geregistreerd',
    },

    metrics: {
      averageSession: 'Gemiddelde sessietijd',
      peakHours: 'Piekuren',
    },
  },

  // Offline Services
  offline: {
    title: 'Offline modus',
    
    data: {
      download: 'Offline data downloaden',
      downloadDescription: 'Download laatste data voor offline gebruik',
      lastDownload: 'Laatst gedownload',
      dataSize: 'Data grootte',
    },

    sync: {
      forceSync: 'Sync forceren',
      syncNow: 'Nu synchroniseren',
      autoSync: 'Automatisch synchroniseren',
      syncStatus: 'Sync status',
      lastSync: 'Laatste sync',
      pendingActions: 'Acties in afwachting',
    },

    messages: {
      syncCompleted: 'Synchronisatie voltooid',
      syncFailed: 'Synchronisatie mislukt',
      downloadCompleted: 'Download voltooid',
      downloadFailed: 'Download mislukt',
      offlineMode: 'Offline modus actief',
      onlineMode: 'Online modus actief',
    },

    errors: {
      syncFailed: 'Synchronisatie mislukt',
      downloadFailed: 'Download offline data mislukt',
      networkUnavailable: 'Netwerk niet beschikbaar',
    },
    
    newVersionAvailable: 'Een nieuwe versie van de app is beschikbaar. Wilt u nu herladen?',
  },

  // Exports
  exports: {
    title: 'Exports',
    subtitle: 'Data export en rapportage',
    selectFormat: 'Formaat selecteren',
    selectData: 'Data selecteren',
    generateExport: 'Export genereren',
    downloadExport: 'Export downloaden',
    
    formats: {
      csv: 'CSV bestand',
      pdf: 'PDF document',
      excel: 'Excel spreadsheet',
      json: 'JSON data',
    },

    dataTypes: {
      inventory: 'Voorraad data',
      orders: 'Bestellingen',
      suppliers: 'Leveranciers',
      analytics: 'Analyses',
      users: 'Gebruikers',
    },

    messages: {
      exportGenerated: 'Export succesvol gegenereerd',
      exportFailed: 'Export genereren mislukt',
      exportDownloaded: 'Export gedownload',
    },
  },

  // Analytics Page
  analyticsPage: {
    title: 'Analyses',
    subtitle: 'Uitgebreide rapporten en inzichten voor je voorraad',
    period: 'Periode',
    totalEvents: 'Totaal gebeurtenissen',
    activeUsers: 'Actieve gebruikers',
    totalOrders: 'Totaal bestellingen',
    productUpdates: 'Product updates',
    dailyActivity: 'Dagelijkse activiteit',
    topEvents: 'Top gebeurtenissen',
    frequentlyOrderedItems: 'Veel bestelde items',
    mostUpdatedProducts: 'Meest geüpdatet producten',
    userActivity: 'Gebruiker activiteit',
    export: 'Exporteren',
    
    periods: {
      '7d': 'Laatste 7 dagen',
      '30d': 'Laatste 30 dagen', 
      '90d': 'Laatste 90 dagen',
      '1y': 'Laatste jaar',
    },

    user: 'Gebruiker',
    activityCount: 'Activiteit aantal',
    lastActivity: 'Laatste activiteit',
    product: 'Product',
    totalQuantity: 'Totaal hoeveelheid',
    orderCount: 'Aantal bestellingen',
    updates: 'Updates',

    loadError: 'Fout bij laden analyse data',
    exportSuccess: 'Analyses succesvol geëxporteerd',
    exportError: 'Fout bij exporteren analyses',
  },

  // Settings
  settings: {
    title: 'Instellingen',
    subtitle: 'Configureer je systeem en voorkeuren',
    general: 'Algemeen',
    notifications: 'Meldingen',
    integrations: 'Integraties',
    users: 'Gebruikers',
    backup: 'Back-up',
    language: 'Taal',
    theme: 'Thema',
    timezone: 'Tijdzone',
    currency: 'Valuta',
    dateFormat: 'Datumformaat',
    timeFormat: 'Tijdformaat',
    emailNotifications: 'E-mail meldingen',
    pushNotifications: 'Push meldingen',
    stockAlerts: 'Voorraad waarschuwingen',
    orderAlerts: 'Bestel waarschuwingen',
    systemAlerts: 'Systeem waarschuwingen',
    save: 'Opslaan',
    saved: 'Instellingen opgeslagen',
    saveError: 'Fout bij opslaan instellingen',
    reset: 'Herstellen',
    resetToDefaults: 'Herstellen naar standaardwaarden',
    confirmReset: 'Weet je zeker dat je wilt herstellen naar standaardwaarden?',
    
    manageSettingsSubtitle: 'Beheer je systeeminstellingen en voorkeuren voor een optimale ervaring',
    profile: 'Profiel',
    profileSubtitle: 'Jouw persoonlijke gebruikersinformatie',
    appearanceTitle: 'Weergave',
    appearanceSubtitle: 'Personaliseer het uiterlijk van de applicatie',
    darkModeDescription: 'Schakel tussen lichte en donkere modus voor betere zichtbaarheid',
    selectLanguage: 'Kies je voorkeurstaal voor de interface',
    colorSchemeTitle: 'Kleurenschema',
    colorSchemeDescription: 'Selecteer het kleurenschema dat bij je voorkeur past',
    clinic: 'Kliniek',
    clinicInfoSubtitle: 'Contactgegevens en bedrijfsinformatie',
    contactSettingsNotice: 'Contactgegevens kunnen alleen worden aangepast door een beheerder',
    notificationSettingsSubtitle: 'Beheer je meldingen en alerts',
    stockAlertsLabel: 'Voorraad waarschuwingen',
    stockAlertsDescription: 'Ontvang meldingen wanneer voorraad laag is',
    emailNotificationsLabel: 'E-mail meldingen',
    emailNotificationsDescription: 'Belangrijke updates via e-mail ontvangen',

    browserNotificationsLabel: 'Browser meldingen',
    browserNotificationsDescription: 'Push meldingen in je browser',
    systemInfoTitle: 'Systeem informatie',
    systemInfoSubtitle: 'Versie-informatie en ondersteuning',
    versionLabel: 'Versie',
    lastUpdateLabel: 'Laatste update',
    supportLabel: 'Ondersteuning',
    languageChanged: 'Taal gewijzigd naar {language}',
    clinicName: 'Kliniek naam',
    contactEmail: 'Contact e-mail',
    phoneNumber: 'Telefoonnummer',
    address: 'Adres',
    role: 'Rol',
    darkModeEnabled: 'Donkere modus is ingeschakeld',
    lightModeEnabled: 'Lichte modus is ingeschakeld',
    settingsSaved: 'Instellingen succesvol opgeslagen',
    settingsSaveError: 'Een fout trad op bij het opslaan',
    saveSettings: 'Instellingen opslaan',

    styleGuideTitle: 'Remcura stijlgids',
    styleGuideSubtitle: 'Complete ontwerpsysteem referentie en component showcase',
    colorsSection: 'Kleuren',
    primaryColors: 'Primaire kleuren',
    neutralColors: 'Neutrale kleuren', 
    typographySection: 'Typografie',
    buttonsSection: 'Knoppen',
    solidButtons: 'Solide knoppen',
    outlinedButtons: 'Omlijnd knoppen',
    flatButtons: 'Vlakke knoppen',
    iconButtons: 'Icoon knoppen',
    cardsSection: 'Kaarten',

    primaryButton: 'Primair',
    secondaryButton: 'Secundair',
    successButton: 'Succes',
    warningButton: 'Waarschuwing',
    dangerButton: 'Gevaar',
    infoButton: 'Info',
    addProductButton: 'Product toevoegen',
    editButton: 'Bewerken',
    deleteButton: 'Verwijderen',
    saveButton: 'Opslaan',
    downloadButton: 'Downloaden',

    cards: {
      defaultCard: {
        title: 'Standaard kaart',
        subtitle: 'Standaard kaart voor algemene inhoud',
        description: 'Dit is de standaard kaart variant met standaard styling. Het gebruikt neutrale achtergronden die goed aanpassen aan lichte en donkere modi.',
        action: 'Actie',
      },
      modernCard: {
        title: 'Moderne kaart',
        subtitle: 'Verbeterde moderne styling met randen',
        description: 'Moderne kaart variant met verbeterde styling en subtiele randen voor een hedendaagse uitstraling.',
        action: 'Primaire actie',
      },
      elevatedCard: {
        title: 'Verhoogde kaart',
        subtitle: 'Kaart met verbeterde schaduw voor nadruk',
        description: 'Deze kaart heeft verhoogde styling met verbeterde schaduwen om diepte en hiërarchie te creëren.',
        action: 'Verhoogde actie',
      },
      glassCard: {
        title: 'Glas kaart',
        subtitle: 'Glas morfisme effect met transparantie',
        description: 'Glas morfisme kaart met achtergrond blur en transparantie effecten voor een moderne, verfijnde uitstraling.',
        action: 'Glas actie',
      },
      outlinedCard: {
        title: 'Omlijnd kaart',
        subtitle: 'Kaart met rand nadruk',
        description: 'Deze kaart gebruikt randen in plaats van schaduwen voor definitie, perfect voor minimale ontwerpen.',
        action: 'Omlijnd actie',
      },
      warningCard: {
        title: 'Waarschuwing kaart',
        subtitle: 'Kaart met waarschuwing kleur thema',
        description: 'Voorbeeld van het gebruik van header kleuren om thematische kaarten te maken voor verschillende soorten content.',
        action: 'Waarschuwing actie',
      },
    },
  },

  // Suppliers
  suppliers: {
    title: 'Leveranciers',
    name: 'Naam',
    contactEmail: 'Contact e-mail',
    contactPhone: 'Contact telefoon',
    website: 'Website',
    address: 'Adres',
    city: 'Stad',
    postalCode: 'Postcode',
    country: 'Land',
    status: 'Status',
    active: 'Actief',
    inactive: 'Inactief',
    notes: 'Notities',
    products: 'Producten',
    orders: 'Bestellingen',
    lastOrder: 'Laatste bestelling',
    totalOrders: 'Totaal bestellingen',
    averageDeliveryTime: 'Gemiddelde levertijd',
    reliability: 'Betrouwbaarheid',
    qualityRating: 'Kwaliteitsbeoordeling',
    priceCompetitiveness: 'Prijsconcurrentie',
    communicationRating: 'Communicatiebeoordeling',
    paymentTerms: 'Betalingsvoorwaarden',
    deliveryTerms: 'Leveringsvoorwaarden',
    minimumOrderAmount: 'Minimum bestelwaarde',
    leadTime: 'Levertijd',
    packSize: 'Verpakkingsgrootte',
    availability: 'Beschikbaarheid',
    backorderAllowed: 'Nabestelling toegestaan',
    addSupplier: 'Leverancier toevoegen',
    editSupplier: 'Leverancier bewerken',
    supplierDetails: 'Leverancier Details',
    supplierCode: 'Leverancier Code',
    contactPerson: 'Contactpersoon',
    paymentTermsDetailed: 'Betalingsvoorwaarden',
    minimumOrder: 'Minimum Bestelwaarde',
    shippingCost: 'Verzendkosten',
    freeShippingThreshold: 'Gratis verzending drempel',
    preferredOrderDay: 'Voorkeur besteldatum',
    orderCutoffTime: 'Bestel deadline',
    apiIntegration: 'API Integratie',
    syncEnabled: 'Sync Ingeschakeld',
    lastSyncTime: 'Laatste Sync',
    supplierProducts: 'Leverancier Producten',
    supplierSKU: 'Leverancier SKU',
    supplierName: 'Leverancier Naam',
    unitPrice: 'Eenheidsprijs',
    minimumOrderQty: 'Minimum Bestelhoeveelheid',
    leadTimeDays: 'Levertijd (dagen)',
  },

  // Admin
  admin: {
    title: 'Beheer',
    settings: 'Instellingen',
    audit: 'Audit log',
    users: 'Gebruikers',
    locations: 'Locaties',
    permissions: 'Rechten',
    analytics: 'Analyses',
    quickActions: 'Snelle acties',
    
    stats: {
      totalUsers: 'Totaal gebruikers',
      activeUsers: 'Actieve gebruikers',
      activeToday: 'actief vandaag',
      totalLocations: 'Totaal locaties',
      active: 'actief',
      pendingSync: 'In afwachting van sync',
      lastSync: 'Laatste sync',
      todayEvents: 'Gebeurtenissen vandaag',
      fromYesterday: 't.o.v. gisteren',
    },

    userManagement: {
      title: 'Gebruikersbeheer',
      invite: 'Gebruiker uitnodigen',
      email: 'E-mailadres',
      roles: 'Rollen',
      lastActive: 'Laatst actief',
      resetPassword: 'Wachtwoord resetten',
      activate: 'Activeren',
      deactivate: 'Deactiveren',
    },

    errors: {
      loadUsersFailed: 'Fout bij laden gebruikers',
      loadLocationsFailed: 'Fout bij laden locaties',
      loadPermissionsFailed: 'Fout bij laden rechten',
      
      // Common admin errors
      noPracticeSelected: 'Geen praktijk geselecteerd',
      practiceOrUserNotFound: 'Praktijk of gebruiker niet gevonden',
      userNotFoundInPractice: 'Gebruiker niet gevonden in praktijk',
      userEmailNotFound: 'Gebruiker e-mail niet gevonden',
      cannotDeactivatePracticeOwner: 'Kan praktijk eigenaar niet deactiveren',
      cannotDeleteMainLocation: 'Kan hoofdlocatie niet verwijderen',
      
      // Permission errors
      insufficientPermissionsToCreate: 'Onvoldoende rechten om te maken',
      insufficientPermissionsToUpdate: 'Onvoldoende rechten om bij te werken',
      insufficientPermissionsToDelete: 'Onvoldoende rechten om te verwijderen',
      insufficientPermissionsToView: 'Onvoldoende rechten om te bekijken',
      insufficientPermissionsToGrant: 'Onvoldoende rechten om rechten toe te kennen',
      insufficientPermissionsToRevoke: 'Onvoldoende rechten om rechten in te trekken',
      insufficientPermissionsToReset: 'Onvoldoende rechten om te resetten',
      insufficientPermissionsToToggle: 'Onvoldoende rechten om te wijzigen',
      
      // Operation errors
      failedToCreate: 'Aanmaken mislukt',
      failedToUpdate: 'Bijwerken mislukt',
      failedToDelete: 'Verwijderen mislukt',
      failedToGet: 'Ophalen mislukt',
      failedToGrant: 'Toekennen mislukt',
      failedToRevoke: 'Intrekken mislukt',
      failedToSend: 'Verzenden mislukt',
      failedToSet: 'Instellen mislukt',
    },
    
    // Team Management
    teamOverview: 'Team Overzicht',
    teamOverviewSubtitle: 'Beheer teamleden en hun toegangsmethoden',
    totalMembers: 'Totaal leden',
    onlineNow: 'Nu online',
    loadingTeam: 'Team laden...',
    noTeamMembers: 'Geen teamleden',
    noTeamMembersDescription: 'Er zijn nog geen teamleden uitgenodigd',
    viewProfile: 'Profiel bekijken',
    editMember: 'Lid bewerken',
    loginMethods: 'Inlogmethoden',
    magicCode: 'Magic Code',
    emailPassword: 'Email + Wachtwoord',
    deviceRemember: 'Apparaat Onthouden',
    trustedDevices: '{count} vertrouwde apparaten',
    lastLogin: 'Laatste login',
    loginCount: 'Aantal logins',
    preferredMethod: 'Voorkeur methode',
    sendMessage: 'Bericht sturen',
    viewSessions: 'Sessies bekijken',
    personalMagicCode: 'Persoonlijke Magic Code',
    magicCodeExplanation: 'Deze code kan gebruikt worden om direct in te loggen zonder wachtwoord',
    loadTeamError: 'Fout bij laden team',
    never: 'Nooit',
    minutesAgo: '{count} minuten geleden',
    hoursAgo: '{count} uur geleden',
    daysAgo: '{count} dagen geleden',
    confirmDeactivate: 'Lid deactiveren?',
    confirmActivate: 'Lid activeren?',
    confirmDeactivateMessage: 'Weet je zeker dat je {name} wilt deactiveren?',
    confirmActivateMessage: 'Weet je zeker dat je {name} wilt activeren?',
    deactivateSuccess: '{name} is gedeactiveerd',
    activateSuccess: '{name} is geactiveerd',
    statusChangeError: 'Fout bij wijzigen status',
    codeCopied: 'Code gekopieerd naar klembord',
    copyError: 'Fout bij kopiëren',
    magic_code: 'Magic Code',
    email_password: 'Email/Wachtwoord',
    device_token: 'Apparaat',
  },

  // Permissions
  permissions: {
    title: 'Rechten en toegang',
    user: 'Gebruiker',
    permissionType: 'Rechten type',
    resourceType: 'Resource type',
    expiresAt: 'Verloopt op',
    
    templates: {
      title: 'Rechten sjablonen',
      assistant: 'Assistent',
      manager: 'Manager',
      admin: 'Beheerder',
      owner: 'Eigenaar',
      viewer: 'Bekijker',
    },

    types: {
      read: 'Lezen',
      write: 'Schrijven',
      delete: 'Verwijderen',
      admin: 'Beheer',
    },

    notifications: {
      revoked: 'Rechten ingetrokken',
      granted: 'Rechten toegekend',
    },

    errors: {
      revokeFailed: 'Fout bij intrekken rechten',
      grantFailed: 'Fout bij toekennen rechten',
    },
  },

  // Locations - Enhanced
  locationsAdmin: {
    isMain: 'Hoofdlocatie',
    setAsMain: 'Instellen als hoofdlocatie',
    manageAccess: 'Toegang beheren',
    
    notifications: {
      mainLocationSet: 'Hoofdlocatie ingesteld',
      accessUpdated: 'Toegang bijgewerkt',
    },

    errors: {
      setMainFailed: 'Fout bij instellen hoofdlocatie',
      accessUpdateFailed: 'Fout bij bijwerken toegang',
    },
  },

  // Suppliers Page
  suppliersPage: {
    title: 'Leveranciers',
    subtitle: 'Beheer je leveranciers relaties en vendor informatie',
    searchSuppliers: 'Leveranciers zoeken...',
    filterByStatus: 'Filter op status',
    importSuppliers: 'Leveranciers importeren',
    addSupplier: 'Leverancier toevoegen',
    editSupplier: 'Leverancier bewerken',
    addNewSupplier: 'Nieuwe leverancier toevoegen',
    supplierName: 'Leverancier naam',
    contactEmail: 'Contact e-mail',
    contactPhone: 'Contact telefoon',
    website: 'Website',
    address: 'Adres',
    city: 'Stad',
    postalCode: 'Postcode',
    country: 'Land',
    magentoVendorId: 'Magento vendor ID',
    notes: 'Notities',
    activeSupplier: 'Actieve leverancier',
    contactInformation: 'Contact informatie',
    locationInfo: 'Locatie',
    magentoLink: 'Magento link',
    status: 'Status',
    actions: 'Acties',
    active: 'Actief',
    inactive: 'Inactief',
    notLinked: 'Niet gekoppeld',
    editSupplierTooltip: 'Leverancier bewerken',
    linkToMagentoTooltip: 'Koppelen aan Magento',
    deleteSupplierTooltip: 'Leverancier verwijderen',
    cancel: 'Annuleren',
    save: 'Opslaan',
    nameRequired: 'Naam is verplicht',
    linkToMagento: 'Koppelen aan Magento',
    linkToMagentoPrompt: 'Voer het Magento vendor ID in om deze leverancier te koppelen:',
    confirmDelete: 'Verwijderen bevestigen',
    confirmDeleteMessage: 'Weet je zeker dat je "{name}" wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
    supplierCreated: 'Leverancier succesvol aangemaakt',
    supplierUpdated: 'Leverancier succesvol bijgewerkt',
    supplierDeleted: 'Leverancier succesvol verwijderd',
    supplierLinkedToMagento: 'Leverancier succesvol gekoppeld aan Magento',
    loadError: 'Fout bij laden leveranciers',
    saveError: 'Fout bij opslaan leverancier',
    deleteError: 'Fout bij verwijderen leverancier',
    linkMagentoError: 'Fout bij koppelen leverancier aan Magento',
    importFeatureComingSoon: 'Import functie komt binnenkort!',
    
    // Nieuwe integratie velden
    integrationSettings: 'Integratie instellingen',
    integrationType: 'Integratie type',
    orderMethod: 'Bestel methode',
    autoSyncEnabled: 'Automatische synchronisatie',
    integrationStatus: 'Integratie status',
    lastSync: 'Laatste sync',
    neverSynced: 'Nooit gesynchroniseerd',
    autoSyncOn: 'Auto sync aan',
    autoSyncOff: 'Auto sync uit',
    configureIntegration: 'Integratie instellen',
    syncProducts: 'Producten synchroniseren',
    currentConfig: 'Huidige configuratie',
    autoSync: 'Auto synchronisatie',
    syncNow: 'Nu synchroniseren',
    editSettings: 'Instellingen bewerken',
    testConnection: 'Verbinding testen',
    manualIntegrationInfo: 'Handmatige integratie vereist geen configuratie. Bestellingen worden handmatig verwerkt.',
    orderEmail: 'Bestel e-mailadres',
    apiEndpoint: 'API endpoint',
    apiKey: 'API sleutel',
    ediEndpoint: 'EDI endpoint',
    ediPartnerId: 'EDI partner ID',
    testingConnection: 'Verbinding testen...',
    connectionSuccessful: 'Verbinding succesvol getest',
    connectionFailed: 'Verbinding testen mislukt: {error}',
    syncDisabledWarning: 'Synchronisatie is uitgeschakeld voor deze leverancier',
    syncSuccess: 'Producten succesvol gesynchroniseerd voor {name} ({count} producten)',
    syncFailed: 'Synchronisatie mislukt voor {name}: {error}',
    
    integrationTypes: {
      manual: 'Handmatig',
      email: 'E-mail',
      api: 'API',
      edi: 'EDI',
      magento: 'Magento'
    },
    
    orderMethods: {
      manual: 'Handmatig',
      email: 'E-mail',
      api: 'API',
      pdf: 'PDF'
    },
    
    // MISSING TABLE HEADERS (UNIQUE KEYS ONLY):
    name: 'Naam',
    phone: 'Telefoon'
  },

  // Notifications Page
  notificationsPage: {
    title: 'Meldingen',
    subtitle: 'Beheer je meldingen en waarschuwingsvoorkeuren',
    all: 'Alle',
    unread: 'Ongelezen',
    read: 'Gelezen',
    filterByCategory: 'Filter op categorie',
    markAllRead: 'Alles markeren als gelezen',
    settings: 'Instellingen',
    noNotifications: 'Geen meldingen',
    allCaughtUp: 'Je bent helemaal bij!',
    notificationStatistics: 'Melding statistieken',
    unreadCount: 'Ongelezen',
    total: 'Totaal',
    byCategory: 'Op categorie',
    quickActions: 'Snelle acties',
    testStockAlert: 'Test voorraad waarschuwing',
    testOrderUpdate: 'Test bestel update',
    clearAllNotifications: 'Alle meldingen wissen',
    markAsReadTooltip: 'Markeren als gelezen',
    deleteTooltip: 'Verwijderen',
    clearAllConfirm: 'Alle meldingen wissen',
    clearAllConfirmMessage: 'Weet je zeker dat je alle meldingen wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
    allMarkedAsRead: 'Alle meldingen gemarkeerd als gelezen',
    notificationDeleted: 'Melding verwijderd',
    allNotificationsCleared: 'Alle meldingen gewist',
    testStockAlertCreated: 'Test voorraad waarschuwing aangemaakt',
    testOrderUpdateCreated: 'Test bestel update aangemaakt',
    settingsFeatureComingSoon: 'Meldingen instellingen functie komt binnenkort!',
    loadNotificationsError: 'Fout bij laden meldingen',

    categories: {
      stockAlert: 'Voorraad waarschuwingen',
      orderUpdate: 'Bestel updates',
      systemNotification: 'Systeem meldingen',
      reminder: 'Herinneringen',
    },

    types: {
      stock_alert: 'voorraad waarschuwing',
      order_update: 'bestel update',
      system_notification: 'systeem melding',
      reminder: 'herinnering',
    },

    testMessages: {
      stockAlert: {
        title: 'Test Voorraad Waarschuwing',
        message: 'Dit is een test lage voorraad melding',
      },
      orderUpdate: {
        title: 'Test Bestel Update',
        message: 'Dit is een test bestel update melding',
      },
    },
  },

  // Messages for user feedback
  messages: {
    addToCartComingSoon: 'Functie toevoegen aan winkelwagen komt binnenkort',
    addAllSuggestionsComingSoon: 'Functie alle suggesties toevoegen komt binnenkort',
    cartCleared: 'Winkelwagen geleegd',
    cartSaved: 'Winkelwagen opgeslagen',
  },

  // Confirm dialog translations  
  dialogs: {
    typeToConfirm: 'Typ {text} om te bevestigen',
    confirmClose: 'Ben je zeker dat je wilt sluiten? Niet-opgeslagen wijzigingen gaan verloren.',
  },

  // Magic Invite System - Revolutionary user management! 🚀
  magicInvite: {
    revolutionaryUserSystem: 'Revolutionair Gebruikerssysteem',
    simpleTitle: 'Mensen uitnodigen',
    simpleDescription: 'Geef collega\'s instant toegang met een simpele code - geen wachtwoorden nodig!',
    howItWorks: 'Hoe werkt het?',
    stepCreate: 'Maak uitnodiging',
    stepCreateDetail: 'Klik hieronder om een unieke code te maken voor je collega',
    stepShare: 'Deel de code',
    stepShareDetail: 'Stuur de code via WhatsApp, e-mail, of gewoon mondeling',
    stepJoin: 'Direct toegang',
    stepJoinDetail: 'Je collega gaat naar remcura.com/join en voert de code in',
    
    createInvite: 'Nieuwe uitnodiging maken',
    whoAreYouInviting: 'Wie nodig je uit?',
    department: 'Afdeling (optioneel)',
    departmentPlaceholder: 'Bijv. Apotheek, Receptie, Behandeling',
    generateInviteCode: 'Maak uitnodigingscode',
    
    inviteReady: '✅ Uitnodiging klaar!',
    shareThisCode: 'Deel deze code:',
    tellThem: 'Vertel ze:',
    shareMessage: 'Ga naar remcura.com/join en voer deze code in: {code}',
    
    shareWhatsApp: 'WhatsApp',
    showQR: 'QR Code',
    shareEmail: 'E-mail',
    qrCode: 'QR Code',
    qrInstructions: 'Laat ze deze QR code scannen met hun telefoon',
    
    activeInvites: 'Actieve uitnodigingen',
    created: 'aangemaakt',
    
    doctorNurse: 'Dokter/Verpleegkundige',
    assistant: 'Assistent',
    admin: 'Beheerder',
    temporary: 'Tijdelijke toegang',
    
    inviteCreated: 'Uitnodiging gemaakt!',
    createError: 'Fout bij maken uitnodiging',
    codeCopied: 'Code gekopieerd naar klembord',
    deleteInvite: 'Uitnodiging verwijderen',
    deleteConfirm: 'Weet je zeker dat je code {code} wilt verwijderen?',
    inviteDeleted: 'Uitnodiging verwijderd',
    
    whatsappMessage: 'Hoi! Je bent uitgenodigd voor Remcura.\n\nGa naar: {url}\nVoer deze code in: {code}\n\nDan heb je direct toegang! 👍',
    emailSubject: 'Uitnodiging Remcura',
    emailMessage: 'Hoi!\n\nJe bent uitgenodigd om Remcura te gebruiken.\n\nStap 1: Ga naar {url}\nStap 2: Voer deze code in: {code}\n\nDan heb je meteen toegang tot het systeem!\n\nGroet',
  },

  magicJoin: {
    enterCode: 'Voer je magische code in',
    codeExplanation: 'Voer de code in die je hebt ontvangen om toegang te krijgen',
    placeholder: '🏥JOUWCODE2024',
    joinNow: 'Nu deelnemen',
    scanQR: 'QR-code scannen',
    tryDemo: 'Demo proberen',
    howItWorks: 'Hoe werkt het?',
    step1: 'Ontvang je code',
    step1Detail: 'Een teamlid stuurt je een unieke toegangscode',
    step2: 'Voer de code in',
    step2Detail: 'Type de code hier in of scan de QR-code',
    step3: 'Krijg toegang',
    step3Detail: 'Je krijgt direct toegang tot het systeem',
    scanTitle: 'QR-code scannen',
    scanInstructions: 'Richt je camera op de QR-code',
    welcomeTitle: 'Welkom!',
    welcomeMessage: 'Je hebt nu toegang tot {practice}',
    getStarted: 'Aan de slag',
    invalidCode: 'Ongeldige code. Controleer de code en probeer opnieuw.',
    expiredCode: 'Deze code is verlopen. Vraag een nieuwe code aan.',
    maxUsesReached: 'Deze code heeft het maximale aantal gebruikers bereikt.',
    validationError: 'Er ging iets mis bij het controleren van de code.',
    joinError: 'Er ging iets mis bij het deelnemen. Probeer opnieuw.',
    welcomeBack: 'Welkom terug, {name}!',
    personalCodeSuccess: 'Succesvol ingelogd met persoonlijke code',
    personalCodeError: 'Ongeldige persoonlijke code',
    permanentInviteDetected: 'Permanente uitnodiging gedetecteerd',
    guestAccessGranted: 'Gasttoegang verleend',
    demoAccess: 'Demo toegang'
  },

  // Auto-Upgrade System - Permanent Team Members
  upgrade: {
    welcomeToTeam: 'Welkom bij het team!',
    subtitle: 'Je bent uitgenodigd als {role} voor {practice}. Kies hoe je voortaan wilt inloggen:',
    benefit1: 'Permanente toegang tot het systeem',
    benefit2: 'Volledige functionaliteit beschikbaar',
    benefit3: 'Deel van het team voor dagelijks gebruik',
    
    // Magic Code Option
    magicCodeTitle: '⚡ Persoonlijke Code',
    magicCodeDescription: 'Krijg je eigen unieke code die je altijd kunt gebruiken',
    yourPersonalCode: 'Jouw persoonlijke code wordt:',
    magicBenefit1: 'Super snel inloggen',
    magicBenefit2: 'Makkelijk te onthouden',
    magicBenefit3: 'Werkt op elk apparaat',
    
    // Email + Password Option
    emailTitle: '🔐 Email + Wachtwoord',
    emailDescription: 'Traditioneel inloggen zoals je gewend bent',
    yourEmail: 'Je email adres',
    choosePassword: 'Kies een wachtwoord',
    emailBenefit1: 'Extra beveiligd',
    emailBenefit2: 'Bekend systeem',
    emailBenefit3: 'Wachtwoord herstel',
    
    // Device Remember Option
    deviceTitle: '📱 Onthoud Apparaat',
    deviceDescription: 'Blijf automatisch ingelogd op dit apparaat',
    deviceBenefit1: 'Automatisch inloggen',
    deviceBenefit2: 'Veilig per apparaat',
    deviceBenefit3: '90 dagen geldig',
    
    // Form & Actions
    yourFullName: 'Je volledige naam',
    nameRequired: 'Naam is verplicht',
    chooseThis: 'Kies deze optie',
    createAccount: 'Account aanmaken',
    stayGuest: 'Blijf gast (tijdelijk)',
    accountCreated: 'Account succesvol aangemaakt! Je kunt nu altijd inloggen.',
    createError: 'Fout bij aanmaken account',
    creatingAccount: 'Account wordt aangemaakt...',
    yourCodeIs: 'Je persoonlijke code is',
  },

  // === MISSING DUTCH TRANSLATIONS ===
  'productsPage.noProductsFound': 'Geen producten gevonden',
  'inventory.finalQuantity': 'Eind hoeveelheid',
  'inventory.refreshFailed': 'Verversen mislukt',
  'inventory.reason.normal_usage': 'Normaal gebruik',
  'inventory.reason.expired': 'Verlopen',
  'inventory.reason.damaged': 'Beschadigd',
  'inventory.reason.lost': 'Verloren',
  'inventory.reason.found': 'Gevonden',
  'inventory.reason.transfer_in': 'Overdracht in',
  'inventory.reason.transfer_out': 'Overdracht uit',
  'common.retry': 'Opnieuw proberen',



  // === CRITICAL MISSING TRANSLATIONS ===
  'retry': 'Opnieuw proberen',
      'assistantDashboard': 'Assistent dashboard',
    'managerDashboard': 'Manager dashboard',
    'ownerDashboard': 'Eigenaar dashboard',
    'orderSuggestions': 'Bestelling suggesties',
    'recentOrders': 'Recente bestellingen',
    'quickScan': 'Snelle scan',
    'analyticsOverview': 'Analyse overzicht',
    'businessOverview': 'Bedrijfs overzicht',
    'teamActivity': 'Team activiteit',
    'financialSummary': 'Financieel overzicht',
    'userManagement': 'Gebruikers beheer',
    'systemHealth': 'Systeem gezondheid',
    'scanProduct': 'Product scannen',
    'costAnalysis': 'Kosten analyse',
    'supplierPerformance': 'Leverancier prestaties',
    'createOrder': 'Bestelling maken',
  'noAlerts': 'Geen waarschuwingen',

  // Critical dashboard keys that were previously missing

  barcodeScanner: {
    title: 'Barcode scanner',
    subtitle: 'Scan product barcodes of GTINs',
    cameraPermission: 'Camera toegang vereist',
    permissionDescription: 'Geef toegang tot de camera om barcodes en GTINs te scannen',
    enableCamera: 'Camera inschakelen',
    error: 'Scanner fout',
    scanning: 'Scannen...',
    instructions: 'Plaats de barcode binnen het kader',
    manualInput: 'Handmatige invoer',
    enterBarcode: 'Voer barcode of GTIN handmatig in',
    manualInputHelp: 'Voer 8, 12, 13 of 14 cijfer GTIN codes in',
    switchCamera: 'Camera wisselen',
    flashOn: 'Flits aan',
    flashOff: 'Flits uit',
    validGtin: 'Geldige GTIN gescand: {gtin}',
    invalidFormat: 'Ongeldig barcode formaat: {code}',
    permissionDenied: 'Camera toegang geweigerd. Schakel camera toegang in via je browser instellingen.',
    noCameraFound: 'Geen camera gevonden. Zorg ervoor dat een camera is verbonden.',
    cameraError: 'Camera fout opgetreden. Probeer opnieuw.',
  },

  // === STAP 1: KRITIEKE USER-FACING KEYS ===

  // QuickAdjustment namespace (DIRECT ZICHTBAAR IN UI - HOGE PRIORITEIT)
  quickAdjustment: {
    noProduct: 'Geen product',
    title: 'Snelle voorraadaanpassing',
    selectProduct: 'Selecteer product',
    currentStock: 'Huidige voorraad',
    newQuantity: 'Nieuwe hoeveelheid',
    reason: 'Reden',
    notes: 'Opmerkingen',
    confirm: 'Bevestigen',
    success: 'Voorraad succesvol aangepast',
    error: 'Fout bij aanpassen voorraad'
  },

  // Time periods (DASHBOARD FILTERS - MEDIUM PRIORITEIT)
  '7d': 'Laatste 7 dagen',
  '30d': 'Laatste 30 dagen', 
  '90d': 'Laatste 90 dagen',
  '1y': 'Laatste jaar',

  // === STAP 2: MEDIUM PRIORITEIT KEYS ===

  // Brand/Basic missing keys (TOP LEVEL)
  name: 'Naam',
  edition: 'Professionele editie',  
  tagline: 'Professioneel medisch voorraadbeheer',
  defaultName: 'Standaard kliniek',
  professionalPlan: 'Professioneel plan',
  
  // Information key (clinic namespace extension)
  information: 'Informatie',

    'common.live': 'Live',

    'app.name': 'Remcura',

    'barcodeScanner.scanLabel': 'Scan product',

    'nav.dashboard': 'Dashboard',

    'nav.products': 'Producten',

    'nav.orders': 'Bestellingen',

    'barcodeScanner.enterBarcode': 'Voer barcode in',

    'exports.formats.excel': 'Excel (.xlsx)',

    'exports.formats.csv': 'CSV (.csv)',

    'exports.formats.pdf': 'PDF (.pdf)',

    'settings.languages.dutch': 'Nederlands',

    'settings.languages.english': 'Engels',

    'settings.languages.spanish': 'Spaans',

    'dashboard.widgets.teamMembers': 'Team leden',

    'dashboard.widgets.systemStatus': 'Systeem status',

      'currencies.eur': 'EUR (€)',
  'currencies.usd': 'USD ($)',
  'currencies.gbp': 'GBP (£)',

    'productsPage.title': 'Producten',

    'productsPage.subtitle': 'Beheer je productcatalogus en voorraad',

    'common.refresh': 'Verversen',

    'products.createProduct': 'Product toevoegen',

    'productsPage.viewCart': 'Winkelwagen bekijken',

    'productsPage.noGs1Data': 'Geen GS1 data beschikbaar',

    'productsPage.viewDetails': 'Details bekijken',

    'products.editProduct': 'Product bewerken',

    'products.deleteProduct': 'Product verwijderen',

    'productsPage.addToCart': 'Toevoegen aan winkelwagen',

    'productsPage.addToOrderList': 'Toevoegen aan bestellijst',

    'productsPage.productDetails': 'Product details',

    'productsPage.description': 'Beschrijving',

    'productsPage.unit': 'Eenheid',

    'productsPage.category': 'Categorie',

    'productsPage.gs1Information': 'GS1 informatie',

    'productsPage.lifecycle': 'Levenscyclus',

    'productsPage.suppliers': 'Leveranciers',

    'productsPage.stockLevels': 'Voorraadniveaus',

    'products.deleteConfirm': 'Product verwijderen',

    'common.cancel': 'Annuleren',

    'common.delete': 'Verwijderen',

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

    

    'common.close': 'Close',

    'orderLists.title': 'Bestellijsten',

    'orderLists.subtitle': 'Beheer je bestellijsten en verzend naar leveranciers',

    'orderLists.create': 'Nieuwe bestellijst',

    'orderLists.supplier': 'Leverancier',

    'orderLists.totalItems': 'Totaal items',

    'orderLists.totalAmount': 'Totaalbedrag',

    'orderLists.updatedAt': 'Bijgewerkt op',

    'orderLists.edit': 'Bewerken',

    'orderLists.submit': 'Verzenden',

    'orderLists.sendToSupplier': 'Naar leverancier sturen',

    'orderLists.addToCart': 'Toevoegen aan winkelwagen',

    'orderLists.duplicate': 'Dupliceren',

    'orderLists.autoFill': 'Automatisch vullen',

    'orderLists.delete': 'Verwijderen',

    'orderLists.noLists': 'Geen bestellijsten gevonden',

    'orderLists.createNew': 'Maak je eerste bestellijst aan',

    'orderLists.deleteDialog': 'Bestellijst verwijderen',

    'orderLists.deleteConfirm': 'Weet je zeker dat je deze bestellijst wilt verwijderen?',

    'inventory.stockLevels': 'Voorraadniveaus',

    'inventory.overview': 'Overzicht',

    'inventory.totalProducts': 'Totaal producten',

    'inventory.products': 'Producten',

    'inventory.stockLocations': 'Voorraadlocaties',

    'inventory.activeLocations': 'Actieve locaties',

    'inventory.locations': 'Locaties',

    'inventory.dataLoaded': 'Data geladen',

    'inventory.upToDate': 'Up-to-date',

    'inventory.realTimeConnected': 'Real-time verbonden',

    'inventory.status': 'Status',

    'inventory.lastUpdated': 'Laatst bijgewerkt',

    'inventory.refreshData': 'Data verversen',

    'inventory.lastSync': 'Laatste sync',

    'inventory.noStockLevels': 'Geen voorraadniveaus gevonden',

    'inventory.adjustStock': 'Voorraad aanpassen',

    'inventory.viewHistory': 'Geschiedenis bekijken',

    'inventory.countStock': 'Voorraad tellen',

    'inventory.currentStock': 'Huidige voorraad',

    'inventory.adjustmentType': 'Aanpassingstype',

    'inventory.quantity': 'Hoeveelheid',

    'validation.required': 'Dit veld is verplicht',

    'inventory.reason': 'Reden',

    'inventory.adjust': 'Aanpassen',

    'counting.title': 'Voorraadtelling',

    'counting.overview': 'Overzicht van tellingsessies',

    'counting.sessionStatus': 'Sessie status',

    'counting.startSession': 'Nieuwe sessie starten',

    'counting.activeSession': 'Actieve sessie',

    'counting.progress': 'Voortgang',

    'counting.sessionType': 'Sessie type',

    'common.startedAt': 'Gestart op',

    'counting.discrepancies': 'Afwijkingen',

    'counting.continueSession': 'Sessie voortzetten',

    'counting.completeSession': 'Sessie voltooien',

    'counting.sessionsOverview': 'Sessies overzicht',

    'counting.loadingSessions': 'Sessies laden...',

    'counting.noSessionsFound': 'Geen sessies gevonden',

    'common.view': 'Bekijken',

    'counting.approveSession': 'Sessie goedkeuren',

    'counting.loadingSession': 'Sessie laden...',

    'counting.sessionNotFound': 'Sessie niet gevonden',

    'counting.sessionNotFoundDescription': 'De gevraagde sessie bestaat niet of is verwijderd',

    'common.goBack': 'Terug',

    'counting.sessionSummary': 'Sessie samenvatting',

    'counting.totalProducts': 'Totaal producten',

    'counting.countedProducts': 'Getelde producten',

    'common.completedAt': 'Voltooid op',

    'counting.countingResults': 'Telresultaten',

    'counting.viewResults': 'Bekijk de resultaten van deze telling',

    'counting.noResultsFound': 'Geen resultaten gevonden',

    'locations.title': 'Locaties',

    'locations.manage': 'Beheer locaties',

    'locations.allLocations': 'Alle locaties',

    'locations.mainLocations': 'Hoofdlocaties',

    'locations.comingSoonDescription': 'Locatiebeheer komt binnenkort beschikbaar',

    'locations.add': 'Locatie toevoegen',

    'locations.noLocations': 'Geen locaties gevonden',

    'inventory.stockMovements': 'Voorraadmutaties',

    'inventory.movementHistory': 'Mutatiegeschiedenis',

    'common.export': 'Exporteren',

    'inventory.loadingMovements': 'Mutaties laden...',

    'inventory.noMovementsFound': 'Geen mutaties gevonden',

    'common.unknownProduct': 'Onbekend product',

    'common.unknownLocation': 'Onbekende locatie',

    'inventory.movementDetails': 'Mutatiedetails',

    'inventory.movementType': 'Mutatietype',

    'inventory.product': 'Product',

    'common.noSku': 'Geen SKU',

    'inventory.location': 'Locatie',

    'inventory.quantityChange': 'Hoeveelheidswijziging',

    'inventory.quantityBefore': 'Hoeveelheid voor',

    'inventory.quantityAfter': 'Hoeveelheid na',

    'inventory.reasonCode': 'Redencode',

    'common.notes': 'Opmerkingen',

    'common.date': 'Datum',

    'inventory.minimumStock': 'Minimum voorraad',

    'productsPage.table.stockType': 'Voorraadtype',

    'orderLists.searchPlaceholder': 'Zoek bestellijsten...',

    'orderLists.dateRange': 'Datumbereik',

    'orderLists.amountRange': 'Bedragbereik',

    'orderLists.onlyWithItems': 'Alleen met items',

    'filters.search.placeholder': 'Zoeken...',

    'filters.location.label': 'Locatie',

    'filters.category.label': 'Categorie',

    'filters.status.label': 'Status',

    'demo.resetData': 'ResetData',

    'demo.limitations': 'Limitations',

    'demo.practice': 'Practice',

    'demo.practiceDescription': 'PracticeDescription',

    'demo.limitationsText': 'LimitationsText',

    'demo.resetInfo': 'ResetInfo',

    'demoresetc.resetfailed': 'Resetfailed',

    'demo.onlyDemoUserCanReset': 'OnlyDemoUserCanReset',

    'demo.resetDataConfirm': 'ResetDataConfirm',

    'demo.resetDataSuccess': 'ResetDataSuccess',

    'demo.resetDataError': 'ResetDataError',

    'magicInvite.simpleTitle': 'SimpleTitle',

    'magicInvite.simpleDescription': 'SimpleDescription',

    'magicInvite.howItWorks': 'HowItWorks',

    'magicInvite.stepCreate': 'StepCreate',

    'magicInvite.stepCreateDetail': 'StepCreateDetail',

    'magicInvite.stepShare': 'StepShare',

    'magicInvite.stepShareDetail': 'StepShareDetail',

    'magicInvite.stepJoin': 'StepJoin',

    'magicInvite.stepJoinDetail': 'StepJoinDetail',

    'magicInvite.createInvite': 'CreateInvite',

    'magicInvite.whoAreYouInviting': 'WhoAreYouInviting',

    'magicInvite.department': 'Department',

    'magicInvite.departmentPlaceholder': 'DepartmentPlaceholder',

    'magicInvite.generateInviteCode': 'GenerateInviteCode',

    'magicInvite.inviteReady': 'InviteReady',

    'magicInvite.shareThisCode': 'ShareThisCode',

    'common.copy': 'Kopiëren',

    'magicInvite.tellThem': 'TellThem',

    'magicInvite.shareWhatsApp': 'ShareWhatsApp',

    'magicInvite.showQR': 'ShowQR',

    'magicInvite.shareEmail': 'ShareEmail',

    'magicInvite.activeInvites': 'ActiveInvites',

    'magicInvite.created': 'Created',

    'common.share': 'Delen',

    'magicInvite.qrCode': 'QrCode',

    'magicInvite.qrInstructions': 'QrInstructions',

    'magicInvite.doctorNurse': 'DoctorNurse',

    'magicInvite.assistant': 'Assistant',

    'magicInvite.admin': 'Admin',

    'magicInvite.temporary': 'Temporary',

    'magicInvite.inviteCreated': 'InviteCreated',

    'magicInvite.createError': 'CreateError',

    'magicInvite.codeCopied': 'CodeCopied',

    'magicInvite.emailSubject': 'EmailSubject',

    'magicInvite.deleteInvite': 'DeleteInvite',

    'magicInvite.inviteDeleted': 'InviteDeleted',

    'magicInvite.shareMessage': 'ShareMessage',

    'admin.teamOverview': 'TeamOverview',

    'admin.teamOverviewSubtitle': 'Titel',

    'admin.totalMembers': 'TotalMembers',

    'admin.onlineNow': 'OnlineNow',

    'admin.loadingTeam': 'Laden...',

    'admin.noTeamMembers': 'NoTeamMembers',

    'admin.noTeamMembersDescription': 'NoTeamMembersDescription',

    'admin.viewProfile': 'ViewProfile',

    'admin.editMember': 'EditMember',

    'admin.deactivate': 'Deactivate',

    'admin.activate': 'Activate',

    'admin.loginMethods': 'LoginMethods',

    'admin.magicCode': 'MagicCode',

    'admin.emailPassword': 'EmailPassword',

    'admin.deviceRemember': 'DeviceRemember',

    'admin.lastLogin': 'LastLogin',

    'admin.loginCount': 'LoginCount',

    'admin.preferredMethod': 'PreferredMethod',

    'admin.sendMessage': 'SendMessage',

    'admin.viewSessions': 'ViewSessions',

    'admin.personalMagicCode': 'PersonalMagicCode',

    'admin.magicCodeExplanation': 'MagicCodeExplanation',

    'admin.loadTeamError': 'LoadTeamError',

    'admin.never': 'Never',

    'admin.statusChangeError': 'StatusChangeError',

    'admin.codeCopied': 'CodeCopied',

    'admin.copyError': 'CopyError',

    'admin.trustedDevices': 'TrustedDevices',

    'upgrade.welcomeToTeam': 'WelcomeToTeam',

    'upgrade.benefit1': 'Benefit1',

    'upgrade.benefit2': 'Benefit2',

    'upgrade.benefit3': 'Benefit3',

    'upgrade.magicCodeTitle': 'MagicCodeTitle',

    'upgrade.magicCodeDescription': 'MagicCodeDescription',

    'upgrade.yourPersonalCode': 'YourPersonalCode',

    'upgrade.magicBenefit1': 'MagicBenefit1',

    'upgrade.magicBenefit2': 'MagicBenefit2',

    'upgrade.magicBenefit3': 'MagicBenefit3',

    'upgrade.chooseThis': 'ChooseThis',

    'upgrade.emailTitle': 'EmailTitle',

    'upgrade.emailDescription': 'EmailDescription',

    'upgrade.yourEmail': 'YourEmail',

    'upgrade.choosePassword': 'ChoosePassword',

    'upgrade.emailBenefit1': 'EmailBenefit1',

    'upgrade.emailBenefit2': 'EmailBenefit2',

    'upgrade.emailBenefit3': 'EmailBenefit3',

    'upgrade.deviceTitle': 'DeviceTitle',

    'upgrade.deviceDescription': 'DeviceDescription',

    'upgrade.deviceBenefit1': 'DeviceBenefit1',

    'upgrade.deviceBenefit2': 'DeviceBenefit2',

    'upgrade.deviceBenefit3': 'DeviceBenefit3',

    'upgrade.yourFullName': 'YourFullName',

    'upgrade.nameRequired': 'NameRequired',

    'upgrade.createAccount': 'CreateAccount',

    'upgrade.stayGuest': 'StayGuest',

    'upgrade.accountCreated': 'AccountCreated',

    'upgrade.createError': 'CreateError',

    'upgrade.subtitle': 'Ondertitel',

    'barcodeScanner.title': 'Titel',

    'barcodeScanner.subtitle': 'Ondertitel',

    'barcodeScanner.cameraPermission': 'CameraPermission',

    'barcodeScanner.permissionDescription': 'PermissionDescription',

    'barcodeScanner.error': 'Fout',

    'barcodeScanner.scanning': 'Scanning',

    'barcodeScanner.instructions': 'Instructions',

    'barcodeScanner.manualInputHelp': 'ManualInputHelp',

    'barcodeScanner.permissionDenied': 'PermissionDenied',

    'barcodeScanner.noCameraFound': 'NoCameraFound',

    'barcodeScanner.cameraError': 'CameraError',

    'common.closeDialog': 'Dialoog',

    'common.confirm': 'Bevestigen',

    'validation.formErrors': 'Dit veld is verplicht',

    'common.reset': 'Resetten',

    'common.save': 'Opslaan',

    'common.confirmClose': 'ConfirmClose',

    'batch.batchDetails': 'BatchDetails',

    'batch.batchInformation': 'BatchInformation',

    'batch.quantityStatus': 'QuantityStatus',

    'batch.initialQuantity': 'InitialQuantity',

    'batch.currentQuantity': 'CurrentQuantity',

    'batch.availableQuantity': 'AvailableQuantity',

    'batch.reservedQuantity': 'ReservedQuantity',

    'batch.expiryInformation': 'ExpiryInformation',

    'batch.receivedDate': 'ReceivedDate',

    'batch.statusInformation': 'StatusInformation',

    'batch.qualityApproved': 'QualityApproved',

    'batch.quarantineUntil': 'QuarantineUntil',

    'batch.costInformation': 'CostInformation',

    'batch.unitCost': 'UnitCost',

    'batch.totalCost': 'TotalCost',

    'batch.currentValue': 'CurrentValue',

    'batch.purchaseInformation': 'PurchaseInformation',

    'batch.purchaseOrderNumber': 'PurchaseOrderNumber',

    'batch.invoiceNumber': 'InvoiceNumber',

    'batch.qualityNotes': 'QualityNotes',

    'batch.useBatch': 'UseBatch',

    'batch.quarantine': 'Quarantine',

    'common.edit': 'Bewerken',

    'batch.expiresToday': 'ExpiresToday',

    'batch.expiresTomorrow': 'ExpiresTomorrow',

    'batch.quarantineSuccess': 'QuarantineSuccess',

    'errors.failed': 'Failed',

    'batch.batchOverview': 'BatchOverview',

    'location.location': 'Locatie',

    'batch.urgencyLevel': 'UrgencyLevel',

    'batch.addBatch': 'AddBatch',

    'batch.expiryAlert': 'ExpiryAlert',

    'batch.viewExpiring': 'ViewExpiring',

    'batch.noBatchesFound': 'NoBatchesFound',

    'batch.supplierBatch': 'SupplierBatch',

    'batch.available': 'Available',

    'common.moreActions': 'MoreActions',

    'batchoverv.noclinicidavailable': 'Noclinicidavailable',

    'product.product': 'Product',

    'batch.batchNumber': 'BatchNumber',

    'batch.expiryDate': 'ExpiryDate',

    'common.status': 'Status',

    'common.actions': 'Actions',

    'common.all': 'All',

    'batch.urgency.expired': 'Expired',

    'batch.urgency.critical': 'Critical',

    'batch.urgency.warning': 'Waarschuwing',

    'batch.urgency.normal': 'Normal',

    'errors.failedToLoadData': 'FailedToLoadData',

    'batch.batchesExpiringSoon': 'BatchesExpiringSoon',

    'batch.registerNewBatch': 'RegisterNewBatch',

    'batch.supplierBatchNumber': 'SupplierBatchNumber',

    'batch.currency': 'Currency',

    'batch.registerBatch': 'RegisterBatch',

    'location.sampleData.mainWarehouse.name': 'Naam',

    'location.samples.emergencyStock': 'EmergencyStock',

    'location.sampleData.treatmentRoom.name': 'Naam',

    'batch.validation.expiryDateInPast': 'Dit veld is verplicht',

    'batch.batchRegisteredSuccessfully': 'BatchRegisteredSuccessfully',

    'errors.failedToRegisterBatch': 'FailedToRegisterBatch',

    'validation.minLength': 'Dit veld is verplicht',

    'batch.selectReport': 'SelectReport',

    'common.fromDate': 'FromDate',

    'common.toDate': 'ToDate',

    'batch.generateReport': 'GenerateReport',

    'batch.exportReport': 'ExportReport',

    'batch.reportResults': 'ReportResults',

    'batch.totalBatches': 'TotalBatches',

    'batch.expiredBatches': 'ExpiredBatches',

    'batch.expiringSoon': 'ExpiringSoon',

    'batch.totalValue': 'TotalValue',

    'batch.expiryAnalysis': 'ExpiryAnalysis',

    'batch.expiryAnalysisDesc': 'ExpiryAnalysisDesc',

    'batch.batchUsage': 'BatchUsage',

    'batch.batchUsageDesc': 'BatchUsageDesc',

    'batch.fifoCompliance': 'FifoCompliance',

    'batch.fifoComplianceDesc': 'FifoComplianceDesc',

    'batch.batchCosts': 'BatchCosts',

    'batch.batchCostsDesc': 'BatchCostsDesc',

    'common.allLocations': 'AllLocations',

    'common.allStatuses': 'AllStatuses',

    'batch.status.active': 'Actief',

    'batch.status.expired': 'Expired',

    'batch.status.depleted': 'Depleted',

    'batch.daysUntilExpiry': 'DaysUntilExpiry',

    'batch.reportConfiguration': 'ReportConfiguration',

    'batch.reportGenerated': 'ReportGenerated',

    'errors.failedToGenerateReport': 'FailedToGenerateReport',

    'batch.reportExported': 'ReportExported',

    'dashboard.alerts.noWarnings': 'NoWarnings',

    'dashboard.alerts.allStockLevelsOk': 'AllStockLevelsOk',

    'dashboard.quickActionLabels.scan': 'Scan',

    'dashboard.quickActionLabels.order': 'Bestelling',

    'dashboard.quickActionLabels.update': 'Bijwerken',

    'dashboard.quickActionLabels.export': 'Exporteren',

    'dashboard.quickActionLabels.default': 'Default',

    'quickactio.warning': 'Waarschuwing',

    'batch.noExpiringBatches': 'NoExpiringBatches',

    'batch.fifoSuggestion': 'FifoSuggestion',

    'batch.requestedQuantity': 'RequestedQuantity',

    'validation.mustBePositive': 'Dit veld is verplicht',

    'batch.generateFifoSuggestion': 'GenerateFifoSuggestion',

    'batch.fifoResults': 'FifoResults',

    'batch.noFifoResults': 'NoFifoResults',

    'batch.useQuantity': 'UseQuantity',

    'batch.applyFifoSuggestion': 'ApplyFifoSuggestion',

    'product.samples.syringeBD': 'SyringeBD',

    'product.samples.needleBD': 'NeedleBD',

    'batch.fifoSuggestionGenerated': 'FifoSuggestionGenerated',

    'errors.failedToGenerateSuggestion': 'FailedToGenerateSuggestion',

    'batch.confirmFifoApplication': 'ConfirmFifoApplication',

    'batch.confirmFifoMessage': 'ConfirmFifoMessage',

    'batch.fifoAppliedSuccessfully': 'FifoAppliedSuccessfully',

    'filters.filterPanel.filtersButton': 'Knop',

    'filters.filterPanel.clearAllFilters': 'ClearAllFilters',

    'inventory.startCountingSession': 'StartCountingSession',

    'inventory.sessionName': 'SessionName',

    'inventory.sessionNamePlaceholder': 'SessionNamePlaceholder',

    'inventory.sessionType': 'SessionType',

    'inventory.selectLocations': 'SelectLocations',

    'inventory.allowNegativeCounts': 'AllowNegativeCounts',

    'inventory.requireApproval': 'RequireApproval',

    'inventory.autoAdjustStock': 'AutoAdjustStock',

    'inventory.sessionNotesPlaceholder': 'SessionNotesPlaceholder',

    'inventory.startCounting': 'StartCounting',

    'inventory.partialCount': 'PartialCount',

    'inventory.partialCountDescription': 'PartialCountDescription',

    'inventory.fullCount': 'FullCount',

    'inventory.fullCountDescription': 'FullCountDescription',

    'inventory.spotCheck': 'SpotCheck',

    'inventory.spotCheckDescription': 'SpotCheckDescription',

    'inventory.cycleCount': 'CycleCount',

    'inventory.cycleCountDescription': 'CycleCountDescription',

    'inventory.sessionCreated': 'SessionCreated',

    'inventory.sessionCreationFailed': 'SessionCreationFailed',

    'counting.productsCompleted': 'ProductsCompleted',

    'products.sku': 'SKU',

    'counting.systemQuantity': 'SystemQuantity',

    'counting.countedQuantity': 'CountedQuantity',

    'counting.additionalOptions': 'AdditionalOptions',

    'counting.batchNumber': 'BatchNumber',

    'counting.expiryDate': 'ExpiryDate',

    'counting.confidenceLevel': 'ConfidenceLevel',

    'counting.skipProduct': 'SkipProduct',

    'counting.confirmCount': 'ConfirmCount',

    'counting.allProductsCounted': 'AllProductsCounted',

    'counting.readyToComplete': 'ReadyToComplete',

    'common.loading': 'Laden...',

    'counting.varianceMatch': 'VarianceMatch',

    'counting.confidence.high': 'High',

    'counting.confidence.medium': 'Medium',

    'counting.confidence.low': 'Low',

    'inventory.quickAdjustment': 'QuickAdjustment',

    'inventory.adjustStockLevels': 'AdjustStockLevels',

    'inventory.selectProduct': 'SelectProduct',

    'inventory.searchProduct': 'SearchProduct',

    'inventory.noProductsFound': 'NoProductsFound',

    'inventory.tryDifferentSearchTerm': 'TryDifferentSearchTerm',

    'inventory.scanBarcode': 'ScanBarcode',

    'quickAdjustment.noProduct': 'NoProduct',

    'inventory.noLocationSelected': 'NoLocationSelected',

    'inventory.changeProduct': 'ChangeProduct',

    'inventory.selectLocation': 'SelectLocation',

    'common.required': 'Dit veld is verplicht',

    'inventory.quickAmounts': 'QuickAmounts',

    'inventory.selectReason': 'SelectReason',

    'inventory.notes': 'Notities',

    'common.optional': 'Optional',

    'inventory.notesPlaceholder': 'NotesPlaceholder',

    'inventory.preview': 'Preview',

    'inventory.current': 'Current',

    'inventory.newQuantity': 'NewQuantity',

    'inventory.adjusting': 'Adjusting',

    'inventory.completeRequiredFields': 'CompleteRequiredFields',

    'inventory.selectProductFirst': 'SelectProductFirst',

    'inventory.selectLocationFirst': 'SelectLocationFirst',

    'quickadjus.noreasonselected': 'Noreasonselected',

    'quickadjus.usernotauthenticatedor': 'Usernotauthenticatedor',

    'quickadjus.nolocationselected': 'Nolocationselected',

    'quickadjus.noproductselected': 'Noproductselected',

    'inventory.increase': 'Increase',

    'inventory.decrease': 'Decrease',

    'inventory.setTo': 'SetTo',

    'inventory.reasons.adjustment': 'Adjustment',

    'inventory.reasons.damage': 'Damage',

    'inventory.reasons.expired': 'Expired',

    'inventory.reasons.lost': 'Lost',

    'inventory.reasons.found': 'Found',

    'inventory.reasons.recount': 'Recount',

    'inventory.reasons.correction': 'Correction',

    'inventory.reasons.other': 'Other',

    'inventory.quantityMustBePositive': 'QuantityMustBePositive',

    'inventory.reasonRequired': 'ReasonRequired',

    'inventory.quantityToAdd': 'QuantityToAdd',

    'inventory.quantityToRemove': 'QuantityToRemove',

    'errors.processingError': 'ProcessingError',

    'inventory.savingChanges': 'SavingChanges',

    'inventory.stockUpdated': 'StockUpdated',

    'inventory.errorUpdatingStock': 'ErrorUpdatingStock',

    'inventory.errorProductNotFound': 'ErrorProductNotFound',

    'inventory.errorUpdateInProgress': 'ErrorUpdateInProgress',

    'inventory.errorInvalidData': 'ErrorInvalidData',

    'inventory.errorNegativeStock': 'ErrorNegativeStock',

    'inventory.realTimeDisconnected': 'RealTimeDisconnected',

    'inventory.stockTransfer': 'StockTransfer',

    'inventory.fromLocation': 'FromLocation',

    'inventory.availableStock': 'AvailableStock',

    'inventory.toLocation': 'ToLocation',

    'inventory.selectBatch': 'SelectBatch',

    'inventory.expiryDate': 'ExpiryDate',

    'inventory.available': 'Available',

    'inventory.quantityToTransfer': 'QuantityToTransfer',

    'inventory.maxAvailable': 'MaxAvailable',

    'inventory.transferReason': 'TransferReason',

    'inventory.transferNotesPlaceholder': 'TransferNotesPlaceholder',

    'inventory.transferPreview': 'TransferPreview',

    'inventory.remaining': 'Remaining',

    'inventory.newTotal': 'NewTotal',

    'inventory.executeTransfer': 'ExecuteTransfer',

    'inventory.locationRebalance': 'LocationRebalance',

    'inventory.stockReplenishment': 'StockReplenishment',

    'inventory.emergencyTransfer': 'EmergencyTransfer',

    'inventory.expiryManagement': 'ExpiryManagement',

    'inventory.maintenanceRelocation': 'MaintenanceRelocation',

    'inventory.expired': 'Expired',

    'inventory.expiresSoon': 'ExpiresSoon',

    'inventory.expiresThisMonth': 'ExpiresThisMonth',

    'inventory.fresh': 'Fresh',

    'inventory.transferCompleted': 'TransferCompleted',

    'inventory.transferFailed': 'TransferFailed',

    'inventory.transferFailedDetails': 'TransferFailedDetails',

    'demo.title': 'Titel',

    'demo.subtitle': 'Ondertitel',

    'demo.changesCanBeReset': 'ChangesCanBeReset',

    'common.accessibility.pageMetadata': 'PageMetadata',

    'common.accessibility.pageActions': 'PageActions',

    'productsPage.advancedSearch.title': 'Titel',

    'productsPage.advancedSearch.basicSearch': 'BasicSearch',

    'productsPage.advancedSearch.searchPlaceholder': 'Zoeken...',

    'productsPage.advancedSearch.gs1Search': 'Gs1Search',

    'productsPage.filters.gtinPlaceholder': 'GtinPlaceholder',

    'productsPage.filters.selectCountry': 'SelectCountry',

    'productsPage.filters.selectGpc': 'SelectGpc',

    'productsPage.filters.selectLifecycle': 'SelectLifecycle',

    'productsPage.advancedSearch.categorySupplier': 'CategorySupplier',

    'productsPage.filters.selectCategory': 'SelectCategory',

    'productsPage.filters.selectSupplier': 'SelectSupplier',

    'productsPage.filters.selectStockStatus': 'SelectStockStatus',

    'productsPage.advancedSearch.priceRange': 'PriceRange',

    'productsPage.filters.minPrice': 'MinPrice',

    'productsPage.filters.maxPrice': 'MaxPrice',

    'productsPage.advancedSearch.specialOptions': 'SpecialOptions',

    'productsPage.filters.orderableOnly': 'OrderableOnly',

    'productsPage.advancedSearch.hasGtin': 'HasGtin',

    'productsPage.advancedSearch.batchTracked': 'BatchTracked',

    'productsPage.advancedSearch.inStockOnly': 'InStockOnly',

    'productsPage.advancedSearch.sorting': 'Sorting',

    'productsPage.advancedSearch.sortBy': 'SortBy',

    'productsPage.advancedSearch.livePreview': 'LivePreview',

    'productsPage.advancedSearch.avgPrice': 'AvgPrice',

    'productsPage.advancedSearch.inStock': 'InStock',

    'productsPage.advancedSearch.withGtin': 'WithGtin',

    'productsPage.advancedSearch.sampleResults': 'SampleResults',

    'productsPage.advancedSearch.reset': 'Resetten',

    'productsPage.advancedSearch.search': 'Zoeken',

    'productsPage.advancedSearch.previewTable': 'PreviewTable',

    'productsPage.sortBy.name': 'Naam',

    'productsPage.sortBy.price': 'Prijs',

    'productsPage.sortBy.stock': 'Voorraad',

    'productsPage.sortBy.category': 'Categorie',

    'productsPage.sortOrder.asc': 'Asc',

    'productsPage.sortOrder.desc': 'Desc',

    'productsPage.advancedSearch.resultsFound': 'ResultsFound',

    'orderLists.editDialog': 'Dialoog',

    'orderLists.createDialog': 'Dialoog',

    'orderLists.details': 'Details',

    'orderLists.name': 'Naam',

    'orderLists.nameRequired': 'NameRequired',

    'orderLists.nameMinLength': 'NameMinLength',

    'orderLists.description': 'Beschrijving',

    'orderLists.supplierRequired': 'SupplierRequired',

    'orderLists.notes': 'Notities',

    'orderLists.urgent': 'Urgent',

    'orderLists.summary': 'Summary',

    'orderLists.products': 'Products',

    'orderLists.addProduct': 'AddProduct',

    'orderLists.quantity': 'Hoeveelheid',

    'orderLists.unitPrice': 'UnitPrice',

    'orderLists.totalPrice': 'TotalPrice',

    'orderLists.noProducts': 'NoProducts',

    'orderLists.selectProduct': 'SelectProduct',

    'common.add': 'Add',

    'orderlistd.nopracticeselected': 'Nopracticeselected',

    'orderLists.updated': 'Updated',

    'orderLists.created': 'Created',

    'orderLists.saveError': 'SaveError',

    'productsPage.details.title': 'Titel',

    'productsPage.details.noImage': 'NoImage',

    'productsPage.details.basicInfo': 'BasicInfo',

    'productsPage.details.name': 'Naam',

    'productsPage.details.sku': 'SKU',

    'productsPage.details.category': 'Categorie',

    'productsPage.details.brand': 'Merk',

    'productsPage.details.unit': 'Eenheid',

    'productsPage.details.price': 'Prijs',

    'productsPage.details.priceNotAvailable': 'PriceNotAvailable',

    'productsPage.details.description': 'Beschrijving',

    'productsPage.details.noDescription': 'NoDescription',

    'productsPage.details.gs1Info': 'Gs1Info',

    'productsPage.details.gtin': 'Gtin',

    'productsPage.details.gpcBrickCode': 'GpcBrickCode',

    'productsPage.details.countryOfOrigin': 'CountryOfOrigin',

    'productsPage.details.lifecycleStatus': 'LifecycleStatus',

    'productsPage.details.netContent': 'NetContent',

    'productsPage.details.weight': 'Gewicht',

    'productsPage.details.netWeight': 'NetWeight',

    'productsPage.details.grossWeight': 'GrossWeight',

    'productsPage.details.validityPeriod': 'ValidityPeriod',

    'productsPage.details.from': 'From',

    'productsPage.details.to': 'To',

    'productsPage.details.unitIndicators': 'UnitIndicators',

    'productsPage.details.baseUnit': 'BaseUnit',

    'productsPage.details.orderable': 'Orderable',

    'productsPage.details.despatchable': 'Despatchable',

    'productsPage.details.stockInfo': 'StockInfo',

    'productsPage.details.currentStock': 'CurrentStock',

    'productsPage.table.stockStatus': 'StockStatus',

    'products.name': 'Naam',

    'products.skuHint': 'SkuHint',

    'products.description': 'Beschrijving',

    'products.category': 'Categorie',

    'products.brand': 'Merk',

    'products.unit': 'Eenheid',

    'products.price': 'Prijs',

    'products.barcode': 'Barcode',

    'products.barcodeHint': 'BarcodeHint',

    'products.scanBarcode': 'ScanBarcode',

    'products.requiresBatchTracking': 'RequiresBatchTracking',

    'products.active': 'Actief',

    'products.gs1Information': 'Gs1Information',

    'products.gtinHint': 'GtinHint',

    'products.gpcHint': 'GpcHint',

    'products.countryOfOrigin': 'CountryOfOrigin',

    'products.lifecycleStatus': 'LifecycleStatus',

    'common.update': 'Bijwerken',

    'common.create': 'Maken',

    'products.units.piece': 'Piece',

    'products.units.pack': 'Pack',

    'products.units.box': 'Box',

    'products.units.bottle': 'Bottle',

    'products.units.tube': 'Tube',

    'products.units.liter': 'Liter',

    'products.units.kg': 'Kg',

    'products.units.gram': 'Gram',

    'products.lifecycle.active': 'Actief',

    'products.lifecycle.discontinued': 'Discontinued',

    'products.lifecycle.new': 'New',

    'products.lifecycle.phaseOut': 'PhaseOut',

    'errors.noPracticeSelected': 'NoPracticeSelected',

    'products.updated': 'Updated',

    'products.created': 'Created',

    'products.updateError': 'UpdateError',

    'products.createError': 'CreateError',

    'productsPage.cart.title': 'Titel',

    'productsPage.cart.empty': 'Geen resultaten gevonden',

    'productsPage.cart.totalItems': 'TotalItems',

    'productsPage.cart.clear': 'Wissen',

    'productsPage.details.supplier': 'Leverancier',

    'productsPage.cart.unitPrice': 'UnitPrice',

    'productsPage.cart.checkout': 'Checkout',

    'productsPage.cart.remove': 'Remove',

    'batch.quantityToUse': 'QuantityToUse',

    'batch.validation.exceededAvailable': 'Dit veld is verplicht',

    'batch.useAll': 'UseAll',

    'batch.usageReason': 'UsageReason',

    'batch.usageNotes': 'UsageNotes',

    'batch.usageNotesHint': 'UsageNotesHint',

    'batch.usageSummary': 'UsageSummary',

    'batch.quantityUsed': 'QuantityUsed',

    'batch.remainingQuantity': 'RemainingQuantity',

    'batch.costImpact': 'CostImpact',

    'batch.newStatus': 'NewStatus',

    'batch.confirmUsage': 'ConfirmUsage',

    'batch.usage.consumption': 'Consumption',

    'batch.usage.expired': 'Expired',

    'batch.usage.damaged': 'Damaged',

    'batch.usage.transfer': 'Transfer',

    'batch.usage.adjustment': 'Adjustment',

    'batch.usage.other': 'Other',

    'batch.batchUsedSuccessfully': 'BatchUsedSuccessfully',

    'common.dismiss': 'Dismiss',

    'errors.failedToUseBatch': 'FailedToUseBatch',

    'validation.email': 'E-mail',

    'validation.numeric': 'Dit veld is verplicht',

    'validation.positiveNumber': 'Dit veld is verplicht',

    'validation.nonNegative': 'Dit veld is verplicht',

    'validation.integer': 'Dit veld is verplicht',

    'validation.futureDate': 'Dit veld is verplicht',

    'validation.pastDate': 'Dit veld is verplicht',

    'validation.validSku': 'Dit veld is verplicht',

    'validation.phone': 'Telefoon',

    'validation.url': 'URL',

    'brand.name': 'Naam',

    'brand.edition': 'Edition',

    'brand.tagline': 'Tagline',

    'clinic.defaultName': 'DefaultName',

    'clinic.professionalPlan': 'ProfessionalPlan',

    'clinic.settings': 'Settings',

    'clinic.information': 'Information',

    'common.ok': 'Ok',

    'common.remove': 'Remove',

    'common.search': 'Zoeken',

    'common.filter': 'Filteren',

    'common.clear': 'Wissen',

    'common.noData': 'NoData',

    'common.error': 'Fout',

    'common.success': 'Succes',

    'common.warning': 'Waarschuwing',

    'common.info': 'Info',

    'common.yes': 'Yes',

    'common.no': 'No',

    'common.back': 'Back',

    'common.next': 'Next',

    'common.previous': 'Previous',

    'common.none': 'None',

    'common.select': 'Selecteren',

    'common.open': 'Open',

    'common.unknownSupplier': 'UnknownSupplier',

    'common.uncategorized': 'Uncategorized',

    'common.defaultUnit': 'DefaultUnit',

    'common.import': 'Importeren',

    'common.download': 'Downloaden',

    'common.upload': 'Uploaden',

    'common.print': 'Print',

    'common.active': 'Actief',

    'common.inactive': 'Inactief',

    'common.enabled': 'Enabled',

    'common.disabled': 'Disabled',

    'common.name': 'Naam',

    'common.description': 'Beschrijving',

    'common.time': 'Tijd',

    'common.today': 'Vandaag',

    'common.yesterday': 'Gisteren',

    'common.comingSoon': 'Binnenkort beschikbaar',

    'common.dataRefreshed': 'DataRefreshed',

    'common.clearFilters': 'ClearFilters',

    'common.submit': 'Verzenden',

    'common.accessibility.mainNavigation': 'MainNavigation',

    'common.accessibility.navigationActions': 'NavigationActions',

    'common.accessibility.quickNavigation': 'QuickNavigation',

    'common.accessibility.userMenu': 'UserMenu',

    'common.accessibility.openMenu': 'OpenMenu',

    'common.accessibility.closeMenu': 'CloseMenu',

    'common.accessibility.toggleTheme': 'ToggleTheme',

    'common.accessibility.searchButton': 'Knop',

    'common.accessibility.notificationPanel': 'NotificationPanel',

    'nav.invoices': 'Invoices',

    'nav.settings': 'Settings',

    'nav.logout': 'Logout',

    'nav.profile': 'Profile',

    'nav.helpSupport': 'HelpSupport',

    'nav.navigation': 'Navigatie',

    'nav.quickStats': 'QuickStats',

    'nav.upgradePlan': 'UpgradePlan',

    'nav.getAdvancedFeatures': 'GetAdvancedFeatures',

    'nav.inventory': 'Voorraad',

    'nav.analytics': 'Analytics',

    'nav.suppliers': 'Suppliers',

    'nav.admin': 'Admin',

    'nav.overviewAnalytics': 'OverviewAnalytics',

    'nav.stockManagement': 'StockManagement',

    'nav.inventoryManagement': 'InventoryManagement',

    'nav.productManagement': 'ProductManagement',

    'nav.purchaseOrders': 'PurchaseOrders',

    'nav.reportsInsights': 'ReportsInsights',

    'nav.vendorManagement': 'VendorManagement',

    'nav.systemAdmin': 'SystemAdmin',

    'nav.openNavigation': 'OpenNavigation',

    'nav.notifications': 'Notifications',

    'nav.alertsNotifications': 'AlertsNotifications',

    'nav.darkMode': 'DarkMode',

    'nav.lightMode': 'LightMode',

    'nav.userMenu': 'UserMenu',

    'nav.shoppingCart': 'ShoppingCart',

    'nav.styleGuide': 'StyleGuide',

    'nav.designSystem': 'DesignSystem',

    'nav.sections.main': 'Main',

    'nav.sections.inventory': 'Voorraad',

    'nav.sections.supplyChain': 'SupplyChain',

    'nav.sections.analytics': 'Analytics',

    'nav.sections.administration': 'Administration',

    'nav.inventoryLevels': 'InventoryLevels',

    'nav.currentStock': 'CurrentStock',

    'nav.locations': 'Locations',

    'nav.warehouseManagement': 'WarehouseManagement',

    'nav.stockCounting': 'StockCounting',

    'nav.physicalCounts': 'PhysicalCounts',

    'nav.movements': 'Movements',

    'nav.stockMovements': 'StockMovements',

    'auth.login': 'Login',

    'auth.logout': 'Logout',

    'auth.email': 'E-mail',

    'auth.password': 'Wachtwoord',

    'auth.forgotPassword': 'ForgotPassword',

    'auth.resetPassword': 'ResetPassword',

    'auth.hidePassword': 'HidePassword',

    'auth.showPassword': 'ShowPassword',

    'auth.loginError': 'LoginError',

    'auth.sessionExpired': 'SessionExpired',

    'auth.loginSuccess': 'LoginSuccess',

    'auth.logoutSuccess': 'LogoutSuccess',

    'auth.pleaseLogin': 'PleaseLogin',

    'auth.demoAccount': 'DemoAccount',

    'auth.or': 'Or',

    'auth.secureConnection': 'SecureConnection',

    'auth.privacyPolicy': 'PrivacyPolicy',

    'auth.termsOfService': 'TermsOfService',

    'auth.support': 'Support',

    'auth.allRightsReserved': 'AllRightsReserved',

    'auth.professionalInventory': 'ProfessionalInventory',

    'auth.platformDescription': 'PlatformDescription',

    'auth.realtimeTracking': 'RealtimeTracking',

    'auth.automatedAlerts': 'AutomatedAlerts',

    'auth.complianceReporting': 'ComplianceReporting',

    'auth.multilocationSupport': 'MultilocationSupport',

    'auth.demoCredentialsFilled': 'DemoCredentialsFilled',

    'auth.passwordResetComingSoon': 'PasswordResetComingSoon',

    'auth.copyright': 'Copyright',

    'auth.passwordHelp': 'PasswordHelp',

    'auth.demoHelp': 'DemoHelp',

    'auth.signingIn': 'SigningIn',

    'auth.fullName': 'FullName',

    'demo.resetInProgress': 'ResetInProgress',

    'demo.reloadingAfterReset': 'Laden...',

    'dashboard.title': 'Titel',

    'dashboard.welcome': 'Welcome',

    'dashboard.user': 'User',

    'dashboard.clinicInfo': 'ClinicInfo',

    'dashboard.stockSummary': 'StockSummary',

    'dashboard.lowStockItems': 'LowStockItems',

    'dashboard.outOfStockItems': 'OutOfStockItems',

    'dashboard.reorderSuggestions': 'ReorderSuggestions',

    'dashboard.outOfStock': 'OutOfStock',

    'dashboard.lowStock': 'LowStock',

    'dashboard.inStock': 'InStock',

    'dashboard.noLowStock': 'NoLowStock',

    'dashboard.viewMore': 'ViewMore',

    'dashboard.quickActions': 'QuickActions',

    'dashboard.manageStock': 'ManageStock',

    'dashboard.updateStockLevels': 'UpdateStockLevels',

    'dashboard.viewOrders': 'ViewOrders',

    'dashboard.manageOrders': 'ManageOrders',

    'dashboard.configureSystem': 'ConfigureSystem',

    'dashboard.dataRefreshed': 'DataRefreshed',

    'dashboard.recentActivity': 'RecentActivity',

    'dashboard.itemsRequiringAttention': 'ItemsRequiringAttention',

    'dashboard.commonTasks': 'CommonTasks',

    'dashboard.exportToCsv': 'ExportToCsv',

    'dashboard.currentMin': 'CurrentMin',

    'dashboard.latestUpdates': 'LatestUpdates',

    'dashboard.viewAnalytics': 'ViewAnalytics',

    'dashboard.welcomeTitle': 'WelcomeTitle',

    'dashboard.welcomeSubtitle': 'Titel',

    'dashboard.welcomeDescription': 'WelcomeDescription',

    'dashboard.systemStatus': 'SystemStatus',

    'dashboard.systemStatusSubtitle': 'Titel',

    'dashboard.systemOnline': 'SystemOnline',

    'dashboard.dataSynced': 'DataSynced',

    'dashboard.secureConnection': 'SecureConnection',

    'dashboard.vsLastMonth': 'VsLastMonth',

    'dashboard.summaryOverview': 'SummaryOverview',

    'dashboard.moreOptions': 'MoreOptions',

    'dashboard.quickActionsList': 'QuickActionsList',

    'dashboard.optionsMenu': 'OptionsMenu',

    'dashboard.lowStockItemsList': 'LowStockItemsList',

    'dashboard.dashboardSummary': 'DashboardSummary',

    'dashboard.failedToLoadData': 'FailedToLoadData',

    'dashboard.dataRefreshedSuccessfully': 'DataRefreshedSuccessfully',

    'dashboard.failedToRefreshData': 'FailedToRefreshData',

    'dashboard.assistantDashboard': 'AssistantDashboard',

    'dashboard.managerDashboard': 'ManagerDashboard',

    'dashboard.ownerDashboard': 'OwnerDashboard',

    'dashboard.stockAlerts': 'StockAlerts',

    'dashboard.orderSuggestions': 'OrderSuggestions',

    'dashboard.recentOrders': 'RecentOrders',

    'dashboard.quickScan': 'QuickScan',

    'dashboard.analyticsOverview': 'AnalyticsOverview',

    'dashboard.businessOverview': 'BusinessOverview',

    'dashboard.costAnalysis': 'CostAnalysis',

    'dashboard.supplierPerformance': 'SupplierPerformance',

    'dashboard.teamActivity': 'TeamActivity',

    'dashboard.financialSummary': 'FinancialSummary',

    'dashboard.userManagement': 'UserManagement',

    'dashboard.systemHealth': 'SystemHealth',

    'dashboard.scanProduct': 'ScanProduct',

    'dashboard.createOrder': 'CreateOrder',

    'dashboard.updateStock': 'UpdateStock',

    'dashboard.viewLowStock': 'ViewLowStock',

    'dashboard.manageSuppliers': 'ManageSuppliers',

    'dashboard.approveOrders': 'ApproveOrders',

    'dashboard.exportReports': 'ExportReports',

    'dashboard.manageUsers': 'ManageUsers',

    'dashboard.systemSettings': 'SystemSettings',

    'dashboard.financialReports': 'FinancialReports',

    'dashboard.backupData': 'BackupData',

    'dashboard.noAlerts': 'NoAlerts',

    'dashboard.allStockLevelsOk': 'AllStockLevelsOk',

    'dashboard.lowStockAlert': 'LowStockAlert',

    'dashboard.viewAllAlerts': 'ViewAllAlerts',

    'dashboard.noOrderSuggestions': 'NoOrderSuggestions',

    'dashboard.noRecentOrders': 'NoRecentOrders',

    'dashboard.loadingWidgets': 'Laden...',

    'dashboard.errorLoadingWidget': 'ErrorLoadingWidget',

    'dashboard.tryAgain': 'TryAgain',

    'dashboard.totalProducts': 'TotalProducts',

    'dashboard.lowStockCount': 'LowStockCount',

    'dashboard.pendingOrders': 'PendingOrders',

    'dashboard.totalValue': 'TotalValue',

    'dashboard.teamSize': 'TeamSize',

    'dashboard.practiceHealth': 'PracticeHealth',

    'errors.generic': 'Generic',

    'errors.network': 'Network',

    'errors.unauthorized': 'Unauthorized',

    'errors.notFound': 'Geen resultaten gevonden',

    'errors.validation': 'Dit veld is verplicht',

    'errors.serverError': 'ServerError',

    'errors.failedToRefreshData': 'FailedToRefreshData',

    'error.pageNotFound': 'PageNotFound',

    'error.pageNotFoundDescription': 'PageNotFoundDescription',

    'error.goHome': 'GoHome',

    'error.goBack': 'GoBack',

    'error.tryThesePages': 'TryThesePages',

    'validation.maxLength': 'Dit veld is verplicht',

    'validation.positive': 'Dit veld is verplicht',

    'validation.textMustMatch': 'Dit veld is verplicht',

    'product.selectProduct': 'SelectProduct',

    'location.selectLocation': 'SelectLocation',

    'location.sampleData.mainWarehouse.type': 'Type',

    'location.sampleData.mainWarehouse.description': 'Beschrijving',

    'location.sampleData.pharmacy.name': 'Naam',

    'location.sampleData.pharmacy.type': 'Type',

    'location.sampleData.pharmacy.description': 'Beschrijving',

    'location.sampleData.treatmentRoom.type': 'Type',

    'location.sampleData.treatmentRoom.description': 'Beschrijving',

    'inventory.title': 'Titel',

    'inventory.suppliers': 'Suppliers',

    'inventory.orders': 'Orders',

    'inventory.stockCounting': 'StockCounting',

    'inventory.time': 'Tijd',

    'inventory.searchProducts': 'SearchProducts',

    'inventory.stockStatus': 'StockStatus',

    'inventory.category': 'Categorie',

    'inventory.items': 'Items',

    'inventory.totalValue': 'TotalValue',

    'inventory.lowStockItems': 'LowStockItems',

    'inventory.outOfStockItems': 'OutOfStockItems',

    'inventory.stockAccuracy': 'StockAccuracy',

    'inventory.lastFullCount': 'LastFullCount',

    'inventory.allLocations': 'AllLocations',

    'inventory.currentLocation': 'CurrentLocation',

    'inventory.switchLocation': 'SwitchLocation',

    'inventory.transferStock': 'TransferStock',

    'inventory.viewMovements': 'ViewMovements',

    'inventory.exportData': 'ExportData',

    'demo.resetFailed': 'ResetFailed',

    'batch.batchManagement': 'BatchManagement',

    'dashboard.actions.refresh': 'Verversen',

    'dashboard.actions.customize': 'Customize',

    'dashboard.demoRoleSwitch.label': 'Label',

    'dashboard.roles.assistant': 'Assistant',

    'dashboard.roles.manager': 'Manager',

    'dashboard.roles.owner': 'Owner',

    'dashboard.notifications.roleSwitch': 'RoleSwitch',

    'inventory.stockUpdatedMessage': 'StockUpdatedMessage',

    'magicJoin.subtitle': 'Ondertitel',

    'admin.title': 'Titel',

    'admin.settings': 'Settings',

    'admin.audit': 'Audit',

    'admin.stats.totalUsers': 'TotalUsers',

    'admin.stats.activeToday': 'ActiveToday',

    'admin.stats.totalLocations': 'TotalLocations',

    'admin.stats.active': 'Actief',

    'admin.stats.pendingSync': 'PendingSync',

    'admin.stats.lastSync': 'LastSync',

    'admin.stats.todayEvents': 'TodayEvents',

    'admin.stats.fromYesterday': 'FromYesterday',

    'admin.quickActions': 'QuickActions',

    'admin.userManagement.invite': 'Invite',

    'offline.data.download': 'Downloaden',

    'offline.sync.forceSync': 'ForceSync',

    'exports.title': 'Titel',

    'magicInvite.revolutionaryUserSystem': 'RevolutionaryUserSystem',

    'admin.users': 'Users',

    'admin.locations': 'Locations',

    'admin.permissions': 'Permissions',

    'admin.analytics': 'Analytics',

    'admin.userManagement.title': 'Titel',

    'locations.isMain': 'IsMain',

    'permissions.title': 'Titel',

    'permissions.templates.title': 'Titel',

    'analytics.dashboard': 'Dashboard',

    'analytics.usage': 'Usage',

    'analytics.patterns': 'Patterns',

    'analytics.metrics.averageSession': 'AverageSession',

    'analytics.metrics.peakHours': 'PeakHours',

    'admin.userManagement.email': 'E-mail',

    'admin.userManagement.roles': 'Roles',

    'admin.userManagement.lastActive': 'LastActive',

    'locations.name': 'Naam',

    'locations.city': 'Stad',

    'permissions.user': 'User',

    'permissions.permissionType': 'PermissionType',

    'permissions.resourceType': 'ResourceType',

    'permissions.expiresAt': 'ExpiresAt',

    'admin.errors.loadUsersFailed': 'LoadUsersFailed',

    'admin.errors.loadLocationsFailed': 'LoadLocationsFailed',

    'offline.messages.syncCompleted': 'SyncCompleted',

    'offline.errors.downloadFailed': 'DownloadFailed',

    'offline.messages.syncFailed': 'SyncFailed',

    'admin.userManagement.resetPassword': 'ResetPassword',

    'admin.errors.failedToSet': 'FailedToSet',

    'admin.errors.failedToUpdate': 'FailedToUpdate',

    'locations.notifications.mainLocationSet': 'MainLocationSet',

    'locations.errors.setMainFailed': 'SetMainFailed',

    'permissions.notifications.revoked': 'Revoked',

    'permissions.errors.revokeFailed': 'RevokeFailed',

    'analyticsPage.title': 'Titel',

    'analyticsPage.subtitle': 'Ondertitel',

    'analyticsPage.period': 'Period',

    'analyticsPage.totalEvents': 'TotalEvents',

    'analyticsPage.activeUsers': 'ActiveUsers',

    'analyticsPage.totalOrders': 'TotalOrders',

    'analyticsPage.productUpdates': 'ProductUpdates',

    'analyticsPage.dailyActivity': 'DailyActivity',

    'analyticsPage.topEvents': 'TopEvents',

    'analyticsPage.frequentlyOrderedItems': 'FrequentlyOrderedItems',

    'analyticsPage.mostUpdatedProducts': 'MostUpdatedProducts',

    'analyticsPage.userActivity': 'UserActivity',

    'analyticsPage.export': 'Exporteren',

    'analyticsPage.periods.7d': 'Laatste 7 dagen',

    'analyticsPage.periods.30d': 'Laatste 30 dagen',

    'analyticsPage.periods.90d': 'Laatste 90 dagen',

    'analyticsPage.periods.1y': 'Laatste jaar',

    'analyticsPage.user': 'User',

    'analyticsPage.activityCount': 'ActivityCount',

    'analyticsPage.lastActivity': 'LastActivity',

    'analyticsPage.product': 'Product',

    'analyticsPage.totalQuantity': 'TotalQuantity',

    'analyticsPage.orderCount': 'OrderCount',

    'analyticsPage.updates': 'Updates',

    'analyticsPage.loadError': 'LoadError',

    'analyticsPage.exportSuccess': 'ExportSuccess',

    'analyticsPage.exportError': 'ExportError',

    'magicJoin.enterCode': 'EnterCode',

    'magicJoin.codeExplanation': 'CodeExplanation',

    'magicJoin.placeholder': 'Placeholder',

    'magicJoin.joinNow': 'JoinNow',

    'common.or': 'Or',

    'magicJoin.scanQR': 'ScanQR',

    'magicJoin.tryDemo': 'TryDemo',

    'magicJoin.howItWorks': 'HowItWorks',

    'magicJoin.step1': 'Step1',

    'magicJoin.step1Detail': 'Step1Detail',

    'magicJoin.step2': 'Step2',

    'magicJoin.step2Detail': 'Step2Detail',

    'magicJoin.step3': 'Step3',

    'magicJoin.step3Detail': 'Step3Detail',

    'magicJoin.scanTitle': 'ScanTitle',

    'magicJoin.scanInstructions': 'ScanInstructions',

    'magicJoin.welcomeTitle': 'WelcomeTitle',

    'magicJoin.getStarted': 'GetStarted',

    'magicJoin.demoAccess': 'DemoAccess',

    'magicJoin.memberAccess': 'MemberAccess',

    'magicJoin.invalidCode': 'InvalidCode',

    'magicJoin.joinError': 'JoinError',

    'magicJoin.personalCodeSuccess': 'PersonalCodeSuccess',

    'magicJoin.personalCodeError': 'PersonalCodeError',

    'magicJoin.expiredCode': 'ExpiredCode',

    'magicJoin.maxUsesReached': 'MaxUsesReached',

    'magicJoin.permanentInviteDetected': 'PermanentInviteDetected',

    'magicJoin.guestAccessGranted': 'GuestAccessGranted',

    'magicJoin.validationError': 'Dit veld is verplicht',

    'upgrade.creatingAccount': 'CreatingAccount',

    'upgrade.yourCodeIs': 'YourCodeIs',

    'batch.manageBatchesSubtitle': 'Titel',

    'batch.activeBatches': 'ActiveBatches',

    'batch.quickActions': 'QuickActions',

    'batch.criticalAlert': 'CriticalAlert',

    'batch.viewCritical': 'ViewCritical',

    'batch.overview': 'Overview',

    'batch.expiring': 'Expiring',

    'batch.fifoManagement': 'FifoManagement',

    'batch.reports': 'Reports',

    'batch.expiringBatches': 'ExpiringBatches',

    'batch.batchReports': 'BatchReports',

    'batch.exportSuccess': 'ExportSuccess',

    'batch.criticalBatchesFound': 'CriticalBatchesFound',

    'dashboardp.negative': 'Negative',

    'dashboardp.positive': 'Positive',

    'counting.status.active': 'Actief',

    'counting.status.completed': 'Voltooid',

    'counting.status.cancelled': 'Geannuleerd',

    'counting.status.approved': 'Goedgekeurd',

    'counting.sessionName': 'SessionName',

    'counting.status': 'Status',

    'common.refreshFailed': 'RefreshFailed',

    'counting.confirmComplete': 'ConfirmComplete',

    'counting.sessionCompleted': 'SessionCompleted',

    'counting.completeFailed': 'CompleteFailed',

    'counting.unknownSession': 'UnknownSession',

    'counting.product': 'Product',

    'counting.variance': 'Variance',

    'counting.sessionLoadFailed': 'SessionLoadFailed',

    'counting.confirmApprove': 'ConfirmApprove',

    'counting.sessionApproved': 'SessionApproved',

    'counting.approveFailed': 'ApproveFailed',

    'inventory.unknownLocation': 'UnknownLocation',

    'inventory.lastCounted': 'LastCounted',

    'inventory.actions': 'Actions',

    'inventory.addStock': 'AddStock',

    'inventory.removeStock': 'RemoveStock',

    'inventory.setStock': 'SetStock',

    'inventory.loadError': 'LoadError',

    'inventory.dataRefreshed': 'DataRefreshed',

    'inventory.historyNotImplemented': 'HistoryNotImplemented',

    'inventory.countingNotImplemented': 'CountingNotImplemented',

    'inventory.stockAdjusted': 'StockAdjusted',

    'inventory.adjustError': 'AdjustError',

    'locations.sampleData.mainWarehouse.name': 'Naam',

    'locations.sampleData.mainWarehouse.type': 'Type',

    'locations.sampleData.mainWarehouse.description': 'Beschrijving',

    'locations.sampleData.pharmacy.name': 'Naam',

    'locations.sampleData.pharmacy.type': 'Type',

    'locations.sampleData.pharmacy.description': 'Beschrijving',

    'locations.sampleData.treatmentRoom.name': 'Naam',

    'locations.sampleData.treatmentRoom.type': 'Type',

    'locations.sampleData.treatmentRoom.description': 'Beschrijving',

    'locations.type': 'Type',

    'locations.description': 'Beschrijving',

    'locations.capacity': 'Capacity',

    'notificationsPage.title': 'Titel',

    'notificationsPage.subtitle': 'Ondertitel',

    'notificationsPage.notificationStatistics': 'NotificationStatistics',

    'notificationsPage.all': 'All',

    'notificationsPage.unreadCount': 'UnreadCount',

    'notificationsPage.total': 'Totaal',

    'notificationsPage.quickActions': 'QuickActions',

    'notificationsPage.unread': 'Unread',

    'notificationsPage.filterByCategory': 'FilterByCategory',

    'notificationsPage.noNotifications': 'NoNotifications',

    'notificationsPage.allCaughtUp': 'AllCaughtUp',

    'notificationsPage.markAsReadTooltip': 'MarkAsReadTooltip',

    'notificationsPage.deleteTooltip': 'DeleteTooltip',

    'notificationsPage.markAllRead': 'MarkAllRead',

    'notificationsPage.testStockAlert': 'TestStockAlert',

    'notificationsPage.testOrderUpdate': 'TestOrderUpdate',

    'notificationsPage.clearAllNotifications': 'ClearAllNotifications',

    'sampleNotifications.lowStockWarning': 'LowStockWarning',

    'sampleNotifications.orderConfirmed': 'OrderConfirmed',

    'sampleNotifications.stockUpdated': 'StockUpdated',

    'sampleNotifications.systemMaintenance': 'SystemMaintenance',

    'notificationsPage.categories.stockAlert': 'StockAlert',

    'notificationsPage.categories.orderUpdate': 'OrderUpdate',

    'notificationsPage.categories.systemNotification': 'SystemNotification',

    'notificationsPage.categories.reminder': 'Reminder',

    'notificationsPage.loadNotificationsError': 'LoadNotificationsError',

    'notificationsPage.allMarkedAsRead': 'AllMarkedAsRead',

    'notificationsPage.notificationDeleted': 'NotificationDeleted',

    'notificationsPage.clearAllConfirm': 'ClearAllConfirm',

    'notificationsPage.clearAllConfirmMessage': 'ClearAllConfirmMessage',

    'notificationsPage.allNotificationsCleared': 'AllNotificationsCleared',

    'notificationsPage.testMessages.stockAlert.title': 'Titel',

    'notificationsPage.testMessages.stockAlert.message': 'Bericht',

    'notificationsPage.testMessages.orderUpdate.title': 'Titel',

    'notificationsPage.testMessages.orderUpdate.message': 'Bericht',

    'notificationsPage.testStockAlertCreated': 'TestStockAlertCreated',

    'notificationsPage.testOrderUpdateCreated': 'TestOrderUpdateCreated',

    'orderLists.duplicated': 'Duplicated',

    'orderLists.deleted': 'Deleted',

    'orderLists.deleteError': 'DeleteError',

    'orderLists.addedToCart': 'AddedToCart',

    'orderLists.cartError': 'CartError',

    'orderLists.autoFilled': 'AutoFilled',

    'orderLists.autoFillError': 'AutoFillError',

    'orderLists.submitConfirm': 'SubmitConfirm',

    'orderLists.confirmSubmit': 'ConfirmSubmit',

    'orderLists.viewSubmitted': 'ViewSubmitted',

    'orderLists.submitError': 'SubmitError',

    'orderLists.sendToSupplierConfirm': 'SendToSupplierConfirm',

    'orderLists.confirmSend': 'ConfirmSend',

    'orderLists.loadError': 'LoadError',

    'orders.export.button': 'Knop',

    'orders.analytics.button': 'Knop',

    'orders.createOrder': 'CreateOrder',

    'orders.orderNumber': 'OrderNumber',

    'orders.supplier': 'Leverancier',

    'orders.orderDate': 'OrderDate',

    'orders.status': 'Status',

    'orders.totalAmount': 'TotalAmount',

    'orders.expectedDelivery': 'ExpectedDelivery',

    'orders.actions': 'Actions',

    'orders.loadError': 'LoadError',

    'orders.viewOrderNotImplemented': 'ViewOrderNotImplemented',

    'orders.editOrderNotImplemented': 'EditOrderNotImplemented',

    'orders.downloadOrderNotImplemented': 'DownloadOrderNotImplemented',

    'orders.bulkExportNotImplemented': 'BulkExportNotImplemented',

    'orders.bulkEmailNotImplemented': 'BulkEmailNotImplemented',

    'orders.export.exportSuccess': 'ExportSuccess',

    'orders.export.exportError': 'ExportError',

    'productsPage.table.name': 'Naam',

    'productsPage.table.sku': 'SKU',

    'productsPage.table.gs1Status': 'Gs1Status',

    'productsPage.table.price': 'Prijs',

    'productsPage.table.actions': 'Actions',

    'productsPage.stockStatus.in_stock': 'In_stock',

    'productsPage.stockStatus.low_stock': 'Low_stock',

    'productsPage.stockStatus.out_of_stock': 'Out_of_stock',

    'productsPage.lifecycleStatus.active': 'Actief',

    'productsPage.lifecycleStatus.discontinued': 'Discontinued',

    'productsPage.lifecycleStatus.new': 'New',

    'productsPage.lifecycleStatus.phase_out': 'Phase_out',

    'productsPage.viewProduct': 'ViewProduct',

    'productsPage.cartAddError': 'CartAddError',

    'productsPage.dataRefreshed': 'DataRefreshed',

    'productsPage.productLoadError': 'ProductLoadError',

    'products.deleteError': 'DeleteError',

    'products.deleteMessage': 'DeleteMessage',

    'settings.title': 'Titel',

    'settings.manageSettingsSubtitle': 'Titel',

    'settings.saveSettings': 'SaveSettings',

    'settings.profile': 'Profile',

    'settings.profileSubtitle': 'Titel',

    'settings.role': 'Role',

    'settings.appearanceTitle': 'AppearanceTitle',

    'settings.appearanceSubtitle': 'Titel',

    'settings.darkMode': 'DarkMode',

    'settings.darkModeDescription': 'DarkModeDescription',

    'settings.darkModeEnabled': 'DarkModeEnabled',

    'settings.lightModeEnabled': 'LightModeEnabled',

    'settings.language': 'Language',

    'settings.selectLanguage': 'SelectLanguage',

    'settings.colorSchemeTitle': 'ColorSchemeTitle',

    'settings.colorSchemeDescription': 'ColorSchemeDescription',

    'settings.clinic': 'Clinic',

    'settings.clinicInfoSubtitle': 'Titel',

    'settings.clinicName': 'ClinicName',

    'settings.contactEmail': 'ContactEmail',

    'settings.phoneNumber': 'PhoneNumber',

    'settings.address': 'Adres',

    'settings.contactSettingsNotice': 'ContactSettingsNotice',

    'settings.notifications': 'Notifications',

    'settings.notificationSettingsSubtitle': 'Titel',

    'settings.stockAlertsLabel': 'StockAlertsLabel',

    'settings.stockAlertsDescription': 'StockAlertsDescription',

    'settings.emailNotificationsLabel': 'EmailNotificationsLabel',

    'settings.emailNotificationsDescription': 'EmailNotificationsDescription',

    'settings.browserNotificationsLabel': 'BrowserNotificationsLabel',

    'settings.browserNotificationsDescription': 'BrowserNotificationsDescription',

    'settings.systemInfoTitle': 'SystemInfoTitle',

    'settings.systemInfoSubtitle': 'Titel',

    'settings.versionLabel': 'VersionLabel',

    'settings.lastUpdateLabel': 'LastUpdateLabel',

    'settings.supportLabel': 'SupportLabel',

    'settingspa.positive': 'Positive',

    'settings.settingsSaved': 'SettingsSaved',

    'settings.settingsSaveError': 'SettingsSaveError',

    'settings.styleGuideTitle': 'StyleGuideTitle',

    'settings.styleGuideSubtitle': 'Titel',

    'settings.colorsSection': 'ColorsSection',

    'settings.primaryColors': 'PrimaryColors',

    'settings.neutralColors': 'NeutralColors',

    'settings.typographySection': 'TypographySection',

    'settings.buttonsSection': 'Knop',

    'settings.solidButtons': 'Knop',

    'settings.primaryButton': 'Knop',

    'settings.secondaryButton': 'Knop',

    'settings.successButton': 'Knop',

    'settings.warningButton': 'Knop',

    'settings.dangerButton': 'Knop',

    'settings.infoButton': 'Knop',

    'settings.outlinedButtons': 'Knop',

    'settings.flatButtons': 'Knop',

    'settings.iconButtons': 'Knop',

    'settings.addProductButton': 'Knop',

    'settings.editButton': 'Knop',

    'settings.deleteButton': 'Knop',

    'settings.saveButton': 'Knop',

    'settings.downloadButton': 'Knop',

    'settings.cardsSection': 'CardsSection',

    'settings.cards.defaultCard.title': 'Titel',

    'settings.cards.defaultCard.subtitle': 'Ondertitel',

    'settings.cards.defaultCard.description': 'Beschrijving',

    'settings.cards.defaultCard.action': 'Action',

    'settings.cards.modernCard.title': 'Titel',

    'settings.cards.modernCard.subtitle': 'Ondertitel',

    'settings.cards.modernCard.description': 'Beschrijving',

    'settings.cards.modernCard.action': 'Action',

    'settings.cards.elevatedCard.title': 'Titel',

    'settings.cards.elevatedCard.subtitle': 'Ondertitel',

    'settings.cards.elevatedCard.description': 'Beschrijving',

    'settings.cards.elevatedCard.action': 'Action',

    'settings.cards.glassCard.title': 'Titel',

    'settings.cards.glassCard.subtitle': 'Ondertitel',

    'settings.cards.glassCard.description': 'Beschrijving',

    'settings.cards.glassCard.action': 'Action',

    'settings.cards.outlinedCard.title': 'Titel',

    'settings.cards.outlinedCard.subtitle': 'Ondertitel',

    'settings.cards.outlinedCard.description': 'Beschrijving',

    'settings.cards.outlinedCard.action': 'Action',

    'settings.cards.warningCard.title': 'Titel',

    'settings.cards.warningCard.subtitle': 'Ondertitel',

    'settings.cards.warningCard.description': 'Beschrijving',

    'settings.cards.warningCard.action': 'Action',

    'settings.shadowsSection': 'ShadowsSection',

    'settings.iconsSection': 'IconsSection',

    'suppliersPage.title': 'Titel',

    'suppliersPage.subtitle': 'Ondertitel',

    'suppliersPage.importSuppliers': 'ImportSuppliers',

    'suppliersPage.addSupplier': 'AddSupplier',

    'suppliersPage.active': 'Actief',

    'suppliersPage.inactive': 'Inactief',

    'suppliersPage.notLinked': 'NotLinked',

    'suppliersPage.autoSyncOn': 'AutoSyncOn',

    'suppliersPage.autoSyncOff': 'AutoSyncOff',

    'suppliersPage.neverSynced': 'NeverSynced',

    'suppliersPage.configureIntegration': 'ConfigureIntegration',

    'suppliersPage.syncProducts': 'SyncProducts',

    'suppliersPage.editSupplier': 'EditSupplier',

    'suppliersPage.deleteSupplier': 'DeleteSupplier',

    'suppliersPage.supplierName': 'SupplierName',

    'suppliersPage.contactEmail': 'ContactEmail',

    'suppliersPage.contactPhone': 'ContactPhone',

    'suppliersPage.website': 'Website',

    'suppliersPage.address': 'Adres',

    'suppliersPage.city': 'Stad',

    'suppliersPage.postalCode': 'PostalCode',

    'suppliersPage.country': 'Land',

    'suppliersPage.magentoVendorId': 'MagentoVendorId',

    'suppliersPage.notes': 'Notities',

    'suppliersPage.integrationSettings': 'IntegrationSettings',

    'suppliersPage.integrationType': 'IntegrationType',

    'suppliersPage.orderMethod': 'OrderMethod',

    'suppliersPage.autoSyncEnabled': 'AutoSyncEnabled',

    'suppliersPage.orderEmail': 'OrderEmail',

    'suppliersPage.apiEndpoint': 'ApiEndpoint',

    'suppliersPage.apiKey': 'ApiKey',

    'suppliersPage.ediEndpoint': 'EdiEndpoint',

    'suppliersPage.ediPartnerId': 'EdiPartnerId',

    'suppliersPage.activeSupplier': 'ActiveSupplier',

    'suppliersPage.manualIntegrationInfo': 'ManualIntegrationInfo',

    'actionqueu.actionfailedafterthismaxretri': 'Actionfailedafterthismaxretri',

    'actionqueu.noexecutorregisteredfor': 'Noexecutorregisteredfor',

    'admin.insufficientpermissionstobulk': 'Insufficientpermissionstobulk',

    'admin.insufficientpermissionstoview': 'Insufficientpermissionstoview',

    'admin.nopracticeselected': 'Nopracticeselected',

    'analytics.clinicidisrequired': 'Clinicidisrequired',

    'analytics.nopracticeidavailable': 'Nopracticeidavailable',

    'camerascan.cameradevicenotfound': 'Cameradevicenotfound',

    'camerascan.cameranotstarted': 'Cameranotstarted',

    'camerascan.torchnotsupportedon': 'Torchnotsupportedon',

    'camerascan.unabletoaccesscamera': 'Unabletoaccesscamera',

    'camerascan.unabletostartcamera': 'Unabletostartcamera',

    'counting.noactivecountingsession': 'Noactivecountingsession',

    'counting.sessionnotfound': 'Sessionnotfound',

    'dashboard.widgetcreationreturnednull': 'Widgetcreationreturnednull',

    'datasync.syncalreadyinprogress': 'Syncalreadyinprogress',

    'index.cannotaddofflineaction': 'Cannotaddofflineaction',

    'index.cannotdownloaddatadevice': 'Cannotdownloaddatadevice',

    'index.cannotsyncdeviceis': 'Cannotsyncdeviceis',

    'index.httpresponsestatusresponsestatuste': 'Httpresponsestatusresponsestatuste',

    'index.magentoapiconfigurationis': 'Magentoapiconfigurationis',

    'index.nopracticeidavailable': 'Nopracticeidavailable',

    'index.nopracticeselectedfor': 'Nopracticeselectedfor',

    'index.requesttimeout': 'Requesttimeout',

    'orders.status.draft': 'Concept',

    'orders.status.pending': 'In behandeling',

    'orders.status.confirmed': 'Bevestigd',

    'orders.status.shipped': 'Verzonden',

    'orders.status.delivered': 'Geleverd',

    'orders.status.cancelled': 'Geannuleerd',

    'orders.status.returned': 'Geretourneerd',

    'orders.table.orderNumber': 'Bestelnummer',

    'orders.table.supplier': 'Leverancier',

    'orders.table.orderDate': 'Besteldatum',

    'orders.table.status': 'Status',

    'orders.table.totalAmount': 'Totaalbedrag',

    'orders.table.expectedDelivery': 'Verwachte levering',

    'orders.table.actions': 'Acties',

};