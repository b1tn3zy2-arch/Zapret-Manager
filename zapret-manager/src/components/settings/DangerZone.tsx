import { useState } from "react";
import { PowerOff, Trash2 } from "lucide-react";

import { Button, Input, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import {
  deleteAllBackups,
  deleteAllLogs,
  fullUninstall,
  quitApp,
} from "@/hooks/useSystemInfo";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

const DANGER_CONFIRM = "DELETE";

export type DangerAction = "reset" | "logs" | "backups" | "uninstall";

function DangerZone() {
  const { t } = useI18n();
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const resetToDefaults = useSettingsStore((state) => state.resetToDefaults);
  const saveToFile = useSettingsStore((state) => state.saveToFile);
  const loadFromFile = useSettingsStore((state) => state.loadFromFile);
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
      // Сброс обязан уйти в settings.json: раньше менялась только память,
      // и при следующем запуске приложение подхватывало старый файл обратно.
      resetToDefaults();
      const saved = await saveToFile();

      if (!saved) {
        addLog({
          level: "error",
          source: "user",
          message: t("settings.common.resetFailed"),
        });
      }

      await loadFromFile();
      addLog({
        level: "warn",
        source: "user",
        message: t("settings.common.resetDone"),
      });
    }

    if (danger === "logs") {
      // Файлы журналов удаляются с диска: иначе winws-логи и журнал
      // приложения возвращались при следующем старте.
      try {
        const removed = await deleteAllLogs();
        clearLogs();
        addLog({
          level: "warn",
          source: "user",
          message: t("settings.common.logsRemoved", { count: removed }),
        });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: t("settings.common.logsRemoveFailed", {
            error: toErrorMessage(caught),
          }),
        });
      }
    }

    if (danger === "backups" && folder !== "") {
      try {
        const removed = await deleteAllBackups(folder);
        addLog({
          level: "warn",
          source: "user",
          message: t("settings.common.backupsRemoved", { count: removed }),
        });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: t("settings.common.backupsRemoveFailed", {
            error: toErrorMessage(caught),
          }),
        });
      }
    }

    if (danger === "uninstall") {
      // Деинсталлятор закрывает приложение и удаляет всё, включая профиль.
      // Портативная сборка установщика не имеет — тогда сообщаем честно.
      try {
        await fullUninstall();
        await quitApp();
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: toErrorMessage(caught),
        });

        close();

        return;
      }

      return;
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
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              open("uninstall");
            }}
            icon={<PowerOff aria-hidden="true" className="size-4" />}
          >
            {t("settings.advanced.uninstallApp")}
          </Button>
        </div>
      </div>

      <Modal
        open={danger !== null}
        onClose={close}
        title={t(
          danger === "uninstall"
            ? "settings.advanced.uninstallTitle"
            : "settings.advanced.danger"
        )}
        description={t(
          danger === "uninstall"
            ? "settings.advanced.uninstallHint"
            : "settings.common.deleteConfirmPlaceholder"
        )}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              {t("settings.common.cancel")}
            </Button>
            <Button
              variant="danger"
              disabled={confirm !== DANGER_CONFIRM}
              onClick={() => {
                void confirmDanger();
              }}
            >
              {t("settings.common.confirm")}
            </Button>
          </>
        }
      >
        <Input
          variant="filled"
          value={confirm}
          placeholder={DANGER_CONFIRM}
          aria-label={t("settings.common.confirm")}
          onChange={(event) => {
            setConfirm(event.target.value);
          }}
        />
      </Modal>
    </>
  );
}

export default DangerZone;
