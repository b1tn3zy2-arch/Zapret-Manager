// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля @tauri-apps/plugin-dialog.
import { open as openDialog } from "@tauri-apps/plugin-dialog";
// Импортируем зависимости из модуля lucide-react.
import { FolderOpen } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/Button.
import { Button } from "@/components/ui/Button";
// Импортируем зависимости из модуля @/components/ui/Dropdown.
import Dropdown from "@/components/ui/Dropdown";
// Импортируем зависимости из модуля @/components/ui/Input.
import { Input } from "@/components/ui/Input";
// Импортируем зависимости из модуля @/components/ui/Modal.
import Modal from "@/components/ui/Modal";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useInstalledGames.
import { matchManualGame } from "@/hooks/useInstalledGames";
// Импортируем зависимости из модуля @/lib/installedGames.
import { manualGame, PLATFORM_LABEL_KEYS } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/types.
import type { GameSettings, InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PLATFORMS: InstalledGame[platform][] = [ custom, ….
const PLATFORMS: InstalledGame["platform"][] = [
  // Обрабатываем конструкцию: custom.
  "custom",
  // Обрабатываем конструкцию: steam.
  "steam",
  // Обрабатываем конструкцию: epic.
  "epic",
  // Обрабатываем конструкцию: gog.
  "gog",
  // Закрываем массив или список.
];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AddGameDialogProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: bypassOptions.
  bypassOptions: readonly GameSettings[];
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Обрабатываем конструкцию: onAdd.
  onAdd: (game: InstalledGame) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function AddGameDialog({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: bypassOptions.
  bypassOptions,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onAdd.
  onAdd,
  // Закрываем текущий блок.
}: AddGameDialogProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [name, setName] = useState().
  const [name, setName] = useState("");
  // Обрабатываем конструкцию: const [path, setPath] = useState().
  const [path, setPath] = useState("");
  // Обрабатываем конструкцию: const [platform, setPlatform] = useState<InstalledGame[….
  const [platform, setPlatform] = useState<InstalledGame["platform"]>("custom");
  // Обрабатываем конструкцию: const [bypassId, setBypassId] = useState().
  const [bypassId, setBypassId] = useState("");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const reset = (): void => { setName(); setPath(); setPl….
  const reset = (): void => {
    // Обрабатываем конструкцию: setName.
    setName("");
    // Обрабатываем конструкцию: setPath.
    setPath("");
    // Обрабатываем конструкцию: setPlatform.
    setPlatform("custom");
    // Обрабатываем конструкцию: setBypassId.
    setBypassId("");
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const browse = async (): Promise<void> => { const selec….
  const browse = async (): Promise<void> => {
    // Обрабатываем конструкцию: const selected = await openDialog({ multiple: false, di….
    const selected = await openDialog({
      // Обрабатываем конструкцию: multiple.
      multiple: false,
      // Обрабатываем конструкцию: directory.
      directory: false,
      // Обрабатываем конструкцию: filters.
      filters: [{ name: "exe", extensions: ["exe"] }],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: typeof selected === string.
    if (typeof selected === "string") {
      // Обрабатываем конструкцию: setPath.
      setPath(selected);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const submit = (): void => { if (path.trim() === ) { re….
  const submit = (): void => {
    // Проверяем бизнес-условие: path.trim() ===.
    if (path.trim() === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const created = manualGame( name, path.trim(), platform….
    const created = manualGame(
      // Обрабатываем конструкцию: name.
      name,
      // Обрабатываем конструкцию: path.
      path.trim(),
      // Обрабатываем конструкцию: platform.
      platform,
      // Обрабатываем конструкцию: bypassId.
      bypassId === "" ? undefined : bypassId
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void matchManualGame(created.name).then((match) => { if….
    void matchManualGame(created.name).then((match) => {
      // Проверяем бизнес-условие: match === null.
      if (match === null) {
        // Обрабатываем конструкцию: onAdd.
        onAdd(created);
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: onAdd.
      onAdd({
        // Разворачиваем ...created в коллекцию.
        ...created,
        // Обрабатываем конструкцию: appid.
        appid: match.appid,
        // Обрабатываем конструкцию: name.
        name: match.name,
        // Разворачиваем ...(match.cover === null ? {} : { coverUrl: m… в коллекцию.
        ...(match.cover === null ? {} : { coverUrl: match.cover }),
        // Разворачиваем ...(match.domainSettingsId === null ? {} : { … в коллекцию.
        ...(match.domainSettingsId === null
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            {}
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            { gameSettingsId: match.domainSettingsId }),
        // Обрабатываем конструкцию: anticheat.
        anticheat: match.anticheat as NonNullable<InstalledGame["anticheat"]>,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: reset.
    reset();
    // Обрабатываем конструкцию: onClose.
    onClose();
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open={open} onClose={() => { reset(); onClose(….
  return (
    // Обрабатываем конструкцию: <Modal open={open} onClose={() => { reset(); onClose();….
    <Modal
      // Обрабатываем конструкцию: open.
      open={open}
      // Обрабатываем конструкцию: onClose.
      onClose={() => {
        // Обрабатываем конструкцию: reset.
        reset();
        // Обрабатываем конструкцию: onClose.
        onClose();
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: title.
      title={t("settings.games.installed.add.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.games.installed.add.description")}
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
              // Обрабатываем конструкцию: reset.
              reset();
              // Обрабатываем конструкцию: onClose.
              onClose();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("common.cancel")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: disabled.
            disabled={path.trim() === ""}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: submit.
              submit();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.add.submit")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </>
        // Закрываем текущий блок.
      }
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <Input
          // Обрабатываем конструкцию: label.
          label={t("settings.games.name")}
          // Обрабатываем конструкцию: value.
          value={name}
          // Обрабатываем конструкцию: maxLength.
          maxLength={64}
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: setName.
            setName(event.target.value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex items-end gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <Input
            // Обрабатываем конструкцию: className.
            className="flex-1"
            // Обрабатываем конструкцию: label.
            label={t("settings.games.installed.add.path")}
            // Обрабатываем конструкцию: value.
            value={path}
            // Обрабатываем конструкцию: placeholder.
            placeholder="C:\\Games\\MyGame\\game.exe"
            // Обрабатываем конструкцию: onChange.
            onChange={(event) => {
              // Обрабатываем конструкцию: setPath.
              setPath(event.target.value);
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: variant.
            variant="secondary"
            // Обрабатываем конструкцию: icon.
            icon={<FolderOpen aria-hidden="true" className="size-4" />}
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("settings.games.installed.add.browse")}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: void browse().
              void browse();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.add.browse")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
        <Dropdown
          // Обрабатываем конструкцию: label.
          label={t("settings.games.installed.add.platform")}
          // Обрабатываем конструкцию: value.
          value={platform}
          // Обрабатываем конструкцию: options.
          options={PLATFORMS.map((value) => ({
            // Передаём поле value в объект.
            value,
            // Обрабатываем конструкцию: label.
            label: t(PLATFORM_LABEL_KEYS[value]),
            // Закрываем текущий блок.
          }))}
          // Обрабатываем конструкцию: onChange.
          onChange={(value) => {
            // Обрабатываем конструкцию: setPlatform.
            setPlatform(value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <Dropdown
          // Обрабатываем конструкцию: label.
          label={t("settings.games.installed.add.bypass")}
          // Обрабатываем конструкцию: value.
          value={bypassId}
          // Обрабатываем конструкцию: options.
          options={[
            // Открываем объектный литерал.
            { value: "", label: t("settings.games.installed.add.bypassNone") },
            // Разворачиваем ...bypassOptions.map((game) => ({ value: game… в коллекцию.
            ...bypassOptions.map((game) => ({
              // Обрабатываем конструкцию: value.
              value: game.id,
              // Обрабатываем конструкцию: label.
              label: game.name,
              // Закрываем текущий блок.
            })),
            // Закрываем массив или список.
          ]}
          // Обрабатываем конструкцию: onChange.
          onChange={(value) => {
            // Обрабатываем конструкцию: setBypassId.
            setBypassId(value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
