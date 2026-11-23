// Импортируем зависимости из модуля react.
import { memo, useState } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { ArrowLeftRight, Stethoscope, X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/games/GameCoverImage.
import { GameCoverImage } from "@/components/settings/games/GameCoverImage";
// Импортируем зависимости из модуля @/components/settings/games/GamePlayOverlay.
import GamePlayOverlay from "@/components/settings/games/GamePlayOverlay";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useCardTilt.
import { useCardTilt } from "@/hooks/useCardTilt";
// Импортируем зависимости из модуля @/lib/format.
import { formatRelativeTime } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт ANIMATION.
  ANIMATION,
  // Подключаем именованный импорт GAME_CARD_HOVER_SCALE.
  GAME_CARD_HOVER_SCALE,
  // Подключаем именованный импорт GAME_CARD_LIFT_SHADOW.
  GAME_CARD_LIFT_SHADOW,
  // Подключаем именованный импорт GAME_CARD_TILT_MAX.
  GAME_CARD_TILT_MAX,
  // Подключаем именованный импорт GAME_COVER_ASPECT.
  GAME_COVER_ASPECT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameCardInstalledProps {
  // Обрабатываем конструкцию: game.
  game: InstalledGame;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: platformLabel.
  platformLabel: string;
  // Обрабатываем конструкцию: bypassLabel.
  bypassLabel: string;
  // Обрабатываем конструкцию: bypassEnabled.
  bypassEnabled: boolean;
  // Обрабатываем конструкцию: launchLabel.
  launchLabel: string;
  // Обрабатываем конструкцию: busy.
  busy: boolean;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: onLaunch.
  onLaunch: () => void;
  // Обрабатываем конструкцию: onClose.
  onClose?: (() => void) | undefined;
  // Обрабатываем конструкцию: running.
  running?: boolean;
  // Обрабатываем конструкцию: removeLabel.
  removeLabel: string;
  // Обрабатываем конструкцию: onRemove.
  onRemove: () => void;
  // Обрабатываем конструкцию: diagnoseLabel.
  diagnoseLabel: string;
  // Обрабатываем конструкцию: onDiagnose.
  onDiagnose: () => void;
  // Сохраняем пояснение разработчика: Смена способа запуска: «с обходом / без обхода».
  /** Смена способа запуска: «с обходом / без обхода». */
  // Обрабатываем конструкцию: changeLaunchLabel.
  changeLaunchLabel: string;
  // Обрабатываем конструкцию: onChangeLaunchMode.
  onChangeLaunchMode: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию GameCardInstalled.
function GameCardInstalled({
  // Обрабатываем конструкцию: game.
  game,
  // Обрабатываем конструкцию: name.
  name,
  // Обрабатываем конструкцию: platformLabel.
  platformLabel,
  // Обрабатываем конструкцию: bypassLabel.
  bypassLabel,
  // Обрабатываем конструкцию: bypassEnabled.
  bypassEnabled,
  // Обрабатываем конструкцию: launchLabel.
  launchLabel,
  // Обрабатываем конструкцию: busy.
  busy,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: onLaunch.
  onLaunch,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: running.
  running = false,
  // Обрабатываем конструкцию: removeLabel.
  removeLabel,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Обрабатываем конструкцию: diagnoseLabel.
  diagnoseLabel,
  // Обрабатываем конструкцию: onDiagnose.
  onDiagnose,
  // Обрабатываем конструкцию: changeLaunchLabel.
  changeLaunchLabel,
  // Обрабатываем конструкцию: onChangeLaunchMode.
  onChangeLaunchMode,
  // Закрываем текущий блок.
}: GameCardInstalledProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
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
      // Закрываем текущий блок.
    });
  // Обрабатываем конструкцию: const lifted = hovered && !motionDisabled.
  const lifted = hovered && !motionDisabled;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div ref={containerRef} onMouseMove={handleMouseMove}….
  return (
    // Обрабатываем конструкцию: <div ref={containerRef} onMouseMove={handleMouseMove} o….
    <div
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
      // Обрабатываем конструкцию: style.
      style={{ perspective: "1000px", aspectRatio: GAME_COVER_ASPECT }}
      // Обрабатываем конструкцию: className.
      className="group relative"
      // Обрабатываем конструкцию: data-testid.
      data-testid="installed-game-card"
      // Обрабатываем конструкцию: data-game-id.
      data-game-id={game.id}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: style.
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // Обрабатываем конструкцию: animate.
        animate={{
          // Обрабатываем конструкцию: scale.
          scale: lifted ? GAME_CARD_HOVER_SCALE : 1,
          // Обрабатываем конструкцию: y.
          y: lifted ? -6 : 0,
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: ANIMATION.normal, ease: ANIMATION.easeOutExpo }}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: bg-bg-secondary relative size-full overflow-hidden roun….
          "bg-bg-secondary relative size-full overflow-hidden rounded-xl border",
          // Обрабатываем конструкцию: running.
          running ? "border-accent-primary/40" : "border-glass-border"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <div
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: boxShadow.
            boxShadow: lifted ? GAME_CARD_LIFT_SHADOW : "none",
            // Обрабатываем конструкцию: transition.
            transition: `box-shadow ${ANIMATION.normal}s var(--ease-out-expo)`,
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: className.
          className="absolute inset-0"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <GameCoverImage game={game} alt={name} />
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="from-bg-primary/95 via-bg-primary/45 absolute inset-0 bg-gradient-to-t to-transparent" />
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: from-accent-primary/25 pointer-events-none absolute ins….
            "from-accent-primary/25 pointer-events-none absolute inset-0 to-transparent",
            // Сохраняем пояснение разработчика: // Как и скрим с blur: проявляется через CSS-ховер группы,
            // Как и скрим с blur: проявляется через CSS-ховер группы,
            // Сохраняем пояснение разработчика: // без задержки на рендер состояния.
            // без задержки на рендер состояния.
            // Обрабатываем конструкцию: bg-gradient-to-br opacity-0 transition-opacity duration….
            "bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="bg-bg-primary/85 text-text-secondary absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium">
          {/* Выводим текстовое содержимое в JSX. */}
          {platformLabel}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-….
            "absolute top-2 right-2 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
            // Обрабатываем конструкцию: bypassEnabled.
            bypassEnabled
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "bg-accent-primary/90 text-on-accent"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "bg-bg-primary/85 text-text-secondary"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {bypassLabel}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        {/* Текстовый блок выше оверлея с blur: иначе размытие съедает имя
            // Продолжаем выражение.
            и подпись карточки едва ли не раньше, чем скрим проявляется. */}
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-2 p-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="min-w-0">
            {/* Выводим текстовое содержимое в JSX. */}
            <p className="text-text-primary truncate text-sm font-semibold">
              {/* Выводим текстовое содержимое в JSX. */}
              {name}
              {/* Выводим текстовое содержимое в JSX. */}
            </p>
            {/* Выводим текстовое содержимое в JSX. */}
            <p className="text-text-tertiary truncate text-[11px]">
              {/* Выводим текстовое содержимое в JSX. */}
              {game.lastLaunchedAt === undefined || game.lastLaunchedAt === null
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  platformLabel
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  formatRelativeTime(game.lastLaunchedAt)}
              {/* Выводим текстовое содержимое в JSX. */}
            </p>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex shrink-0 items-center gap-1.5">
            {/* Выводим текстовое содержимое в JSX. */}
            <button
              // Обрабатываем конструкцию: type.
              type="button"
              // Обрабатываем конструкцию: aria-label.
              aria-label={changeLaunchLabel}
              // Обрабатываем конструкцию: title.
              title={changeLaunchLabel}
              // Обрабатываем конструкцию: onClick.
              onClick={(event) => {
                // Обрабатываем конструкцию: event.
                event.stopPropagation();
                // Обрабатываем конструкцию: onChangeLaunchMode.
                onChangeLaunchMode();
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: text-text-secondary hover:bg-glass-hover hover:text-acc….
                "text-text-secondary hover:bg-glass-hover hover:text-accent-primary rounded-md p-1.5 opacity-0 transition-colors group-hover:opacity-100",
                // Обрабатываем конструкцию: focus-visible:ring-accent-primary/60 focus-visible:opac….
                "focus-visible:ring-accent-primary/60 focus-visible:opacity-100",
                // Обрабатываем конструкцию: focus-visible:ring-2 focus-visible:outline-none.
                "focus-visible:ring-2 focus-visible:outline-none"
                // Закрываем выражение или список аргументов.
              )}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <ArrowLeftRight aria-hidden="true" className="size-4" />
              {/* Выводим текстовое содержимое в JSX. */}
            </button>
            {/* Выводим текстовое содержимое в JSX. */}
            <button
              // Обрабатываем конструкцию: type.
              type="button"
              // Обрабатываем конструкцию: aria-label.
              aria-label={diagnoseLabel}
              // Обрабатываем конструкцию: title.
              title={diagnoseLabel}
              // Обрабатываем конструкцию: onClick.
              onClick={(event) => {
                // Обрабатываем конструкцию: event.
                event.stopPropagation();
                // Обрабатываем конструкцию: onDiagnose.
                onDiagnose();
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: text-text-secondary hover:bg-glass-hover hover:text-acc….
                "text-text-secondary hover:bg-glass-hover hover:text-accent-primary rounded-md p-1.5 transition-colors",
                // Обрабатываем конструкцию: focus-visible:ring-accent-primary/60.
                "focus-visible:ring-accent-primary/60",
                // Обрабатываем конструкцию: focus-visible:ring-2 focus-visible:outline-none.
                "focus-visible:ring-2 focus-visible:outline-none"
                // Закрываем выражение или список аргументов.
              )}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <Stethoscope aria-hidden="true" className="size-4" />
              {/* Выводим текстовое содержимое в JSX. */}
            </button>
            {/* Выводим текстовое содержимое в JSX. */}
            {onRemove === undefined ? null : (
              // Обрабатываем конструкцию: <button type=button aria-label={removeLabel} onClick={(….
              <button
                // Обрабатываем конструкцию: type.
                type="button"
                // Обрабатываем конструкцию: aria-label.
                aria-label={removeLabel}
                // Обрабатываем конструкцию: onClick.
                onClick={(event) => {
                  // Обрабатываем конструкцию: event.
                  event.stopPropagation();
                  // Обрабатываем конструкцию: onRemove.
                  onRemove();
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: className.
                className={cn(
                  // Обрабатываем конструкцию: text-text-secondary hover:bg-glass-hover hover:text-acc….
                  "text-text-secondary hover:bg-glass-hover hover:text-accent-danger rounded-md p-1.5 opacity-0 transition-colors group-hover:opacity-100",
                  // Обрабатываем конструкцию: focus-visible:ring-accent-primary/60 focus-visible:opac….
                  "focus-visible:ring-accent-primary/60 focus-visible:opacity-100",
                  // Обрабатываем конструкцию: focus-visible:ring-2 focus-visible:outline-none.
                  "focus-visible:ring-2 focus-visible:outline-none"
                  // Закрываем выражение или список аргументов.
                )}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                <X aria-hidden="true" className="size-4" />
                {/* Выводим текстовое содержимое в JSX. */}
              </button>
              // Закрываем выражение или список аргументов.
            )}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
        <GamePlayOverlay
          // Обрабатываем конструкцию: visible.
          visible={hovered}
          // Обрабатываем конструкцию: busy.
          busy={busy}
          // Обрабатываем конструкцию: label.
          label={
            // Обрабатываем конструкцию: running.
            running ? t("settings.games.installed.closeGame") : launchLabel
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: mode.
          mode={running ? "stop" : "play"}
          // Обрабатываем конструкцию: motionDisabled.
          motionDisabled={motionDisabled}
          // Обрабатываем конструкцию: onLaunch.
          onLaunch={running && onClose !== undefined ? onClose : onLaunch}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default memo(GameCardInstalled);.
export default memo(GameCardInstalled);
// — разделитель логических блоков —
