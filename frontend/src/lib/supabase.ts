import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validación comentada temporalmente para usar mock data
// TODO: Descomentar cuando se integre con la BD real
// if (!supabaseUrl || !supabaseAnonKey) {
//   throw new Error('Missing Supabase environment variables');
// }

// Cliente de Supabase (null si no hay credenciales configuradas)
export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
