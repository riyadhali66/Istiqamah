import { view_shell as shell } from "./shell.js?v=2.1.1";
import { view_top as top } from "./top.js?v=2.1.1";
import { view_heading as heading } from "./heading.js?v=2.1.1";
import { view_footer as footer } from "./footer.js?v=2.1.1";
import { view_today as today } from "./today.js?v=2.1.1";
const ui = { shell, top, heading, footer, today };
const pending = new Map();
export function ensureView(page) {
  if (ui[page]) return Promise.resolve();
  if (!pending.has(page))
    pending.set(
      page,
      (async () => {
        const files = {
          settings: ["settings"],
          progress: ["progress", "review"],
          reflections: ["reflections"],
          tools: [
            "tools",
            "ramadan",
            "tasbih",
            "wealth",
            "fasting",
            "words",
            "kids",
          ],
        }[page];
        if (!files) throw new Error("Unknown page");
        const views = await Promise.all(
          files.map(async (file) => {
            const view = await import(`./${file}.js?v=2.1.1`);
            return [file, view["view_" + file]];
          }),
        );
        Object.assign(ui, Object.fromEntries(views));
      })().catch((error) => {
        pending.delete(page);
        throw error;
      }),
    );
  return pending.get(page);
}
export { ui };
