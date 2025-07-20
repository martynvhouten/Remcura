#!/usr/bin/env node

/**
 * Reset Demo Data Script
 *
 * This script resets all demo data in the Supabase database
 * using MCP (Model Context Protocol) commands.
 *
 * Usage: node scripts/reset-demo-data.js
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DEMO_PRACTICE_ID = '550e8400-e29b-41d4-a716-446655440000';
const SUPABASE_PROJECT_ID = 'qdvatwfakrtoggjjofuy';

async function resetDemoData() {
  console.log('🔄 Starting demo data reset...');

  try {
    // Step 1: Clear existing demo data
    console.log('1️⃣ Clearing existing demo data...');
    const clearResult = await execAsync(`
      mcp execute --tool mcp_supabase_execute_sql \\
        --project-id ${SUPABASE_PROJECT_ID} \\
        --query "SELECT reset_demo_data();"
    `);
    console.log('✅ Demo data cleared:', clearResult.stdout);

    // Step 2: Recreate suppliers
    console.log('2️⃣ Recreating suppliers...');
    const suppliersResult = await execAsync(`
      mcp execute --tool mcp_supabase_execute_sql \\
        --project-id ${SUPABASE_PROJECT_ID} \\
        --query "
        INSERT INTO suppliers (name, supplier_code, contact_email, contact_phone, website, address, payment_terms, minimum_order_amount, currency, is_active, integration_type, api_config, created_at) VALUES 
        ('Remka B.V.', 'RMK', 'orders@remka.nl', '+31-20-1234567', 'https://remka.nl', 'Hoofdstraat 123, 1000 AB Amsterdam', 'NET30', 250.00, 'EUR', true, 'magento', '{"api_url": "https://api.remka.nl", "api_key": "demo_key"}', NOW() - INTERVAL '60 days'),
        ('Medishop Direct', 'MSD', 'info@medishop.nl', '+31-30-9876543', 'https://medishop.nl', 'Medische laan 456, 3500 CD Utrecht', 'NET14', 100.00, 'EUR', true, 'manual', '{}', NOW() - INTERVAL '45 days')
        ON CONFLICT (supplier_code) DO UPDATE SET 
          name = EXCLUDED.name,
          contact_email = EXCLUDED.contact_email,
          updated_at = NOW();
        "
    `);
    console.log('✅ Suppliers recreated');

    // Step 3: Recreate practice locations
    console.log('3️⃣ Recreating practice locations...');
    const locationsResult = await execAsync(`
      mcp execute --tool mcp_supabase_execute_sql \\
        --project-id ${SUPABASE_PROJECT_ID} \\
        --query "
        INSERT INTO practice_locations (practice_id, location_id, min_stock_level, max_stock_level, reorder_point, preferred_supplier_id, created_at)
        SELECT 
          '${DEMO_PRACTICE_ID}'::uuid,
          l.id,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN 50
            WHEN l.name = 'Spoedkast' THEN 10 
            ELSE 5
          END,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN 200
            WHEN l.name = 'Spoedkast' THEN 50
            ELSE 25
          END,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN 75
            WHEN l.name = 'Spoedkast' THEN 20
            ELSE 10
          END,
          s.id,
          NOW() - INTERVAL '30 days' + (random() * INTERVAL '25 days')
        FROM locations l
        CROSS JOIN suppliers s
        WHERE l.practice_id = '${DEMO_PRACTICE_ID}'::uuid 
        AND s.name = 'Remka B.V.'
        ON CONFLICT (practice_id, location_id) DO NOTHING;
        "
    `);
    console.log('✅ Practice locations recreated');

    // Step 4: Recreate stock levels with realistic data
    console.log('4️⃣ Recreating stock levels...');
    const stockResult = await execAsync(`
      mcp execute --tool mcp_supabase_execute_sql \\
        --project-id ${SUPABASE_PROJECT_ID} \\
        --query "
        INSERT INTO stock_levels (practice_id, location_id, product_id, current_quantity, min_stock_level, max_stock_level, reorder_point, preferred_supplier_id, last_counted_at, created_at)
        SELECT 
          '${DEMO_PRACTICE_ID}'::uuid,
          l.id as location_id,
          p.id as product_id,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN floor(random() * 251 + 50)::int
            WHEN l.name = 'Spoedkast' THEN floor(random() * 31 + 5)::int
            ELSE floor(random() * 23 + 1)::int
          END as current_quantity,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN 25
            WHEN l.name = 'Spoedkast' THEN 5
            ELSE 2
          END as min_stock,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN 300
            WHEN l.name = 'Spoedkast' THEN 50
            ELSE 25
          END as max_stock,
          CASE 
            WHEN l.name = 'Hoofdvoorraad' THEN 50
            WHEN l.name = 'Spoedkast' THEN 10
            ELSE 5
          END as reorder_point,
          (SELECT id FROM suppliers ORDER BY random() LIMIT 1) as preferred_supplier,
          NOW() - INTERVAL '7 days' + (random() * INTERVAL '7 days'),
          NOW() - INTERVAL '30 days' + (random() * INTERVAL '25 days')
        FROM locations l
        CROSS JOIN products p
        WHERE l.practice_id = '${DEMO_PRACTICE_ID}'::uuid
        ON CONFLICT (practice_id, location_id, product_id) DO UPDATE SET
          current_quantity = EXCLUDED.current_quantity,
          last_counted_at = EXCLUDED.last_counted_at;
        "
    `);
    console.log('✅ Stock levels recreated');

    // Step 5: Recreate sample orders
    console.log('5️⃣ Recreating sample orders...');
    const ordersResult = await execAsync(`
      mcp execute --tool mcp_supabase_execute_sql \\
        --project-id ${SUPABASE_PROJECT_ID} \\
        --query "
        WITH new_orders AS (
          INSERT INTO orders (practice_id, supplier_id, order_number, status, order_date, expected_delivery_date, total_amount, currency, notes, created_at, updated_at)
          SELECT 
            '${DEMO_PRACTICE_ID}'::uuid,
            s.id,
            CASE 
              WHEN s.name = 'Remka B.V.' THEN 'RMK-' || to_char(NOW(), 'YYYY') || '-001234'
              ELSE 'MSD-' || to_char(NOW(), 'YYYY') || '-000012'
            END,
            CASE 
              WHEN s.name = 'Remka B.V.' THEN 'delivered'
              ELSE 'shipped'
            END,
            NOW() - INTERVAL '15 days',
            NOW() - INTERVAL '10 days',
            CASE 
              WHEN s.name = 'Remka B.V.' THEN 387.50
              ELSE 156.25
            END,
            'EUR',
            'Demo bestelling voor testing',
            NOW() - INTERVAL '15 days',
            NOW() - INTERVAL '10 days'
          FROM suppliers s
          WHERE s.name IN ('Remka B.V.', 'Medishop Direct')
          ON CONFLICT (practice_id, order_number) DO UPDATE SET
            status = EXCLUDED.status,
            total_amount = EXCLUDED.total_amount
          RETURNING id, supplier_id, order_number
        )
        INSERT INTO order_items (order_id, product_id, quantity_ordered, quantity_received, unit_price, line_total, expected_delivery_date, notes, created_at)
        SELECT 
          o.id,
          p.id,
          floor(random() * 10 + 1)::int as qty_ordered,
          floor(random() * 10 + 1)::int as qty_received,
          round((random() * 50 + 10)::numeric, 2) as unit_price,
          round(((random() * 50 + 10) * (random() * 10 + 1))::numeric, 2) as line_total,
          NOW() + INTERVAL '7 days',
          'Demo order item',
          NOW()
        FROM new_orders o
        CROSS JOIN (
          SELECT id FROM products ORDER BY random() LIMIT 4
        ) p;
        "
    `);
    console.log('✅ Sample orders recreated');

    console.log('✅ Demo data reset completed successfully!');
    console.log('📊 New demo data includes:');
    console.log('   • 2 suppliers (Remka B.V. & Medishop Direct)');
    console.log('   • 3 practice locations with stock settings');
    console.log('   • 39 stock level entries across all locations');
    console.log('   • Sample orders with realistic data');
    console.log('');
    console.log(
      '🎯 You can now test the demo account at: demo@medstock-pro.com'
    );
  } catch (error) {
    console.error('❌ Error resetting demo data:', error);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDemoData();
}

export { resetDemoData };
