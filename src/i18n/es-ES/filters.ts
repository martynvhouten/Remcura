export default {
  // FilterPanel general
  filterPanel: {
    title: 'Filtros',
    showMore: 'Mostrar más filtros',
    showLess: 'Mostrar menos filtros',
    resetAll: 'Restablecer todos los filtros',
    clearAll: 'Limpiar todos los filtros',
    apply: 'Aplicar',
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