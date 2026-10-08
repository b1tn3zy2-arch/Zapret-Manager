import { useCallback, useEffect, useState } from "react";

import {
  useConnectionStatus,
  useErrorsCount,
  useStrategiesCount,
} from "@/stores/selectors";
import { useLogsStore } from "@/stores/useLogsStore";
import { generateMockLogs } from "@/stores/mocks/logs";
import { MOCK_STRATEGIES, USE_MOCKS } from "@/stores/mocks/strategies";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { Badge, Button, Heading, Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { CONNECTION_LABELS } from "@/lib/constants";
import { getSettingsPath } from "@/lib/storage";

interface MetricProps {
  label: string;
  value: string;
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <Text variant="caption" size="sm">
        {label}
      </Text>
      <Text variant="body" size="md" className="font-medium">
        {value}
      </Text>
    </div>
  );
}

function MocksPanel() {
  const strategiesCount = useStrategiesCount();
  const strategies = useStrategiesStore((state) => state.strategies);
  const errorsCount = useErrorsCount();
  const connectionStatus = useConnectionStatus();
  const logsCount = useLogsStore((state) => state.logs.length);
  const setStrategies = useStrategiesStore((state) => state.setStrategies);
  const clearStrategies = useStrategiesStore((state) => state.clearAll);
  const addLogs = useLogsStore((state) => state.addLogs);
  const clearLogs = useLogsStore((state) => state.clearLogs);
  const [burst, setBurst] = useState(0);

  const loadMocks = useCallback(() => {
    setStrategies(MOCK_STRATEGIES);
    addLogs(generateMockLogs(200));
  }, [setStrategies, addLogs]);

  const generateThousand = useCallback(() => {
    addLogs(generateMockLogs(1000));
    setBurst((value) => value + 1);
  }, [addLogs]);

  const clearAll = useCallback(() => {
    clearStrategies();
    clearLogs();
    setBurst(0);
  }, [clearStrategies, clearLogs]);

  const [settingsPath, setSettingsPath] = useState<string | null>(null);
  const loaded = useSettingsStore((state) => state.loaded);
  const settingsError = useSettingsStore((state) => state.error);
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);

  useEffect(() => {
    let cancelled = false;

    void getSettingsPath()
      .then((path) => {
        if (!cancelled) {
          setSettingsPath(path);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setSettingsPath(`ошибка: ${String(caught)}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Heading level={3}>Моковые данные</Heading>
        <Text variant="caption" size="md">
          Только для dev. Проверка сторов, батчинга логов и селекторов.
        </Text>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Metric label="Стратегий" value={String(strategiesCount)} />
        <Metric label="Статус" value={CONNECTION_LABELS[connectionStatus]} />
        <Metric label="Логов" value={String(logsCount)} />
        <Metric label="Ошибок" value={String(errorsCount)} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={loadMocks}>Загрузить моки</Button>
        <Button variant="secondary" onClick={generateThousand}>
          Сгенерировать 1000 логов
        </Button>
        <Button variant="danger" onClick={clearAll}>
          Очистить всё
        </Button>
        {burst > 0 ? (
          <Badge variant="accent" dot pulse>
            {`${burst} партий по 1000`}
          </Badge>
        ) : null}
      </div>

      <GlassPanel
        padding="sm"
        className="text-text-tertiary flex flex-col gap-1"
      >
        <Text variant="mono" size="sm">
          USE_MOCKS = {String(USE_MOCKS)} · буфер логов 10 000 · батчинг 100 мс
          / 50 записей
        </Text>
        <Text variant="mono" size="sm">
          strategiesFolder = {folder === "" ? "(пусто)" : folder}
        </Text>
        <Text variant="mono" size="sm">
          settings loaded = {String(loaded)} · error = {settingsError ?? "нет"}
        </Text>
        <Text variant="mono" size="sm">
          settingsPath = {settingsPath === null ? "не определён" : settingsPath}
        </Text>
        <Text variant="mono" size="sm">
          статусы ={" "}
          {strategies.length === 0
            ? "(нет стратегий)"
            : strategies
                .map((item) => `${item.name}:${item.status}`)
                .join(", ")}
        </Text>
      </GlassPanel>
    </section>
  );
}

export default MocksPanel;
