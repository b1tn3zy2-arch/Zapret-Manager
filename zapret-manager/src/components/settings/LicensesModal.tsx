// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { ExternalLink, FileText } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import type { TranslationKey } from "@/i18n";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/resourceCommands.
import * as commands from "@/lib/resourceCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LicensesModalProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс LicenseEntry с контрактом данных.
interface LicenseEntry {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: label.
  label: TranslationKey;
  // Обрабатываем конструкцию: license.
  license: string;
  // Обрабатываем конструкцию: url.
  url: string;
  // Обрабатываем конструкцию: file.
  file?: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LICENSES: LicenseEntry[] = [ { id: zapret, label:….
const LICENSES: LicenseEntry[] = [
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "zapret",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.zapret",
    // Обрабатываем конструкцию: license.
    license: "MIT",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/bol-van/zapret",
    // Обрабатываем конструкцию: file.
    file: "LICENSE-zapret.txt",
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "zapretNotes",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.zapretNotes",
    // Обрабатываем конструкцию: license.
    license: "MIT",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/Flowseal/zapret-discord-youtube",
    // Обрабатываем конструкцию: file.
    file: "README-zapret.md",
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "xray",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.xray",
    // Обрабатываем конструкцию: license.
    license: "MPL-2.0",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/XTLS/Xray-core",
    // Обрабатываем конструкцию: file.
    file: "LICENSE-xray.txt",
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "tauri",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.tauri",
    // Обрабатываем конструкцию: license.
    license: "MIT / Apache-2.0",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/tauri-apps/tauri",
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "react",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.react",
    // Обрабатываем конструкцию: license.
    license: "MIT",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/facebook/react",
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "lucide",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.lucide",
    // Обрабатываем конструкцию: license.
    license: "ISC",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/lucide-icons/lucide",
    // Закрываем текущий блок.
  },
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "framerMotion",
    // Обрабатываем конструкцию: label.
    label: "licenses.item.framerMotion",
    // Обрабатываем конструкцию: license.
    license: "MIT",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/motiondivision/motion",
    // Закрываем текущий блок.
  },
  // Закрываем массив или список.
];
// — разделитель логических блоков —

// Объявляем функцию LicensesModal.
function LicensesModal({ open, onClose }: LicensesModalProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [active, setActive] = useState<LicenseEntry | nul….
  const [active, setActive] = useState<LicenseEntry | null>(null);
  // Обрабатываем конструкцию: const [text, setText] = useState().
  const [text, setText] = useState("");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const openEntry = (entry: LicenseEntry): void => { setA….
  const openEntry = (entry: LicenseEntry): void => {
    // Обрабатываем конструкцию: setActive.
    setActive(entry);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: entry.file === undefined.
    if (entry.file === undefined) {
      // Обрабатываем конструкцию: setText.
      setText("");
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void commands .readLicense(entry.file) .then((value) =>….
    void commands
      // Продолжаем цепочку вызовов.
      .readLicense(entry.file)
      // Продолжаем цепочку вызовов.
      .then((value) => {
        // Обрабатываем конструкцию: setText.
        setText(value);
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch((caught: unknown) => {
        // Обрабатываем конструкцию: setText.
        setText(toErrorMessage(caught));
        // Закрываем текущий блок.
      });
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={open} onClose={onClose} title={t(license….
  return (
    // Обрабатываем конструкцию: <Modal open={open} onClose={onClose} title={t(licenses.….
    <Modal
      // Обрабатываем конструкцию: open.
      open={open}
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: title.
      title={t("licenses.title")}
      // Обрабатываем конструкцию: description.
      description={t("licenses.description")}
      // Обрабатываем конструкцию: size.
      size="lg"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        {LICENSES.map((entry) => (
          // Обрабатываем конструкцию: <div key={entry.id} className=border-glass-border bg-gl….
          <div
            // Обрабатываем конструкцию: key.
            key={entry.id}
            // Обрабатываем конструкцию: className.
            className="border-glass-border bg-glass-bg flex items-center gap-3 rounded-lg border px-3 py-2"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <button
              // Обрабатываем конструкцию: type.
              type="button"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: openEntry.
                openEntry(entry);
                // Закрываем текущий блок.
              }}
              // Обрабатываем конструкцию: className.
              className="text-text-primary hover:text-accent-primary flex items-center gap-2 text-sm"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <FileText aria-hidden="true" className="size-4" strokeWidth={2} />
              {/* Выводим текстовое содержимое в JSX. */}
              {t(entry.label)}
              {/* Выводим текстовое содержимое в JSX. */}
            </button>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <Text variant="caption" size="sm" className="text-text-tertiary">
              {/* Выводим текстовое содержимое в JSX. */}
              {entry.license}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <a
              // Обрабатываем конструкцию: href.
              href={entry.url}
              // Обрабатываем конструкцию: target.
              target="_blank"
              // Обрабатываем конструкцию: rel.
              rel="noreferrer noopener"
              // Обрабатываем конструкцию: aria-label.
              aria-label={t("licenses.openSource")}
              // Обрабатываем конструкцию: className.
              className="text-text-tertiary hover:text-text-primary ml-auto"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <ExternalLink
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-4"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
              {/* Выводим текстовое содержимое в JSX. */}
            </a>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          // Закрываем выражение или список аргументов.
        ))}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {active !== null ? (
          // Обрабатываем конструкцию: <div className=flex flex-col gap-2 pt-2>.
          <div className="flex flex-col gap-2 pt-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <div className="flex items-center justify-between gap-3">
              {/* Выводим текстовое содержимое в JSX. */}
              <Text variant="label" className="text-text-primary">
                {/* Выводим текстовое содержимое в JSX. */}
                {t(active.label)}
                {/* Выводим текстовое содержимое в JSX. */}
              </Text>
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: size.
                size="sm"
                // Обрабатываем конструкцию: variant.
                variant="ghost"
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: setActive.
                  setActive(null);
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("licenses.close")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <pre className="text-text-secondary border-glass-border bg-glass-bg max-h-64 scrollbar-thin overflow-auto rounded-lg border p-3 font-mono text-xs whitespace-pre-wrap">
              {/* Выводим текстовое содержимое в JSX. */}
              {active.file === undefined ? t("licenses.remoteOnly") : text}
              {/* Выводим текстовое содержимое в JSX. */}
            </pre>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LicensesModal;.
export default LicensesModal;
// — разделитель логических блоков —
