// Seed data for development and testing
import type { ClinicInsert, UserProfileInsert, ClinicProductInsert } from 'src/types/supabase'

// Sample clinics for demo
export const sampleClinics: ClinicInsert[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Medisch Centrum Amsterdam',
    address: 'Hoofdstraat 123, 1000 AB Amsterdam',
    contact_email: 'info@mcamsterdam.nl',
    contact_phone: '+31 20 123 4567'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Kliniek Rotterdam Zuid',
    address: 'Zuidplein 456, 3000 CD Rotterdam',
    contact_email: 'contact@klinierkdam.nl',
    contact_phone: '+31 10 987 6543'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Gezondheidscentrum Utrecht',
    address: 'Centraal Park 789, 3500 EF Utrecht',
    contact_email: 'admin@gcutrecht.nl',
    contact_phone: '+31 30 555 0123'
  }
]

// Sample user profiles (for development only - in production these come from auth)
export const sampleUserProfiles: UserProfileInsert[] = [
  {
    id: '00000000-0000-0000-0000-100000000001',
    clinic_id: '00000000-0000-0000-0000-000000000001',
    email: 'admin@mcamsterdam.nl',
    full_name: 'Dr. Maria van der Berg',
    role: 'admin'
  },
  {
    id: '00000000-0000-0000-0000-100000000002',
    clinic_id: '00000000-0000-0000-0000-000000000001',
    email: 'manager@mcamsterdam.nl',
    full_name: 'Jan Klaassen',
    role: 'manager'
  },
  {
    id: '00000000-0000-0000-0000-100000000003',
    clinic_id: '00000000-0000-0000-0000-000000000002',
    email: 'admin@klinierkdam.nl',
    full_name: 'Dr. Petra de Wit',
    role: 'admin'
  }
]

// Sample products for the clinics
export const sampleProducts: ClinicProductInsert[] = [
  // Products for Medisch Centrum Amsterdam
  {
    clinic_id: '00000000-0000-0000-0000-000000000001',
    product_name: 'Disposable Handschoenen - Nitril',
    product_sku: 'GLV-NITR-100',
    current_stock: 15,
    minimum_stock: 20,
    maximum_stock: 100,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000001',
    product_name: 'Chirurgische Mondkapjes',
    product_sku: 'MSK-CHIR-50',
    current_stock: 45,
    minimum_stock: 30,
    maximum_stock: 150,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000001',
    product_name: 'Desinfectie Alcohol 70%',
    product_sku: 'DIS-ALC-500',
    current_stock: 0,
    minimum_stock: 5,
    maximum_stock: 25,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000001',
    product_name: 'Steriele Kompressen 5x5cm',
    product_sku: 'KMP-STER-100',
    current_stock: 75,
    minimum_stock: 50,
    maximum_stock: 200,
    reorder_enabled: false,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000001',
    product_name: 'Spuiten 5ml - Eenmalig gebruik',
    product_sku: 'SPT-5ML-100',
    current_stock: 25,
    minimum_stock: 30,
    maximum_stock: 120,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },

  // Products for Kliniek Rotterdam Zuid
  {
    clinic_id: '00000000-0000-0000-0000-000000000002',
    product_name: 'Latex Handschoenen - Gepoederd',
    product_sku: 'GLV-LAT-100',
    current_stock: 5,
    minimum_stock: 25,
    maximum_stock: 100,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000002',
    product_name: 'FFP2 Maskers',
    product_sku: 'MSK-FFP2-20',
    current_stock: 35,
    minimum_stock: 20,
    maximum_stock: 80,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000002',
    product_name: 'Thermometer Covers',
    product_sku: 'THM-COV-200',
    current_stock: 150,
    minimum_stock: 100,
    maximum_stock: 500,
    reorder_enabled: false,
    low_stock_alert_enabled: false
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000002',
    product_name: 'Bloeddrukmeter Manchetten',
    product_sku: 'BDM-MAN-ADULT',
    current_stock: 8,
    minimum_stock: 10,
    maximum_stock: 25,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },

  // Products for Gezondheidscentrum Utrecht
  {
    clinic_id: '00000000-0000-0000-0000-000000000003',
    product_name: 'Vacutainer Buizen - EDTA',
    product_sku: 'VAC-EDTA-100',
    current_stock: 200,
    minimum_stock: 150,
    maximum_stock: 500,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000003',
    product_name: 'Wegwerp Spatels',
    product_sku: 'SPT-WEGW-200',
    current_stock: 18,
    minimum_stock: 25,
    maximum_stock: 100,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  },
  {
    clinic_id: '00000000-0000-0000-0000-000000000003',
    product_name: 'Urine Containers',
    product_sku: 'URN-CONT-100',
    current_stock: 0,
    minimum_stock: 20,
    maximum_stock: 80,
    reorder_enabled: true,
    low_stock_alert_enabled: true
  }
]

// Utility functions for seed data
export const seedDataUtils = {
  // Get products with low stock
  getLowStockProducts() {
    return sampleProducts.filter(product => 
      product.current_stock <= product.minimum_stock && 
      product.low_stock_alert_enabled
    )
  },

  // Get out of stock products
  getOutOfStockProducts() {
    return sampleProducts.filter(product => product.current_stock === 0)
  },

  // Get products by clinic
  getProductsByClinic(clinicId: string) {
    return sampleProducts.filter(product => product.clinic_id === clinicId)
  },

  // Calculate reorder suggestion
  getReorderSuggestion(product: ClinicProductInsert) {
    if (product.current_stock >= product.maximum_stock || !product.reorder_enabled) {
      return null
    }
    
    const suggested = product.maximum_stock - product.current_stock
    return {
      quantity: suggested,
      reason: product.current_stock === 0 ? 'out_of_stock' : 'low_stock'
    }
  },

  // Generate mock order data based on current stock levels
  generateMockOrderData(clinicId: string) {
    const clinicProducts = this.getProductsByClinic(clinicId)
    const lowStockProducts = clinicProducts.filter(p => 
      p.current_stock <= p.minimum_stock && p.reorder_enabled
    )

    return lowStockProducts.map(product => {
      const suggestion = this.getReorderSuggestion(product)
      return {
        product_sku: product.product_sku,
        product_name: product.product_name,
        suggested_quantity: suggestion?.quantity || 0,
        current_stock: product.current_stock,
        minimum_stock: product.minimum_stock,
        maximum_stock: product.maximum_stock
      }
    })
  }
}

// SQL scripts for Supabase database setup
export const supabaseSqlScripts = {
  // Create tables
  createTables: `
    -- Enable UUID extension
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Create clinics table
    CREATE TABLE IF NOT EXISTS clinics (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      address TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Create user_profiles table
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
      email TEXT NOT NULL,
      full_name TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Create clinic_products table
    CREATE TABLE IF NOT EXISTS clinic_products (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
      product_name TEXT NOT NULL,
      product_sku TEXT,
      current_stock INTEGER NOT NULL DEFAULT 0,
      minimum_stock INTEGER NOT NULL DEFAULT 0,
      maximum_stock INTEGER NOT NULL DEFAULT 100,
      reorder_enabled BOOLEAN NOT NULL DEFAULT true,
      low_stock_alert_enabled BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_user_profiles_clinic_id ON user_profiles(clinic_id);
    CREATE INDEX IF NOT EXISTS idx_clinic_products_clinic_id ON clinic_products(clinic_id);
    CREATE INDEX IF NOT EXISTS idx_clinic_products_stock ON clinic_products(current_stock, minimum_stock);
  `,

  // Enable RLS
  enableRLS: `
    -- Enable RLS on all tables
    ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE clinic_products ENABLE ROW LEVEL SECURITY;
  `,

  // Create RLS policies
  createRLSPolicies: `
    -- Policies for clinics table
    CREATE POLICY "Users can view their own clinic" ON clinics
      FOR SELECT USING (
        id IN (
          SELECT clinic_id FROM user_profiles WHERE id = auth.uid()
        )
      );

    -- Policies for user_profiles table
    CREATE POLICY "Users can view their own profile" ON user_profiles
      FOR SELECT USING (id = auth.uid());

    CREATE POLICY "Users can update their own profile" ON user_profiles
      FOR UPDATE USING (id = auth.uid());

    -- Policies for clinic_products table
    CREATE POLICY "Users can view products from their clinic" ON clinic_products
      FOR SELECT USING (
        clinic_id IN (
          SELECT clinic_id FROM user_profiles WHERE id = auth.uid()
        )
      );

    CREATE POLICY "Users can insert products for their clinic" ON clinic_products
      FOR INSERT WITH CHECK (
        clinic_id IN (
          SELECT clinic_id FROM user_profiles WHERE id = auth.uid()
        )
      );

    CREATE POLICY "Users can update products from their clinic" ON clinic_products
      FOR UPDATE USING (
        clinic_id IN (
          SELECT clinic_id FROM user_profiles WHERE id = auth.uid()
        )
      );

    CREATE POLICY "Users can delete products from their clinic" ON clinic_products
      FOR DELETE USING (
        clinic_id IN (
          SELECT clinic_id FROM user_profiles WHERE id = auth.uid()
        )
      );
  `,

  // Update triggers
  createTriggers: `
    -- Function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = TIMEZONE('utc'::text, NOW());
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Create triggers for updated_at
    CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    CREATE TRIGGER update_clinic_products_updated_at BEFORE UPDATE ON clinic_products
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `
} 