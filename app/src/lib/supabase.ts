
import { supabase } from '@/integrations/supabase/client';

// Check and log initialization
console.log("Supabase client initialized:", !!supabase);

export { supabase };
