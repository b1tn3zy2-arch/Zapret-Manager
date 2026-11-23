// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт ClipboardCopy.
  ClipboardCopy,
  // Подключаем именованный импорт ExternalLink.
  ExternalLink,
  // Подключаем именованный импорт FolderOpen.
  FolderOpen,
  // Подключаем именованный импорт RefreshCw.
  RefreshCw,
  // Подключаем именованный импорт Scale.
  Scale,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/settingsConstants.
import { ABOUT_LINKS } from "@/lib/settingsConstants";
// Импортируем зависимости из модуля @/lib/userCommands.
import { openExternalUrl } from "@/lib/userCommands";
// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AboutActionsProps {
  // Обрабатываем конструкцию: canOpenStrategies.
  canOpenStrategies: boolean;
  // Обрабатываем конструкцию: canCopyInfo.
  canCopyInfo: boolean;
  // Обрабатываем конструкцию: copied.
  copied: boolean;
  // Обрабатываем конструкцию: onCheckUpdates.
  onCheckUpdates: () => void;
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder: (kind: "logs" | "config" | "strategies") => void;
  // Обрабатываем конструкцию: onOpenLicenses.
  onOpenLicenses: () => void;
  // Обрабатываем конструкцию: onCopyInfo.
  onCopyInfo: () => void;
  // Обрабатываем конструкцию: t.
  t: Translate;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function AboutActions({
  // Обрабатываем конструкцию: canOpenStrategies.
  canOpenStrategies,
  // Обрабатываем конструкцию: canCopyInfo.
  canCopyInfo,
  // Обрабатываем конструкцию: copied.
  copied,
  // Обрабатываем конструкцию: onCheckUpdates.
  onCheckUpdates,
  // Обрабатываем конструкцию: onOpenFolder.
  onOpenFolder,
  // Обрабатываем конструкцию: onOpenLicenses.
  onOpenLicenses,
  // Обрабатываем конструкцию: onCopyInfo.
  onCopyInfo,
  // Обрабатываем конструкцию: t.
  t,
  // Закрываем текущий блок.
}: AboutActionsProps) {
  // Возвращаем результат: ( <div className=flex flex-col gap-3> <div className=fl….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-3>.
    <div className="flex flex-col gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: onClick.
          onClick={onCheckUpdates}
          // Обрабатываем конструкцию: icon.
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("about.checkUpdates")}
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
          onClick={() => {
            // Обрабатываем конструкцию: onOpenFolder.
            onOpenFolder("logs");
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("about.openLogs")}
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
          onClick={() => {
            // Обрабатываем конструкцию: onOpenFolder.
            onOpenFolder("config");
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("about.openConfig")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: disabled.
          disabled={!canOpenStrategies}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: onOpenFolder.
            onOpenFolder("strategies");
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("about.openStrategies")}
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
          onClick={onOpenLicenses}
          // Обрабатываем конструкцию: icon.
          icon={<Scale aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("about.licenses")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: disabled.
          disabled={!canCopyInfo}
          // Обрабатываем конструкцию: onClick.
          onClick={onCopyInfo}
          // Обрабатываем конструкцию: icon.
          icon={<ClipboardCopy aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {copied ? t("settings.common.saved") : t("about.copyInfo")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Text variant="label" className="text-text-primary">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("about.links")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Text>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        {ABOUT_LINKS.map((link) => (
          // Обрабатываем конструкцию: <Button key={link.id} size=sm variant=ghost onClick={()….
          <Button
            // Обрабатываем конструкцию: key.
            key={link.id}
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="ghost"
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: void openExternalUrl(link.url).catch(() => undefined).
              void openExternalUrl(link.url).catch(() => undefined);
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: icon.
            icon={<ExternalLink aria-hidden="true" className="size-4" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t(link.labelKey)}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          // Закрываем выражение или список аргументов.
        ))}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
