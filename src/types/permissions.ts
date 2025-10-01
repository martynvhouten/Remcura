// User roles and permissions types
export type UserRole =
  | 'owner'
  | 'manager'
  | 'assistant'
  | 'logistics'
  | 'member'
  | 'guest'
  | 'platform_owner';
export type PermissionType = 'read' | 'write' | 'admin';
export type ResourceType =
  | 'products'
  | 'inventory'
  | 'orders'
  | 'analytics'
  | 'users'
  | 'practice'
  | 'all';

export interface Permission {
  permission_type: PermissionType;
  resource_type: ResourceType;
  resource_id?: string;
  conditions?: Record<string, any>;
  source: 'role' | 'user';
}

export interface RoleDefinition {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
}

export interface PermissionCheck {
  permission_type: PermissionType;
  resource_type: ResourceType;
  resource_id?: string;
  practice_id?: string;
}
