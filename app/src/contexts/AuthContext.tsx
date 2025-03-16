
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";
import { 
  ensureUserProfile, 
  login as loginUser, 
  signup as signupUser, 
  logout as logoutUser,
  changePassword as changeUserPassword,
  deleteAccount as deleteUserAccount
} from "@/services/authService";

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

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      await loginUser(email, password);
      toast.success("Login successful");
      // Navigation handled in Layout component for consistency
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      await signupUser(email, password, name);
      toast.success("Account created successfully. You can now log in.");
      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Password change
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      await changeUserPassword(currentPassword, newPassword, currentUser);
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
      await deleteUserAccount();
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
