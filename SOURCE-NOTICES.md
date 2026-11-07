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

## Optional sources, excluded from distribution

Neither the adhan recordings nor Azkar DB has an explicit upstream license. Attribution is not permission. They have been **removed from distributed assets and the service-worker install list**, rather than assigning them a license. Settings explains the uncertainty and permits an explicit download only if the provider's terms permit the user's use. The app sends no personal entries; GitHub receives the normal network request metadata. Downloading is optional, checksum-verified, stored only in that browser's IndexedDB and removable in Settings. No download is inferred from an old sound selection. Missing files cause a prompt rather than an automatic request.

| Optional source | Pinned version / link | License status | SHA-256 of original upstream bytes |
| --- | --- | --- | --- |
| Azkar DB, morning/evening rows | [azkar.json](https://raw.githubusercontent.com/osamayy/azkar-db/fbdfa017782c907fd0ca4ee2726060cbc527072f/azkar.json), commit `fbdfa017782c907fd0ca4ee2726060cbc527072f` | No explicit license; not bundled | `071893211f6c711d7fb389826a7bcc79ac1ad2f0c13bdb4cc3bd38e871480a6c` |
| Makkah adhan | [Athan-MP3](https://github.com/abodehq/Athan-MP3/tree/cf1a9dd4f1e5e10009439099c5af74479ad332c0/Sounds), `Athan Makkah.mp3`, commit `cf1a9dd4f1e5e10009439099c5af74479ad332c0` | No explicit license; not bundled | `4ab22d15fcea1a70f636b50f21e3f82597fa583ec2a21065373b3bde87482647` |
| Mishary Alafasi adhan | Same pinned Athan-MP3 commit, `Athan Mishary Alafasi.mp3` | No explicit license; not bundled | `06a9ef43abf7a8907df477a878704d0679d941886273b1a1834e15c2934a1629` |

Azkar rows are mapped to the previous field names and retain their original ordering and repeat counts. This preserves existing `morning-N`/`evening-N` saved counters. The Quran font with unclear separate redistribution terms (`uthmani.woff2`) is removed; Arabic uses existing Amiri under SIL OFL 1.1. The inspected rn0x Hisn Al Muslim repository has no confirmed license in this review and is not included.

Pinned optional-source hashes also appear as comments in `ASSET-SHA256.txt`; their bytes are not shipped. `js/optional-content.js` enforces those hashes before local installation. `npm run test:optional` verifies the current pinned sources without committing downloaded fixtures.
