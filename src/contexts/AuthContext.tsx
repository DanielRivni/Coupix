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
      // Get profile data from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching profile:", error);
        // Set user data from auth data
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.name || 'User',
          email: user.email || '',
        });
        return;
      }
      
      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.name,
          email: data.email,
        });
      } else {
        // No profile found, set user from auth
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.name || 'User',
          email: user.email || '',
        });
      }
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
    if (!currentUser) return;

    try {
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error checking for profile:", error);
        return;
      }
      
      if (!data) {
        console.log("Profile not found, creating one for user:", currentUser.id);
        
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase.auth.admin.updateUserById(
          currentUser.id,
          { user_metadata: { name: currentUser.name } }
        );
        
        if (insertError) {
          console.error("Error updating user metadata:", insertError);
        }
      }
    } catch (error) {
      console.error("Error in ensureUserProfile:", error);
      toast.error("Failed to set up user profile");
    }
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
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error("Logout failed");
      console.error("Logout error:", error);
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
      
      // Delete the user's account
      // This will cascade to profiles due to our DB setup
      const { error } = await supabase.auth.admin.deleteUser(
        currentUser.id
      );
      
      if (error) throw error;
      
      await supabase.auth.signOut();
      setCurrentUser(null);
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Account deletion failed");
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
