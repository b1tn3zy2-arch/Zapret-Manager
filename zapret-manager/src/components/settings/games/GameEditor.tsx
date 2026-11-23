// Импортируем зависимости из модуля lucide-react.
import { Download, Upload } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/EditableList.
import EditableList from "@/components/settings/EditableList";
// Импортируем зависимости из модуля @/components/ui.
import { Button, Input, Toggle } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/gameValidation.
import { isValidDomain, isValidIpRange } from "@/lib/gameValidation";
// Импортируем зависимости из модуля @/lib/validators.
import { isValidPort } from "@/lib/validators";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameEditorProps {
  // Обрабатываем конструкцию: game.
  game: GameSettings;
  // Обрабатываем конструкцию: onChange.
  onChange: (patch: Partial<GameSettings>) => void;
  // Обрабатываем конструкцию: onImport.
  onImport: () => void;
  // Обрабатываем конструкцию: onExport.
  onExport: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию validatePort.
function validatePort(value: string): string | null {
  // Обрабатываем конструкцию: const parsed = Number.parseInt(value, 10).
  const parsed = Number.parseInt(value, 10);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: Number.isNaN(parsed).
  if (Number.isNaN(parsed)) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isValidPort(parsed) ? null : 1:65535.
  return isValidPort(parsed) ? null : "1:65535";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function GameEditor({
  // Обрабатываем конструкцию: game.
  game,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: onImport.
  onImport,
  // Обрабатываем конструкцию: onExport.
  onExport,
  // Закрываем текущий блок.
}: GameEditorProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-4 pt-3> <Input label….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-4 pt-3>.
    <div className="flex flex-col gap-4 pt-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <Input
        // Обрабатываем конструкцию: label.
        label={t("settings.games.name")}
        // Обрабатываем конструкцию: value.
        value={game.name}
        // Обрабатываем конструкцию: maxLength.
        maxLength={64}
        // Обрабатываем конструкцию: onChange.
        onChange={(event) => {
          // Обрабатываем конструкцию: onChange.
          onChange({ name: event.target.value });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <EditableList
        // Обрабатываем конструкцию: label.
        label={t("settings.games.domains")}
        // Обрабатываем конструкцию: placeholder.
        placeholder="steampowered.com"
        // Обрабатываем конструкцию: addLabel.
        addLabel={t("settings.games.addDomain")}
        // Обрабатываем конструкцию: emptyMessage.
        emptyMessage={t("settings.games.noDomains")}
        // Обрабатываем конструкцию: items.
        items={game.domains}
        // Обрабатываем конструкцию: validate.
        validate={isValidDomain}
        // Обрабатываем конструкцию: onChange.
        onChange={(domains) => {
          // Обрабатываем конструкцию: onChange.
          onChange({ domains });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <EditableList
        // Обрабатываем конструкцию: label.
        label={t("settings.games.ipRanges")}
        // Обрабатываем конструкцию: placeholder.
        placeholder="203.0.113.0/24"
        // Обрабатываем конструкцию: addLabel.
        addLabel={t("settings.games.addIpRange")}
        // Обрабатываем конструкцию: emptyMessage.
        emptyMessage={t("settings.games.noIpRanges")}
        // Обрабатываем конструкцию: items.
        items={game.ipRanges}
        // Обрабатываем конструкцию: validate.
        validate={isValidIpRange}
        // Обрабатываем конструкцию: onChange.
        onChange={(ipRanges) => {
          // Обрабатываем конструкцию: onChange.
          onChange({ ipRanges });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <EditableList
        // Обрабатываем конструкцию: type.
        type="number"
        // Обрабатываем конструкцию: label.
        label={t("settings.games.ports")}
        // Обрабатываем конструкцию: placeholder.
        placeholder="27015"
        // Обрабатываем конструкцию: addLabel.
        addLabel={t("settings.games.addPort")}
        // Обрабатываем конструкцию: emptyMessage.
        emptyMessage={t("settings.games.noPorts")}
        // Обрабатываем конструкцию: items.
        items={game.ports.map(String)}
        // Обрабатываем конструкцию: validate.
        validate={validatePort}
        // Обрабатываем конструкцию: onChange.
        onChange={(items) => {
          // Обрабатываем конструкцию: onChange.
          onChange({
            // Обрабатываем конструкцию: ports.
            ports: items
              // Продолжаем цепочку вызовов.
              .map((item) => Number.parseInt(item, 10))
              // Продолжаем цепочку вызовов.
              .filter((port) => Number.isFinite(port)),
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Toggle
        // Обрабатываем конструкцию: size.
        size="md"
        // Обрабатываем конструкцию: checked.
        checked={game.createBackup}
        // Обрабатываем конструкцию: label.
        label={t("settings.games.createBackup")}
        // Обрабатываем конструкцию: onChange.
        onChange={(value) => {
          // Обрабатываем конструкцию: onChange.
          onChange({ createBackup: value });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Toggle
        // Обрабатываем конструкцию: size.
        size="md"
        // Обрабатываем конструкцию: checked.
        checked={game.autoRestore}
        // Обрабатываем конструкцию: label.
        label={t("settings.games.autoRestore")}
        // Обрабатываем конструкцию: onChange.
        onChange={(value) => {
          // Обрабатываем конструкцию: onChange.
          onChange({ autoRestore: value });
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: onClick.
          onClick={onImport}
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Upload.
            <Upload aria-hidden="true" className="size-4" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.import")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: onClick.
          onClick={onExport}
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Download.
            <Download aria-hidden="true" className="size-4" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.games.export")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
