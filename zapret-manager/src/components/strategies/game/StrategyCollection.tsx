import { motion } from "framer-motion";

import StrategyCard from "@/components/strategies/StrategyCard";
import { StrategyGameCardItem } from "@/components/strategies/game/StrategyGameCard";
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
        <motion.div
          key={card.strategy.id}
          initial={motionDisabled ? false : { opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: motionDisabled ? 0 : Math.min(index * 0.04, 0.5),
            ease: [0.16, 1, 0.3, 1],
          }}
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
        </motion.div>
      ))}
    </div>
  );
}

export default StrategyCollection;
