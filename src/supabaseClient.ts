// Supabase client configured via environment variables
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseKey) missingVars.push('VITE_SUPABASE_KEY');
  const message = `Missing environment variables: ${missingVars.join(', ')}`;
  console.warn(message);
  throw new Error(message);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
