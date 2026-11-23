// Импортируем зависимости из модуля react.
import { memo, useCallback, useState } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/strategies/game/StrategyCardBack.
import StrategyCardBack from "@/components/strategies/game/StrategyCardBack";
// Импортируем зависимости из модуля @/components/strategies/game/StrategyCardFront.
import StrategyCardFront from "@/components/strategies/game/StrategyCardFront";
// Импортируем зависимости из модуля @/hooks/useCardTilt.
import { useCardTilt } from "@/hooks/useCardTilt";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт ANIMATION.
  ANIMATION,
  // Подключаем именованный импорт CARD_ASPECT_RATIO.
  CARD_ASPECT_RATIO,
  // Подключаем именованный импорт CARD_FLIP_DURATION_MS.
  CARD_FLIP_DURATION_MS,
  // Подключаем именованный импорт GAME_CARD_HOVER_SCALE.
  GAME_CARD_HOVER_SCALE,
  // Подключаем именованный импорт GAME_CARD_LIFT_SHADOW.
  GAME_CARD_LIFT_SHADOW,
  // Подключаем именованный импорт GAME_CARD_TILT_MAX.
  GAME_CARD_TILT_MAX,
  // Подключаем именованный импорт RUNNING_CARD_SHADOW.
  RUNNING_CARD_SHADOW,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { Strategy, StrategyCard } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyGameCardProps {
  // Обрабатываем конструкцию: card.
  card: StrategyCard;
  // Обрабатываем конструкцию: flipped.
  flipped: boolean;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: onFlip.
  onFlip: () => void;
  // Обрабатываем конструкцию: onRun.
  onRun: () => void;
  // Обрабатываем конструкцию: onStop.
  onStop: () => void;
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder: () => void;
  // Обрабатываем конструкцию: onRemove.
  onRemove: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FLIP_TRANSITION = { duration: CARD_FLIP_DURATION_….
const FLIP_TRANSITION = {
  // Обрабатываем конструкцию: duration.
  duration: CARD_FLIP_DURATION_MS / 1000,
  // Обрабатываем конструкцию: ease.
  ease: [0.16, 1, 0.3, 1] as const,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const INSTANT_TRANSITION = { duration: 0 } as const.
const INSTANT_TRANSITION = { duration: 0 } as const;
// — разделитель логических блоков —

// Объявляем функцию StrategyGameCardImpl.
function StrategyGameCardImpl({
  // Обрабатываем конструкцию: card.
  card,
  // Обрабатываем конструкцию: flipped.
  flipped,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: onFlip.
  onFlip,
  // Обрабатываем конструкцию: onRun.
  onRun,
  // Обрабатываем конструкцию: onStop.
  onStop,
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Закрываем текущий блок.
}: StrategyGameCardProps) {
  // Обрабатываем конструкцию: const { strategy } = card.
  const { strategy } = card;
  // Обрабатываем конструкцию: const isRunning = strategy.status === running.
  const isRunning = strategy.status === "running";
  // Обрабатываем конструкцию: const isBusy = strategy.status === starting || strategy….
  const isBusy =
    // Обрабатываем конструкцию: strategy.
    strategy.status === "starting" || strategy.status === "stopping";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [hovered, setHovered] = useState(false).
  const [hovered, setHovered] = useState(false);
  // Обрабатываем конструкцию: const { containerRef, handleMouseMove, handleMouseLeave….
  const { containerRef, handleMouseMove, handleMouseLeave, rotateX, rotateY } =
    // Обрабатываем конструкцию: useCardTilt.
    useCardTilt({
      // Обрабатываем конструкцию: maxTilt.
      maxTilt: GAME_CARD_TILT_MAX,
      // Обрабатываем конструкцию: disabled.
      disabled: motionDisabled,
      // Сохраняем пояснение разработчика: // Карточку мы наклоняем вместе с внутренним переворотом: на…
      // Карточку мы наклоняем вместе с внутренним переворотом: на обратной
      // Сохраняем пояснение разработчика: // стороне движение к курсору выглядит зеркально, поэтому на…
      // стороне движение к курсору выглядит зеркально, поэтому направление
      // Сохраняем пояснение разработчика: // наклона инвертируется вместе с состоянием flip.
      // наклона инвертируется вместе с состоянием flip.
      // Обрабатываем конструкцию: inverted.
      inverted: flipped,
      // Закрываем текущий блок.
    });
  // Обрабатываем конструкцию: const lifted = hovered && !motionDisabled.
  const lifted = hovered && !motionDisabled;
  // Сохраняем пояснение разработчика: // Запущенная стратегия приподнята даже без наведения: состо…
  // Запущенная стратегия приподнята даже без наведения: состояние
  // Сохраняем пояснение разработчика: // «работает» видно с первого взгляда, без вглядывания в бей…
  // «работает» видно с первого взгляда, без вглядывания в бейдж.
  // Обрабатываем конструкцию: const raised = isRunning && !motionDisabled.
  const raised = isRunning && !motionDisabled;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <motion.div ref={containerRef} onMouseMove={handleMou….
  return (
    // Обрабатываем конструкцию: <motion.div ref={containerRef} onMouseMove={handleMouse….
    <motion.div
      // Обрабатываем конструкцию: ref.
      ref={containerRef}
      // Обрабатываем конструкцию: onMouseMove.
      onMouseMove={handleMouseMove}
      // Обрабатываем конструкцию: onMouseEnter.
      onMouseEnter={() => {
        // Обрабатываем конструкцию: setHovered.
        setHovered(true);
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: onMouseLeave.
      onMouseLeave={() => {
        // Обрабатываем конструкцию: setHovered.
        setHovered(false);
        // Обрабатываем конструкцию: handleMouseLeave.
        handleMouseLeave();
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: className.
      className="strategy-card group relative [perspective:1000px]"
      // Обрабатываем конструкцию: data-flipped.
      data-flipped={flipped}
      // Обрабатываем конструкцию: data-running.
      data-running={isRunning}
      // Обрабатываем конструкцию: style.
      style={{ width: "100%", aspectRatio: String(CARD_ASPECT_RATIO) }}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: className.
        className="relative size-full"
        // Обрабатываем конструкцию: style.
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // Обрабатываем конструкцию: animate.
        animate={{
          // Обрабатываем конструкцию: scale.
          scale: lifted ? GAME_CARD_HOVER_SCALE : raised ? 1.02 : 1,
          // Обрабатываем конструкцию: y.
          y: lifted ? -6 : raised ? -8 : 0,
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: ANIMATION.normal, ease: ANIMATION.easeOutExpo }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <div
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="pointer-events-none absolute inset-0 rounded-xl"
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: boxShadow.
            boxShadow: lifted
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                GAME_CARD_LIFT_SHADOW
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                raised
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  RUNNING_CARD_SHADOW
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  "none",
            // Обрабатываем конструкцию: transition.
            transition: `box-shadow ${ANIMATION.normal}s var(--ease-out-expo)`,
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.div
          // Обрабатываем конструкцию: className.
          className="relative h-full w-full [transform-style:preserve-3d]"
          // Обрабатываем конструкцию: animate.
          animate={{ rotateY: flipped ? 180 : 0 }}
          // Обрабатываем конструкцию: transition.
          transition={motionDisabled ? INSTANT_TRANSITION : FLIP_TRANSITION}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <StrategyCardFront
            // Обрабатываем конструкцию: card.
            card={card}
            // Обрабатываем конструкцию: flipped.
            flipped={flipped}
            // Обрабатываем конструкцию: isRunning.
            isRunning={isRunning}
            // Обрабатываем конструкцию: isBusy.
            isBusy={isBusy}
            // Обрабатываем конструкцию: motionDisabled.
            motionDisabled={motionDisabled}
            // Обрабатываем конструкцию: onFlip.
            onFlip={onFlip}
            // Обрабатываем конструкцию: onRun.
            onRun={onRun}
            // Обрабатываем конструкцию: onStop.
            onStop={onStop}
            // Обрабатываем конструкцию: onRemove.
            onRemove={onRemove}
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <div
            // Обрабатываем конструкцию: className.
            className="bg-bg-secondary/95 border-glass-border absolute inset-0 flex flex-col rounded-xl border p-0 [backface-visibility:hidden]"
            // Обрабатываем конструкцию: style.
            style={{ transform: "rotateY(180deg)" }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <StrategyCardBack
              // Обрабатываем конструкцию: strategy.
              strategy={strategy}
              // Обрабатываем конструкцию: isRunning.
              isRunning={isRunning}
              // Обрабатываем конструкцию: isBusy.
              isBusy={isBusy}
              // Обрабатываем конструкцию: onRun.
              onRun={onRun}
              // Обрабатываем конструкцию: onStop.
              onStop={onStop}
              // Обрабатываем конструкцию: onOpenFolder.
              onOpenFolder={onOpenFolder}
              // Обрабатываем конструкцию: onClose.
              onClose={onFlip}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.div>
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {/* Морозная дымка при наведении.
       // Сохраняем пояснение разработчика: *
       *
       // Сохраняем пояснение разработчика: * Стойка (backdrop-filter) обязана жить ВНЕ поддерева
       * Стойка (backdrop-filter) обязана жить ВНЕ поддерева
       // Сохраняем пояснение разработчика: * preserve-3d: Chromium отбрасывает backdrop-filter у
       * preserve-3d: Chromium отбрасывает backdrop-filter у
       // Сохраняем пояснение разработчика: * элементов внутри 3D-контекста, поэтому любые скримы внутри
       * элементов внутри 3D-контекста, поэтому любые скримы внутри
       // Сохраняем пояснение разработчика: * грани переворота невидимы. Здесь оверлей — сосед наклонног…
       * грани переворота невидимы. Здесь оверлей — сосед наклонного
       // Сохраняем пояснение разработчика: * контейнера: он не в 3D-контексте, дымка работает.
       * контейнера: он не в 3D-контексте, дымка работает.
       // Сохраняем пояснение разработчика: *
       *
       // Сохраняем пояснение разработчика: * Наклон и подъём повторяют карточку: те же MotionValues
       * Наклон и подъём повторяют карточку: те же MotionValues
       // Сохраняем пояснение разработчика: * rotateX/rotateY и те же цели scale/y с той же анимацией —
       * rotateX/rotateY и те же цели scale/y с той же анимацией —
       // Сохраняем пояснение разработчика: * дымка следует за краями карточки и не «отъезжает» сверху. …
       * дымка следует за краями карточки и не «отъезжает» сверху. */}
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: pointer-events-none absolute inset-0 z-20 rounded-xl.
          "pointer-events-none absolute inset-0 z-20 rounded-xl",
          // Обрабатываем конструкцию: transition-opacity duration-300 ease-out.
          "transition-opacity duration-300 ease-out",
          // Изменяем значение выражения !isRunning.
          !isRunning && !flipped
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "opacity-0 group-hover:opacity-100 group-hover:backdrop-blur-[3px]"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              "opacity-0"
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: style.
        style={{ rotateX, rotateY }}
        // Обрабатываем конструкцию: animate.
        animate={{
          // Обрабатываем конструкцию: scale.
          scale: lifted ? GAME_CARD_HOVER_SCALE : raised ? 1.02 : 1,
          // Обрабатываем конструкцию: y.
          y: lifted ? -6 : raised ? -8 : 0,
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: ANIMATION.normal, ease: ANIMATION.easeOutExpo }}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyGameCardItemProps {
  // Обрабатываем конструкцию: card.
  card: StrategyCard;
  // Обрабатываем конструкцию: flipped.
  flipped: boolean;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: onFlip.
  onFlip: (id: string) => void;
  // Обрабатываем конструкцию: onRun.
  onRun: (strategy: Strategy) => void;
  // Обрабатываем конструкцию: onStop.
  onStop: (strategy: Strategy) => void;
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder: () => void;
  // Обрабатываем конструкцию: onRemove.
  onRemove: (id: string) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MemoStrategyGameCard = memo(StrategyGameCardImpl).
const MemoStrategyGameCard = memo(StrategyGameCardImpl);
// — разделитель логических блоков —

// Объявляем функцию StrategyGameCardItemImpl.
function StrategyGameCardItemImpl({
  // Обрабатываем конструкцию: card.
  card,
  // Обрабатываем конструкцию: flipped.
  flipped,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: onFlip.
  onFlip,
  // Обрабатываем конструкцию: onRun.
  onRun,
  // Обрабатываем конструкцию: onStop.
  onStop,
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Закрываем текущий блок.
}: StrategyGameCardItemProps) {
  // Обрабатываем конструкцию: const handleFlip = useCallback(() => { onFlip(card.stra….
  const handleFlip = useCallback(() => {
    // Обрабатываем конструкцию: onFlip.
    onFlip(card.strategy.id);
    // Закрываем текущий блок.
  }, [card.strategy.id, onFlip]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRun = useCallback(() => { onRun(card.strate….
  const handleRun = useCallback(() => {
    // Обрабатываем конструкцию: onRun.
    onRun(card.strategy);
    // Закрываем текущий блок.
  }, [card.strategy, onRun]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleStop = useCallback(() => { onStop(card.stra….
  const handleStop = useCallback(() => {
    // Обрабатываем конструкцию: onStop.
    onStop(card.strategy);
    // Закрываем текущий блок.
  }, [card.strategy, onStop]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRemove = useCallback(() => { onRemove(card.….
  const handleRemove = useCallback(() => {
    // Обрабатываем конструкцию: onRemove.
    onRemove(card.strategy.id);
    // Закрываем текущий блок.
  }, [card.strategy.id, onRemove]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <MemoStrategyGameCard card={card} flipped={flipped} m….
  return (
    // Рендерим самозакрывающийся элемент MemoStrategyGameCard.
    <MemoStrategyGameCard
      // Обрабатываем конструкцию: card.
      card={card}
      // Обрабатываем конструкцию: flipped.
      flipped={flipped}
      // Обрабатываем конструкцию: motionDisabled.
      motionDisabled={motionDisabled}
      // Обрабатываем конструкцию: onFlip.
      onFlip={handleFlip}
      // Обрабатываем конструкцию: onRun.
      onRun={handleRun}
      // Обрабатываем конструкцию: onStop.
      onStop={handleStop}
      // Обрабатываем конструкцию: onOpenFolder.
      onOpenFolder={onOpenFolder}
      // Обрабатываем конструкцию: onRemove.
      onRemove={handleRemove}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const StrategyGameCardItem = memo(StrategyGameCardItemImpl);
// — разделитель логических блоков —
