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
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  ensureUserProfile: () => Promise<boolean>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("User is logged in:", session.user.id);
          setCurrentUser(session.user);
        } else {
          console.log("No active session found");
        }
        
        // Listen for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log("Auth state changed. Event:", _event);
            if (session) {
              console.log("New session user:", session.user.id);
              setCurrentUser(session.user);
            } else {
              console.log("Session ended");
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
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Public method to ensure a user profile exists
  const ensureUserProfile = async (): Promise<boolean> => {
    if (!currentUser) {
      console.log("No current user, can't ensure profile");
      return false;
    }
    
    try {
      console.log("Ensuring profile exists for user:", currentUser.id);
      
      // Check if profile exists
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('id', currentUser.id)
        .single();
      
      if (error) {
        console.log("Error checking for profile or profile not found:", error.message);
        
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          console.log("Creating new profile for user:", currentUser.id);
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              name: currentUser.user_metadata?.name || 'User',
              email: currentUser.email || ''
            });
          
          if (insertError) {
            console.error("Error creating profile:", insertError);
            
            // Check specific error cases
            if (insertError.code === '42501') {
              console.error("Permission denied. RLS policy may be blocking the insert.");
            }
            
            toast.error("Failed to set up your profile");
            return false;
          }
          
          console.log("Profile created successfully");
          return true;
        } else {
          // Other database error
          console.error("Database error checking profile:", error);
          return false;
        }
      }
      
      console.log("Profile already exists:", data);
      return true;
    } catch (error) {
      console.error("Error ensuring user profile:", error);
      return false;
    }
  };

  // Login function
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

  // Signup function
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

  // Logout function
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

  // Password change
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

  // Delete account
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
