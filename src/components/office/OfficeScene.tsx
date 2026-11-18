import type { Agent } from "@/lib/office-types";
import Character from "./Character";
import Owl from "./Owl";

// Isometric-style office scene (SVG). Placement follows status:
// working/idle agents sit at their desks, a waiting agent stands by the
// supervisor's platform holding the paper that waits for approval.
const DESKS: Array<{ x: number; y: number }> = [
  { x: 246, y: 372 },
  { x: 408, y: 322 },
  { x: 548, y: 398 },
  { x: 340, y: 466 },
];

function Desk({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* top */}
      <polygon points="-52,10 -14,-12 52,-12 16,10" fill="#3a2a18" />
      {/* front */}
      <polygon points="-52,10 16,10 16,26 -52,26" fill="#241a10" />
      {/* laptop */}
      <g transform="translate(-6 -16)">
        <rect x="-11" y="-8" width="22" height="15" rx="2" fill="#0c0a08" stroke="#f59e0b" strokeOpacity="0.5" />
        <rect x="-14" y="7" width="28" height="4" rx="2" fill="#171310" />
      </g>
      {/* mug */}
      <rect x="18" y="-12" width="7" height="8" rx="1.5" fill="#e7e5e4" opacity="0.85" />
    </g>
  );
}

export default function OfficeScene({ agents }: { agents: Agent[] }) {
  const seated = agents.filter(
    (a) => a.desk >= 0 && (a.status === "working" || a.status === "idle" || a.status === "offline"),
  );
  const standing = agents.filter((a) => a.status === "waiting");

  return (
    <svg viewBox="0 0 800 560" className="h-auto w-full" role="img" aria-label="Your AI office">
      {/* glow */}
      <ellipse cx="400" cy="290" rx="330" ry="215" fill="#f59e0b" opacity="0.09" />
      {/* walls */}
      <polygon points="400,36 108,168 108,398 400,268" fill="#20160b" />
      <polygon points="400,36 692,168 692,398 400,268" fill="#191106" />
      {/* floor */}
      <polygon points="400,268 692,398 400,532 108,398" fill="#261b0f" />
      <g stroke="#3a2a15" strokeWidth="1">
        <line x1="254" y1="333" x2="546" y2="467" />
        <line x1="546" y1="333" x2="254" y2="467" />
        <line x1="400" y1="268" x2="400" y2="532" />
      </g>
      {/* big screen on the left wall */}
      <g>
        <polygon points="176,196 344,124 344,232 176,300" fill="#0b0805" stroke="#92600f" strokeWidth="2" />
        <polyline
          points="196,262 232,238 262,246 292,206 322,188"
          fill="none"
          stroke="#f5b544"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <g fill="#f5b544">
          <circle cx="196" cy="262" r="3.4" />
          <circle cx="232" cy="238" r="3.4" />
          <circle cx="262" cy="246" r="3.4" />
          <circle cx="292" cy="206" r="3.4" />
          <circle cx="322" cy="188" r="3.4" />
        </g>
        <text x="196" y="182" fill="#a8a29e" fontSize="10.5" fontFamily="monospace">
          TEAM HEALTH
        </text>
      </g>
      {/* shelves on the right wall */}
      <g fill="#2a1f11">
        <rect x="566" y="196" width="86" height="8" transform="skewY(14)" />
        <rect x="566" y="238" width="86" height="8" transform="skewY(14)" />
      </g>
      <g>
        <rect x="578" y="170" width="20" height="24" fill="#4a3517" />
        <rect x="602" y="176" width="16" height="24" fill="#5b4423" />
        <rect x="584" y="214" width="24" height="22" fill="#3a2a18" />
        <rect x="612" y="220" width="14" height="22" fill="#2f2312" />
      </g>
      {/* hanging lamps */}
      <g>
        <line x1="238" y1="96" x2="238" y2="140" stroke="#3f3f46" strokeWidth="2" />
        <circle cx="238" cy="148" r="7" fill="#fbbf24" />
        <circle cx="238" cy="148" r="16" fill="#fbbf24" opacity="0.14" />
        <line x1="566" y1="96" x2="566" y2="140" stroke="#3f3f46" strokeWidth="2" />
        <circle cx="566" cy="148" r="7" fill="#fbbf24" />
        <circle cx="566" cy="148" r="16" fill="#fbbf24" opacity="0.14" />
      </g>
      {/* supervisor platform + Bantay */}
      <g transform="translate(404 256)">
        <polygon points="-56,16 0,2 56,16 0,30" fill="#2a1f11" />
        <polygon points="-56,16 0,30 0,38 -56,24" fill="#1a1208" />
        <g transform="translate(0 -30) scale(1.3)">
          <Owl />
        </g>
      </g>
      {/* meeting table */}
      <g transform="translate(592 322)">
        <polygon points="-58,12 0,-10 58,12 0,32" fill="#332613" />
        <polygon points="-58,12 0,32 0,42 -58,22" fill="#20180c" />
        <rect x="-16" y="-4" width="7" height="8" rx="1.5" fill="#e7e5e4" opacity="0.85" />
        <rect x="10" y="0" width="7" height="8" rx="1.5" fill="#d6d3d1" opacity="0.7" />
      </g>
      {/* seated agents: character behind desk, desk front occludes legs */}
      {seated.map((a) => {
        const d = DESKS[a.desk];
        return (
          <g key={a.id}>
            <g transform={`translate(${d.x} ${d.y - 40}) scale(1.35)`}>
              <Character seed={a.name.length + a.desk} status={a.status} />
            </g>
            <Desk x={d.x} y={d.y} />
            <text
              x={d.x}
              y={d.y + 44}
              textAnchor="middle"
              fill="#d6d3d1"
              fontSize="12.5"
              fontWeight="600"
            >
              {a.name}
            </text>
          </g>
        );
      })}
      {/* waiting agents stand by the platform, paper in hand */}
      {standing.map((a, i) => (
        <g key={a.id} transform={`translate(${486 + i * 54} ${282 + i * 12}) scale(1.3)`}>
          <Character seed={a.name.length + 3} status={a.status} paper />
          <text x="0" y="66" textAnchor="middle" fill="#d6d3d1" fontSize="12.5" fontWeight="600">
            {a.name}
          </text>
        </g>
      ))}
      {/* sofa corner */}
      <g transform="translate(636 452)">
        <polygon points="-52,8 0,-8 52,8 0,24" fill="#26201a" />
        <polygon points="-52,8 0,24 0,34 -52,18" fill="#171310" />
        <rect x="-30" y="-4" width="16" height="10" rx="3" fill="#3f3a33" transform="skewX(-14)" />
        <rect x="6" y="-2" width="16" height="10" rx="3" fill="#3f3a33" transform="skewX(-14)" />
      </g>
    </svg>
  );
}
