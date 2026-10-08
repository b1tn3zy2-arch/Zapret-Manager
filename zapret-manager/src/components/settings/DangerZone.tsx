import { useState } from "react";
import { Trash2 } from "lucide-react";

import { Button, Input, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { deleteAllBackups } from "@/hooks/useSystemInfo";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

const DANGER_CONFIRM = "DELETE";

export type DangerAction = "reset" | "logs" | "backups";

function DangerZone() {
  const { t } = useI18n();
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const resetToDefaults = useSettingsStore((state) => state.resetToDefaults);
  const clearLogs = useLogsStore((state) => state.clearLogs);
  const addLog = useLogsStore((state) => state.addLog);

  const [danger, setDanger] = useState<DangerAction | null>(null);
  const [confirm, setConfirm] = useState("");

  const open = (action: DangerAction): void => {
    setDanger(action);
    setConfirm("");
  };

  const close = (): void => {
    setDanger(null);
    setConfirm("");
  };

  const confirmDanger = async (): Promise<void> => {
    if (danger === null || confirm !== DANGER_CONFIRM) {
      return;
    }

    if (danger === "reset") {
      resetToDefaults();
      addLog({
        level: "warn",
        source: "user",
        message: "Все настройки сброшены к значениям по умолчанию",
      });
    }

    if (danger === "logs") {
      clearLogs();
      addLog({
        level: "warn",
        source: "user",
        message: "Журнал логов очищен",
      });
    }

    if (danger === "backups" && folder !== "") {
      try {
        const removed = await deleteAllBackups(folder);
        addLog({
          level: "warn",
          source: "user",
          message: `Удалено бэкапов: ${removed}`,
        });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: `Бэкапы не удалены: ${toErrorMessage(caught)}`,
        });
      }
    }

    close();
  };

  return (
    <>
      <div className="flex flex-col gap-3 py-3">
        <div className="flex flex-col gap-1">
          <Text variant="label" className="text-accent-danger">
            {t("settings.advanced.danger")}
          </Text>
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {t("settings.advanced.dangerHint")}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              open("reset");
            }}
          >
            {t("settings.advanced.resetAll")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              open("logs");
            }}
          >
            {t("settings.advanced.clearLogs")}
          </Button>
          <Button
            size="sm"
            variant="danger"
            disabled={folder === ""}
            onClick={() => {
              open("backups");
            }}
            icon={<Trash2 aria-hidden="true" className="size-4" />}
          >
            {t("settings.advanced.deleteBackups")}
          </Button>
        </div>
      </div>

      <Modal
        open={danger !== null}
        onClose={close}
        title={t("settings.advanced.danger")}
        description="Введите DELETE для подтверждения"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Отмена
            </Button>
            <Button
              variant="danger"
              disabled={confirm !== DANGER_CONFIRM}
              onClick={() => {
                void confirmDanger();
              }}
            >
              Подтвердить
            </Button>
          </>
        }
      >
        <Input
          variant="filled"
          value={confirm}
          placeholder={DANGER_CONFIRM}
          aria-label="Подтверждение"
          onChange={(event) => {
            setConfirm(event.target.value);
          }}
        />
      </Modal>
    </>
  );
}

export default DangerZone;
