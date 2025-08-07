# GS1 Excel Import Tool

This tool imports product data from GS1 Excel files into the Supabase `products` table, maintaining
full GS1 compliance with fields like GTIN, GPC Brick Code, packaging information, and regulatory
data.

## Prerequisites

1. **Environment Variables**: Create a `.env` file in the project root with:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

2. **Dependencies**: Install required packages:
   ```bash
   npm install
   ```

## Usage

### Basic Import

```bash
# Import from default file (gs1-data.xlsx) using NL sheet
npm run gs1:import

# Or using ts-node directly
npx ts-node scripts/importGs1Excel.ts
```

### Custom File and Sheet

```bash
# Import from specific file and sheet
npx ts-node scripts/importGs1Excel.ts /path/to/your-file.xlsx "SheetName"

# Example with custom path
npx ts-node scripts/importGs1Excel.ts ./data/products.xlsx "Netherlands"
```

## Expected Excel Format

The script expects an Excel file with the following columns (based on GS1 ECHO Common Data Model):

### Required Columns

- **GTIN**: Global Trade Item Number (8, 12, 13, or 14 digits)
- **Product Name**: Name of the product

### Optional GS1 Columns

- **GPC Brick Code**: GS1 Global Product Classification
- **Brand**: Product brand
- **Net Content**: Content amount (e.g., "250g", "1L")
- **Net Content UOM**: Unit of measure (g, ml, kg, etc.)
- **Gross Weight**: Total weight including packaging
- **Net Weight**: Product weight without packaging
- **Base Unit**: Boolean (true/false, yes/no, 1/0)
- **Orderable Unit**: Boolean indicator
- **Despatch Unit**: Boolean indicator
- **Country of Origin**: ISO 3166-1 alpha-3 country code
- **Effective From**: Date when product becomes available
- **Effective To**: Date when product is discontinued
- **Product Lifecycle Status**: Current status (Active, Discontinued, etc.)

### Additional Columns

- **Description**: Product description
- **Category**: Product category
- **SKU**: Stock Keeping Unit (auto-generated if missing)
- **Price**: Product price
- **Unit**: Unit of measure for inventory

## Features

### Data Validation

- **GTIN Validation**: Ensures GTINs are 8, 12, 13, or 14 digits
- **Required Field Check**: Validates presence of GTIN and Product Name
- **Format Parsing**: Automatically parses net content (e.g., "250g" → value: 250, uom: "g")
- **Boolean Conversion**: Handles various boolean formats (true/false, yes/no, 1/0)
- **Date Parsing**: Supports Excel dates and various date formats

### Database Operations

- **Upsert Logic**: Updates existing products (by GTIN) or inserts new ones
- **Conflict Resolution**: Uses GTIN as unique identifier
- **Transaction Safety**: Each row processed independently
- **Error Handling**: Continues processing even if individual rows fail

### Logging and Reporting

- **Progress Tracking**: Shows progress for large files (every 100 rows)
- **Detailed Statistics**: Reports total rows, insertions, updates, and errors
- **Error Details**: Lists all errors with row numbers and reasons
- **Success Confirmation**: Clear success/failure indicators

## Example Output

```
🚀 GS1 Excel Import Tool
═══════════════════════════════════════════
File: /path/to/gs1-data.xlsx
Sheet: NL
Supabase URL: https://your-project.supabase.co
═══════════════════════════════════════════
🔗 Testing Supabase connection...
✅ Supabase connection successful

📂 Loading Excel file: /path/to/gs1-data.xlsx
📊 Reading sheet: NL
📋 Found 150 rows to process
🔄 Starting import...

➕ Inserted: Product A (GTIN: 1234567890123)
✅ Updated: Product B (GTIN: 9876543210987)
⚠️  Row 5: Missing GTIN, skipping
📈 Progress: 100/150 rows processed

📊 Import Statistics:
═══════════════════════════════════════════
Total rows in file:        150
Successfully processed:     147
New products inserted:      89
Existing products updated:  58
Rows skipped:              3
Errors encountered:        0
═══════════════════════════════════════════
✅ Import completed successfully!
```

## Error Handling

The script handles various error scenarios gracefully:

### Validation Errors

- **Missing GTIN**: Row skipped with warning
- **Invalid GTIN**: Row skipped with format error
- **Missing Product Name**: Row skipped with warning

### Database Errors

- **Connection Issues**: Script exits with clear error message
- **Constraint Violations**: Individual row fails, others continue
- **Permission Issues**: Clear error message with troubleshooting

### File Errors

- **File Not Found**: Clear error with expected path
- **Invalid Sheet**: Lists available sheets
- **Corrupted Excel**: Reports parsing errors

## Troubleshooting

### Common Issues

1. **"Missing required environment variables"**

   - Check your `.env` file exists and contains correct Supabase credentials

2. **"Sheet 'NL' not found"**

   - Verify sheet name exists in Excel file
   - Check for case sensitivity
   - Use: `npx ts-node scripts/importGs1Excel.ts file.xlsx "CorrectSheetName"`

3. **"Failed to connect to Supabase"**

   - Verify SUPABASE_URL is correct
   - Check SUPABASE_SERVICE_ROLE_KEY permissions
   - Ensure your Supabase project is active

4. **"Invalid GTIN format"**
   - GTINs must be 8, 12, 13, or 14 digits
   - Remove any non-numeric characters from GTIN column

### Performance Tips

- **Large Files**: The script processes rows sequentially for data integrity
- **Progress Tracking**: Monitor progress for files >100 rows
- **Memory Usage**: Script is optimized for files up to 10,000 rows
- **Network Latency**: Processing speed depends on Supabase connection

## Script Integration

The import script can be integrated into automated workflows:

```typescript
import { importGS1Excel } from './scripts/importGs1Excel';

// Programmatic usage
const stats = await importGS1Excel('./data/products.xlsx', 'NL');
console.log(`Processed ${stats.processed} products`);
```

## Support

For issues or questions:

1. Check the error messages and troubleshooting section
2. Verify your Excel file format matches the expected structure
3. Test with a small sample file first
4. Check Supabase project permissions and RLS policies
