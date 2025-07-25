export default {
  // FilterPanel general
  filterPanel: {
    title: 'Filters',
    showMore: 'Show more filters',
    showLess: 'Show fewer filters',
    resetAll: 'Reset all filters',
    clearAll: 'Clear all filters',
    apply: 'Apply',
    noFiltersActive: 'No active filters',
    filtersActive: '{count} filter(s) active',
  },

  // Product filters
  products: {
    title: 'Product Filters',
    description: 'Filter products by categories, suppliers, GS1 data, and stock status',
    fields: {
      search: {
        label: 'Search Products',
        placeholder: 'Search by name, SKU, brand...',
      },
      category: {
        label: 'Category',
        placeholder: 'Select category',
      },
      supplier: {
        label: 'Supplier',
        placeholder: 'Select supplier',
      },
      stockStatus: {
        label: 'Stock Status',
        placeholder: 'Select status',
        options: {
          inStock: 'In stock',
          lowStock: 'Low stock',
          outOfStock: 'Out of stock',
        },
      },
      priceRange: {
        label: 'Price Range',
        placeholder: {
          min: 'Min price',
          max: 'Max price',
        },
      },
      gtin: {
        label: 'GTIN/Barcode',
        placeholder: 'Enter GTIN or barcode',
        tooltip: 'Scan Global Trade Item Number',
      },
      countryOfOrigin: {
        label: 'Country of Origin',
        placeholder: 'Select country',
      },
      gpcBrickCode: {
        label: 'GPC Category',
        placeholder: 'Select GPC classification',
      },
      lifecycleStatus: {
        label: 'Lifecycle Status',
        placeholder: 'Select status',
        options: {
          active: 'Active',
          discontinued: 'Discontinued',
          new: 'New',
          phaseOut: 'Phase out',
        },
      },
      orderableOnly: {
        label: 'Orderable products only',
        tooltip: 'Show only products that can be ordered',
      },
    },
  },

  // Supplier filters
  suppliers: {
    title: 'Supplier Filters',
    description: 'Filter suppliers by name, contact info, location, and status',
    fields: {
      search: {
        label: 'Search Suppliers',
        placeholder: 'Search by name, email, phone...',
      },
      status: {
        label: 'Status',
        placeholder: 'Select status',
        options: {
          active: 'Active',
          inactive: 'Inactive',
        },
      },
      integrationType: {
        label: 'Integration Type',
        placeholder: 'Select type',
        options: {
          manual: 'Manual',
          magento: 'Magento',
          api: 'API Integration',
        },
      },
      country: {
        label: 'Country',
        placeholder: 'Select country',
      },
      city: {
        label: 'City',
        placeholder: 'Enter city',
      },
    },
  },

  // Order filters
  orders: {
    title: 'Order Filters',
    description: 'Filter orders by status, supplier, date range, and amount',
    fields: {
      status: {
        label: 'Order Status',
        placeholder: 'Select status',
        options: {
          draft: 'Draft',
          submitted: 'Submitted',
          confirmed: 'Confirmed',
          shipped: 'Shipped',
          delivered: 'Delivered',
          cancelled: 'Cancelled',
        },
      },
      supplier: {
        label: 'Supplier',
        placeholder: 'Select supplier',
      },
      orderDateRange: {
        label: 'Order Date Range',
        placeholder: {
          from: 'From date',
          to: 'To date',
        },
      },
      amountRange: {
        label: 'Amount Range',
        placeholder: {
          min: 'Min amount',
          max: 'Max amount',
        },
      },
      expectedDeliveryRange: {
        label: 'Expected Delivery',
        placeholder: {
          from: 'From date',
          to: 'To date',
        },
      },
    },
  },

  // Inventory filters
  inventory: {
    title: 'Inventory Filters',
    description: 'Filter inventory by location, product, category, and stock status',
    fields: {
      search: {
        label: 'Search Products',
        placeholder: 'Search by name, SKU...',
      },
      location: {
        label: 'Location',
        placeholder: 'Select location',
      },
      stockStatus: {
        label: 'Stock Status',
        placeholder: 'Select status',
        options: {
          inStock: 'In stock',
          lowStock: 'Low stock',
          outOfStock: 'Out of stock',
        },
      },
      category: {
        label: 'Category',
        placeholder: 'Select category',
      },
      quantityRange: {
        label: 'Quantity Range',
        placeholder: {
          min: 'Min quantity',
          max: 'Max quantity',
        },
      },
      lowStockOnly: {
        label: 'Low stock only',
        tooltip: 'Show only products with low stock',
      },
    },
  },

  // Common field types
  common: {
    scanBarcode: 'Scan Barcode',
    selectAll: 'Select all',
    deselectAll: 'Deselect all',
    noOptionsAvailable: 'No options available',
    loading: 'Loading...',
    error: 'Error loading options',
    retry: 'Retry',
    minValue: 'Min',
    maxValue: 'Max',
    fromDate: 'From date',
    toDate: 'To date',
  },
}; 