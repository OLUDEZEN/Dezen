import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

// Debugging
console.log("Loaded SUPABASE URL:", env.PUBLIC_SUPABASE_URL);
console.log("Loaded SUPABASE Key exists:", !!env.PUBLIC_SUPABASE_ANON_KEY);

if (!env.PUBLIC_SUPABASE_URL || !env.PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("❌ Supabase URL or anon key is missing! Check your .env.local");
}

export const supabase = createClient(
  env.PUBLIC_SUPABASE_URL,
  env.PUBLIC_SUPABASE_ANON_KEY
);
