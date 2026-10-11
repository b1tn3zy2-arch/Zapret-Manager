import { useState } from "react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/Button";
import Dropdown from "@/components/settings/Dropdown";
import { Input } from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import { manualGame, PLATFORM_LABEL_KEYS } from "@/lib/installedGames";
import type { GameSettings, InstalledGame } from "@/types";

const PLATFORMS: InstalledGame["platform"][] = [
  "custom",
  "steam",
  "epic",
  "gog",
];

export interface AddGameDialogProps {
  open: boolean;
  bypassOptions: readonly GameSettings[];
  onClose: () => void;
  onAdd: (game: InstalledGame) => void;
}

export default function AddGameDialog({
  open,
  bypassOptions,
  onClose,
  onAdd,
}: AddGameDialogProps) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [path, setPath] = useState("");
  const [platform, setPlatform] = useState<InstalledGame["platform"]>("custom");
  const [bypassId, setBypassId] = useState("");

  const reset = (): void => {
    setName("");
    setPath("");
    setPlatform("custom");
    setBypassId("");
  };

  const browse = async (): Promise<void> => {
    const selected = await openDialog({
      multiple: false,
      directory: false,
      filters: [{ name: "exe", extensions: ["exe"] }],
    });

    if (typeof selected === "string") {
      setPath(selected);
    }
  };

  const submit = (): void => {
    if (path.trim() === "") {
      return;
    }

    onAdd(
      manualGame(
        name,
        path.trim(),
        platform,
        bypassId === "" ? undefined : bypassId
      )
    );
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={t("settings.games.installed.add.title")}
      description={t("settings.games.installed.add.description")}
      footer={
        <>
          <Button
            variant="ghost"
            onClick={() => {
              reset();
              onClose();
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            disabled={path.trim() === ""}
            onClick={() => {
              submit();
            }}
          >
            {t("settings.games.installed.add.submit")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          label={t("settings.games.name")}
          value={name}
          maxLength={64}
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
        <div className="flex items-end gap-2">
          <Input
            className="flex-1"
            label={t("settings.games.installed.add.path")}
            value={path}
            placeholder="C:\\Games\\MyGame\\game.exe"
            onChange={(event) => {
              setPath(event.target.value);
            }}
          />
          <Button
            variant="secondary"
            icon={<FolderOpen aria-hidden="true" className="size-4" />}
            aria-label={t("settings.games.installed.add.browse")}
            onClick={() => {
              void browse();
            }}
          >
            {t("settings.games.installed.add.browse")}
          </Button>
        </div>
        <Dropdown
          label={t("settings.games.installed.add.platform")}
          value={platform}
          options={PLATFORMS.map((value) => ({
            value,
            label: t(PLATFORM_LABEL_KEYS[value]),
          }))}
          onChange={(value) => {
            setPlatform(value);
          }}
        />
        <Dropdown
          label={t("settings.games.installed.add.bypass")}
          value={bypassId}
          options={[
            { value: "", label: t("settings.games.installed.add.bypassNone") },
            ...bypassOptions.map((game) => ({
              value: game.id,
              label: game.name,
            })),
          ]}
          onChange={(value) => {
            setBypassId(value);
          }}
        />
      </div>
    </Modal>
  );
}
