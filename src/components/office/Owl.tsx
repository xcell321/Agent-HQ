// Bantay the owl — the supervisor. The one non-human in the office.
export default function Owl() {
  return (
    <g>
      <ellipse cx="0" cy="34" rx="20" ry="5" fill="#000" opacity="0.35" />
      {/* body */}
      <path d="M -17 32 C -19 6 -12 -14 0 -14 C 12 -14 19 6 17 32 C 8 37 -8 37 -17 32 Z" fill="#8a6844" />
      <path d="M -11 32 C -12 14 -8 2 0 2 C 8 2 12 14 11 32 C 6 34 -6 34 -11 32 Z" fill="#c9a876" />
      {/* ear tufts */}
      <path d="M -14 -12 L -8 -20 L -4 -12 Z" fill="#8a6844" />
      <path d="M 14 -12 L 8 -20 L 4 -12 Z" fill="#8a6844" />
      {/* eyes */}
      <circle cx="-6.5" cy="-4" r="5.4" fill="#f5f0e6" />
      <circle cx="6.5" cy="-4" r="5.4" fill="#f5f0e6" />
      <circle cx="-6.5" cy="-4" r="2.6" fill="#1c1917" />
      <circle cx="6.5" cy="-4" r="2.6" fill="#1c1917" />
      {/* beak */}
      <path d="M -3 1 L 3 1 L 0 5.5 Z" fill="#f59e0b" />
      {/* feet */}
      <path d="M -8 34 l -3 3 M -8 34 l 0 3.4 M -8 34 l 3 3" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M 8 34 l -3 3 M 8 34 l 0 3.4 M 8 34 l 3 3" stroke="#f59e0b" strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}
