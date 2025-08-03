export default {
  // FilterPanel general
  filterPanel: {
    title: 'Filtros',
    showMore: 'Mostrar más filtros',
    showLess: 'Mostrar menos filtros',
    resetAll: 'Restablecer todos los filtros',
    clearAll: 'Limpiar todos los filtros',
    clearAllFilters: 'Limpiar Todos los Filtros',
    apply: 'Aplicar',
    applyFilters: 'Aplicar Filtros',
    cancel: 'Cancelar',
    filtersButton: 'Filtros',
    noFiltersActive: 'No hay filtros activos',
    filtersActive: '{count} filtro(s) activo(s)',
  },

  // Product filters
  products: {
    title: 'Filtros de Productos',
    description: 'Filtrar productos por categorías, proveedores, datos GS1 y estado de inventario',
    fields: {
      search: {
        label: 'Buscar Productos',
        placeholder: 'Buscar por nombre, SKU, marca...',
      },
      category: {
        label: 'Categoría',
        placeholder: 'Seleccionar categoría',
      },
      supplier: {
        label: 'Proveedor',
        placeholder: 'Seleccionar proveedor',
      },
      stockStatus: {
        label: 'Estado de Inventario',
        placeholder: 'Seleccionar estado',
        options: {
          inStock: 'En stock',
          lowStock: 'Stock bajo',
          outOfStock: 'Agotado',
        },
      },
      priceRange: {
        label: 'Rango de Precios',
        placeholder: {
          min: 'Precio mín.',
          max: 'Precio máx.',
        },
      },
      gtin: {
        label: 'GTIN/Código de Barras',
        placeholder: 'Introducir GTIN o código de barras',
        tooltip: 'Escanear Global Trade Item Number',
      },
      countryOfOrigin: {
        label: 'País de Origen',
        placeholder: 'Seleccionar país',
      },
      gpcBrickCode: {
        label: 'Categoría GPC',
        placeholder: 'Seleccionar clasificación GPC',
      },
      lifecycleStatus: {
        label: 'Estado del Ciclo de Vida',
        placeholder: 'Seleccionar estado',
        options: {
          active: 'Activo',
          discontinued: 'Descontinuado',
          new: 'Nuevo',
          phaseOut: 'Descatalogar',
        },
      },
      orderableOnly: {
        label: 'Solo productos pedibles',
        tooltip: 'Mostrar solo productos que se pueden pedir',
      },
    },
  },

  // Supplier filters
  suppliers: {
    title: 'Filtros de Proveedores',
    description: 'Filtrar proveedores por nombre, información de contacto, ubicación y estado',
    fields: {
      search: {
        label: 'Buscar Proveedores',
        placeholder: 'Buscar por nombre, email, teléfono...',
      },
      status: {
        label: 'Estado',
        placeholder: 'Seleccionar estado',
        options: {
          active: 'Activo',
          inactive: 'Inactivo',
        },
      },
      integrationType: {
        label: 'Tipo de Integración',
        placeholder: 'Seleccionar tipo',
        options: {
          manual: 'Manual',
          magento: 'Magento',
          api: 'Integración API',
        },
      },
      country: {
        label: 'País',
        placeholder: 'Seleccionar país',
      },
      city: {
        label: 'Ciudad',
        placeholder: 'Introducir ciudad',
      },
    },
  },

  // Order filters
  orders: {
    title: 'Filtros de Pedidos',
    description: 'Filtrar pedidos por estado, proveedor, rango de fechas y monto',
    fields: {
      status: {
        label: 'Estado del Pedido',
        placeholder: 'Seleccionar estado',
        options: {
          draft: 'Borrador',
          submitted: 'Enviado',
          confirmed: 'Confirmado',
          shipped: 'Enviado',
          delivered: 'Entregado',
          cancelled: 'Cancelado',
        },
      },
      supplier: {
        label: 'Proveedor',
        placeholder: 'Seleccionar proveedor',
      },
      orderDateRange: {
        label: 'Rango de Fecha de Pedido',
        placeholder: {
          from: 'Desde fecha',
          to: 'Hasta fecha',
        },
      },
      amountRange: {
        label: 'Rango de Monto',
        placeholder: {
          min: 'Monto mín.',
          max: 'Monto máx.',
        },
      },
      expectedDeliveryRange: {
        label: 'Entrega Esperada',
        placeholder: {
          from: 'Desde fecha',
          to: 'Hasta fecha',
        },
      },
    },
  },

  // Inventory filters
  inventory: {
    title: 'Filtros de Inventario',
    description: 'Filtrar inventario por ubicación, producto, categoría y estado de stock',
    fields: {
      search: {
        label: 'Buscar Productos',
        placeholder: 'Buscar por nombre, SKU...',
      },
      location: {
        label: 'Ubicación',
        placeholder: 'Seleccionar ubicación',
      },
      stockStatus: {
        label: 'Estado de Inventario',
        placeholder: 'Seleccionar estado',
        options: {
          inStock: 'En stock',
          lowStock: 'Stock bajo',
          outOfStock: 'Agotado',
        },
      },
      category: {
        label: 'Categoría',
        placeholder: 'Seleccionar categoría',
      },
      quantityRange: {
        label: 'Rango de Cantidad',
        placeholder: {
          min: 'Cantidad mín.',
          max: 'Cantidad máx.',
        },
      },
      lowStockOnly: {
        label: 'Solo stock bajo',
        tooltip: 'Mostrar solo productos con stock bajo',
      },
    },
  },

  // Order Lists filters
  orderLists: {
    title: 'Filtros de Listas de Pedidos',
    description: 'Filtrar listas de pedidos por nombre, proveedor y estado',
    fields: {
      search: {
        label: 'Buscar Listas de Pedidos',
        placeholder: 'Buscar por nombre, descripción...',
      },
      supplier: {
        label: 'Proveedor',
        placeholder: 'Seleccionar proveedor',
      },
      status: {
        label: 'Estado',
        placeholder: 'Seleccionar estado',
        options: {
          draft: 'Borrador',
          active: 'Activo',
          submitted: 'Enviado',
          archived: 'Archivado',
        },
      },
    },
  },

  // Stock Movements filters
  movements: {
    title: 'Filtros de Movimientos de Stock',
    description: 'Filtrar movimientos de stock por tipo, ubicación, fecha y producto',
    fields: {
      movementType: {
        label: 'Tipo de Movimiento',
        placeholder: 'Seleccionar tipo',
      },
      location: {
        label: 'Ubicación',
        placeholder: 'Seleccionar ubicación',
      },
      dateRange: {
        label: 'Rango de Fechas',
        placeholder: {
          from: 'Desde fecha',
          to: 'Hasta fecha',
        },
      },
      productSearch: {
        label: 'Buscar Productos',
        placeholder: 'Buscar por nombre o SKU...',
      },
    },
  },

  // Locations filters
  locations: {
    title: 'Filtros de Ubicaciones',
    description: 'Filtrar ubicaciones por nombre, tipo y propiedades',
    fields: {
      search: {
        label: 'Buscar Ubicaciones',
        placeholder: 'Buscar por nombre, tipo, descripción...',
      },
      type: {
        label: 'Tipo de Ubicación',
        placeholder: 'Seleccionar tipo',
      },
      isMain: {
        label: 'Ubicación Principal',
      },
    },
  },

  // Common field types
  common: {
    scanBarcode: 'Escanear Código de Barras',
    selectAll: 'Seleccionar todo',
    deselectAll: 'Deseleccionar todo',
    noOptionsAvailable: 'No hay opciones disponibles',
    loading: 'Cargando...',
    error: 'Error al cargar opciones',
    retry: 'Reintentar',
    minValue: 'Mín.',
    maxValue: 'Máx.',
    fromDate: 'Desde fecha',
    toDate: 'Hasta fecha',
  },
}; 