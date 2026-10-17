import { useEffect } from "react";

/**
 * Убирает встроенное контекстное меню WebView2.
 *
 * Окно приложения своё, без системного заголовка, но WebView2 по правому клику
 * показывает своё браузерное меню («Назад», «Обновить», «Сохранить как…»). Для
 * собственного интерфейса это выглядит как чужое окно, поэтому клик по правой
 * кнопке гасится целиком.
 *
 * Исключение одно намеренное: если пользователь выделил текст (например, строку
 * в логах), меню остаётся — иначе исчез бы и обычное «Копировать».
 */
export function useSuppressContextMenu(): void {
  useEffect(() => {
    const block = (event: MouseEvent): void => {
      const selection = window.getSelection();

      if (selection !== null && !selection.isCollapsed) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("contextmenu", block);

    return () => {
      document.removeEventListener("contextmenu", block);
    };
  }, []);
}
