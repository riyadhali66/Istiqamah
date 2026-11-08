# 2.1.0 — combined Phase 1 and Phase 2

- Integrates PR #2's modular app, schema-1 safety/recovery, encrypted backups and seven daily IndexedDB copies on top of fd79768.
- Moves Ramadan Mode and the 113-entry stable-ID library into js/ramadan.js, js/adhkar-library.js, js/ui/, css/app.css and five JSON catalogs.
- Unifies migration with verified original-byte backups before transformation; failed backups cannot authorize an overwrite. Retains Phase 2 positional mapping, counters, favorites and historical Ramadan records.
- Keeps unlicensed recordings/font out of the distribution, with credited opt-in, checksum-verified downloads. Bundles only the separately permitted Azkar dataset.
- Versions the complete module/catalog graph and install cache; tests actual upgrades from both 964ba52 and fd79768.
- This replacement is submitted for review; main and the live site are unchanged until merge/deployment.

# Changelog

## 1.1.0 — in progress

### Phase 1 — implemented (1.1.0-phase1)

- Extracted buildless ES modules, per-screen UI modules, five JSON interface catalogs and CSS.
- Added explicit schema migration with original-byte recovery, stale-tab protection, seven daily IndexedDB safety copies and confirmed restore with undo checkpoints.
- Added optional passphrase-protected AES-GCM backup export/import while retaining plain JSON and legacy imports.
- Removed bundled unclear-license recordings, Azkar DB text and Quran font; introduced credited, checksum-verified optional downloads, preserving saved counters; use OFL Amiri for Arabic.
- Lazy-loaded screens, charts, reading collections and language catalogs; refreshed the complete offline cache.
- Corrected Arabic religious fallback labels/direction, Notification availability checks, Settings geolocation action, impossible-date validation and nested unsafe-key rejection.
- Expanded browser coverage and added a separate real-source download/offline integration check.

Phases 2–4 are not included in this prerelease. Their completion will form the full 1.1.0 release.

## 2.0.0 — planned

Phase 5 is not implemented or enabled in this prerelease. No account, cloud sync, push service or Sunnah.com server is present. This entry reserves the requested major-version boundary rather than claiming shipped functionality.

## 1.0.0

Original local-first app and 23 browser checks.
