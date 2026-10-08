import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";

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
  containerVariants: Variants;
  cardVariants: Variants;
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
  containerVariants,
  cardVariants,
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="cards-container card-grid"
    >
      <AnimatePresence mode="popLayout">
        {cards.map((card) => (
          <motion.div
            key={card.strategy.id}
            layout
            variants={cardVariants}
            exit="exit"
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
      </AnimatePresence>
    </motion.div>
  );
}

export default StrategyCollection;
