"use client";

import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

export function createBrowserSupabase() {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}
