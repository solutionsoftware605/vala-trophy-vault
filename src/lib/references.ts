const refs = import.meta.glob("../assets/reference-trophies/*.{jpg,jpeg,png}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export interface ReferencePhoto {
  /** Stable key used when pinning a photo to a stage. */
  key: string;
  src: string;
  filename: string;
  label: string;
}

export const REFERENCES: ReferencePhoto[] = Object.entries(refs)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([path, src], i) => {
    const filename = path.split("/").pop() ?? path;
    return {
      key: filename,
      src,
      filename,
      label: `Reference ${String(i + 1).padStart(2, "0")}`,
    };
  });

export function referenceByKey(key: string): ReferencePhoto | undefined {
  return REFERENCES.find((r) => r.key === key);
}
