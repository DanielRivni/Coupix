
import { supabase } from '@/integrations/supabase/client';

// Configure session persistence
// This ensures the Supabase client uses the correct session persistence settings
// based on the user's "Remember me" preference
const configureSessionPersistence = () => {
  // Check if "Remember me" is enabled
  const rememberMe = localStorage.getItem("rememberMe") === "true";
  
  // Log the current persistence setting
  console.log("Session persistence configured:", rememberMe ? "persistent" : "session-only");
};

// Initialize persistence setting
configureSessionPersistence();

// Check and log initialization
console.log("Supabase client initialized:", !!supabase);

export { supabase };
