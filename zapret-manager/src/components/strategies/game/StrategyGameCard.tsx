import type { CSSProperties } from "react";
import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";

import StrategyCardBack from "@/components/strategies/game/StrategyCardBack";
import StrategyCardFront from "@/components/strategies/game/StrategyCardFront";
import { useCardTilt } from "@/hooks/useCardTilt";
import { useChromatic } from "@/hooks/useChromatic";
import {
  ANIMATION,
  CARD_ASPECT_RATIO,
  CARD_FLIP_DURATION_MS,
  GAME_CARD_HOVER_SCALE,
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

/**
 * Индикатор работающей стратегии.
 *
 * Раньше пульсировал сам box-shadow карточки: свойство не композитное,
 * анимация шла по главному потоку и конфликтовала с filter: blur() родителя —
 * пульс то замирал, то пропадал совсем. Теперь это отдельные слои под карточкой,
 * которые двигают только opacity и transform, то есть compositor-only анимация
 * без перерисовки карточки.
 *
 * Намеренно не зависит от настройки «Анимации»: это индикатор того, что обход
 * работает, и он должен гореть всегда.
 */
function RunningHalo() {
  return (
    <>
      <span aria-hidden="true" className="strategy-card-halo" />
      <span aria-hidden="true" className="strategy-card-halo-pulse" />
    </>
  );
}

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
  const chromatic = useChromatic(!motionDisabled);

  const {
    containerRef,
    handleMouseMove,
    handleMouseLeave,
    rotateX: rotateXTilt,
    rotateY: rotateYTilt,
  } = useCardTilt({
    // Наклон и следование за курсором не отключаем на перевороте: раньше
    // карточка в момент перелистывания полностью замирала и выглядела
    // сломанной. Направления лишь меняются местами, потому что грань
    // повёрнута на 180°.
    disabled: tiltDisabled,
    inverted: flipped,
    glowColor: palette.glow,
  });

  const handleCardLeave = useCallback((): void => {
    setIsHovered(false);
    handleMouseLeave();
  }, [handleMouseLeave]);

  const lifted = isHovered;

  return (
    <motion.div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleCardLeave}
      className="strategy-card group relative [perspective:1000px]"
      data-flipped={flipped}
      data-running={isRunning}
      style={{ width: "100%", aspectRatio: String(CARD_ASPECT_RATIO) }}
    >
      {isRunning ? <RunningHalo /> : null}

      {/*
        Цветной оверлей лежит вне 3D-контекста: слой с filter внутри
        preserve-3d схлопывает объём, и переворот перестаёт быть объёмным.
        Амплитуда перелива задаётся здесь, сама анимация — в CSS.
      */}
      {chromatic.isEnabled ? (
        <span
          aria-hidden="true"
          className="strategy-card-chromatic pointer-events-none absolute inset-0 rounded-xl"
          style={
            {
              boxShadow: `inset 0 0 0 1px ${palette.border}`,
              "--chromatic-amp": chromatic.amplitude,
            } as CSSProperties
          }
        />
      ) : null}

      {/*
        Наклон и переворот объединены на одном элементе.

        Раньше наклон и переворот жили на двух вложенных элементах с
        preserve-3d у каждого. Второй 3D-контекст посередине создавал
        лишнюю поверхность композиции, и на слабых видеокартах переворот
        дёргался. Один transform с preserve-3d рисуется целиком на
        композиторе.
      */}
      <motion.div
        animate={{
          scale: lifted && !motionDisabled ? GAME_CARD_HOVER_SCALE : 1,
          y: lifted && !motionDisabled ? -6 : 0,
        }}
        transition={{ duration: ANIMATION.normal, ease: ANIMATION.easeOutExpo }}
        style={{
          rotateX: rotateXTilt,
          rotateY: rotateYTilt,
          transformStyle: "preserve-3d",
          // will-change задаётся один раз и не переключается: иначе браузер
          // создаёт и уничтожает слой прямо в кадре начала анимации
          willChange: "transform",
          borderRadius: "0.75rem",
          boxShadow: lifted
            ? `0 24px 48px rgb(0 0 0 / 0.45), 0 0 44px -10px ${palette.glow}`
            : "none",
        }}
        className="relative h-full w-full rounded-xl"
      >
        {/*
          Переворот живёт на внутреннем слое, а не на том же элементе, что и
          наклон. На одном элементе Framer Motion не может одновременно
          вести transform из animate и из motion-значений в style: анимация
          перезаписывала наклон, и кнопки внутри карточки начинали «плавать»
          под курсором. Второй 3D-контекст здесь обязателен: обе грани
          должны лежать в одном пространстве с переворотом, иначе задняя
          грань схлопывается в плоскость и перестаёт попадать под курсор.
        */}
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
            className={cn(
              "bg-bg-secondary/95 absolute inset-0 flex flex-col rounded-xl border p-0 [backface-visibility:hidden]",
              "[transform:rotateY(180deg)]",
              // задняя грань принимает клики только когда карточка действительно перевёрнута
              flipped ? "pointer-events-auto" : "pointer-events-none"
            )}
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
