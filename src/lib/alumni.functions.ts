import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAccessToken, parseServiceAccount } from "./google-auth";

const SHEETS_API = "https://sheets.googleapis.com/v4";

function env() {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  const sheetId = process.env.ALUMNI_SHEET_ID;
  const rawTab = process.env.ALUMNI_SHEET_TAB;
  // Guard against gid-style values (e.g. "0") accidentally stored as tab name
  const tab = !rawTab || /^\d+$/.test(rawTab) ? "Sheet1" : rawTab;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!serviceAccountJson) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not configured");
  if (!sheetId) throw new Error("ALUMNI_SHEET_ID is not configured");
  if (!adminPassword) throw new Error("ADMIN_PASSWORD is not configured");
  return {
    serviceAccount: parseServiceAccount(serviceAccountJson),
    sheetId,
    tab,
    adminPassword,
  };
}

async function sheetsFetch(
  serviceAccount: ReturnType<typeof env>["serviceAccount"],
  path: string,
  init?: RequestInit,
) {
  const token = await getAccessToken(serviceAccount);
  return fetch(`${SHEETS_API}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
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
    const { serviceAccount, sheetId, tab } = env();
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
    const range = encodeURIComponent(`${tab}!A:K`);
    const res = await sheetsFetch(
      serviceAccount,
      `/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [row] }),
      },
    );
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
    const { serviceAccount, sheetId, tab, adminPassword } = env();
    if (data.password !== adminPassword) {
      throw new Error("Invalid password");
    }
    const range = encodeURIComponent(`${tab}!A1:K10000`);
    const res = await sheetsFetch(serviceAccount, `/spreadsheets/${sheetId}/values/${range}`);
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

// Public listing: strips email. Mobile is intentionally exposed so alumni can
// reach each other — do not add email back without revisiting that decision.
export const listAlumniPublic = createServerFn({ method: "GET" }).handler(async () => {
  const { serviceAccount, sheetId, tab } = env();
  const range = encodeURIComponent(`${tab}!A1:K10000`);
  const res = await sheetsFetch(serviceAccount, `/spreadsheets/${sheetId}/values/${range}`);
  if (!res.ok) {
    const text = await res.text();
    console.error("Sheets public read failed", res.status, text);
    throw new Error(`Failed to load (${res.status})`);
  }
  const json = (await res.json()) as { values?: string[][] };
  const values = json.values || [];
  const [, ...rows] = values;
  // Columns: 0 Timestamp, 1 Name, 2 Batch, 3 Mobile, 4 Address, 5 Occupation,
  // 6 Department, 7 Post, 8 Posting Place, 9 Remarks, 10 Email
  const sanitized = rows
    .filter((r) => (r[1] || "").trim().length > 0)
    .map((r) => ({
      addedAt: r[0] || "",
      name: r[1] || "",
      batch: r[2] || "",
      mobile: r[3] || "",
      address: r[4] || "",
      occupation: r[5] || "",
      department: r[6] || "",
      post: r[7] || "",
      postingPlace: r[8] || "",
      remarks: r[9] || "",
    }));
  return { alumni: sanitized };

});

