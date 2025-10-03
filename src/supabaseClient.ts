// Supabase client configured via environment variables
import { createClient } from '@supabase/supabase-js';

type EnvRecord = Record<string, string | undefined>;

function normalize(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const lowered = trimmed.toLowerCase();
  if (lowered === 'undefined' || lowered === 'null') return undefined;
  return trimmed;
}

function resolveRuntimeEnv(): EnvRecord {
  if (typeof window === 'undefined') {
    return {};
  }

  const candidates = [
    (window as EnvRecord & { __APP_CONFIG__?: EnvRecord }).__APP_CONFIG__,
    (window as EnvRecord & { __ENV__?: EnvRecord }).__ENV__,
    (window as EnvRecord & { __appEnv__?: EnvRecord }).__appEnv__,
    (window as EnvRecord & { ENV?: EnvRecord }).ENV,
  ];

  return Object.assign({}, ...candidates.filter(Boolean));
}

const env = import.meta.env as unknown as EnvRecord;
const runtimeEnv = resolveRuntimeEnv();

const urlCandidates = [
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_PROJECT_URL,
  env.PUBLIC_SUPABASE_URL,
  env.VITE_PUBLIC_SUPABASE_URL,
  runtimeEnv.VITE_SUPABASE_URL,
  runtimeEnv.SUPABASE_URL,
  runtimeEnv.PUBLIC_SUPABASE_URL,
];

const keyCandidates = [
  env.VITE_SUPABASE_KEY,
  env.VITE_SUPABASE_ANON_KEY,
  env.VITE_SUPABASE_PUBLIC_ANON_KEY,
  env.PUBLIC_SUPABASE_ANON_KEY,
  env.PUBLIC_SUPABASE_KEY,
  runtimeEnv.VITE_SUPABASE_KEY,
  runtimeEnv.SUPABASE_KEY,
  runtimeEnv.SUPABASE_ANON_KEY,
  runtimeEnv.PUBLIC_SUPABASE_KEY,
];

const supabaseUrl = urlCandidates.map(normalize).find(Boolean);
const supabaseKey = keyCandidates.map(normalize).find(Boolean);

if (!supabaseUrl || !supabaseKey) {
  const missingVars: string[] = [];
  if (!supabaseUrl) {
    missingVars.push('VITE_SUPABASE_URL');
  }
  if (!supabaseKey) {
    missingVars.push('VITE_SUPABASE_KEY');
  }
  const message = `Missing environment variables: ${missingVars.join(', ')}`;
  console.warn(message);
  throw new Error(message);
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      apikey: supabaseKey,
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
