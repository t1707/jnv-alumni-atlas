## Goal

Modern public web page where alumni submit their info; each submission appends a row to a Google Sheet. An admin-only page reads the same sheet to display the directory.

## Pages (TanStack Start routes)

- `/` — Landing + submission form (public)
  - Hero: "JNV Alumni Directory" with short intro
  - Form fields: Name, Batch (year), Mobile, Address, Occupation, Department/Firm, Post, Posting Place, Remarks
  - Client-side validation with zod + react-hook-form
  - Success / error toast (sonner)
- `/admin` — Directory table (admin-only, password-gated)
  - Simple password prompt (compared against a server-side secret)
  - Server fn fetches rows from the sheet, renders searchable/filterable table (search by name, batch filter)
  - CSV download button

## Backend (server functions, no database)

Two server functions in `src/lib/alumni.functions.ts`:

1. `submitAlumni` (POST, public)
   - Zod validation (lengths, mobile regex, batch year range)
   - Appends a row to the sheet via Google Sheets connector gateway:
     `POST connector-gateway.lovable.dev/google_sheets/v4/spreadsheets/{id}/values/{sheet}!A:J:append?valueInputOption=USER_ENTERED`
   - Adds timestamp as first column
   - Basic in-memory rate limit per IP

2. `listAlumni` (POST, admin-only)
   - Verifies submitted password against `ADMIN_PASSWORD`
   - Reads `GET /spreadsheets/{id}/values/{sheet}!A:K`
   - Returns parsed rows

## Setup steps

1. Connect Google Sheets connector (`standard_connectors--connect` with `google_sheets`).
2. Ask user for the target Spreadsheet ID + sheet/tab name (or auto-create headers if empty).
3. Add secrets: `ADMIN_PASSWORD`, `ALUMNI_SHEET_ID`, `ALUMNI_SHEET_TAB` (e.g. "Sheet1").
4. On first run, ensure header row exists (Timestamp, Name, Batch, Mobile, Address, Occupation, Department/Firm, Post, Posting Place, Remarks).

## Design

- Modern, clean, professional. Deep navy primary (matches uploaded screenshot header), white background, subtle card shadows, rounded-xl.
- Typography: Inter / similar sans.
- Tokens defined in `src/styles.css` (oklch), shadcn components for form + table.
- Responsive single-column form on mobile; two-column on desktop.

## Out of scope

- No user auth (only an admin password)
- No moderation (auto-publish per your choice)
- No edit/delete from UI (manage directly in the Sheet)

## Open items I'll ask before building

- Spreadsheet ID & sheet tab name
- Admin password (added via secrets tool)
