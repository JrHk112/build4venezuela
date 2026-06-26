import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const requiredServerEnv = {
  AI_GATEWAY_API_KEY: z.string().min(1),
};

const optionalServerEnv = {
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
};

const optionalClientEnv = {
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
};

export const env = createEnv({
  server: {
    ...requiredServerEnv,
    ...optionalServerEnv,
  },
  client: optionalClientEnv,
  emptyStringAsUndefined: true,
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
});
