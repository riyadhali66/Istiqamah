# Phase 1 audit and storage contract

Reviewed against upstream `main` before implementation (2026-11-07). The baseline `npm test` passed all 23 checks. This report distinguishes confirmed code paths from measurements; passing those checks did not cover recovery or licensing.

## Original structure

`index.html` held CSS and the application script, including translations, eight-step onboarding, the rule-based plan engine, prayer/Hijri/content services, records, rendering and event listeners. `data/content.js` supplied 15 Quran references, 60 graded hadiths, 61 adhkar entries and 99 Names. `vendor/` contained local libraries/fonts. `sw.js` installed the shell; the manifest and icons enabled installation. Four issue templates and contribution/source notices accompanied the application. `tests/browser.cjs` exercised 23 browser scenarios.

## Data before and after this change

The authoritative personal-data key stays **`istiqamah.v1`**. Its JSON shape is retained:

- `version: 1`, now also `schemaVersion: 1`, `onboarded`, `created`.
- `profile`: name, age/gender, language, country/city, latitude/longitude/timezone, family/work situation, goals/goal descriptions, struggles, faith preferences, daily rhythm, calculation method/madhab and commitment.
- `habits[]`: IDs, labels, categories, targets, units, weights and prayer/fasting flags.
- `days[YYYY-MM-DD]`: numeric habit `values`, habit `snapshot[]`, mood/stress, journal, adhkar counts, fasting/faith pause, child stars and Quran minutes. Existing extra fields are preserved.
- `schedule[]`: time/label overrides and hidden blocks; `debts[]`: balance inputs and dated payment histories; `words[]`; `children[]`.
- `reviews[YYYY-MM]`, `savings[YYYY-MM]`, `zakat`, `settings`, `tasbih` including its optional selected adhkar ID and linked habit.

**New localStorage key:** `istiqamah.migration.v1` keeps the exact original bytes before the first schema upgrade. It is never silently overwritten. If another migration backup already exists, a separate IndexedDB checkpoint must succeed before changing the active record.

**New IndexedDB database:** `istiqamah-safety`, version 1:

- `daily`, key `date`: `{date, data: serialized personal state, savedAt}`. The latest successful state for each of seven most recent active dates. These are active dates, not guaranteed copies for dates when the browser was closed.
- `checkpoints`, auto-increment `id`: `{id, data, reason, savedAt}`. Seven recent undo/migration copies, independently retained from daily records.
- `optional`, key `id`: `{id, blob}` for explicit upstream downloads. Optional downloads are separate from personal-data exports and can be reinstalled without losing counters.

The service-worker `istiqamah-*` cache stores application assets/readings, not personal records. External verse audio can be cached after playback. The passphrase and derived encryption key are never persisted.

## Findings and Phase 1 disposition

| Finding | Resolution / boundary |
| --- | --- |
| No explicit schema migration or pre-upgrade safety copy | Idempotent migration; exact original-byte backup before upgrade; unknown future schemas enter recovery. |
| Load failure returned fresh data that later saves could overwrite | Recovery state blocks saving; original export, file import and prior-copy restore remain available. No onboarding prompt replaces corrupt records. |
| Import replaced records without an undo copy | Validate, ask for confirmation, checkpoint current bytes, then replace. A failed checkpoint prevents replacement. |
| Stale tabs could overwrite changes without reloading | Compare the current storage bytes before every write and reject stale saves; storage events also notify. This is conflict prevention for stale tabs, not a distributed transaction system for simultaneous browser processes. |
| Plain exports exposed entries at rest | Plain export remains available. Optional PBKDF2-SHA256 (310,000 iterations), AES-256-GCM, random 16-byte salt and 12-byte nonce; wrong passphrase/tampering cannot replace records. Local records and local safety copies remain unencrypted. |
| Charts and entire reading bundle loaded at startup | Charts load on Progress; other screens and translations load on demand; Quran/Names/hadith files load after the first interface render. All licensed files remain precached for offline use. |
| Two recordings and Azkar DB lacked explicit licenses | Removed from distributed assets. Explicit, credited downloads fetch pinned upstream commits, verify SHA-256 and persist locally. They are not fetched automatically, including after migration. |
| Quran font lacked a separate redistribution license | Removed. Existing SIL OFL Amiri renders Arabic/Quran text. |
| Missing Malayalam/Hindi religious translations fell back to English with incorrect translator labels | Exact Arabic fallback with an Arabic-source label; no generated religious translations. Arabic fallback direction/language is explicit. |
| Reminder tick assumed `Notification` existed | Guard before accessing the API; calendar export continues to work. |
| Settings location button navigated instead of requesting location | Dedicated Settings geolocation action. Coordinates remain on-device. |
| Import date validation accepted impossible dates; nested unsafe keys were not consistently rejected | Real calendar-date roundtrip validation and recursive unsafe-key rejection. |
| Offline status had hardcoded English | Routed through all five catalogs; new backup/download strings are present in every language. |

## Operational limits

Browser storage can be evicted or cleared. Export private file backups regularly. Private browsing and device policies may disable IndexedDB or Web Crypto. Safety-copy failures are surfaced; a main-record save can still succeed without a daily snapshot. Restore refuses to replace records if its undo copy cannot be saved. Browser reminders still require the app to be open. No deployment, cloud account, sync, push server or API key is introduced in Phase 1.

Lighthouse measurements and the completed check counts are recorded in README. Current Lighthouse no longer provides a PWA score; installation, worker caching and offline interactions are verified directly.

## Combined 2.1.0 integration

This report above describes Phase 1 as originally reviewed. The combined branch preserves its storage schema, encryption, recovery, snapshots, optional-asset boundary, lazy views and catalogs. Phase 2 now runs through the same storage pipeline; exact-byte backup precedes both transformations, including for users already on fd79768. The first original is never overwritten; a different current original requires a verified IndexedDB checkpoint. Backup failures keep the authoritative key untouched and block ordinary saves.

The Azkar distribution finding was superseded by inspection of the upstream README's explicit reuse grant, documented in SOURCE-NOTICES.md and data/AZKAR-REUSE.txt. All 113 entries can therefore remain bundled, while the unrelated MP3/font files remain removed. See README's combined migration contract and validation results.
