import { useCallback, useRef, useState } from "react";
import { playSpin } from "@/lib/trophy-sound";

/** Mouse-parallax 3D tilt with a moving specular sheen. */
export function Tilt({
  children,
  className = "",
  max = 12,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", `${(0.5 - py) * max * 2}deg`);
      el.style.setProperty("--ry", `${(px - 0.5) * max * 2}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    },
    [max],
  );

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }, []);

  return (
    <div className="[perspective:1200px]">
      <div
        ref={ref}
        onMouseMove={move}
        onMouseLeave={reset}
        className={`tilt-3d ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/** Drag-to-rotate turntable presentation of a single trophy render. */
export function Turntable({ src, alt }: { src: string; alt: string }) {
  const [angle, setAngle] = useState(0);
  const drag = useRef<{ x: number; a: number } | null>(null);

  const start = (x: number) => {
    drag.current = { x, a: angle };
  };
  const move = (x: number) => {
    if (!drag.current) return;
    const next = drag.current.a + (x - drag.current.x) * 0.45;
    if (Math.abs(next - angle) > 14) playSpin();
    setAngle(Math.max(-55, Math.min(55, next)));
  };
  const end = () => {
    drag.current = null;
  };

  return (
    <div className="space-y-3">
      <div
        className="turntable-stage relative select-none overflow-hidden rounded-xl border border-border"
        onMouseDown={(e) => start(e.clientX)}
        onMouseMove={(e) => move(e.clientX)}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={(e) => start(e.touches[0].clientX)}
        onTouchMove={(e) => move(e.touches[0].clientX)}
        onTouchEnd={end}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="trophy-render mx-auto w-full will-change-transform"
          style={{
            transform: `rotateY(${angle}deg) rotateX(${-Math.abs(angle) * 0.07}deg) scale(${1 + Math.abs(angle) / 700})`,
            transition: drag.current ? "none" : "transform 500ms cubic-bezier(.22,.61,.36,1)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 trophy-sheen" />
      </div>
      <div className="flex items-center justify-between text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
        <span>Drag to rotate · 3D view</span>
        <button
          onClick={() => setAngle(0)}
          className="rounded-full border border-border px-3 py-1 tracking-[0.2em] transition-colors hover:border-accent hover:text-accent"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
