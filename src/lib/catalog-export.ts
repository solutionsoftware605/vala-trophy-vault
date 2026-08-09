import type { TrophyStage } from "@/data/trophies";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface ManifestRow {
  role: string;
  roleSlug: string;
  stage: number;
  stageName: string;
  tier: string;
  assetId: string;
  filename: string;
  rendered: boolean;
  lockedReference: string;
}

export function buildManifest(
  items: TrophyStage[],
  hasRender: (id: string) => boolean,
  lockedFilename: (id: string) => string | undefined = () => undefined,
): ManifestRow[] {
  return items.map((t) => {
    const locked = lockedFilename(t.id);
    return {
      role: t.role,
      roleSlug: t.roleSlug,
      stage: t.stage,
      stageName: t.name,
      tier: t.tier,
      assetId: t.id,
      filename: locked ?? `${t.id}.png`,
      rendered: Boolean(locked) || hasRender(t.id),
      lockedReference: locked ?? "",
    };
  });
}

function csvCell(v: string | number | boolean) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadManifestCSV(rows: ManifestRow[]) {
  const headers = [
    "role",
    "role_slug",
    "stage",
    "stage_name",
    "tier",
    "asset_id",
    "filename",
    "rendered",
    "locked_reference",
  ];
  const body = rows.map((r) =>
    [r.role, r.roleSlug, r.stage, r.stageName, r.tier, r.assetId, r.filename, r.rendered]
      .map(csvCell)
      .join(","),
  );
  triggerDownload(
    new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" }),
    "software-vala-trophy-manifest.csv",
  );
}

export function downloadManifestJSON(rows: ManifestRow[]) {
  const payload = {
    catalog: "Software Vala AMS Premium Trophy Gallery",
    generatedAt: new Date().toISOString(),
    total: rows.length,
    rendered: rows.filter((r) => r.rendered).length,
    assets: rows,
  };
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "software-vala-trophy-manifest.json",
  );
}

/** Zips every rendered image for a role plus a per-role manifest. */
export async function downloadRolePack(
  roleName: string,
  roleSlug: string,
  items: TrophyStage[],
  srcFor: (id: string) => string | undefined,
  lockedFilename: (id: string) => string | undefined = () => undefined,
) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const folder = zip.folder(roleSlug)!;
  const rows: ManifestRow[] = [];

  for (const t of items) {
    const src = srcFor(t.id);
    const locked = lockedFilename(t.id);
    const ext = locked ? (locked.split(".").pop() ?? "png") : "png";
    const filename = `${t.id}.${ext}`;
    rows.push({
      role: t.role,
      roleSlug: t.roleSlug,
      stage: t.stage,
      stageName: t.name,
      tier: t.tier,
      assetId: t.id,
      filename,
      rendered: Boolean(src),
      lockedReference: locked ?? "",
    });
    if (!src) continue;
    const res = await fetch(src);
    folder.file(filename, await res.blob());
  }

  folder.file(
    `${roleSlug}-manifest.json`,
    JSON.stringify({ role: roleName, stages: rows }, null, 2),
  );

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `software-vala-${roleSlug}-trophy-pack.zip`);
}
