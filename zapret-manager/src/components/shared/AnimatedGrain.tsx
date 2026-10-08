import {
  GRAIN_TURBULENCE_FREQUENCY,
  GRAIN_TURBULENCE_OCTAVES,
} from "@/lib/constants";

const GRAIN_FILTER_ID = "zapret-grain";
const GRAIN_SEEDS = [7, 23, 61] as const;

export interface AnimatedGrainProps {
  opacity: number;
}

function AnimatedGrain({ opacity }: AnimatedGrainProps) {
  if (opacity <= 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{ opacity }}
    >
      <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {GRAIN_SEEDS.map((seed) => (
            <filter
              key={seed}
              id={`${GRAIN_FILTER_ID}-${seed}`}
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={GRAIN_TURBULENCE_FREQUENCY}
                numOctaves={GRAIN_TURBULENCE_OCTAVES}
                seed={seed}
                stitchTiles="stitch"
              />
            </filter>
          ))}
        </defs>
        {GRAIN_SEEDS.map((seed, index) => (
          <rect
            key={seed}
            className={`zapret-grain-frame-${index + 1}`}
            width="100%"
            height="100%"
            filter={`url(#${GRAIN_FILTER_ID}-${seed})`}
          />
        ))}
      </svg>
    </div>
  );
}

export default AnimatedGrain;
