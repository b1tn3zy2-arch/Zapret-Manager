// Импортируем зависимости из модуля lucide-react.
import { Check, CircleHelp, RotateCw, TriangleAlert, X } from "lucide-react";
// Импортируем зависимости из модуля react.
import { useMemo, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/hooks/useGameLauncher.
import type { GameDiagnosis } from "@/hooks/useGameLauncher";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameDiagnosticsProps {
  // Обрабатываем конструкцию: diagnosis.
  diagnosis: GameDiagnosis;
  // Сохраняем пояснение разработчика: Работает ли сейчас обход.
  /** Работает ли сейчас обход. */
  // Обрабатываем конструкцию: bypassRunning.
  bypassRunning: boolean;
  // Сохраняем пояснение разработчика: Идёт ли перепроверка.
  /** Идёт ли перепроверка. */
  // Обрабатываем конструкцию: checking.
  checking: boolean;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Сохраняем пояснение разработчика: Проверить всё заново.
  /** Проверить всё заново. */
  // Обрабатываем конструкцию: onRecheck.
  onRecheck: () => void;
  // Сохраняем пояснение разработчика: Перезапустить обход.
  /** Перезапустить обход. */
  // Обрабатываем конструкцию: onRestartBypass.
  onRestartBypass: () => void;
  // Сохраняем пояснение разработчика: Включить VPN и подключиться.
  /** Включить VPN и подключиться. */
  // Обрабатываем конструкцию: onEnableVpn.
  onEnableVpn: () => void;
  // Сохраняем пояснение разработчика: Открыть папку с логами.
  /** Открыть папку с логами. */
  // Обрабатываем конструкцию: onOpenLogs.
  onOpenLogs: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Состояние одного шага проверки.
/** Состояние одного шага проверки. */
// Объявляем псевдоним типа StepState.
type StepState = "ok" | "fail" | "unknown";
// — разделитель логических блоков —

// Объявляем интерфейс Step с контрактом данных.
interface Step {
  // Обрабатываем конструкцию: key.
  key: string;
  // Обрабатываем конструкцию: state.
  state: StepState;
  // Обрабатываем конструкцию: title.
  title: string;
  // Обрабатываем конструкцию: detail.
  detail: string;
  // Сохраняем пояснение разработчика: Что можно сделать, если шаг не пройден.
  /** Что можно сделать, если шаг не пройден. */
  // Обрабатываем конструкцию: action.
  action?: "restart" | "vpn" | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Диагностика игры.
 * Диагностика игры.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Показывается не сводка из четырёх блоков, а чек-лист: по ш…
 * Показывается не сводка из четырёх блоков, а чек-лист: по шагам от
 // Сохраняем пояснение разработчика: * обхода до трафика к серверу матча. У каждого шага есть сос…
 * обхода до трафика к серверу матча. У каждого шага есть состояние,
 // Сохраняем пояснение разработчика: * объяснение и своё действие, а внизу — одна главная подсказ…
 * объяснение и своё действие, а внизу — одна главная подсказка, что
 // Сохраняем пояснение разработчика: * делать прямо сейчас.
 * делать прямо сейчас.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function GameDiagnostics({
  // Обрабатываем конструкцию: diagnosis.
  diagnosis,
  // Обрабатываем конструкцию: bypassRunning.
  bypassRunning,
  // Обрабатываем конструкцию: checking.
  checking,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onRecheck.
  onRecheck,
  // Обрабатываем конструкцию: onRestartBypass.
  onRestartBypass,
  // Обрабатываем конструкцию: onEnableVpn.
  onEnableVpn,
  // Обрабатываем конструкцию: onOpenLogs.
  onOpenLogs,
  // Закрываем текущий блок.
}: GameDiagnosticsProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [detailsOpen, setDetailsOpen] = useState(false).
  const [detailsOpen, setDetailsOpen] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const steps = useMemo<Step[]>(() => { const connectivit….
  const steps = useMemo<Step[]>(() => {
    // Обрабатываем конструкцию: const connectivity = diagnosis.connectivity.
    const connectivity = diagnosis.connectivity;
    // Обрабатываем конструкцию: const endpoints = diagnosis.endpoints.
    const endpoints = diagnosis.endpoints;
    // Обрабатываем конструкцию: const traffic = diagnosis.traffic.
    const traffic = diagnosis.traffic;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const dnsState: StepState = connectivity === null ? unk….
    const dnsState: StepState =
      // Обрабатываем конструкцию: connectivity.
      connectivity === null ? "unknown" : connectivity.dnsOk ? "ok" : "fail";
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const tcpProbes = connectivity?.tcp ?? [].
    const tcpProbes = connectivity?.tcp ?? [];
    // Обрабатываем конструкцию: const tcpFailed = tcpProbes.filter( (probe) => probe.st….
    const tcpFailed = tcpProbes.filter(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (probe) => probe.status === "failed"
      // Закрываем выражение или список аргументов.
    ).length;
    // Обрабатываем конструкцию: const tcpState: StepState = connectivity === null || tc….
    const tcpState: StepState =
      // Обрабатываем конструкцию: connectivity.
      connectivity === null || tcpProbes.length === 0
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          "unknown"
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          tcpFailed === 0
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "ok"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "fail";
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const endpointsFailed = endpoints.filter((endpoint) => ….
    const endpointsFailed = endpoints.filter((endpoint) => !endpoint.ok).length;
    // Обрабатываем конструкцию: const endpointsState: StepState = endpoints.length === ….
    const endpointsState: StepState =
      // Обрабатываем конструкцию: endpoints.
      endpoints.length === 0
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          "unknown"
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          endpointsFailed === 0
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "ok"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "fail";
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const trafficState: StepState = traffic === null ? unkn….
    const trafficState: StepState =
      // Обрабатываем конструкцию: traffic.
      traffic === null
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          "unknown"
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          traffic.verdict === "clean"
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "ok"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "fail";
    // — разделитель логических блоков —

    // Возвращаем результат: [ { key: bypass, state: bypassRunning ? ok : fail, titl….
    return [
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: key.
        key: "bypass",
        // Обрабатываем конструкцию: state.
        state: bypassRunning ? "ok" : "fail",
        // Обрабатываем конструкцию: title.
        title: t("settings.games.installed.diagnose.stepBypass"),
        // Обрабатываем конструкцию: detail.
        detail: bypassRunning
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            t("settings.games.installed.diagnose.stepBypassOk")
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            t("settings.games.installed.diagnose.stepBypassFail"),
        // Обрабатываем конструкцию: action.
        action: bypassRunning ? undefined : "restart",
        // Закрываем текущий блок.
      },
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: key.
        key: "dns",
        // Обрабатываем конструкцию: state.
        state: dnsState,
        // Обрабатываем конструкцию: title.
        title: t("settings.games.installed.diagnose.stepDns"),
        // Обрабатываем конструкцию: detail.
        detail:
          // Обрабатываем конструкцию: connectivity.
          connectivity === null
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("settings.games.installed.diagnose.stepUnknown")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              connectivity.dnsOk
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepDnsOk", {
                  // Обрабатываем конструкцию: address.
                  address: connectivity.dnsAddress ?? "—",
                  // Закрываем текущий блок.
                })
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepDnsFail", {
                  // Обрабатываем конструкцию: error.
                  error: connectivity.dnsError ?? "—",
                  // Закрываем текущий блок.
                }),
        // Обрабатываем конструкцию: action.
        action: dnsState === "fail" ? "restart" : undefined,
        // Закрываем текущий блок.
      },
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: key.
        key: "servers",
        // Обрабатываем конструкцию: state.
        state: tcpState,
        // Обрабатываем конструкцию: title.
        title: t("settings.games.installed.diagnose.stepServers"),
        // Обрабатываем конструкцию: detail.
        detail:
          // Обрабатываем конструкцию: tcpProbes.
          tcpProbes.length === 0
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("settings.games.installed.diagnose.stepUnknown")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              tcpFailed === 0
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepServersOk")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepServersFail", {
                  // Обрабатываем конструкцию: count.
                  count: tcpFailed,
                  // Обрабатываем конструкцию: total.
                  total: tcpProbes.length,
                  // Закрываем текущий блок.
                }),
        // Обрабатываем конструкцию: action.
        action: tcpState === "fail" ? "restart" : undefined,
        // Закрываем текущий блок.
      },
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: key.
        key: "services",
        // Обрабатываем конструкцию: state.
        state: endpointsState,
        // Обрабатываем конструкцию: title.
        title: t("settings.games.installed.diagnose.stepServices"),
        // Обрабатываем конструкцию: detail.
        detail:
          // Обрабатываем конструкцию: endpoints.
          endpoints.length === 0
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("settings.games.installed.diagnose.stepUnknown")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              endpointsFailed === 0
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepServicesOk")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepServicesFail", {
                  // Обрабатываем конструкцию: count.
                  count: endpointsFailed,
                  // Обрабатываем конструкцию: total.
                  total: endpoints.length,
                  // Закрываем текущий блок.
                }),
        // Обрабатываем конструкцию: action.
        action: endpointsState === "fail" ? "vpn" : undefined,
        // Закрываем текущий блок.
      },
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: key.
        key: "traffic",
        // Обрабатываем конструкцию: state.
        state: trafficState,
        // Обрабатываем конструкцию: title.
        title: t("settings.games.installed.diagnose.stepTraffic"),
        // Обрабатываем конструкцию: detail.
        detail:
          // Обрабатываем конструкцию: traffic.
          traffic === null
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("settings.games.installed.diagnose.stepUnknown")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              traffic.verdict === "clean"
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.stepTrafficOk")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                traffic.message,
        // Обрабатываем конструкцию: action.
        action: trafficState === "fail" ? "vpn" : undefined,
        // Закрываем текущий блок.
      },
      // Закрываем массив или список.
    ];
    // Закрываем текущий блок.
  }, [bypassRunning, diagnosis, t]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const failed = steps.filter((step) => step.state === fa….
  const failed = steps.filter((step) => step.state === "fail");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const recommendationKey: TranslationKey = failed.length….
  const recommendationKey: TranslationKey =
    // Обрабатываем конструкцию: failed.
    failed.length === 0
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        "settings.games.installed.diagnose.recommendationOk"
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        failed.some((step) => step.key === "bypass" || step.key === "servers")
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          "settings.games.installed.diagnose.recommendationRestart"
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          "settings.games.installed.diagnose.recommendationVpn";
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open onClose={onClose} title={t(settings.games….
  return (
    // Обрабатываем конструкцию: <Modal open onClose={onClose} title={t(settings.games.i….
    <Modal
      // Задаём атрибут open элемента.
      open
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: title.
      title={t("settings.games.installed.diagnose.title", {
        // Обрабатываем конструкцию: name.
        name: diagnosis.gameName,
        // Закрываем текущий блок.
      })}
      // Обрабатываем конструкцию: description.
      description={t("settings.games.installed.diagnose.subtitle")}
      // Обрабатываем конструкцию: size.
      size="lg"
      // Обрабатываем конструкцию: footer.
      footer={
        // Обрабатываем конструкцию: <>.
        <>
          {/* Выводим текстовое содержимое в JSX. */}
          {diagnosis.logPaths.length > 0 ? (
            // Обрабатываем конструкцию: <Button variant=ghost onClick={onOpenLogs}>.
            <Button variant="ghost" onClick={onOpenLogs}>
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.games.installed.diagnose.logs")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button variant="ghost" onClick={onClose}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.diagnose.close")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: variant.
            variant="secondary"
            // Обрабатываем конструкцию: disabled.
            disabled={checking}
            // Обрабатываем конструкцию: onClick.
            onClick={onRecheck}
            // Обрабатываем конструкцию: icon.
            icon={<RotateCw aria-hidden="true" className="size-4" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {checking
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.checking")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("settings.games.installed.diagnose.recheck")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </>
        // Закрываем текущий блок.
      }
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="border-glass-border bg-glass-bg flex flex-col gap-1 rounded-lg border p-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex items-center gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Badge
              // Обрабатываем конструкцию: variant.
              variant={failed.length === 0 ? "success" : "warning"}
              // Обрабатываем конструкцию: dot.
              dot={failed.length === 0}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {failed.length === 0
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  t("settings.games.installed.diagnose.verdictOk")
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("settings.games.installed.diagnose.verdictProblem", {
                    // Обрабатываем конструкцию: count.
                    count: failed.length,
                    // Закрываем текущий блок.
                  })}
              {/* Выводим текстовое содержимое в JSX. */}
            </Badge>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="sm" className="text-text-primary">
            {/* Выводим текстовое содержимое в JSX. */}
            {diagnosis.message ??
              // Обрабатываем конструкцию: t.
              t("settings.games.installed.diagnose.loading")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="caption" size="sm" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t(recommendationKey)}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <ul className="flex flex-col gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          {steps.map((step) => (
            // Обрабатываем конструкцию: <li key={step.key} className=border-glass-border flex i….
            <li
              // Обрабатываем конструкцию: key.
              key={step.key}
              // Обрабатываем конструкцию: className.
              className="border-glass-border flex items-start gap-3 rounded-lg border p-3"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <StepIcon state={step.state} />
              {/* — разделитель логических блоков — */}

              {/* Выводим текстовое содержимое в JSX. */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                {/* Выводим текстовое содержимое в JSX. */}
                <span className="text-text-primary text-sm font-medium">
                  {/* Выводим текстовое содержимое в JSX. */}
                  {step.title}
                  {/* Выводим текстовое содержимое в JSX. */}
                </span>
                {/* Выводим текстовое содержимое в JSX. */}
                <span className="text-text-tertiary text-xs">
                  {/* Выводим текстовое содержимое в JSX. */}
                  {step.detail}
                  {/* Выводим текстовое содержимое в JSX. */}
                </span>
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
              {/* — разделитель логических блоков — */}

              {/* Выводим текстовое содержимое в JSX. */}
              {step.action === "restart" ? (
                // Обрабатываем конструкцию: <Button size=sm variant=ghost onClick={onRestartBypass}….
                <Button
                  // Обрабатываем конструкцию: size.
                  size="sm"
                  // Обрабатываем конструкцию: variant.
                  variant="ghost"
                  // Обрабатываем конструкцию: onClick.
                  onClick={onRestartBypass}
                  // Обрабатываем конструкцию: icon.
                  icon={<RotateCw aria-hidden="true" className="size-3.5" />}
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  {t("settings.games.installed.diagnose.actionRestart")}
                  {/* Выводим текстовое содержимое в JSX. */}
                </Button>
              ) : // Закрываем выражение или список аргументов.
              // Продолжаем предыдущую конструкцию.
              null}
              {/* — разделитель логических блоков — */}

              {/* Выводим текстовое содержимое в JSX. */}
              {step.action === "vpn" ? (
                // Обрабатываем конструкцию: <Button size=sm variant=ghost onClick={onEnableVpn} ico….
                <Button
                  // Обрабатываем конструкцию: size.
                  size="sm"
                  // Обрабатываем конструкцию: variant.
                  variant="ghost"
                  // Обрабатываем конструкцию: onClick.
                  onClick={onEnableVpn}
                  // Обрабатываем конструкцию: icon.
                  icon={
                    // Рендерим самозакрывающийся элемент TriangleAlert.
                    <TriangleAlert aria-hidden="true" className="size-3.5" />
                    // Закрываем текущий блок.
                  }
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  {t("settings.games.installed.diagnose.actionVpn")}
                  {/* Выводим текстовое содержимое в JSX. */}
                </Button>
              ) : // Закрываем выражение или список аргументов.
              // Продолжаем предыдущую конструкцию.
              null}
              {/* Выводим текстовое содержимое в JSX. */}
            </li>
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
        </ul>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {failed.length > 0 ? (
          // Обрабатываем конструкцию: <Button variant=primary fullWidth onClick={onEnableVpn}….
          <Button variant="primary" fullWidth onClick={onEnableVpn}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.diagnose.actionVpn")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <details
          // Обрабатываем конструкцию: className.
          className="border-glass-border rounded-lg border p-3"
          // Обрабатываем конструкцию: open.
          open={detailsOpen}
          // Обрабатываем конструкцию: onToggle.
          onToggle={(event) => {
            // Обрабатываем конструкцию: setDetailsOpen.
            setDetailsOpen(event.currentTarget.open);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <summary className="text-text-secondary cursor-pointer text-xs select-none">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.games.installed.diagnose.details")}
            {/* Выводим текстовое содержимое в JSX. */}
          </summary>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <div className="mt-2 flex flex-col gap-1 text-xs">
            {/* Выводим текстовое содержимое в JSX. */}
            {diagnosis.applied.length > 0 ? (
              // Обрабатываем конструкцию: <>.
              <>
                {/* Выводим текстовое содержимое в JSX. */}
                <span className="text-text-tertiary">
                  {/* Выводим текстовое содержимое в JSX. */}
                  {t("settings.games.installed.diagnose.applied")}
                  {/* Выводим текстовое содержимое в JSX. */}
                </span>
                {/* Выводим текстовое содержимое в JSX. */}
                {diagnosis.applied.map((note) => (
                  // Обрабатываем конструкцию: <span key={note} className=text-text-secondary>.
                  <span key={note} className="text-text-secondary">
                    {/* Выводим текстовое содержимое в JSX. */}• {note}
                    {/* Выводим текстовое содержимое в JSX. */}
                  </span>
                  // Закрываем выражение или список аргументов.
                ))}
                {/* Выводим текстовое содержимое в JSX. */}
              </>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            {diagnosis.endpoints.map((endpoint) => (
              // Обрабатываем конструкцию: <span key={endpoint.host} className=text-text-tertiary>.
              <span key={endpoint.host} className="text-text-tertiary">
                {/* Выводим текстовое содержимое в JSX. */}
                {endpoint.host} · {endpoint.ok ? "ok" : "fail"}
                {/* Выводим текстовое содержимое в JSX. */}
                {endpoint.latencyMs === null
                  ? // Обрабатываем конструкцию: ?.
                    // Продолжаем предыдущую конструкцию.
                    ""
                  : // Обрабатываем конструкцию: :.
                    // Продолжаем предыдущую конструкцию.
                    ` · ${endpoint.latencyMs} ms`}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
              // Закрываем выражение или список аргументов.
            ))}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            {diagnosis.connectivity?.tcp.map((probe) => (
              // Обрабатываем конструкцию: <span key={${probe.target}:${probe.port}} className=tex….
              <span
                // Обрабатываем конструкцию: key.
                key={`${probe.target}:${probe.port}`}
                // Обрабатываем конструкцию: className.
                className="text-text-tertiary"
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {probe.target} · {probe.port} · {probe.status}
                {/* Выводим текстовое содержимое в JSX. */}
                {probe.latencyMs === null ? "" : ` · ${probe.latencyMs} ms`}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
              // Закрываем выражение или список аргументов.
            ))}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            {diagnosis.servers.slice(0, 3).map((server) => (
              // Обрабатываем конструкцию: <span key={${server.ip}:${server.port}} className=text-….
              <span
                // Обрабатываем конструкцию: key.
                key={`${server.ip}:${server.port}`}
                // Обрабатываем конструкцию: className.
                className="text-text-tertiary"
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {server.ip}:{server.port}
                {/* Выводим текстовое содержимое в JSX. */}
                {server.region === null ? "" : ` · ${server.region}`}
                {/* Выводим текстовое содержимое в JSX. */}
              </span>
              // Закрываем выражение или список аргументов.
            ))}
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
        </details>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Значок состояния шага.
/** Значок состояния шага. */
// Объявляем функцию StepIcon.
function StepIcon({ state }: { state: StepState }) {
  // Проверяем бизнес-условие: state === ok.
  if (state === "ok") {
    // Возвращаем результат: ( <Check aria-hidden=true className=text-status-success….
    return (
      // Рендерим самозакрывающийся элемент Check.
      <Check
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="text-status-success mt-0.5 size-4 shrink-0"
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: state === fail.
  if (state === "fail") {
    // Возвращаем результат: ( <X aria-hidden=true className=text-accent-danger mt-0….
    return (
      // Рендерим самозакрывающийся элемент X.
      <X
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="text-accent-danger mt-0.5 size-4 shrink-0"
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <CircleHelp aria-hidden=true className={cn(text-text-….
  return (
    // Рендерим самозакрывающийся элемент CircleHelp.
    <CircleHelp
      // Обрабатываем конструкцию: aria-hidden.
      aria-hidden="true"
      // Обрабатываем конструкцию: className.
      className={cn("text-text-tertiary mt-0.5 size-4 shrink-0")}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
