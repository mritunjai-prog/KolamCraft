import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

const supabaseUrl = projectId ? `https://${projectId}.supabase.co` : "";
const supabaseKey = publicAnonKey || "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let client: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient => {
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey);
  }
  return client;
};
