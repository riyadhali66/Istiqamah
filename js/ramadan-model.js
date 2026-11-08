export const ramadanDefaults = () => ({
  mode: "auto",
  dailyTargetEnabled:false, dailyPages:2, suhoorMinutes:45, iftarMinutes:30, completion:{enabled:false,pages:0,deadline:"",setOn:""},
  goals:{taraweeh:true,charity:true,adhkar:true,family:true}, nightGoals:"",
  adjustment: 0,
  manualStart: "", manualLength:30,
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
        "paused", "charity", "adhkar", "family", "makeUpNeeded",
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
      !(value.fasted && value.notFasting) &&
      (value.reason == null || typeof value.reason === "string" && value.reason.length<=1000)
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
    Number.isInteger(value.setupYear) &&
    (value.manualLength == null || [29,30].includes(value.manualLength)) &&
    ["suhoorMinutes","iftarMinutes"].every(k=>value[k]==null || number(value[k],180)) &&
    (value.dailyTargetEnabled==null || typeof value.dailyTargetEnabled==='boolean') &&
    (value.dailyPages==null || number(value.dailyPages,1e6)) &&
    (value.nightGoals==null || typeof value.nightGoals==='string' && value.nightGoals.length<=1000) &&
    (value.completion==null || obj(value.completion) && typeof value.completion.enabled==='boolean' && number(value.completion.pages,1e6) && date(value.completion.deadline) && date(value.completion.setOn))
  );
}
