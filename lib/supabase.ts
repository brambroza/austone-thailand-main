import { createClient } from "@supabase/supabase-js";

const supabaseUrl = `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co`;

const supabaseSecretKey = process.env.SUPABASE_SERVICE_KEY;

export const supabaseAdminClient = createClient(
  supabaseUrl,
  supabaseSecretKey!
);
