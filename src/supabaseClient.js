import { createClient } from '@supabase/supabase-js';

// En Vite, las variables de entorno se leen con import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Faltan las variables de entorno de Supabase en el frontend.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);