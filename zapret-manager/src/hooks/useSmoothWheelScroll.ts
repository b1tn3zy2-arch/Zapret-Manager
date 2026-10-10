import { useEffect, type RefObject } from "react";

const EASE = 0.16;
const SETTLE_PX = 0.4;
const LINE_HEIGHT_PX = 16;

function scrollableParent(
  target: EventTarget | null,
  boundary: HTMLElement,
  deltaY: number
): HTMLElement | null {
  let node = target instanceof Element ? target : null;

  while (node !== null && node !== boundary) {
    if (node instanceof HTMLElement) {
      const style = window.getComputedStyle(node);
      const overflowY = style.overflowY;

      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        node.scrollHeight > node.clientHeight + 1
      ) {
        const atTop = node.scrollTop <= 0;
        const atBottom =
          node.scrollTop + node.clientHeight >= node.scrollHeight - 1;

        if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) {
          return node;
        }
      }
    }

    node = node.parentElement;
  }

  return null;
}

export function useSmoothWheelScroll(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const element = ref.current;

    if (element === null) {
      return;
    }

    let target = element.scrollTop;
    let frame = 0;
    let animating = false;

    const maxScroll = (): number => element.scrollHeight - element.clientHeight;

    const step = (): void => {
      const diff = target - element.scrollTop;

      if (Math.abs(diff) < SETTLE_PX) {
        element.scrollTop = target;
        animating = false;
        return;
      }

      element.scrollTop += diff * EASE;
      frame = window.requestAnimationFrame(step);
    };

    const onWheel = (event: WheelEvent): void => {
      if (event.ctrlKey || event.metaKey) {
        return;
      }

      if (scrollableParent(event.target, element, event.deltaY) !== null) {
        return;
      }

      if (element.scrollHeight <= element.clientHeight) {
        return;
      }

      event.preventDefault();

      const delta =
        event.deltaMode === 1 ? event.deltaY * LINE_HEIGHT_PX : event.deltaY;

      if (!animating) {
        target = element.scrollTop;
        animating = true;
      }

      target = Math.min(Math.max(target + delta, 0), maxScroll());

      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(step);
    };

    const onScroll = (): void => {
      if (!animating) {
        target = element.scrollTop;
      }
    };

    element.addEventListener("wheel", onWheel, { passive: false });
    element.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      element.removeEventListener("wheel", onWheel);
      element.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [ref]);
}
