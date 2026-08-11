import { useState } from "react";
import { Download, Expand, X } from "lucide-react";
import { Tilt } from "@/components/Trophy3D";
import { Button } from "@/components/ui/button";
import { playDownload, playHover, playReveal } from "@/lib/trophy-sound";
import logoAsset from "@/assets/software-vala-logo.jpg.asset.json";

const sourceImages = import.meta.glob("../assets/reference-trophies/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const assignments = [
  ["Developer", "Code Architecture"],
  ["Reseller", "Channel Excellence"],
  ["Franchise", "Network Leadership"],
  ["Author", "Knowledge Excellence"],
  ["Vendor", "Platform Partnership"],
  ["Affiliate", "Growth Partnership"],
  ["Influencer", "Digital Impact"],
  ["Creator", "Creative Innovation"],
  ["SEO", "Search Excellence"],
  ["Support", "Service Excellence"],
  ["User", "Product Achievement"],
  ["Manager", "Operational Leadership"],
] as const;

const trophies = assignments.map(([role, category], index) => {
  const slug = role.toLowerCase();
  const marker = `${slug}-reference-${String(index + 1).padStart(2, "0")}.jpg`;
  const source = Object.entries(sourceImages).find(([path]) => path.endsWith(marker))?.[1];
  return { role, category, source, number: index + 1 };
});

type ReferenceTrophy = (typeof trophies)[number];

export function ReferenceTrophyCollection() {
  const [open, setOpen] = useState<ReferenceTrophy | null>(null);

  return (
    <section aria-labelledby="reference-trophies" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent">
            Original supplied collection
          </p>
          <h2 id="reference-trophies" className="mt-1 font-display text-3xl text-foreground">
            12 Unique Physical Awards
          </h2>
        </div>
        <p className="max-w-md text-right text-xs leading-relaxed text-muted-foreground">
          Individually separated from the supplied reference sheet. Original shape, material and
          colour preserved—no recolours and no repeated silhouette.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {trophies.map((trophy) => (
          <Tilt key={trophy.role} max={7}>
            <article
              onMouseEnter={playHover}
              className="group overflow-hidden rounded-lg border border-border bg-card shadow-plinth transition-colors hover:border-accent/60"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-gradient-stage">
                {trophy.source ? (
                  <img
                    src={trophy.source}
                    alt={`${trophy.role} trophy from the supplied physical award reference sheet`}
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.035]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Source crop unavailable
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 trophy-sheen" />
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-border bg-background/85 p-1.5 pr-2 backdrop-blur">
                  <img src={logoAsset.url} alt="" className="size-7 rounded-sm object-cover" />
                  <span className="text-[0.5rem] uppercase tracking-[0.18em] text-foreground">
                    Software Vala
                  </span>
                </div>
                <span className="absolute right-3 top-3 rounded-md border border-border bg-background/85 px-2 py-1 text-[0.55rem] text-muted-foreground backdrop-blur">
                  {String(trophy.number).padStart(2, "0")}
                </span>
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Preview ${trophy.role} trophy`}
                    title="Preview trophy"
                    className="bg-background/85 backdrop-blur"
                    onClick={() => {
                      playReveal();
                      setOpen(trophy);
                    }}
                  >
                    <Expand />
                  </Button>
                  {trophy.source && (
                    <Button asChild variant="outline" size="icon" className="bg-background/85 backdrop-blur">
                      <a
                        href={trophy.source}
                        download={`software-vala-${trophy.role.toLowerCase()}-trophy.jpg`}
                        aria-label={`Download ${trophy.role} trophy`}
                        title="Download trophy"
                        onClick={playDownload}
                      >
                        <Download />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <div className="border-t border-border p-4">
                <p className="text-[0.58rem] uppercase tracking-[0.22em] text-accent">
                  {trophy.category}
                </p>
                <h3 className="mt-1 font-display text-xl text-foreground">{trophy.role}</h3>
                <p className="mt-1 text-xs text-muted-foreground">Role-based premium award</p>
              </div>
            </article>
          </Tilt>
        ))}
      </div>

      {open?.source && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.role} trophy preview`}
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-full w-full max-w-3xl overflow-auto rounded-lg border border-border bg-card"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-border p-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-accent">{open.category}</p>
                <h3 className="font-display text-2xl text-foreground">{open.role} Trophy</h3>
              </div>
              <Button variant="outline" size="icon" onClick={() => setOpen(null)} aria-label="Close preview">
                <X />
              </Button>
            </header>
            <div className="relative bg-gradient-stage p-4 sm:p-8">
              <img
                src={open.source}
                alt={`${open.role} trophy from supplied reference`}
                className="mx-auto max-h-[65vh] w-full object-contain"
              />
              <div className="absolute left-7 top-7 flex items-center gap-2 rounded-md border border-border bg-background/85 p-2 pr-3 backdrop-blur">
                <img src={logoAsset.url} alt="Software Vala" className="size-9 rounded-sm object-cover" />
                <span className="text-[0.55rem] uppercase tracking-[0.2em] text-foreground">Software Vala</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}