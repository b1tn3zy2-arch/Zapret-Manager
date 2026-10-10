import { memo, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

import CardStatsBars from "@/components/strategies/game/CardStatsBars";
import PlayOverlay from "@/components/strategies/game/PlayOverlay";
import RarityBadge from "@/components/strategies/game/RarityBadge";
import RarityParticles from "@/components/strategies/game/RarityParticles";
import StrategyCardBack from "@/components/strategies/game/StrategyCardBack";
import { useBloom } from "@/hooks/useBloom";
import { useCardTilt } from "@/hooks/useCardTilt";
import { useChromatic } from "@/hooks/useChromatic";
import { CARD_ASPECT_RATIO, CARD_FLIP_DURATION_MS } from "@/lib/constants";
import { capitalizeService } from "@/lib/format";
import { getRarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import {
  selectHasEnabledGame,
  useSettingsStore,
} from "@/stores/useSettingsStore";
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
  const { strategy, rarity, stats } = card;
  const palette = getRarityColor(rarity);
  const isRunning = strategy.status === "running";
  const isBusy =
    strategy.status === "starting" || strategy.status === "stopping";
  const outlastEnabled = useSettingsStore(selectHasEnabledGame);
  const bloomColor = rarity === "legendary" ? "primary" : "secondary";
  const bloomIntensity = rarity === "legendary" ? "strong" : "subtle";
  const bloom = useBloom(bloomColor, bloomIntensity);
  const chromatic = useChromatic(!motionDisabled);
  const [isHovered, setIsHovered] = useState(false);

  const {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    rotateX,
    rotateY,
    glow,
    isInteractive,
  } = useCardTilt({
    disabled: tiltDisabled || flipped,
    glowColor: palette.glow,
  });

  const handleCardLeave = useCallback((): void => {
    setIsHovered(false);
    handleMouseLeave();
  }, [handleMouseLeave]);

  const showOverlay = (isHovered || isRunning) && !flipped;

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={handleCardLeave}
      whileHover={motionDisabled ? { scale: 1 } : { scale: 1.03, zIndex: 10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "strategy-card relative [perspective:1000px]",
        isRunning && !motionDisabled && "card-running-pulse"
      )}
      style={{ width: "100%", aspectRatio: String(CARD_ASPECT_RATIO) }}
    >
      <motion.div
        className="relative h-full w-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={motionDisabled ? INSTANT_TRANSITION : FLIP_TRANSITION}
      >
        <button
          type="button"
          onClick={onFlip}
          aria-label={`Подробнее о стратегии ${strategy.name}`}
          aria-expanded={flipped}
          style={{
            borderColor: palette.border,
            boxShadow:
              bloom.boxShadow === ""
                ? undefined
                : isRunning
                  ? bloom.boxShadowHover
                  : bloom.boxShadow,
          }}
          className={cn(
            "bg-bg-secondary/80 absolute inset-0 flex flex-col gap-3 rounded-xl border p-4 text-left",
            "focus-visible:ring-accent-primary outline-none backface-hidden focus-visible:ring-1",
            "group transition-[box-shadow] duration-200 ease-out"
          )}
        >
          {chromatic.isEnabled ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                boxShadow: `inset 0 0 0 1px ${palette.border}`,
                filter: chromatic.filter,
              }}
            />
          ) : null}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{
              background: glow,
              willChange: "background",
            }}
          />

          <motion.span
            className="absolute inset-0 rounded-xl"
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              willChange: isInteractive ? "transform" : "auto",
            }}
          >
            <span className="flex h-full flex-col gap-3 p-4">
              <span className="flex items-start justify-between gap-2">
                <RarityBadge rarity={rarity} compact />
                {isRunning ? (
                  <span className="text-accent-primary border-accent-primary/40 bg-accent-primary/10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
                    <span className="bg-accent-primary inline-block size-1.5 animate-pulse rounded-full" />
                    Запущена
                  </span>
                ) : null}
              </span>

              <span className="flex flex-col gap-1">
                <span className="text-text-primary line-clamp-3 text-lg leading-tight font-bold">
                  {strategy.name}
                </span>
                <span className="text-text-tertiary truncate font-mono text-[10px]">
                  {strategy.filename}
                </span>
              </span>

              <span className="block">
                <CardStatsBars stats={stats} />
              </span>

              <span className="mt-auto flex flex-wrap gap-1">
                {strategy.services.map((service) => (
                  <span
                    key={service}
                    className="text-text-secondary border-glass-border bg-glass-bg rounded-full border px-2 py-0.5 text-[10px]"
                  >
                    {capitalizeService(service)}
                  </span>
                ))}
                {outlastEnabled ? <OutlastBadge /> : null}
              </span>
            </span>
          </motion.span>

          <RarityParticles
            rarity={rarity}
            color={palette.solid}
            disabled={particlesDisabled}
          />

          <AnimatePresence>
            {showOverlay ? (
              <PlayOverlay
                key="play-overlay"
                isRunning={isRunning}
                isBusy={isBusy}
                motionDisabled={motionDisabled}
                onRun={onRun}
                onStop={onStop}
              />
            ) : null}
          </AnimatePresence>
        </button>

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
  );
}

function OutlastBadge() {
  return (
    <span className="text-accent-primary border-accent-primary/40 bg-accent-primary/10 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium">
      <Gamepad2 aria-hidden="true" className="size-2.5" />+ Outlast
    </span>
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
