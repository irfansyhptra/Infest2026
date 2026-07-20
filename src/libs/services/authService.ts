import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

// Interface untuk user profile sesuai dengan database schema
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  whatsapp?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | null;
  profile_image_url?: string | null;
  
  // Academic Information
  university?: string | null;
  faculty?: string | null;
  major?: string | null;
  student_id?: string | null;
  student_id_image_url?: string | null;
  semester?: number | null;
  graduation_year?: number | null;
  
  // Address Information
  province?: string | null;
  city?: string | null;
  address?: string | null;
  postal_code?: string | null;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

// Interface untuk result authentication
export interface AuthResult {
  user: User | null;
  profile: UserProfile | null;
  error: string | null;
}

// Security logging wrapper yang simple
const logEvent = (type: string, identifier: string, details: any = {}) => {
  try {
    console.log(`[SECURITY] ${type}:`, { identifier, timestamp: new Date().toISOString(), ...details });
  } catch (error) {
    console.error('Security logging failed:', error);
  }
};

export const authService = {
  /**
   * Sign up dengan email/password dan buat profile di database
   * Menggunakan Supabase Auth + custom user_profiles table
   */
  async signUp(email: string, password: string, fullName: string): Promise<AuthResult> {
    try {
      logEvent('register_attempt', email, { method: 'email' });

      // Validasi input
      if (!email || !password || !fullName) {
        return { 
          user: null, 
          profile: null, 
          error: "Email, password, dan nama lengkap harus diisi" 
        };
      }

      if (fullName.trim().length < 2) {
        return { 
          user: null, 
          profile: null, 
          error: "Nama lengkap minimal 2 karakter" 
        };
      }

      // Sign up user di Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (authError) {
        logEvent('register_failure', email, { 
          error: authError.message, 
          method: 'email',
          code: authError.message 
        });
        
        // Handle specific Supabase Auth errors
        if (authError.message.includes('already registered')) {
          return { 
            user: null, 
            profile: null, 
            error: "Email sudah terdaftar. Silakan gunakan email lain atau login." 
          };
        } else if (authError.message.includes('Password should be at least')) {
          return { 
            user: null, 
            profile: null, 
            error: "Password minimal 6 karakter" 
          };
        } else if (authError.message.includes('Invalid email')) {
          return { 
            user: null, 
            profile: null, 
            error: "Format email tidak valid" 
          };
        }
        
        return { user: null, profile: null, error: authError.message };
      }

      if (!authData.user) {
        return { 
          user: null, 
          profile: null, 
          error: "Pendaftaran gagal, silakan coba lagi" 
        };
      }

      // Buat profile di tabel user_profiles
      // Menggunakan RPC atau direct insert berdasarkan RLS policy
      const profileData = {
        id: authData.user.id,
        email: authData.user.email!,
        full_name: fullName.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedProfile, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        logEvent('profile_creation_failure', email, { 
          error: profileError.message,
          code: profileError.code,
          userId: authData.user.id 
        });
        
        // Jika gagal buat profile, user sudah terbuat di auth
        // Beri informasi bahwa registrasi berhasil tapi ada masalah dengan profile
        return {
          user: authData.user,
          profile: null,
          error: "Akun berhasil dibuat, namun ada masalah dengan profil. Silakan lengkapi profil di dashboard."
        };
      }

      logEvent('register_success', email, { 
        method: 'email', 
        userId: authData.user.id,
        profileCreated: !!insertedProfile 
      });

      return {
        user: authData.user,
        profile: insertedProfile as UserProfile,
        error: null
      };

    } catch (error: any) {
      console.error('Sign up error:', error);
      logEvent('register_failure', email, { 
        error: error.message, 
        method: 'email',
        stack: error.stack 
      });
      return { 
        user: null, 
        profile: null, 
        error: "Terjadi kesalahan sistem. Silakan coba lagi." 
      };
    }
  },

  /**
   * Sign in dengan email/password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      logEvent('login_attempt', email, { method: 'email' });

      if (!email || !password) {
        return { 
          user: null, 
          profile: null, 
          error: "Email dan password harus diisi" 
        };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (authError) {
        logEvent('login_failure', email, { 
          error: authError.message, 
          method: 'email' 
        });

        // Handle specific auth errors
        if (authError.message.includes('Invalid login credentials')) {
          return { 
            user: null, 
            profile: null, 
            error: "Email atau password salah" 
          };
        } else if (authError.message.includes('Email not confirmed')) {
          return { 
            user: null, 
            profile: null, 
            error: "Email belum diverifikasi. Periksa inbox email Anda." 
          };
        }
        
        return { user: null, profile: null, error: authError.message };
      }

      if (!authData.user) {
        return { 
          user: null, 
          profile: null, 
          error: "Login gagal" 
        };
      }

      // Get user profile dari database
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, profile belum ada
        console.error('Profile fetch error:', profileError);
        logEvent('profile_fetch_failure', email, { 
          error: profileError.message,
          userId: authData.user.id 
        });
        
        // User bisa login tapi profile belum ada, biarkan mereka masuk
        // dan buat profile nanti
      }

      logEvent('login_success', email, { 
        method: 'email', 
        userId: authData.user.id,
        hasProfile: !!profileData 
      });

      return {
        user: authData.user,
        profile: profileData as UserProfile,
        error: null
      };

    } catch (error: any) {
      console.error('Sign in error:', error);
      logEvent('login_failure', email, { 
        error: error.message, 
        method: 'email' 
      });
      return { 
        user: null, 
        profile: null, 
        error: "Terjadi kesalahan sistem. Silakan coba lagi." 
      };
    }
  },

  /**
   * Sign out
   */
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        return { error: error.message };
      }
      
      logEvent('logout_success', 'current_user', {});
      return { error: null };

    } catch (error: any) {
      console.error('Sign out error:', error);
      return { error: error.message };
    }
  },

  /**
   * Forgot password
   */
  async forgotPassword(email: string): Promise<{ error: string | null }> {
    try {
      logEvent('password_reset_request', email, {});

      if (!email) {
        return { error: "Email harus diisi" };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        email.toLowerCase().trim(),
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (error) {
        logEvent('password_reset_failure', email, { error: error.message });
        return { error: error.message };
      }

      logEvent('password_reset_sent', email, {});
      return { error: null };

    } catch (error: any) {
      console.error('Forgot password error:', error);
      logEvent('password_reset_failure', email, { error: error.message });
      return { error: "Terjadi kesalahan sistem. Silakan coba lagi." };
    }
  },

  /**
   * Reset password
   */
  async resetPassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      if (!newPassword) {
        return { error: "Password baru harus diisi" };
      }

      if (newPassword.length < 6) {
        return { error: "Password minimal 6 karakter" };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logEvent('password_reset_failure', 'current_user', { error: error.message });
        return { error: error.message };
      }

      logEvent('password_reset_success', 'current_user', {});
      return { error: null };

    } catch (error: any) {
      console.error('Reset password error:', error);
      logEvent('password_reset_failure', 'current_user', { error: error.message });
      return { error: "Terjadi kesalahan sistem. Silakan coba lagi." };
    }
  },

  /**
   * Get current user dengan profile
   */
  async getCurrentUser(): Promise<AuthResult> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return { 
          user: null, 
          profile: null, 
          error: authError?.message || "User tidak ditemukan" 
        };
      }

      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      }

      return {
        user,
        profile: profileData as UserProfile,
        error: null
      };

    } catch (error: any) {
      console.error('Get current user error:', error);
      return { 
        user: null, 
        profile: null, 
        error: error.message 
      };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      if (!userId) {
        return { profile: null, error: "User ID tidak valid" };
      }

      // Upsert, bukan update: sebagian user (signUp yang gagal bikin profil,
      // OAuth lama) belum punya baris di user_profiles, dan UPDATE 0 baris
      // bikin .single() melempar PGRST116 "multiple (or no) rows returned".
      const updateData = {
        ...updates,
        id: userId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(updateData, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        console.error('Update profile error:', error);
        logEvent('profile_update_failure', userId, { 
          error: error.message,
          fields: Object.keys(updates) 
        });
        return { profile: null, error: error.message };
      }

      logEvent('profile_update_success', userId, { 
        fields: Object.keys(updates) 
      });

      return { profile: data as UserProfile, error: null };

    } catch (error: any) {
      console.error('Update profile error:', error);
      return { 
        profile: null, 
        error: "Terjadi kesalahan sistem. Silakan coba lagi." 
      };
    }
  },

  /**
   * Sign in dengan OAuth (Google)
   */
  async signInWithOAuth(provider: 'google'): Promise<{ url: string | null; error: string | null }> {
    try {
      logEvent('oauth_login_attempt', 'oauth_user', { method: provider });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });

      if (error) {
        logEvent('oauth_login_failure', 'oauth_user', { 
          error: error.message, 
          method: provider 
        });
        return { url: null, error: error.message };
      }

      return { url: data.url, error: null };

    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      logEvent('oauth_login_failure', 'oauth_user', { 
        error: error.message, 
        method: provider 
      });
      return { 
        url: null, 
        error: "Terjadi kesalahan sistem. Silakan coba lagi." 
      };
    }
  },

  /**
   * Create atau update profile untuk OAuth users
   */
  async ensureProfile(user: User): Promise<{ profile: UserProfile | null; error: string | null }> {
    try {
      logEvent('oauth_profile_check', user.email || user.id, { 
        provider: user.app_metadata?.provider 
      });

      // Check apakah profile sudah ada
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', fetchError);
        logEvent('oauth_profile_check_failure', user.email || user.id, { 
          error: fetchError.message 
        });
        return { profile: null, error: 'Gagal memeriksa profil yang ada' };
      }

      if (existingProfile) {
        // Profile sudah ada
        logEvent('oauth_profile_found', user.email || user.id, { 
          provider: user.app_metadata?.provider 
        });
        return { profile: existingProfile as UserProfile, error: null };
      }

      // Buat profile baru untuk OAuth user
      logEvent('oauth_profile_creation_start', user.email || user.id, { 
        provider: user.app_metadata?.provider 
      });

      const fullName = user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'User';

      const profileData = {
        id: user.id,
        email: user.email!,
        full_name: fullName,
        profile_image_url: user.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating OAuth profile:', createError);
        logEvent('oauth_profile_creation_failure', user.email || user.id, { 
          error: createError.message,
          code: createError.code 
        });
        
        // Memberikan error message yang lebih user-friendly
        if (createError.code === '42501') {
          return { profile: null, error: 'Gagal membuat profil karena masalah keamanan' };
        } else if (createError.code === '23505') {
          return { profile: null, error: 'Profil sudah ada' };
        }
        
        return { profile: null, error: 'Gagal membuat profil. Silakan coba lagi.' };
      }

      logEvent('oauth_profile_created', user.email || user.id, { 
        provider: user.app_metadata?.provider 
      });

      return { profile: newProfile as UserProfile, error: null };

    } catch (error: any) {
      console.error('Ensure profile error:', error);
      logEvent('oauth_profile_error', user.email || user.id, { 
        error: error.message 
      });
      return { 
        profile: null, 
        error: "Terjadi kesalahan sistem. Silakan coba lagi." 
      };
    }
  }
};
