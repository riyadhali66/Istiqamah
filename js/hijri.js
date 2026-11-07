import { dateObj } from "./dates.js";
import { session } from "./session.js";

const hijriService = {
  get(key) {
    try {
      const d = dateObj(key);
      return ArabicCore.gregorianToHijri({
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      });
    } catch {
      return null;
    }
  },
  format(key) {
    try {
      return new Intl.DateTimeFormat(session.lang + "-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(dateObj(key));
    } catch {
      return "";
    }
  },
  fasts(key) {
    const d = this.get(key);
    if (!d) return [];
    let tags = [],
      weekday = dateObj(key).getDay();
    if (d.month === 9) return [];
    if (weekday === 1 || weekday === 4) tags.push("Monday / Thursday");
    if ([13, 14, 15].includes(d.day)) tags.push("White Days");
    if (d.month === 1 && d.day === 10) tags.push("Ashura");
    if (d.month === 12 && d.day === 9) tags.push("Arafah");
    if (d.month === 10 && d.day > 1) tags.push("Shawwal");
    if (
      (d.month === 10 && d.day === 1) ||
      (d.month === 12 && d.day >= 10 && d.day <= 13)
    )
      return [];
    return tags;
  },
  prohibited(key) {
    const d = this.get(key);
    return (
      d &&
      ((d.month === 10 && d.day === 1) ||
        (d.month === 12 && d.day >= 10 && d.day <= 13))
    );
  },
};

export { hijriService };
