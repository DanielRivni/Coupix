
import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock user database for demo purposes
const USERS_STORAGE_KEY = "coupix_users";
const CURRENT_USER_KEY = "coupix_current_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for logged in user on initial load
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Helper to get users from localStorage
  const getUsers = (): Record<string, { id: string; email: string; password: string; name: string }> => {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : {};
  };

  // Helper to save users to localStorage
  const saveUsers = (users: Record<string, { id: string; email: string; password: string; name: string }>) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const users = getUsers();
      const userRecord = Object.values(users).find(user => user.email === email);

      if (!userRecord) {
        throw new Error("User not found");
      }

      if (userRecord.password !== password) {
        throw new Error("Invalid password");
      }

      const user: User = {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
      };

      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      toast.success("Login successful");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const users = getUsers();

      // Check if email already exists
      if (Object.values(users).some(user => user.email === email)) {
        throw new Error("Email already in use");
      }

      const id = `user_${Date.now()}`;
      users[id] = { id, email, password, name };
      saveUsers(users);

      const user: User = { id, email, name };
      setCurrentUser(user);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      toast.success("Account created successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const users = getUsers();
      const userRecord = Object.values(users).find(user => user.id === currentUser.id);

      if (!userRecord) {
        throw new Error("User not found");
      }

      if (userRecord.password !== currentPassword) {
        throw new Error("Current password is incorrect");
      }

      userRecord.password = newPassword;
      saveUsers(users);
      toast.success("Password updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Password change failed");
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const users = getUsers();
      if (users[currentUser.id]) {
        delete users[currentUser.id];
        saveUsers(users);
      }

      // Also delete user's coupons
      const allCoupons = JSON.parse(localStorage.getItem("coupix_coupons") || "{}");
      const updatedCoupons = Object.entries(allCoupons).reduce((acc, [id, coupon]: [string, any]) => {
        if (coupon.userId !== currentUser.id) {
          acc[id] = coupon;
        }
        return acc;
      }, {} as Record<string, any>);
      localStorage.setItem("coupix_coupons", JSON.stringify(updatedCoupons));

      setCurrentUser(null);
      localStorage.removeItem(CURRENT_USER_KEY);
      navigate("/login");
      toast.success("Account deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Account deletion failed");
      throw error;
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
