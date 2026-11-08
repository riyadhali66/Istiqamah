# Sources, attribution and redistribution — 2.1.0

No religious text, translation, reference, grade, or prescribed repetition count is generated. The following register lists each provider once. `ASSET-SHA256.txt` covers distributed derivatives and license files. `npm run test:sources` compares the religious source fields and permission files against pinned upstream bytes.

| Provider | Distributed content and pinned version | License / limitations |
| --- | --- | --- |
| [Adhan JS](https://github.com/batoulapps/adhan-js) | `vendor/adhan.js`, adhan 4.4.3 | MIT, `vendor/LICENSE-adhan.txt` |
| [Arabic Core](https://github.com/getkirnu/arabic-core) | `vendor/arabic-core.js`, 0.1.1 | MIT, `vendor/LICENSE-arabic-core.txt`; ICU Umm al-Qura data uses Unicode License |
| [Chart.js](https://www.chartjs.org) | `vendor/chart.js`, 4.4.8 | MIT, `vendor/LICENSE-chart.txt` |
| [Fontsource Inter](https://github.com/fontsource/fontsource) | `vendor/inter.woff2`, 5.2.5 Latin regular | SIL OFL 1.1, `vendor/LICENSE-inter.txt` |
| [Amiri](https://www.amirifont.org/) | `vendor/amiri.woff2`, @fontsource/amiri 5.2.5 Arabic regular | SIL OFL 1.1, `vendor/LICENSE-amiri.txt` |
| [Quran API](https://github.com/fawazahmed0/quran-api) | `data/quran.json`, release 1; Arabic Uthmani, Abdel Haleem English, Fateh Muhammad Jalandhari Urdu | API repository: The Unlicense, `vendor/LICENSE-quran-api.txt`. Underlying translations retain their independent attribution and rights; the repository license does not establish independent translation rights. Missing verified Malayalam/Hindi translations display Arabic. |
| [Hadith API](https://github.com/fawazahmed0/hadith-api) | `data/hadith.json`, release 1 Abu Dawud; `data/ramadan-dua.json`, release 1 Tirmidhi 3513 Arabic/English | The Unlicense, `vendor/LICENSE-hadith-api.txt`; translations retain independent source attribution/rights. Complete source narration, references and all grades retained. Tirmidhi source graders differ; no independent authentication or ruling is offered. |
| [Names of Allah JSON](https://github.com/rn0x/Names_Of_Allah_Json) | `data/names.json`, `asma_allah_alhusna_saeed_alqahtani.json` | MIT, `vendor/LICENSE-names.txt`; Arabic meanings only |
| [Seen Arabic](https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB) | `data/adhkar.json`; primary morning/evening catalog in `js/adhkar-data.js`; commit `29d7623fede52eca835a789025dfda866e8cfe44` | MIT © 2024 Seen Arabic, verbatim `vendor/LICENSE-adhkar-seen.txt`. 34 source rows expand to 26 morning and 24 evening contexts. Exact Arabic, English, reference, count and description; source identifies Hisn Muslim/Sunnah and cited books. No new translation. |
| [Azkar DB, osamayy](https://github.com/osamayy/azkar-db) | Supplementary categories and historical source manifest `data/adhkar-legacy.json`; commit `fbdfa017782c907fd0ca4ee2726060cbc527072f`, `azkar.json` | Upstream README explicitly grants free use and redistribution; verbatim grant in `data/AZKAR-REUSE.txt`. This is a README reuse grant, not an SPDX license. No separate upstream translation rights are established; no Azkar translations are bundled. |
| [EveryAyah](https://everyayah.com) | Optional external Alafasy 128kbps verse playback | Provider terms; no audio bundled |
| [Quran.com](https://quran.com) | External commentary links; optional King Fahd Quran Complex Uthmani font download from frontend commit `aff1a035b09b66f28047b3216edcae4c5c949a49` | No tafsir copied. Font redistribution rights unresolved; font excluded from repository/install cache. Explicit credited user download only if terms permit use. |
| [Athan-MP3](https://github.com/abodehq/Athan-MP3) | Optional Makkah / Mishary Alafasi downloads, commit `cf1a9dd4f1e5e10009439099c5af74479ad332c0` | No explicit license. Attribution is not permission. Both MP3s excluded from repository/install cache; explicit credited user download only if terms permit use. |
| [Sunnah.com](https://sunnah.com) | External hadith reference links | No separately copied Sunnah.com text; API integration is disabled |

## Source boundaries and historical counts

The selectable catalog has **101 entries across 10 categories**: Seen Arabic supplies morning/evening and the Azkar grant supplies supplementary categories. A normalized Arabic comparison is used only to establish explicit aliases; displayed sacred text is never normalized or blended. Where a supplementary entry has the same text as a Seen entry, Seen remains primary. Morning and evening are intentional independent contexts.

The immutable 113-entry Azkar manifest is historical provenance, not a second selectable library. Unmatched old morning/evening counts retain their original source text and stable IDs in Earlier counter progress. Reviewed PR #3 positional aliases are retained; other positional keys are never guessed into a different text. Old source records, favorites and selections remain archived unchanged even when no safe canonical match exists. Missing references and counts are labeled honestly. Personal counting goals are separate from source repetition counts.

English translations accompany Seen entries only when provided by that source. Arabic, Urdu, Malayalam and Hindi interfaces retain complete Arabic source text when no verified translation is supplied. These are source limitations, not generated translations.

## Optional content and privacy

Pinned optional source URLs and SHA-256 values live in `js/optional-content.js`. Downloads occur only after an explicit tap, are verified before storage in local IndexedDB, work offline afterwards, and are removable. Old sound selections never trigger a download. Providers receive ordinary request metadata, including network address; personal records are never transmitted. No unlicensed MP3 or Uthmani font is distributed. The bundled Amiri font remains the Arabic fallback.
