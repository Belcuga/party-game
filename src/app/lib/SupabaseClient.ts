import { createClient } from '@supabase/supabase-js';
import { localSupabase } from './localSupabaseMock';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Falls back to an in-memory local store when Supabase isn't configured,
// so the app is runnable without a real Supabase project during local dev.
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (localSupabase as unknown as ReturnType<typeof createClient>);