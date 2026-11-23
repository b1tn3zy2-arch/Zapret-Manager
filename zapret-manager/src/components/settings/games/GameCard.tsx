// Импортируем зависимости из модуля react.
import { memo } from "react";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт ChevronDown.
  ChevronDown,
  // Подключаем именованный импорт Crosshair.
  Crosshair,
  // Подключаем именованный импорт Gamepad2.
  Gamepad2,
  // Подключаем именованный импорт Joystick.
  Joystick,
  // Подключаем именованный импорт Rocket.
  Rocket,
  // Подключаем именованный импорт Shield.
  Shield,
  // Подключаем именованный импорт Sword.
  Sword,
  // Подключаем именованный импорт Target.
  Target,
  // Подключаем именованный импорт Trash2.
  Trash2,
  // Подключаем именованный импорт type LucideIcon.
  type LucideIcon,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/games/GameEditor.
import GameEditor from "@/components/settings/games/GameEditor";
// Импортируем зависимости из модуля @/components/ui.
import { Toggle } from "@/components/ui";
// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/gameUtils.
import { formatGameStats } from "@/lib/gameUtils";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameCardProps {
  // Обрабатываем конструкцию: game.
  game: GameSettings;
  // Обрабатываем конструкцию: expanded.
  expanded: boolean;
  // Обрабатываем конструкцию: onToggleExpand.
  onToggleExpand: () => void;
  // Обрабатываем конструкцию: onToggleEnabled.
  onToggleEnabled: (value: boolean) => void;
  // Обрабатываем конструкцию: onChange.
  onChange: (patch: Partial<GameSettings>) => void;
  // Обрабатываем конструкцию: onDelete.
  onDelete: () => void;
  // Обрабатываем конструкцию: onImport.
  onImport: () => void;
  // Обрабатываем конструкцию: onExport.
  onExport: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ICONS = { Gamepad2, Crosshair, Sword, Target, Shi….
const ICONS = {
  // Передаём поле Gamepad2 в объект.
  Gamepad2,
  // Передаём поле Crosshair в объект.
  Crosshair,
  // Передаём поле Sword в объект.
  Sword,
  // Передаём поле Target в объект.
  Target,
  // Передаём поле Shield в объект.
  Shield,
  // Передаём поле Joystick в объект.
  Joystick,
  // Передаём поле Rocket в объект.
  Rocket,
  // Закрываем текущий блок.
} as const satisfies Record<string, LucideIcon>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const GameIcon = memo(function GameIcon({ name, active,….
const GameIcon = memo(function GameIcon({
  // Обрабатываем конструкцию: name.
  name,
  // Обрабатываем конструкцию: active.
  active,
  // Закрываем текущий блок.
}: {
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: active.
  active: boolean;
  // Закрываем текущий блок.
}) {
  // Обрабатываем конструкцию: const Icon = ICONS[name as keyof typeof ICONS] ?? Gamep….
  const Icon = ICONS[name as keyof typeof ICONS] ?? Gamepad2;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <span aria-hidden=true className={cn( flex size-9 shr….
  return (
    // Обрабатываем конструкцию: <span aria-hidden=true className={cn( flex size-9 shrin….
    <span
      // Обрабатываем конструкцию: aria-hidden.
      aria-hidden="true"
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: flex size-9 shrink-0 items-center justify-center rounde….
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        // Обрабатываем конструкцию: active.
        active
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "bg-accent-primary/15 text-accent-primary"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "text-text-tertiary bg-glass-bg"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <Icon className="size-5" strokeWidth={2} />
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Объявляем функцию GameCardImpl.
function GameCardImpl({
  // Обрабатываем конструкцию: game.
  game,
  // Обрабатываем конструкцию: expanded.
  expanded,
  // Обрабатываем конструкцию: onToggleExpand.
  onToggleExpand,
  // Обрабатываем конструкцию: onToggleEnabled.
  onToggleEnabled,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: onDelete.
  onDelete,
  // Обрабатываем конструкцию: onImport.
  onImport,
  // Обрабатываем конструкцию: onExport.
  onExport,
  // Закрываем текущий блок.
}: GameCardProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=md className=flex flex-col gap-3>….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=md className=flex flex-col gap-3>.
    <GlassPanel padding="md" className="flex flex-col gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex items-center gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <GameIcon name={game.icon} active={game.enabled} />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onClick.
          onClick={onToggleExpand}
          // Обрабатываем конструкцию: aria-expanded.
          aria-expanded={expanded}
          // Обрабатываем конструкцию: className.
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="flex flex-wrap items-center gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-primary truncate text-sm font-semibold">
              {/* Выводим текстовое содержимое в JSX. */}
              {game.name}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-tertiary font-mono text-[11px]">
            {/* Выводим текстовое содержимое в JSX. */}
            {formatGameStats(game)}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* Выводим текстовое содержимое в JSX. */}
        </button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Toggle
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: checked.
          checked={game.enabled}
          // Обрабатываем конструкцию: ariaLabel.
          ariaLabel={t("settings.games.enableFor").replace("{name}", game.name)}
          // Обрабатываем конструкцию: onChange.
          onChange={onToggleEnabled}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {/*
          // Продолжаем выражение.
          Кнопка удаления показывается всем, включая встроенные игры: раньше
          // Продолжаем выражение.
          для них её не было вовсе, и убрать лишний список доменов было
          // Продолжаем выражение.
          невозможно. Возврат — «Сбросить список игр» в этом же разделе.
        // Сохраняем пояснение разработчика: * /}
        */}
        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onClick.
          onClick={onDelete}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("settings.games.deleteNamed").replace(
            // Обрабатываем конструкцию: {name}.
            "{name}",
            // Обрабатываем конструкцию: game.
            game.name
            // Закрываем выражение или список аргументов.
          )}
          // Обрабатываем конструкцию: className.
          className="hover:bg-glass-hover focus-visible:ring-accent-primary/60 text-text-tertiary hover:text-accent-danger shrink-0 rounded-md p-1.5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
          {/* Выводим текстовое содержимое в JSX. */}
        </button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onClick.
          onClick={onToggleExpand}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("settings.games.toggleEditor")}
          // Обрабатываем конструкцию: className.
          className="text-text-tertiary hover:text-text-primary hover:bg-glass-hover shrink-0 rounded-md p-1.5 transition-colors"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: animate.
            animate={{ rotate: expanded ? 180 : 0 }}
            // Обрабатываем конструкцию: transition.
            transition={{ duration: ANIMATION.fast }}
            // Обрабатываем конструкцию: className.
            className="block"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <ChevronDown className="size-4" strokeWidth={2} />
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.span>
          {/* Выводим текстовое содержимое в JSX. */}
        </button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <AnimatePresence initial={false}>
        {/* Выводим текстовое содержимое в JSX. */}
        {expanded ? (
          // Обрабатываем конструкцию: <motion.div key=editor initial={{ height: 0, opacity: 0….
          <motion.div
            // Обрабатываем конструкцию: key.
            key="editor"
            // Обрабатываем конструкцию: initial.
            initial={{ height: 0, opacity: 0 }}
            // Обрабатываем конструкцию: animate.
            animate={{ height: "auto", opacity: 1 }}
            // Обрабатываем конструкцию: exit.
            exit={{ height: 0, opacity: 0 }}
            // Обрабатываем конструкцию: transition.
            transition={{
              // Обрабатываем конструкцию: duration.
              duration: ANIMATION.normal,
              // Обрабатываем конструкцию: ease.
              ease: ANIMATION.easeOutExpo,
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: className.
            className="overflow-hidden"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <GameEditor
              // Обрабатываем конструкцию: game.
              game={game}
              // Обрабатываем конструкцию: onChange.
              onChange={onChange}
              // Обрабатываем конструкцию: onImport.
              onImport={onImport}
              // Обрабатываем конструкцию: onExport.
              onExport={onExport}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.div>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MemoGameCard = memo(GameCardImpl).
const MemoGameCard = memo(GameCardImpl);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default MemoGameCard;.
export default MemoGameCard;
// — разделитель логических блоков —
