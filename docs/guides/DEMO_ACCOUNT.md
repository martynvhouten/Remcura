# Demo Account Implementation - Remcura

## 🎯 Overview

The demo account system allows users to test Remcura with realistic data without impacting production data. The demo account (`demo@remcura.com`) has full access to a pre-configured practice with realistic medical inventory data.

## ✨ Features

### 1. Demo Account Behavior

- **Email**: `demo@remcura.com`
- **Practice**: Remka Demo Clinic (ID: `550e8400-e29b-41d4-a716-446655440000`)
- **Role**: Owner (full access)
- **Behavior**: Identical to normal user, no UI restrictions

### 2. Demo Data

- **39 stock level entries** across 3 locations
- **3 locations**: Main Storage, Emergency Kit, Treatment Room 1
- **13 realistic medical products** (BD syringes, Ansell gloves, etc.)
- **2 suppliers**: Remka B.V. (Magento) & Medishop Direct (Manual)
- **11 orders** with various statuses (delivered, shipped, draft)
- **3+ low stock alerts** for demonstration

### 3. UI Indicators

- **Demo Banner**: Appears at the top for demo users
- **Demo Reset Card**: Only visible in Admin Dashboard for demo user
- **No UI restrictions**: All functions work normally

## 🔐 RLS Implementation

### Access Policy

The system uses a hybrid RLS (Row Level Security) approach:

```sql
-- Example: Stock levels policy
CREATE POLICY "stock_levels_select_policy" ON stock_levels
  FOR SELECT USING (
    practice_id = '550e8400-e29b-41d4-a716-446655440000'::uuid OR
    practice_id IN (
      SELECT practice_id FROM practice_members
      WHERE user_id = auth.uid()
    )
  );
```

### Demo User Detection

The system identifies demo users through:

1. **Email-based detection**: `demo@remcura.com`
2. **Practice ID check**: Demo practice UUID
3. **Role verification**: Demo-specific permissions

## 🔄 Demo Reset Functionality

### Reset Process

The demo reset clears and repopulates:
- All stock levels and movements
- Order lists and order items
- Counting sessions and entries
- Supplier data and configurations

### Implementation

```typescript
// Demo reset service
export async function resetDemoData() {
  const demoUserId = 'demo-user-uuid'
  const demoPracticeId = '550e8400-e29b-41d4-a716-446655440000'
  
  // Clear existing demo data
  await clearDemoData(demoPracticeId)
  
  // Repopulate with fresh demo data
  await populateDemoData(demoPracticeId, demoUserId)
  
  // Update timestamps
  await updateDemoTimestamps()
}
```

### Reset Triggers

- **Manual reset**: Admin dashboard button
- **Scheduled reset**: Daily at 00:00 UTC
- **Automatic reset**: After 24 hours of inactivity

## 📊 Demo Data Structure

### Products (13 items)
```json
{
  "BD Discardit Syringes 5ml": {
    "gtin": "8717185391831",
    "category": "Syringes",
    "locations": ["Main Storage", "Treatment Room 1"]
  },
  "Ansell TouchNTuff Gloves": {
    "gtin": "8717185395532",
    "category": "Protection",
    "locations": ["Main Storage", "Emergency Kit"]
  }
  // ... 11 more products
}
```

### Locations (3 locations)
```json
[
  {
    "name": "Main Storage",
    "description": "Primary inventory storage room",
    "product_count": 13
  },
  {
    "name": "Emergency Kit",
    "description": "Emergency medical supplies",
    "product_count": 8
  },
  {
    "name": "Treatment Room 1",
    "description": "Primary treatment room supplies",
    "product_count": 10
  }
]
```

### Orders (11 orders)
```json
[
  {
    "supplier": "Remka B.V.",
    "status": "delivered",
    "items": 5,
    "total_value": "€ 234.50"
  },
  {
    "supplier": "Medishop Direct",
    "status": "shipped",
    "items": 3,
    "total_value": "€ 156.75"
  }
  // ... 9 more orders
]
```

## 🛡️ Security Considerations

### Data Isolation

- **Practice isolation**: Demo data completely separate from real practices
- **User isolation**: Demo users cannot access production data
- **API protection**: All endpoints respect RLS policies

### Privacy Protection

- **No real data**: All demo data is synthetic
- **Regular cleanup**: Automatic reset prevents data accumulation
- **Audit logging**: All demo activities are logged but separated

## 🚀 Usage Instructions

### For Developers

1. **Access demo account**:
   ```
   Email: demo@remcura.com
   Magic Code: 🏥DEMO2026
   ```

2. **Test scenarios**:
   - Stock counting workflows
   - Order management processes
   - Batch tracking and FIFO
   - Mobile interface testing

3. **Reset demo data**:
   - Use Admin Dashboard reset button
   - Or call API endpoint: `POST /api/demo/reset`

### For Sales/Marketing

1. **Demo preparation**:
   - Ensure demo data is fresh
   - Verify all features work
   - Prepare realistic scenarios

2. **Demo flow**:
   - Start with inventory overview
   - Show stock counting on mobile
   - Demonstrate order suggestions
   - Highlight analytics dashboard

### For Training

1. **User onboarding**:
   - Practice with demo account first
   - Learn core workflows
   - Test error scenarios safely

2. **Feature training**:
   - Explore all major features
   - Practice mobile workflows
   - Test integration scenarios

## 🔧 Maintenance

### Regular Tasks

- **Daily reset**: Automated at midnight UTC
- **Data verification**: Weekly data integrity checks
- **Performance monitoring**: Track demo usage patterns
- **Feature updates**: Sync new features with demo data

### Monitoring

- **Usage analytics**: Track demo sessions
- **Performance metrics**: Monitor response times
- **Error tracking**: Log and resolve demo issues
- **User feedback**: Collect demo experience feedback

## 🎭 Demo Scenarios

### Scenario 1: Daily Stock Count
1. Login with demo account
2. Navigate to Counting page
3. Start new counting session
4. Count products using mobile interface
5. Review variances and submit

### Scenario 2: Low Stock Management
1. View dashboard alerts
2. Check low stock items
3. Create order suggestions
4. Generate supplier order
5. Track order status

### Scenario 3: Batch Management
1. View products with batches
2. Check expiry dates
3. Use FIFO allocation
4. Track batch movements
5. Generate batch reports

## 📈 Analytics & Insights

### Demo Usage Metrics
- **Session duration**: Average 15-20 minutes
- **Feature usage**: Most tested features by users
- **Conversion rate**: Demo to trial conversion tracking
- **User feedback**: Demo experience ratings

### Optimization Opportunities
- **Performance improvements**: Based on demo usage patterns
- **Feature prioritization**: Most/least used features
- **User flow optimization**: Common navigation patterns
- **Training focus**: Features that need more explanation

---

**🎯 The demo account provides a safe, realistic environment for users to explore Remcura's capabilities without any risk to production data.**