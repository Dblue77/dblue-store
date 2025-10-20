import { createClient } from "@supabase/supabase-js";

// Ambil environment variable dari .env (Create React App format)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Cek apakah variabel sudah diisi
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase environment variables are missing!");
} else {
  console.log("✅ Supabase environment loaded successfully!");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
