import { useMemo, useState } from "react";
import { FolderPlus, Plus, RefreshCw } from "lucide-react";

import AddGameDialog from "@/components/settings/games/AddGameDialog";
import GameBypassSettings from "@/components/settings/games/GameBypassSettings";
import GameFoldersDialog from "@/components/settings/games/GameFoldersDialog";
import GameLaunchPrompt from "@/components/settings/games/GameLaunchPrompt";
import GameScanIndicator from "@/components/settings/games/GameScanIndicator";
import InstalledGamesGrid from "@/components/settings/games/InstalledGamesGrid";
import { Button, Heading, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import { useInstalledGames } from "@/hooks/useInstalledGames";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { isBypassEnabled } from "@/lib/installedGames";
import { useSettingsStore } from "@/stores/useSettingsStore";

export default function Games() {
  const { t } = useI18n();
  const {
    games,
    folders,
    scanStatus,
    progress,
    addManualGame,
    removeGame,
    addFolder,
    removeFolder,
    rescan,
  } = useInstalledGames();
  const {
    launchingId,
    prompt,
    toast,
    runningGames,
    launch,
    closeGame,
    confirmPrompt,
    dismissPrompt,
  } = useGameLauncher();
  const bypassGames = useSettingsStore((state) => state.settings.games);
  const animationsOn = useSettingsStore(
    (state) => state.settings.appearance.animations
  );
  const canHover = useMediaQuery("(hover: hover)");
  const [addOpen, setAddOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const motionDisabled = !animationsOn || !canHover;
  const scanning = scanStatus === "scanning";

  const bypassByGameId = useMemo(
    () =>
      Object.fromEntries(
        games.map((game) => [game.id, isBypassEnabled(game, bypassGames)])
      ),
    [bypassGames, games]
  );

  return (
    <section className="flex flex-col gap-6 pb-8">
      <header className="flex flex-col gap-2">
        <Heading level={1}>{t("settings.games.title")}</Heading>
        <Text variant="body" size="lg" className="text-text-secondary">
          {t("settings.games.description")}
        </Text>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <GameScanIndicator
          scanning={scanning}
          found={games.length}
          progress={progress}
        />
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus aria-hidden="true" className="size-4" />}
          onClick={() => {
            setAddOpen(true);
          }}
        >
          {t("settings.games.installed.add.action")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<FolderPlus aria-hidden="true" className="size-4" />}
          onClick={() => {
            setFoldersOpen(true);
          }}
        >
          {t("settings.games.installed.folders.add")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={scanning}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
          onClick={() => {
            void rescan();
          }}
        >
          {t("settings.games.installed.rescan")}
        </Button>
        {toast === null ? null : (
          <span role="status" className="text-text-secondary text-sm">
            {toast}
          </span>
        )}
      </div>

      {games.length === 0 ? (
        <Text variant="body" size="sm" className="text-text-tertiary">
          {t("settings.games.installed.empty.title")} —{" "}
          {t("settings.games.installed.empty.body")}
        </Text>
      ) : (
        <InstalledGamesGrid
          games={games}
          bypassByGameId={bypassByGameId}
          launchingId={launchingId}
          motionDisabled={motionDisabled}
          onLaunch={(game) => {
            void launch(game);
          }}
          onRemove={(game) => {
            removeGame(game.id);
          }}
          onCloseGame={(game) => {
            void closeGame(game);
          }}
          runningGameIds={runningGames}
        />
      )}

      <GameBypassSettings
        focusId={focusId}
        onFocusHandled={() => {
          setFocusId(null);
        }}
      />

      <AddGameDialog
        open={addOpen}
        bypassOptions={bypassGames}
        onClose={() => {
          setAddOpen(false);
        }}
        onAdd={(game) => {
          addManualGame(game);
          setFocusId(game.gameSettingsId ?? null);
        }}
      />
      <GameFoldersDialog
        open={foldersOpen}
        folders={folders}
        scanning={scanning}
        onClose={() => {
          setFoldersOpen(false);
        }}
        onAdd={addFolder}
        onRemove={removeFolder}
      />
      <GameLaunchPrompt
        prompt={prompt}
        onConfirm={() => {
          void confirmPrompt();
        }}
        onCancel={dismissPrompt}
      />
    </section>
  );
}
