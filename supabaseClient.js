import { createClient } from '@supabase/supabase-js';

// Ajusta esto dependiendo si usas Vite o CRA
const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);