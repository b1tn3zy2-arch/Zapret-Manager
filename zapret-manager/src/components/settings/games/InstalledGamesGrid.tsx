// Импортируем зависимости из модуля @/components/shared/CardEntrance.
import CardEntrance from "@/components/shared/CardEntrance";
// Импортируем зависимости из модуля @/components/settings/games/GameCardInstalled.
import GameCardInstalled from "@/components/settings/games/GameCardInstalled";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт GAME_CARD_MAX_WIDTH_PX.
  GAME_CARD_MAX_WIDTH_PX,
  // Подключаем именованный импорт GAME_CARD_MIN_WIDTH_PX.
  GAME_CARD_MIN_WIDTH_PX,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/installedGames.
import { PLATFORM_LABEL_KEYS } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InstalledGamesGridProps {
  // Обрабатываем конструкцию: games.
  games: InstalledGame[];
  // Обрабатываем конструкцию: bypassByGameId.
  bypassByGameId: Record<string, boolean>;
  // Обрабатываем конструкцию: launchingId.
  launchingId: string | null;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: onLaunch.
  onLaunch: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: onRemove.
  onRemove: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: onCloseGame.
  onCloseGame: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: onDiagnose.
  onDiagnose: (game: InstalledGame) => void;
  // Сохраняем пояснение разработчика: Смена способа запуска: заново открывает диалог выбора.
  /** Смена способа запуска: заново открывает диалог выбора. */
  // Обрабатываем конструкцию: onChangeLaunchMode.
  onChangeLaunchMode: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: runningGameIds.
  runningGameIds: Record<string, number[]>;
  // Сохраняем пояснение разработчика: Игры, запущенные вне приложения: их нашли по пути к файлу.
  /** Игры, запущенные вне приложения: их нашли по пути к файлу. */
  // Обрабатываем конструкцию: runningByPath.
  runningByPath: Record<string, boolean>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function InstalledGamesGrid({
  // Обрабатываем конструкцию: games.
  games,
  // Обрабатываем конструкцию: bypassByGameId.
  bypassByGameId,
  // Обрабатываем конструкцию: launchingId.
  launchingId,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: onLaunch.
  onLaunch,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Обрабатываем конструкцию: onCloseGame.
  onCloseGame,
  // Обрабатываем конструкцию: onDiagnose.
  onDiagnose,
  // Обрабатываем конструкцию: onChangeLaunchMode.
  onChangeLaunchMode,
  // Обрабатываем конструкцию: runningGameIds.
  runningGameIds,
  // Обрабатываем конструкцию: runningByPath.
  runningByPath,
  // Закрываем текущий блок.
}: InstalledGamesGridProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=grid gap-[length:var(--space-lg)] styl….
  return (
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
      data-testid="installed-games-grid"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {games.map((game, index) => (
        // Обрабатываем конструкцию: <CardEntrance key={game.id} index={index} maxDelaySecon….
        <CardEntrance
          // Обрабатываем конструкцию: key.
          key={game.id}
          // Обрабатываем конструкцию: index.
          index={index}
          // Обрабатываем конструкцию: maxDelaySeconds.
          maxDelaySeconds={0.3}
          // Обрабатываем конструкцию: duration.
          duration={0.3}
          // Обрабатываем конструкцию: disabled.
          disabled={motionDisabled}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <GameCardInstalled
            // Обрабатываем конструкцию: game.
            game={game}
            // Обрабатываем конструкцию: name.
            name={game.name}
            // Обрабатываем конструкцию: platformLabel.
            platformLabel={t(PLATFORM_LABEL_KEYS[game.platform])}
            // Сохраняем пояснение разработчика: // Пока способ запуска не выбран, бейдж показывает состояние
            // Пока способ запуска не выбран, бейдж показывает состояние
            // Сохраняем пояснение разработчика: // профиля обхода; после выбора он отвечает на вопрос
            // профиля обхода; после выбора он отвечает на вопрос
            // Сохраняем пояснение разработчика: // «как эта игра запускается».
            // «как эта игра запускается».
            // Обрабатываем конструкцию: bypassEnabled.
            bypassEnabled={
              // Обрабатываем конструкцию: game.
              game.bypassChoice === "bypass" ||
              // Обрабатываем конструкцию: (game.bypassChoice === undefined && bypassByGameId[game….
              (game.bypassChoice === undefined &&
                // Обрабатываем конструкцию: bypassByGameId.
                bypassByGameId[game.id] === true)
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: bypassLabel.
            bypassLabel={t(
              // Обрабатываем конструкцию: game.
              game.bypassChoice === "plain"
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  "settings.games.installed.prompt.choosePlain"
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  game.bypassChoice === "bypass"
                  ? // Обрабатываем конструкцию: ?.
                    // Продолжаем предыдущую конструкцию.
                    "settings.games.installed.prompt.chooseBypass"
                  : // Обрабатываем конструкцию: :.
                    // Продолжаем предыдущую конструкцию.
                    bypassByGameId[game.id] === true
                    ? // Обрабатываем конструкцию: ?.
                      // Продолжаем предыдущую конструкцию.
                      "settings.games.installed.badge.bypassOn"
                    : // Обрабатываем конструкцию: :.
                      // Продолжаем предыдущую конструкцию.
                      "settings.games.installed.badge.bypassOff"
              // Закрываем выражение или список аргументов.
            )}
            // Обрабатываем конструкцию: launchLabel.
            launchLabel={t("settings.games.installed.launch.action")}
            // Обрабатываем конструкцию: busy.
            busy={launchingId === game.id}
            // Обрабатываем конструкцию: motionDisabled.
            motionDisabled={motionDisabled}
            // Обрабатываем конструкцию: onLaunch.
            onLaunch={() => {
              // Обрабатываем конструкцию: onLaunch.
              onLaunch(game);
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: running.
            running={
              // Обрабатываем конструкцию: (runningGameIds[game.id]?.length ?? 0).
              (runningGameIds[game.id]?.length ?? 0) > 0 ||
              // Обрабатываем конструкцию: runningByPath.
              runningByPath[game.id] === true
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: onClose.
            onClose={
              // Обрабатываем конструкцию: (runningGameIds[game.id]?.length ?? 0).
              (runningGameIds[game.id]?.length ?? 0) === 0 &&
              // Обрабатываем конструкцию: runningByPath.
              runningByPath[game.id] !== true
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  undefined
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  () => {
                    // Обрабатываем конструкцию: onCloseGame.
                    onCloseGame(game);
                    // Закрываем текущий блок.
                  }
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: removeLabel.
            removeLabel={t("settings.games.installed.removeGame")}
            // Обрабатываем конструкцию: onRemove.
            onRemove={() => {
              // Обрабатываем конструкцию: onRemove.
              onRemove(game);
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: diagnoseLabel.
            diagnoseLabel={t("settings.games.installed.diagnose.action")}
            // Обрабатываем конструкцию: onDiagnose.
            onDiagnose={() => {
              // Обрабатываем конструкцию: onDiagnose.
              onDiagnose(game);
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: changeLaunchLabel.
            changeLaunchLabel={t("settings.games.installed.changeLaunchMode")}
            // Обрабатываем конструкцию: onChangeLaunchMode.
            onChangeLaunchMode={() => {
              // Обрабатываем конструкцию: onChangeLaunchMode.
              onChangeLaunchMode(game);
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </CardEntrance>
        // Закрываем выражение или список аргументов.
      ))}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
