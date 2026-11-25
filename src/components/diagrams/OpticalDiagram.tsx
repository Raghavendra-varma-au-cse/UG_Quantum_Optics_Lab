import type { DiagramKind } from "@/lib/content/types";

/**
 * Vector schematics for every experiment. These are technical drawings, not
 * decorative illustrations: beam paths, port labels and component symbols
 * follow the conventions used in the written procedure.
 */

const INK = "#171713";
const MUTED = "#6E6A5E";
const LINE = "#B8B1A0";
const BEAM = "#B23A1E";
const ACCENT = "#14524A";
const GLASS = "#E9E4D8";
const PAPER = "#FBF9F4";

function Label({
  x,
  y,
  children,
  anchor = "middle",
  tone = "muted",
  size = 9
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  tone?: "muted" | "ink" | "beam" | "accent";
  size?: number;
}) {
  const fill = tone === "ink" ? INK : tone === "beam" ? BEAM : tone === "accent" ? ACCENT : MUTED;
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fill={fill}
      fontFamily="var(--font-mono), monospace"
      fontSize={size}
      letterSpacing="0.06em"
    >
      {children}
    </text>
  );
}

function Beam({ d, dashed = false, width = 1.4 }: { d: string; dashed?: boolean; width?: number }) {
  return (
    <path d={d} fill="none" stroke={BEAM} strokeWidth={width} strokeDasharray={dashed ? "4 3" : undefined} strokeLinecap="round" />
  );
}

function Mirror({ x, y, angle = 45, size = 26 }: { x: number; y: number; angle?: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect x={-size / 2} y={-2.5} width={size} height={5} fill={GLASS} stroke={INK} strokeWidth={1} />
      <line x1={-size / 2} y1={-4.5} x2={size / 2} y2={-4.5} stroke={INK} strokeWidth={1} />
    </g>
  );
}

function BeamSplitter({ x, y, size = 34 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-size / 2} y={-size / 2} width={size} height={size} fill="rgba(255,255,255,0.55)" stroke={INK} strokeWidth={1} />
      <line x1={-size / 2} y1={size / 2} x2={size / 2} y2={-size / 2} stroke={INK} strokeWidth={0.8} strokeDasharray="3 2" />
    </g>
  );
}

function Lens({ x, y, height = 40, flip = false }: { x: number; y: number; height?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) ${flip ? "scale(-1,1)" : ""}`}>
      <path
        d={`M 0 ${-height / 2} Q 10 0 0 ${height / 2} Q -10 0 0 ${-height / 2} Z`}
        fill={GLASS}
        stroke={INK}
        strokeWidth={1}
      />
    </g>
  );
}

function Screen({ x, y, h = 70 }: { x: number; y: number; h?: number }) {
  return (
    <g>
      <line x1={x} y1={y - h / 2} x2={x} y2={y + h / 2} stroke={INK} strokeWidth={3} />
      <line x1={x + 3} y1={y - h / 2} x2={x + 3} y2={y + h / 2} stroke={LINE} strokeWidth={1} />
    </g>
  );
}

function Detector({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={11} fill={PAPER} stroke={INK} strokeWidth={1} />
      <circle r={4} fill={INK} />
      <Label x={0} y={26} tone="ink" size={8}>
        {label}
      </Label>
    </g>
  );
}

function Laser({ x, y, label = "LASER" }: { x: number; y: number; label?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-30} y={-11} width={60} height={22} fill={GLASS} stroke={INK} strokeWidth={1} />
      <rect x={-20} y={-5} width={28} height={10} fill={BEAM} opacity={0.85} />
      <Label x={0} y={-18} tone="ink" size={8}>
        {label}
      </Label>
    </g>
  );
}

function Dimensions({ x1, x2, y, label }: { x1: number; x2: number; y: number; label: string }) {
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={MUTED} strokeWidth={0.7} />
      <line x1={x1} y1={y - 3} x2={x1} y2={y + 3} stroke={MUTED} strokeWidth={0.7} />
      <line x1={x2} y1={y - 3} x2={x2} y2={y + 3} stroke={MUTED} strokeWidth={0.7} />
      <rect x={(x1 + x2) / 2 - 18} y={y - 6} width={36} height={12} fill={PAPER} />
      <Label x={(x1 + x2) / 2} y={y + 3} size={8}>
        {label}
      </Label>
    </g>
  );
}

function Grid() {
  return (
    <g opacity={0.5}>
      {Array.from({ length: 11 }).map((_, i) => (
        <line key={`v${i}`} x1={60 + i * 60} y1={24} x2={60 + i * 60} y2={296} stroke={LINE} strokeWidth={0.25} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <line key={`h${i}`} x1={40} y1={40 + i * 64} x2={680} y2={40 + i * 64} stroke={LINE} strokeWidth={0.25} />
      ))}
    </g>
  );
}

/* -------------------------------------------------------------------------- */
/* Experiment layouts                                                          */
/* -------------------------------------------------------------------------- */

function Michelson() {
  return (
    <>
      <Grid />
      <Laser x={80} y={180} label="He–Ne 632.8 nm" />
      <Beam d="M 110 180 H 300" />
      <BeamSplitter x={300} y={180} />
      <Beam d="M 300 180 V 90 H 420" />
      <Mirror x={420} y={90} angle={0} />
      <Beam d="M 300 180 V 270 H 420" />
      <Mirror x={420} y={270} angle={0} />
      <Beam d="M 420 90 H 300" />
      <Beam d="M 420 270 H 300" dashed />
      <Beam d="M 300 180 H 470" />
      <Screen x={470} y={180} h={100} />
      <Label x={430} y={238} tone="muted" size={8} anchor="end">
        M1 (fixed)
      </Label>
      <Label x={430} y={140} tone="muted" size={8} anchor="end">
        M2 (scan)
      </Label>
      <Label x={300} y={146} tone="ink" size={8}>
        BS
      </Label>
      <Label x={366} y={68} tone="beam" size={8}>
        arm 2
      </Label>
      <Label x={366} y={300} tone="beam" size={8}>
        arm 1
      </Label>
      <Label x={510} y={180} tone="ink" size={8} anchor="start">
        Screen / camera
      </Label>
      <Dimensions x1={300} x2={470} y={320} label="L" />
      <Label x={600} y={60} tone="accent" size={8} anchor="start">
        2d = 2(L₂ − L₁)
      </Label>
      <Label x={600} y={76} tone="accent" size={8} anchor="start">
        I ∝ 1 + V cos(4πd/λ)
      </Label>
    </>
  );
}

function MachZehnder() {
  return (
    <>
      <Grid />
      <Laser x={70} y={250} label="Source" />
      <Beam d="M 100 250 H 240" />
      <BeamSplitter x={240} y={250} />
      <Beam d="M 240 250 V 130 H 420" />
      <Mirror x={420} y={130} angle={0} />
      <Beam d="M 240 250 H 420" />
      <Mirror x={420} y={250} angle={45} />
      <Beam d="M 420 250 V 130" />
      <BeamSplitter x={420} y={130} />
      <Beam d="M 420 130 H 560" />
      <Detector x={580} y={130} label="D1" />
      <Beam d="M 420 130 V 250 H 560" />
      <Detector x={580} y={250} label="D0" />
      <Label x={240} y={218} tone="ink" size={8}>
        BS1
      </Label>
      <Label x={420} y={102} tone="ink" size={8}>
        BS2
      </Label>
      <Label x={330} y={112} tone="beam" size={8}>
        path A
      </Label>
      <Label x={330} y={286} tone="beam" size={8}>
        path B
      </Label>
      <g transform="translate(340 190)">
        <rect x={-26} y={-12} width={52} height={24} fill={PAPER} stroke={LINE} strokeWidth={0.8} />
        <Label x={0} y={3} tone="accent" size={8}>
          φ A − φ B
        </Label>
      </g>
      <Label x={488} y={110} tone="muted" size={8} anchor="start">
        P ∝ cos²(Δφ/2)
      </Label>
    </>
  );
}

function BombTester() {
  return (
    <>
      <Grid />
      <Laser x={70} y={220} label="single photon" />
      <Beam d="M 100 220 H 220" />
      <BeamSplitter x={220} y={220} />
      <Beam d="M 220 220 V 120 H 390" />
      <Mirror x={390} y={120} angle={0} />
      <Beam d="M 220 220 H 390" />
      <Bomb x={300} y={220} live />
      <BeamSplitter x={390} y={120} />
      <Beam d="M 390 120 H 520" />
      <Detector x={545} y={120} label="D1" />
      <Beam d="M 390 120 V 250 H 520" />
      <Detector x={545} y={250} label="D0" />
      <Label x={300} y={262} tone="beam" size={8}>
        live bomb · lower arm
      </Label>
      <Label x={220} y={188} tone="ink" size={8}>
        BS1
      </Label>
      <Label x={390} y={92} tone="ink" size={8}>
        BS2
      </Label>
      <Label x={600} y={80} tone="accent" size={8} anchor="start">
        D0 click → live
      </Label>
      <Label x={600} y={96} tone="accent" size={8} anchor="start">
        no explosion
      </Label>
      <Label x={600} y={112} tone="muted" size={8} anchor="start">
        P = 1/4
      </Label>
      <Bomb x={600} y={160} live={false} />
      <Label x={620} y={164} tone="muted" size={8} anchor="start">
        dud
      </Label>
    </>
  );
}

function Bomb({ x, y, live }: { x: number; y: number; live: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-20} y={-16} width={40} height={32} fill={live ? "#F1DCD3" : GLASS} stroke={live ? BEAM : INK} strokeWidth={1} />
      <circle cx={0} cy={0} r={8} fill={live ? BEAM : "none"} stroke={INK} strokeWidth={0.8} opacity={live ? 0.9 : 0.4} />
      <path d="M 10 -16 Q 18 -24 12 -30" fill="none" stroke={live ? BEAM : MUTED} strokeWidth={1.2} />
      {!live ? <line x1={-16} y1={-12} x2={16} y2={12} stroke={MUTED} strokeWidth={1} /> : null}
    </g>
  );
}

function QuantumEraser() {
  return (
    <>
      <Grid />
      <Laser x={70} y={230} label="H-polarised" />
      <Beam d="M 100 230 H 200" />
      <BeamSplitter x={200} y={230} />
      <Beam d="M 200 230 V 120 H 330" />
      <Mirror x={330} y={120} angle={0} />
      <g transform="translate(270 120)">
        <rect x={-9} y={-18} width={18} height={36} fill={GLASS} stroke={INK} strokeWidth={0.8} />
        <Label x={0} y={-24} size={8}>
          λ/2@θ
        </Label>
      </g>
      <Beam d="M 200 230 H 330" />
      <g transform="translate(270 230)">
        <rect x={-9} y={-18} width={18} height={36} fill={GLASS} stroke={INK} strokeWidth={0.8} />
        <Label x={0} y={-24} size={8}>
          λ/2@0
        </Label>
      </g>
      <BeamSplitter x={330} y={120} />
      <Beam d="M 330 120 H 440" />
      <g transform="translate(380 120)">
        <rect x={-9} y={-18} width={18} height={36} fill={PAPER} stroke={INK} strokeWidth={0.8} />
        <Label x={0} y={-24} size={8}>
          analyser α
        </Label>
      </g>
      <Detector x={470} y={120} label="D1" />
      <Beam d="M 330 120 V 240 H 440" />
      <Detector x={470} y={240} label="D0" />
      <Label x={200} y={198} tone="ink" size={8}>
        BS1
      </Label>
      <Label x={330} y={92} tone="ink" size={8}>
        BS2
      </Label>
      <Label x={580} y={100} tone="accent" size={8} anchor="start">
        V = |⟨a|b⟩| = |cos θ|
      </Label>
      <Label x={580} y={116} tone="accent" size={8} anchor="start">
        D² + V² = 1
      </Label>
      <Label x={580} y={132} tone="muted" size={8} anchor="start">
        coincidence-gated
      </Label>
    </>
  );
}

function Polarization() {
  return (
    <>
      <Grid />
      <g transform="translate(150 170)">
        <line x1={0} y1={0} x2={60} y2={0} stroke={INK} strokeWidth={1.2} markerEnd="url(#arrow-ink)" />
        <line x1={0} y1={0} x2={0} y2={-60} stroke={INK} strokeWidth={1.2} markerEnd="url(#arrow-ink)" />
        <line x1={0} y1={0} x2={-34} y2={34} stroke={MUTED} strokeWidth={0.8} markerEnd="url(#arrow-muted)" />
        <Label x={66} y={4} tone="ink" size={8} anchor="start">
          x
        </Label>
        <Label x={-6} y={-66} tone="ink" size={8}>
          y
        </Label>
        <Label x={-42} y={42} tone="muted" size={8} anchor="end">
          z (k)
        </Label>
        <path d="M 46 0 A 46 46 0 0 1 0 -46" fill="none" stroke={BEAM} strokeWidth={1} />
        <path d="M 0 0 L 32 -32" stroke={BEAM} strokeWidth={1.6} />
        <Label x={40} y={-38} tone="beam" size={8} anchor="start">
          E(t)
        </Label>
      </g>
      <g transform="translate(330 170)">
        <rect x={-4} y={-52} width={8} height={104} fill={GLASS} stroke={INK} strokeWidth={1} />
        <line x1={-22} y1={-46} x2={22} y2={46} stroke={MUTED} strokeWidth={0.6} strokeDasharray="2 2" />
        <Label x={0} y={-62} size={8}>
          polariser 0°
        </Label>
      </g>
      <g transform="translate(470 170)">
        <rect x={-4} y={-52} width={8} height={104} fill={GLASS} stroke={INK} strokeWidth={1} />
        <line x1={-22} y1={46} x2={22} y2={-46} stroke={MUTED} strokeWidth={0.6} strokeDasharray="2 2" />
        <Label x={0} y={-62} size={8}>
          analyser θ
        </Label>
      </g>
      <Beam d="M 240 170 H 460" />
      <Beam d="M 474 170 H 560" width={2.2} />
      <Label x={520} y={156} tone="beam" size={8}>
        I = I₀cos²θ
      </Label>
      <Label x={520} y={196} tone="muted" size={8}>
        detector
      </Label>
      <Detector x={590} y={170} label="PD" />
      <g transform="translate(330 270)">
        <circle r={2} fill={ACCENT} />
        <Label x={0} y={14} tone="accent" size={8}>
          Jones vector
        </Label>
      </g>
    </>
  );
}

function Poincare() {
  const cx = 360;
  const cy = 160;
  const r = 105;
  return (
    <>
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.34} fill="none" stroke={LINE} strokeWidth={0.9} />
        <ellipse cx={cx} cy={cy} rx={r * 0.34} ry={r} fill="none" stroke={LINE} strokeWidth={0.9} strokeDasharray="3 3" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={1} />
        <line x1={cx - r - 20} y1={cy} x2={cx + r + 20} y2={cy} stroke={MUTED} strokeWidth={0.7} />
        <line x1={cx} y1={cy - r - 20} x2={cx} y2={cy + r + 20} stroke={MUTED} strokeWidth={0.7} />
        <line x1={cx - r * 0.7} y1={cy + r * 0.7} x2={cx + r * 0.7} y2={cy - r * 0.7} stroke={MUTED} strokeWidth={0.7} />
        <Label x={cx + r + 26} y={cy + 3} size={8}>
          S₁
        </Label>
        <Label x={cx + 4} y={cy - r - 24} size={8} anchor="start">
          S₃
        </Label>
        <Label x={cx + r * 0.72} y={cy - r * 0.72} size={8} anchor="start">
          S₂
        </Label>
        <Label x={cx - r - 24} y={cy + 16} size={8} anchor="end">
          |L⟩
        </Label>
        <Label x={cx + r + 12} y={cy + 16} size={8} anchor="start">
          |R⟩
        </Label>
        <Label x={cx + 10} y={cy - r + 2} size={8} anchor="start">
          |H⟩
        </Label>
        <Label x={cx - 10} y={cy + r + 12} size={8} anchor="end">
          |V⟩
        </Label>
        <Label x={cx - r * 0.72 - 10} y={cy + r * 0.72} size={8} anchor="end">
          |D⟩
        </Label>
        <Label x={cx + r * 0.72 - 10} y={cy + r * 0.72} size={8} anchor="end">
          |A⟩
        </Label>
        {[
          [cx + r, cy, "H"],
          [cx - r, cy, "V"],
          [cx, cy - r, "R"],
          [cx, cy + r, "L"]
        ].map(([x, y, k]) => (
          <circle key={String(k)} cx={Number(x)} cy={Number(y)} r={2.5} fill={ACCENT} />
        ))}
        <line x1={cx} y1={cy} x2={cx + 52} y2={cy - 62} stroke={BEAM} strokeWidth={1.4} />
        <circle cx={cx + 52} cy={cy - 62} r={4} fill={BEAM} />
        <Label x={cx + 64} y={cy - 64} tone="beam" size={8} anchor="start">
          state
        </Label>
        <ellipse cx={cx} cy={cy} rx={14} ry={5} fill="none" stroke={BEAM} strokeWidth={1} transform={`rotate(-50 ${cx} ${cy})`} />
      </g>
    </>
  );
}

function Fourier4f() {
  return (
    <>
      <Grid />
      <Label x={70} y={70} tone="ink" size={8} anchor="start">
        OBJECT
      </Label>
      <g transform="translate(90 170)">
        <rect x={-20} y={-35} width={40} height={70} fill={GLASS} stroke={INK} strokeWidth={1} />
        <line x1={-10} y1={-25} x2={-10} y2={25} stroke={INK} strokeWidth={2} />
        <line x1={2} y1={-25} x2={2} y2={25} stroke={INK} strokeWidth={2} />
        <line x1={12} y1={-25} x2={12} y2={25} stroke={INK} strokeWidth={2} />
      </g>
      <Beam d="M 110 170 H 240" />
      <Lens x={250} y={170} height={84} />
      <Label x={250} y={105} tone="ink" size={8}>
        L₁ f₁
      </Label>
      <Beam d="M 260 170 L 390 130" />
      <Beam d="M 260 170 L 390 210" />
      <Beam d="M 260 170 H 390" />
      <g transform="translate(390 170)">
        <rect x={-4} y={-58} width={8} height={116} fill={PAPER} stroke={INK} strokeWidth={1} />
        <rect x={-4} y={-58} width={8} height={30} fill={INK} opacity={0.75} />
        <rect x={-4} y={28} width={8} height={30} fill={INK} opacity={0.75} />
        <Label x={0} y={-68} tone="ink" size={8}>
          Fourier plane
        </Label>
        <Label x={0} y={82} tone="muted" size={8}>
          spatial filter
        </Label>
      </g>
      <Beam d="M 394 130 L 520 170" />
      <Beam d="M 394 210 L 520 170" />
      <Lens x={530} y={170} height={84} flip />
      <Label x={530} y={105} tone="ink" size={8}>
        L₂ f₂
      </Label>
      <Beam d="M 540 170 H 610" />
      <g transform="translate(640 170)">
        <rect x={-26} y={-40} width={52} height={80} fill={GLASS} stroke={INK} strokeWidth={1} />
        <line x1={-14} y1={-28} x2={-14} y2={28} stroke={INK} strokeWidth={2} />
        <line x1={2} y1={-28} x2={2} y2={28} stroke={INK} strokeWidth={1} opacity={0.5} />
        <line x1={12} y1={-28} x2={12} y2={28} stroke={INK} strokeWidth={1} opacity={0.5} />
        <Label x={0} y={-50} tone="ink" size={8}>
          IMAGE
        </Label>
      </g>
      <Label x={390} y={278} tone="accent" size={8}>
        E_f(u,v) = ℱ&#123;E_o(x,y)&#125; · H(u,v)
      </Label>
      <Label x={390} y={294} tone="muted" size={8}>
        f_u = x / (λ f)
      </Label>
    </>
  );
}

function QkdBb84() {
  return (
    <>
      <Grid />
      <g transform="translate(90 160)">
        <circle r={30} fill={PAPER} stroke={INK} strokeWidth={1} />
        <Label x={0} y={4} tone="ink" size={9}>
          ALICE
        </Label>
        <Label x={0} y={48} size={8}>
          bits + bases
        </Label>
      </g>
      <g transform="translate(360 160)">
        <rect x={-38} y={-32} width={76} height={64} fill={PAPER} stroke={BEAM} strokeWidth={1} strokeDasharray="3 2" />
        <Label x={0} y={-4} tone="beam" size={9}>
          EVE
        </Label>
        <Label x={0} y={10} size={8}>
          intercept
        </Label>
        <Label x={0} y={22} size={8}>
          resend
        </Label>
      </g>
      <g transform="translate(620 160)">
        <circle r={30} fill={PAPER} stroke={INK} strokeWidth={1} />
        <Label x={0} y={4} tone="ink" size={9}>
          BOB
        </Label>
        <Label x={0} y={48} size={8}>
          bases + results
        </Label>
      </g>
      <Beam d="M 122 150 H 320" width={1.6} />
      <Beam d="M 400 150 H 588" width={1.6} />
      <Label x={220} y={140} tone="beam" size={8}>
        quantum channel
      </Label>
      <g transform="translate(220 240)">
        {["0°", "90°", "45°", "135°"].map((b, i) => (
          <g key={b} transform={`translate(${i * 42} 0)`}>
            <line x1={-10} y1={0} x2={10} y2={0} stroke={INK} strokeWidth={1.5} transform={`rotate(${[0, 90, 45, 135][i]} 0 0)`} />
            <Label x={0} y={20} size={7}>
              {b}
            </Label>
          </g>
        ))}
        <Label x={78} y={0} size={8} anchor="start">
          Z basis · X basis
        </Label>
      </g>
      <Label x={470} y={240} tone="accent" size={8}>
        QBER ≈ 25% × P(Eve)
      </Label>
      <Label x={470} y={256} tone="muted" size={8}>
        threshold 11%
      </Label>
    </>
  );
}

function Tweezers() {
  return (
    <>
      <Grid />
      <Laser x={80} y={70} label="1064 nm" />
      <Beam d="M 110 70 H 190" />
      <g transform="translate(200 70)">
        <rect x={-8} y={-16} width={16} height={32} fill={GLASS} stroke={INK} strokeWidth={1} />
        <Label x={0} y={-24} size={8}>
          expander
        </Label>
      </g>
      <Beam d="M 208 70 H 300" />
      <g transform="translate(310 70)">
        <rect x={-16} y={-8} width={32} height={16} fill={GLASS} stroke={INK} strokeWidth={1} transform="rotate(45)" />
        <Label x={0} y={-22} size={8}>
          dichroic
        </Label>
      </g>
      <Beam d="M 330 70 H 420 V 130" />
      <g transform="translate(420 145)">
        <path d="M -26 -14 L 26 -14 L 8 14 L -8 14 Z" fill={GLASS} stroke={INK} strokeWidth={1} />
        <Label x={0} y={-24} size={8}>
          objective NA 1.2
        </Label>
      </g>
      <Beam d="M 420 160 L 420 220" width={1} />
      <path d="M 400 160 L 420 215 L 440 160" fill="none" stroke={BEAM} strokeWidth={0.8} opacity={0.6} />
      <g transform="translate(420 228)">
        <circle r={7} fill={ACCENT} opacity={0.85} />
        <Label x={0} y={24} tone="accent" size={8}>
          trapped bead
        </Label>
      </g>
      <g transform="translate(420 270)">
        <rect x={-90} y={-6} width={180} height={12} fill={GLASS} stroke={INK} strokeWidth={1} />
        <Label x={0} y={24} size={8}>
          sample stage / coverslip
        </Label>
      </g>
      <g transform="translate(560 70)">
        <rect x={-22} y={-22} width={44} height={40} fill={PAPER} stroke={INK} strokeWidth={1} />
        <circle cx={0} cy={-2} r={8} fill="none" stroke={INK} strokeWidth={1} />
        <Label x={0} y={34} size={8}>
          camera
        </Label>
      </g>
      <Beam d="M 460 220 L 540 120" dashed width={0.8} />
      <Label x={560} y={140} size={8} anchor="start">
        bright-field
      </Label>
      <Label x={560} y={156} size={8} anchor="start">
        illumination
      </Label>
      <Label x={170} y={300} tone="accent" size={8} anchor="start">
        F_grad = (n_m α / 2c) ∇I
      </Label>
      <Label x={170} y={316} tone="muted" size={8} anchor="start">
        a ≪ λ · Rayleigh regime
      </Label>
    </>
  );
}

function GaussianBeam() {
  return (
    <>
      <Grid />
      <Line />
      <path
        d="M 100 160 C 240 90, 300 118, 360 118 C 420 118, 480 90, 620 160"
        fill="none"
        stroke={BEAM}
        strokeWidth={1.2}
      />
      <path
        d="M 100 160 C 240 230, 300 202, 360 202 C 420 202, 480 230, 620 160"
        fill="none"
        stroke={BEAM}
        strokeWidth={1.2}
      />
      <line x1={360} y1={110} x2={360} y2={210} stroke={ACCENT} strokeWidth={1} />
      <line x1={360} y1={160} x2={360} y2={200} stroke={ACCENT} strokeWidth={2} />
      <line x1={100} y1={160} x2={620} y2={160} stroke={MUTED} strokeWidth={0.7} strokeDasharray="4 3" />
      <Label x={360} y={222} tone="accent" size={8}>
        2w₀
      </Label>
      <Label x={300} y={100} tone="ink" size={8} anchor="start">
        beam envelope w(z)
      </Label>
      <Dimensions x1={360} x2={270} y={280} label="z_R" />
      <Dimensions x1={270} x2={100} y={280} label="" />
      <Label x={215} y={265} size={8}>
        Rayleigh range
      </Label>
      <Label x={560} y={264} tone="muted" size={8}>
        w(z) = w₀√(1+(z/z_R)²)
      </Label>
    </>
  );
}

function Line() {
  return <line x1={100} y1={160} x2={620} y2={160} stroke={LINE} strokeWidth={0.5} />;
}

function Coherence() {
  return (
    <>
      <Grid />
      <Label x={60} y={56} tone="ink" size={8} anchor="start">
        LONG COHERENCE LENGTH
      </Label>
      {Array.from({ length: 5 }).map((_, k) => (
        <path
          key={k}
          d={`M 60 ${90 + k * 16} ${Array.from({ length: 60 })
            .map((_, i) => `L ${60 + i * 9} ${90 + k * 16 + Math.sin(i * 0.8 + k * 0.45) * 5}`)
            .join(" ")}`}
          fill="none"
          stroke={k === 0 ? BEAM : LINE}
          strokeWidth={k === 0 ? 1.3 : 0.8}
        />
      ))}
      <line x1={60} y1={196} x2={640} y2={196} stroke={LINE} strokeWidth={0.5} />
      <Label x={60} y={222} tone="ink" size={8} anchor="start">
        SHORT COHERENCE LENGTH
      </Label>
      {Array.from({ length: 5 }).map((_, k) => (
        <path
          key={k}
          d={`M 60 ${250 + k * 10} ${Array.from({ length: 60 })
            .map((_, i) => {
              const phase = ((i * 9) / 34) * Math.PI * 2 + k * 1.3;
              const env = Math.exp(-(((i - 30) / 16) ** 2));
              return `L ${60 + i * 9} ${250 + k * 10 + Math.sin(phase) * 4.5 * env}`;
            })
            .join(" ")}`}
          fill="none"
          stroke={k === 0 ? BEAM : LINE}
          strokeWidth={k === 0 ? 1.2 : 0.7}
          opacity={0.55 + 0.45 * Math.exp(-(((k - 2) / 2.5) ** 2))}
        />
      ))}
      <Label x={640} y={300} tone="muted" size={8} anchor="end">
        Δt
      </Label>
    </>
  );
}

function BeamSplitterDiagram() {
  return (
    <>
      <Grid />
      <g transform="translate(340 160)">
        <rect x={-44} y={-44} width={88} height={88} fill="rgba(255,255,255,0.5)" stroke={INK} strokeWidth={1} />
        <line x1={-44} y1={44} x2={44} y2={-44} stroke={INK} strokeWidth={0.9} strokeDasharray="4 3" />
        <Label x={0} y={-56} tone="ink" size={8}>
          50:50 dielectric
        </Label>
      </g>
      <Beam d="M 120 160 H 296" width={1.8} />
      <Beam d="M 384 160 H 560" width={1.2} />
      <Beam d="M 340 204 V 290" width={1.2} />
      <g transform="translate(96 160)">
        <Label x={0} y={-12} size={8} anchor="start">
          E_in
        </Label>
      </g>
      <Label x={420} y={150} size={8}>
        transmitted · t
      </Label>
      <Label x={352} y={262} size={8} anchor="start">
        reflected · i r
      </Label>
      <Label x={470} y={220} tone="accent" size={8}>
        |t|² + |r|² = 1
      </Label>
      <Label x={470} y={236} tone="muted" size={8}>
        unitary: B†B = 1
      </Label>
      <path d="M 390 200 Q 430 218 460 206" fill="none" stroke={LINE} strokeWidth={0.8} markerEnd="url(#arrow-muted)" />
    </>
  );
}

function Waveplate() {
  return (
    <>
      <Grid />
      <g transform="translate(300 160)">
        <rect x={-12} y={-70} width={24} height={140} fill={GLASS} stroke={INK} strokeWidth={1} />
        <line x1={0} y1={-70} x2={0} y2={70} stroke={ACCENT} strokeWidth={1} strokeDasharray="4 3" />
        <line x1={-12} y1={-40} x2={12} y2={-40} stroke={BEAM} strokeWidth={1.4} />
        <circle cx={0} cy={-40} r={3} fill={BEAM} />
        <Label x={-22} y={-76} tone="accent" size={8} anchor="end">
          slow axis
        </Label>
        <Label x={22} y={-44} tone="beam" size={8} anchor="start">
          fast
        </Label>
      </g>
      <Beam d="M 100 200 H 288" width={1.8} />
      <Beam d="M 312 200 H 520" width={1.8} />
      <path d="M 312 200 C 360 170 400 230 450 200 S 500 170 520 200" fill="none" stroke={BEAM} strokeWidth={0.7} opacity={0.5} />
      <Label x={110} y={190} size={8} anchor="start">
        input E
      </Label>
      <Label x={540} y={200} size={8} anchor="start">
        output
      </Label>
      <Label x={300} y={270} tone="accent" size={8}>
        δ = 2πΔn d / λ
      </Label>
      <Label x={560} y={270} tone="muted" size={8} anchor="end">
        λ/4: 90° · λ/2: 180°
      </Label>
    </>
  );
}

function OpticalTable() {
  const holes = [];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 16; x++) {
      holes.push(<circle key={`${x}-${y}`} cx={70 + x * 38} cy={90 + y * 34} r={1.6} fill={LINE} />);
    }
  }
  return (
    <>
      <rect x={50} y={70} width={620} height={220} fill="#EFEBE2" stroke={INK} strokeWidth={1} />
      {holes}
      <g transform="translate(130 160)">
        <rect x={-18} y={30} width={36} height={12} fill={GLASS} stroke={INK} strokeWidth={1} />
        <rect x={-4} y={-20} width={8} height={50} fill={GLASS} stroke={INK} strokeWidth={1} />
        <circle cx={0} cy={-26} r={13} fill={PAPER} stroke={INK} strokeWidth={1} />
        <Label x={0} y={-46} size={8}>
          post + mount
        </Label>
      </g>
      <g transform="translate(320 200)">
        <rect x={-30} y={-8} width={60} height={16} fill={GLASS} stroke={INK} strokeWidth={1} />
        <Label x={0} y={-20} size={8}>
          translation stage
        </Label>
        <Label x={0} y={28} size={8}>
          25 mm travel
        </Label>
      </g>
      <g transform="translate(520 150)">
        <rect x={-36} y={-26} width={73} height={52} fill={PAPER} stroke={INK} strokeWidth={1} />
        <rect x={-30} y={-20} width={22} height={40} fill={BEAM} opacity={0.15} />
        <Label x={0} y={-38} size={8}>
          iris
        </Label>
      </g>
      <Label x={360} y={318} tone="muted" size={8}>
        25 mm hole grid · M6 mounting
      </Label>
      <Label x={360} y={40} tone="ink" size={8}>
        BEAM HEIGHT 100 mm
      </Label>
    </>
  );
}

function DetectionChain() {
  return (
    <>
      <Grid />
      <g transform="translate(90 160)">
        <circle r={26} fill={GLASS} stroke={INK} strokeWidth={1} />
        <path d="M -12 0 H 12 M 0 -12 V 12" stroke={INK} strokeWidth={0.8} />
        <Label x={0} y={46} size={8}>
          photodiode
        </Label>
      </g>
      <Beam d="M 116 160 H 170" width={1.5} />
      <g transform="translate(210 160)">
        <rect x={-22} y={-30} width={44} height={60} fill={GLASS} stroke={INK} strokeWidth={1} />
        <path d="M -12 12 L 4 12 L 4 -12 L 12 -12" fill="none" stroke={INK} strokeWidth={1} />
        <Label x={0} y={48} size={8}>
          TIA
        </Label>
      </g>
      <line x1={232} y1={160} x2={300} y2={160} stroke={INK} strokeWidth={1} />
      <g transform="translate(350 160)">
        <rect x={-44} y={-40} width={88} height={80} fill={PAPER} stroke={INK} strokeWidth={1} />
        <path d="M -34 10 L -22 10 L -16 -18 L -8 30 L 0 10 L 12 10 L 16 -8 L 22 10 L 34 10" fill="none" stroke={BEAM} strokeWidth={1.2} />
        <Label x={0} y={58} size={8}>
          oscilloscope
        </Label>
      </g>
      <Label x={350} y={96} tone="ink" size={8}>
        50 Ω · 20 MHz BW
      </Label>
      <g transform="translate(540 160)">
        <rect x={-36} y={-28} width={72} height={56} fill={PAPER} stroke={INK} strokeWidth={1} />
        <path d="M -24 12 L -18 12 L -12 -6 L -6 18 L 0 2 L 6 2 L 12 -12 L 18 12 L 24 12" fill="none" stroke={ACCENT} strokeWidth={1} />
        <Label x={0} y={46} size={8}>
          ADC / DAQ
        </Label>
      </g>
      <line x1={394} y1={160} x2={504} y2={160} stroke={INK} strokeWidth={1} strokeDasharray="3 2" />
      <Label x={360} y={300} tone="muted" size={8}>
        optical power → photocurrent → voltage → digital counts
      </Label>
    </>
  );
}

const MAP: Record<DiagramKind, () => React.JSX.Element> = {
  michelson: Michelson,
  "michelson-fringes": Michelson,
  "mach-zehnder": MachZehnder,
  "bomb-tester": BombTester,
  "quantum-eraser": QuantumEraser,
  polarization: Polarization,
  poincare: Poincare,
  "fourier-4f": Fourier4f,
  "qkd-bb84": QkdBb84,
  tweezers: Tweezers,
  "gaussian-beam": GaussianBeam,
  coherence: Coherence,
  "beam-splitter": BeamSplitterDiagram,
  waveplate: Waveplate,
  "optical-table": OpticalTable,
  "detection-chain": DetectionChain
};

export function OpticalDiagram({
  kind,
  className = "",
  height
}: {
  kind: DiagramKind;
  className?: string;
  height?: number;
}) {
  const Content = MAP[kind];
  return (
    <svg
      viewBox="0 0 720 340"
      className={`h-auto w-full ${className}`}
      style={height ? { height, width: "100%" } : undefined}
      role="img"
      aria-label={`Schematic optical layout: ${kind.replace(/-/g, " ")}`}
    >
      <defs>
        <marker id="arrow-ink" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
        </marker>
        <marker id="arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={MUTED} />
        </marker>
      </defs>
      <rect width="720" height="340" fill={PAPER} />
      <Content />
    </svg>
  );
}
