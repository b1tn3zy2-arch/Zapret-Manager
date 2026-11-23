// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useMemo, useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { FolderPlus, Gamepad2, Plus, RefreshCw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/games/AddGameDialog.
import AddGameDialog from "@/components/settings/games/AddGameDialog";
// Импортируем зависимости из модуля @/components/settings/games/GameBypassSettings.
import GameBypassSettings from "@/components/settings/games/GameBypassSettings";
// Импортируем зависимости из модуля @/components/settings/games/GameDiagnostics.
import GameDiagnostics from "@/components/settings/games/GameDiagnostics";
// Импортируем зависимости из модуля @/components/settings/games/GameFoldersDialog.
import GameFoldersDialog from "@/components/settings/games/GameFoldersDialog";
// Импортируем зависимости из модуля @/components/settings/games/GameLaunchPrompt.
import GameLaunchPrompt from "@/components/settings/games/GameLaunchPrompt";
// Импортируем зависимости из модуля @/components/settings/games/GameScanIndicator.
import GameScanIndicator from "@/components/settings/games/GameScanIndicator";
// Импортируем зависимости из модуля @/components/settings/games/InstalledGamesGrid.
import InstalledGamesGrid from "@/components/settings/games/InstalledGamesGrid";
// Импортируем зависимости из модуля @/components/shared/ErrorBanner.
import ErrorBanner from "@/components/shared/ErrorBanner";
// Импортируем зависимости из модуля @/components/shared/EmptyState.
import EmptyState from "@/components/shared/EmptyState";
// Импортируем зависимости из модуля @/components/ui.
import { Button, Heading, Modal, Skeleton, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useGameLauncher.
import { useGameLauncher } from "@/hooks/useGameLauncher";
// Импортируем зависимости из модуля @/hooks/useGameProcessWatch.
import { useGameProcessWatch } from "@/hooks/useGameProcessWatch";
// Импортируем зависимости из модуля @/hooks/useInstalledGames.
import { useInstalledGames } from "@/hooks/useInstalledGames";
// Импортируем зависимости из модуля @/hooks/useMediaQuery.
import { useMediaQuery } from "@/hooks/useMediaQuery";
// Импортируем зависимости из модуля @/lib/installedGames.
import { isBypassEnabled } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт GAME_CARD_MAX_WIDTH_PX.
  GAME_CARD_MAX_WIDTH_PX,
  // Подключаем именованный импорт GAME_CARD_MIN_WIDTH_PX.
  GAME_CARD_MIN_WIDTH_PX,
  // Подключаем именованный импорт GAME_COVER_ASPECT.
  GAME_COVER_ASPECT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Games() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { games, folders, scanStatus, progress, coverProg….
  const {
    // Обрабатываем конструкцию: games.
    games,
    // Обрабатываем конструкцию: folders.
    folders,
    // Обрабатываем конструкцию: scanStatus.
    scanStatus,
    // Обрабатываем конструкцию: progress.
    progress,
    // Обрабатываем конструкцию: coverProgress.
    coverProgress,
    // Обрабатываем конструкцию: error.
    error,
    // Обрабатываем конструкцию: addManualGame.
    addManualGame,
    // Обрабатываем конструкцию: removeGame.
    removeGame,
    // Обрабатываем конструкцию: addFolder.
    addFolder,
    // Обрабатываем конструкцию: removeFolder.
    removeFolder,
    // Обрабатываем конструкцию: rescan.
    rescan,
    // Закрываем текущий блок.
  } = useInstalledGames();
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Игры, запущенные вне приложения, тоже должны закрываться …
  // Игры, запущенные вне приложения, тоже должны закрываться из
  // Сохраняем пояснение разработчика: // приложения: их находит поиск по пути к файлу.
  // приложения: их находит поиск по пути к файлу.
  // Обрабатываем конструкцию: useGameProcessWatch.
  useGameProcessWatch(games);
  // Обрабатываем конструкцию: const { launchingId, prompt, toast, runningGames, runni….
  const {
    // Обрабатываем конструкцию: launchingId.
    launchingId,
    // Обрабатываем конструкцию: prompt.
    prompt,
    // Обрабатываем конструкцию: toast.
    toast,
    // Обрабатываем конструкцию: runningGames.
    runningGames,
    // Обрабатываем конструкцию: runningByPath.
    runningByPath,
    // Обрабатываем конструкцию: diagnosis.
    diagnosis,
    // Обрабатываем конструкцию: launch.
    launch,
    // Обрабатываем конструкцию: closeGame.
    closeGame,
    // Обрабатываем конструкцию: choosePrompt.
    choosePrompt,
    // Обрабатываем конструкцию: launchWithVpn.
    launchWithVpn,
    // Обрабатываем конструкцию: rechooseLaunchMode.
    rechooseLaunchMode,
    // Обрабатываем конструкцию: dismissPrompt.
    dismissPrompt,
    // Обрабатываем конструкцию: diagnose.
    diagnose,
    // Обрабатываем конструкцию: dismissDiagnosis.
    dismissDiagnosis,
    // Обрабатываем конструкцию: bypassFailed.
    bypassFailed,
    // Обрабатываем конструкцию: dismissBypassFailure.
    dismissBypassFailure,
    // Обрабатываем конструкцию: retryLaunch.
    retryLaunch,
    // Обрабатываем конструкцию: enableVpn.
    enableVpn,
    // Обрабатываем конструкцию: restartBypass.
    restartBypass,
    // Закрываем текущий блок.
  } = useGameLauncher();
  // Обрабатываем конструкцию: const strategies = useStrategiesStore((state) => state.….
  const strategies = useStrategiesStore((state) => state.strategies);
  // Сохраняем пояснение разработчика: // Обход считается работающим, если поднята хотя бы одна стр…
  // Обход считается работающим, если поднята хотя бы одна стратегия.
  // Обрабатываем конструкцию: const bypassRunning = strategies.some((item) => item.st….
  const bypassRunning = strategies.some((item) => item.status === "running");
  // Обрабатываем конструкцию: const bypassGames = useSettingsStore((state) => state.s….
  const bypassGames = useSettingsStore((state) => state.settings.games);
  // Обрабатываем конструкцию: const animationsOn = useSettingsStore( (state) => state….
  const animationsOn = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.appearance.animations
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const canHover = useMediaQuery((hover: hover)).
  const canHover = useMediaQuery("(hover: hover)");
  // Обрабатываем конструкцию: const [addOpen, setAddOpen] = useState(false).
  const [addOpen, setAddOpen] = useState(false);
  // Обрабатываем конструкцию: const [foldersOpen, setFoldersOpen] = useState(false).
  const [foldersOpen, setFoldersOpen] = useState(false);
  // Обрабатываем конструкцию: const [focusId, setFocusId] = useState<string | null>(n….
  const [focusId, setFocusId] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [pendingRemove, setPendingRemove] = useState<Inst….
  const [pendingRemove, setPendingRemove] = useState<InstalledGame | null>(
    // Обрабатываем конструкцию: null.
    null
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const motionDisabled = !animationsOn || !canHover.
  const motionDisabled = !animationsOn || !canHover;
  // Обрабатываем конструкцию: const scanning = scanStatus === scanning.
  const scanning = scanStatus === "scanning";
  // Сохраняем пояснение разработчика: // До первого скана статус «idle»: это тоже загрузка, иначе …
  // До первого скана статус «idle»: это тоже загрузка, иначе на долю
  // Сохраняем пояснение разработчика: // секунды мелькает «Игры не найдены», а потом появляются ка…
  // секунды мелькает «Игры не найдены», а потом появляются карточки.
  // Обрабатываем конструкцию: const gamesLoading = scanStatus === idle || scanning.
  const gamesLoading = scanStatus === "idle" || scanning;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const bypassByGameId = useMemo( () => Object.fromEntrie….
  const bypassByGameId = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: Object.
      Object.fromEntries(
        // Обрабатываем конструкцию: games.
        games.map((game) => [game.id, isBypassEnabled(game, bypassGames)])
        // Закрываем выражение или список аргументов.
      ),
    // Открываем массив.
    [bypassGames, games]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRemove = (game: InstalledGame): void => { /….
  const handleRemove = (game: InstalledGame): void => {
    // Сохраняем пояснение разработчика: // найденную игру сканер увидит снова, поэтому спрашиваем по…
    // найденную игру сканер увидит снова, поэтому спрашиваем подтверждение;
    // Сохраняем пояснение разработчика: // добавленную вручную просто убираем — вернуть её можно тол…
    // добавленную вручную просто убираем — вернуть её можно только вручную
    // Проверяем бизнес-условие: game.manual === true.
    if (game.manual === true) {
      // Обрабатываем конструкцию: removeGame.
      removeGame(game.id);
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setPendingRemove.
    setPendingRemove(game);
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <section className=flex flex-col gap-6 pb-8> <header ….
  return (
    // Обрабатываем конструкцию: <section className=flex flex-col gap-6 pb-8>.
    <section className="flex flex-col gap-6 pb-8">
      {/* Выводим текстовое содержимое в JSX. */}
      <header className="flex flex-col gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Heading level={1}>{t("settings.games.title")}</Heading>
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="lg" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.description")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </header>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <GameScanIndicator
          // Обрабатываем конструкцию: scanning.
          scanning={scanning}
          // Обрабатываем конструкцию: found.
          found={games.length}
          // Обрабатываем конструкцию: progress.
          progress={progress}
          // Обрабатываем конструкцию: coverProgress.
          coverProgress={coverProgress}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: icon.
          icon={<Plus aria-hidden="true" className="size-4" />}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: setAddOpen.
            setAddOpen(true);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.add.action")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: icon.
          icon={<FolderPlus aria-hidden="true" className="size-4" />}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: setFoldersOpen.
            setFoldersOpen(true);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.folders.add")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: disabled.
          disabled={scanning}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void rescan().
            void rescan();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.rescan")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
        {toast === null ? null : (
          // Обрабатываем конструкцию: <span role=status className=text-text-secondary text-sm….
          <span role="status" className="text-text-secondary text-sm">
            {/* Выводим текстовое содержимое в JSX. */}
            {toast}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {error === null ? null : (
        // Рендерим самозакрывающийся элемент ErrorBanner.
        <ErrorBanner
          // Обрабатываем конструкцию: message.
          message={error}
          // Обрабатываем конструкцию: onRetry.
          onRetry={() => {
            // Обрабатываем конструкцию: void rescan().
            void rescan();
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      )}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {games.length === 0 && gamesLoading ? (
        // Обрабатываем конструкцию: <div className=grid gap-[length:var(--space-lg)] style=….
        <div
          // Обрабатываем конструкцию: className.
          className="grid gap-[length:var(--space-lg)]"
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: gridTemplateColumns.
            gridTemplateColumns: `repeat(auto-fill, minmax(clamp(${GAME_CARD_MIN_WIDTH_PX}px, 15vw, ${GAME_CARD_MAX_WIDTH_PX}px), 1fr))`,
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: data-testid.
          data-testid="games-skeleton"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {Array.from({ length: 8 }, (_, index) => (
            // Обрабатываем конструкцию: <div key={index} style={{ aspectRatio: GAME_COVER_ASPEC….
            <div
              // Обрабатываем конструкцию: key.
              key={index}
              // Обрабатываем конструкцию: style.
              style={{ aspectRatio: GAME_COVER_ASPECT }}
              // Обрабатываем конструкцию: className.
              className="overflow-hidden rounded-xl"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <Skeleton variant="rect" className="h-full w-full" />
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {games.length === 0 && scanStatus === "done" ? (
        // Рендерим самозакрывающийся элемент EmptyState.
        <EmptyState
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Gamepad2.
            <Gamepad2 aria-hidden="true" className="size-7" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: title.
          title={t("settings.games.installed.empty.title")}
          // Обрабатываем конструкцию: description.
          description={t("settings.games.installed.empty.body")}
          // Обрабатываем конструкцию: action.
          action={{
            // Обрабатываем конструкцию: label.
            label: t("settings.games.installed.add.action"),
            // Обрабатываем конструкцию: onClick.
            onClick: () => {
              // Обрабатываем конструкцию: setAddOpen.
              setAddOpen(true);
              // Закрываем текущий блок.
            },
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {games.length === 0 ? null : (
        // Рендерим самозакрывающийся элемент InstalledGamesGrid.
        <InstalledGamesGrid
          // Обрабатываем конструкцию: games.
          games={games}
          // Обрабатываем конструкцию: bypassByGameId.
          bypassByGameId={bypassByGameId}
          // Обрабатываем конструкцию: launchingId.
          launchingId={launchingId}
          // Обрабатываем конструкцию: motionDisabled.
          motionDisabled={motionDisabled}
          // Обрабатываем конструкцию: onLaunch.
          onLaunch={(game) => {
            // Обрабатываем конструкцию: void launch(game).
            void launch(game);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onRemove.
          onRemove={(game) => {
            // Обрабатываем конструкцию: handleRemove.
            handleRemove(game);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onCloseGame.
          onCloseGame={(game) => {
            // Обрабатываем конструкцию: void closeGame(game).
            void closeGame(game);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onDiagnose.
          onDiagnose={(game) => {
            // Обрабатываем конструкцию: void diagnose(game).
            void diagnose(game);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onChangeLaunchMode.
          onChangeLaunchMode={rechooseLaunchMode}
          // Обрабатываем конструкцию: runningGameIds.
          runningGameIds={runningGames}
          // Обрабатываем конструкцию: runningByPath.
          runningByPath={runningByPath}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      )}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <GameBypassSettings
        // Обрабатываем конструкцию: focusId.
        focusId={focusId}
        // Обрабатываем конструкцию: onFocusHandled.
        onFocusHandled={() => {
          // Обрабатываем конструкцию: setFocusId.
          setFocusId(null);
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <AddGameDialog
        // Обрабатываем конструкцию: open.
        open={addOpen}
        // Обрабатываем конструкцию: bypassOptions.
        bypassOptions={bypassGames}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setAddOpen.
          setAddOpen(false);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onAdd.
        onAdd={(game) => {
          // Обрабатываем конструкцию: addManualGame.
          addManualGame(game);
          // Обрабатываем конструкцию: setFocusId.
          setFocusId(game.gameSettingsId ?? null);
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <GameFoldersDialog
        // Обрабатываем конструкцию: open.
        open={foldersOpen}
        // Обрабатываем конструкцию: folders.
        folders={folders}
        // Обрабатываем конструкцию: scanning.
        scanning={scanning}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setFoldersOpen.
          setFoldersOpen(false);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onAdd.
        onAdd={addFolder}
        // Обрабатываем конструкцию: onRemove.
        onRemove={removeFolder}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <GameLaunchPrompt
        // Обрабатываем конструкцию: prompt.
        prompt={prompt}
        // Обрабатываем конструкцию: onChoose.
        onChoose={(mode) => {
          // Обрабатываем конструкцию: void choosePrompt(mode).
          void choosePrompt(mode);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onVpn.
        onVpn={launchWithVpn}
        // Обрабатываем конструкцию: onCancel.
        onCancel={dismissPrompt}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Modal
        // Обрабатываем конструкцию: open.
        open={bypassFailed}
        // Обрабатываем конструкцию: onClose.
        onClose={dismissBypassFailure}
        // Обрабатываем конструкцию: title.
        title={t("settings.games.installed.launch.bypassFailedTitle")}
        // Обрабатываем конструкцию: description.
        description={t("settings.games.installed.launch.bypassFailedBody")}
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: footer.
        footer={
          // Обрабатываем конструкцию: <div className=flex justify-end gap-2>.
          <div className="flex justify-end gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="ghost"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: dismissBypassFailure.
                dismissBypassFailure();
                // Обрабатываем конструкцию: void retryLaunch().
                void retryLaunch();
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.installed.launch.bypassFailedRetry")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="primary"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: enableVpn.
                enableVpn();
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.installed.launch.bypassFailedUseVpn")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.installed.launch.bypassFailedBody")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </Modal>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {diagnosis === null ? null : (
        // Рендерим самозакрывающийся элемент GameDiagnostics.
        <GameDiagnostics
          // Обрабатываем конструкцию: diagnosis.
          diagnosis={diagnosis}
          // Обрабатываем конструкцию: bypassRunning.
          bypassRunning={bypassRunning}
          // Обрабатываем конструкцию: checking.
          checking={diagnosis.checkingEndpoints}
          // Обрабатываем конструкцию: onClose.
          onClose={dismissDiagnosis}
          // Обрабатываем конструкцию: onRecheck.
          onRecheck={() => {
            // Обрабатываем конструкцию: void diagnose(diagnosis.game).
            void diagnose(diagnosis.game);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onRestartBypass.
          onRestartBypass={() => {
            // Обрабатываем конструкцию: void restartBypass(diagnosis.game).
            void restartBypass(diagnosis.game);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onEnableVpn.
          onEnableVpn={enableVpn}
          // Обрабатываем конструкцию: onOpenLogs.
          onOpenLogs={() => {
            // Обрабатываем конструкцию: void secureInvoke(open_folder, { kind: logs, strategies….
            void secureInvoke("open_folder", {
              // Обрабатываем конструкцию: kind.
              kind: "logs",
              // Обрабатываем конструкцию: strategiesDir.
              strategiesDir: diagnosis.logPaths[0] ?? "",
              // Закрываем текущий блок.
            }).catch(() => undefined);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      )}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Modal
        // Обрабатываем конструкцию: open.
        open={pendingRemove !== null}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setPendingRemove.
          setPendingRemove(null);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: title.
        title={t("settings.games.installed.removeTitle")}
        // Обрабатываем конструкцию: {...(pendingRemove === null ? {} : { description: t(set….
        {...(pendingRemove === null
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            {}
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            {
              // Обрабатываем конструкцию: description.
              description: t("settings.games.installed.removeBody", {
                // Обрабатываем конструкцию: name.
                name: pendingRemove.name,
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
                // Обрабатываем конструкцию: setPendingRemove.
                setPendingRemove(null);
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
                // Проверяем бизнес-условие: pendingRemove !== null.
                if (pendingRemove !== null) {
                  // Обрабатываем конструкцию: removeGame.
                  removeGame(pendingRemove.id);
                  // Закрываем текущий блок.
                }
                // — разделитель логических блоков —

                // Обрабатываем конструкцию: setPendingRemove.
                setPendingRemove(null);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.installed.removeConfirm")}
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
          {t("settings.games.installed.removeBody", {
            // Обрабатываем конструкцию: name.
            name: pendingRemove?.name ?? "",
            // Закрываем текущий блок.
          })}
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
