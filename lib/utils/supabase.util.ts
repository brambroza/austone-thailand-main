import { supabaseAnonClient } from "@/lib/anon-supabase";

export async function getSupabaseCurrentUser() {
  const { data, error } = await supabaseAnonClient.auth.getUser();
  return { data, error };
}
