import { categoryScore, monthKeys, score } from "../records.js?v=2.1.0";
import { today } from "../dates.js?v=2.1.0";
import { session } from "../session.js?v=2.1.0";
import { $ } from "../utils.js?v=2.1.0";
import { t } from "../i18n.js?v=2.1.0";
import { CATEGORIES } from "../config.js?v=2.1.0";
export async function ensureCharts() {
  await import("../../vendor/chart.js?v=2.1.0");
}
function drawCharts() {
  if (!window.Chart) return;
  const keys = monthKeys(), active = keys.filter(
    (k) => k <= today() && session.state.days[k] && Object.values(session.state.days[k].values || {}).some((v) => v > 0)
  ), muted = getComputedStyle(document.body).getPropertyValue("--muted"), line = getComputedStyle(document.body).getPropertyValue("--line");
  Chart.defaults.font.family = "Inter";
  Chart.defaults.color = muted;
  const axes = {
    grid: { color: line },
    border: { display: false },
    ticks: { font: { size: 10 } }
  };
  session.charts.push(
    new Chart($("#score-chart"), {
      type: "line",
      data: {
        labels: keys.map((k, i) => i + 1),
        datasets: [
          {
            label: t("Daily score"),
            data: keys.map(
              (k) => k <= today() && session.state.days[k] ? score(k) : null
            ),
            borderColor: "#48886a",
            backgroundColor: "#48886a12",
            fill: true,
            tension: 0.35,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { ...axes, min: 0, max: 100 }, x: axes }
      }
    })
  );
  session.charts.push(
    new Chart($("#radar-chart"), {
      type: "radar",
      data: {
        labels: CATEGORIES.map(t),
        datasets: [
          {
            label: t("Category balance"),
            data: CATEGORIES.map(
              (c) => active.length ? Math.round(
                active.reduce((s, k) => s + categoryScore(k, c), 0) / active.length
              ) : 0
            ),
            borderColor: "#b68d43",
            backgroundColor: "#b68d4320",
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: line },
            angleLines: { color: line },
            pointLabels: { font: { size: 9 } }
          }
        }
      }
    })
  );
  session.charts.push(
    new Chart($("#mood-chart"), {
      type: "line",
      data: {
        labels: keys.map((k, i) => i + 1),
        datasets: [
          {
            label: t("How are you feeling?") + " (1\u20135)",
            data: keys.map((k) => session.state.days[k]?.mood || null),
            borderColor: "#b68d43",
            yAxisID: "mood",
            tension: 0.3
          },
          {
            label: t("Sleep hours"),
            data: keys.map((k) => session.state.days[k]?.values?.sleep ?? null),
            borderColor: "#48886a",
            yAxisID: "sleep",
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { boxWidth: 10 } } },
        scales: {
          x: axes,
          mood: { ...axes, min: 0, max: 5, position: "left" },
          sleep: {
            ...axes,
            min: 0,
            max: 12,
            position: "right",
            grid: { display: false }
          }
        }
      }
    })
  );
}
export { drawCharts };
