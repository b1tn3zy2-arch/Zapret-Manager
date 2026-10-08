import { Star } from "lucide-react";

import { getRarityColor, getRarityLabel } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import { RARITY_STARS, type Rarity } from "@/types";

export interface RarityBadgeProps {
  rarity: Rarity;
  compact?: boolean;
}

function RarityBadge({ rarity, compact = false }: RarityBadgeProps) {
  const palette = getRarityColor(rarity);
  const stars = RARITY_STARS[rarity];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
        compact ? "text-[10px]" : "text-xs"
      )}
      style={{
        color: palette.solid,
        border: `1px solid ${palette.border}`,
        backgroundColor: palette.glow,
      }}
    >
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: stars }, (_, index) => (
          <Star key={index} className="size-2.5 fill-current" />
        ))}
      </span>
      {getRarityLabel(rarity)}
    </span>
  );
}

export default RarityBadge;
