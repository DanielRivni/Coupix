import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Session, User, AuthError } from "@supabase/supabase-js";

export interface Profile {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  currentUser: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  ensureUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await updateUserData(session.user);
      }
      
      // Listen for auth changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (session) {
            await updateUserData(session.user);
          } else {
            setCurrentUser(null);
          }
          setLoading(false);
        }
      );

      setLoading(false);
      
      // Cleanup function
      return () => {
        subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  // Helper function to get profile data
  const updateUserData = async (user: User) => {
    if (!user) return;
    
    try {
      // Set user data from auth data (simplified approach)
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name || 'User',
        email: user.email || '',
      });
      
      // We don't try to access the profiles table here
      // to avoid RLS issues
    } catch (error) {
      console.error("Error updating user data:", error);
      // Fallback to basic user data
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.name || 'User',
        email: user.email || '',
      });
    }
  };

  // Public method to ensure a user profile exists
  const ensureUserProfile = async () => {
    // This function is simplified to avoid RLS issues
    // It's now a no-op but we keep it for backward compatibility
    return Promise.resolve();
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      toast.success("Login successful");
      // Navigate is handled in Layout component for consistency
    } catch (error: any) {
      const authError = error as AuthError;
      console.error("Login error:", authError);
      toast.error(authError.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      
      // Create the user in Supabase Auth
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { name }
        }
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully. You can now log in.");
      navigate("/login");
    } catch (error: any) {
      const authError = error as AuthError;
      console.error("Signup error:", authError);
      toast.error(authError.message || "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
      throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      
      // First, verify current password by trying to sign in with it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: currentUser?.email || '',
        password: currentPassword
      });
      
      if (verifyError) {
        throw new Error("Current password is incorrect");
      }
      
      // Change password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Password change failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) {
        throw new Error("No user logged in");
      }
      
      // We need to handle this differently since we can't use admin features
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setCurrentUser(null);
      toast.success("You've been logged out. Contact support to delete your account.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Account operation failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    changePassword,
    deleteAccount,
    ensureUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
