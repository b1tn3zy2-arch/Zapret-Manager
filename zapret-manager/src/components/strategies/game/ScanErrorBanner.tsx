// Импортируем зависимости из модуля @/components/shared/ErrorBanner.
import ErrorBanner from "@/components/shared/ErrorBanner";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ScanErrorBannerProps {
  // Обрабатываем конструкцию: message.
  message: string;
  // Обрабатываем конструкцию: onRetry.
  onRetry: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Ошибка сканирования папки стратегий. Оставлено отдельным и…
 * Ошибка сканирования папки стратегий. Оставлено отдельным именем,
 // Сохраняем пояснение разработчика: * чтобы не менять импорты на странице стратегий.
 * чтобы не менять импорты на странице стратегий.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function ScanErrorBanner({ message, onRetry }: ScanErrorBannerProps) {
  // Возвращаем результат: <ErrorBanner message={message} onRetry={onRetry} />.
  return <ErrorBanner message={message} onRetry={onRetry} />;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
