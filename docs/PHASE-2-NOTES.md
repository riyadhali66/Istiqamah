# Unified release 2.1.0: migration and operating boundaries

This release is based on PR #3 (`4ff5851`) and merges main (`fd79768`). The root `phase2.js`/`phase2.css` implementation is removed. Ramadan has one service, `js/ramadan.js`, one renderer `js/ui/ramadan.js`, and one model. Tasbih uses `js/adhkar-library.js`; styles and all five language catalogs follow the modular structure.

## Migration table

| Source | Detection from saved data | Destination |
| --- | --- | --- |
| A: `964ba52` | `version:1`, no schemaVersion, no phase2 | legacy → 1 → 2 → 3 |
| B: `fd79768`, interim 2.0.0 | no schemaVersion plus root phase2 | legacy → 1 → 2 → 3; explicitly adapt phase2 records |
| C: `d142ca9` | schemaVersion 1 | 1 → 2 → 3 |
| D: `4ff5851` | schemaVersion 2 | 2 → 3 |
| 2.1.0 | schemaVersion 3 | validated, idempotent; no old-record replay |

`istiqamah.v1` remains the authoritative browser key. `version:1` remains for backup compatibility; the explicit current schemaVersion is 3. `istiqamah.migration.v3` receives the **exact original string** before parsing or transformation. The write is read back and verified. Every earlier localStorage backup key is retained. If v3 already holds another original, an IndexedDB checkpoint must complete and be verified before migration. Any failure enters recovery and blocks saving; stale-tab byte comparisons also prevent replacement. The pure chain never modifies its input. Corrupt/future/unsafe input is not overwritten.

Imports checkpoint both the current records and the original incoming file bytes before transformation; encrypted imports retain the original envelope and the decrypted source bytes. AES-GCM/PBKDF2 authentication remains unchanged. Daily IndexedDB copies retain the last seven active days, independently of undo checkpoints. Records and local safety copies are unencrypted; encrypted export is optional.

## Archival fields and canonical writes

Older `phase2`, root `ramadan`, `days[date].ramadan`, `days[date].adhkar`, and `tasbih.selected` remain archival and unchanged. Active Ramadan configuration uses `ramadanConfig`; daily records use `ramadanV3`. Active counters use `adhkarCounts`; unmatched counts use `earlierAdhkar`; selection/favorites/personal targets use `adhkarPrefs`. Ordinary habits, snapshots, journals, debts, words, children, schedules, settings and unknown fields remain intact.

PR #3's Ramadan records copy directly into the canonical daily field. fd79768's records carry across season/day, fasting status including pause, private optional reason, actual Quran pages, Taraweeh/charity/adhkar/family, original target snapshots and optional goals. Equivalent settings carry across local start, month length, preparation offsets and completion planning. Non-equivalent fields remain available in the untouched archive.

Counters migrate by explicit reviewed legacy aliases or matching normalized Arabic letters, never by current array position. Display text is never normalized. Mirrors/colliding aliases use the maximum existing count rather than double-counting; original counts remain archived. Unmatched selections remain read-only and show their count; unmatched positive counts and old favorite flags remain visible with original source text where known. Unknown IDs are labeled as IDs, without invented text. New writes and resets affect only the canonical selected entry and date. They never replay an old count after reset.

## Ramadan behavior

Automatic mode follows existing Umm al-Qura data. ±1 adjusts the effective Hijri date. A manually chosen local start overrides that start, with the preserved 29/30-day length. Turning Ramadan off restores the ordinary plan and retains all Ramadan records. Preview is session-only and never creates real records or changes balances.

Fajr/Maghrib use locally calculated prayer instants and explicit countdown labels. Preparation offsets are personal reminders, not fasting deadlines or an obligatory imsak. They appear as schedule blocks, retain their true UTC instants in calendar export even across midnight, and notify only with reminders enabled while the app is open. System reminders use calendar export.

Not fasting and paused days protect fasting streaks and exclude fasting weights. Reasons are optional and private. Make-up tracking includes **only days users explicitly choose**, and does not determine anyone's religious obligations. Existing PR #3 `qadaPaid` totals remain intact. Completion plans use inclusive days and actual recorded pages; new target decisions never rewrite a prior plan snapshot. Last-ten-night goals are optional.

## Update and recovery

The independent `js/boot.js` update bridge loads before the app module graph. The worker fully precaches the release but waits when an earlier worker controls the page. A visible localized banner activates it only after a tap, then reloads once. First installation activates normally without an update banner or reload. Settings → Check for updates checks without forcing a reload. Focused form changes are committed before activation; a failed save prevents updating. Installation never renders over a journal field. The release sheet is localized, dismissible, once-only, and deferred while typing or another dialog is open.

A page already running a legacy release cannot display UI that its old JavaScript does not contain. Its **next online navigation/reopen** loads the bridge; the banner then updates in one tap. This is the tested path from both published legacy commits. No storage clearing, unregistering workers, or repeated refresh ritual is needed.

If app imports fail, plain recovery remains available independently: Download my data backup exports raw localStorage values without parsing personal records; Restore yesterday’s copy chooses the most recent earlier active-day copy and verifies an original-bytes undo backup before replacement. Restoring data cannot repair damaged server assets: a broken installation still needs the complete fixed release files.

## Content boundaries

See `SOURCE-NOTICES.md`. The primary Seen Arabic morning/evening text and verified English remain exact. Supplementary Azkar rows use the explicit README reuse grant. The selectable catalog has 101 entries across ten categories; all 113 old IDs remain in a frozen provenance manifest. Rebuilding is deterministic with `python3 tools/build-adhkar.py`; source tests verify both pinned upstream data sets and the grant. Missing counts remain missing; personal goals are labeled. Missing translations display Arabic with a source label. No unlicensed MP3 or Uthmani font is bundled.
