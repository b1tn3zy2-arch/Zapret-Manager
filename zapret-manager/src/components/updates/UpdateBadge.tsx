// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Объявляем функцию UpdateBadge.
function UpdateBadge() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const info = useUpdateStore((state) => state.status ===….
  const info = useUpdateStore(
    // Продолжаем предыдущую конструкцию.
    (state) =>
      // Обрабатываем конструкцию: state.
      state.status === "available" && !state.isDismissed ? state.info : null
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: info === null.
  if (info === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <span aria-hidden=true title={t(updates.badge, { vers….
  return (
    // Обрабатываем конструкцию: <span aria-hidden=true title={t(updates.badge, { versio….
    <span
      // Обрабатываем конструкцию: aria-hidden.
      aria-hidden="true"
      // Обрабатываем конструкцию: title.
      title={t("updates.badge", { version: info.latestVersion })}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: text-bg-bg text-accent-primary absolute -top-1 -right-1….
        "text-bg-bg text-accent-primary absolute -top-1 -right-1 z-10",
        // Обрабатываем конструкцию: flex size-5 items-center justify-center rounded-full te….
        "flex size-5 items-center justify-center rounded-full text-[10px] font-bold",
        // Обрабатываем конструкцию: ring-bg-bg-secondary ring-2.
        "ring-bg-bg-secondary ring-2"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="bg-accent-primary absolute inset-0 animate-ping rounded-full opacity-60" />
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="relative">↓</span>
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default UpdateBadge;.
export default UpdateBadge;
// — разделитель логических блоков —
