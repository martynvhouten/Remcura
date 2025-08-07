#!/usr/bin/env ts-node

/**
 * Test script for GS1 Excel import functionality
 * This demonstrates how to use the import functions programmatically
 */

// Set dummy environment variables for testing
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

import {
  validateGTIN,
  parseBoolean,
  parseDate,
  parseNetContent,
  mapGS1ToProduct,
} from './importGs1Excel';

console.log('🧪 Testing GS1 Import Functions\n');

// Test GTIN validation
console.log('📋 Testing GTIN Validation:');
const testGTINs = [
  '12345678', // 8 digits - valid
  '123456789012', // 12 digits - valid
  '1234567890123', // 13 digits - valid
  '12345678901234', // 14 digits - valid
  '123456789', // 9 digits - invalid
  '123ABC456', // contains letters - invalid
  '', // empty - invalid
  '1234567890123456', // 16 digits - invalid
];

testGTINs.forEach(gtin => {
  const isValid = validateGTIN(gtin);
  console.log(`  ${gtin.padEnd(16)} → ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

// Test boolean parsing
console.log('\n📋 Testing Boolean Parsing:');
const testBooleans = [
  true,
  false,
  'true',
  'false',
  'TRUE',
  'FALSE',
  'yes',
  'no',
  'YES',
  'NO',
  '1',
  '0',
  'Y',
  'N',
];

testBooleans.forEach(value => {
  const parsed = parseBoolean(value);
  console.log(`  ${String(value).padEnd(8)} → ${parsed}`);
});

// Test date parsing
console.log('\n📋 Testing Date Parsing:');
const testDates = [
  '2024-01-15',
  '01/15/2024',
  '15-01-2024',
  new Date('2024-01-15'),
  44945, // Excel date serial number for 2024-01-15
  'invalid-date',
];

testDates.forEach(date => {
  const parsed = parseDate(date);
  console.log(`  ${String(date).padEnd(15)} → ${parsed || 'Invalid'}`);
});

// Test net content parsing
console.log('\n📋 Testing Net Content Parsing:');
const testContents = [
  '250g',
  '1.5L',
  '500ml',
  '2kg',
  '100',
  '750 ml',
  'invalid',
];

testContents.forEach(content => {
  const parsed = parseNetContent(content);
  console.log(
    `  ${content.padEnd(10)} → value: ${parsed.value || 'N/A'}, uom: ${
      parsed.uom || 'N/A'
    }`
  );
});

// Test full row mapping
console.log('\n📋 Testing Row Mapping:');
const testRow = {
  GTIN: '1234567890123',
  'Product Name': 'Test Product',
  Brand: 'Test Brand',
  'GPC Brick Code': '10000123',
  'Net Content': '250g',
  'Net Content UOM': 'gram',
  'Gross Weight': 300,
  'Net Weight': 250,
  'Base Unit': 'true',
  'Orderable Unit': 'yes',
  'Despatch Unit': '1',
  'Country of Origin': 'NLD',
  'Effective From': '2024-01-01',
  'Effective To': '2025-12-31',
  'Product Lifecycle Status': 'Active',
  Description: 'Test product description',
  Category: 'Test Category',
  Price: 9.99,
};

const mappedProduct = mapGS1ToProduct(testRow, 1);
if (mappedProduct) {
  console.log('✅ Successfully mapped test row:');
  console.log(`  GTIN: ${mappedProduct.gtin}`);
  console.log(`  Name: ${mappedProduct.name}`);
  console.log(`  Brand: ${mappedProduct.brand}`);
  console.log(
    `  Net Content: ${mappedProduct.net_content_value}${mappedProduct.net_content_uom}`
  );
  console.log(
    `  Unit Indicators: Base=${mappedProduct.base_unit_indicator}, Order=${mappedProduct.orderable_unit_indicator}, Despatch=${mappedProduct.despatch_unit_indicator}`
  );
  console.log(
    `  Dates: ${mappedProduct.effective_from_date} to ${mappedProduct.effective_to_date}`
  );
} else {
  console.log('❌ Failed to map test row');
}

// Test invalid row
console.log('\n📋 Testing Invalid Row (missing GTIN):');
const invalidRow = {
  'Product Name': 'Invalid Product',
  Brand: 'Test Brand',
};

const mappedInvalidProduct = mapGS1ToProduct(invalidRow, 2);
console.log(
  mappedInvalidProduct
    ? "❌ Should have failed but didn't"
    : '✅ Correctly rejected invalid row'
);

console.log('\n🎉 All tests completed!');
console.log('\n💡 Usage examples:');
console.log(
  '  npm run gs1:import                                    # Import default file'
);
console.log(
  '  npx ts-node scripts/importGs1Excel.ts myfile.xlsx     # Import custom file'
);
console.log(
  '  npx ts-node scripts/importGs1Excel.ts file.xlsx "UK"  # Import specific sheet'
);
