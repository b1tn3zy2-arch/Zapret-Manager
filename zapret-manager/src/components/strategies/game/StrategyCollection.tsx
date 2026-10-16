import CardEntrance from "@/components/shared/CardEntrance";
import StrategyCard from "@/components/strategies/StrategyCard";
import { StrategyGameCardItem } from "@/components/strategies/game/StrategyGameCard";
import { usePostProcessing } from "@/contexts/postProcessing";
import { MOTION_BLUR_MAX_PX } from "@/lib/postProcessingTokens";
import type { Strategy, StrategyCard as Card, ViewMode } from "@/types";

export interface StrategyCollectionProps {
  cards: Card[];
  viewMode: ViewMode;
  flippedId: string | null;
  tiltDisabled: boolean;
  particlesDisabled: boolean;
  motionDisabled: boolean;
  onFlip: (id: string) => void;
  onRun: (strategy: Strategy) => void;
  onStop: (strategy: Strategy) => void;
  onOpenFolder: () => void;
}

function StrategyCollection({
  cards,
  viewMode,
  flippedId,
  tiltDisabled,
  particlesDisabled,
  motionDisabled,
  onFlip,
  onRun,
  onStop,
  onOpenFolder,
}: StrategyCollectionProps) {
  const { motionBlur, intensity } = usePostProcessing();
  const blurPx = motionBlur ? MOTION_BLUR_MAX_PX[intensity] * 2 : 0;

  if (cards.length === 0) {
    return null;
  }

  if (viewMode === "list") {
    return (
      <div className="cards-container strategy-list-grid">
        {cards.map((card) => (
          <StrategyCard
            key={card.strategy.id}
            strategy={card.strategy}
            onRun={onRun}
            onStop={onStop}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="cards-container card-grid">
      {cards.map((card, index) => (
        <CardEntrance
          key={card.strategy.id}
          index={index}
          maxDelaySeconds={0.5}
          blurPx={blurPx}
          disabled={motionDisabled}
        >
          <StrategyGameCardItem
            card={card}
            flipped={flippedId === card.strategy.id}
            tiltDisabled={tiltDisabled}
            particlesDisabled={particlesDisabled}
            motionDisabled={motionDisabled}
            onFlip={onFlip}
            onRun={onRun}
            onStop={onStop}
            onOpenFolder={onOpenFolder}
          />
        </CardEntrance>
      ))}
    </div>
  );
}

export default StrategyCollection;
