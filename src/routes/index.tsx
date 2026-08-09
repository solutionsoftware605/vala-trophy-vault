import { createFileRoute } from "@tanstack/react-router";
import { TrophyGallery } from "@/components/TrophyGallery";
import { TROPHIES, ROLE_LIST } from "@/data/trophies";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Software Vala AMS — Premium Trophy Gallery" },
      {
        name: "description",
        content:
          "Visual asset library of premium Software Vala AMS trophies: 15 roles, 10 progression stages each, in crystal, precision metal and black stone.",
      },
      { property: "og:title", content: "Software Vala AMS — Premium Trophy Gallery" },
      {
        property: "og:description",
        content:
          "Browse, filter and download the Software Vala AMS premium trophy collection across every role and progression stage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-gradient-stage">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex items-center gap-4">
            <img
              src={logoAsset.url}
              alt="Software Vala logo"
              className="h-14 w-14 rounded-full shadow-halo"
            />
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-accent">
              Software Vala · The Name of Trust
            </p>
          </div>
          <h1 className="mt-6 max-w-3xl font-display text-4xl leading-tight text-foreground sm:text-5xl">
            AMS Premium Trophy Gallery
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A visual asset library only — {ROLE_LIST.length} role collections, {TROPHIES.length}{" "}
            distinct award designs, each stage a unique silhouette in optical crystal, precision
            metal and black stone.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-6 py-12">
        <TrophyGallery />
      </div>
      <footer className="border-t border-border py-8 text-center text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">
        Software Vala · Asset Gallery
      </footer>
    </main>
  );
}
