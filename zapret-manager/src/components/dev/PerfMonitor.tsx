// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/usePerfSnapshot.
import { usePerfSnapshot } from "@/hooks/usePerfSnapshot";
// Импортируем зависимости из модуля @/lib/constants.
import { PERF_TARGETS } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LONG_TASK_THRESHOLD_MS = 50.
const LONG_TASK_THRESHOLD_MS = 50;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function PerfMonitor() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { fps, heapMb, domNodes, longTasks } = usePerfSna….
  const { fps, heapMb, domNodes, longTasks } = usePerfSnapshot();
  // Обрабатываем конструкцию: const fpsTarget = PERF_TARGETS.fps.
  const fpsTarget = PERF_TARGETS.fps;
  // Обрабатываем конструкцию: const fpsState = fps === 0 ? — : fps >= fpsTarget ? ok ….
  const fpsState = fps === 0 ? "—" : fps >= fpsTarget ? "ok" : "low";
  // — разделитель логических блоков —

  // Возвращаем результат: ( <aside aria-label={t(ui.perfAria)} className=border-a….
  return (
    // Обрабатываем конструкцию: <aside aria-label={t(ui.perfAria)} className=border-acc….
    <aside
      // Обрабатываем конструкцию: aria-label.
      aria-label={t("ui.perfAria")}
      // Обрабатываем конструкцию: className.
      className="border-accent-primary/30 bg-bg-secondary/90 text-text-secondary pointer-events-none fixed right-4 bottom-4 z-[10000] flex flex-col gap-0.5 rounded-lg border px-3 py-2 font-mono text-[11px] shadow-lg"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-primary font-semibold">perf</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span>
        {/* Выводим текстовое содержимое в JSX. */}
        fps: {/* Выводим текстовое содержимое в JSX. */}
        {/* Продолжаем предыдущую конструкцию. */}
        <span className={fpsState === "low" ? "text-accent-warning" : ""}>
          {/* Выводим текстовое содержимое в JSX. */}
          {fps}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>{" "}
        {/* Выводим текстовое содержимое в JSX. */}({fpsState})
        {/* Обрабатываем конструкцию: </span>. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span>heap: {heapMb === null ? "n/a" : `${heapMb} MB`}</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span>dom: {domNodes}</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span>
        {/* Выводим текстовое содержимое в JSX. */}
        long tasks &gt;{LONG_TASK_THRESHOLD_MS}ms: {longTasks}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </aside>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default PerfMonitor;.
export default PerfMonitor;
// — разделитель логических блоков —
