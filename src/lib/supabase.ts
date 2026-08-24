/**
 * Cliente Supabase singleton com fallback gracioso.
 *
 * Se as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY
 * não estiverem definidas, o cliente será `null` e o frontend continuará
 * usando os dados mockados via services/.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const supabaseAnonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

let supabaseInstance: SupabaseClient<Database> | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
} else if (typeof window !== "undefined") {
  console.warn(
    "[supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configuradas. " +
      "O app usará dados mockados como fallback.",
  );
}

/** Cliente Supabase tipado, ou `null` se não estiver configurado. */
export const supabase: SupabaseClient<Database> | null = supabaseInstance;

/** Verifica se o Supabase está configurado e disponível. */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
