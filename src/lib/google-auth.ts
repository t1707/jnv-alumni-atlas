// Service-account auth for the Google Sheets API, using WebCrypto so the same
// code runs on Cloudflare Workers and Node without a Google client library.

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/spreadsheets";

export type ServiceAccount = { client_email: string; private_key: string };

export function parseServiceAccount(raw: string): ServiceAccount {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON");
  }
  const sa = parsed as Partial<ServiceAccount>;
  if (!sa?.client_email || !sa?.private_key) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key");
  }
  return {
    client_email: sa.client_email,
    // Some hosts store the key with escaped newlines; normalize both forms.
    private_key: sa.private_key.replace(/\\n/g, "\n"),
  };
}

function base64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const body = pem
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
  return buf.buffer;
}

// Cached across requests on a warm instance; both reset on cold start.
let cachedKey: { email: string; key: CryptoKey } | undefined;
let cachedToken: { token: string; expiresAt: number } | undefined;

async function signingKey(sa: ServiceAccount): Promise<CryptoKey> {
  if (cachedKey?.email === sa.client_email) return cachedKey.key;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  cachedKey = { email: sa.client_email, key };
  return key;
}

export async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  // Refresh a minute early so a token can't expire mid-flight.
  if (cachedToken && cachedToken.expiresAt > now + 60) return cachedToken.token;

  const encoder = new TextEncoder();
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: sa.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${base64url(encoder.encode(JSON.stringify(header)))}.${base64url(
    encoder.encode(JSON.stringify(claims)),
  )}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    await signingKey(sa),
    encoder.encode(signingInput),
  );

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${base64url(signature)}`,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Google token exchange failed", res.status, text);
    throw new Error(`Google authentication failed (${res.status})`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expiresAt: now + json.expires_in };
  return json.access_token;
}
