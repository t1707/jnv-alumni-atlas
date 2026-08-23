# Make the directory feel like an app

## Your options

1. **Installable web app (recommended)** — Users open the site once, tap "Add to Home Screen" / "Install", and it gets a real app icon, launches full-screen without the browser address bar, and opens instantly. No store, no review, no accounts. Works on Android (Chrome) and iOS (Safari share sheet).
2. **Store-published native app** — Wrapping the site with Capacitor and submitting to Play Store / App Store. Requires developer accounts ($25 one-time Google, $99/yr Apple), review cycles, and a local Mac/Android build setup. You said this isn't needed.
3. **Do nothing** — Users keep visiting the URL in a browser tab.

This plan implements option 1.

## What gets built

- **App manifest** (`public/manifest.webmanifest`): app name "JNV Kuchaman Alumni", short name "JNV Alumni", standalone display mode, navy theme color matching the site, portrait orientation.
- **App icons**: generated logo mark (JNV Kuchaman alumni theme) exported at 192px, 512px, maskable 512px, plus a 180px Apple touch icon and favicon, all under `public/`.
- **Head tags** in `src/routes/__root.tsx`: manifest link, `theme-color`, `apple-touch-icon`, `apple-mobile-web-app-capable`, and title tags so the launched app shows the right name.
- **Install hint banner** (small, dismissible, bilingual EN/HI):
  - Android/Chrome: captures the browser install event and shows an "Install app" button.
  - iOS/Safari: shows a one-line "Tap Share, then Add to Home Screen" tip.
  - Remembers dismissal in localStorage; hidden when already running installed.

## Not included

- No offline mode / service worker — you didn't ask for offline use, and it adds cache-staleness risk. Can be added later if you want the directory readable without internet.
- No push notifications.
- No store submission.

## Technical notes

- Manifest-only PWA path (no `vite-plugin-pwa`, no service worker), per Lovable's PWA guidance — safest for previews and avoids stale-cache issues.
- Install banner is a small client component rendered in `__root.tsx`, using the `beforeinstallprompt` event with an iOS user-agent fallback.
- Installability only works on the published HTTPS URL, not inside the editor preview iframe.
