import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return { url, anonKey };
}

export function createRlsServerClient(accessToken?: string): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  });
}

export function extractBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader) return null;

  const [type, token] = authorizationHeader.split(" ");
  if (type?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function jsonAuthError(message: string, status: number, code: string) {
  return Response.json({ error: { code, message } }, { status });
}

export async function requireAdminAccess(authorizationHeader: string | null) {
  const accessToken = extractBearerToken(authorizationHeader);

  if (!accessToken) {
    return {
      ok: false as const,
      response: jsonAuthError("로그인이 필요합니다.", 401, "AUTH_REQUIRED"),
    };
  }

  const supabase = createRlsServerClient(accessToken);
  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

  if (authError || !authData.user) {
    return {
      ok: false as const,
      response: jsonAuthError("세션이 유효하지 않습니다.", 401, "INVALID_SESSION"),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      ok: false as const,
      response: jsonAuthError("권한 확인에 실패했습니다.", 500, "ROLE_CHECK_FAILED"),
    };
  }

  if (profile?.role !== "OWNER" && profile?.role !== "ADMIN") {
    return {
      ok: false as const,
      response: jsonAuthError("OWNER/ADMIN 권한이 필요합니다.", 403, "ADMIN_REQUIRED"),
    };
  }

  return {
    ok: true as const,
    supabase,
    userId: authData.user.id,
    role: profile.role,
  };
}
