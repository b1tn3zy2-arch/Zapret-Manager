import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { FolderPlus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/i18n";

export interface GameFoldersDialogProps {
  open: boolean;
  folders: string[];
  scanning: boolean;
  onClose: () => void;
  onAdd: (folder: string) => Promise<void>;
  onRemove: (folder: string) => Promise<void>;
}

export default function GameFoldersDialog({
  open,
  folders,
  scanning,
  onClose,
  onAdd,
  onRemove,
}: GameFoldersDialogProps) {
  const { t } = useI18n();

  const pick = async (): Promise<void> => {
    const selected = await openDialog({ directory: true, multiple: false });

    if (typeof selected === "string") {
      await onAdd(selected);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("settings.games.installed.folders.title")}
      description={t("settings.games.installed.folders.hint")}
      size="sm"
      footer={
        <Button
          icon={<FolderPlus aria-hidden="true" className="size-4" />}
          onClick={() => {
            void pick();
          }}
        >
          {t("settings.games.installed.folders.add")}
        </Button>
      }
    >
      {folders.length === 0 ? (
        <p className="text-text-tertiary text-sm">
          {t("settings.games.installed.folders.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {folders.map((folder) => (
            <li
              key={folder}
              className="text-text-secondary flex items-center justify-between gap-2 text-sm"
            >
              <span className="truncate">{folder}</span>
              <Button
                size="sm"
                variant="ghost"
                disabled={scanning}
                onClick={() => {
                  void onRemove(folder);
                }}
              >
                {t("settings.games.installed.folders.remove")}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
