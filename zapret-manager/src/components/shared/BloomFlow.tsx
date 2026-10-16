import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Переливающееся свечение поверх элемента.
 *
 * Слой намеренно отдельный, а не частью `box-shadow`: тень нельзя «повести»
 * по элементу, а градиент с зарегистрированными свойствами анимируется
 * браузером плавно и не заставляет перерисовывать содержимое.
 *
 * Никаких `filter` и `backdrop-filter` внутри слоя: в 3D-контексте карточки
 * они схлопывают объём, и переворот перестаёт быть объёмным.
 */
export interface BloomFlowProps {
  /** Цвет свечения; по умолчанию акцентный цвет темы. */
  color?: string;
  /** Кольцо по краю — заметно сильнее читается на крупных карточках. */
  edge?: boolean;
  className?: string;
}

export default function BloomFlow({
  color,
  edge = false,
  className,
}: BloomFlowProps) {
  // CSS-переменные не входят в тип React, поэтому приводим явно
  const style =
    color === undefined
      ? undefined
      : ({ "--bloom-color": color } as CSSProperties);

  return (
    <>
      <span
        aria-hidden="true"
        className={cn("bloom-flow", className)}
        style={style}
      />
      {edge ? (
        <span aria-hidden="true" className="bloom-flow-edge" style={style} />
      ) : null}
    </>
  );
}
