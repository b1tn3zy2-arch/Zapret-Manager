export default function NoiseOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-9999 opacity-[0.03] mix-blend-overlay"
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <filter id="zapret-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={4}
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#zapret-noise)" />
      </svg>
    </div>
  );
}
