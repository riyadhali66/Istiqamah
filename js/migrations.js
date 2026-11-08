import { ramadanDefaults } from './ramadan-model.js?v=2.1.1';
import { aliases, byId } from './adhkar-data.js?v=2.1.1';
// Legacy fields remain archival: no text is matched by an array position.
export function upgradeRecords(input) {
  const s = structuredClone(input);
  if (!s.schemaVersion) s.schemaVersion = 1;
  if (s.schemaVersion === 1) s.schemaVersion = 2;
  if (s.schemaVersion === 2) {
    const old = s.phase2?.ramadan;
    s.ramadanConfig ??= { ...ramadanDefaults(), ...(s.ramadan || {}) };
    if (old) {
      Object.assign(s.ramadanConfig, {
        manualLength:old.length || 30, mode: old.enabled ? 'on' : 'off', manualStart: old.startDate || '',
        dailyTargetEnabled:!old.quran?.enabled, dailyPages: old.dailyPages ?? 2, suhoorMinutes: old.suhoorMinutes ?? 45,
        iftarMinutes: old.iftarMinutes ?? 30, completion: structuredClone(old.quran || {}),
        goals: structuredClone(old.goals || {}), nightGoals: old.nightGoals || '',
      });
    }
    const prefs = s.phase2?.adhkar || {};
    s.adhkarPrefs ??= { selected: aliases[s.tasbih.selected] || s.tasbih.selected || '',
      earlierFavorites:(prefs.favorites || []).filter(id=>!aliases[id]),
      category: prefs.category || 'all', search: prefs.search || '',
      favorites: [...new Set((prefs.favorites || []).map(id => aliases[id]).filter(Boolean))],
      personalTargets: {} };
    for (const [id,n] of Object.entries(prefs.personalTargets || {}))
      if (aliases[id]) s.adhkarPrefs.personalTargets[aliases[id]] = n;
    for (const [key,d] of Object.entries(s.days)) {
      d.adhkarCounts ??= {}; d.earlierAdhkar ??= {};
      for (const [id,n] of Object.entries(d.adhkar || {})) {
        const canonical = aliases[id];
        if (canonical && byId.has(canonical))
          d.adhkarCounts[canonical] = Math.max(d.adhkarCounts[canonical] || 0,n);
        else d.earlierAdhkar[id] = n;
      }
      if (d.ramadan?.season) d.ramadanV3 = structuredClone(d.ramadan);
      else if (d.ramadan?.active) {
        const r = d.ramadan, v = d.values || {};
        // Intl uses the same Umm al-Qura calendar as the application.
        const season = +new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{year:'numeric',timeZone:'UTC'}).formatToParts(new Date(key+'T12:00:00Z')).find(p=>p.type==='year').value;
        d.ramadanV3 = { season, day:r.day, fasted:r.fasting==='fasted',
          notFasting:r.fasting==='not-fasting', paused:r.fasting==='paused', reason:r.reason || '',
          pages:v['ramadan-quran'] || 0, taraweeh:!!v['ramadan-taraweeh'],
          charity:!!v['ramadan-charity'], adhkar:!!v['ramadan-adhkar'], family:!!v['ramadan-family'],
          planSnapshot:structuredClone(r.snapshot || []), nightGoals:r.nightGoals || '' };
      }
    }
    s.schemaVersion = 3;
  }
  return s;
}
