import { open, save } from "@tauri-apps/plugin-dialog";
import { invoke } from "@tauri-apps/api/core";
import { readUserTextFile } from "@/lib/userCommands";
import { useCallback } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";

import EditableList from "@/components/settings/EditableList";
import { Button, Card, Text, Toggle } from "@/components/ui";
import { DEFAULT_OUTLAST_TRIALS } from "@/lib/defaults";
import { formatCount } from "@/lib/format";
import {
  mergeUnique,
  mergeUniqueNumbers,
  parseDomainsFromText,
  parseIpsFromText,
  parsePortsFromText,
} from "@/lib/parseImport";
import { domainError, ipError, portError } from "@/lib/validators";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

const TXT_FILTERS = [{ name: "Текстовый файл", extensions: ["txt"] }];

function toPortStrings(ports: number[]): string[] {
  return ports.map((port) => String(port));
}

function OutlastTrialsSection() {
  const settings = useSettingsStore((state) => state.settings);
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const addLog = useLogsStore((state) => state.addLog);
  const config = settings.outlastTrials;

  const patch = useCallback(
    (next: Partial<typeof config>): void => {
      updateSettings({ outlastTrials: { ...config, ...next } });
    },
    [config, updateSettings]
  );

  const report = (message: string, level: "info" | "warn" | "error"): void => {
    addLog({ level, source: "user", message: `Outlast Trials: ${message}` });
  };

  const handleImport = async (): Promise<void> => {
    const selected = await open({
      title: "Импорт списков Outlast Trials",
      multiple: true,
      filters: TXT_FILTERS,
    });

    if (selected === null) {
      return;
    }

    const paths = Array.isArray(selected) ? selected : [selected];

    for (const path of paths) {
      try {
        const text = await readUserTextFile(path);
        const importedDomains = parseDomainsFromText(text);
        const importedIps = parseIpsFromText(text);
        const importedPorts = parsePortsFromText(text);

        patch({
          domains: mergeUnique(config.domains, importedDomains),
          ipRanges: mergeUnique(config.ipRanges, importedIps),
          ports: mergeUniqueNumbers(config.ports, importedPorts),
        });

        report(
          `импортировано из ${path}: доменов ${importedDomains.length}, IP ${importedIps.length}, портов ${importedPorts.length}`,
          "info"
        );
      } catch (caught) {
        report(
          `не удалось прочитать ${path}: ${toErrorMessage(caught)}`,
          "error"
        );
      }
    }
  };

  const handleExport = async (): Promise<void> => {
    const target = await save({
      title: "Экспорт списков Outlast Trials",
      defaultPath: "outlast-trials-domains.txt",
      filters: TXT_FILTERS,
    });

    if (target === null) {
      return;
    }

    try {
      const content = [
        "# Домены",
        ...config.domains,
        "",
        "# IP-диапазоны",
        ...config.ipRanges,
        "",
        "# Порты",
        ...toPortStrings(config.ports),
      ].join("\n");

      await invoke<number>("write_log_export", {
        path: target,
        content: `${content}\n`,
      });

      report(`списки выгружены в ${target}`, "info");
    } catch (caught) {
      report(`ошибка экспорта: ${toErrorMessage(caught)}`, "error");
    }
  };

  const handleReset = (): void => {
    patch({
      domains: [...DEFAULT_OUTLAST_TRIALS.domains],
      ipRanges: [...DEFAULT_OUTLAST_TRIALS.ipRanges],
      ports: [...DEFAULT_OUTLAST_TRIALS.ports],
    });

    report("списки сброшены к значениям по умолчанию", "info");
  };

  return (
    <Card className="flex flex-col gap-5" padding="lg">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-lg font-semibold">
          Поддержка игры Outlast Trials
        </h2>
        <Text variant="body" size="sm" className="text-text-secondary">
          Домены добавляются в списки стратегии перед запуском и убираются при
          остановке. Файлы .bat не изменяются.
        </Text>
      </div>

      <Toggle
        checked={config.enabled}
        onChange={(value) => {
          patch({ enabled: value });
        }}
        label="Включить поддержку"
        description="Домены будут добавляться в конфиги при запуске стратегии"
      />

      <Toggle
        checked={config.createBackup}
        disabled={!config.enabled}
        onChange={(value) => {
          patch({ createBackup: value });
        }}
        label="Создавать бэкап перед изменением"
        description="Копия файла с суффиксом .bak, хранится 10 последних"
      />

      <Toggle
        checked={config.autoRestore}
        disabled={!config.enabled}
        onChange={(value) => {
          patch({ autoRestore: value });
        }}
        label="Убирать секцию после остановки"
        description="Отключите, если хотите оставить домены в конфигах"
      />

      <div className="flex flex-col gap-4">
        <EditableList
          items={config.domains}
          disabled={!config.enabled}
          label="Домены"
          placeholder="battleye.com"
          addLabel="Добавить домен"
          emptyMessage="Список пуст — инъекция будет пропущена"
          validate={domainError}
          onChange={(domains) => {
            patch({ domains });
          }}
        />

        <EditableList
          items={config.ipRanges}
          disabled={!config.enabled}
          label="IP-диапазоны"
          placeholder="8.8.8.0/24"
          addLabel="Добавить диапазон"
          emptyMessage="Необязательно. Добавляйте адреса матч-серверов вручную"
          validate={ipError}
          onChange={(ipRanges) => {
            patch({ ipRanges });
          }}
        />

        <EditableList
          items={toPortStrings(config.ports)}
          disabled={!config.enabled}
          type="number"
          label="Порты"
          placeholder="27015"
          addLabel="Добавить порт"
          emptyMessage="Порты winws берёт из .bat, поэтому в конфиги они не пишутся"
          validate={portError}
          onChange={(values) => {
            patch({
              ports: values
                .map((value) => Number(value))
                .filter((port) => Number.isInteger(port) && port > 0),
            });
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={!config.enabled}
          onClick={() => {
            void handleImport();
          }}
          icon={<Upload aria-hidden="true" className="size-3.5" />}
        >
          Импорт из файла
        </Button>

        <Button
          size="sm"
          variant="secondary"
          disabled={!config.enabled}
          onClick={() => {
            void handleExport();
          }}
          icon={<Download aria-hidden="true" className="size-3.5" />}
        >
          Экспорт в файл
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={!config.enabled}
          onClick={handleReset}
          icon={<RotateCcw aria-hidden="true" className="size-3.5" />}
        >
          Сбросить к дефолтным
        </Button>

        <Text
          variant="caption"
          size="sm"
          className="text-text-tertiary ml-auto"
        >
          {formatCount(config.domains.length, "домен", "домена", "доменов")},{" "}
          {formatCount(
            config.ipRanges.length,
            "диапазон",
            "диапазона",
            "диапазонов"
          )}
          , {formatCount(config.ports.length, "порт", "порта", "портов")}
        </Text>
      </div>
    </Card>
  );
}

export default OutlastTrialsSection;
