// Configure these values in the Supabase project settings.
// This file may contain the publishable/anon key, but NEVER a service_role key.
export const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
export const SUPABASE_ANON_KEY = "SUA_CHAVE_PUBLICA_ANON";
export const isSupabaseConfigured =
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("SEU-PROJETO") &&
  SUPABASE_ANON_KEY.length > 20 &&
  !SUPABASE_ANON_KEY.includes("SUA_CHAVE");
