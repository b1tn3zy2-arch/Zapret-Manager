import { useCallback, useEffect, useState } from "react";
import { open as openDialog, save } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";

import AddGameButton from "@/components/settings/games/AddGameButton";
import GameCard from "@/components/settings/games/GameCard";
import { Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useGameLibrary } from "@/hooks/useGameLibrary";
import { parseGameFile, writeGameFile } from "@/lib/gameFile";
import { MAX_GAMES } from "@/lib/settingsLimits";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import type { GameSettings } from "@/types";

export interface GameBypassSettingsProps {
  focusId: string | null;
  onFocusHandled: () => void;
}

function safeFileName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug === "" ? "game" : slug}.game.json`;
}

export default function GameBypassSettings({
  focusId,
  onFocusHandled,
}: GameBypassSettingsProps) {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const { games, updateGame, addGame, removeGame, resetGames } =
    useGameLibrary();
  const addLog = useLogsStore((state) => state.addLog);

  const isOpen = open || focusId !== null;
  const activeId = focusId ?? expandedId;

  useEffect(() => {
    if (focusId === null) {
      return;
    }

    document
      .getElementById("games-bypass-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    onFocusHandled();
  }, [focusId, onFocusHandled]);

  const handleExport = useCallback(
    (game: GameSettings): void => {
      void (async () => {
        try {
          const path = await save({
            defaultPath: safeFileName(game.name),
            filters: [
              { name: t("settings.games.fileDialog"), extensions: ["json"] },
            ],
          });

          if (typeof path !== "string" || path === "") {
            return;
          }

          await writeGameFile(path, game);
          addLog({
            level: "success",
            source: "user",
            message: t("settings.games.exported", { name: game.name }),
          });
        } catch (caught) {
          addLog({
            level: "error",
            source: "user",
            message: t("settings.games.exportFailed", {
              error: toErrorMessage(caught),
            }),
          });
        }
      })();
    },
    [addLog, t]
  );

  const handleImport = useCallback(
    (game: GameSettings): void => {
      void (async () => {
        try {
          const path = await openDialog({
            multiple: false,
            directory: false,
            filters: [
              { name: t("settings.games.fileDialog"), extensions: ["json"] },
            ],
          });

          if (typeof path !== "string" || path === "") {
            return;
          }

          const parsed = parseGameFile(await readTextFile(path));

          if (parsed === null) {
            addLog({
              level: "error",
              source: "user",
              message: t("settings.games.importInvalid"),
            });
            return;
          }

          updateGame(game.id, {
            domains: parsed.domains,
            ipRanges: parsed.ipRanges,
            ports: parsed.ports,
          });
          addLog({
            level: "success",
            source: "user",
            message: t("settings.games.imported", { name: game.name }),
          });
        } catch (caught) {
          addLog({
            level: "error",
            source: "user",
            message: t("settings.games.importFailed", {
              error: toErrorMessage(caught),
            }),
          });
        }
      })();
    },
    [addLog, updateGame, t]
  );

  return (
    <section id="games-bypass-section" className="flex flex-col gap-3">
      <Button
        variant="ghost"
        className="self-start"
        icon={
          open ? (
            <ChevronUp aria-hidden="true" className="size-4" />
          ) : (
            <ChevronDown aria-hidden="true" className="size-4" />
          )
        }
        onClick={() => {
          setOpen((value) => !value);
        }}
      >
        {t("settings.games.installed.bypassSettings")}
      </Button>
      {isOpen ? (
        <>
          {games.length === 0 ? (
            <Text variant="body" size="sm" className="text-text-tertiary">
              {t("settings.games.empty")}
            </Text>
          ) : null}
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              expanded={activeId === game.id}
              onToggleExpand={() => {
                setExpandedId((current) =>
                  current === game.id ? null : game.id
                );
              }}
              onToggleEnabled={(value) => {
                updateGame(game.id, { enabled: value });
              }}
              onChange={(patch) => {
                updateGame(game.id, patch);
              }}
              onDelete={() => {
                removeGame(game.id);
                setExpandedId((current) =>
                  current === game.id ? null : current
                );
              }}
              onImport={() => {
                handleImport(game);
              }}
              onExport={() => {
                handleExport(game);
              }}
            />
          ))}
          <AddGameButton
            disabled={games.length >= MAX_GAMES}
            onClick={() => {
              const created = addGame();

              setExpandedId(created?.id ?? null);
            }}
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={resetGames}
            icon={
              <RotateCcw
                aria-hidden="true"
                className="size-3.5"
                strokeWidth={2}
              />
            }
          >
            {t("settings.games.reset")}
          </Button>
        </>
      ) : null}
    </section>
  );
}
