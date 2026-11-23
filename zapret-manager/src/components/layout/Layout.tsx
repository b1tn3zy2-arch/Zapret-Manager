// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// Импортируем зависимости из модуля react.
import { useRef } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/layout/Sidebar.
import Sidebar from "@/components/layout/Sidebar";
// Импортируем зависимости из модуля @/components/layout/TitleBar.
import TitleBar from "@/components/layout/TitleBar";
// Импортируем зависимости из модуля @/hooks/useFullscreen.
import { useFullscreen } from "@/hooks/useFullscreen";
// Импортируем зависимости из модуля @/hooks/useSmoothWheelScroll.
import { useSmoothWheelScroll } from "@/hooks/useSmoothWheelScroll";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LayoutProps {
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Layout({ children }: LayoutProps) {
  // Обрабатываем конструкцию: const { isFullscreen } = useFullscreen().
  const { isFullscreen } = useFullscreen();
  // Обрабатываем конструкцию: const scrollRef = useRef<HTMLElement>(null).
  const scrollRef = useRef<HTMLElement>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useSmoothWheelScroll.
  useSmoothWheelScroll(scrollRef);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=bg-bg-primary flex h-screen w-screen f….
  return (
    // Обрабатываем конструкцию: <div className=bg-bg-primary flex h-screen w-screen fle….
    <div className="bg-bg-primary flex h-screen w-screen flex-col overflow-hidden">
      {/* Выводим текстовое содержимое в JSX. */}
      {isFullscreen ? null : <TitleBar />}
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Выводим текстовое содержимое в JSX. */}
        <Sidebar />
        {/* Выводим текстовое содержимое в JSX. */}
        <main
          // Обрабатываем конструкцию: ref.
          ref={scrollRef}
          // Обрабатываем конструкцию: className.
          className="flex min-w-0 flex-1 flex-col overflow-x-hidden overflow-y-auto"
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: paddingTop.
            paddingTop: "max(var(--space-lg), env(safe-area-inset-top, 0px))",
            // Обрабатываем конструкцию: paddingRight.
            paddingRight:
              // Обрабатываем конструкцию: max(var(--space-xl), env(safe-area-inset-right, 0px)).
              "max(var(--space-xl), env(safe-area-inset-right, 0px))",
            // Обрабатываем конструкцию: paddingBottom.
            paddingBottom:
              // Обрабатываем конструкцию: max(clamp(48px, 8vh, 128px), env(safe-area-inset-bottom….
              "max(clamp(48px, 8vh, 128px), env(safe-area-inset-bottom, 0px))",
            // Обрабатываем конструкцию: scrollPaddingBottom.
            scrollPaddingBottom:
              // Обрабатываем конструкцию: max(clamp(24px, 4vh, 64px), env(safe-area-inset-bottom,….
              "max(clamp(24px, 4vh, 64px), env(safe-area-inset-bottom, 0px))",
            // Обрабатываем конструкцию: paddingLeft.
            paddingLeft: "max(var(--space-xl), env(safe-area-inset-left, 0px))",
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {children}
          {/* Выводим текстовое содержимое в JSX. */}
        </main>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
