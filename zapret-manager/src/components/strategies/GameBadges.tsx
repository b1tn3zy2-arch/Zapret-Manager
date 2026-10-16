import { useI18n } from "@/i18n";

import { Tooltip } from "@/components/ui";
import { useEnabledGames } from "@/stores/useSettingsStore";
import { cn } from "@/lib/utils";

export interface GameBadgesProps {
  /** Компактный вид для 3D-карточек. */
  compact?: boolean;
}

/** Сколько имён показываем до свёртки в «+N». */
const MAX_VISIBLE = 2;

/**
 * Бейджи реально включённых игр.
 *
 * Раньше на карточке висел захардкоженный «+ Outlast» — он показывался, даже
 * если игра выключена, и молчал, когда включено что-то ещё. Теперь видно то,
 * что действительно будет подмешано в стратегию.
 */
export default function GameBadges({ compact = false }: GameBadgesProps) {
  const { t } = useI18n();
  const games = useEnabledGames();

  if (games.length === 0) {
    return null;
  }

  const visible = games.slice(0, MAX_VISIBLE);
  const rest = games.length - visible.length;

  const chip = cn(
    "text-accent-primary border-accent-primary/40 bg-bg-primary/85 inline-flex items-center gap-1",
    "rounded-full border px-2 py-0.5 font-medium",
    // без backdrop-blur: этот фильтр лежит внутри 3D-контекста карточки и
    // схлопывает preserve-3d, из-за чего переворот теряет объём
    compact ? "text-[10px]" : "text-xs"
  );

  const hint = games.map((game) => game.name).join(", ");

  return (
    <Tooltip content={`${t("strategies.card.gamesHint")}: ${hint}`}>
      <span className="flex flex-wrap items-center gap-1">
        {visible.map((game) => (
          <span key={game.id} className={chip}>
            + {game.name}
          </span>
        ))}

        {rest > 0 ? <span className={chip}>+{rest}</span> : null}
      </span>
    </Tooltip>
  );
}
