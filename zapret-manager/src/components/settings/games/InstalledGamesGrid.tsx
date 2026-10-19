import CardEntrance from "@/components/shared/CardEntrance";
import GameCardInstalled from "@/components/settings/games/GameCardInstalled";
import { usePostProcessing } from "@/contexts/postProcessing";
import { useI18n } from "@/i18n";
import {
  GAME_CARD_MAX_WIDTH_PX,
  GAME_CARD_MIN_WIDTH_PX,
} from "@/lib/constants";
import { MOTION_BLUR_MAX_PX } from "@/lib/postProcessingTokens";
import { PLATFORM_LABEL_KEYS } from "@/lib/installedGames";
import type { InstalledGame } from "@/types";

export interface InstalledGamesGridProps {
  games: InstalledGame[];
  bypassByGameId: Record<string, boolean>;
  launchingId: string | null;
  motionDisabled: boolean;
  onLaunch: (game: InstalledGame) => void;
  onRemove: (game: InstalledGame) => void;
  onCloseGame: (game: InstalledGame) => void;
  onDiagnose: (game: InstalledGame) => void;
  runningGameIds: Record<string, number[]>;
}

export default function InstalledGamesGrid({
  games,
  bypassByGameId,
  launchingId,
  motionDisabled,
  onLaunch,
  onRemove,
  onCloseGame,
  onDiagnose,
  runningGameIds,
}: InstalledGamesGridProps) {
  const { t } = useI18n();
  const { motionBlur, intensity } = usePostProcessing();
  const blurPx = motionBlur ? MOTION_BLUR_MAX_PX[intensity] * 2 : 0;

  return (
    <div
      className="grid gap-[length:var(--space-lg)]"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(clamp(${GAME_CARD_MIN_WIDTH_PX}px, 15vw, ${GAME_CARD_MAX_WIDTH_PX}px), 1fr))`,
      }}
      data-testid="installed-games-grid"
    >
      {games.map((game, index) => (
        <CardEntrance
          key={game.id}
          index={index}
          maxDelaySeconds={0.3}
          duration={0.3}
          blurPx={blurPx}
          disabled={motionDisabled}
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
            running={(runningGameIds[game.id]?.length ?? 0) > 0}
            onClose={
              (runningGameIds[game.id]?.length ?? 0) === 0
                ? undefined
                : () => {
                    onCloseGame(game);
                  }
            }
            removeLabel={t("settings.games.installed.removeGame")}
            onRemove={() => {
              onRemove(game);
            }}
            diagnoseLabel={t("settings.games.installed.diagnose.action")}
            onDiagnose={() => {
              onDiagnose(game);
            }}
          />
        </CardEntrance>
      ))}
    </div>
  );
}
