import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";

import StrategyCardBack from "@/components/strategies/game/StrategyCardBack";
import StrategyCardFront from "@/components/strategies/game/StrategyCardFront";
import { useCardTilt } from "@/hooks/useCardTilt";
import {
  ANIMATION,
  CARD_ASPECT_RATIO,
  CARD_FLIP_DURATION_MS,
  GAME_CARD_HOVER_SCALE,
  GAME_CARD_LIFT_SHADOW,
} from "@/lib/constants";
import { getRarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { Strategy, StrategyCard } from "@/types";

export interface StrategyGameCardProps {
  card: StrategyCard;
  flipped: boolean;
  tiltDisabled: boolean;
  particlesDisabled: boolean;
  motionDisabled: boolean;
  onFlip: () => void;
  onRun: () => void;
  onStop: () => void;
  onOpenFolder: () => void;
}

const FLIP_TRANSITION = {
  duration: CARD_FLIP_DURATION_MS / 1000,
  ease: [0.16, 1, 0.3, 1] as const,
};

const INSTANT_TRANSITION = { duration: 0 } as const;

const MemoStrategyGameCard = memo(StrategyGameCardImpl);

function StrategyGameCardImpl({
  card,
  flipped,
  tiltDisabled,
  particlesDisabled,
  motionDisabled,
  onFlip,
  onRun,
  onStop,
  onOpenFolder,
}: StrategyGameCardProps) {
  const { strategy, rarity } = card;
  const palette = getRarityColor(rarity);
  const isRunning = strategy.status === "running";
  const isBusy =
    strategy.status === "starting" || strategy.status === "stopping";
  const [isHovered, setIsHovered] = useState(false);

  const {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    rotateX,
    rotateY,
    isInteractive,
  } = useCardTilt({
    disabled: tiltDisabled || flipped,
    glowColor: palette.glow,
  });

  const handleCardLeave = useCallback((): void => {
    setIsHovered(false);
    handleMouseLeave();
  }, [handleMouseLeave]);

  const lifted = isHovered && !flipped;

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleCardLeave}
      className={cn(
        "strategy-card group relative [perspective:1000px]",
        isRunning && !motionDisabled && "card-running-pulse"
      )}
      style={{ width: "100%", aspectRatio: String(CARD_ASPECT_RATIO) }}
    >
      <motion.div
        animate={{
          scale: lifted && !motionDisabled ? GAME_CARD_HOVER_SCALE : 1,
          y: lifted && !motionDisabled ? -6 : 0,
        }}
        transition={{ duration: ANIMATION.normal, ease: ANIMATION.easeOutExpo }}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: isInteractive ? "transform" : "auto",
          borderRadius: "0.75rem",
          boxShadow: lifted ? GAME_CARD_LIFT_SHADOW : "none",
        }}
        className="relative h-full w-full rounded-xl"
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={motionDisabled ? INSTANT_TRANSITION : FLIP_TRANSITION}
        >
          <StrategyCardFront
            card={card}
            flipped={flipped}
            isHovered={isHovered}
            isRunning={isRunning}
            isBusy={isBusy}
            motionDisabled={motionDisabled}
            particlesDisabled={particlesDisabled}
            onHoverChange={setIsHovered}
            onFlip={onFlip}
            onRun={onRun}
            onStop={onStop}
          />

          <div
            className="bg-bg-secondary/95 absolute inset-0 flex [transform:rotateY(180deg)] flex-col rounded-xl border p-0 [backface-visibility:hidden]"
            style={{ borderColor: palette.border }}
          >
            <StrategyCardBack
              strategy={strategy}
              isRunning={isRunning}
              isBusy={isBusy}
              onRun={onRun}
              onStop={onStop}
              onOpenFolder={onOpenFolder}
              onClose={onFlip}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export interface StrategyGameCardItemProps {
  card: StrategyCard;
  flipped: boolean;
  tiltDisabled: boolean;
  particlesDisabled: boolean;
  motionDisabled: boolean;
  onFlip: (id: string) => void;
  onRun: (strategy: Strategy) => void;
  onStop: (strategy: Strategy) => void;
  onOpenFolder: () => void;
}

function StrategyGameCardItemImpl({
  card,
  flipped,
  tiltDisabled,
  particlesDisabled,
  motionDisabled,
  onFlip,
  onRun,
  onStop,
  onOpenFolder,
}: StrategyGameCardItemProps) {
  const handleFlip = useCallback(() => {
    onFlip(card.strategy.id);
  }, [card.strategy.id, onFlip]);

  const handleRun = useCallback(() => {
    onRun(card.strategy);
  }, [card.strategy, onRun]);

  const handleStop = useCallback(() => {
    onStop(card.strategy);
  }, [card.strategy, onStop]);

  return (
    <MemoStrategyGameCard
      card={card}
      flipped={flipped}
      tiltDisabled={tiltDisabled}
      particlesDisabled={particlesDisabled}
      motionDisabled={motionDisabled}
      onFlip={handleFlip}
      onRun={handleRun}
      onStop={handleStop}
      onOpenFolder={onOpenFolder}
    />
  );
}

export const StrategyGameCardItem = memo(StrategyGameCardItemImpl);
