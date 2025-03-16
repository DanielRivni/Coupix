import { supabase } from "@/lib/supabase";
import { User, AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";

// Public method to ensure a user profile exists
export const ensureUserProfile = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  const currentUser = session?.user;
  
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
export const login = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw error;
};

// Signup function
export const signup = async (email: string, password: string, name: string) => {
  // Create the user in Supabase Auth
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: { name }
    }
  });
  
  if (error) throw error;
};

// Logout function
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Password change
export const changePassword = async (currentPassword: string, newPassword: string, currentUser: User | null) => {
  if (!currentUser) {
    throw new Error("No user logged in");
  }
  
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
};

// Delete account
export const deleteAccount = async () => {
  // We need to handle this differently since we can't use admin features
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
};
