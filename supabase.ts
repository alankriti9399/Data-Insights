import { createClient } from '@supabase/supabase-js';

// Only create the client if the environment variables are available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Please click the "Connect to Supabase" button in the top right corner to set up your database connection.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);