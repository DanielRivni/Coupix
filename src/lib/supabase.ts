
import { createClient } from '@supabase/supabase-js';

// Use your Coupix project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnxuqojzbfvlppsadwoa.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhueHVxb2p6YmZ2bHBwc2Fkd29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1MzY0NTQsImV4cCI6MjA1NzExMjQ1NH0.x8OqRcZKoOqS0V17j74Cu95PeEnnh9q0ubQCMTypnpI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
