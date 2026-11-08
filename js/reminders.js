import { session } from "./session.js?v=2.1.0";
import { $, toast } from "./utils.js?v=2.1.0";
import { getDay, save } from "./records.js?v=2.1.0";
import { today } from "./dates.js?v=2.1.0";

import { optionalAudio } from "./optional-content.js?v=2.1.0";
function playAudio(url) {
  if (session.audioPlayer) {
    session.audioPlayer.pause();
    session.audioPlayer = null;
  }
  session.audioPlayer = new Audio(url);
  session.audioPlayer
    .play()
    .catch(() =>
      toast("Audio unavailable. Check your connection and tap again."),
    );
}
async function playAdhan() {
  if (session.state.settings.sound === "silent") return;
  try {
    const url = await optionalAudio(session.state.settings.sound);
    if (url) playAudio(url);
    else toast("Download optional audio in Settings first.");
  } catch {
    toast("Download unavailable. Please try again.");
  }
}
async function notifications() {
  if (!("Notification" in window))
    return toast(
      "Notifications are unavailable in this browser. Use calendar export.",
    );
  let permission = await Notification.requestPermission();
  session.state.settings.reminders = permission === "granted";
  save();
  toast(
    session.state.settings.reminders
      ? "Reminders enabled while the app is open."
      : "Notifications are off. Calendar export is available.",
  );
}
const pomodoro = { running: false, remaining: 25 * 60, ends: 0 };
function timerText() {
  return `${String(Math.floor(pomodoro.remaining / 60)).padStart(2, "0")}:${String(pomodoro.remaining % 60).padStart(2, "0")}`;
}
function tickTimer() {
  if (pomodoro.running) {
    pomodoro.remaining = Math.max(
      0,
      Math.ceil((pomodoro.ends - Date.now()) / 1e3),
    );
    if (!pomodoro.remaining) {
      pomodoro.running = false;
      toast("A focus block completed. Take a gentle break.");
      let d = getDay(today()),
        h = session.state.habits.find((h2) => h2.id === "study");
      if (h) {
        d.values.study = (d.values.study || 0) + 1;
        save();
      }
    }
  }
  if ($("#pomodoro-time")) $("#pomodoro-time").textContent = timerText();
}

export { playAudio, playAdhan, notifications, pomodoro, timerText, tickTimer };
