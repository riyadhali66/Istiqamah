# Changelog

## 2.1.1 — Android app and static hosting

- Add Capacitor Android app `com.riyadhali66.istiqamah`, offline bundled app-only assets, emerald/adaptive branding and Android back navigation. Web remains buildless and keeps its service worker; native never registers one.
- Add optional local seven-day prayer/habit/Ramadan reminders using the same calculation and time zone, per-prayer switches, offsets, permission explanations, exact/inexact fallback, app/settings refresh and reboot restoration. System-default sound only.
- Add native share-sheet plain/encrypted exports, Android file-picker imports and first-run website-backup guidance. Keep schema 3, exact-byte migration safety, private local records and seven daily copies; disable Android automatic backup.
- Add PR debug APK artifacts and tag-only signed APK/AAB release workflow with secret-based signing. Add privacy/store drafts and phone/signing instructions.
- Add static-only Cloudflare configuration with a deployment allowlist, root/subfolder/offline tests, native model/plugin mocks and mobile bilingual screenshots.

## 2.1.0 — Unified safe release

- Combine PR #3 modular Phase 1/Ramadan work with the wider permitted adhkar categories from main. Version 2.0.0 was the interim live single-file Phase 2 build (`fd79768`); it was not the modular release.
- Use schema 3 for all A/B/C/D source versions, exact original-byte checkpoints before migration, immutable historical fields, explicit stable-ID mappings, unmatched-progress visibility and fail-closed saves.
- Preserve encrypted backups, seven daily copies, ordinary habits, and local/offline privacy. Keep unlicensed recordings and Uthmani outside the bundle, with explicit optional credited downloads.
- Add controlled one-tap worker updates, once-only release notes in five languages, footer/About version and independent startup recovery.
- Retain one Ramadan implementation with equivalent legacy settings, optional completion dates, paused tracking, preparation reminders/calendar instants, and explicit make-up tracking.
- Test actual app/worker upgrades from all four commits, mobile RTL and both themes, licensed sources, optional assets and corrupted-module recovery.

## 1.2.0 — Phase 2

- Restore morning/evening adhkar as a bundled MIT-licensed core feature with licensed English, preserved old keys, reviewed source aliases and earlier-counter visibility.
- Add automatic/manual Ramadan, moon adjustment, skippable setup, countdowns, daily checklist, adaptive khatm plan, last-ten-night dua/source grading and i’tikaf.
- Add Fitr calculation, private year-round qada/make-ups, paused streaks, heatmap/charts, one-page print, Eid summary/greeting PNG and Shawwal links.
- Add isolated Settings practice mode, schema 2 migration/original-byte backup and versioned offline module upgrade protection.
- Add date, migration and permanent previous-release service-worker upgrade tests, licensed-source verification and English/Arabic light/dark screenshots.

## 1.1.0-phase1 — Phase 1 foundation

### Phase 1 — implemented (1.1.0-phase1)

- Extracted buildless ES modules, per-screen UI modules, five JSON interface catalogs and CSS.
- Added explicit schema migration with original-byte recovery, stale-tab protection, seven daily IndexedDB safety copies and confirmed restore with undo checkpoints.
- Added optional passphrase-protected AES-GCM backup export/import while retaining plain JSON and legacy imports.
- Removed bundled unclear-license recordings, Azkar DB text and Quran font; introduced credited, checksum-verified optional downloads, preserving saved counters; use OFL Amiri for Arabic.
- Lazy-loaded screens, charts, reading collections and language catalogs; refreshed the complete offline cache.
- Corrected Arabic religious fallback labels/direction, Notification availability checks, Settings geolocation action, impossible-date validation and nested unsafe-key rejection.
- Expanded browser coverage and added a separate real-source download/offline integration check.

This foundation preceded the 1.2.0 Ramadan release. Deeper faith, motivation/growth and cloud features remain subsequent phases.

## 2.0.0 — Interim live Phase 2 (`fd79768`)

The single-file main received Ramadan Mode and the 113-entry Azkar library before the modular PRs were combined. Release 2.1.0 unifies those lines. No login, cloud sync, backend, analytics, AI API or Sunnah.com server is enabled.

## 1.0.0

Original local-first app and 23 browser checks.
