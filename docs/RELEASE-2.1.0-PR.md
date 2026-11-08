# Release 2.1.0: unify the modular foundation, Ramadan and offline adhkar

Users of either published single-file build now upgrade to the same modular release without losing their saved records. This branch starts at PR #3 (`4ff5851`) and merges current main (`fd79768`); it supersedes PR #2 and PR #3. Main must be updated through this PR only.

- One Ramadan service/UI, preserved fixed-page and completion-date plans, local moon-sighting controls, preparation reminders and true calendar instants, paused tracking, optional check-ins, last-ten-night goals and explicit make-up tracking.
- Seen Arabic (MIT) remains primary for morning/evening. Azkar's explicit README reuse grant supplies the wider categories. The catalog has 101 selectable entries across 10 categories, with all 113 original Azkar IDs retained in the historical provenance manifest. Search, favorites, full text/reference, previous/next, independent daily counters, shared checklist progress, free counter and explicitly personal goals remain available.
- Schema 3 keeps older fields read-only and writes canonical records separately. Exact original bytes are checkpointed and verified before migration; failed backups block saves. Imports retain original file/encrypted-envelope bytes. Encrypted backups, seven daily copies, stale-tab protection, ordinary plans and historical snapshots remain intact.
- Controlled waiting-worker update banner, one-tap activation/one reload, no first-install banner, no forced refresh while typing, once-only release notes in all five languages, version in footer/About, independent raw-data recovery and previous-day restore.
- No bundled unlicensed MP3s or Uthmani font. Optional credited verified downloads remain explicit. No login, backend, analytics or AI API.

## Migration table

| Source | Detected input | Chain/result |
| --- | --- | --- |
| A `964ba52` | no schemaVersion | legacy → 1 → 2 → 3 |
| B `fd79768` (interim live 2.0.0) | no schemaVersion + phase2 | legacy → 1 → 2 → 3; stable counters/favorites/settings/day records retained |
| C `d142ca9` | schemaVersion 1 | 1 → 2 → 3 |
| D `4ff5851` | schemaVersion 2 | 2 → 3 |

Unknown/unmatched counters are never attached to different text. Existing selections and favorite flags remain visible as earlier progress when no safe alias exists. Repeating the migration does not replay or resurrect old counts after a reset.

## Verified results

- `npm test`: 48 browser checks including Phase 1, PR #3 Ramadan, and **real app + worker upgrades from all four commits**. Original fields/bytes, one-tap/one-navigation activation, canonical records, retired caches and offline reload verified.
- `npm run test:phase2`: 10 regression groups for source IDs, library controls/counters, source-count semantics, migration, ordinary-plan restoration, paused records, prayer/target calculations, immutable historical targets, midnight-crossing calendar export and offline use.
- `npm run test:release`: all five languages × light/dark at 390px, RTL/readable text, once-only translated sheet, no typing interruption, corrupt app module raw export and previous-day restore with verified undo backup.
- `npm run test:sources`: pinned religious fields, source grants/licenses, source grades and deterministic catalog.
- `npm run test:optional`: source-checksum rejection, explicit verified font/audio downloads, offline read/removal and unchanged counters.
- Mobile Lighthouse 12.8.2: **93 performance / 100 accessibility / 100 best practices / 100 SEO**, CLS 0, gzip static preview. Audit report and environment notes are committed. Production-host performance and physical-phone checks remain separate.
- Distributed asset checksums verified; `git diff --check` clean.

The legacy app cannot learn a new banner while its old JavaScript is already running. Its next online reopen/navigation loads the independent bridge; **the update tap itself reloads once**. No site-data clearing or repeated refresh ritual is needed.

## Review screenshots

English and Arabic, light and dark; captures use synthetic personal records.


### Today

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/today-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/today-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/today-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/today-ar-dark.png) |

### Tasbih library

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/tasbih-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/tasbih-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/tasbih-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/tasbih-ar-dark.png) |

### Ramadan home

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/ramadan-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/ramadan-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/ramadan-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/ramadan-ar-dark.png) |

### Waiting update banner

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/update-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/update-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/update-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/update-ar-dark.png) |

### What's new

| English light | English dark | Arabic light | Arabic dark |
| --- | --- | --- | --- |
| ![en light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/whats-new-en-light.png) | ![en dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/whats-new-en-dark.png) | ![ar light](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/whats-new-ar-light.png) | ![ar dark](https://raw.githubusercontent.com/riyadhali66/Istiqamah/release/2.1.0/docs/screenshots/release-2.1.0/whats-new-ar-dark.png) |

## After merge

Deploy the merged files through the existing host; a GitHub push/PR merge is not itself a live-site deployment. Follow [phone and older-ZIP update instructions](docs/UPDATE-2.1.0.md), [migration boundaries](docs/PHASE-2-NOTES.md), [validation](docs/RELEASE-2.1.0-VALIDATION.md) and [source limitations](SOURCE-NOTICES.md). Keep the same origin for local storage or explicitly import a backup when moving origins. Close #2/#3 only after this replacement PR exists, with its URL in each closure comment.
