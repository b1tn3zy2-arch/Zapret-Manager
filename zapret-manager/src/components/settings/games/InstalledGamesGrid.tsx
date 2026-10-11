import { motion } from "framer-motion";

import GameCardInstalled from "@/components/settings/games/GameCardInstalled";
import { useI18n } from "@/i18n";
import {
  GAME_CARD_MAX_WIDTH_PX,
  GAME_CARD_MIN_WIDTH_PX,
} from "@/lib/constants";
import { PLATFORM_LABEL_KEYS } from "@/lib/installedGames";
import type { InstalledGame } from "@/types";

export interface InstalledGamesGridProps {
  games: InstalledGame[];
  bypassByGameId: Record<string, boolean>;
  launchingId: string | null;
  motionDisabled: boolean;
  onLaunch: (game: InstalledGame) => void;
  onRemove: (game: InstalledGame) => void;
}

export default function InstalledGamesGrid({
  games,
  bypassByGameId,
  launchingId,
  motionDisabled,
  onLaunch,
  onRemove,
}: InstalledGamesGridProps) {
  const { t } = useI18n();

  return (
    <div
      className="grid gap-[length:var(--space-lg)]"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(clamp(${GAME_CARD_MIN_WIDTH_PX}px, 15vw, ${GAME_CARD_MAX_WIDTH_PX}px), 1fr))`,
      }}
      data-testid="installed-games-grid"
    >
      {games.map((game, index) => (
        <motion.div
          key={game.id}
          initial={motionDisabled ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: motionDisabled ? 0 : Math.min(index * 0.03, 0.3),
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <GameCardInstalled
            game={game}
            name={game.name}
            platformLabel={t(PLATFORM_LABEL_KEYS[game.platform])}
            bypassEnabled={bypassByGameId[game.id] === true}
            bypassLabel={t(
              bypassByGameId[game.id] === true
                ? "settings.games.installed.badge.bypassOn"
                : "settings.games.installed.badge.bypassOff"
            )}
            launchLabel={t("settings.games.installed.launch.action")}
            busy={launchingId === game.id}
            motionDisabled={motionDisabled}
            onLaunch={() => {
              onLaunch(game);
            }}
            onRemove={
              game.manual === true
                ? () => {
                    onRemove(game);
                  }
                : undefined
            }
          />
        </motion.div>
      ))}
    </div>
  );
}
