import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

function env() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.ALUMNI_SHEET_ID;
  const rawTab = process.env.ALUMNI_SHEET_TAB;
  // Guard against gid-style values (e.g. "0") accidentally stored as tab name
  const tab = !rawTab || /^\d+$/.test(rawTab) ? "Sheet1" : rawTab;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY is not configured");
  if (!sheetsKey) throw new Error("GOOGLE_SHEETS_API_KEY is not configured");
  if (!sheetId) throw new Error("ALUMNI_SHEET_ID is not configured");
  if (!adminPassword) throw new Error("ADMIN_PASSWORD is not configured");
  return { lovableKey, sheetsKey, sheetId, tab, adminPassword };
}

const submitSchema = z.object({
  name: z.string().trim().min(1).max(120),
  batch: z.string().trim().regex(/^(19|20)\d{2}$/, "Batch must be a 4-digit year"),
  mobile: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Invalid mobile number"),
  address: z.string().trim().min(1).max(500),
  occupation: z.string().trim().max(200).optional().default(""),
  department: z.string().trim().max(200).optional().default(""),
  post: z.string().trim().max(200).optional().default(""),
  postingPlace: z.string().trim().max(200).optional().default(""),
  remarks: z.string().trim().max(500).optional().default(""),
  email: z.string().trim().max(200).optional().default(""),
});

// In-memory rate limit (best-effort; resets on cold start)
const submissions = new Map<string, number[]>();
function rateLimit(key: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const arr = (submissions.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) return false;
  arr.push(now);
  submissions.set(key, arr);
  return true;
}

export const submitAlumni = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => submitSchema.parse(input))
  .handler(async ({ data }) => {
    const { lovableKey, sheetsKey, sheetId, tab } = env();
    if (!rateLimit("global")) {
      throw new Error("Too many submissions, please try again in a minute.");
    }
    const timestamp = new Date().toISOString();
    const row = [
      timestamp,
      data.name,
      data.batch,
      data.mobile,
      data.address,
      data.occupation,
      data.department,
      data.post,
      data.postingPlace,
      data.remarks,
      data.email,
    ];
    const url = `${GATEWAY}/spreadsheets/${sheetId}/values/${tab}!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": sheetsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Sheets append failed", res.status, text);
      throw new Error(`Failed to save (${res.status})`);
    }
    return { ok: true };
  });

export const listAlumni = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { lovableKey, sheetsKey, sheetId, tab, adminPassword } = env();
    if (data.password !== adminPassword) {
      throw new Error("Invalid password");
    }
    const url = `${GATEWAY}/spreadsheets/${sheetId}/values/${tab}!A1:K10000`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": sheetsKey,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Sheets read failed", res.status, text);
      throw new Error(`Failed to load (${res.status})`);
    }
    const json = (await res.json()) as { values?: string[][] };
    const values = json.values || [];
    const [header = [], ...rows] = values;
    return { header, rows };
  });
