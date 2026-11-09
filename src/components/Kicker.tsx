import type { CSSProperties, ReactNode } from "react";

/** »PERRON n · NAME« above a section's title: the number in the section's colour. */
export function Kicker({ number, colour, inverted, children, className }: { number: number; colour: string; inverted?: boolean; children: ReactNode; className?: string }) {
  const circle: Record<string, string> = inverted ? { "--colour": "var(--ink)", color: colour } : { "--colour": colour };
  return (
    <div className={className ? `kicker ${className}` : "kicker"}>
      <span className="kicker-number" aria-hidden="true" style={circle as CSSProperties}>
        {number}
      </span>
      {children}
    </div>
  );
}
