import { RARITY_ORDER, getRarityLabel } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { CollectionSummary } from "@/types";

export interface CollectionStatsProps {
  summary: CollectionSummary;
}

const DOT_CLASSES = {
  common: "bg-text-tertiary",
  rare: "bg-sky-400",
  epic: "bg-purple-400",
  legendary: "bg-accent-warning",
} as const;

function CollectionStats({ summary }: CollectionStatsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-text-secondary border-glass-border bg-glass-bg inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium">
        Всего
        <span className="text-text-primary tabular-nums">{summary.total}</span>
      </span>

      {RARITY_ORDER.map((rarity) => (
        <span
          key={rarity}
          className="text-text-tertiary border-glass-border inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
        >
          <span
            aria-hidden="true"
            className={cn("size-1.5 rounded-full", DOT_CLASSES[rarity])}
          />
          {getRarityLabel(rarity)}
          <span className="text-text-primary tabular-nums">
            {summary[rarity]}
          </span>
        </span>
      ))}
    </div>
  );
}

export default CollectionStats;
