import { contentService } from "./content.js?v=2.1.0";
const hadithService = {
  providers: {
    open: { get: () => contentService.daily("hadith") },
    sunnah: {
      async get(reference) {
        if (!hadithService.serverEndpoint) return null;
        const r = await fetch(
          hadithService.serverEndpoint + "?ref=" + encodeURIComponent(reference)
        );
        if (!r.ok) return null;
        return r.json();
      }
    }
  },
  serverEndpoint: null,
  get() {
    const h = this.providers.open.get();
    return h && h.grades.some((g) => ["Sahih", "Hasan", "Hasan Sahih"].includes(g.grade)) ? h : null;
  }
};
export { hadithService };
