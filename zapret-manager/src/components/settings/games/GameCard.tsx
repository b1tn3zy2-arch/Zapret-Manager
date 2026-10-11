import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Crosshair,
  Gamepad2,
  Joystick,
  Rocket,
  Shield,
  Sword,
  Target,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import GameEditor from "@/components/settings/games/GameEditor";
import { Toggle } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useI18n } from "@/i18n";
import { ANIMATION } from "@/lib/constants";
import { formatGameStats } from "@/lib/gameUtils";
import { cn } from "@/lib/utils";
import type { GameSettings } from "@/types";

export interface GameCardProps {
  game: GameSettings;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: (value: boolean) => void;
  onChange: (patch: Partial<GameSettings>) => void;
  onDelete: () => void;
  onImport: () => void;
  onExport: () => void;
}

const ICONS = {
  Gamepad2,
  Crosshair,
  Sword,
  Target,
  Shield,
  Joystick,
  Rocket,
} as const satisfies Record<string, LucideIcon>;

const GameIcon = memo(function GameIcon({
  name,
  active,
}: {
  name: string;
  active: boolean;
}) {
  const Icon = ICONS[name as keyof typeof ICONS] ?? Gamepad2;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg",
        active
          ? "bg-accent-primary/15 text-accent-primary"
          : "text-text-tertiary bg-glass-bg"
      )}
    >
      <Icon className="size-5" strokeWidth={2} />
    </span>
  );
});

function GameCardImpl({
  game,
  expanded,
  onToggleExpand,
  onToggleEnabled,
  onChange,
  onDelete,
  onImport,
  onExport,
}: GameCardProps) {
  const { t } = useI18n();

  return (
    <GlassPanel padding="md" className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <GameIcon name={game.icon} active={game.enabled} />

        <button
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 flex-col gap-0.5 text-left"
        >
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-text-primary truncate text-sm font-semibold">
              {game.name}
            </span>
          </span>

          <span className="text-text-tertiary font-mono text-[11px]">
            {formatGameStats(game)}
          </span>
        </button>

        <Toggle
          size="sm"
          checked={game.enabled}
          ariaLabel={t("settings.games.enableFor").replace("{name}", game.name)}
          onChange={onToggleEnabled}
        />

        {!game.builtin ? (
          <button
            type="button"
            onClick={onDelete}
            aria-label={t("settings.games.deleteNamed").replace(
              "{name}",
              game.name
            )}
            className="text-text-tertiary hover:text-accent-danger hover:bg-glass-hover shrink-0 rounded-md p-1.5 transition-colors"
          >
            <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
          </button>
        ) : null}

        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={t("settings.games.toggleEditor")}
          className="text-text-tertiary hover:text-text-primary hover:bg-glass-hover shrink-0 rounded-md p-1.5 transition-colors"
        >
          <motion.span
            aria-hidden="true"
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: ANIMATION.fast }}
            className="block"
          >
            <ChevronDown className="size-4" strokeWidth={2} />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="editor"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: ANIMATION.normal,
              ease: ANIMATION.easeOutExpo,
            }}
            className="overflow-hidden"
          >
            <GameEditor
              game={game}
              onChange={onChange}
              onImport={onImport}
              onExport={onExport}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassPanel>
  );
}

const MemoGameCard = memo(GameCardImpl);

export default MemoGameCard;
