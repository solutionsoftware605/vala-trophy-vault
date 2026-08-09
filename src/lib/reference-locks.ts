import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sv-trophy-reference-locks";

export type ReferenceLocks = Record<string, string>;

function read(): ReferenceLocks {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReferenceLocks) : {};
  } catch {
    return {};
  }
}

/** Pinned "use this photo as-is" mapping of trophy asset id -> reference key. */
export function useReferenceLocks() {
  const [locks, setLocks] = useState<ReferenceLocks>({});

  useEffect(() => {
    setLocks(read());
  }, []);

  const persist = useCallback((next: ReferenceLocks) => {
    setLocks(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const lock = useCallback(
    (trophyId: string, referenceKey: string) => persist({ ...read(), [trophyId]: referenceKey }),
    [persist],
  );

  const unlock = useCallback(
    (trophyId: string) => {
      const next = { ...read() };
      delete next[trophyId];
      persist(next);
    },
    [persist],
  );

  const clearAll = useCallback(() => persist({}), [persist]);

  return { locks, lock, unlock, clearAll };
}
