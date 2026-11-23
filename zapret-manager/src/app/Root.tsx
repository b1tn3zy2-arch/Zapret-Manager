// Импортируем зависимости из модуля react.
import { Suspense, lazy } from "react";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const App = lazy(async () => await import(@/app/App)).
const App = lazy(async () => await import("@/app/App"));
// Обрабатываем конструкцию: const TrayMenuRoot = lazy(async () => await import(@/tr….
const TrayMenuRoot = lazy(async () => await import("@/tray/TrayMenuRoot"));
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface RootProps {
  // Обрабатываем конструкцию: trayView.
  trayView: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Root({ trayView }: RootProps) {
  // Возвращаем результат: ( <Suspense fallback={null}>{trayView ? <TrayMenuRoot /….
  return (
    // Обрабатываем конструкцию: <Suspense fallback={null}>.
    <Suspense fallback={null}>{trayView ? <TrayMenuRoot /> : <App />}</Suspense>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
