const INK = "#171713";
const MUTED = "#6E6A5E";
const GLASS = "#EFEBE2";

export type GlyphKind = "mirror" | "beamsplitter" | "lens" | "polarizer" | "waveplate" | "stage" | "objective" | "detector" | "grating" | "iris";

export function ComponentGlyph({ kind, className = "" }: { kind: GlyphKind; className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`h-16 w-16 ${className}`} role="img" aria-label={kind}>
      <rect x="4" y="4" width="72" height="72" fill="none" stroke="#D9D3C5" strokeWidth="0.5" />
      {kind === "mirror" ? (
        <g>
          <rect x="22" y="18" width="6" height="44" fill={GLASS} stroke={INK} strokeWidth="1" />
          <line x1="26" y1="18" x2="26" y2="62" stroke={INK} strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="40" y1="40" x2="64" y2="24" stroke="#B23A1E" strokeWidth="1" />
          <line x1="64" y1="56" x2="40" y2="40" stroke="#B23A1E" strokeWidth="1" />
          <circle cx="40" cy="40" r="1.5" fill={INK} />
        </g>
      ) : null}
      {kind === "beamsplitter" ? (
        <g>
          <rect x="24" y="20" width="32" height="40" fill="rgba(255,255,255,0.5)" stroke={INK} strokeWidth="1" />
          <line x1="24" y1="60" x2="56" y2="20" stroke={INK} strokeWidth="0.7" strokeDasharray="3 2" />
          <line x1="14" y1="40" x2="24" y2="40" stroke="#B23A1E" strokeWidth="1.2" />
          <line x1="56" y1="40" x2="66" y2="40" stroke="#B23A1E" strokeWidth="1.2" />
          <line x1="40" y1="60" x2="40" y2="70" stroke="#B23A1E" strokeWidth="1.2" />
        </g>
      ) : null}
      {kind === "lens" ? (
        <g>
          <line x1="14" y1="40" x2="66" y2="40" stroke={MUTED} strokeWidth="0.5" strokeDasharray="3 3" />
          <path d="M 40 16 Q 50 40 40 64 Q 30 40 40 16 Z" fill={GLASS} stroke={INK} strokeWidth="1" />
          <line x1="14" y1="34" x2="30" y2="40" stroke="#B23A1E" strokeWidth="0.9" />
          <line x1="14" y1="46" x2="30" y2="40" stroke="#B23A1E" strokeWidth="0.9" />
          <line x1="50" y1="40" x2="66" y2="40" stroke="#B23A1E" strokeWidth="0.9" />
          <circle cx="30" cy="40" r="1" fill="#B23A1E" />
        </g>
      ) : null}
      {kind === "polarizer" ? (
        <g>
          <rect x="30" y="16" width="8" height="48" fill={GLASS} stroke={INK} strokeWidth="1" />
          {[22, 30, 38, 46, 54].map((y) => (
            <line key={y} x1="34" y1={y} x2="34" y2={y + 6} stroke={MUTED} strokeWidth="0.6" />
          ))}
          <line x1="12" y1="40" x2="30" y2="40" stroke="#B23A1E" strokeWidth="1.2" />
          <line x1="38" y1="40" x2="66" y2="40" stroke="#B23A1E" strokeWidth="1.2" />
          <path d="M 44 28 q 6 -8 12 0" fill="none" stroke={INK} strokeWidth="0.7" />
          <line x1="44" y1="30" x2="56" y2="26" stroke={INK} strokeWidth="0.7" />
        </g>
      ) : null}
      {kind === "waveplate" ? (
        <g>
          <rect x="30" y="16" width="8" height="48" fill={GLASS} stroke={INK} strokeWidth="1" />
          <line x1="34" y1="16" x2="34" y2="64" stroke="#14524A" strokeWidth="0.8" strokeDasharray="3 2" />
          <line x1="12" y1="40" x2="30" y2="40" stroke="#B23A1E" strokeWidth="1.2" />
          <path d="M 38 40 C 44 30 50 50 56 40 S 62 30 68 40" fill="none" stroke="#B23A1E" strokeWidth="0.9" />
        </g>
      ) : null}
      {kind === "stage" ? (
        <g>
          <rect x="16" y="30" width="48" height="20" fill={GLASS} stroke={INK} strokeWidth="1" />
          <rect x="22" y="24" width="36" height="6" fill="none" stroke={INK} strokeWidth="0.8" />
          <circle cx="26" cy="40" r="2.5" fill="none" stroke={INK} strokeWidth="0.7" />
          <line x1="40" y1="40" x2="58" y2="40" stroke={INK} strokeWidth="0.7" strokeDasharray="2 2" />
          <line x1="58" y1="36" x2="58" y2="44" stroke={INK} strokeWidth="0.8" />
          <line x1="16" y1="56" x2="64" y2="56" stroke={MUTED} strokeWidth="0.5" />
        </g>
      ) : null}
      {kind === "objective" ? (
        <g>
          <path d="M 26 22 L 54 22 L 48 54 L 32 54 Z" fill={GLASS} stroke={INK} strokeWidth="1" />
          <line x1="24" y1="22" x2="56" y2="22" stroke={INK} strokeWidth="2" />
          <line x1="32" y1="54" x2="48" y2="54" stroke={INK} strokeWidth="1.5" />
          <line x1="40" y1="54" x2="40" y2="66" stroke="#B23A1E" strokeWidth="0.8" />
          <path d="M 36 54 L 40 64 L 44 54" fill="none" stroke="#B23A1E" strokeWidth="0.5" />
        </g>
      ) : null}
      {kind === "detector" ? (
        <g>
          <circle cx="40" cy="40" r="15" fill={GLASS} stroke={INK} strokeWidth="1" />
          <circle cx="40" cy="40" r="5" fill="none" stroke={INK} strokeWidth="0.8" />
          <line x1="40" y1="35" x2="40" y2="45" stroke={INK} strokeWidth="0.7" />
          <line x1="35" y1="40" x2="45" y2="40" stroke={INK} strokeWidth="0.7" />
          <line x1="55" y1="40" x2="66" y2="40" stroke={INK} strokeWidth="0.8" />
          <line x1="18" y1="40" x2="25" y2="40" stroke="#B23A1E" strokeWidth="1" />
        </g>
      ) : null}
      {kind === "grating" ? (
        <g>
          <rect x="24" y="18" width="32" height="8" fill={GLASS} stroke={INK} strokeWidth="1" />
          {[28, 32, 36, 40, 44, 48, 52].map((x) => (
            <line key={x} x1={x} y1="20" x2={x} y2="24" stroke={INK} strokeWidth="0.6" />
          ))}
          <line x1="16" y1="46" x2="36" y2="34" stroke="#B23A1E" strokeWidth="0.9" />
          <line x1="36" y1="34" x2="64" y2="30" stroke="#B23A1E" strokeWidth="0.9" />
          <line x1="36" y1="34" x2="64" y2="44" stroke="#B23A1E" strokeWidth="0.9" />
          <line x1="36" y1="34" x2="64" y2="58" stroke="#B23A1E" strokeWidth="0.9" />
        </g>
      ) : null}
      {kind === "iris" ? (
        <g>
          <circle cx="40" cy="40" r="22" fill="none" stroke={INK} strokeWidth="1" />
          <circle cx="40" cy="40" r="9" fill={GLASS} stroke={INK} strokeWidth="1" />
          {[0, 60, 120, 180, 240, 300].map((a) => {
            const rad = (a * Math.PI) / 180;
            return (
              <line
                key={a}
                x1={40 + 9 * Math.cos(rad)}
                y1={40 + 9 * Math.sin(rad)}
                x2={40 + 22 * Math.cos(rad + 0.5)}
                y2={40 + 22 * Math.sin(rad + 0.5)}
                stroke={MUTED}
                strokeWidth="0.7"
              />
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}
