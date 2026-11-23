// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Tooltip } from "@/components/ui";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useEnabledGames } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameBadgesProps {
  // Сохраняем пояснение разработчика: Компактный вид для 3D-карточек.
  /** Компактный вид для 3D-карточек. */
  // Обрабатываем конструкцию: compact.
  compact?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Сколько имён показываем до свёртки в «+N».
/** Сколько имён показываем до свёртки в «+N». */
// Обрабатываем конструкцию: const MAX_VISIBLE = 2.
const MAX_VISIBLE = 2;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Бейджи реально включённых игр.
 * Бейджи реально включённых игр.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше на карточке висел захардкоженный «+ Outlast» — он п…
 * Раньше на карточке висел захардкоженный «+ Outlast» — он показывался, даже
 // Сохраняем пояснение разработчика: * если игра выключена, и молчал, когда включено что-то ещё. …
 * если игра выключена, и молчал, когда включено что-то ещё. Теперь видно то,
 // Сохраняем пояснение разработчика: * что действительно будет подмешано в стратегию.
 * что действительно будет подмешано в стратегию.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function GameBadges({ compact = false }: GameBadgesProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const games = useEnabledGames().
  const games = useEnabledGames();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: games.length === 0.
  if (games.length === 0) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const visible = games.slice(0, MAX_VISIBLE).
  const visible = games.slice(0, MAX_VISIBLE);
  // Обрабатываем конструкцию: const rest = games.length - visible.length.
  const rest = games.length - visible.length;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const chip = cn( text-accent-primary border-accent-prim….
  const chip = cn(
    // Обрабатываем конструкцию: text-accent-primary border-accent-primary/40 bg-bg-prim….
    "text-accent-primary border-accent-primary/40 bg-bg-primary/85 inline-flex items-center gap-1",
    // Обрабатываем конструкцию: rounded-full border px-2 py-0.5 font-medium.
    "rounded-full border px-2 py-0.5 font-medium",
    // Сохраняем пояснение разработчика: // без backdrop-blur: этот фильтр лежит внутри 3D-контекста …
    // без backdrop-blur: этот фильтр лежит внутри 3D-контекста карточки и
    // Сохраняем пояснение разработчика: // схлопывает preserve-3d, из-за чего переворот теряет объём
    // схлопывает preserve-3d, из-за чего переворот теряет объём
    // Обрабатываем конструкцию: compact.
    compact ? "text-[10px]" : "text-xs"
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const hint = games.map((game) => game.name).join(, ).
  const hint = games.map((game) => game.name).join(", ");
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Tooltip content={${t(strategies.card.gamesHint)}: ${….
  return (
    // Обрабатываем конструкцию: <Tooltip content={${t(strategies.card.gamesHint)}: ${hi….
    <Tooltip content={`${t("strategies.card.gamesHint")}: ${hint}`}>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="flex flex-wrap items-center gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        {visible.map((game) => (
          // Обрабатываем конструкцию: <span key={game.id} className={chip}>.
          <span key={game.id} className={chip}>
            {/* Выводим текстовое содержимое в JSX. */}+ {game.name}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          // Закрываем выражение или список аргументов.
        ))}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {rest > 0 ? <span className={chip}>+{rest}</span> : null}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </Tooltip>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
