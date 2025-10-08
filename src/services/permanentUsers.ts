import { supabase } from 'src/boot/supabase';
import { v4 as uuidv4 } from 'uuid';
import type { PermanentUser } from 'src/types/supabase';
import type { TablesInsert } from 'src/types/supabase.generated';

// 🚀 PERMANENT USERS SERVICE
// Handles the complete upgrade flow from guest to permanent team member

// Extended interface with UI properties
export interface EnhancedPermanentUser extends PermanentUser {
  initials?: string;
  avatarColor?: string;
  isOnline?: boolean;
}

export interface CreatePermanentUserRequest {
  practice_id: string;
  invite_id: string;
  full_name: string;
  role: string;
  department?: string;
  login_method: 'magic_code' | 'email_password' | 'device_remember';
  email?: string;
  password?: string;
  device_fingerprint?: string;
}

export interface LoginResult {
  success: boolean;
  user?: PermanentUser;
  session_token?: string;
  login_method?: string;
  error?: string;
}

// Remove duplicate interface - use from types

export class PermanentUserService {
  // 🎯 DETECT LOGIN TYPE - Smart detection between invite codes and personal codes
  static async detectLoginType(code: string): Promise<{
    type: 'invite' | 'personal' | 'invalid';
    data?: any;
  }> {
    try {
      // First check if it's a personal magic code
      const personalResult = await this.validatePersonalMagicCode(code);
      if (personalResult.success) {
        return { type: 'personal', data: personalResult.user };
      }

      // Then check if it's an invite code
      const inviteResult = await this.validateInviteCode(code);
      if (inviteResult.success) {
        return { type: 'invite', data: inviteResult.invite };
      }

      return { type: 'invalid' };
    } catch (error) {
      console.error('Error detecting login type:', error);
      return { type: 'invalid' };
    }
  }

  // 🔐 VALIDATE PERSONAL MAGIC CODE
  static async validatePersonalMagicCode(code: string): Promise<LoginResult> {
    try {
      const { data, error } = await supabase.rpc(
        'validate_personal_magic_code',
        {
          magic_code: code,
        }
      );

      if (error) throw error;

      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        data.success
      ) {
        // Create session token
        const sessionToken = this.generateSessionToken();
        await this.createUserSession(
          data.user_id as string,
          'magic_code',
          sessionToken
        );

        return {
          success: true,
          user: data as PermanentUser,
          session_token: sessionToken,
          login_method: 'personal_magic_code',
        };
      }

      // @ts-expect-error - Supabase RPC return type complexity for error field
      return { success: false, error: data?.error || 'Invalid magic code' };
    } catch (error) {
      console.error('Error validating personal magic code:', error);
      return { success: false, error: 'Invalid magic code' };
    }
  }

  // 📧 VALIDATE INVITE CODE (existing magic invite)
  static async validateInviteCode(code: string): Promise<{
    success: boolean;
    invite?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('magic_invites')
        .select(
          `
          *,
          practices!inner(id, name)
        `
        )
        .eq('magic_code', code)
        .eq('is_active', true)
        .gt('max_uses', 'current_uses')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .single();

      if (error || !data) {
        return { success: false, error: 'Invalid or expired invite code' };
      }

      return { success: true, invite: data };
    } catch (error) {
      console.error('Error validating invite code:', error);
      return { success: false, error: 'Invalid invite code' };
    }
  }

  // ⚡ CREATE PERMANENT USER - The upgrade process
  static async createPermanentUser(
    request: CreatePermanentUserRequest
  ): Promise<{
    success: boolean;
    user?: PermanentUser;
    personal_code?: string;
    error?: string;
  }> {
    try {
      // Generate personal magic code if using magic_code method
      let personalMagicCode = null;
      if (request.login_method === 'magic_code') {
        // Get practice name for code generation
        const { data: practice } = await supabase
          .from('practices')
          .select('name')
          .eq('id', request.practice_id)
          .single();

        personalMagicCode = await this.generatePersonalMagicCode(
          request.full_name,
          (practice && practice.name) || 'PRACTICE'
        );
      }

      // Hash password if using email/password
      let passwordHash = null;
      if (request.login_method === 'email_password' && request.password) {
        passwordHash = await this.hashPassword(request.password);
      }

      // Create the permanent user
      const userData = {
        id: uuidv4(),
        practice_id: request.practice_id,
        full_name: request.full_name,
        email: request.email || null,
        personal_magic_code: personalMagicCode,
        magic_code_enabled: request.login_method === 'magic_code',
        email_login_enabled: request.login_method === 'email_password',
        password_hash: passwordHash,
        device_remember_enabled: request.login_method === 'device_remember',
        device_tokens: [], // JSON field for device authentication
        role: request.role,
        department: request.department || null,
        permissions: {},
        is_active: true,
        login_count: 0,
        preferred_login_method: request.login_method,
        created_from_invite_id: request.invite_id,
        timezone: 'Europe/Amsterdam',
        language: 'nl',
      };

      const { data: newUser, error } = await supabase
        .from('permanent_users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;

      // Mark invite as converted
      await supabase
        .from('magic_invites')
        .update({
          converted_to_user_id: newUser.id,
          conversion_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.invite_id);

      // Create device token array entry if requested
      if (
        request.login_method === 'device_remember' &&
        request.device_fingerprint
      ) {
        await supabase
          .from('permanent_users')
          .update({
            device_tokens: [
              {
                fingerprint: request.device_fingerprint,
                created_at: new Date().toISOString(),
              },
            ],
          })
          .eq('id', newUser.id);
      }

      return {
        success: true,
        user: newUser,
        personal_code: personalMagicCode || '',
      };
    } catch (error) {
      console.error('Error creating permanent user:', error);
      return { success: false, error: 'Failed to create permanent user' };
    }
  }

  // 🎲 GENERATE PERSONAL MAGIC CODE
  static async generatePersonalMagicCode(
    fullName: string | undefined,
    practiceName: string
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc(
        'generate_personal_magic_code',
        {
          user_name: fullName || 'USER',
          practice_name: practiceName,
        }
      );

      if (error) throw error;
      return data as string;
    } catch (error) {
      console.error('Error generating personal magic code:', error);
      // Fallback generation
      const nameToUse: string = fullName ? fullName.toString() : 'USER';
      const nameParts = nameToUse.split(' ');
      const cleanName = (nameParts[0] || 'USER')
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      const year = new Date().getFullYear();
      return `🏥${cleanName}${year}`;
    }
  }

  // 🔒 PASSWORD UTILITIES
  static async hashPassword(password: string): Promise<string> {
    // In a real implementation, use bcrypt or similar
    // For now, just base64 encode (NOT SECURE - just for demo)
    return btoa(password);
  }

  static async verifyPassword(
    password: string,
    hash: string
  ): Promise<boolean> {
    // In a real implementation, use bcrypt.compare
    return btoa(password) === hash;
  }

  // 📱 DEVICE TOKEN MANAGEMENT - Now handled via permanent_users.device_tokens JSON field
  // Legacy device_tokens table has been removed - functionality moved to user JSON field

  // 🎫 SESSION MANAGEMENT
  static generateSessionToken(): string {
    return uuidv4() + '-' + Date.now();
  }

  static async createUserSession(
    userId: string,
    loginMethod: string,
    sessionToken: string
  ): Promise<void> {
    try {
      // Get practice_id from user
      const { data: user } = await supabase
        .from('permanent_users')
        .select('practice_id')
        .eq('id', userId)
        .single();

      const sessionData: TablesInsert<'user_sessions'> = {
        id: uuidv4(),
        user_id: userId,
        practice_id: user?.practice_id ?? '',
        session_token: sessionToken,
        login_method: loginMethod,
        device_fingerprint: this.getDeviceFingerprint(),
        ip_address: await this.getClientIP(),
        user_agent: navigator.userAgent,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
      };

      await supabase.from('user_sessions').insert([sessionData]);
    } catch (error) {
      console.error('Error creating user session:', error);
    }
  }

  // 👥 GET PRACTICE TEAM
  static async getPracticeTeam(
    practiceId: string
  ): Promise<EnhancedPermanentUser[]> {
    try {
      const { data, error } = await supabase
        .from('permanent_users')
        .select('*')
        .eq('practice_id', practiceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as EnhancedPermanentUser[];
    } catch (error) {
      console.error('Error getting practice team:', error);
      return [];
    }
  }

  // 🔧 UTILITY FUNCTIONS
  static getDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      return /iPad/.test(userAgent) ? 'iPad' : 'iPhone';
    } else if (/Android/.test(userAgent)) {
      return 'Android Device';
    } else if (/Mac/.test(userAgent)) {
      return 'Mac';
    } else if (/Windows/.test(userAgent)) {
      return 'Windows PC';
    }
    return 'Unknown Device';
  }

  static getDeviceFingerprint(): string {
    // Simple device fingerprinting (in production, use a proper library)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|');

    return btoa(fingerprint).substring(0, 32);
  }

  static generateTokenHash(): string {
    return uuidv4().replace(/-/g, '');
  }

  static async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return '0.0.0.0';
    }
  }

  // 📧 EMAIL LOGIN
  static async loginWithEmail(
    email: string,
    password: string
  ): Promise<LoginResult> {
    try {
      const { data: user, error } = await supabase
        .from('permanent_users')
        .select('*')
        .eq('email', email)
        .eq('email_login_enabled', true)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return { success: false, error: 'Invalid email or password' };
      }

      const isValidPassword = await this.verifyPassword(
        password,
        user.password_hash || ''
      );
      if (!isValidPassword) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Update login stats
      await supabase
        .from('permanent_users')
        .update({
          last_login_at: new Date().toISOString(),
          login_count: (user.login_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      // Create session
      const sessionToken = this.generateSessionToken();
      await this.createUserSession(user.id, 'email_password', sessionToken);

      return {
        success: true,
        user: user as PermanentUser,
        session_token: sessionToken,
        login_method: 'email_password',
      };
    } catch (error) {
      console.error('Error logging in with email:', error);
      return { success: false, error: 'Login failed' };
    }
  }
}

export default PermanentUserService;
