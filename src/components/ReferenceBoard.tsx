import { Tilt } from "@/components/Trophy3D";
import { playHover } from "@/lib/trophy-sound";

const refs = import.meta.glob("../assets/references/*.{jpg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const items = Object.entries(refs)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src]) => ({ src, key: path }));

/** Physical award reference photographs supplied by the client, shown as-is. */
export function ReferenceBoard() {
  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-baseline gap-4 border-b border-border pb-2">
        <h2 className="font-display text-2xl text-foreground">Reference Board</h2>
        <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          {items.length} supplied photos · original, unedited
        </span>
      </header>
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((it, i) => (
          <Tilt key={it.key} max={9}>
            <figure
              onMouseEnter={playHover}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-plinth transition-colors hover:border-accent/60"
            >
              <div className="relative aspect-square overflow-hidden bg-gradient-stage">
                <img
                  src={it.src}
                  alt={`Physical trophy reference photo ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <div className="pointer-events-none absolute inset-0 trophy-sheen" />
              </div>
              <figcaption className="flex items-center justify-between p-3 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                <span>Reference {String(i + 1).padStart(2, "0")}</span>
                <a
                  href={it.src}
                  download
                  className="transition-colors hover:text-accent"
                >
                  Download
                </a>
              </figcaption>
            </figure>
          </Tilt>
        ))}
      </div>
    </section>
  );
}
