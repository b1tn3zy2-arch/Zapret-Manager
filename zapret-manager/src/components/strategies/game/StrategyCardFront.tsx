import { useI18n } from "@/i18n";
import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

import CardStatsBars from "@/components/strategies/game/CardStatsBars";
import PlayOverlay from "@/components/strategies/game/PlayOverlay";
import RarityBadge from "@/components/strategies/game/RarityBadge";
import RarityParticles from "@/components/strategies/game/RarityParticles";
import StrategyPoster from "@/components/strategies/game/StrategyPoster";
import EngineBadge from "@/components/strategies/EngineBadge";
import GameBadges from "@/components/strategies/GameBadges";
import { useBloom } from "@/hooks/useBloom";
import { capitalizeService } from "@/lib/format";
import { getRarityColor } from "@/lib/rarity";
import { cn } from "@/lib/utils";

import type { StrategyCard } from "@/types";

export interface StrategyCardFrontProps {
  card: StrategyCard;
  flipped: boolean;
  isHovered: boolean;
  isRunning: boolean;
  isBusy: boolean;
  motionDisabled: boolean;
  particlesDisabled: boolean;
  onHoverChange: (hovered: boolean) => void;
  onFlip: () => void;
  onRun: () => void;
  onStop: () => void;
}

export default function StrategyCardFront({
  card,
  flipped,
  isHovered,
  isRunning,
  isBusy,
  motionDisabled,
  particlesDisabled,
  onHoverChange,
  onFlip,
  onRun,
  onStop,
}: StrategyCardFrontProps) {
  const { t } = useI18n();
  const { strategy, rarity } = card;
  const palette = getRarityColor(rarity);
  const bloomColor = rarity === "legendary" ? "primary" : "secondary";
  const bloomDelta = rarity === "legendary" ? 1 : -1;
  const bloom = useBloom(bloomColor, bloomDelta);
  const showOverlay = isHovered || isRunning;
  const [pointerGlow, setPointerGlow] = useState("transparent");

  const handleMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>): void => {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      setPointerGlow(
        `radial-gradient(65% 55% at ${x.toFixed(1)}% ${y.toFixed(1)}%, ${palette.glow} 0%, transparent 70%)`
      );
    },
    [palette.glow]
  );

  return (
    <div
      onMouseEnter={() => {
        onHoverChange(true);
      }}
      onMouseLeave={() => {
        onHoverChange(false);
        setPointerGlow("transparent");
      }}
      onMouseMove={handleMove}
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
        "bg-bg-secondary/80 absolute inset-0 overflow-hidden rounded-xl border",
        "backface-hidden",
        // пока карточка перевёрнута, передняя грань невидима и не должна принимать клики
        flipped && "pointer-events-none"
      )}
    >
      <StrategyPoster services={strategy.services} />
      <span className="from-bg-primary via-bg-primary/55 absolute inset-0 bg-gradient-to-t to-transparent" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{ background: pointerGlow, opacity: isHovered ? 1 : 0 }}
      />
      {/*
        filter нельзя оставлять внутри 3D-поддерева: слой с фильтром
        схлопывает preserve-3d, и переворот перестаёт быть объёмным.
        Поэтому обводка рисуется рамкой, а цветной оттенок живёт в
        оверлее самой карточки, вне 3D.
      */}

      <span className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <RarityBadge rarity={rarity} compact />
        {isRunning ? (
          <span className="border-accent-primary/40 bg-bg-primary/70 text-accent-primary inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur">
            <span className="bg-accent-primary inline-block size-1.5 animate-pulse rounded-full" />
            {t("strategies.card.runningBadge")}
          </span>
        ) : (
          <button
            type="button"
            aria-label={t("strategies.card.detailsAria", {
              name: strategy.name,
            })}
            aria-expanded={flipped}
            onClick={(event) => {
              event.stopPropagation();
              onFlip();
            }}
            className="bg-bg-primary/90 text-text-secondary hover:text-text-primary rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Info aria-hidden="true" className="size-3.5" />
          </button>
        )}
      </span>

      <span className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3">
        <span className="text-text-primary text-lg leading-tight font-bold">
          {strategy.name}
        </span>
        <span className="text-text-tertiary truncate font-mono text-[10px]">
          {strategy.filename}
        </span>
        <span className="border-glass-border bg-bg-primary/85 block rounded-lg border p-2">
          <CardStatsBars stats={card.stats} />
        </span>
        <span className="flex flex-wrap gap-1">
          {strategy.services.map((service) => (
            <span
              key={service}
              className="text-text-secondary border-glass-border bg-bg-primary/85 rounded-full border px-2 py-0.5 text-[10px]"
            >
              {capitalizeService(service)}
            </span>
          ))}
          <GameBadges compact />
          <EngineBadge strategy={strategy} />
        </span>
      </span>

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
    </div>
  );
}
