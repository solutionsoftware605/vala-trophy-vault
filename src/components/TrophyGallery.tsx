import { useMemo, useState } from "react";
import {
  Download,
  Expand,
  FileJson,
  FileSpreadsheet,
  Loader2,
  Package,
  Pin,
  PinOff,
  Search,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { ROLE_LIST, TIERS, TROPHIES, type TrophyStage } from "@/data/trophies";
import { Tilt, Turntable } from "@/components/Trophy3D";
import {
  buildManifest,
  downloadManifestCSV,
  downloadManifestJSON,
  downloadRolePack,
} from "@/lib/catalog-export";
import {
  isSoundEnabled,
  playDownload,
  playHover,
  playReveal,
  playTap,
  setSoundEnabled,
} from "@/lib/trophy-sound";
import { REFERENCES, referenceByKey } from "@/lib/references";
import { useReferenceLocks } from "@/lib/reference-locks";


const renders = import.meta.glob("../assets/trophies/*.{png,jpg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

function renderFor(id: string): string | undefined {
  const hit = Object.entries(renders).find(([path]) => path.includes(`/${id}.`));
  return hit?.[1];
}

function TrophyTile({
  item,
  onOpen,
  src,
  lockedLabel,
  onPin,
  onUnpin,
}: {
  item: TrophyStage;
  onOpen: (t: TrophyStage) => void;
  src?: string;
  lockedLabel?: string;
  onPin: (t: TrophyStage) => void;
  onUnpin: (t: TrophyStage) => void;
}) {
  return (
    <Tilt>
      <figure
        onMouseEnter={playHover}
        className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-plinth transition-all hover:border-accent/60 hover:shadow-halo"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-stage">
          {src ? (
            <img
              src={src}
              alt={`${item.role} stage ${item.stage} trophy — ${item.name}`}
              loading="lazy"
              className={`trophy-render h-full w-full transition-transform duration-700 group-hover:scale-[1.06] ${lockedLabel ? "object-contain" : "object-cover"}`}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center">
              <span className="font-display text-3xl text-muted-foreground/50">
                {String(item.stage).padStart(2, "0")}
              </span>
              <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
                render pending
              </span>
            </div>
          )}
          {lockedLabel && (
            <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-accent bg-background/80 px-2 py-1 text-[0.55rem] uppercase tracking-[0.2em] text-accent backdrop-blur">
              <Pin className="size-3" /> {lockedLabel}
            </span>
          )}
          <div className="pointer-events-none absolute inset-0 trophy-sheen" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/90 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={() => {
                playTap();
                if (lockedLabel) onUnpin(item);
                else onPin(item);
              }}
              aria-label={lockedLabel ? "Unlock reference" : "Lock reference photo to this stage"}
              className="rounded-md border border-border bg-card/80 p-2 text-foreground backdrop-blur transition-colors hover:border-accent"
            >
              {lockedLabel ? <PinOff className="size-4" /> : <Pin className="size-4" />}
            </button>
            <button
              onClick={() => {
                playReveal();
                onOpen(item);
              }}
              aria-label="Preview in 3D"
              className="rounded-md border border-border bg-card/80 p-2 text-foreground backdrop-blur transition-colors hover:border-accent"
            >
              <Expand className="size-4" />
            </button>
            {src && (
              <a
                href={src}
                download={`${item.id}.png`}
                onClick={playDownload}
                aria-label="Download image"
                className="rounded-md border border-border bg-card/80 p-2 text-foreground backdrop-blur transition-colors hover:border-accent"
              >
                <Download className="size-4" />
              </a>
            )}
          </div>
        </div>
        <figcaption className="space-y-1 p-4">
          <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
            <span>{item.role}</span>
            <span className="text-accent">Stage {String(item.stage).padStart(2, "0")}</span>
          </div>
          <h3 className="font-display text-base text-foreground">{item.name}</h3>
          <span className="inline-block rounded-full border border-border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
            {item.tier}
          </span>
        </figcaption>
      </figure>
    </Tilt>
  );
}


function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={() => {
        playTap();
        onClick();
      }}
      className={`rounded-full border px-3 py-1.5 text-xs tracking-wide transition-colors ${
        active
          ? "border-accent bg-accent/15 text-accent"
          : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export function TrophyGallery() {
  const [role, setRole] = useState<string>("all");
  const [stage, setStage] = useState<string>("all");
  const [tier, setTier] = useState<string>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<TrophyStage | null>(null);
  const [sound, setSound] = useState(isSoundEnabled());
  const [packing, setPacking] = useState<string | null>(null);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return TROPHIES.filter(
      (t) =>
        (role === "all" || t.roleSlug === role) &&
        (stage === "all" || String(t.stage) === stage) &&
        (tier === "all" || t.tier === tier) &&
        (!term ||
          t.name.toLowerCase().includes(term) ||
          t.role.toLowerCase().includes(term) ||
          t.id.includes(term)),
    );
  }, [role, stage, tier, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, TrophyStage[]>();
    for (const t of results) {
      const arr = map.get(t.role) ?? [];
      arr.push(t);
      map.set(t.role, arr);
    }
    return [...map.entries()];
  }, [results]);

  const openSrc = open ? renderFor(open.id) : undefined;

  return (
    <div className="space-y-10">
      <div className="space-y-5 rounded-2xl border border-border bg-card/50 p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search trophies, roles or asset IDs…"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent"
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
              Role
            </span>
            <Chip active={role === "all"} onClick={() => setRole("all")}>
              All
            </Chip>
            {ROLE_LIST.map((r) => (
              <Chip key={r.slug} active={role === r.slug} onClick={() => setRole(r.slug)}>
                {r.role}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
              Stage
            </span>
            <Chip active={stage === "all"} onClick={() => setStage("all")}>
              All
            </Chip>
            {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((s) => (
              <Chip key={s} active={stage === s} onClick={() => setStage(s)}>
                {s.padStart(2, "0")}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
              Tier
            </span>
            <Chip active={tier === "all"} onClick={() => setTier("all")}>
              All
            </Chip>
            {TIERS.map((t) => (
              <Chip key={t} active={tier === t} onClick={() => setTier(t)}>
                {t}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {results.length} assets · {grouped.length} collections
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                playDownload();
                downloadManifestCSV(buildManifest(results, (id) => Boolean(renderFor(id))));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <FileSpreadsheet className="size-3.5" />
              Manifest CSV
            </button>
            <button
              onClick={() => {
                playDownload();
                downloadManifestJSON(buildManifest(results, (id) => Boolean(renderFor(id))));
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              <FileJson className="size-3.5" />
              Manifest JSON
            </button>
            <button
              onClick={() => {
                const next = !sound;
                setSoundEnabled(next);
                setSound(next);
                if (next) playTap();
              }}
              aria-label={sound ? "Mute award sounds" : "Enable award sounds"}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
              {sound ? "Sound on" : "Sound off"}
            </button>
          </div>
        </div>

      </div>

      {grouped.map(([roleName, items]) => {
        const slug = items[0]?.roleSlug ?? roleName.toLowerCase();
        return (
        <section key={roleName} className="space-y-4">
          <header className="flex flex-wrap items-baseline gap-4 border-b border-border pb-2">
            <h2 className="font-display text-2xl text-foreground">{roleName}</h2>
            <span className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
              {items.length} stages
            </span>
            <button
              disabled={packing === slug}
              onClick={async () => {
                playDownload();
                setPacking(slug);
                try {
                  await downloadRolePack(roleName, slug, items, renderFor);
                } finally {
                  setPacking(null);
                }
              }}
              className="ml-auto inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
            >
              {packing === slug ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Package className="size-3.5" />
              )}
              Download role pack
            </button>
          </header>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((t) => (
              <TrophyTile key={t.id} item={t} onOpen={setOpen} />
            ))}
          </div>
        </section>
        );
      })}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-6 backdrop-blur"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-full w-full max-w-4xl overflow-auto rounded-2xl border border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent">
                  {open.role} · Stage {String(open.stage).padStart(2, "0")} · {open.tier}
                </p>
                <h3 className="font-display text-2xl text-foreground">{open.name}</h3>
                <p className="text-xs text-muted-foreground">Asset ID: {open.id}</p>
              </div>
              <button
                onClick={() => setOpen(null)}
                aria-label="Close preview"
                className="rounded-md border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            {openSrc ? (
              <Turntable
                src={openSrc}
                alt={`${open.role} stage ${open.stage} trophy — ${open.name}`}
              />
            ) : (
              <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
                Render pending for this stage.
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{open.brief}</p>
            {openSrc && (
              <a
                href={openSrc}
                download={`${open.id}.png`}
                onClick={playDownload}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-accent px-4 py-2 text-xs uppercase tracking-[0.2em] text-accent transition-colors hover:bg-accent/10"
              >
                <Download className="size-4" /> Download
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
