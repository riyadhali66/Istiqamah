export const ramadanDefaults = () => ({
  mode: "auto",
  adjustment: 0,
  manualStart: "",
  manualEnd: "",
  goal: 1,
  taraweeh: "home",
  dailySadaqah: 0,
  setupYear: 0,
  qadaPaid: 0,
  fitrAmount: 0,
  fitrPeople: 1,
});
export function validRamadan(value, day = false) {
  const obj = (x) => x && typeof x === "object" && !Array.isArray(x);
  const number = (x, max = 1e9) =>
    typeof x === "number" && Number.isFinite(x) && x >= 0 && x <= max;
  const date = (x) =>
    x === "" ||
    (typeof x === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(x) &&
      !Number.isNaN(Date.parse(x)) &&
      new Date(x).toISOString().slice(0, 10) === x);
  if (!obj(value)) return false;
  if (day)
    return (
      Number.isInteger(value.season) &&
      value.season >= 1300 &&
      value.season <= 1700 &&
      Number.isInteger(value.day) &&
      value.day >= 1 &&
      value.day <= 30 &&
      [
        "fasted",
        "notFasting",
        "suhoor",
        "taraweeh",
        "dua",
        "feed",
        "nightPrayer",
        "itikaf",
      ].every((k) => value[k] == null || typeof value[k] === "boolean") &&
      ["pages", "sadaqah"].every((k) => value[k] == null || number(value[k])) &&
      !(value.fasted && value.notFasting)
    );
  return (
    ["auto", "on", "off"].includes(value.mode) &&
    [-1, 0, 1].includes(value.adjustment) &&
    date(value.manualStart) &&
    date(value.manualEnd) &&
    [0.5, 1, 2, 3].includes(value.goal) &&
    ["home", "mosque", "skip"].includes(value.taraweeh) &&
    ["dailySadaqah", "qadaPaid", "fitrAmount", "fitrPeople", "setupYear"].every(
      (k) => number(value[k]),
    ) &&
    Number.isInteger(value.qadaPaid) &&
    Number.isInteger(value.fitrPeople) &&
    value.fitrPeople >= 1 &&
    value.fitrPeople <= 100 &&
    Number.isInteger(value.setupYear)
  );
}
