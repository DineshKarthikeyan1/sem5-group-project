import { supabase } from "../lib/supabase";

// Authentication Service for FinSay using Supabase
class AuthService {
  constructor() {
    this.currentUser = null;
    this.authListeners = [];

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      this.notifyListeners(event, session);
    });
  }

  // Add auth state listener
  onAuthStateChange(callback) {
    this.authListeners.push(callback);
    return () => {
      this.authListeners = this.authListeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  // Notify all listeners of auth state changes
  notifyListeners(event, session) {
    this.authListeners.forEach((callback) => callback(event, session));
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) {
      console.error("Error getting session:", error);
      return null;
    }
    return session;
  }

  // Check if user is authenticated
  async isAuthenticated() {
    const session = await this.getCurrentSession();
    return !!session?.user;
  }

  // Register new user
  async register(userData) {
    try {
      // Validate input
      if (
        !userData.email ||
        !userData.password ||
        !userData.firstName ||
        !userData.lastName
      ) {
        throw new Error("All fields are required");
      }

      if (userData.password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message:
          "Registration successful! Please check your email to verify your account.",
        user: data.user,
        needsVerification: !data.user?.email_confirmed_at,
      };
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  }

  // Login user
  async login(email, password) {
    try {
      // Validate input
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Login successful",
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  }

  // Logout user
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      throw new Error(error.message || "Logout failed");
    }
  }

  // Resend verification email
  async resendVerificationCode(email) {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Verification email sent successfully",
      };
    } catch (error) {
      throw new Error(error.message || "Failed to resend verification email");
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Password reset email sent successfully",
      };
    } catch (error) {
      throw new Error(error.message || "Failed to send password reset email");
    }
  }

  // Update password
  async updatePassword(newPassword) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      throw new Error(error.message || "Failed to update password");
    }
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      throw new Error(error.message || "Failed to update profile");
    }
  }

  // Get user profile
  async getUserProfile() {
    try {
      const session = await this.getCurrentSession();
      if (!session?.user) {
        throw new Error("No authenticated user");
      }

      return {
        success: true,
        user: session.user,
      };
    } catch (error) {
      throw new Error(error.message || "Failed to get user profile");
    }
  }

  // Sign in with OAuth provider (Google, GitHub, etc.)
  async signInWithProvider(provider) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: `Signing in with ${provider}...`,
        data,
      };
    } catch (error) {
      throw new Error(error.message || `Failed to sign in with ${provider}`);
    }
  }

  // Verify OTP (for email verification or phone verification)
  async verifyOTP(email, token, type = "signup") {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type,
      });

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Verification successful",
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      throw new Error(error.message || "Verification failed");
    }
  }

  // Legacy methods for backward compatibility
  getUserData() {
    return this.getCurrentUser();
  }

  clearUserData() {
    return this.logout();
  }

  // Verify email with code (legacy method - now uses OTP)
  async verifyEmail(email, code) {
    return this.verifyOTP(email, code, "signup");
  }

  // Forgot password (legacy method)
  async forgotPassword(email) {
    return this.resetPassword(email);
  }
}

// Create and export a singleton instance
const authService = new AuthService();
export default authService;
