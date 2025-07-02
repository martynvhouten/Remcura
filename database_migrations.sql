-- ============================================================================
-- MedStock Pro - Enhanced Inventory Management Schema
-- Multi-supplier, multi-location inventory system
-- ============================================================================

-- Drop existing tables that conflict with new design (if they exist)
DROP TABLE IF EXISTS supplier_products CASCADE;
DROP TABLE IF EXISTS stock_levels CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS counting_sessions CASCADE;
DROP TABLE IF EXISTS counting_entries CASCADE;
DROP TABLE IF EXISTS order_lists CASCADE;
DROP TABLE IF EXISTS order_list_items CASCADE;
DROP TABLE IF EXISTS practice_inventory_settings CASCADE;

-- ============================================================================
-- 1. SUPPLIER-PRODUCT RELATIONSHIPS
-- ============================================================================

-- Junction table for supplier-specific product information
CREATE TABLE supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Supplier-specific details
  supplier_sku VARCHAR(100) NOT NULL, -- Supplier's SKU for this product
  supplier_name VARCHAR(255), -- Supplier's name for this product
  cost_price DECIMAL(10,2),
  list_price DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Ordering constraints
  minimum_order_quantity INTEGER DEFAULT 1,
  order_multiple INTEGER DEFAULT 1, -- Must order in multiples of this
  lead_time_days INTEGER,
  
  -- Availability
  is_available BOOLEAN DEFAULT true,
  is_preferred BOOLEAN DEFAULT false, -- Preferred supplier for this product
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(supplier_id, supplier_sku),
  UNIQUE(supplier_id, product_id),
  CHECK (cost_price >= 0),
  CHECK (list_price >= 0),
  CHECK (minimum_order_quantity > 0),
  CHECK (order_multiple > 0)
);

-- ============================================================================
-- 2. PRACTICE INVENTORY SETTINGS
-- ============================================================================

CREATE TABLE practice_inventory_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  
  -- Default settings
  default_currency VARCHAR(3) DEFAULT 'EUR',
  auto_reorder_enabled BOOLEAN DEFAULT false,
  low_stock_threshold_percent INTEGER DEFAULT 20,
  
  -- Counting settings
  require_counting_approval BOOLEAN DEFAULT true,
  allow_negative_stock BOOLEAN DEFAULT false,
  count_variance_threshold_percent INTEGER DEFAULT 5,
  
  -- Notification settings
  notify_on_low_stock BOOLEAN DEFAULT true,
  notify_on_stock_out BOOLEAN DEFAULT true,
  notify_on_count_variance BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(practice_id),
  CHECK (low_stock_threshold_percent BETWEEN 0 AND 100),
  CHECK (count_variance_threshold_percent >= 0)
);

-- ============================================================================
-- 3. MULTI-LOCATION STOCK LEVELS
-- ============================================================================

CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Stock quantities
  current_quantity DECIMAL(10,3) DEFAULT 0,
  reserved_quantity DECIMAL(10,3) DEFAULT 0, -- Reserved for pending orders
  available_quantity DECIMAL(10,3) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  
  -- Stock level settings
  minimum_quantity DECIMAL(10,3) DEFAULT 0,
  maximum_quantity DECIMAL(10,3),
  reorder_point DECIMAL(10,3),
  
  -- Preferred supplier for this location/product combination
  preferred_supplier_id UUID REFERENCES suppliers(id),
  
  -- Last stock activities
  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_movement_at TIMESTAMP WITH TIME ZONE,
  last_ordered_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(practice_id, location_id, product_id),
  CHECK (current_quantity >= 0),
  CHECK (reserved_quantity >= 0),
  CHECK (minimum_quantity >= 0),
  CHECK (maximum_quantity IS NULL OR maximum_quantity >= minimum_quantity),
  CHECK (reorder_point IS NULL OR reorder_point >= minimum_quantity)
);

-- ============================================================================
-- 4. STOCK MOVEMENTS (Audit Trail)
-- ============================================================================

CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Movement details
  movement_type VARCHAR(50) NOT NULL, -- 'count', 'adjustment', 'order_received', 'consumption', 'transfer', 'expired'
  quantity_change DECIMAL(10,3) NOT NULL, -- Can be negative
  quantity_before DECIMAL(10,3) NOT NULL,
  quantity_after DECIMAL(10,3) NOT NULL,
  
  -- Reference information
  reference_type VARCHAR(50), -- 'counting_session', 'order', 'manual_adjustment', 'transfer'
  reference_id UUID,
  
  -- Additional context
  reason VARCHAR(255),
  notes TEXT,
  batch_number VARCHAR(100),
  expiry_date DATE,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  CHECK (quantity_after = quantity_before + quantity_change)
);

-- ============================================================================
-- 5. COUNTING SESSIONS
-- ============================================================================

CREATE TYPE counting_session_status AS ENUM ('draft', 'in_progress', 'completed', 'approved', 'cancelled');

CREATE TABLE counting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  
  -- Session details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status counting_session_status DEFAULT 'draft',
  
  -- Counting scope
  count_all_products BOOLEAN DEFAULT true,
  product_category_filter VARCHAR(100),
  specific_product_ids UUID[], -- Array of product IDs if not counting all
  
  -- Session timing
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- Variance tracking
  total_products_counted INTEGER DEFAULT 0,
  products_with_variance INTEGER DEFAULT 0,
  total_variance_value DECIMAL(10,2) DEFAULT 0,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  started_by UUID REFERENCES auth.users(id),
  completed_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- 6. COUNTING ENTRIES
-- ============================================================================

CREATE TABLE counting_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  counting_session_id UUID NOT NULL REFERENCES counting_sessions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  
  -- Count data
  system_quantity DECIMAL(10,3) NOT NULL, -- What system thinks we have
  counted_quantity DECIMAL(10,3), -- What was actually counted
  variance_quantity DECIMAL(10,3) GENERATED ALWAYS AS (counted_quantity - system_quantity) STORED,
  variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN system_quantity = 0 AND counted_quantity = 0 THEN 0
      WHEN system_quantity = 0 THEN 100
      ELSE (counted_quantity - system_quantity) / system_quantity * 100
    END
  ) STORED,
  
  -- Count details
  counted_at TIMESTAMP WITH TIME ZONE,
  counted_by UUID REFERENCES auth.users(id),
  notes TEXT,
  requires_approval BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  
  -- Batch/expiry tracking
  batch_number VARCHAR(100),
  expiry_date DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(counting_session_id, product_id)
);

-- ============================================================================
-- 7. ORDER LISTS (Smart Ordering)
-- ============================================================================

CREATE TYPE order_list_status AS ENUM ('draft', 'active', 'submitted', 'completed', 'cancelled');

CREATE TABLE order_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE, -- NULL = all locations
  
  -- List details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status order_list_status DEFAULT 'draft',
  
  -- Order criteria
  include_low_stock BOOLEAN DEFAULT true,
  include_suggested_items BOOLEAN DEFAULT true,
  auto_calculate_quantities BOOLEAN DEFAULT true,
  
  -- Supplier preference
  preferred_supplier_id UUID REFERENCES suppliers(id),
  allow_multiple_suppliers BOOLEAN DEFAULT true,
  
  -- Order summary
  total_items INTEGER DEFAULT 0,
  estimated_total DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Timing
  target_order_date DATE,
  target_delivery_date DATE,
  
  -- User tracking
  created_by UUID REFERENCES auth.users(id),
  submitted_by UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- 8. ORDER LIST ITEMS
-- ============================================================================

CREATE TABLE order_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_list_id UUID NOT NULL REFERENCES order_lists(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_product_id UUID REFERENCES supplier_products(id),
  
  -- Quantity planning
  current_stock DECIMAL(10,3) DEFAULT 0,
  minimum_stock DECIMAL(10,3) DEFAULT 0,
  suggested_quantity DECIMAL(10,3) DEFAULT 0,
  ordered_quantity DECIMAL(10,3) DEFAULT 0,
  
  -- Pricing
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (ordered_quantity * unit_cost) STORED,
  
  -- Item details
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  notes TEXT,
  is_manual_addition BOOLEAN DEFAULT false, -- User manually added vs auto-suggested
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(order_list_id, product_id),
  CHECK (ordered_quantity >= 0),
  CHECK (unit_cost >= 0)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Supplier products indexes
CREATE INDEX idx_supplier_products_supplier ON supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_product ON supplier_products(product_id);
CREATE INDEX idx_supplier_products_available ON supplier_products(is_available);
CREATE INDEX idx_supplier_products_preferred ON supplier_products(is_preferred);

-- Stock levels indexes
CREATE INDEX idx_stock_levels_practice ON stock_levels(practice_id);
CREATE INDEX idx_stock_levels_location ON stock_levels(location_id);
CREATE INDEX idx_stock_levels_product ON stock_levels(product_id);
CREATE INDEX idx_stock_levels_low_stock ON stock_levels(practice_id, location_id) 
  WHERE current_quantity <= minimum_quantity;

-- Stock movements indexes
CREATE INDEX idx_stock_movements_practice ON stock_movements(practice_id);
CREATE INDEX idx_stock_movements_location ON stock_movements(location_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_stock_movements_created_at ON stock_movements(created_at DESC);

-- Counting sessions indexes
CREATE INDEX idx_counting_sessions_practice ON counting_sessions(practice_id);
CREATE INDEX idx_counting_sessions_location ON counting_sessions(location_id);
CREATE INDEX idx_counting_sessions_status ON counting_sessions(status);
CREATE INDEX idx_counting_sessions_created_by ON counting_sessions(created_by);

-- Counting entries indexes
CREATE INDEX idx_counting_entries_session ON counting_entries(counting_session_id);
CREATE INDEX idx_counting_entries_product ON counting_entries(product_id);
CREATE INDEX idx_counting_entries_variance ON counting_entries(variance_quantity) 
  WHERE variance_quantity != 0;

-- Order lists indexes
CREATE INDEX idx_order_lists_practice ON order_lists(practice_id);
CREATE INDEX idx_order_lists_location ON order_lists(location_id);
CREATE INDEX idx_order_lists_status ON order_lists(status);

-- Order list items indexes
CREATE INDEX idx_order_list_items_list ON order_list_items(order_list_id);
CREATE INDEX idx_order_list_items_product ON order_list_items(product_id);
CREATE INDEX idx_order_list_items_supplier_product ON order_list_items(supplier_product_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_inventory_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE counting_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE counting_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_list_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Practice-based security

-- Supplier products (accessible to all authenticated users)
CREATE POLICY "Users can view supplier products" ON supplier_products
  FOR SELECT USING (auth.role() = 'authenticated');

-- Practice inventory settings
CREATE POLICY "Practice members can manage inventory settings" ON practice_inventory_settings
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

-- Stock levels  
CREATE POLICY "Practice members can manage stock levels" ON stock_levels
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

-- Stock movements
CREATE POLICY "Practice members can view stock movements" ON stock_movements
  FOR SELECT USING (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Practice members can insert stock movements" ON stock_movements
  FOR INSERT WITH CHECK (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

-- Counting sessions
CREATE POLICY "Practice members can manage counting sessions" ON counting_sessions
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

-- Counting entries
CREATE POLICY "Practice members can manage counting entries" ON counting_entries
  FOR ALL USING (
    counting_session_id IN (
      SELECT id FROM counting_sessions cs
      WHERE cs.practice_id IN (
        SELECT practice_id FROM practice_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Order lists
CREATE POLICY "Practice members can manage order lists" ON order_lists
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

-- Order list items
CREATE POLICY "Practice members can manage order list items" ON order_list_items
  FOR ALL USING (
    order_list_id IN (
      SELECT id FROM order_lists ol
      WHERE ol.practice_id IN (
        SELECT practice_id FROM practice_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- USEFUL FUNCTIONS
-- ============================================================================

-- Function to update stock level after movement
CREATE OR REPLACE FUNCTION update_stock_level_after_movement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE stock_levels
  SET 
    current_quantity = NEW.quantity_after,
    last_movement_at = NEW.created_at
  WHERE 
    practice_id = NEW.practice_id 
    AND location_id = NEW.location_id 
    AND product_id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stock levels
CREATE TRIGGER trigger_update_stock_level
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_stock_level_after_movement();

-- Function to calculate suggested order quantities
CREATE OR REPLACE FUNCTION calculate_order_suggestions(
  p_practice_id UUID,
  p_location_id UUID DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  current_stock DECIMAL,
  minimum_stock DECIMAL,
  suggested_quantity DECIMAL,
  preferred_supplier_id UUID,
  urgency_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sl.product_id,
    p.name as product_name,
    sl.current_quantity as current_stock,
    sl.minimum_quantity as minimum_stock,
    CASE 
      WHEN sl.maximum_quantity IS NOT NULL THEN 
        GREATEST(0, sl.maximum_quantity - sl.current_quantity)
      ELSE 
        GREATEST(0, sl.minimum_quantity * 2 - sl.current_quantity)
    END as suggested_quantity,
    sl.preferred_supplier_id,
    CASE 
      WHEN sl.current_quantity <= 0 THEN 'critical'
      WHEN sl.current_quantity <= sl.minimum_quantity * 0.5 THEN 'high'
      WHEN sl.current_quantity <= sl.minimum_quantity THEN 'medium'
      ELSE 'low'
    END as urgency_level
  FROM stock_levels sl
  JOIN products p ON p.id = sl.product_id
  WHERE 
    sl.practice_id = p_practice_id
    AND (p_location_id IS NULL OR sl.location_id = p_location_id)
    AND sl.current_quantity <= sl.minimum_quantity
  ORDER BY 
    CASE 
      WHEN sl.current_quantity <= 0 THEN 4
      WHEN sl.current_quantity <= sl.minimum_quantity * 0.5 THEN 3
      WHEN sl.current_quantity <= sl.minimum_quantity THEN 2
      ELSE 1
    END DESC,
    sl.current_quantity ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA SEEDING (for development)
-- ============================================================================

-- Insert default inventory settings for existing practices
INSERT INTO practice_inventory_settings (practice_id)
SELECT id FROM practices
ON CONFLICT (practice_id) DO NOTHING; 