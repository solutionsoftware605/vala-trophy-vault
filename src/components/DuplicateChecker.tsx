import { useState } from "react";
import { CheckCircle2, Fingerprint as FingerprintIcon, Loader2, TriangleAlert } from "lucide-react";
import { TROPHIES } from "@/data/trophies";
import {
  fingerprint,
  findDuplicates,
  type DuplicatePair,
  type Fingerprint,
} from "@/lib/silhouette-hash";
import { playDownload, playTap } from "@/lib/trophy-sound";

const renders = import.meta.glob("../assets/trophies/*.{png,jpg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function renderFor(id: string): string | undefined {
  return Object.entries(renders).find(([path]) => path.includes(`/${id}.`))?.[1];
}

const VERDICT_COPY: Record<DuplicatePair["verdict"], string> = {
  reused: "Same silhouette, same palette — reused asset",
  recoloured: "Same silhouette, different palette — recolour",
  similar: "Silhouettes are close — needs a distinct form",
};

/** Scans every rendered stage and flags any two that share a silhouette. */
export function DuplicateChecker() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [checked, setChecked] = useState(0);
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);

  const run = async () => {
    playTap();
    setStatus("running");
    setPairs([]);
    setProgress(0);
    const targets = TROPHIES.map((t) => ({ id: t.id, src: renderFor(t.id) })).filter(
      (t): t is { id: string; src: string } => Boolean(t.src),
    );
    const prints: Fingerprint[] = [];
    for (const t of targets) {
      try {
        prints.push(await fingerprint(t.id, t.src));
      } catch {
        /* skip unreadable render */
      }
      setProgress(Math.round((prints.length / targets.length) * 100));
    }
    setChecked(prints.length);
    setPairs(findDuplicates(prints));
    setStatus("done");
    playDownload();
  };

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-baseline gap-4 border-b border-border pb-2">
        <h2 className="font-display text-2xl text-foreground">Duplicate Silhouette Checker</h2>
        <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
          shape fingerprint · colour-independent
        </span>
        <button
          onClick={run}
          disabled={status === "running"}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {status === "running" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <FingerprintIcon className="size-3.5" />
          )}
          {status === "running" ? `Scanning ${progress}%` : "Run duplicate scan"}
        </button>
      </header>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Every rendered stage is reduced to a 16×16 occupancy map of its silhouette, normalised to
        its own bounding box, so a recoloured or rescaled copy still matches the original. Any pair
        under the distinctness threshold is listed below for redesign.
      </p>

      {status === "done" && (
        <div className="space-y-3">
          {pairs.length === 0 ? (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground">
              <CheckCircle2 className="size-5 text-accent" />
              All {checked} rendered stages are visually distinct — no reused or recoloured
              silhouettes found.
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 rounded-xl border border-destructive/60 bg-card p-4 text-sm text-foreground">
                <TriangleAlert className="size-5 text-destructive" />
                {pairs.length} conflicting pair{pairs.length === 1 ? "" : "s"} across {checked}{" "}
                rendered stages.
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pairs.map((p) => (
                  <article
                    key={`${p.a}-${p.b}`}
                    className="space-y-3 rounded-xl border border-border bg-card p-4"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {[p.a, p.b].map((id) => (
                        <figure key={id} className="space-y-2">
                          <div className="aspect-square overflow-hidden rounded-lg bg-gradient-stage">
                            <img
                              src={renderFor(id)}
                              alt={`Flagged trophy render ${id}`}
                              loading="lazy"
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <figcaption className="text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
                            {id}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-destructive">
                      {VERDICT_COPY[p.verdict]}
                    </p>
                    <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">
                      shape Δ {(p.shape * 100).toFixed(1)}% · tone Δ {(p.tone * 100).toFixed(1)}%
                    </p>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
