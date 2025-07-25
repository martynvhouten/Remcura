import { supabase } from 'src/boot/supabase';
import { v4 as uuidv4 } from 'uuid';

// 🎭 REVOLUTIONARY MAGIC INVITE SERVICE
// The most innovative user management system ever created!

export interface MagicInvite {
  id: string;
  practice_id: string;
  magic_code: string;
  emoji_sequence: string;
  color_theme: string;
  practice_avatar_seed: string;
  target_role: string;
  department?: string;
  location_access: string[];
  allow_guest_mode: boolean;
  guest_session_hours: number;
  auto_upgrade_to_member: boolean;
  ai_role_suggestions: Record<string, any>;
  contextual_welcome_message?: string;
  suggested_avatar_style: string;
  qr_code_data?: string;
  whatsapp_link?: string;
  deep_link: string;
  expires_at?: string;
  max_uses: number;
  current_uses: number;
  auto_regenerate: boolean;
  welcome_achievement: string;
  onboarding_quest_enabled: boolean;
  progress_rewards: Record<string, any>;
  created_by: string;
  used_by: string[];
  shared_via: string[];
  view_count: number;
  conversion_rate: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GuestSession {
  id: string;
  magic_invite_id: string;
  practice_id: string;
  guest_name: string;
  display_emoji: string;
  session_color: string;
  session_token: string;
  expires_at: string;
  is_active: boolean;
  can_extend: boolean;
  granted_permissions: Record<string, any>;
  accessible_locations: string[];
  restricted_features: string[];
  device_fingerprint: string;
  ip_address: string;
  user_agent: string;
  timezone: string;
  actions_performed: Record<string, any>;
  achievements_unlocked: string[];
  upgrade_prompts_shown: number;
  showed_upgrade_interest: boolean;
  upgrade_trigger_action?: string;
  converted_to_user_id?: string;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface CreateMagicInviteRequest {
  practice_id: string;
  target_role: string;
  department?: string;
  location_access?: string[];
  max_uses?: number;
  guest_session_hours?: number;
  allow_guest_mode?: boolean;
  emoji_sequence?: string;
  color_theme?: string;
  expires_in_days?: number;
}

export interface CreateGuestSessionRequest {
  magic_invite_id: string;
  guest_name: string;
  display_emoji?: string;
  device_fingerprint: string;
  ip_address?: string;
  user_agent?: string;
  timezone?: string;
}

export class MagicInviteService {
  
  // 🎨 GENERATE VISUAL MAGIC CODE
  static async generateMagicCode(
    practiceName: string, 
    department?: string, 
    style: 'friendly' | 'professional' | 'playful' = 'friendly'
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('generate_magic_code', {
        practice_name: practiceName,
        department: department || null,
        style
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating magic code:', error);
      // Fallback generation
      const emojis = ['🏥', '💊', '🦷', '👩‍⚕️', '🔬', '🩺', '💉', '⚕️'];
      const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      const cityPart = practiceName.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 8);
      const year = new Date().getFullYear();
      return `${randomEmoji}${cityPart}✨${year}`;
    }
  }

  // ✨ CREATE MAGIC INVITE
  static async createMagicInvite(request: CreateMagicInviteRequest): Promise<MagicInvite> {
    try {
      // Generate the magic code
      const magicCode = await this.generateMagicCode(
        'PRACTICE', // We'll get the actual practice name from the database
        request.department
      );

      const inviteData = {
        id: uuidv4(),
        practice_id: request.practice_id,
        magic_code: magicCode,
        emoji_sequence: request.emoji_sequence || '🏥✨',
        color_theme: request.color_theme || 'blue',
        practice_avatar_seed: uuidv4().substring(0, 8),
        target_role: request.target_role,
        department: request.department,
        location_access: request.location_access || [],
        allow_guest_mode: request.allow_guest_mode ?? true,
        guest_session_hours: request.guest_session_hours || 8,
        auto_upgrade_to_member: false,
        ai_role_suggestions: {},
        suggested_avatar_style: 'medical',
        deep_link: `remcura://join/${magicCode}`,
        expires_at: request.expires_in_days 
          ? new Date(Date.now() + request.expires_in_days * 24 * 60 * 60 * 1000).toISOString()
          : null,
        max_uses: request.max_uses || 1,
        current_uses: 0,
        auto_regenerate: false,
        welcome_achievement: 'practice_explorer',
        onboarding_quest_enabled: true,
        progress_rewards: {},
        used_by: [],
        shared_via: [],
        view_count: 0,
        conversion_rate: 0
      };

      const { data, error } = await supabase
        .from('magic_invites')
        .insert([inviteData])
        .select()
        .single();

      if (error) throw error;

      // Generate QR code and WhatsApp link
      await this.updateInviteLinks(data.id, magicCode);

      return data;
    } catch (error) {
      console.error('Error creating magic invite:', error);
      throw new Error('Failed to create magic invite');
    }
  }

  // 🔗 UPDATE INVITE LINKS (QR & WhatsApp)
  static async updateInviteLinks(inviteId: string, magicCode: string): Promise<void> {
    try {
      const qrCodeData = `https://app.remcura.com/join/${magicCode}`;
              const whatsappLink = `https://wa.me/?text=${encodeURIComponent(
          `🏥 Je bent uitgenodigd voor Remcura!\n\nGebruik deze magische code: ${magicCode}\n\nDirect toegang: ${qrCodeData}`
      )}`;

      await supabase
        .from('magic_invites')
        .update({
          qr_code_data: qrCodeData,
          whatsapp_link: whatsappLink,
          updated_at: new Date().toISOString()
        })
        .eq('id', inviteId);
    } catch (error) {
      console.error('Error updating invite links:', error);
    }
  }

  // 🔍 VALIDATE MAGIC CODE
  static async validateMagicCode(magicCode: string): Promise<MagicInvite | null> {
    try {
      const { data, error } = await supabase
        .from('magic_invites')
        .select(`
          *,
          practices!inner(name, id)
        `)
        .eq('magic_code', magicCode)
        .eq('is_active', true)
        .gt('max_uses', 'current_uses')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .single();

      if (error || !data) return null;

      // Track view
      await this.trackInviteView(data.id);

      return data;
    } catch (error) {
      console.error('Error validating magic code:', error);
      return null;
    }
  }

  // 🔄 INCREMENT INVITE USAGE
  static async incrementInviteUsage(inviteId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('magic_invites')
        .update({
          current_uses: supabase.raw('current_uses + 1'),
          last_used_at: new Date().toISOString()
        })
        .eq('id', inviteId);

      if (error) {
        console.error('Error incrementing invite usage:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating invite usage:', error);
      throw error;
    }
  }

  // 🎮 CREATE GUEST SESSION
  static async createGuestSession(request: CreateGuestSessionRequest): Promise<GuestSession> {
    try {
      // Generate unique session token
      const sessionToken = uuidv4();
      
      // Get invite details
      const invite = await this.validateMagicCode(request.magic_invite_id);
      if (!invite) throw new Error('Invalid invite');

      const sessionData = {
        id: uuidv4(),
        magic_invite_id: request.magic_invite_id,
        practice_id: invite.practice_id,
        guest_name: request.guest_name,
        display_emoji: request.display_emoji || '👤',
        session_color: this.generateSessionColor(),
        session_token: sessionToken,
        expires_at: new Date(Date.now() + invite.guest_session_hours * 60 * 60 * 1000).toISOString(),
        is_active: true,
        can_extend: true,
        granted_permissions: this.getGuestPermissions(invite.target_role),
        accessible_locations: invite.location_access,
        restricted_features: this.getRestrictedFeatures(invite.target_role),
        device_fingerprint: request.device_fingerprint,
        ip_address: request.ip_address || '',
        user_agent: request.user_agent || '',
        timezone: request.timezone || 'UTC',
        actions_performed: {},
        achievements_unlocked: [invite.welcome_achievement],
        upgrade_prompts_shown: 0,
        showed_upgrade_interest: false,
        last_activity_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('guest_sessions')
        .insert([sessionData])
        .select()
        .single();

      if (error) throw error;

      // Update invite usage
      await this.incrementInviteUsage(request.magic_invite_id);

      // Track conversion
      await this.trackInviteAnalytics(request.magic_invite_id, 'guest_join', {
        guest_name: request.guest_name,
        session_id: data.id
      });

      return data;
    } catch (error) {
      console.error('Error creating guest session:', error);
      throw new Error('Failed to create guest session');
    }
  }

  // 📊 ANALYTICS & TRACKING
  static async trackInviteView(inviteId: string): Promise<void> {
    try {
      await supabase.rpc('increment_invite_views', { invite_id: inviteId });
    } catch (error) {
      console.error('Error tracking invite view:', error);
    }
  }

  static async trackInviteAnalytics(
    inviteId: string, 
    eventType: string, 
    eventData: any = {}
  ): Promise<void> {
    try {
      await supabase
        .from('invite_analytics')
        .insert([{
          magic_invite_id: inviteId,
          event_type: eventType,
          event_data: eventData,
          user_agent: navigator.userAgent,
          device_type: this.getDeviceType(),
          created_at: new Date().toISOString()
        }]);
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  }

  // 🎨 HELPER METHODS
  static generateSessionColor(): string {
    const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#009688'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  static getGuestPermissions(role: string): Record<string, any> {
    const basePermissions = {
      view_inventory: true,
      view_products: true,
      view_locations: true
    };

    switch (role) {
      case 'admin':
        return {
          ...basePermissions,
          edit_inventory: true,
          manage_orders: true,
          view_analytics: true
        };
      case 'member':
        return {
          ...basePermissions,
          edit_inventory: true,
          create_orders: true
        };
      default:
        return basePermissions;
    }
  }

  static getRestrictedFeatures(role: string): string[] {
    const commonRestrictions = ['user_management', 'system_settings', 'billing'];
    
    switch (role) {
      case 'guest':
        return [...commonRestrictions, 'delete_data', 'export_data'];
      case 'member':
        return [...commonRestrictions, 'delete_data'];
      default:
        return commonRestrictions;
    }
  }

  static getDeviceType(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('mobile')) return 'mobile';
    if (userAgent.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  // 📱 GET ACTIVE SESSIONS
  static async getActiveSessions(practiceId: string): Promise<GuestSession[]> {
    try {
      const { data, error } = await supabase
        .from('guest_sessions')
        .select('*')
        .eq('practice_id', practiceId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  }

  // 🔄 EXTEND GUEST SESSION
  static async extendGuestSession(sessionId: string, additionalHours: number = 4): Promise<void> {
    try {
      const newExpiryTime = new Date(Date.now() + additionalHours * 60 * 60 * 1000).toISOString();
      
      await supabase
        .from('guest_sessions')
        .update({
          expires_at: newExpiryTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error extending guest session:', error);
      throw new Error('Failed to extend session');
    }
  }

  // 🎯 GET PRACTICE INVITES
  static async getPracticeInvites(practiceId: string): Promise<MagicInvite[]> {
    try {
      const { data, error } = await supabase
        .from('magic_invites')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting practice invites:', error);
      return [];
    }
  }
}

export default MagicInviteService; 