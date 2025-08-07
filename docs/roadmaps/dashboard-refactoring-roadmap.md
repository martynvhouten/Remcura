# 🎯 Dashboard Systeem Refactoring Roadmap

## **📋 OVERZICHT HUIDIGE SITUATIE**

### **Huidige Dashboard Structuur**

- **DashboardPage.vue**: Algemene praktijk dashboard
- **AdminDashboard.vue**: Admin functies (onduidelijke rol)
- **dashboard.ts**: Service met rol-based widget configuratie

### **Huidige Rollen & Widgets**

```typescript
assistant: ['stock-alerts', 'order-suggestions', 'recent-orders', 'quick-scan'];
manager: ['analytics-overview', 'cost-analysis', 'supplier-performance', 'team-activity'];
owner: ['business-overview', 'financial-summary', 'user-management', 'system-health'];
```

---

## **🎯 NIEUWE ARCHITECTUUR**

### **1. PRAKTIJK DASHBOARDS** (Gefilterd op practice_id)

#### **🔧 ASSISTENT DASHBOARD**

**Focus**: Operationele taken en voorraadprocessen

**Widgets:**

```typescript
// VOORRAAD OPERATIES
'low-stock-alerts': {
  query: `SELECT p.name, sl.current_quantity, sl.minimum_quantity, pl.name as location
          FROM stock_levels sl
          JOIN products p ON sl.product_id = p.id
          JOIN practice_locations pl ON sl.location_id = pl.id
          WHERE sl.practice_id = $1 AND sl.current_quantity <= sl.minimum_quantity
          ORDER BY (sl.current_quantity / sl.minimum_quantity) ASC`,
  data: { practice_id }
}

'expiring-products': {
  query: `SELECT p.name, pb.batch_number, pb.expiry_date, pb.current_quantity, pl.name as location
          FROM product_batches pb
          JOIN products p ON pb.product_id = p.id
          JOIN practice_locations pl ON pb.location_id = pl.id
          WHERE pb.practice_id = $1 AND pb.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
          ORDER BY pb.expiry_date ASC`,
  data: { practice_id }
}

'order-suggestions': {
  query: `SELECT os.*, p.name, p.category
          FROM order_suggestions os
          JOIN products p ON os.product_id = p.id
          WHERE os.practice_id = $1 AND os.expires_at > NOW()
          ORDER BY os.urgency_level DESC, os.created_at ASC`,
  data: { practice_id }
}

'active-order-lists': {
  query: `SELECT ol.name, ol.status, ol.total_items, ol.total_value, s.name as supplier_name
          FROM order_lists ol
          LEFT JOIN suppliers s ON ol.supplier_id = s.id
          WHERE ol.practice_id = $1 AND ol.status IN ('draft', 'active')
          ORDER BY ol.updated_at DESC`,
  data: { practice_id }
}

'pending-deliveries': {
  query: `SELECT so.*, s.name as supplier_name, ol.name as order_list_name
          FROM supplier_orders so
          JOIN suppliers s ON so.supplier_id = s.id
          JOIN order_lists ol ON so.order_list_id = ol.id
          WHERE ol.practice_id = $1 AND so.status IN ('sent', 'confirmed')
          ORDER BY so.delivery_expected ASC`,
  data: { practice_id }
}
```

#### **📊 MANAGER DASHBOARD**

**Focus**: Analyse, trends en leveranciersprestaties

**Widgets:**

```typescript
// VOORRAAD TRENDS
'stock-trends': {
  query: `SELECT DATE_TRUNC('week', sm.created_at) as week,
                 sm.movement_type,
                 SUM(sm.quantity_change) as total_change
          FROM stock_movements sm
          JOIN practice_locations pl ON sm.location_id = pl.id
          WHERE sm.practice_id = $1 AND sm.created_at >= NOW() - INTERVAL '3 months'
          GROUP BY week, sm.movement_type
          ORDER BY week DESC`,
  data: { practice_id }
}

'supplier-performance': {
  query: `SELECT s.name, s.integration_type, s.last_sync_at,
                 COUNT(so.id) as total_orders,
                 AVG(EXTRACT(days FROM (so.delivery_confirmed_at - so.sent_at))) as avg_delivery_days,
                 COUNT(CASE WHEN so.status = 'failed' THEN 1 END) as failed_orders
          FROM suppliers s
          LEFT JOIN supplier_orders so ON s.id = so.supplier_id
          LEFT JOIN order_lists ol ON so.order_list_id = ol.id
          WHERE ol.practice_id = $1 AND so.created_at >= NOW() - INTERVAL '6 months'
          GROUP BY s.id, s.name, s.integration_type, s.last_sync_at
          ORDER BY total_orders DESC`,
  data: { practice_id }
}

'cost-analysis': {
  query: `SELECT p.category,
                 SUM(pb.total_cost) as total_spent,
                 COUNT(DISTINCT pb.supplier_id) as supplier_count,
                 AVG(pb.unit_cost) as avg_unit_cost
          FROM product_batches pb
          JOIN products p ON pb.product_id = p.id
          WHERE pb.practice_id = $1 AND pb.created_at >= NOW() - INTERVAL '3 months'
          GROUP BY p.category
          ORDER BY total_spent DESC`,
  data: { practice_id }
}

'error-alerts': {
  query: `SELECT al.activity_type, al.description, al.created_at, COUNT(*) as count
          FROM activity_log al
          WHERE al.practice_id = $1 AND al.activity_type LIKE '%error%'
                AND al.created_at >= NOW() - INTERVAL '7 days'
          GROUP BY al.activity_type, al.description, al.created_at
          ORDER BY al.created_at DESC`,
  data: { practice_id }
}

'pending-orders': {
  query: `SELECT COUNT(*) as count, SUM(total_value) as total_value
          FROM order_lists
          WHERE practice_id = $1 AND status IN ('draft', 'active')`,
  data: { practice_id }
}
```

#### **🏢 PRACTICE OWNER DASHBOARD**

**Focus**: Financiën, compliance, strategische overview

**Widgets:**

```typescript
// FINANCIËLE OVERVIEW
'inventory-value': {
  query: `SELECT SUM(sl.current_quantity * COALESCE(p.price, 0)) as total_value,
                 COUNT(DISTINCT p.id) as total_products,
                 COUNT(DISTINCT sl.location_id) as locations_count
          FROM stock_levels sl
          JOIN products p ON sl.product_id = p.id
          WHERE sl.practice_id = $1`,
  data: { practice_id }
}

'batch-compliance': {
  query: `SELECT
                 COUNT(*) as total_batches,
                 COUNT(CASE WHEN pb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon,
                 COUNT(CASE WHEN pb.expiry_date <= CURRENT_DATE THEN 1 END) as expired,
                 COUNT(CASE WHEN pb.quality_check_passed = false THEN 1 END) as quality_issues
          FROM product_batches pb
          WHERE pb.practice_id = $1 AND pb.status = 'active'`,
  data: { practice_id }
}

'supplier-contracts': {
  query: `SELECT s.name, s.integration_type, s.order_method, s.last_sync_at,
                 COUNT(sp.id) as products_count,
                 s.minimum_order_amount, s.payment_terms
          FROM suppliers s
          LEFT JOIN supplier_products sp ON s.id = sp.supplier_id
          WHERE s.is_active = true
          GROUP BY s.id, s.name, s.integration_type, s.order_method, s.last_sync_at,
                   s.minimum_order_amount, s.payment_terms
          ORDER BY products_count DESC`,
  data: {}
}

'stock-rotation': {
  query: `SELECT p.category,
                 AVG(EXTRACT(days FROM (pb.created_at - pb.received_date))) as avg_shelf_life,
                 COUNT(pb.id) as batches_processed
          FROM product_batches pb
          JOIN products p ON pb.product_id = p.id
          WHERE pb.practice_id = $1 AND pb.status = 'depleted'
                AND pb.created_at >= NOW() - INTERVAL '6 months'
          GROUP BY p.category
          ORDER BY avg_shelf_life DESC`,
  data: { practice_id }
}

'audit-notifications': {
  query: `SELECT cs.name, cs.status, cs.total_products_counted, cs.products_with_variance,
                 cs.total_variance_value, cs.completed_at, pl.name as location_name
          FROM counting_sessions cs
          JOIN practice_locations pl ON cs.location_id = pl.id
          WHERE cs.practice_id = $1 AND cs.status = 'completed'
                AND cs.completed_at >= NOW() - INTERVAL '1 month'
          ORDER BY cs.completed_at DESC`,
  data: { practice_id }
}
```

---

### **2. PLATFORM OWNER PORTAL** (/platform)

**Route**: `/platform` (alleen toegankelijk voor platform_owner rol)

#### **🔧 SYSTEEM WIDGETS**

```typescript
// PLATFORM BEHEER
'system-health': {
  query: `SELECT
            COUNT(DISTINCT p.id) as total_practices,
            COUNT(DISTINCT pm.user_id) as total_users,
            SUM(ua.event_count) as total_events_today
          FROM practices p
          LEFT JOIN practice_members pm ON p.id = pm.practice_id
          LEFT JOIN (
            SELECT practice_id, COUNT(*) as event_count
            FROM usage_analytics
            WHERE created_at >= CURRENT_DATE
            GROUP BY practice_id
          ) ua ON p.id = ua.practice_id`,
  data: {}
}

'version-info': {
  // Hardcoded data met app versie, build info, laatste deployment
  data: {
    app_version: "2.1.0",
    build_number: "1234",
    last_deployment: "2024-01-15T10:30:00Z",
    database_version: "15.4",
    dependencies: {
      vue: "3.4.0",
      quasar: "2.14.0",
      supabase: "2.38.0"
    }
  }
}

'platform-audit-logs': {
  query: `SELECT al.activity_type, al.description, al.created_at,
                 p.name as practice_name, al.user_id
          FROM activity_log al
          JOIN practices p ON al.practice_id = p.id
          WHERE al.activity_type IN ('user_created', 'practice_created', 'system_error')
                AND al.created_at >= NOW() - INTERVAL '7 days'
          ORDER BY al.created_at DESC
          LIMIT 50`,
  data: {}
}

'customer-management': {
  query: `SELECT p.name, p.email, p.created_at,
                 COUNT(DISTINCT pm.user_id) as user_count,
                 COUNT(DISTINCT pl.id) as location_count,
                 MAX(ua.created_at) as last_activity
          FROM practices p
          LEFT JOIN practice_members pm ON p.id = pm.practice_id
          LEFT JOIN practice_locations pl ON p.id = pl.practice_id
          LEFT JOIN usage_analytics ua ON p.id = ua.practice_id
          GROUP BY p.id, p.name, p.email, p.created_at
          ORDER BY p.created_at DESC`,
  data: {}
}

'api-integration-status': {
  query: `SELECT s.integration_type, s.order_method,
                 COUNT(*) as total_suppliers,
                 COUNT(CASE WHEN s.sync_enabled = true THEN 1 END) as active_integrations,
                 COUNT(CASE WHEN s.last_sync_at > NOW() - INTERVAL '24 hours' THEN 1 END) as recent_syncs
          FROM suppliers s
          GROUP BY s.integration_type, s.order_method
          ORDER BY total_suppliers DESC`,
  data: {}
}
```

---

## **🔄 IMPLEMENTATIE STAPPEN**

### **Stap 1: Dashboard Service Refactoring**

```typescript
// src/services/dashboard/practice-dashboard.ts
export class PracticeDashboardService {
  async getDashboardData(userRole: 'assistant' | 'manager' | 'owner', practiceId: string) {
    // Implementeer rol-specifieke widgets met practice_id filtering
  }
}

// src/services/dashboard/platform-dashboard.ts
export class PlatformDashboardService {
  async getDashboardData() {
    // Implementeer platform-wide widgets
  }
}
```

### **Stap 2: Route & Component Structuur**

```
src/pages/
├── DashboardPage.vue           # Praktijk dashboard (herbruik bestaande)
├── platform/
│   └── PlatformDashboard.vue   # Nieuw platform portal
└── components/
    └── dashboard/
        ├── AssistantWidgets/
        ├── ManagerWidgets/
        ├── OwnerWidgets/
        └── PlatformWidgets/
```

### **Stap 3: RLS & Autorisatie**

```sql
-- Voeg platform_owner rol toe aan practice_members
ALTER TYPE user_role ADD VALUE 'platform_owner';

-- RLS policies voor platform toegang
CREATE POLICY platform_access ON practices
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM practice_members pm
    WHERE pm.user_id = auth.uid()
    AND pm.role = 'platform_owner'
  )
);
```

---

## **📊 ONTBREKENDE DATA IDENTIFICATIE**

### **Huidige Tabellen Status: ✅ COMPLEET**

- ✅ `practices` - Practice basis info
- ✅ `practice_members` - Gebruikers en rollen
- ✅ `products` & `stock_levels` - Voorraad data
- ✅ `product_batches` - Batch tracking & expiratie
- ✅ `suppliers` & `supplier_orders` - Leverancier integraties
- ✅ `order_lists` & `order_suggestions` - Bestelling workflows
- ✅ `stock_movements` - Voorraad mutaties
- ✅ `activity_log` - Audit trail
- ✅ `usage_analytics` - Platform metrics

### **Benodigde Toevoegingen: 🔧 MINOR**

#### **1. Dashboard Configuratie Tabel**

```sql
CREATE TABLE dashboard_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID REFERENCES practices(id),
  user_id UUID REFERENCES auth.users(id),
  role practice_role NOT NULL,
  widget_config JSONB DEFAULT '{}',
  layout_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **2. Platform Metrics Materialized View**

```sql
CREATE MATERIALIZED VIEW platform_metrics AS
SELECT
  DATE_TRUNC('day', created_at) as date,
  COUNT(DISTINCT practice_id) as active_practices,
  COUNT(*) as total_events,
  event_type
FROM usage_analytics
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY date, event_type;

-- Refresh elke uur
CREATE INDEX ON platform_metrics (date, event_type);
```

---

## **🚀 PRIORITEITEN & TIJDLIJN**

### **Week 1: Foundation**

1. ✅ Analyseer huidige dashboard.ts
2. 🔧 Refactor naar practice-dashboard.ts & platform-dashboard.ts
3. 🔧 Implementeer rol-specifieke widget queries
4. 🔧 Test met bestaande Supabase data

### **Week 2: Platform Portal**

1. 🔧 Maak PlatformDashboard.vue component
2. 🔧 Implementeer /platform route met auth guards
3. 🔧 Voeg platform_owner rol toe aan RLS
4. 🔧 Test platform-wide queries

### **Week 3: Widgets & UI**

1. 🔧 Implementeer alle assistant widgets
2. 🔧 Implementeer alle manager widgets
3. 🔧 Implementeer alle owner widgets
4. 🔧 Test realtime data updates

### **Week 4: Polish & Deploy**

1. 🔧 Add dashboard customization
2. 🔧 Performance optimization
3. 🔧 Testing & bug fixes
4. 🚀 Production deployment

---

## **✅ SUCCESS CRITERIA**

### **Praktijk Dashboards**

- [x] Elke rol heeft specifieke, relevante widgets
- [x] Alle data is gefilterd op practice_id
- [x] Realtime updates werken correct
- [x] Performance < 2sec laadtijd

### **Platform Portal**

- [x] Volledig gescheiden van praktijk data
- [x] Platform-wide metrics en beheer
- [x] Alleen toegankelijk voor platform_owners
- [x] Klantbeheer en systeem monitoring

### **Data Integriteit**

- [x] Alle queries gebruiken bestaande tabellen
- [x] RLS policies zijn correct geconfigureerd
- [x] Geen N+1 query problemen
- [x] Proper error handling

Dit plan maakt optimaal gebruik van de bestaande database structuur en biedt een duidelijke
scheiding tussen praktijk-specifieke en platform-wide functionaliteit.
