import { useCallback, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderPlus, Image, Pencil, Plus, Trash2 } from "lucide-react";

import AddGameDialog from "@/components/settings/games/AddGameDialog";
import GameBypassSettings from "@/components/settings/games/GameBypassSettings";
import GameContextMenu, {
  type GameContextMenuItem,
} from "@/components/settings/games/GameContextMenu";
import GameFoldersDialog from "@/components/settings/games/GameFoldersDialog";
import GameLaunchPrompt from "@/components/settings/games/GameLaunchPrompt";
import GameScanIndicator from "@/components/settings/games/GameScanIndicator";
import InstalledGamesGrid from "@/components/settings/games/InstalledGamesGrid";
import { Button, Heading, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useDeviceTier, usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import { useInstalledGames } from "@/hooks/useInstalledGames";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { isBypassEnabled } from "@/lib/installedGames";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { InstalledGame } from "@/types";

interface ContextState {
  game: InstalledGame;
  x: number;
  y: number;
}

export default function Games() {
  const { t } = useI18n();
  const {
    games,
    folders,
    scanStatus,
    progress,
    addManualGame,
    removeGame,
    updateGame,
    addFolder,
    removeFolder,
  } = useInstalledGames();
  const { launchingId, prompt, toast, launch, confirmPrompt, dismissPrompt } =
    useGameLauncher();
  const bypassGames = useSettingsStore((state) => state.settings.games);
  const addLog = useLogsStore((state) => state.addLog);
  const tier = useDeviceTier();
  const reducedMotion = usePrefersReducedMotion();
  const canHover = useMediaQuery("(hover: hover)");
  const [addOpen, setAddOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [context, setContext] = useState<ContextState | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const motionDisabled = reducedMotion || tier === "low" || !canHover;
  const scanning = scanStatus === "scanning";

  const bypassByGameId = useMemo(
    () =>
      Object.fromEntries(
        games.map((game) => [game.id, isBypassEnabled(game, bypassGames)])
      ),
    [bypassGames, games]
  );

  const pickCover = useCallback(
    async (game: InstalledGame): Promise<void> => {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: [
          { name: "cover", extensions: ["jpg", "jpeg", "png", "webp"] },
        ],
      });

      if (typeof selected !== "string") {
        return;
      }

      try {
        const cover = await invoke<string>("import_game_cover", {
          sourcePath: selected,
        });

        updateGame(game.id, { coverUrl: cover });
        addLog({
          level: "success",
          source: "user",
          message: t("settings.games.installed.cover.ready"),
        });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: t("settings.games.installed.cover.pickFailed", {
            error: caught instanceof Error ? caught.message : String(caught),
          }),
        });
      }
    },
    [addLog, t, updateGame]
  );

  const contextItems = useMemo<GameContextMenuItem[]>(() => {
    if (context === null) {
      return [];
    }

    return [
      {
        key: "folder",
        label: t("settings.games.installed.context.openFolder"),
        icon: FolderPlus,
        onSelect: () => {
          void invoke("open_folder", { path: context.game.installPath });
        },
      },
      {
        key: "configure",
        label: t("settings.games.installed.context.configure"),
        icon: Pencil,
        onSelect: () => {
          setFocusId(context.game.gameSettingsId ?? null);
        },
      },
      {
        key: "cover",
        label: t("settings.games.installed.context.changeCover"),
        icon: Image,
        onSelect: () => {
          void pickCover(context.game);
        },
      },
      {
        key: "remove",
        label: t("settings.games.installed.context.remove"),
        icon: Trash2,
        danger: true,
        onSelect: () => {
          removeGame(context.game.id);
        },
      },
    ];
  }, [context, pickCover, removeGame, t]);

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
        <div
          onContextMenu={(event) => {
            const card = (event.target as HTMLElement).closest(
              "[data-game-id]"
            );

            if (card === null) {
              return;
            }

            const game = games.find(
              (item) => item.id === card.getAttribute("data-game-id")
            );

            if (game !== undefined) {
              event.preventDefault();
              setContext({ game, x: event.clientX, y: event.clientY });
            }
          }}
        >
          <InstalledGamesGrid
            games={games}
            bypassByGameId={bypassByGameId}
            launchingId={launchingId}
            motionDisabled={motionDisabled}
            onLaunch={(game) => {
              void launch(game);
            }}
            onOpenMenu={(game) => {
              setContext({ game, x: 0, y: 0 });
            }}
          />
        </div>
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
      <GameContextMenu
        open={context !== null}
        x={context?.x ?? 0}
        y={context?.y ?? 0}
        items={contextItems}
        onClose={() => {
          setContext(null);
        }}
      />
    </section>
  );
}
