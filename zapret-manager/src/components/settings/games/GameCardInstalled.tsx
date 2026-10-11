import { memo, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

import { GameCoverImage } from "@/components/settings/games/GameCoverImage";
import GamePlayOverlay from "@/components/settings/games/GamePlayOverlay";
import { useI18n } from "@/i18n";
import { useCardTilt } from "@/hooks/useCardTilt";
import { formatRelativeTime } from "@/lib/format";
import {
  ANIMATION,
  GAME_CARD_HOVER_SCALE,
  GAME_CARD_LIFT_SHADOW,
  GAME_CARD_TILT_MAX,
  GAME_COVER_ASPECT,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { InstalledGame } from "@/types";

export interface GameCardInstalledProps {
  game: InstalledGame;
  name: string;
  platformLabel: string;
  bypassLabel: string;
  bypassEnabled: boolean;
  launchLabel: string;
  busy: boolean;
  motionDisabled: boolean;
  onLaunch: () => void;
  onRemove?: (() => void) | undefined;
}

function GameCardInstalled({
  game,
  name,
  platformLabel,
  bypassLabel,
  bypassEnabled,
  launchLabel,
  busy,
  motionDisabled,
  onLaunch,
  onRemove,
}: GameCardInstalledProps) {
  const { t } = useI18n();
  const [hovered, setHovered] = useState(false);
  const { containerRef, handleMouseMove, handleMouseLeave, rotateX, rotateY } =
    useCardTilt({
      maxTilt: GAME_CARD_TILT_MAX,
      disabled: motionDisabled,
    });
  const lifted = hovered && !motionDisabled;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        handleMouseLeave();
      }}
      style={{ perspective: "1000px", aspectRatio: GAME_COVER_ASPECT }}
      className="group relative"
      data-testid="installed-game-card"
      data-game-id={game.id}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        animate={{
          scale: lifted ? GAME_CARD_HOVER_SCALE : 1,
          y: lifted ? -6 : 0,
        }}
        transition={{ duration: ANIMATION.normal, ease: ANIMATION.easeOutExpo }}
        className={cn(
          "bg-bg-secondary relative size-full overflow-hidden rounded-xl border",
          "border-glass-border"
        )}
      >
        <div
          style={{
            boxShadow: lifted ? GAME_CARD_LIFT_SHADOW : "none",
            transition: `box-shadow ${ANIMATION.normal}s var(--ease-out-expo)`,
          }}
          className="absolute inset-0"
        />
        <GameCoverImage game={game} alt={name} />
        <span className="from-bg-primary/95 via-bg-primary/45 absolute inset-0 bg-gradient-to-t to-transparent" />
        <span
          aria-hidden="true"
          className={cn(
            "from-accent-primary/25 pointer-events-none absolute inset-0 to-transparent",
            "bg-gradient-to-br transition-opacity duration-300",
            lifted ? "opacity-100" : "opacity-0"
          )}
        />
        <span
          className={cn(
            "absolute top-2 left-2 rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur",
            "bg-bg-primary/70 text-text-secondary"
          )}
        >
          {platformLabel}
        </span>
        <span
          className={cn(
            "absolute top-2 right-2 rounded-full px-2 py-0.5 text-[11px] font-medium",
            bypassEnabled
              ? "bg-accent-primary/90 text-on-accent"
              : "bg-bg-primary/70 text-text-tertiary"
          )}
        >
          {bypassLabel}
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <div className="min-w-0">
            <p className="text-text-primary truncate text-sm font-semibold">
              {name}
            </p>
            <p className="text-text-tertiary truncate text-[11px]">
              {game.lastLaunchedAt === undefined
                ? platformLabel
                : formatRelativeTime(game.lastLaunchedAt)}
            </p>
          </div>
          {onRemove === undefined ? null : (
            <button
              type="button"
              aria-label={t("settings.games.installed.removeManual")}
              onClick={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              className={cn(
                "text-text-secondary hover:text-accent-danger rounded-md p-1 transition-colors",
                "hover:bg-glass-hover opacity-0 group-hover:opacity-100"
              )}
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          )}
        </div>
        <GamePlayOverlay
          visible={hovered}
          busy={busy}
          label={launchLabel}
          motionDisabled={motionDisabled}
          onLaunch={onLaunch}
        />
      </motion.div>
    </div>
  );
}

export default memo(GameCardInstalled);
