# Remcura Permission System - Complete Guide

## Overview

Remcura implements a comprehensive role-based permission system that provides fine-grained access control across all application features. The system is built on top of Supabase with Row Level Security (RLS) and consists of multiple layers of protection.

## System Architecture

### 1. Database Layer (Supabase)
```sql
-- Core Tables
practices                 -- Practice/clinic organizations
practice_members         -- User-practice relationships with roles  
user_permissions        -- Granular permission assignments
practice_locations      -- Physical locations within practices
```

### 2. Application Layer (Frontend)
```typescript
// Core Services
src/services/permissions.ts    -- Permission checking logic
src/services/admin.ts         -- Admin operations
src/router/index.ts          -- Route guards
src/stores/auth.ts           -- Authentication state
```

## Role Hierarchy

### Platform Level
```
platform_owner (Super Admin)
├── Full platform access
├── All practice functionalities  
├── System monitoring
├── Database administration
└── Multi-practice management
```

### Practice Level  
```
owner (Practice Owner)
├── All practice functions
├── User management
├── Settings & configuration
├── Financial reports
└── Complete data access

manager (Practice Manager)  
├── Operations management
├── Product & inventory control
├── Order management
├── Basic analytics
└── Location management

assistant (Practice Assistant)
├── Daily operations
├── Product management
├── Inventory operations
├── Order processing
└── Basic reporting

logistics (Logistics Staff)
├── Inventory counting
├── Stock adjustments
├── Product viewing
└── Limited access only

member (General Member)
├── Basic product viewing
├── Limited inventory access
└── Order creation only

guest (External Access)
├── Very limited read access
└── Product catalog viewing
```

## Role Definitions & Permissions

### Complete Role Matrix

| Feature | platform_owner | owner | manager | assistant | logistics | member | guest |
|---------|---------------|-------|---------|-----------|-----------|--------|-------|
| **Dashboard Access** | ✅ All | ✅ Practice | ✅ Practice | ✅ Practice | ✅ Basic | ✅ Basic | ❌ |
| **Product Management** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | 👁️ View | 👁️ View | 👁️ Limited |
| **Inventory Management** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Count/Adjust | 👁️ View | ❌ |
| **Order Management** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ❌ | ✅ Create | ❌ |
| **Location Management** | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **User Management** | ✅ Full | ✅ Full | ✅ Basic | ❌ | ❌ | ❌ | ❌ |
| **Analytics & Reports** | ✅ Full | ✅ Full | ✅ Full | ✅ Basic | ❌ | ❌ | ❌ |
| **Supplier Management** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ❌ | ❌ | ❌ |
| **Settings Management** | ✅ Full | ✅ Full | ✅ Basic | ❌ | ❌ | ❌ | ❌ |
| **Platform Functions** | ✅ Only | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Implementation Details

### 1. Role Assignment

**Database Storage:**
```sql
-- practice_members table
CREATE TABLE practice_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(practice_id, user_id)
);
```

**TypeScript Definition:**
```typescript
export type UserRole = 
  | 'owner' 
  | 'manager' 
  | 'assistant' 
  | 'logistics' 
  | 'member' 
  | 'guest' 
  | 'platform_owner';
```

### 2. Permission Checking

**Basic Role Check:**
```typescript
// Check user's role in current practice
const userRole = await PermissionService.getUserRole();
const canEdit = PermissionService.canEditProducts(userRole);
```

**Granular Permission Check:**
```typescript
// Check specific permission
const hasPermission = await PermissionService.hasPermission(
  'write',        // permission type
  'products',     // resource type  
  'product-123'   // specific resource (optional)
);
```

**Route Protection:**
```typescript
// In route definition
{
  path: '/products',
  meta: {
    requiresAuth: true,
    requiresRole: ['owner', 'manager', 'assistant', 'platform_owner']
  }
}
```

### 3. Component-Level Access Control

**Conditional Rendering:**
```vue
<template>
  <q-btn 
    v-if="canDeleteProducts" 
    @click="deleteProduct"
    label="Delete"
  />
</template>

<script setup lang="ts">
import { PermissionService } from 'src/services/permissions';

const userRole = await PermissionService.getUserRole();
const canDeleteProducts = PermissionService.canDeleteProducts(userRole);
</script>
```

**Navigation Guard Example:**
```typescript
// MainLayout.vue
const isAdmin = computed(() => {
  const role = authStore.user?.role;
  return role === 'admin' || role === 'owner' || role === 'platform_owner';
});

const showPlatformNav = computed(() => {
  return authStore.user?.role === 'platform_owner';
});
```

## Database Schema

### Core Permission Tables

```sql
-- Practices (Organizations)
CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice Members (User-Practice-Role Relationships)
CREATE TABLE practice_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(practice_id, user_id)
);

-- Granular User Permissions (Optional Fine-Grained Control)
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  practice_id UUID NOT NULL REFERENCES practices(id),
  permission_type VARCHAR(20) NOT NULL, -- 'read', 'write', 'admin'
  resource_type VARCHAR(50) NOT NULL,   -- 'products', 'inventory', etc.
  resource_id UUID,                     -- Specific resource (optional)
  conditions JSONB,                     -- Additional conditions
  granted_by UUID,                      -- Who granted the permission
  expires_at TIMESTAMP WITH TIME ZONE, -- Expiration (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice Locations (Location-Based Permissions)
CREATE TABLE practice_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_id UUID NOT NULL REFERENCES practices(id),
  name VARCHAR(100) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_locations ENABLE ROW LEVEL SECURITY;

-- Example: Users can only see their own practice data
CREATE POLICY "Users can view own practice data" ON practices
  FOR SELECT USING (
    id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid()
    )
  );

-- Example: Only owners can modify practice settings
CREATE POLICY "Only owners can update practices" ON practices
  FOR UPDATE USING (
    id IN (
      SELECT practice_id FROM practice_members 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );
```

## Security Features

### 1. Multi-Layer Protection
- **Database Level**: RLS policies on all sensitive tables
- **API Level**: Permission checks in Supabase functions
- **Application Level**: Role-based route guards
- **Component Level**: Conditional rendering and access

### 2. Principle of Least Privilege
- Users receive minimum permissions necessary
- Role escalation requires explicit approval
- Time-limited permissions supported
- Location-based restrictions available

### 3. Audit Trail
```sql
-- Activity logging for permission changes
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  practice_id UUID,
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Setup & Configuration

### 1. Initial Platform Setup

**Create Platform Owner:**
```typescript
// During platform initialization
const platformOwner = {
  email: 'admin@remcura.com',
  role: 'platform_owner',
  practice_id: null // Platform level access
};
```

### 2. Practice Setup

**Create New Practice:**
```typescript
async function createPractice(practiceData: PracticeInsert, ownerId: string) {
  // 1. Create practice
  const practice = await supabase
    .from('practices')
    .insert(practiceData)
    .select()
    .single();

  // 2. Assign owner role
  await supabase
    .from('practice_members')
    .insert({
      practice_id: practice.id,
      user_id: ownerId,
      role: 'owner'
    });

  return practice;
}
```

### 3. User Invitation Flow

**Invite New User:**
```typescript
async function inviteUser(
  email: string, 
  role: UserRole, 
  practiceId: string,
  invitedBy: string
) {
  // 1. Create user invitation
  const invitation = await supabase
    .from('invitations')
    .insert({
      email,
      role,
      practice_id: practiceId,
      invited_by: invitedBy,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

  // 2. Send invitation email
  await sendInvitationEmail(email, invitation.token);
  
  return invitation;
}
```

## Common Patterns

### 1. Permission-Based Navigation

```typescript
// Navigation items configuration
const navigationItems = computed(() => {
  const role = authStore.user?.role;
  const items = [];

  // Basic items for all authenticated users
  items.push({ name: 'dashboard', icon: 'dashboard' });

  // Manager+ level features
  if (['owner', 'manager', 'assistant', 'platform_owner'].includes(role)) {
    items.push({ name: 'products', icon: 'inventory' });
    items.push({ name: 'orders', icon: 'shopping_cart' });
  }

  // Owner+ level features  
  if (['owner', 'platform_owner'].includes(role)) {
    items.push({ name: 'users', icon: 'people' });
    items.push({ name: 'settings', icon: 'settings' });
  }

  // Platform owner exclusive
  if (role === 'platform_owner') {
    items.push({ name: 'platform', icon: 'admin_panel_settings' });
  }

  return items;
});
```

### 2. Conditional API Calls

```typescript
// Load data based on permissions
async function loadDashboardData() {
  const role = await PermissionService.getUserRole();
  const data: any = {};

  // Basic metrics for all roles
  data.inventory = await loadInventoryMetrics();

  // Analytics for management roles
  if (['owner', 'manager', 'assistant', 'platform_owner'].includes(role)) {
    data.analytics = await loadAnalytics();
  }

  // Financial data for owners only
  if (['owner', 'platform_owner'].includes(role)) {
    data.financial = await loadFinancialMetrics();
  }

  // Platform metrics for platform owners
  if (role === 'platform_owner') {
    data.platform = await loadPlatformMetrics();
  }

  return data;
}
```

### 3. Error Handling

```typescript
// Permission denied handling
try {
  await performAction();
} catch (error) {
  if (error.code === 'PERMISSION_DENIED') {
    $q.notify({
      type: 'negative',
      message: 'You do not have permission to perform this action',
      caption: 'Contact your administrator if you believe this is an error'
    });
    
    // Optionally redirect to appropriate page
    router.push('/dashboard');
  }
}
```

## Testing Permissions

### 1. Unit Tests

```typescript
// Test permission functions
describe('PermissionService', () => {
  test('owner can manage users', () => {
    expect(PermissionService.canManageUsers('owner')).toBe(true);
  });

  test('assistant cannot manage users', () => {
    expect(PermissionService.canManageUsers('assistant')).toBe(false);
  });

  test('platform_owner has all permissions', () => {
    expect(PermissionService.canManageUsers('platform_owner')).toBe(true);
    expect(PermissionService.canEditProducts('platform_owner')).toBe(true);
    expect(PermissionService.canManageInventory('platform_owner')).toBe(true);
  });
});
```

### 2. Integration Tests

```typescript
// Test role-based access
describe('Route Protection', () => {
  test('manager cannot access user management', async () => {
    await loginAs('manager');
    const response = await router.push('/users');
    expect(response.redirected).toBe(true);
    expect(response.path).toBe('/dashboard');
  });

  test('platform_owner can access all routes', async () => {
    await loginAs('platform_owner');
    
    const routes = ['/products', '/orders', '/users', '/platform'];
    for (const route of routes) {
      const response = await router.push(route);
      expect(response.redirected).toBe(false);
    }
  });
});
```

## Best Practices

### 1. Security
- ✅ Always check permissions on both frontend and backend
- ✅ Use RLS policies as the primary security layer
- ✅ Implement proper session management
- ✅ Log all permission-sensitive actions
- ✅ Regular permission audits

### 2. User Experience
- ✅ Hide unavailable features instead of showing errors
- ✅ Provide clear feedback when permissions are denied
- ✅ Progressive disclosure based on role capabilities
- ✅ Contextual help for permission requirements

### 3. Maintenance
- ✅ Document all permission changes
- ✅ Use consistent naming conventions
- ✅ Regular cleanup of expired permissions
- ✅ Monitor for permission escalation attempts
- ✅ Backup permission configurations

## Troubleshooting

### Common Issues

**1. "Access Denied" Errors**
```bash
# Check user role assignment
SELECT pm.role, p.name as practice_name 
FROM practice_members pm
JOIN practices p ON pm.practice_id = p.id
WHERE pm.user_id = 'USER_ID';

# Verify route permissions
# Check src/router/routes.ts for requiresRole arrays
```

**2. Platform Owner Not Working**
```typescript
// Ensure platform_owner is included in all permission checks
const hasAccess = ['owner', 'manager', 'platform_owner'].includes(userRole);
```

**3. Database Permission Errors**
```sql
-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Migration Guide

### Adding New Roles
1. Update `UserRole` type in `permissions.ts`
2. Add role definition to `ROLE_DEFINITIONS`
3. Update all permission functions
4. Add role to relevant route `requiresRole` arrays
5. Update navigation logic
6. Add database migrations if needed

### Modifying Permissions
1. Update permission functions in `PermissionService`
2. Modify route guards as needed
3. Update component access controls
4. Test all affected features
5. Document changes

---

## Summary

The Remcura permission system provides enterprise-grade access control with:

- **7 distinct role levels** from guest to platform_owner
- **Granular permission checking** for all features
- **Multi-layer security** with database, API, and UI protection
- **Flexible architecture** supporting future extensions
- **Complete audit trail** for compliance requirements

The system is **production-ready** and handles all access control requirements for medical inventory management across multiple practices and user types.