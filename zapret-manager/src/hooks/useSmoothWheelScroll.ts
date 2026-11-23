// Импортируем зависимости из модуля react.
import { useEffect, type RefObject } from "react";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EASE = 0.16.
const EASE = 0.16;
// Обрабатываем конструкцию: const SETTLE_PX = 0.4.
const SETTLE_PX = 0.4;
// Обрабатываем конструкцию: const LINE_HEIGHT_PX = 16.
const LINE_HEIGHT_PX = 16;
// — разделитель логических блоков —

// Объявляем функцию scrollableParent.
function scrollableParent(
  // Обрабатываем конструкцию: target.
  target: EventTarget | null,
  // Обрабатываем конструкцию: boundary.
  boundary: HTMLElement,
  // Обрабатываем конструкцию: deltaY.
  deltaY: number
  // Закрываем выражение или список аргументов.
): HTMLElement | null {
  // Обрабатываем конструкцию: let node = target instanceof Element ? target : null.
  let node = target instanceof Element ? target : null;
  // — разделитель логических блоков —

  // Повторяем, пока верно условие node !== null && node !== boundary.
  while (node !== null && node !== boundary) {
    // Проверяем бизнес-условие: node instanceof HTMLElement.
    if (node instanceof HTMLElement) {
      // Обрабатываем конструкцию: const style = window.getComputedStyle(node).
      const style = window.getComputedStyle(node);
      // Обрабатываем конструкцию: const overflowY = style.overflowY.
      const overflowY = style.overflowY;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: (overflowY === auto || overflowY === scroll) && node.sc….
      if (
        // Обрабатываем конструкцию: (overflowY === auto || overflowY === scroll).
        (overflowY === "auto" || overflowY === "scroll") &&
        // Обрабатываем конструкцию: node.
        node.scrollHeight > node.clientHeight + 1
        // Закрываем выражение или список аргументов.
      ) {
        // Обрабатываем конструкцию: const atTop = node.scrollTop <= 0.
        const atTop = node.scrollTop <= 0;
        // Обрабатываем конструкцию: const atBottom = node.scrollTop + node.clientHeight >= ….
        const atBottom =
          // Обрабатываем конструкцию: node.
          node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: (deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom).
        if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
          // Возвращаем результат: node.
          return node;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: node.
    node = node.parentElement;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: null.
  return null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useSmoothWheelScroll(ref: RefObject<HTMLElement | null>): void {
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const element = ref.current.
    const element = ref.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: element === null.
    if (element === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: let target = element.scrollTop.
    let target = element.scrollTop;
    // Обрабатываем конструкцию: let frame = 0.
    let frame = 0;
    // Обрабатываем конструкцию: let animating = false.
    let animating = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const maxScroll = (): number => element.scrollHeight - ….
    const maxScroll = (): number => element.scrollHeight - element.clientHeight;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const step = (): void => { const diff = target - elemen….
    const step = (): void => {
      // Обрабатываем конструкцию: const diff = target - element.scrollTop.
      const diff = target - element.scrollTop;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: Math.abs(diff) < SETTLE_PX.
      if (Math.abs(diff) < SETTLE_PX) {
        // Обрабатываем конструкцию: element.
        element.scrollTop = target;
        // Обрабатываем конструкцию: animating.
        animating = false;
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: element.
      element.scrollTop += diff * EASE;
      // Обрабатываем конструкцию: frame.
      frame = window.requestAnimationFrame(step);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const onWheel = (event: WheelEvent): void => { if (even….
    const onWheel = (event: WheelEvent): void => {
      // Проверяем бизнес-условие: event.ctrlKey || event.metaKey.
      if (event.ctrlKey || event.metaKey) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: scrollableParent(event.target, element, event.deltaY) !….
      if (scrollableParent(event.target, element, event.deltaY) !== null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: element.scrollHeight <= element.clientHeight.
      if (element.scrollHeight <= element.clientHeight) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const delta = event.deltaMode === 1 ? event.deltaY * LI….
      const delta =
        // Обрабатываем конструкцию: event.
        event.deltaMode === 1 ? event.deltaY * LINE_HEIGHT_PX : event.deltaY;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !animating.
      if (!animating) {
        // Обрабатываем конструкцию: target.
        target = element.scrollTop;
        // Обрабатываем конструкцию: animating.
        animating = true;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: target.
      target = Math.min(Math.max(target + delta, 0), maxScroll());
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: window.
      window.cancelAnimationFrame(frame);
      // Обрабатываем конструкцию: frame.
      frame = window.requestAnimationFrame(step);
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const onScroll = (): void => { if (!animating) { target….
    const onScroll = (): void => {
      // Проверяем бизнес-условие: !animating.
      if (!animating) {
        // Обрабатываем конструкцию: target.
        target = element.scrollTop;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: element.
    element.addEventListener("wheel", onWheel, { passive: false });
    // Обрабатываем конструкцию: element.
    element.addEventListener("scroll", onScroll, { passive: true });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { element.removeEventListener(wheel, onWheel); el….
    return () => {
      // Обрабатываем конструкцию: element.
      element.removeEventListener("wheel", onWheel);
      // Обрабатываем конструкцию: element.
      element.removeEventListener("scroll", onScroll);
      // Обрабатываем конструкцию: window.
      window.cancelAnimationFrame(frame);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [ref]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
