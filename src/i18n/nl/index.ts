export default {
  // Common/Global
  common: {
    save: 'Opslaan',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    edit: 'Bewerken',
    add: 'Toevoegen',
    search: 'Zoeken',
    loading: 'Laden...',
    error: 'Fout',
    success: 'Succes',
    warning: 'Waarschuwing',
    info: 'Informatie',
    yes: 'Ja',
    no: 'Nee',
    close: 'Sluiten',
    back: 'Terug',
    next: 'Volgende',
    previous: 'Vorige',
    submit: 'Verzenden',
    refresh: 'Vernieuwen'
  },

  // Navigation
  nav: {
    dashboard: 'Dashboard',
    products: 'Producten',
    orders: 'Bestellingen',
    invoices: 'Facturen',
    settings: 'Instellingen',
    logout: 'Uitloggen',
    profile: 'Profiel'
  },

  // Authentication
  auth: {
    login: 'Inloggen',
    logout: 'Uitloggen',
    email: 'E-mailadres',
    password: 'Wachtwoord',
    forgotPassword: 'Wachtwoord vergeten?',
    resetPassword: 'Wachtwoord resetten',
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
    platformDescription: 'Stroomlijn je medische voorraadbeheeer met ons enterprise-grade platform. Volg voorraad, beheer bestellingen, en zorg voor compliance met gemak.',
    realtimeTracking: 'Real-time voorraad tracking',
    automatedAlerts: 'Geautomatiseerde herbestel waarschuwingen',
    complianceReporting: 'Compliance rapportage',
    multilocationSupport: 'Multi-locatie ondersteuning'
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
    totalProducts: 'Totaal aantal producten',
    reorderSuggestions: 'Bestel suggesties',
    outOfStock: 'Niet op voorraad',
    lowStock: 'Lage voorraad',
    inStock: 'Op voorraad',
    noLowStock: 'Alles op voorraad!',
    allProductsWellStocked: 'Alle producten zijn goed voorzien van voorraad',
    viewAllProducts: 'Alle producten bekijken',
    viewMore: 'Bekijk {count} meer',
    quickActions: 'Snelle acties',
    addProduct: 'Product toevoegen',
    addNewProduct: 'Voeg een nieuw product toe aan je voorraad',
    manageStock: 'Voorraad beheren',
    updateStockLevels: 'Update voorraadniveaus en instellingen',
    viewOrders: 'Bestellingen bekijken',
    manageOrders: 'Beheer bestellingen en ordergeschiedenis',
    configureSystem: 'Configureer systeeminstellingen',
    dataRefreshed: 'Gegevens succesvol vernieuwd',
    recentActivity: 'Recente activiteit',
    itemsRequiringAttention: 'Artikelen die aandacht nodig hebben',
    commonTasks: 'Algemene taken',
    exportToCsv: 'Exporteren naar CSV',
    currentMin: 'Huidig / min',
    latestUpdates: 'Laatste updates'
  },

  // Products
  products: {
    title: 'Producten',
    productName: 'Productnaam',
    productSku: 'Artikelnummer',
    currentStock: 'Huidige voorraad',
    minimumStock: 'Minimum voorraad',
    maximumStock: 'Maximum voorraad',
    reorderEnabled: 'Automatisch bijbestellen',
    lowStockAlert: 'Waarschuwing lage voorraad',
    addProduct: 'Product toevoegen',
    editProduct: 'Product bewerken',
    deleteProduct: 'Product verwijderen',
    stockLevel: 'Voorraadniveau',
    reorderSuggestion: 'Bestel {quantity} stuks om maximum voorraad te bereiken',
    lowStockWarning: 'Lage voorraad! Huidige voorraad: {current}, minimum: {minimum}',
    outOfStockWarning: 'Niet op voorraad!',
    inStock: 'Op voorraad',
    outOfStock: 'Niet op voorraad',
    lowStock: 'Lage voorraad',
    description: 'Beschrijving'
  },

  // Stock Alerts
  alerts: {
    lowStock: 'Lage voorraad waarschuwing',
    outOfStock: 'Niet op voorraad',
    reorderSuggestion: 'Bestel suggestie',
    stockUpdated: 'Voorraad bijgewerkt',
    productAdded: 'Product toegevoegd',
    productUpdated: 'Product bijgewerkt',
    productDeleted: 'Product verwijderd'
  },

  // Errors
  errors: {
    generic: 'Er is een fout opgetreden. Probeer het opnieuw.',
    network: 'Netwerkfout. Controleer je internetverbinding.',
    unauthorized: 'Je bent niet geautoriseerd voor deze actie.',
    notFound: 'De opgevraagde resource is niet gevonden.',
    validation: 'Validatiefout. Controleer de ingevoerde gegevens.',
    serverError: 'Serverfout. Probeer het later opnieuw.'
  },

  // Error pages
  error: {
    pageNotFound: 'Pagina niet gevonden',
    goHome: 'Ga naar home'
  },

  // Validation
  validation: {
    required: 'Dit veld is verplicht',
    email: 'Voer een geldig e-mailadres in',
    minLength: 'Minimaal {min} karakters vereist',
    maxLength: 'Maximaal {max} karakters toegestaan',
    numeric: 'Alleen cijfers toegestaan',
    positive: 'Waarde moet positief zijn',
    positiveNumber: 'Waarde moet een positief getal zijn',
    integer: 'Alleen hele getallen toegestaan'
  },

  // Settings
  settings: {
    title: 'Instellingen',
    general: 'Algemeen',
    darkMode: 'Donkere modus',
    language: 'Taal',
    notifications: 'Meldingen',
    clinic: 'Kliniek instellingen',
    profile: 'Profiel instellingen'
  }
} 