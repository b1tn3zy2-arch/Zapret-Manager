// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useState } from "react";
// Импортируем зависимости из модуля @tauri-apps/plugin-dialog.
import { open as openDialog, save } from "@tauri-apps/plugin-dialog";
// Импортируем зависимости из модуля @tauri-apps/plugin-fs.
import { readTextFile } from "@tauri-apps/plugin-fs";
// Импортируем зависимости из модуля lucide-react.
import { ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/games/AddGameButton.
import AddGameButton from "@/components/settings/games/AddGameButton";
// Импортируем зависимости из модуля @/components/settings/games/GameCard.
import GameCard from "@/components/settings/games/GameCard";
// Импортируем зависимости из модуля @/components/ui.
import { Button, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useGameLibrary.
import { useGameLibrary } from "@/hooks/useGameLibrary";
// Импортируем зависимости из модуля @/lib/gameFile.
import { parseGameFile, writeGameFile } from "@/lib/gameFile";
// Импортируем зависимости из модуля @/lib/settingsLimits.
import { MAX_GAMES } from "@/lib/settingsLimits";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameBypassSettingsProps {
  // Обрабатываем конструкцию: focusId.
  focusId: string | null;
  // Обрабатываем конструкцию: onFocusHandled.
  onFocusHandled: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию safeFileName.
function safeFileName(name: string): string {
  // Обрабатываем конструкцию: const slug = name .trim() .toLowerCase() .replace(/[^a-….
  const slug = name
    // Продолжаем цепочку вызовов.
    .trim()
    // Продолжаем цепочку вызовов.
    .toLowerCase()
    // Продолжаем цепочку вызовов.
    .replace(/[^a-z0-9]+/g, "-")
    // Продолжаем цепочку вызовов.
    .replace(/^-+|-+$/g, "");
  // — разделитель логических блоков —

  // Возвращаем результат: ${slug === ? game : slug}.game.json.
  return `${slug === "" ? "game" : slug}.game.json`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function GameBypassSettings({
  // Обрабатываем конструкцию: focusId.
  focusId,
  // Обрабатываем конструкцию: onFocusHandled.
  onFocusHandled,
  // Закрываем текущий блок.
}: GameBypassSettingsProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [expandedId, setExpandedId] = useState<string | n….
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [open, setOpen] = useState(false).
  const [open, setOpen] = useState(false);
  // Обрабатываем конструкцию: const [pendingDelete, setPendingDelete] = useState<Game….
  const [pendingDelete, setPendingDelete] = useState<GameSettings | null>(null);
  // Обрабатываем конструкцию: const { games, updateGame, addGame, removeGame, resetGa….
  const { games, updateGame, addGame, removeGame, resetGames } =
    // Обрабатываем конструкцию: useGameLibrary.
    useGameLibrary();
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const isOpen = open || focusId !== null.
  const isOpen = open || focusId !== null;
  // Обрабатываем конструкцию: const activeId = focusId ?? expandedId.
  const activeId = focusId ?? expandedId;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: focusId === null.
    if (focusId === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document
      // Продолжаем цепочку вызовов.
      .getElementById("games-bypass-section")
      // Обрабатываем конструкцию: ?..
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Обрабатываем конструкцию: onFocusHandled.
    onFocusHandled();
    // Закрываем текущий блок.
  }, [focusId, onFocusHandled]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleExport = useCallback( (game: GameSettings):….
  const handleExport = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (game: GameSettings): void => {
      // Обрабатываем конструкцию: void (async () => { try { const path = await save({ def….
      void (async () => {
        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Обрабатываем конструкцию: const path = await save({ defaultPath: safeFileName(gam….
          const path = await save({
            // Обрабатываем конструкцию: defaultPath.
            defaultPath: safeFileName(game.name),
            // Обрабатываем конструкцию: filters.
            filters: [
              // Открываем объектный литерал.
              { name: t("settings.games.fileDialog"), extensions: ["json"] },
              // Закрываем массив или список.
            ],
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: typeof path !== string || path ===.
          if (typeof path !== "string" || path === "") {
            // Завершаем функцию без возвращаемого значения.
            return;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Ожидаем завершение асинхронной операции await writeGameFile(path, game).
          await writeGameFile(path, game);
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "success",
            // Обрабатываем конструкцию: source.
            source: "user",
            // Обрабатываем конструкцию: message.
            message: t("settings.games.exported", { name: game.name }),
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        } catch (caught) {
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "error",
            // Обрабатываем конструкцию: source.
            source: "user",
            // Обрабатываем конструкцию: message.
            message: t("settings.games.exportFailed", {
              // Обрабатываем конструкцию: error.
              error: toErrorMessage(caught),
              // Закрываем текущий блок.
            }),
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })();
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleImport = useCallback( (game: GameSettings):….
  const handleImport = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (game: GameSettings): void => {
      // Обрабатываем конструкцию: void (async () => { try { const path = await openDialog….
      void (async () => {
        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Обрабатываем конструкцию: const path = await openDialog({ multiple: false, direct….
          const path = await openDialog({
            // Обрабатываем конструкцию: multiple.
            multiple: false,
            // Обрабатываем конструкцию: directory.
            directory: false,
            // Обрабатываем конструкцию: filters.
            filters: [
              // Открываем объектный литерал.
              { name: t("settings.games.fileDialog"), extensions: ["json"] },
              // Закрываем массив или список.
            ],
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: typeof path !== string || path ===.
          if (typeof path !== "string" || path === "") {
            // Завершаем функцию без возвращаемого значения.
            return;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: const parsed = parseGameFile(await readTextFile(path)).
          const parsed = parseGameFile(await readTextFile(path));
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: parsed === null.
          if (parsed === null) {
            // Обрабатываем конструкцию: addLog.
            addLog({
              // Обрабатываем конструкцию: level.
              level: "error",
              // Обрабатываем конструкцию: source.
              source: "user",
              // Обрабатываем конструкцию: message.
              message: t("settings.games.importInvalid"),
              // Закрываем текущий блок.
            });
            // Завершаем функцию без возвращаемого значения.
            return;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: updateGame.
          updateGame(game.id, {
            // Обрабатываем конструкцию: domains.
            domains: parsed.domains,
            // Обрабатываем конструкцию: ipRanges.
            ipRanges: parsed.ipRanges,
            // Обрабатываем конструкцию: ports.
            ports: parsed.ports,
            // Закрываем текущий блок.
          });
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "success",
            // Обрабатываем конструкцию: source.
            source: "user",
            // Обрабатываем конструкцию: message.
            message: t("settings.games.imported", { name: game.name }),
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        } catch (caught) {
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "error",
            // Обрабатываем конструкцию: source.
            source: "user",
            // Обрабатываем конструкцию: message.
            message: t("settings.games.importFailed", {
              // Обрабатываем конструкцию: error.
              error: toErrorMessage(caught),
              // Закрываем текущий блок.
            }),
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })();
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, updateGame, t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <section id=games-bypass-section className=flex flex-….
  return (
    // Обрабатываем конструкцию: <section id=games-bypass-section className=flex flex-co….
    <section id="games-bypass-section" className="flex flex-col gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <Button
        // Обрабатываем конструкцию: variant.
        variant="ghost"
        // Обрабатываем конструкцию: className.
        className="self-start"
        // Обрабатываем конструкцию: icon.
        icon={
          // Обрабатываем конструкцию: open.
          open ? (
            // Рендерим самозакрывающийся элемент ChevronUp.
            <ChevronUp aria-hidden="true" className="size-4" />
          ) : (
            // Продолжаем предыдущую конструкцию.
            // Закрываем выражение или список аргументов.
            // Рендерим самозакрывающийся элемент ChevronDown.
            <ChevronDown aria-hidden="true" className="size-4" />
            // Закрываем выражение или список аргументов.
          )
          // Закрываем текущий блок.
        }
        // Обрабатываем конструкцию: onClick.
        onClick={() => {
          // Обрабатываем конструкцию: setOpen.
          setOpen((value) => !value);
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {t("settings.games.installed.bypassSettings")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Button>
      {/* Выводим текстовое содержимое в JSX. */}
      {isOpen ? (
        // Обрабатываем конструкцию: <>.
        <>
          {/* Выводим текстовое содержимое в JSX. */}
          {games.length === 0 ? (
            // Обрабатываем конструкцию: <Text variant=body size=sm className=text-text-tertiary….
            <Text variant="body" size="sm" className="text-text-tertiary">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.empty")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
          {games.map((game) => (
            // Рендерим самозакрывающийся элемент GameCard.
            <GameCard
              // Обрабатываем конструкцию: key.
              key={game.id}
              // Обрабатываем конструкцию: game.
              game={game}
              // Обрабатываем конструкцию: expanded.
              expanded={activeId === game.id}
              // Обрабатываем конструкцию: onToggleExpand.
              onToggleExpand={() => {
                // Обрабатываем конструкцию: setExpandedId.
                setExpandedId(
                  // Продолжаем предыдущую конструкцию.
                  (current) =>
                    // Обрабатываем конструкцию: current.
                    current === game.id ? null : game.id
                  // Закрываем выражение или список аргументов.
                );
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: onToggleEnabled.
              onToggleEnabled={(value) => {
                // Обрабатываем конструкцию: updateGame.
                updateGame(game.id, { enabled: value });
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: onChange.
              onChange={(patch) => {
                // Обрабатываем конструкцию: updateGame.
                updateGame(game.id, patch);
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: onDelete.
              onDelete={() => {
                // Сохраняем пояснение разработчика: // встроенные игры возвращаются кнопкой сброса, поэтому
                // встроенные игры возвращаются кнопкой сброса, поэтому
                // Сохраняем пояснение разработчика: // подтверждаем: список доменов у них обширный, и потерять
                // подтверждаем: список доменов у них обширный, и потерять
                // Сохраняем пояснение разработчика: // его по неловкому клику обидно
                // его по неловкому клику обидно
                // Проверяем бизнес-условие: game.builtin === true.
                if (game.builtin === true) {
                  // Обрабатываем конструкцию: setPendingDelete.
                  setPendingDelete(game);
                  // — разделитель логических блоков —

                  // Завершаем функцию без возвращаемого значения.
                  return;
                  // Закрываем текущий блок.
                }
                // — разделитель логических блоков —

                // Обрабатываем конструкцию: removeGame.
                removeGame(game.id);
                // Обрабатываем конструкцию: setExpandedId.
                setExpandedId(
                  // Продолжаем предыдущую конструкцию.
                  (current) =>
                    // Обрабатываем конструкцию: current.
                    current === game.id ? null : current
                  // Закрываем выражение или список аргументов.
                );
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: onImport.
              onImport={() => {
                // Обрабатываем конструкцию: handleImport.
                handleImport(game);
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: onExport.
              onExport={() => {
                // Обрабатываем конструкцию: handleExport.
                handleExport(game);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            />
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
          <AddGameButton
            // Обрабатываем конструкцию: disabled.
            disabled={games.length >= MAX_GAMES}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: const created = addGame().
              const created = addGame();
              // — разделитель логических блоков —

              // Обрабатываем конструкцию: setExpandedId.
              setExpandedId(created?.id ?? null);
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="ghost"
            // Обрабатываем конструкцию: onClick.
            onClick={resetGames}
            // Обрабатываем конструкцию: icon.
            icon={
              // Рендерим самозакрывающийся элемент RotateCcw.
              <RotateCcw
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-3.5"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.reset")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Modal
        // Обрабатываем конструкцию: open.
        open={pendingDelete !== null}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setPendingDelete.
          setPendingDelete(null);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: title.
        title={t("settings.games.deleteTitle")}
        // Обрабатываем конструкцию: {...(pendingDelete === null ? {} : { description: t(set….
        {...(pendingDelete === null
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            {}
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            {
              // Обрабатываем конструкцию: description.
              description: t("settings.games.deleteBody", {
                // Обрабатываем конструкцию: name.
                name: pendingDelete.name,
                // Закрываем текущий блок.
              }),
              // Закрываем текущий блок.
            })}
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: footer.
        footer={
          // Обрабатываем конструкцию: <>.
          <>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="ghost"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: setPendingDelete.
                setPendingDelete(null);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.common.cancel")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="danger"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Проверяем бизнес-условие: pendingDelete !== null.
                if (pendingDelete !== null) {
                  // Обрабатываем конструкцию: removeGame.
                  removeGame(pendingDelete.id);
                  // Обрабатываем конструкцию: setExpandedId.
                  setExpandedId(
                    // Продолжаем предыдущую конструкцию.
                    (current) =>
                      // Обрабатываем конструкцию: current.
                      current === pendingDelete.id ? null : current
                    // Закрываем выражение или список аргументов.
                  );
                  // Закрываем текущий блок.
                }
                // — разделитель логических блоков —

                // Обрабатываем конструкцию: setPendingDelete.
                setPendingDelete(null);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.deleteConfirm")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
          </>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.deleteBody", { name: pendingDelete?.name ?? "" })}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </Modal>
      {/* Выводим текстовое содержимое в JSX. */}
    </section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
