import { useCallback, useState } from "react";
import { RotateCcw } from "lucide-react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

import AddGameButton from "@/components/settings/games/AddGameButton";
import GameCard from "@/components/settings/games/GameCard";
import { Button, Heading, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useGameLibrary } from "@/hooks/useGameLibrary";
import { useLogsStore } from "@/stores/useLogsStore";
import { parseGameFile, writeGameFile } from "@/lib/gameFile";
import { MAX_GAMES } from "@/lib/settingsLimits";
import { toErrorMessage } from "@/lib/utils";
import type { GameSettings } from "@/types";

function safeFileName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${slug === "" ? "game" : slug}.game.json`;
}

export default function Games() {
  const { t } = useI18n();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { games, updateGame, addGame, removeGame, resetGames } =
    useGameLibrary();
  const addLog = useLogsStore((state) => state.addLog);

  const handleExport = useCallback(
    (game: GameSettings): void => {
      void (async () => {
        try {
          const path = await save({
            defaultPath: safeFileName(game.name),
            filters: [{ name: "Игра", extensions: ["json"] }],
          });

          if (typeof path !== "string" || path === "") {
            return;
          }

          await writeGameFile(path, game);
          addLog({
            level: "success",
            source: "user",
            message: `Игра выгружена: ${game.name}`,
          });
        } catch (caught) {
          addLog({
            level: "error",
            source: "user",
            message: `Не удалось выгрузить игру: ${toErrorMessage(caught)}`,
          });
        }
      })();
    },
    [addLog]
  );

  const handleImport = useCallback(
    (game: GameSettings): void => {
      void (async () => {
        try {
          const path = await open({
            multiple: false,
            directory: false,
            filters: [{ name: "Игра", extensions: ["json"] }],
          });

          if (typeof path !== "string" || path === "") {
            return;
          }

          const parsed = parseGameFile(await readTextFile(path));

          if (parsed === null) {
            addLog({
              level: "error",
              source: "user",
              message: "Файл не похож на описание игры",
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
            message: `Список загружен в игру ${game.name}`,
          });
        } catch (caught) {
          addLog({
            level: "error",
            source: "user",
            message: `Не удалось загрузить игру: ${toErrorMessage(caught)}`,
          });
        }
      })();
    },
    [addLog, updateGame]
  );

  return (
    <section className="flex flex-col gap-6 pb-8">
      <header className="flex flex-col gap-2">
        <Heading level={1}>{t("settings.games.title")}</Heading>
        <Text variant="body" size="lg" className="text-text-secondary">
          {t("settings.games.description")}
        </Text>
      </header>

      <div className="flex flex-col gap-3">
        {games.length === 0 ? (
          <Text variant="body" size="sm" className="text-text-tertiary">
            {t("settings.games.empty")}
          </Text>
        ) : null}

        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            expanded={expandedId === game.id}
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

        <Text variant="caption" size="sm" className="text-text-tertiary">
          {t("settings.games.hint")}
        </Text>
      </div>
    </section>
  );
}
