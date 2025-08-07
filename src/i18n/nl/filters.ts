export default {
  // FilterPanel algemeen
  filterPanel: {
    title: 'Filters',
    showMore: 'Toon meer filters',
    showLess: 'Toon minder filters',
    resetAll: 'Reset alle filters',
    clearAll: 'Wis alle filters',
    clearAllFilters: 'Alle filters wissen',
    apply: 'Toepassen',
    applyFilters: 'Filters toepassen',
    cancel: 'Annuleren',
    filtersButton: 'Filters',
    noFiltersActive: 'Geen actieve filters',
    filtersActive: '{count} filter(s) actief',
  },

  // Product filters
  products: {
    title: 'Productfilters',
    description:
      'Filter producten op categorieën, leveranciers, GS1 gegevens en voorraadstatus',
    groups: {
      search: {
        label: 'Zoeken',
        description: 'Zoek door alle productgegevens',
      },
      catalog: {
        label: 'Catalogus',
        description: 'Filter op productcategorieën en eigenschappen',
      },
      inventory: {
        label: 'Voorraad',
        description: 'Filter op voorraadstatus en beschikbaarheid',
      },
      advanced: {
        label: 'Geavanceerd',
        description: 'GS1 gegevens en technische specificaties',
      },
    },
    fields: {
      search: {
        label: 'Zoek producten',
        placeholder: 'Naam, SKU, merk...',
      },
      category: {
        label: 'Categorie',
        placeholder: 'Selecteer categorie',
      },
      supplier: {
        label: 'Leverancier',
        placeholder: 'Selecteer leverancier',
      },
      stockStatus: {
        label: 'Voorraadstatus',
        placeholder: 'Selecteer status',
        options: {
          inStock: 'Op voorraad',
          lowStock: 'Lage voorraad',
          outOfStock: 'Uitverkocht',
        },
      },
      priceRange: {
        label: 'Prijsbereik',
        placeholder: {
          min: 'Min prijs',
          max: 'Max prijs',
        },
      },
      gtin: {
        label: 'GTIN/Barcode',
        placeholder: 'GTIN of barcode',
        tooltip: 'Global Trade Item Number scannen',
      },
      countryOfOrigin: {
        label: 'Land van herkomst',
        placeholder: 'Selecteer land',
      },
      gpcBrickCode: {
        label: 'GPC Categorie',
        placeholder: 'GPC classificatie',
      },
      lifecycleStatus: {
        label: 'Levenscyclus status',
        placeholder: 'Selecteer status',
        options: {
          active: 'Actief',
          discontinued: 'Gestopt',
          new: 'Nieuw',
          phaseOut: 'Uitfasering',
        },
      },
      orderableOnly: {
        label: 'Alleen bestelbare producten',
        tooltip: 'Toon alleen producten die besteld kunnen worden',
      },
    },
  },

  // Supplier filters
  suppliers: {
    title: 'Leverancierfilters',
    description:
      'Filter leveranciers op naam, contactgegevens, locatie en status',
    fields: {
      search: {
        label: 'Zoek leveranciers',
        placeholder: 'Zoek op naam, email, telefoon...',
      },
      status: {
        label: 'Status',
        placeholder: 'Selecteer status',
        options: {
          active: 'Actief',
          inactive: 'Inactief',
        },
      },
      integrationType: {
        label: 'Integratie type',
        placeholder: 'Selecteer type',
        options: {
          manual: 'Handmatig',
          magento: 'Magento',
          api: 'API Integratie',
        },
      },
      country: {
        label: 'Land',
        placeholder: 'Selecteer land',
      },
      city: {
        label: 'Stad',
        placeholder: 'Voer stad in',
      },
    },
  },

  // Order filters
  orders: {
    title: 'Bestellingfilters',
    description:
      'Filter bestellingen op status, leverancier, datumbereik en bedrag',
    fields: {
      status: {
        label: 'Bestelling status',
        placeholder: 'Selecteer status',
        options: {
          draft: 'Concept',
          submitted: 'Ingediend',
          confirmed: 'Bevestigd',
          shipped: 'Verzonden',
          delivered: 'Geleverd',
          cancelled: 'Geannuleerd',
        },
      },
      supplier: {
        label: 'Leverancier',
        placeholder: 'Selecteer leverancier',
      },
      orderDateRange: {
        label: 'Besteldatum bereik',
        placeholder: {
          from: 'Van datum',
          to: 'Tot datum',
        },
      },
      amountRange: {
        label: 'Bedrag bereik',
        placeholder: {
          min: 'Min bedrag',
          max: 'Max bedrag',
        },
      },
      expectedDeliveryRange: {
        label: 'Verwachte levering',
        placeholder: {
          from: 'Van datum',
          to: 'Tot datum',
        },
      },
    },
  },

  // Inventory filters
  inventory: {
    title: 'Voorraadfilters',
    description:
      'Filter voorraad op locatie, product, categorie en voorraadstatus',
    fields: {
      search: {
        label: 'Zoek Producten',
        placeholder: 'Zoek op naam, SKU...',
      },
      location: {
        label: 'Locatie',
        placeholder: 'Selecteer locatie',
      },
      stockStatus: {
        label: 'Voorraadstatus',
        placeholder: 'Selecteer status',
        options: {
          inStock: 'Op voorraad',
          lowStock: 'Lage voorraad',
          outOfStock: 'Uitverkocht',
        },
      },
      category: {
        label: 'Categorie',
        placeholder: 'Selecteer categorie',
      },
      quantityRange: {
        label: 'Hoeveelheid bereik',
        placeholder: {
          min: 'Min aantal',
          max: 'Max aantal',
        },
      },
      lowStockOnly: {
        label: 'Alleen lage voorraad',
        tooltip: 'Toon alleen producten met lage voorraad',
      },
    },
  },

  // Order Lists filters
  orderLists: {
    title: 'Bestellijstfilters',
    description: 'Filter bestellijsten op naam, leverancier en status',
    fields: {
      search: {
        label: 'Zoek bestellijsten',
        placeholder: 'Zoek op naam, beschrijving...',
      },
      supplier: {
        label: 'Leverancier',
        placeholder: 'Selecteer leverancier',
      },
      status: {
        label: 'Status',
        placeholder: 'Selecteer status',
        options: {
          draft: 'Concept',
          active: 'Actief',
          submitted: 'Ingediend',
          archived: 'Gearchiveerd',
        },
      },
    },
  },

  // Stock Movements filters
  movements: {
    title: 'Voorraadmutatiefilters',
    description: 'Filter voorraadmutaties op type, locatie, datum en product',
    fields: {
      movementType: {
        label: 'Mutatie type',
        placeholder: 'Selecteer type',
      },
      location: {
        label: 'Locatie',
        placeholder: 'Selecteer locatie',
      },
      dateRange: {
        label: 'Datum bereik',
        placeholder: {
          from: 'Van datum',
          to: 'Tot datum',
        },
      },
      productSearch: {
        label: 'Product zoeken',
        placeholder: 'Zoek op productnaam of SKU...',
      },
    },
  },

  // Locations filters
  locations: {
    title: 'Locatiefilters',
    description: 'Filter locaties op naam, type en eigenschappen',
    fields: {
      search: {
        label: 'Zoek locaties',
        placeholder: 'Zoek op naam, type, beschrijving...',
      },
      type: {
        label: 'Locatie type',
        placeholder: 'Selecteer type',
      },
      isMain: {
        label: 'Hoofdlocatie',
        tooltip: 'Toon alleen hoofdlocaties',
      },
    },
  },

  // Common field types
  common: {
    scanBarcode: 'Scan Barcode',
    selectAll: 'Selecteer alles',
    deselectAll: 'Deselecteer alles',
    noOptionsAvailable: 'Geen opties beschikbaar',
    loading: 'Laden...',
    error: 'Fout bij laden van opties',
    retry: 'Opnieuw proberen',
    min: 'Min',
    max: 'Max',
    minValue: 'Min',
    maxValue: 'Max',
    from: 'Van',
    to: 'Tot',
    fromDate: 'Van datum',
    toDate: 'Tot datum',
  },
};
