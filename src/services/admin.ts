import { supabase } from "@/services/supabase";
import type {
  Location,
  LocationInsert,
  LocationUpdate,
  UserPermission,
  UserPermissionInsert,
  Practice,
  PracticeMember,
  PermissionType,
  ResourceType,
} from "@/types/supabase";
import { useAuthStore } from "@/stores/auth";
import { analyticsService } from "./analytics";

export interface AuditLogEntry {
  id: string;
  practice_id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: any;
  new_values: any;
  metadata: any;
  timestamp: Date;
  ip_address?: string;
  user_agent?: string;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
  expires_at?: Date;
}

export class AdminService {
  /**
   * Create a new location
   */
  async createLocation(
    locationData: Omit<LocationInsert, "practice_id">
  ): Promise<Location> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;
    const user = authStore.user;

    if (!practiceId || !user) {
      throw new Error("Practice or user not found");
    }

    // Check admin permissions
    if (!(await this.hasPermission("admin", "practice", practiceId))) {
      throw new Error("Insufficient permissions to create locations");
    }

    const newLocation: LocationInsert = {
      ...locationData,
      practice_id: practiceId,
    };

    const { data, error } = await supabase
      .from("locations")
      .insert(newLocation)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create location: ${error.message}`);
    }

    // Log activity
    await this.logActivity("location_created", "location", data.id, null, data);

    return data;
  }

  /**
   * Get all locations for current practice
   */
  async getLocations(): Promise<Location[]> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) {
      throw new Error("No practice selected");
    }

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("practice_id", practiceId)
      .order("is_main", { ascending: false })
      .order("name");

    if (error) {
      throw new Error(`Failed to get locations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update location
   */
  async updateLocation(
    locationId: string,
    updates: LocationUpdate
  ): Promise<Location> {
    // Check permissions
    if (!(await this.hasPermission("write", "practice"))) {
      throw new Error("Insufficient permissions to update locations");
    }

    // Get current data for audit log
    const { data: currentData } = await supabase
      .from("locations")
      .select("*")
      .eq("id", locationId)
      .single();

    const { data, error } = await supabase
      .from("locations")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", locationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update location: ${error.message}`);
    }

    // Log activity
    await this.logActivity(
      "location_updated",
      "location",
      locationId,
      currentData,
      data
    );

    return data;
  }

  /**
   * Delete location
   */
  async deleteLocation(locationId: string): Promise<void> {
    // Check permissions
    if (!(await this.hasPermission("admin", "practice"))) {
      throw new Error("Insufficient permissions to delete locations");
    }

    // Get current data for audit log
    const { data: currentData } = await supabase
      .from("locations")
      .select("*")
      .eq("id", locationId)
      .single();

    // Check if it's the main location
    if (currentData?.is_main) {
      throw new Error("Cannot delete the main location");
    }

    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", locationId);

    if (error) {
      throw new Error(`Failed to delete location: ${error.message}`);
    }

    // Log activity
    await this.logActivity(
      "location_deleted",
      "location",
      locationId,
      currentData,
      null
    );
  }

  /**
   * Grant permission to user
   */
  async grantPermission(
    userId: string,
    permissionType: PermissionType,
    resourceType: ResourceType,
    resourceId?: string,
    locationId?: string,
    expiresAt?: Date
  ): Promise<UserPermission> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;
    const grantedBy = authStore.user?.id;

    if (!practiceId || !grantedBy) {
      throw new Error("Practice or user not found");
    }

    // Check admin permissions
    if (!(await this.hasPermission("admin", "practice"))) {
      throw new Error("Insufficient permissions to grant permissions");
    }

    const permissionData: UserPermissionInsert = {
      user_id: userId,
      practice_id: practiceId,
      location_id: locationId,
      permission_type: permissionType,
      resource_type: resourceType,
      resource_id: resourceId,
      granted_by: grantedBy,
      expires_at: expiresAt?.toISOString(),
    };

    const { data, error } = await supabase
      .from("user_permissions")
      .insert(permissionData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to grant permission: ${error.message}`);
    }

    // Log activity
    await this.logActivity(
      "permission_granted",
      "user_permission",
      data.id,
      null,
      data
    );

    return data;
  }

  /**
   * Revoke permission
   */
  async revokePermission(permissionId: string): Promise<void> {
    // Check admin permissions
    if (!(await this.hasPermission("admin", "practice"))) {
      throw new Error("Insufficient permissions to revoke permissions");
    }

    // Get current data for audit log
    const { data: currentData } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("id", permissionId)
      .single();

    const { error } = await supabase
      .from("user_permissions")
      .delete()
      .eq("id", permissionId);

    if (error) {
      throw new Error(`Failed to revoke permission: ${error.message}`);
    }

    // Log activity
    await this.logActivity(
      "permission_revoked",
      "user_permission",
      permissionId,
      currentData,
      null
    );
  }

  /**
   * Check if user has permission
   */
  async hasPermission(
    permissionType: PermissionType,
    resourceType: ResourceType,
    resourceId?: string,
    userId?: string
  ): Promise<boolean> {
    const authStore = useAuthStore();
    const checkUserId = userId || authStore.user?.id;
    const practiceId = authStore.selectedPractice?.id;

    if (!checkUserId || !practiceId) {
      return false;
    }

    // Check if user is practice owner (has all permissions)
    const { data: membership } = await supabase
      .from("practice_members")
      .select("role")
      .eq("practice_id", practiceId)
      .eq("user_id", checkUserId)
      .single();

    if (membership?.role === "owner") {
      return true;
    }

    // Check specific permissions
    let query = supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", checkUserId)
      .eq("practice_id", practiceId)
      .eq("permission_type", permissionType)
      .eq("resource_type", resourceType);

    if (resourceId) {
      query = query.eq("resource_id", resourceId);
    }

    const { data: permissions } = await query;

    if (!permissions || permissions.length === 0) {
      return false;
    }

    // Check if any permission is valid (not expired)
    const now = new Date();
    return permissions.some(
      (permission) =>
        !permission.expires_at || new Date(permission.expires_at) > now
    );
  }

  /**
   * Get detailed permission check
   */
  async checkPermission(
    permissionType: PermissionType,
    resourceType: ResourceType,
    resourceId?: string,
    userId?: string
  ): Promise<PermissionCheck> {
    const authStore = useAuthStore();
    const checkUserId = userId || authStore.user?.id;
    const practiceId = authStore.selectedPractice?.id;

    if (!checkUserId || !practiceId) {
      return { hasPermission: false, reason: "User or practice not found" };
    }

    // Check if user is practice owner
    const { data: membership } = await supabase
      .from("practice_members")
      .select("role")
      .eq("practice_id", practiceId)
      .eq("user_id", checkUserId)
      .single();

    if (membership?.role === "owner") {
      return { hasPermission: true, reason: "Practice owner" };
    }

    // Check specific permissions
    let query = supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", checkUserId)
      .eq("practice_id", practiceId)
      .eq("permission_type", permissionType)
      .eq("resource_type", resourceType);

    if (resourceId) {
      query = query.eq("resource_id", resourceId);
    }

    const { data: permissions } = await query;

    if (!permissions || permissions.length === 0) {
      return { hasPermission: false, reason: "No matching permissions found" };
    }

    // Check if any permission is valid
    const now = new Date();
    const validPermission = permissions.find(
      (permission) =>
        !permission.expires_at || new Date(permission.expires_at) > now
    );

    if (validPermission) {
      return {
        hasPermission: true,
        expires_at: validPermission.expires_at
          ? new Date(validPermission.expires_at)
          : undefined,
      };
    }

    return { hasPermission: false, reason: "All permissions have expired" };
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId?: string): Promise<UserPermission[]> {
    const authStore = useAuthStore();
    const checkUserId = userId || authStore.user?.id;
    const practiceId = authStore.selectedPractice?.id;

    if (!checkUserId || !practiceId) {
      throw new Error("User or practice not found");
    }

    const { data, error } = await supabase
      .from("user_permissions")
      .select("*")
      .eq("user_id", checkUserId)
      .eq("practice_id", practiceId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user permissions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get practice members with their permissions
   */
  async getPracticeMembers(): Promise<
    (PracticeMember & { permissions?: UserPermission[] })[]
  > {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) {
      throw new Error("No practice selected");
    }

    // Check admin permissions
    if (!(await this.hasPermission("read", "practice"))) {
      throw new Error("Insufficient permissions to view practice members");
    }

    const { data: members, error } = await supabase
      .from("practice_members")
      .select("*")
      .eq("practice_id", practiceId);

    if (error) {
      throw new Error(`Failed to get practice members: ${error.message}`);
    }

    // Get permissions for each member
    const membersWithPermissions = await Promise.all(
      (members || []).map(async (member) => {
        const permissions = await this.getUserPermissions(member.user_id);
        return { ...member, permissions };
      })
    );

    return membersWithPermissions;
  }

  /**
   * Log activity for audit trail
   */
  async logActivity(
    action: string,
    resourceType: string,
    resourceId: string | null,
    oldValues: any = null,
    newValues: any = null,
    metadata: any = {}
  ): Promise<void> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;
    const userId = authStore.user?.id;

    if (!practiceId) return;

    try {
      await analyticsService.trackEvent("admin_activity", {
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        metadata,
      });
    } catch (error) {
      console.error("Failed to log admin activity:", error);
    }
  }

  /**
   * Get audit log
   */
  async getAuditLog(filters?: {
    action?: string;
    resourceType?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) {
      throw new Error("No practice selected");
    }

    // Check admin permissions
    if (!(await this.hasPermission("admin", "practice"))) {
      throw new Error("Insufficient permissions to view audit log");
    }

    const events = await analyticsService.getUsageStats({
      event_type: "admin_activity",
      date_from: filters?.dateFrom,
      date_to: filters?.dateTo,
      user_id: filters?.userId,
    });

    const auditEntries: AuditLogEntry[] = events
      .filter((event) => {
        if (filters?.action && event.event_data?.action !== filters.action)
          return false;
        if (
          filters?.resourceType &&
          event.event_data?.resource_type !== filters.resourceType
        )
          return false;
        return true;
      })
      .map((event) => ({
        id: event.id,
        practice_id: event.practice_id,
        user_id: event.user_id,
        action: event.event_data?.action || "unknown",
        resource_type: event.event_data?.resource_type || "unknown",
        resource_id: event.event_data?.resource_id,
        old_values: event.event_data?.old_values,
        new_values: event.event_data?.new_values,
        metadata: event.event_data?.metadata || {},
        timestamp: new Date(event.created_at),
        ip_address: event.ip_address,
        user_agent: event.user_agent,
      }))
      .slice(0, filters?.limit || 100);

    return auditEntries;
  }

  /**
   * Set main location
   */
  async setMainLocation(locationId: string): Promise<void> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) {
      throw new Error("No practice selected");
    }

    // Check admin permissions
    if (!(await this.hasPermission("admin", "practice"))) {
      throw new Error("Insufficient permissions to set main location");
    }

    // Remove main flag from all locations
    await supabase
      .from("locations")
      .update({ is_main: false })
      .eq("practice_id", practiceId);

    // Set new main location
    const { error } = await supabase
      .from("locations")
      .update({ is_main: true })
      .eq("id", locationId)
      .eq("practice_id", practiceId);

    if (error) {
      throw new Error(`Failed to set main location: ${error.message}`);
    }

    // Log activity
    await this.logActivity(
      "main_location_changed",
      "location",
      locationId,
      null,
      { is_main: true }
    );
  }

  /**
   * Get permission templates
   */
  getPermissionTemplates() {
    return {
      assistant: [
        { permission_type: "read", resource_type: "bestellijst" },
        { permission_type: "write", resource_type: "bestellijst" },
        { permission_type: "read", resource_type: "product" },
        { permission_type: "write", resource_type: "product" },
        { permission_type: "read", resource_type: "cart" },
        { permission_type: "write", resource_type: "cart" },
      ],
      manager: [
        { permission_type: "read", resource_type: "bestellijst" },
        { permission_type: "write", resource_type: "bestellijst" },
        { permission_type: "delete", resource_type: "bestellijst" },
        { permission_type: "read", resource_type: "product" },
        { permission_type: "write", resource_type: "product" },
        { permission_type: "read", resource_type: "order" },
        { permission_type: "write", resource_type: "order" },
        { permission_type: "read", resource_type: "analytics" },
      ],
      admin: [{ permission_type: "admin", resource_type: "practice" }],
    };
  }

  /**
   * Apply permission template
   */
  async applyPermissionTemplate(
    userId: string,
    template: "assistant" | "manager" | "admin",
    locationId?: string
  ): Promise<void> {
    const templates = this.getPermissionTemplates();
    const permissions = templates[template];

    for (const permission of permissions) {
      await this.grantPermission(
        userId,
        permission.permission_type as PermissionType,
        permission.resource_type as ResourceType,
        undefined,
        locationId
      );
    }

    // Log activity
    await this.logActivity(
      "permission_template_applied",
      "user_permission",
      null,
      null,
      {
        user_id: userId,
        template,
        location_id: locationId,
      }
    );
  }

  /**
   * Bulk update user roles for location
   */
  async bulkUpdateLocationAccess(
    locationId: string,
    userUpdates: Array<{
      userId: string;
      permissionType: PermissionType;
      grant: boolean;
    }>
  ): Promise<void> {
    // Check admin permissions
    if (!(await this.hasPermission("admin", "practice"))) {
      throw new Error(
        "Insufficient permissions to bulk update location access"
      );
    }

    for (const update of userUpdates) {
      if (update.grant) {
        await this.grantPermission(
          update.userId,
          update.permissionType,
          "bestellijst",
          undefined,
          locationId
        );
      } else {
        // Find and revoke permission
        const permissions = await this.getUserPermissions(update.userId);
        const permission = permissions.find(
          (p) =>
            p.location_id === locationId &&
            p.permission_type === update.permissionType &&
            p.resource_type === "bestellijst"
        );

        if (permission) {
          await this.revokePermission(permission.id);
        }
      }
    }

    // Log activity
    await this.logActivity(
      "bulk_location_access_updated",
      "location",
      locationId,
      null,
      {
        updates: userUpdates,
      }
    );
  }
}

export const adminService = new AdminService();
