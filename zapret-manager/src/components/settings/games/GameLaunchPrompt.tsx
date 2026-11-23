// Импортируем зависимости из модуля @/components/ui/Button.
import { Button } from "@/components/ui/Button";
// Импортируем зависимости из модуля @/components/ui/Modal.
import Modal from "@/components/ui/Modal";
// Импортируем зависимости из модуля @/components/ui/Text.
import Text from "@/components/ui/Text";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n.
import type { TranslationKey } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useGameLauncher.
import type { LaunchPrompt } from "@/hooks/useGameLauncher";
// Импортируем зависимости из модуля @/types.
import type { InstalledGameAnticheat, LaunchMode } from "@/types";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Человекочитаемые названия античитов для подсказки в диалоге.
/** Человекочитаемые названия античитов для подсказки в диалоге. */
// Обрабатываем конструкцию: const ANTICHEAT_LABEL_KEYS: Record< Exclude<InstalledGa….
const ANTICHEAT_LABEL_KEYS: Record<
  // Обрабатываем конструкцию: Exclude.
  Exclude<InstalledGameAnticheat, "none">,
  // Обрабатываем конструкцию: TranslationKey.
  TranslationKey
  // Продолжаем выражение.
> = {
  // Обрабатываем конструкцию: battleye.
  battleye: "settings.games.installed.anticheat.battleye",
  // Обрабатываем конструкцию: eac.
  eac: "settings.games.installed.anticheat.eac",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameLaunchPromptProps {
  // Обрабатываем конструкцию: prompt.
  prompt: LaunchPrompt | null;
  // Сохраняем пояснение разработчика: Выбран способ запуска: с обходом или без него.
  /** Выбран способ запуска: с обходом или без него. */
  // Обрабатываем конструкцию: onChoose.
  onChoose: (mode: LaunchMode) => void;
  // Сохраняем пояснение разработчика: Диалог провала: подключить VPN вместо повторной попытки обхо…
  /** Диалог провала: подключить VPN вместо повторной попытки обхода. */
  // Обрабатываем конструкцию: onVpn.
  onVpn: () => void;
  // Обрабатываем конструкцию: onCancel.
  onCancel: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function GameLaunchPrompt({
  // Обрабатываем конструкцию: prompt.
  prompt,
  // Обрабатываем конструкцию: onChoose.
  onChoose,
  // Обрабатываем конструкцию: onVpn.
  onVpn,
  // Обрабатываем конструкцию: onCancel.
  onCancel,
  // Закрываем текущий блок.
}: GameLaunchPromptProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: prompt === null.
  if (prompt === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Диалог без выбора способа («нет стратегий») закрывается т…
  // Диалог без выбора способа («нет стратегий») закрывается только
  // Сохраняем пояснение разработчика: // кнопкой отмены: запускать нечего.
  // кнопкой отмены: запускать нечего.
  // Проверяем бизнес-условие: prompt.kind === noStrategy.
  if (prompt.kind === "noStrategy") {
    // Возвращаем результат: ( <Modal open onClose={onCancel} title={t(settings.game….
    return (
      // Рендерим самозакрывающийся элемент Modal.
      <Modal
        // Задаём атрибут open элемента.
        open
        // Обрабатываем конструкцию: onClose.
        onClose={onCancel}
        // Обрабатываем конструкцию: title.
        title={t("settings.games.installed.prompt.noStrategyTitle")}
        // Обрабатываем конструкцию: description.
        description={t("settings.games.installed.prompt.noStrategyBody")}
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: children.
        children={null}
        // Обрабатываем конструкцию: footer.
        footer={
          // Обрабатываем конструкцию: <Button variant=ghost onClick={onCancel}>.
          <Button variant="ghost" onClick={onCancel}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.prompt.cancel")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const game = prompt.game.
  const game = prompt.game;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: game === null.
  if (game === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: prompt.kind === failedBefore.
  if (prompt.kind === "failedBefore") {
    // Возвращаем результат: ( <Modal open onClose={onCancel} title={t(settings.game….
    return (
      // Рендерим самозакрывающийся элемент Modal.
      <Modal
        // Задаём атрибут open элемента.
        open
        // Обрабатываем конструкцию: onClose.
        onClose={onCancel}
        // Обрабатываем конструкцию: title.
        title={t("settings.games.installed.prompt.failedTitle")}
        // Обрабатываем конструкцию: description.
        description={t("settings.games.installed.prompt.failedBody", {
          // Обрабатываем конструкцию: name.
          name: game.name,
          // Закрываем текущий блок.
        })}
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: children.
        children={null}
        // Обрабатываем конструкцию: footer.
        footer={
          // Обрабатываем конструкцию: <>.
          <>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button variant="ghost" onClick={onCancel}>
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.installed.prompt.cancel")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button onClick={onVpn}>
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.installed.prompt.failedVpn")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
          </>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Первый запуск игры: пользователь сам решает, с обходом ил…
  // Первый запуск игры: пользователь сам решает, с обходом или без.
  // Сохраняем пояснение разработчика: // Выбор запоминается, диалог больше не появляется.
  // Выбор запоминается, диалог больше не появляется.
  // Обрабатываем конструкцию: const anticheat = game.anticheat === battleye || game.a….
  const anticheat =
    // Обрабатываем конструкцию: game.
    game.anticheat === "battleye" || game.anticheat === "eac"
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        game.anticheat
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        null;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open onClose={onCancel} title={t(settings.game….
  return (
    // Рендерим самозакрывающийся элемент Modal.
    <Modal
      // Задаём атрибут open элемента.
      open
      // Обрабатываем конструкцию: onClose.
      onClose={onCancel}
      // Обрабатываем конструкцию: title.
      title={t("settings.games.installed.prompt.chooseTitle")}
      // Обрабатываем конструкцию: description.
      description={t("settings.games.installed.prompt.chooseBody", {
        // Обрабатываем конструкцию: name.
        name: game.name,
        // Закрываем текущий блок.
      })}
      // Обрабатываем конструкцию: size.
      size="sm"
      // Обрабатываем конструкцию: children.
      children={
        // Обрабатываем конструкцию: anticheat.
        anticheat !== null ? (
          // Обрабатываем конструкцию: <Text variant=body size=sm className=text-text-secondar….
          <Text variant="body" size="sm" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.prompt.anticheatBody", {
              // Обрабатываем конструкцию: name.
              name: game.name,
              // Обрабатываем конструкцию: anticheat.
              anticheat: t(ANTICHEAT_LABEL_KEYS[anticheat]),
              // Закрываем текущий блок.
            })}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null
        // Закрываем текущий блок.
      }
      // Обрабатываем конструкцию: footer.
      footer={
        // Обрабатываем конструкцию: <>.
        <>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button variant="ghost" onClick={onCancel}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.prompt.cancel")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: onChoose.
              onChoose("plain");
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.prompt.choosePlain")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: variant.
            variant="primary"
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: onChoose.
              onChoose("bypass");
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.prompt.chooseBypass")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </>
        // Закрываем текущий блок.
      }
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
