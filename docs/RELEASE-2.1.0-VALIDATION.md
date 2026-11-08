# Release 2.1.0 validation

Validation runs against the unified modular release in Chromium on Linux. These results describe a local preview, not a deployed public site or physical-phone certification.

| Command | Verified coverage |
| --- | --- |
| `npm test` | 48 browser checks: original app flows, Phase 1 migrations/fail-closed recovery/stale tabs/encrypted backup/seven daily copies, PR #3 Ramadan/calendar/preview/print/Eid/RTL, actual A/B/C/D worker upgrades and offline reloads |
| `npm run test:phase2` | 10 groups: all 113 historical source IDs, 10-category catalog, search/favorites/navigation, personal targets, independent counters/reset, reviewed aliases/unmatched counts, date boundaries/paused records/ordinary-plan restoration, prayer/Quran calculations/fixed daily targets/historical target decisions, calendar instants crossing midnight, immutable plan snapshots, validation and offline |
| `npm run test:release` | Five languages × two themes at 390px; complete religious text, RTL, no runtime errors, once-only translated sheet, no interruption while typing, corrupt app bundle raw export and previous-day restore with original-bytes undo backup |
| `npm run test:sources` | Exact pinned Seen Arabic/English/count/reference/description/license; complete Tirmidhi text/grades; Azkar's exact 113 archival rows and explicit README grant; deterministic primary-source catalog/mapping |
| `npm run test:optional` | No startup optional requests; modified-source checksum rejection; explicit verified Uthmani and both adhan downloads; offline read/remove with saved counters unchanged |

## Actual upgrades, not fixtures of new data

The upgrade runner archives and serves **each real Git commit**, completes its own onboarding, creates records through that app's engine/state/day APIs, installs its real worker and reloads under its controller. It then swaps the served directory to 2.1.0 on the same origin. Before activation it asserts original bytes unchanged; after one banner tap it asserts **one** navigation, schema 3, every original root/day field preserved, exact original-byte backup, stable counter/favorite/completion/pause carry-over, valid new state, old caches retired and successful offline reload.

| Source | Input | Result |
| --- | --- | --- |
| `964ba52` | Legacy app, no explicit schema | schema 3; one tap; original bytes; offline |
| `fd79768` | Live legacy app + phase2 + stable Azkar IDs | schema 3; one tap; original bytes; counters/favorites/Ramadan retained; offline |
| `d142ca9` | PR #2 schema 1 | schema 3; one tap; original bytes; offline |
| `4ff5851` | PR #3 schema 2 | schema 3; one tap; original bytes; Ramadan retained; offline |

Legacy JavaScript already running cannot acquire a new banner without a navigation. The test and user instructions explicitly use the next online reopen/navigation to load the independent bridge. The update action itself reloads once.

## Mobile Lighthouse

Lighthouse **12.8.2**, default mobile simulation, gzip static preview from `python3 tools/serve.py 8768`:

| Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- |
| 93 | 100 | 100 | 100 |

CLS: 0. The audit covers a fresh installation and its startup/onboarding path. It does not certify every personalized screen or every production host. Gzip and server latency materially affect performance. See the [standalone HTML report](audits/lighthouse-2.1.0.html) and [machine-readable summary](audits/lighthouse-2.1.0.json). The first-install update-banner layout shift found by the initial audit was fixed before this report.

## Screenshots

`docs/screenshots/release-2.1.0/` contains 20 captures: Today, Tasbih library, Ramadan home, update banner, and What's new, each in English/Arabic × light/dark. Real upgrade tests capture the waiting-worker banner; release UI tests capture the other screens. The screenshot profiles contain test records only.

## Limits

No actual personal records were available or inspected. All tests use synthetic personal entries and unchanged sourced religious text. No login, backend, analytics or AI API is added. Missing verified translations/counts remain missing. Redistribution limitations and optional unlicensed assets are documented in [SOURCE-NOTICES.md](../SOURCE-NOTICES.md). Public deployment and physical-phone verification remain distinct from a branch push/PR merge; follow [the phone checklist](UPDATE-2.1.0.md).
