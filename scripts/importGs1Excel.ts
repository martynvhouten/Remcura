#!/usr/bin/env ts-node

import * as XLSX from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config();

// Types
interface GS1Row {
  GTIN?: string;
  'GPC Brick Code'?: string;
  Brand?: string;
  'Product Name'?: string;
  'Net Content'?: string;
  'Net Content UOM'?: string;
  'Gross Weight'?: number;
  'Net Weight'?: number;
  'Base Unit'?: boolean | string;
  'Orderable Unit'?: boolean | string;
  'Despatch Unit'?: boolean | string;
  'Country of Origin'?: string;
  'Effective From'?: string | Date;
  'Effective To'?: string | Date;
  'Product Lifecycle Status'?: string;
  Description?: string;
  Category?: string;
  SKU?: string;
  Price?: number;
  Unit?: string;
}

interface ProductInsert {
  gtin: string;
  sku: string;
  name: string;
  gpc_brick_code?: string | undefined;
  brand?: string | undefined;
  description?: string | undefined;
  category?: string | undefined;
  price?: number | undefined;
  unit?: string | undefined;
  net_content_value?: number | undefined;
  net_content_uom?: string | undefined;
  gross_weight?: number | undefined;
  net_weight?: number | undefined;
  base_unit_indicator?: boolean | undefined;
  orderable_unit_indicator?: boolean | undefined;
  despatch_unit_indicator?: boolean | undefined;
  country_of_origin?: string | undefined;
  effective_from_date?: string | undefined;
  effective_to_date?: string | undefined;
  product_lifecycle_status?: string | undefined;
  active: boolean;
}

interface ImportStats {
  totalRows: number;
  processed: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validates GTIN format (8, 12, 13, or 14 digits)
 */
function validateGTIN(gtin: string): boolean {
  if (!gtin) return false;

  // Remove any non-numeric characters
  const cleanGtin = gtin.toString().replace(/\D/g, '');

  // Check if it's a valid length (8, 12, 13, or 14 digits)
  const validLengths = [8, 12, 13, 14];
  return validLengths.includes(cleanGtin.length);
}

/**
 * Converts string or boolean values to boolean
 */
function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return (
      lower === 'true' || lower === 'yes' || lower === '1' || lower === 'y'
    );
  }
  return false;
}

/**
 * Parses date strings to ISO format
 */
function parseDate(dateValue: any): string | undefined {
  if (!dateValue) return undefined;

  try {
    let date: Date;

    if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      // Excel date serial number
      date = XLSX.SSF.parse_date_code(dateValue);
    } else {
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return undefined;

    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  } catch {
    return undefined;
  }
}

/**
 * Parses net content value from string (e.g., "250g" -> 250)
 */
function parseNetContent(netContent: string): { value?: number; uom?: string } {
  if (!netContent) return {};

  const contentStr = netContent.toString().trim();
  const match = contentStr.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?$/);

  if (match && match[1]) {
    return {
      value: parseFloat(match[1]),
      uom: match[2] ? match[2].toLowerCase() : undefined,
    };
  }

  // Try to extract just the number if no unit
  const numberMatch = contentStr.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch && numberMatch[1]) {
    return { value: parseFloat(numberMatch[1]) };
  }

  return {};
}

/**
 * Maps GS1 row data to Product insert format
 */
function mapGS1ToProduct(row: GS1Row, rowIndex: number): ProductInsert | null {
  // Validate required fields
  if (!row.GTIN) {
    console.warn(`⚠️  Row ${rowIndex}: Missing GTIN, skipping`);
    return null;
  }

  if (!validateGTIN(row.GTIN)) {
    console.warn(
      `⚠️  Row ${rowIndex}: Invalid GTIN format (${row.GTIN}), skipping`
    );
    return null;
  }

  if (!row['Product Name']) {
    console.warn(`⚠️  Row ${rowIndex}: Missing Product Name, skipping`);
    return null;
  }

  // Parse net content
  const netContent = parseNetContent(row['Net Content'] || '');
  const netContentUom = row['Net Content UOM'] || netContent.uom;

  // Clean and format GTIN
  const cleanGtin = row.GTIN.replace(/\D/g, '');

  // Generate SKU if not provided
  const sku = row.SKU || `GS1-${cleanGtin}`;

  const product: ProductInsert = {
    gtin: cleanGtin,
    sku,
    name: row['Product Name'],
    gpc_brick_code: row['GPC Brick Code'],
    brand: row.Brand,
    description: row.Description,
    category: row.Category,
    price: row.Price,
    unit: row.Unit,
    net_content_value: netContent.value,
    net_content_uom: netContentUom,
    gross_weight: row['Gross Weight'],
    net_weight: row['Net Weight'],
    base_unit_indicator:
      row['Base Unit'] !== undefined ? parseBoolean(row['Base Unit']) : true,
    orderable_unit_indicator:
      row['Orderable Unit'] !== undefined
        ? parseBoolean(row['Orderable Unit'])
        : true,
    despatch_unit_indicator:
      row['Despatch Unit'] !== undefined
        ? parseBoolean(row['Despatch Unit'])
        : true,
    country_of_origin: row['Country of Origin'],
    effective_from_date: parseDate(row['Effective From']),
    effective_to_date: parseDate(row['Effective To']),
    product_lifecycle_status: row['Product Lifecycle Status'],
    active: true,
  };

  return product;
}

/**
 * Upserts a product into the Supabase products table
 */
async function upsertProduct(
  product: ProductInsert
): Promise<{ success: boolean; isUpdate: boolean; error?: string }> {
  try {
    // Check if product exists
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('gtin', product.gtin)
      .single();

    const isUpdate = !!existing;

    // Upsert the product
    const { error } = await supabase.from('products').upsert(product, {
      onConflict: 'gtin',
      ignoreDuplicates: false,
    });

    if (error) {
      return { success: false, isUpdate, error: error.message };
    }

    return { success: true, isUpdate };
  } catch (error) {
    return {
      success: false,
      isUpdate: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Main import function
 */
async function importGS1Excel(
  filePath: string,
  sheetName: string = 'NL'
): Promise<ImportStats> {
  const stats: ImportStats = {
    totalRows: 0,
    processed: 0,
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  try {
    console.log(`📂 Loading Excel file: ${filePath}`);

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    if (!workbook.SheetNames.includes(sheetName)) {
      throw new Error(
        `Sheet "${sheetName}" not found. Available sheets: ${workbook.SheetNames.join(
          ', '
        )}`
      );
    }

    console.log(`📊 Reading sheet: ${sheetName}`);
    const worksheet = workbook.Sheets[sheetName];

    if (!worksheet) {
      throw new Error(`Failed to read worksheet "${sheetName}"`);
    }

    // Convert sheet to JSON
    const rawData: GS1Row[] = XLSX.utils.sheet_to_json(worksheet);
    stats.totalRows = rawData.length;

    console.log(`📋 Found ${stats.totalRows} rows to process`);
    console.log('🔄 Starting import...\n');

    // Process each row
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row) continue;

      const rowIndex = i + 2; // Excel row number (accounting for header)

      try {
        // Map and validate the row
        const product = mapGS1ToProduct(row, rowIndex);

        if (!product) {
          stats.skipped++;
          continue;
        }

        // Upsert to database
        const result = await upsertProduct(product);

        if (result.success) {
          stats.processed++;
          if (result.isUpdate) {
            stats.updated++;
            console.log(`✅ Updated: ${product.name} (GTIN: ${product.gtin})`);
          } else {
            stats.inserted++;
            console.log(`➕ Inserted: ${product.name} (GTIN: ${product.gtin})`);
          }
        } else {
          stats.errors.push(`Row ${rowIndex}: ${result.error}`);
          console.error(`❌ Error on row ${rowIndex}: ${result.error}`);
        }

        // Progress indicator for large files
        if ((i + 1) % 100 === 0) {
          console.log(
            `📈 Progress: ${i + 1}/${stats.totalRows} rows processed`
          );
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        stats.errors.push(`Row ${rowIndex}: ${errorMsg}`);
        console.error(`❌ Error processing row ${rowIndex}: ${errorMsg}`);
      }
    }

    return stats;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    stats.errors.push(`File processing error: ${errorMsg}`);
    throw error;
  }
}

/**
 * Print import statistics
 */
function printStats(stats: ImportStats) {
  console.log('\n📊 Import Statistics:');
  console.log('═'.repeat(40));
  console.log(`Total rows in file:    ${stats.totalRows}`);
  console.log(`Successfully processed: ${stats.processed}`);
  console.log(`New products inserted:  ${stats.inserted}`);
  console.log(`Existing products updated: ${stats.updated}`);
  console.log(`Rows skipped:          ${stats.skipped}`);
  console.log(`Errors encountered:    ${stats.errors.length}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }

  console.log('═'.repeat(40));

  if (stats.processed > 0) {
    console.log('✅ Import completed successfully!');
  } else {
    console.log('⚠️  No products were imported.');
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    // Get file path from command line arguments or use default
    const filePath = process.argv[2] || resolve(process.cwd(), 'gs1-data.xlsx');
    const sheetName = process.argv[3] || 'NL';

    console.log('🚀 GS1 Excel Import Tool');
    console.log('═'.repeat(40));
    console.log(`File: ${filePath}`);
    console.log(`Sheet: ${sheetName}`);
    console.log(`Supabase URL: ${supabaseUrl}`);
    console.log('═'.repeat(40));

    // Test Supabase connection
    console.log('🔗 Testing Supabase connection...');
    const { error: connectionError } = await supabase
      .from('products')
      .select('count', { count: 'exact', head: true });

    if (connectionError) {
      throw new Error(
        `Failed to connect to Supabase: ${connectionError.message}`
      );
    }
    console.log('✅ Supabase connection successful\n');

    // Run the import
    const stats = await importGS1Excel(filePath, sheetName);

    // Print results
    printStats(stats);
  } catch (error) {
    console.error('\n💥 Import failed:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export {
  importGS1Excel,
  mapGS1ToProduct,
  validateGTIN,
  parseBoolean,
  parseDate,
  parseNetContent,
};
