# Sources and notices

Original assets were retrieved on 2026-11-05. The expanded adhkar source and reuse terms were checked on 2026-11-08. Religious text is preserved from source data. Filenames below are repository-local. No AI-generated Quran, hadith, adhkar, or names meanings are included.

| Asset | Source and version | License / terms |
| --- | --- | --- |
| `vendor/adhan.js` | [batoulapps/adhan-js](https://github.com/batoulapps/adhan-js), npm `adhan@4.4.3`, UMD bundle via jsDelivr | MIT; `vendor/LICENSE-adhan.txt` |
| `vendor/arabic-core.js` | [getkirnu/arabic-core](https://github.com/getkirnu/arabic-core), package version 0.1.1; bundled from main source with esbuild 0.25.12 | MIT; `vendor/LICENSE-arabic-core.txt`. Umm al-Qura table is generated from ICU; Unicode License applies to ICU data. |
| `vendor/chart.js` | [Chart.js](https://www.chartjs.org), 4.4.8 UMD, via jsDelivr (cdnjs was inaccessible in this build environment) | MIT; `vendor/LICENSE-chart.txt` |
| `vendor/inter.woff2` | `@fontsource/inter@5.2.5`, Latin regular | SIL OFL 1.1; `vendor/LICENSE-inter.txt` |
| `vendor/amiri.woff2` | `@fontsource/amiri@5.2.5`, Arabic regular | SIL OFL 1.1; `vendor/LICENSE-amiri.txt` |
| `vendor/uthmani.woff2` | [Quran.com frontend](https://github.com/quran/quran.com-frontend-next), `public/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2` | KFGQPC HAFS Uthmanic Script, King Fahd Quran Complex. No separate license file was present at that upstream font path; consult original font terms before redistribution. Used only for Quran text. |
| Quran readings in `data/content.js` | [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api), release 1; editions `ara-quranuthmanihaf`, `eng-abdelhaleem`, `urd-fatehmuhammadja` | API repository: The Unlicense, `vendor/LICENSE-quran-api.txt`. Source translations retain their attribution and any independent source rights. |
| Hadith readings in `data/content.js` | [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api), release 1; `eng-abudawud`, `ara-abudawud`, `urd-abudawud` | API repository: The Unlicense, `vendor/LICENSE-hadith-api.txt`. Grades and graders retained from the dataset; collection references link to Sunnah.com. |
| Adhkar in `data/content.js` | [osamayy/azkar-db](https://github.com/osamayy/azkar-db), master `azkar.json`, morning/evening rows | The upstream README explicitly permits free use and redistribution; see `data/AZKAR-REUSE.txt`. No standard SPDX license is specified. This permission applies to the dataset, not independently to other bundled assets. |
| `data/adhkar-library.js` | [Azkar DB](https://github.com/osamayy/azkar-db), commit `fbdfa017782c907fd0ca4ee2726060cbc527072f`, selected rows of `azkar.json` | Same explicit README reuse grant. 113 verbatim entries, source category/reference/provenance retained; absent count fields are `null`, not an invented prescription. |
| Names in `data/content.js` | [rn0x/Names_Of_Allah_Json](https://github.com/rn0x/Names_Of_Allah_Json), main `asma_allah_alhusna_saeed_alqahtani.json` | MIT, `vendor/LICENSE-names.txt`; original Arabic names and meanings, without generated translations. |
| `data/adhan-makkah.mp3`, `data/adhan-mishary.mp3` | [abodehq/Athan-MP3](https://github.com/abodehq/Athan-MP3), master `Sounds/Athan Makkah.mp3` and `Sounds/Athan Mishary Alafasi.mp3` | No explicit license in the upstream archive. Source credit retained; confirm recording redistribution rights before public release. |
| Verse audio | [EveryAyah](https://everyayah.com), `Alafasy_128kbps`, verse-by-verse MP3s | External playback and optional browser caching; original provider terms. No recitation is bundled. |
| Commentary links | [Quran.com](https://quran.com), English Ibn Kathir tafsir | External links, no tafsir text copied. |
| Future hadith provider | [Sunnah.com API](https://api.sunnah.com/v1) | Not enabled in v1; future requests must pass through a server holding the key. |

## Curated references

Quran: 94:5, 94:6, 2:286, 13:28, 14:7, 39:53, 65:3, 2:153, 3:159, 29:69, 53:39, 2:152, 16:97, 31:17, 20:114.

Sunan Abi Dawud: 1289, 1308, 1319, 1398, 1425, 1455, 1464, 1468, 1479, 1480, 1481, 1490, 1516, 1531, 1534, 1541, 1544, 1547, 1642, 1643, 1644, 1672, 1691, 1694, 2436, 2449, 2608, 3530, 4681, 4777, 4800, 4811, 4833, 4843, 4918, 4932, 4941, 4982, 5095, 5125, 5154, 5186, 5197, 4782, 4795, 4798, 4799, 4807, 4808, 4809, 4812, 4813, 4814, 4818, 4822, 4836, 5143, 5151, 5152, 5155.

The selection covers worship, Quran study, supplication, patience, charity, gratitude, anger management, gentleness, family, friendship, and neighborly care. The app displays accepted source grades (Sahih/Hasan) and grader attribution. Consult the linked full source for context and any grading differences; the app does not issue independent authentication judgments.

## Integrity

`ASSET-SHA256.txt` records checksums of the distributed vendor and data files. Vendored files are loaded from the app's own origin; there are no runtime third-party library dependencies. The original services remain in `index.html`, with Phase 2 services/UI/migrations in `phase2.js` and styles in `phase2.css`, and a separate service worker because browsers require a separately addressable worker for installation.

## Phase 2 provenance and limitations

Azkar DB's README states: «هذه الملفات بدون رخصة استخدام، يحق لك فعل ما تريد بها مجانا وبدون أي مسائلة قانونية.» It also expressly invites use in websites/apps and distribution of the database. The full inspected README is bundled as `data/AZKAR-REUSE.txt`; the permission was previously overlooked when only archive filenames were checked. This is an explicit reuse grant, not an assertion that the repository carries a named standard license.

The inspected [rn0x/hisn_almuslim_json](https://github.com/rn0x/hisn_almuslim_json) archive and README have no explicit reuse license or permission. No additional Hisn text is bundled. Its README was inspected for content structure and rights; it is not a source of generated translations.

The expanded library has ten categories: general remembrance, morning, evening, after prayer, before sleep, waking, home, food/drink, travel, and forgiveness/supplication. Every entry includes a stable content ID, unmodified original Arabic, original reference if supplied, nullable structured count, empty translations object unless a verified source supplies one, and source provenance. There are 52 entries without a structured count field. The source's Arabic instructions remain intact; personal counting goals are not represented as prescribed counts.

`tools/build-adhkar.py` reproducibly builds the library from the original source JSON, recording the source file SHA-256 and commit. The stable ID is a SHA-256 prefix of source category, full Arabic text, and original reference; the full row checksum is also retained. A legacy-key manifest maps every one of the 61 existing morning/evening entries. Reordering rows leaves IDs and records unchanged. Text/reference corrections that change IDs require an explicit migration map in a future release.

The compressed test fixture `tests/fixtures/v1-app.json.gz` contains the original application HTML and service worker at commit `964ba5214e45776bb0c55cd23676ec57e2363fb8`, under the project's MIT license, for actual old-version offline-upgrade tests. It contains no personal user records.

All existing third-party font and audio rights notes remain applicable; the new Azkar reuse grant does not resolve those separate upstream terms. App interface translations in five languages are UI strings, not generated religious translations. Quran/hadith readings without a bundled Hindi/Malayalam translation retain the English source text; Quran attribution follows the text actually displayed.
