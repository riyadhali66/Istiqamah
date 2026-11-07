# Sources and notices

Original assets retrieved on 2026-11-05; Phase 1 redistribution review on 2026-11-07. Religious text is preserved from source data. Filenames below are repository-local. No AI-generated Quran, hadith, adhkar, or names meanings are included.

| Asset | Source and version | License / terms |
| --- | --- | --- |
| `vendor/adhan.js` | [batoulapps/adhan-js](https://github.com/batoulapps/adhan-js), npm `adhan@4.4.3`, UMD bundle via jsDelivr | MIT; `vendor/LICENSE-adhan.txt` |
| `vendor/arabic-core.js` | [getkirnu/arabic-core](https://github.com/getkirnu/arabic-core), package version 0.1.1; bundled from main source with esbuild 0.25.12 | MIT; `vendor/LICENSE-arabic-core.txt`. Umm al-Qura table is generated from ICU; Unicode License applies to ICU data. |
| `vendor/chart.js` | [Chart.js](https://www.chartjs.org), 4.4.8 UMD, via jsDelivr (cdnjs was inaccessible in this build environment) | MIT; `vendor/LICENSE-chart.txt` |
| `vendor/inter.woff2` | `@fontsource/inter@5.2.5`, Latin regular | SIL OFL 1.1; `vendor/LICENSE-inter.txt` |
| `vendor/amiri.woff2` | `@fontsource/amiri@5.2.5`, Arabic regular | SIL OFL 1.1; `vendor/LICENSE-amiri.txt` |
| Quran readings in `data/quran.json` | [fawazahmed0/quran-api](https://github.com/fawazahmed0/quran-api), release 1; editions `ara-quranuthmanihaf`, `eng-abdelhaleem`, `urd-fatehmuhammadja` | API repository: The Unlicense, `vendor/LICENSE-quran-api.txt`. Source translations retain their attribution and any independent source rights. |
| Hadith readings in `data/hadith.json` | [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api), release 1; `eng-abudawud`, `ara-abudawud`, `urd-abudawud` | API repository: The Unlicense, `vendor/LICENSE-hadith-api.txt`. Grades and graders retained from the dataset; collection references link to Sunnah.com. |
| Names in `data/names.json` | [rn0x/Names_Of_Allah_Json](https://github.com/rn0x/Names_Of_Allah_Json), main `asma_allah_alhusna_saeed_alqahtani.json` | MIT, `vendor/LICENSE-names.txt`; original Arabic names and meanings, without generated translations. |
| Verse audio | [EveryAyah](https://everyayah.com), `Alafasy_128kbps`, verse-by-verse MP3s | External playback and optional browser caching; original provider terms. No recitation is bundled. |
| Commentary links | [Quran.com](https://quran.com), English Ibn Kathir tafsir | External links, no tafsir text copied. |
| Future hadith provider | [Sunnah.com API](https://api.sunnah.com/v1) | Not enabled in v1; future requests must pass through a server holding the key. |

## Curated references

Quran: 94:5, 94:6, 2:286, 13:28, 14:7, 39:53, 65:3, 2:153, 3:159, 29:69, 53:39, 2:152, 16:97, 31:17, 20:114.

Sunan Abi Dawud: 1289, 1308, 1319, 1398, 1425, 1455, 1464, 1468, 1479, 1480, 1481, 1490, 1516, 1531, 1534, 1541, 1544, 1547, 1642, 1643, 1644, 1672, 1691, 1694, 2436, 2449, 2608, 3530, 4681, 4777, 4800, 4811, 4833, 4843, 4918, 4932, 4941, 4982, 5095, 5125, 5154, 5186, 5197, 4782, 4795, 4798, 4799, 4807, 4808, 4809, 4812, 4813, 4814, 4818, 4822, 4836, 5143, 5151, 5152, 5155.

The selection covers worship, Quran study, supplication, patience, charity, gratitude, anger management, gentleness, family, friendship, and neighborly care. The app displays accepted source grades (Sahih/Hasan) and grader attribution. Consult the linked full source for context and any grading differences; the app does not issue independent authentication judgments.

## Integrity

`ASSET-SHA256.txt` records checksums of the distributed vendor and data files. Vendored files are loaded from the app's own origin; there are no runtime third-party library dependencies. The application uses `js/` ES modules and `css/app.css`; the service worker remains separately addressable. Quran, hadith and Names text was split without altering source text. No new religious translation or paraphrase was introduced.

## Licensed core adhkar — v1.2.0

`data/adhkar.json` copies [Seen Arabic Morning-And-Evening-Adhkar-DB](https://github.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB) at commit **`29d7623fede52eca835a789025dfda866e8cfe44`**, inspected 2026-11-08. **MIT License, copyright © 2024 Seen Arabic**, retained verbatim as `vendor/LICENSE-adhkar-seen.txt`. The upstream README explicitly licenses the project under MIT and identifies its Arabic/reference and English-translation provenance (Hisn Muslim/Sunnah and cited books). This release copies its Arabic and English fields without generating, translating, paraphrasing or normalizing religious text. No licensed Urdu translation was selected; Urdu/Malayalam/Hindi display the Arabic source label. Source audio URLs are not copied or played.

The 34 source rows expand by the source's morning/evening type to 50 app rows (26 morning, 24 evening). References and repeat counts are verbatim. Reviewed `legacyKey` aliases preserve existing count keys; unmatched counts remain visible without reusing them for different text. See `docs/PHASE-2-NOTES.md`.

| Pinned upstream file | SHA-256 |
| --- | --- |
| [ar.json](https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/29d7623fede52eca835a789025dfda866e8cfe44/ar.json) | `9e0dd6a10d26ddc0e2b36b94098c287644996c7f81b707f8ad24f1ce40b8c821` |
| [en.json](https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/29d7623fede52eca835a789025dfda866e8cfe44/en.json) | `eec053c4138bed6f3ec7dc3c0e06e926a935dca24663788e5b97a0bfb5f71896` |
| [LICENSE](https://raw.githubusercontent.com/Seen-Arabic/Morning-And-Evening-Adhkar-DB/29d7623fede52eca835a789025dfda866e8cfe44/LICENSE) | `a72f0268608c31d32da8e5a9c934fef80cc8f377eb018b83f0d660a2894b0825` |

## Laylat al-Qadr narration — v1.2.0

`data/ramadan-dua.json` copies the **complete** Arabic and English narration for **Jami at-Tirmidhi 3513**, from [fawazahmed0/hadith-api release 1](https://github.com/fawazahmed0/hadith-api/tree/1), editions `ara-tirmidhi` / `eng-tirmidhi`. License: **The Unlicense**, retained in existing `vendor/LICENSE-hadith-api.txt`. References link to [Tirmidhi 3513](https://sunnah.com/tirmidhi:3513). The Arabic source's `كَرِيمٌ` variant is preserved exactly; no textual correction or new translation is made.

All source grades are retained in the JSON: Sahih (Ahmad Muhammad Shakir, Al-Albani), Hasan Sahih (Bashar Awad Maarouf), and Daif (Zubair Ali Zai). The card identifies the accepted Sahih/Hasan source grades, states that source grading differs and links to the complete reference; it makes no independent authentication judgment. The existing daily hadith Sahih/Hasan filter is unchanged.

| Source file (release 1) | SHA-256 |
| --- | --- |
| [ara-tirmidhi/3513.json](https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/ara-tirmidhi/3513.json) | `e93d8a8d3a0eca556678008ea193ba6ea6eb7e47fd9ee654ca71cbcb5bda7f3f` |
| [eng-tirmidhi/3513.json](https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions/eng-tirmidhi/3513.json) | `c7d62489bf5d5bc2b7678aa927034b6b961dbcdf463c805d9b49d9db37ca10b6` |

`npm run test:sources` verifies the text, counts, references, translations, license and grading against these pinned files. Distributed derivatives and the license are checksummed in `ASSET-SHA256.txt`; source hashes appear there as comments.

## Optional adhan recordings, excluded from distribution

The two adhan recordings have no explicit upstream license. Attribution is not permission. They remain **excluded from distributed assets and the worker install list**. Settings permits an explicit credited download only if the provider's terms permit the user's use. Downloading sends no personal entries; GitHub receives the normal request metadata. Files are SHA-256 verified, stored in local IndexedDB and removable in Settings. Old sound selections do not trigger automatic downloads.

| Source | Pinned version | License status | SHA-256 |
| --- | --- | --- | --- |
| Makkah adhan | [abodehq/Athan-MP3](https://github.com/abodehq/Athan-MP3/tree/cf1a9dd4f1e5e10009439099c5af74479ad332c0/Sounds), `Athan Makkah.mp3`, commit `cf1a9dd4f1e5e10009439099c5af74479ad332c0` | No explicit license; not bundled | `4ab22d15fcea1a70f636b50f21e3f82597fa583ec2a21065373b3bde87482647` |
| Mishary Alafasi adhan | Same pinned commit, `Athan Mishary Alafasi.mp3` | No explicit license; not bundled | `06a9ef43abf7a8907df477a878704d0679d941886273b1a1834e15c2934a1629` |

Phase 1's optional unlicensed Azkar source is retired in v1.2.0. Its personal count keys remain intact; the app no longer offers or reads that data download. The earlier unclear-license Quran font remains removed; SIL OFL Amiri is used for Arabic.
