import { supabase } from 'src/boot/supabase';
import { useAuthStore } from 'src/stores/auth';
import type {
  UserRole,
  PermissionType,
  ResourceType,
  Permission,
  RoleDefinition,
} from '@/types/permissions';
import type { Database } from '@/types';

type PermissionRow =
  Database['public']['Functions']['get_user_permissions']['Returns'][number];

const mapPermissionRow = (
  row: PermissionRow,
  resourceType: ResourceType
): Permission => ({
  permission_type: row.permission as PermissionType,
  resource_type: resourceType,
  resource_id: row.resource_id ?? undefined,
  source: 'role',
});

// Role definitions for frontend display
export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  owner: {
    role: 'owner',
    displayName: 'Eigenaar',
    description: 'Volledige toegang tot alle functies en instellingen',
    permissions: [
      { permission_type: 'admin', resource_type: 'all', source: 'role' },
    ],
  },
  manager: {
    role: 'manager',
    displayName: 'Manager',
    description: 'Operationele toegang tot producten, voorraad en bestellingen',
    permissions: [
      { permission_type: 'write', resource_type: 'products', source: 'role' },
      { permission_type: 'write', resource_type: 'inventory', source: 'role' },
      { permission_type: 'write', resource_type: 'orders', source: 'role' },
      { permission_type: 'read', resource_type: 'analytics', source: 'role' },
      { permission_type: 'read', resource_type: 'users', source: 'role' },
    ],
  },
  assistant: {
    role: 'assistant',
    displayName: 'Assistent',
    description: 'Algemene operationele toegang',
    permissions: [
      { permission_type: 'write', resource_type: 'products', source: 'role' },
      { permission_type: 'write', resource_type: 'inventory', source: 'role' },
      { permission_type: 'write', resource_type: 'orders', source: 'role' },
      {
        permission_type: 'read',
        resource_type: 'analytics',
        conditions: { basic_only: true },
        source: 'role',
      },
    ],
  },
  logistics: {
    role: 'logistics',
    displayName: 'Logistiek',
    description: 'Beperkt tot voorraadtelling en product viewing',
    permissions: [
      { permission_type: 'read', resource_type: 'products', source: 'role' },
      {
        permission_type: 'write',
        resource_type: 'inventory',
        conditions: { actions: ['count', 'adjust'] },
        source: 'role',
      },
      { permission_type: 'read', resource_type: 'inventory', source: 'role' },
    ],
  },
  member: {
    role: 'member',
    displayName: 'Lid',
    description: 'Basistoegang tot producten en voorraad',
    permissions: [
      { permission_type: 'read', resource_type: 'products', source: 'role' },
      { permission_type: 'read', resource_type: 'inventory', source: 'role' },
      {
        permission_type: 'write',
        resource_type: 'orders',
        conditions: { own_only: true },
        source: 'role',
      },
    ],
  },
  guest: {
    role: 'guest',
    displayName: 'Gast',
    description: 'Zeer beperkte toegang',
    permissions: [
      {
        permission_type: 'read',
        resource_type: 'products',
        conditions: { limited: true },
        source: 'role',
      },
      {
        permission_type: 'read',
        resource_type: 'inventory',
        conditions: { limited: true },
        source: 'role',
      },
    ],
  },
  platform_owner: {
    role: 'platform_owner',
    displayName: 'Platform Eigenaar',
    description: 'Volledige platform en alle praktijk toegang',
    permissions: [
      { permission_type: 'admin', resource_type: 'all', source: 'role' },
    ],
  },
};

export class PermissionService {
  /**
   * Check if current user has permission for a specific action
   */
  static async hasPermission(
    permissionType: PermissionType,
    resourceType: ResourceType,
    resourceId?: string
  ): Promise<boolean> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    const practiceId = authStore.clinicId;

    if (!userId) {
      return false;
    }

    // Platform owner bypass
    // Prefer backend check; fallback to app_metadata
    try {
      const { data: isPo } = await supabase.rpc('is_platform_owner');
      if (isPo === true) return true;
    } catch {
      // ignore
    }
    const isPlatformOwnerFallback =
      !!(authStore.user as any)?.app_metadata?.role &&
      (authStore.user as any).app_metadata.role === 'platform_owner';
    if (isPlatformOwnerFallback) return true;

    // Practice owner bypass (treat practice owners as having all permissions)
    if (practiceId) {
      try {
        const { data: membership } = await supabase
          .from('practice_members')
          .select('role')
          .eq('practice_id', practiceId)
          .eq('user_id', userId)
          .single();

        if (membership?.role === 'owner') {
          return true;
        }
      } catch {
        // Ignore and continue to explicit permission check
      }
    }

    // If no practiceId (Magic Join users), grant basic read permissions
    if (!practiceId) {
      console.warn('No practice ID - applying magic join fallback permissions');
      // Grant read access to basic resources for magic join users
      if (
        permissionType === 'read' &&
        ['products', 'inventory'].includes(resourceType)
      ) {
        return true;
      }
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('check_user_permission_v2', {
        p_user_id: userId,
        p_practice_id: practiceId,
        p_permission_type: permissionType,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
      });

      if (error) {
        console.error('Error checking permission:', error);
        // Fallback: grant basic read permissions if RPC fails
        if (
          permissionType === 'read' &&
          ['products', 'inventory'].includes(resourceType)
        ) {
          return true;
        }
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in hasPermission:', error);
      // Fallback: grant basic read permissions if RPC fails
      if (
        permissionType === 'read' &&
        ['products', 'inventory'].includes(resourceType)
      ) {
        return true;
      }
      return false;
    }
  }

  /**
   * Get all effective permissions for current user
   */
  static async getUserPermissions(): Promise<Permission[]> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    const practiceId = authStore.clinicId;

    if (!userId || !practiceId) {
      return [];
    }

    try {
      const { data, error } = await supabase.rpc('get_user_permissions', {
        user_id_param: userId,
        practice_id_param: practiceId,
      });

      if (error) {
        console.error('Error fetching user permissions:', error);
        return [];
      }

      return (data ?? []).map(row =>
        mapPermissionRow(
          row,
          row.permission === 'write_orders'
            ? 'orders'
            : ((row.permission as ResourceType | undefined) ?? 'products')
        )
      );
    } catch (error) {
      console.error('Error in getUserPermissions:', error);
      return [];
    }
  }

  /**
   * Get user's role in current practice
   */
  static async getUserRole(): Promise<UserRole | null> {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    const practiceId = authStore.clinicId;

    // Platform owner from JWT/app_metadata
    try {
      const { data: isPo } = await supabase.rpc('is_platform_owner');
      if (isPo === true) return 'platform_owner';
    } catch {
      // ignore
    }
    const isPlatformOwnerFallback =
      !!(authStore.user as any)?.app_metadata?.role &&
      (authStore.user as any).app_metadata.role === 'platform_owner';
    if (isPlatformOwnerFallback) return 'platform_owner';

    // If no practiceId, this might be a Magic Join user - give them guest access for now
    if (!practiceId) {
      console.warn(
        'No practice ID found - granting guest access for magic join user'
      );
      return 'guest';
    }

    if (!userId) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('practice_members')
        .select('role')
        .eq('user_id', userId)
        .eq('practice_id', practiceId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        // If user not found in practice_members, might be magic join - give guest access
        return 'guest';
      }

      return (data?.role as UserRole) || 'guest';
    } catch (error) {
      console.error('Error in getUserRole:', error);
      return 'guest';
    }
  }

  /**
   * Check if user can perform specific actions based on role
   */
  static canCreateProducts(role: UserRole): boolean {
    return ['owner', 'manager', 'assistant', 'platform_owner'].includes(role);
  }

  static canEditProducts(role: UserRole): boolean {
    return ['owner', 'manager', 'assistant', 'platform_owner'].includes(role);
  }

  static canDeleteProducts(role: UserRole): boolean {
    return ['owner', 'manager', 'platform_owner'].includes(role);
  }

  static canManageInventory(role: UserRole): boolean {
    return [
      'owner',
      'manager',
      'assistant',
      'logistics',
      'platform_owner',
    ].includes(role);
  }

  static canViewAnalytics(role: UserRole): boolean {
    return ['owner', 'manager', 'assistant', 'platform_owner'].includes(role);
  }

  static canManageUsers(role: UserRole): boolean {
    return ['owner', 'manager', 'platform_owner'].includes(role);
  }

  static canSubmitOrders(role: UserRole): boolean {
    return ['owner', 'manager', 'assistant', 'platform_owner'].includes(role);
  }

  /**
   * Get role display information
   */
  static getRoleDefinition(role: UserRole): RoleDefinition {
    return ROLE_DEFINITIONS[role];
  }

  /**
   * Get all available roles
   */
  static getAllRoles(): RoleDefinition[] {
    return Object.values(ROLE_DEFINITIONS);
  }
}

// Composable for reactive permission checking
export function usePermissions() {
  const authStore = useAuthStore();

  const hasPermission = async (
    permissionType: PermissionType,
    resourceType: ResourceType,
    resourceId?: string
  ) => {
    return PermissionService.hasPermission(
      permissionType,
      resourceType,
      resourceId
    );
  };

  const getUserRole = async () => {
    return PermissionService.getUserRole();
  };

  const canCreateProducts = async () => {
    const role = await getUserRole();
    return role ? PermissionService.canCreateProducts(role) : false;
  };

  const canEditProducts = async () => {
    const role = await getUserRole();
    return role ? PermissionService.canEditProducts(role) : false;
  };

  const canDeleteProducts = async () => {
    const role = await getUserRole();
    return role ? PermissionService.canDeleteProducts(role) : false;
  };

  const canManageInventory = async () => {
    const role = await getUserRole();
    return role ? PermissionService.canManageInventory(role) : false;
  };

  const canViewAnalytics = async () => {
    const role = await getUserRole();
    return role ? PermissionService.canViewAnalytics(role) : false;
  };

  const canManageUsers = async () => {
    const role = await getUserRole();
    return role ? PermissionService.canManageUsers(role) : false;
  };

  return {
    hasPermission,
    getUserRole,
    canCreateProducts,
    canEditProducts,
    canDeleteProducts,
    canManageInventory,
    canViewAnalytics,
    canManageUsers,
  };
}
