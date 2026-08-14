import { useMemo, useState } from "react";
import { Download, Expand, Search, X } from "lucide-react";
import { Tilt } from "@/components/Trophy3D";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { playDownload, playHover, playReveal, playTap } from "@/lib/trophy-sound";
import logoAsset from "@/assets/software-vala-logo.jpg.asset.json";

const shieldFiles = import.meta.glob("../assets/shields/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const certificateFiles = import.meta.glob("../assets/certificates/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

type Kind = "shield" | "certificate";

interface Credential {
  id: string;
  role: string;
  roleSlug: string;
  kind: Kind;
  src: string;
}

function titleCase(slug: string) {
  if (slug === "seo") return "SEO";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function collect(files: Record<string, string>, kind: Kind): Credential[] {
  return Object.entries(files)
    .map(([path, src]) => {
      const file = path.split("/").pop()!;
      const roleSlug = file.replace(`-${kind}.png`, "");
      return { id: `${roleSlug}-${kind}`, role: titleCase(roleSlug), roleSlug, kind, src };
    })
    .sort((a, b) => a.role.localeCompare(b.role));
}

const CREDENTIALS = [...collect(shieldFiles, "shield"), ...collect(certificateFiles, "certificate")];

export function CredentialGallery() {
  const [kind, setKind] = useState<Kind>("shield");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Credential | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CREDENTIALS.filter(
      (c) => c.kind === kind && (!q || c.role.toLowerCase().includes(q)),
    );
  }, [kind, query]);

  return (
    <section aria-labelledby="credentials" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.25em] text-accent">
            Software Vala recognition set
          </p>
          <h2 id="credentials" className="mt-1 font-display text-3xl text-foreground">
            Shields &amp; Certificates
          </h2>
        </div>
        <p className="max-w-md text-right text-xs leading-relaxed text-muted-foreground">
          One unique shield and one unique certificate per role — every emblem, material palette and
          layout is distinct, all branded SOFTWARE VALA.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-md border border-border p-1">
          {(["shield", "certificate"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => {
                playTap();
                setKind(k);
              }}
              className={`rounded px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] transition-colors ${
                kind === k
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {k === "shield" ? "Shields" : "Certificates"}
            </button>
          ))}
        </div>
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by role"
            aria-label="Search shields and certificates by role"
            className="pl-9"
          />
        </div>
        <span className="text-xs text-muted-foreground">{items.length} assets</span>
      </div>

      <div
        className={`grid gap-5 ${
          kind === "shield"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid-cols-1 lg:grid-cols-2"
        }`}
      >
        {items.map((item) => (
          <Tilt key={item.id} max={6}>
            <article
              onMouseEnter={playHover}
              className="group overflow-hidden rounded-lg border border-border bg-card shadow-plinth transition-colors hover:border-accent/60"
            >
              <div
                className={`relative overflow-hidden bg-gradient-stage ${
                  kind === "shield" ? "aspect-square" : "aspect-[10/7]"
                }`}
              >
                <img
                  src={item.src}
                  alt={`Software Vala ${item.role} ${item.kind}`}
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="pointer-events-none absolute inset-0 trophy-sheen" />
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-border bg-background/85 p-1.5 pr-2 backdrop-blur">
                  <img src={logoAsset.url} alt="" className="size-7 rounded-sm object-cover" />
                  <span className="text-[0.5rem] uppercase tracking-[0.18em] text-foreground">
                    Software Vala
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={`Preview ${item.role} ${item.kind}`}
                    title="Preview"
                    className="bg-background/85 backdrop-blur"
                    onClick={() => {
                      playReveal();
                      setOpen(item);
                    }}
                  >
                    <Expand />
                  </Button>
                  <Button asChild variant="outline" size="icon" className="bg-background/85 backdrop-blur">
                    <a
                      href={item.src}
                      download={`software-vala-${item.roleSlug}-${item.kind}.png`}
                      aria-label={`Download ${item.role} ${item.kind}`}
                      title="Download"
                      onClick={playDownload}
                    >
                      <Download />
                    </a>
                  </Button>
                </div>
              </div>
              <div className="border-t border-border p-4">
                <p className="text-[0.58rem] uppercase tracking-[0.22em] text-accent">
                  {item.kind === "shield" ? "Role shield" : "Role certificate"}
                </p>
                <h3 className="mt-1 font-display text-xl text-foreground">{item.role}</h3>
              </div>
            </article>
          </Tilt>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${open.role} ${open.kind} preview`}
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-full w-full max-w-4xl overflow-auto rounded-lg border border-border bg-card"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-border p-4">
              <div>
                <p className="text-[0.6rem] uppercase tracking-[0.22em] text-accent">
                  Software Vala · {open.kind === "shield" ? "Role shield" : "Role certificate"}
                </p>
                <h3 className="font-display text-2xl text-foreground">{open.role}</h3>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="icon">
                  <a
                    href={open.src}
                    download={`software-vala-${open.roleSlug}-${open.kind}.png`}
                    aria-label="Download asset"
                    onClick={playDownload}
                  >
                    <Download />
                  </a>
                </Button>
                <Button variant="outline" size="icon" onClick={() => setOpen(null)} aria-label="Close preview">
                  <X />
                </Button>
              </div>
            </header>
            <div className="bg-gradient-stage p-4 sm:p-8">
              <img
                src={open.src}
                alt={`Software Vala ${open.role} ${open.kind}`}
                className="mx-auto max-h-[70vh] w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
