// A miniature human office worker (SVG). Appearance varies by seed;
// motion class comes from the agent's real status.
const HAIR = ["#2b2118", "#4a2f1d", "#151312", "#6b4a2a", "#3a3a3f", "#7a2e2e"];
const SHIRT = ["#b45309", "#374151", "#7c2d12", "#1f2937", "#854d0e", "#44403c"];
const SKIN = ["#f1c27d", "#e0ac69", "#c68642", "#8d5524", "#ffdbac"];

export default function Character({
  seed,
  status,
  paper = false,
}: {
  seed: number;
  status: "working" | "waiting" | "idle" | "offline";
  paper?: boolean;
}) {
  const hair = HAIR[seed % HAIR.length];
  const shirt = SHIRT[seed % SHIRT.length];
  const skin = SKIN[seed % SKIN.length];
  const cls =
    status === "working"
      ? "char-working"
      : status === "idle"
        ? "char-idle"
        : status === "waiting"
          ? "char-waiting"
          : "char-offline";
  return (
    <g className={cls}>
      {/* legs */}
      <rect x="-11" y="34" width="8" height="16" rx="3" fill="#1f2937" />
      <rect x="3" y="34" width="8" height="16" rx="3" fill="#111827" />
      {/* body */}
      <rect x="-15" y="6" width="30" height="32" rx="9" fill={shirt} />
      {/* arms */}
      <rect x="-19" y="10" width="6" height="20" rx="3" fill={shirt} />
      <rect x="13" y="10" width="6" height="20" rx="3" fill={shirt} />
      {paper && <rect x="14" y="16" width="13" height="17" rx="1.5" fill="#e7e5e4" />}
      {/* head */}
      <circle cx="0" cy="-8" r="13" fill={skin} />
      {/* hair */}
      <path d="M -13 -10 A 13 13 0 0 1 13 -10 L 13 -13 A 13 10 0 0 0 -13 -13 Z" fill={hair} />
      {/* eyes */}
      <circle cx="-4.5" cy="-7" r="1.4" fill="#1c1917" />
      <circle cx="4.5" cy="-7" r="1.4" fill="#1c1917" />
    </g>
  );
}
