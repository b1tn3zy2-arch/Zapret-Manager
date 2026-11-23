// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/PingSparkline.
import PingSparkline from "@/components/dashboard/PingSparkline";
// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/hooks/usePing.
import { usePing } from "@/hooks/usePing";
// Импортируем зависимости из модуля @/lib/constants.
import { MONITOR_PING_HISTORY_SIZE, PING_HOSTS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/pingUtils.
import { formatPing, getPingColor, lastLatency } from "@/lib/pingUtils";
// Импортируем зависимости из модуля @/hooks/usePing.
import type { PingHistory } from "@/hooks/usePing";
// Импортируем зависимости из модуля @/lib/pingUtils.
import type { PingPoint } from "@/lib/pingUtils";
// — разделитель логических блоков —

// Объявляем интерфейс PingChipProps с контрактом данных.
interface PingChipProps {
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: points.
  points: PingPoint[];
  // Обрабатываем конструкцию: title.
  title: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию PingChip.
function PingChip({ label, points, title }: PingChipProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const latency = lastLatency(points).
  const latency = lastLatency(points);
  // Обрабатываем конструкцию: const color = getPingColor(latency).
  const color = getPingColor(latency);
  // Обрабатываем конструкцию: const isWaiting = points.length === 0.
  const isWaiting = points.length === 0;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div title={title} className=border-glass-border bg-b….
  return (
    // Обрабатываем конструкцию: <div title={title} className=border-glass-border bg-bg-….
    <div
      // Обрабатываем конструкцию: title.
      title={title}
      // Обрабатываем конструкцию: className.
      className="border-glass-border bg-bg-tertiary/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-w-0 flex-col">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-secondary truncate text-xs font-medium">
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        {isWaiting ? (
          // Обрабатываем конструкцию: <span className=text-text-tertiary truncate text-[10px]….
          <span className="text-text-tertiary truncate text-[10px]">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("monitor.ping.waiting")}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex shrink-0 items-center gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <PingSparkline
          // Обрабатываем конструкцию: points.
          points={points}
          // Обрабатываем конструкцию: height.
          height={22}
          // Обрабатываем конструкцию: capacity.
          capacity={MONITOR_PING_HISTORY_SIZE}
          // Обрабатываем конструкцию: showEmptyState.
          showEmptyState={false}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-base font-bold tabular-nums" style={{ color }}>
          {/* Выводим текстовое содержимое в JSX. */}
          {isWaiting ? "—" : formatPing(latency)}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию resolve.
function resolve(history: PingHistory, host: string): PingPoint[] {
  // Возвращаем результат: history[host] ?? [].
  return history[host] ?? [];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Пинг до сервисов — одной панелью с компактными чипами.
 * Пинг до сервисов — одной панелью с компактными чипами.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше на каждый сервис была отдельная карточка с подписью…
 * Раньше на каждый сервис была отдельная карточка с подписью «30 замеров за
 // Сохраняем пояснение разработчика: * минуту»: три сервиса занимали пол-экрана и сообщали одно и…
 * минуту»: три сервиса занимали пол-экрана и сообщали одно и то же.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию PingMonitor.
function PingMonitor() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { history } = usePing({ hosts: PING_HOSTS, histor….
  const { history } = usePing({
    // Обрабатываем конструкцию: hosts.
    hosts: PING_HOSTS,
    // Обрабатываем конструкцию: historySize.
    historySize: MONITOR_PING_HISTORY_SIZE,
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel padding=md className=flex flex-col gap-3>….
  return (
    // Обрабатываем конструкцию: <GlassPanel padding=md className=flex flex-col gap-3>.
    <GlassPanel padding="md" className="flex flex-col gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary text-xs font-medium">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("monitor.ping.section")}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {/* Выводим текстовое содержимое в JSX. */}
        {PING_HOSTS.map(({ host, label }) => (
          // Рендерим самозакрывающийся элемент PingChip.
          <PingChip
            // Обрабатываем конструкцию: key.
            key={host}
            // Обрабатываем конструкцию: label.
            label={label}
            // Обрабатываем конструкцию: points.
            points={resolve(history, host)}
            // Обрабатываем конструкцию: title.
            title={host}
            // Продолжаем выражение.
          />
          // Закрываем выражение или список аргументов.
        ))}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default PingMonitor;.
export default PingMonitor;
// — разделитель логических блоков —
