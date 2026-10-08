import { useCallback, useEffect, useState } from "react";
import { History, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui";
import { useUpdater } from "@/hooks/useUpdater";
import { formatBytes } from "@/lib/trafficUtils";
import { formatVersion } from "@/lib/updateUtils";
import type { UpdateBackupInfo } from "@/types";

function BackupHistory() {
  const { loadBackups, rollback } = useUpdater();
  const [backups, setBackups] = useState<UpdateBackupInfo[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  const refresh = useCallback(() => {
    void loadBackups().then(setBackups);
  }, [loadBackups]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (backups.length === 0) {
    return (
      <p className="text-text-tertiary text-xs">
        Бэкапов пока нет. Они появляются автоматически перед каждым обновлением.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {backups.map((backup) => (
        <div
          key={backup.path}
          className="border-glass-border bg-bg-secondary/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
        >
          <span className="flex items-center gap-2 text-xs">
            <History
              aria-hidden="true"
              className="text-text-tertiary size-3.5"
            />
            <span className="text-text-primary font-mono">
              {new Date(backup.timestamp).toLocaleString("ru-RU")}
            </span>
            <span className="text-text-tertiary">
              {formatVersion(backup.version)} · {formatBytes(backup.size)}
            </span>
          </span>

          <Button
            size="sm"
            variant="secondary"
            disabled={isBusy}
            onClick={() => {
              setIsBusy(true);
              void rollback(backup.path).finally(() => {
                setIsBusy(false);
                refresh();
              });
            }}
            icon={<RotateCcw aria-hidden="true" className="size-3.5" />}
          >
            Вернуть
          </Button>
        </div>
      ))}
    </div>
  );
}

export default BackupHistory;
