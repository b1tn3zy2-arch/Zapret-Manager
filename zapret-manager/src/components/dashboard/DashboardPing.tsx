// Импортируем зависимости из модуля react.
import { memo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/PingSparkline.
import PingSparkline from "@/components/dashboard/PingSparkline";
// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/components/ui.
import { Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/usePing.
import { usePing } from "@/hooks/usePing";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/lib/constants.
import { PING_HISTORY_SIZE, PING_HOSTS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/pingUtils.
import {
  // Подключаем именованный импорт formatPing.
  formatPing,
  // Подключаем именованный импорт getPingColor.
  getPingColor,
  // Подключаем именованный импорт lastLatency.
  lastLatency,
  // Подключаем именованный импорт type PingPoint.
  type PingPoint,
  // Закрываем текущий блок.
} from "@/lib/pingUtils";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Панель пинга до сервисов.
 * Панель пинга до сервисов.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Две компоновки:
 * Две компоновки:
 // Сохраняем пояснение разработчика: * - при включённых логах — строки на всю ширину панели: граф…
 * - при включённых логах — строки на всю ширину панели: графику есть место,
 // Сохраняем пояснение разработчика: * чтобы читаться, и он не теряется в узкой колонке сетки;
 *   чтобы читаться, и он не теряется в узкой колонке сетки;
 // Сохраняем пояснение разработчика: * - при выключенных логах блок логов исчезает, и панель авто…
 * - при выключенных логах блок логов исчезает, и панель автоматически
 // Сохраняем пояснение разработчика: * переходит в компактные карточки в один ряд — она занимает …
 *   переходит в компактные карточки в один ряд — она занимает освободившееся
 // Сохраняем пояснение разработчика: * место и не остаётся растянутой пустотой.
 *   место и не остаётся растянутой пустотой.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию DashboardPing.
function DashboardPing() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { history } = usePing().
  const { history } = usePing();
  // Обрабатываем конструкцию: const logsEnabled = useSettingsStore( (state) => state.….
  const logsEnabled = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.enableLogs
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rows = PING_HOSTS.map(({ host, label }) => { cons….
  const rows = PING_HOSTS.map(({ host, label }) => {
    // Обрабатываем конструкцию: const points = history[host] ?? [].
    const points = history[host] ?? [];
    // Обрабатываем конструкцию: const latency = lastLatency(points).
    const latency = lastLatency(points);
    // — разделитель логических блоков —

    // Возвращаем результат: { host, label, points, latency, color: getPingColor(lat….
    return {
      // Передаём поле host в объект.
      host,
      // Передаём поле label в объект.
      label,
      // Передаём поле points в объект.
      points,
      // Передаём поле latency в объект.
      latency,
      // Обрабатываем конструкцию: color.
      color: getPingColor(latency),
      // Обрабатываем конструкцию: quality.
      quality: Math.min(Math.max(points.length / PING_HISTORY_SIZE, 0), 1),
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=lg className=flex flex-col gap-5>….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=lg className=flex flex-col gap-5>.
    <GlassPanel padding="lg" className="flex flex-col gap-5">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <h3 className="text-text-primary flex items-center gap-2 text-base font-semibold">
          {/* Выводим текстовое содержимое в JSX. */}
          <span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: className.
            className="bg-accent-primary inline-block size-1.5 animate-pulse rounded-full"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.ping.title")}
          {/* Выводим текстовое содержимое в JSX. */}
        </h3>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="caption" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {logsEnabled
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("dashboard.ping.hint")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              t("dashboard.ping.hintCompact")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: grid gap-2.
          "grid gap-2",
          // Обрабатываем конструкцию: logsEnabled.
          logsEnabled
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "grid-cols-1"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {rows.map(
          // Продолжаем предыдущую конструкцию.
          (row) =>
            // Обрабатываем конструкцию: logsEnabled.
            logsEnabled ? (
              // Рендерим самозакрывающийся элемент PingRowWide.
              <PingRowWide key={row.host} {...row} />
            ) : (
              // Продолжаем предыдущую конструкцию.
              // Закрываем выражение или список аргументов.
              // Рендерим самозакрывающийся элемент PingRowCompact.
              <PingRowCompact key={row.host} {...row} />
              // Закрываем выражение или список аргументов.
            )
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PingRowBase с контрактом данных.
interface PingRowBase {
  // Обрабатываем конструкцию: host.
  host: string;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: points.
  points: PingPoint[];
  // Обрабатываем конструкцию: latency.
  latency: number | null;
  // Обрабатываем конструкцию: color.
  color: string;
  // Обрабатываем конструкцию: quality.
  quality: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию PingRowWide.
function PingRowWide({
  // Обрабатываем конструкцию: host.
  host,
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: points.
  points,
  // Обрабатываем конструкцию: latency.
  latency,
  // Обрабатываем конструкцию: color.
  color,
  // Обрабатываем конструкцию: quality.
  quality,
  // Закрываем текущий блок.
}: PingRowBase) {
  // Возвращаем результат: ( <div data-ping-host={host} className={cn( hover:bg-gl….
  return (
    // Обрабатываем конструкцию: <div data-ping-host={host} className={cn( hover:bg-glas….
    <div
      // Обрабатываем конструкцию: data-ping-host.
      data-ping-host={host}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: hover:bg-glass-hover/40 grid items-center gap-5 rounded….
        "hover:bg-glass-hover/40 grid items-center gap-5 rounded-lg px-3 py-3",
        // Обрабатываем конструкцию: transition-colors duration-200.
        "transition-colors duration-200",
        // Обрабатываем конструкцию: grid-cols-[minmax(96px,150px)_1fr_minmax(64px,auto)].
        "grid-cols-[minmax(96px,150px)_1fr_minmax(64px,auto)]"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-w-0 flex-col">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-primary truncate text-sm font-medium">
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-tertiary truncate text-[11px]">{host}</span>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="relative min-w-0">
        {/* Выводим текстовое содержимое в JSX. */}
        <PingSparkline points={points} height={40} />
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="bg-glass-border absolute inset-x-0 -bottom-1 h-px opacity-40"
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: transform.
            transform: `scaleX(${quality.toFixed(3)})`,
            // Обрабатываем конструкцию: transformOrigin.
            transformOrigin: "right",
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: className.
        className="text-right text-sm font-semibold tabular-nums"
        // Обрабатываем конструкцию: style.
        style={{ color }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {formatPing(latency)}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию PingRowCompact.
function PingRowCompact({ host, label, points, latency, color }: PingRowBase) {
  // Возвращаем результат: ( <div data-ping-host={host} className={cn( bg-bg-prima….
  return (
    // Обрабатываем конструкцию: <div data-ping-host={host} className={cn( bg-bg-primary….
    <div
      // Обрабатываем конструкцию: data-ping-host.
      data-ping-host={host}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: bg-bg-primary/40 border-glass-border flex flex-col gap-….
        "bg-bg-primary/40 border-glass-border flex flex-col gap-2 rounded-xl border px-3 py-3",
        // Обрабатываем конструкцию: transition-colors duration-200.
        "transition-colors duration-200"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex items-baseline justify-between gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-primary truncate text-sm font-medium">
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-sm font-semibold tabular-nums" style={{ color }}>
          {/* Выводим текстовое содержимое в JSX. */}
          {formatPing(latency)}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary truncate text-[11px]">{host}</span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <PingSparkline points={points} height={28} />
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MemoDashboardPing = memo(DashboardPing).
const MemoDashboardPing = memo(DashboardPing);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default MemoDashboardPing;.
export default MemoDashboardPing;
// — разделитель логических блоков —
