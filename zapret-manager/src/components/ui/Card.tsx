import {
  forwardRef,
  useCallback,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import { GlassPanel } from "@/components/shared/GlassPanel";
import { useBloom } from "@/hooks/useBloom";
import { cn } from "@/lib/utils";

import type { CardVariant, PaddingSize } from "./types";

export interface CardProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onClick"
> {
  variant?: CardVariant;
  padding?: PaddingSize;
  onClick?: (() => void) | undefined;
  /**
   * Оживить карточку под курсором даже без обработчика клика.
   *
   * Раньше эффекты наведения были жёстко связаны с `onClick`, поэтому в списке
   * стратегий, где кликабельности нет, карточка выглядела совершенно «мёртвой».
   */
  hover?: boolean;
  children: ReactNode;
}

const VARIANT_TO_GLASS = {
  default: "default",
  interactive: "interactive",
  outlined: "outlined",
} as const satisfies Record<
  CardVariant,
  "default" | "interactive" | "outlined"
>;

function isActivationKey(event: KeyboardEvent<HTMLDivElement>): boolean {
  return event.key === "Enter" || event.key === " ";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = "default",
    padding = "md",
    onClick,
    hover = false,
    className,
    children,
    ...rest
  },
  ref
) {
  const interactive = variant === "interactive" && onClick !== undefined;
  const bloom = useBloom("primary", -1);
  const lively = interactive || hover;
  const glows = lively && bloom.boxShadow !== "";

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (!interactive || !onClick) {
        return;
      }
      if (isActivationKey(event)) {
        event.preventDefault();
        onClick();
      }
    },
    [interactive, onClick]
  );

  return (
    <GlassPanel
      ref={ref}
      variant={VARIANT_TO_GLASS[variant]}
      padding={padding}
      rounded="xl"
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      style={glows ? { boxShadow: bloom.boxShadow } : undefined}
      onMouseEnter={
        glows && bloom.boxShadowHover !== ""
          ? (event) => {
              event.currentTarget.style.boxShadow = bloom.boxShadowHover;
            }
          : undefined
      }
      onMouseLeave={
        glows
          ? (event) => {
              event.currentTarget.style.boxShadow = bloom.boxShadow;
            }
          : undefined
      }
      className={cn(
        interactive && "cursor-pointer",
        "rounded-xl transition-[box-shadow,translate,border-color] duration-200 ease-out",
        lively && "hover:border-accent-primary/40 hover:-translate-y-0.5",
        className
      )}
      {...rest}
    >
      {children}
    </GlassPanel>
  );
});
