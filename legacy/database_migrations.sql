-- ============================================================================
-- Remcura - Enhanced Inventory Management Schema
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
-- 8. PRODUCT BATCHES (Batch Management)
-- ============================================================================

CREATE TABLE product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  
  -- Batch details
  batch_number VARCHAR(100) NOT NULL,
  supplier_batch_number VARCHAR(100), -- Original supplier batch number if different
  expiry_date DATE NOT NULL,
  received_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Quantity tracking
  initial_quantity DECIMAL(10,3) NOT NULL,
  current_quantity DECIMAL(10,3) NOT NULL,
  reserved_quantity DECIMAL(10,3) DEFAULT 0,
  available_quantity DECIMAL(10,3) GENERATED ALWAYS AS (current_quantity - reserved_quantity) STORED,
  
  -- Cost tracking
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (initial_quantity * unit_cost) STORED,
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Supplier information
  supplier_id UUID REFERENCES suppliers(id),
  purchase_order_number VARCHAR(100),
  invoice_number VARCHAR(100),
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'depleted', 'expired', 'recalled'
  
  -- Quality control
  quality_check_passed BOOLEAN DEFAULT true,
  quality_notes TEXT,
  quarantine_until DATE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(practice_id, product_id, location_id, batch_number),
  CHECK (current_quantity >= 0),
  CHECK (reserved_quantity >= 0),
  CHECK (initial_quantity > 0),
  CHECK (current_quantity <= initial_quantity),
  CHECK (unit_cost >= 0),
  CHECK (expiry_date > received_date),
  CHECK (status IN ('active', 'depleted', 'expired', 'recalled'))
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

-- Product batches indexes
CREATE INDEX idx_product_batches_practice ON product_batches(practice_id);
CREATE INDEX idx_product_batches_product ON product_batches(product_id);
CREATE INDEX idx_product_batches_location ON product_batches(location_id);
CREATE INDEX idx_product_batches_expiry ON product_batches(expiry_date);
CREATE INDEX idx_product_batches_batch_number ON product_batches(batch_number);
CREATE INDEX idx_product_batches_status ON product_batches(status);
CREATE INDEX idx_product_batches_supplier ON product_batches(supplier_id);
CREATE INDEX idx_product_batches_fifo ON product_batches(practice_id, product_id, location_id, expiry_date, status) 
  WHERE status = 'active' AND current_quantity > 0;

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
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;

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

-- Product batches
CREATE POLICY "Practice members can manage product batches" ON product_batches
  FOR ALL USING (
    practice_id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
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

-- Function to update batch quantities after movement
CREATE OR REPLACE FUNCTION update_batch_quantity_after_movement()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if batch_number is provided
  IF NEW.batch_number IS NOT NULL THEN
    UPDATE product_batches
    SET 
      current_quantity = GREATEST(0, current_quantity + NEW.quantity_change),
      updated_at = NEW.created_at,
      status = CASE 
        WHEN GREATEST(0, current_quantity + NEW.quantity_change) = 0 THEN 'depleted'
        ELSE status
      END
    WHERE 
      practice_id = NEW.practice_id 
      AND location_id = NEW.location_id 
      AND product_id = NEW.product_id
      AND batch_number = NEW.batch_number;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update batch quantities
CREATE TRIGGER trigger_update_batch_quantity
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_quantity_after_movement();

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

-- Function to get FIFO batch for product usage
CREATE OR REPLACE FUNCTION get_fifo_batches(
  p_practice_id UUID,
  p_location_id UUID,
  p_product_id UUID,
  p_requested_quantity DECIMAL(10,3)
)
RETURNS TABLE (
  batch_id UUID,
  batch_number VARCHAR,
  available_quantity DECIMAL,
  expiry_date DATE,
  use_quantity DECIMAL
) AS $$
DECLARE
  remaining_quantity DECIMAL(10,3) := p_requested_quantity;
  batch_record RECORD;
BEGIN
  -- Get batches ordered by expiry date (FIFO)
  FOR batch_record IN
    SELECT id, batch_number, available_quantity, expiry_date
    FROM product_batches
    WHERE 
      practice_id = p_practice_id
      AND location_id = p_location_id
      AND product_id = p_product_id
      AND status = 'active'
      AND available_quantity > 0
    ORDER BY expiry_date ASC, created_at ASC
  LOOP
    IF remaining_quantity <= 0 THEN
      EXIT;
    END IF;
    
    DECLARE
      use_from_batch DECIMAL(10,3);
    BEGIN
      use_from_batch := LEAST(batch_record.available_quantity, remaining_quantity);
      
      RETURN QUERY SELECT 
        batch_record.id,
        batch_record.batch_number,
        batch_record.available_quantity,
        batch_record.expiry_date,
        use_from_batch;
      
      remaining_quantity := remaining_quantity - use_from_batch;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get expiring batches
CREATE OR REPLACE FUNCTION get_expiring_batches(
  p_practice_id UUID,
  p_days_ahead INTEGER DEFAULT 30
)
RETURNS TABLE (
  batch_id UUID,
  product_id UUID,
  product_name VARCHAR,
  product_sku VARCHAR,
  location_id UUID,
  location_name VARCHAR,
  batch_number VARCHAR,
  expiry_date DATE,
  current_quantity DECIMAL,
  days_until_expiry INTEGER,
  urgency_level TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pb.id as batch_id,
    pb.product_id,
    p.name as product_name,
    p.sku as product_sku,
    pb.location_id,
    pl.name as location_name,
    pb.batch_number,
    pb.expiry_date,
    pb.current_quantity,
    (pb.expiry_date - CURRENT_DATE)::INTEGER as days_until_expiry,
    CASE 
      WHEN pb.expiry_date <= CURRENT_DATE THEN 'expired'
      WHEN pb.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'critical'
      WHEN pb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
      ELSE 'normal'
    END as urgency_level
  FROM product_batches pb
  JOIN products p ON p.id = pb.product_id
  JOIN practice_locations pl ON pl.id = pb.location_id
  WHERE 
    pb.practice_id = p_practice_id
    AND pb.status = 'active'
    AND pb.current_quantity > 0
    AND pb.expiry_date <= CURRENT_DATE + INTERVAL '{days_ahead} days'
  ORDER BY 
    pb.expiry_date ASC,
    CASE 
      WHEN pb.expiry_date <= CURRENT_DATE THEN 4
      WHEN pb.expiry_date <= CURRENT_DATE + INTERVAL '7 days' THEN 3
      WHEN pb.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 2
      ELSE 1
    END DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get products with stock information
CREATE OR REPLACE FUNCTION get_products_with_stock(
  p_practice_id UUID
)
RETURNS TABLE (
  product_id UUID,
  product_sku VARCHAR,
  product_name VARCHAR,
  product_description TEXT,
  product_category VARCHAR,
  product_brand VARCHAR,
  product_unit VARCHAR,
  product_image_url TEXT,
  product_barcode VARCHAR,
  product_price DECIMAL,
  product_currency VARCHAR,
  product_is_active BOOLEAN,
  product_created_at TIMESTAMP WITH TIME ZONE,
  product_updated_at TIMESTAMP WITH TIME ZONE,
  total_stock DECIMAL,
  available_stock DECIMAL,
  reserved_stock DECIMAL,
  minimum_stock DECIMAL,
  lowest_supplier_price DECIMAL,
  cheapest_supplier JSONB,
  supplier_products JSONB,
  stock_levels JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS product_id,
    p.sku AS product_sku,
    p.name AS product_name,
    p.description AS product_description,
    p.category AS product_category,
    p.brand AS product_brand,
    p.unit AS product_unit,
    p.image_url AS product_image_url,
    p.barcode AS product_barcode,
    p.price AS product_price,
    p.currency AS product_currency,
    p.is_active AS product_is_active,
    p.created_at AS product_created_at,
    p.updated_at AS product_updated_at,
    
    -- Aggregate stock information
    COALESCE(SUM(sl.current_quantity), 0) AS total_stock,
    COALESCE(SUM(sl.available_quantity), 0) AS available_stock,
    COALESCE(SUM(sl.reserved_quantity), 0) AS reserved_stock,
    COALESCE(MIN(sl.minimum_quantity), 0) AS minimum_stock,
    
    -- Supplier pricing information
    (SELECT MIN(sp.cost_price) 
     FROM supplier_products sp 
     WHERE sp.product_id = p.id AND sp.is_available = true) AS lowest_supplier_price,
    
    -- Cheapest supplier as JSON
    (SELECT to_jsonb(row_to_json(s.*))
     FROM suppliers s
     JOIN supplier_products sp ON s.id = sp.supplier_id
     WHERE sp.product_id = p.id AND sp.is_available = true
     ORDER BY sp.cost_price ASC
     LIMIT 1) AS cheapest_supplier,
    
    -- All supplier products as JSON array
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', sp.id,
        'supplier_id', sp.supplier_id,
        'supplier_sku', sp.supplier_sku,
        'supplier_name', sp.supplier_name,
        'unit_price', sp.cost_price,
        'currency', sp.currency,
        'minimum_order_quantity', sp.minimum_order_quantity,
        'lead_time_days', sp.lead_time_days,
        'is_available', sp.is_available,
        'is_preferred', sp.is_preferred
      )
    ), '[]'::jsonb)
    FROM supplier_products sp
    WHERE sp.product_id = p.id) AS supplier_products,
    
    -- Stock levels by location as JSON array
    (SELECT COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', sl.id,
        'location_id', sl.location_id,
        'current_quantity', sl.current_quantity,
        'available_quantity', sl.available_quantity,
        'reserved_quantity', sl.reserved_quantity,
        'minimum_quantity', sl.minimum_quantity,
        'maximum_quantity', sl.maximum_quantity,
        'reorder_point', sl.reorder_point,
        'last_counted_at', sl.last_counted_at,
        'last_movement_at', sl.last_movement_at
      )
    ), '[]'::jsonb)
    FROM stock_levels sl
    WHERE sl.product_id = p.id AND sl.practice_id = p_practice_id) AS stock_levels
    
  FROM products p
  LEFT JOIN stock_levels sl ON p.id = sl.product_id AND sl.practice_id = p_practice_id
  WHERE p.is_active = true
  GROUP BY p.id, p.sku, p.name, p.description, p.category, p.brand, p.unit, 
           p.image_url, p.barcode, p.price, p.currency, p.is_active, 
           p.created_at, p.updated_at
  ORDER BY p.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SAMPLE DATA SEEDING (for development)
-- ============================================================================

-- Insert default inventory settings for existing practices
INSERT INTO practice_inventory_settings (practice_id)
SELECT id FROM practices
ON CONFLICT (practice_id) DO NOTHING; 