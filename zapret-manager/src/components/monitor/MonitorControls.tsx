// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля lucide-react.
import { Camera, Pause, Play, Trash2 } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Tooltip } from "@/components/ui";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface MonitorControlsProps {
  // Обрабатываем конструкцию: isPaused.
  isPaused: boolean;
  // Обрабатываем конструкцию: isSaving.
  isSaving: boolean;
  // Обрабатываем конструкцию: hint.
  hint: string;
  // Обрабатываем конструкцию: onTogglePause.
  onTogglePause: () => void;
  // Обрабатываем конструкцию: onSnapshot.
  onSnapshot: () => void;
  // Обрабатываем конструкцию: onClear.
  onClear: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию MonitorControls.
function MonitorControls({
  // Обрабатываем конструкцию: isPaused.
  isPaused,
  // Обрабатываем конструкцию: isSaving.
  isSaving,
  // Обрабатываем конструкцию: hint.
  hint,
  // Обрабатываем конструкцию: onTogglePause.
  onTogglePause,
  // Обрабатываем конструкцию: onSnapshot.
  onSnapshot,
  // Обрабатываем конструкцию: onClear.
  onClear,
  // Закрываем текущий блок.
}: MonitorControlsProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Возвращаем результат: ( <div className=flex flex-wrap items-center gap-2> <To….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-wrap items-center gap-2>.
    <div className="flex flex-wrap items-center gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <Tooltip content={hint}>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant={isPaused ? "primary" : "secondary"}
          // Обрабатываем конструкцию: onClick.
          onClick={onTogglePause}
          // Обрабатываем конструкцию: icon.
          icon={
            // Обрабатываем конструкцию: isPaused.
            isPaused ? (
              // Рендерим самозакрывающийся элемент Play.
              <Play aria-hidden="true" className="size-3.5" strokeWidth={2} />
            ) : (
              // Продолжаем предыдущую конструкцию.
              // Закрываем выражение или список аргументов.
              // Рендерим самозакрывающийся элемент Pause.
              <Pause aria-hidden="true" className="size-3.5" strokeWidth={2} />
              // Закрываем выражение или список аргументов.
            )
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {isPaused ? t("common.resume") : t("common.pause")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </Tooltip>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Tooltip content={t("monitor.controls.snapshot")}>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="icon"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("monitor.controls.snapshotAria")}
          // Обрабатываем конструкцию: disabled.
          disabled={isSaving}
          // Обрабатываем конструкцию: onClick.
          onClick={onSnapshot}
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Camera.
            <Camera aria-hidden="true" className="size-4" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </Tooltip>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Tooltip content={t("monitor.controls.clear")}>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="icon"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("monitor.controls.clearAria")}
          // Обрабатываем конструкцию: onClick.
          onClick={onClear}
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Trash2.
            <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </Tooltip>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default MonitorControls;.
export default MonitorControls;
// — разделитель логических блоков —
