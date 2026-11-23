// Импортируем зависимости из модуля react.
import {
  // Подключаем именованный импорт forwardRef.
  forwardRef,
  // Подключаем именованный импорт useCallback.
  useCallback,
  // Подключаем именованный импорт type HTMLAttributes.
  type HTMLAttributes,
  // Подключаем именованный импорт type KeyboardEvent.
  type KeyboardEvent,
  // Подключаем именованный импорт type ReactNode.
  type ReactNode,
  // Закрываем текущий блок.
} from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/shared/GlassPanel.
import { GlassPanel } from "@/components/shared/GlassPanel";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { CardVariant, PaddingSize } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface CardProps extends Omit<
  // Обрабатываем конструкцию: HTMLAttributes.
  HTMLAttributes<HTMLDivElement>,
  // Обрабатываем конструкцию: onClick.
  "onClick"
  // Продолжаем выражение.
> {
  // Обрабатываем конструкцию: variant.
  variant?: CardVariant;
  // Обрабатываем конструкцию: padding.
  padding?: PaddingSize;
  // Обрабатываем конструкцию: onClick.
  onClick?: (() => void) | undefined;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Оживить карточку под курсором даже без обработчика клика.
   * Оживить карточку под курсором даже без обработчика клика.
   // Сохраняем пояснение разработчика: *
   *
   // Сохраняем пояснение разработчика: * Раньше эффекты наведения были жёстко связаны с onClick, по…
   * Раньше эффекты наведения были жёстко связаны с `onClick`, поэтому в списке
   // Сохраняем пояснение разработчика: * стратегий, где кликабельности нет, карточка выглядела сове…
   * стратегий, где кликабельности нет, карточка выглядела совершенно «мёртвой».
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: hover.
  hover?: boolean;
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const VARIANT_TO_GLASS = { default: default, interactiv….
const VARIANT_TO_GLASS = {
  // Обрабатываем конструкцию: default.
  default: "default",
  // Обрабатываем конструкцию: interactive.
  interactive: "interactive",
  // Обрабатываем конструкцию: outlined.
  outlined: "outlined",
  // Закрываем текущий блок.
} as const satisfies Record<
  // Обрабатываем конструкцию: CardVariant.
  CardVariant,
  // Обрабатываем конструкцию: default.
  "default" | "interactive" | "outlined"
  // Продолжаем выражение.
>;
// — разделитель логических блоков —

// Объявляем функцию isActivationKey.
function isActivationKey(event: KeyboardEvent<HTMLDivElement>): boolean {
  // Возвращаем результат: event.key === Enter || event.key ===.
  return event.key === "Enter" || event.key === " ";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  // Объявляем параметр { variant = default, padding = md, onCli… функции.
  {
    // Обрабатываем конструкцию: variant.
    variant = "default",
    // Обрабатываем конструкцию: padding.
    padding = "md",
    // Обрабатываем конструкцию: onClick.
    onClick,
    // Обрабатываем конструкцию: hover.
    hover = false,
    // Обрабатываем конструкцию: className.
    className,
    // Обрабатываем конструкцию: children.
    children,
    // Обрабатываем конструкцию: ....
    ...rest
    // Закрываем текущий блок.
  },
  // Объявляем параметр ref функции.
  ref
  // Закрываем выражение или список аргументов.
) {
  // Обрабатываем конструкцию: const interactive = variant === interactive && onClick ….
  const interactive = variant === "interactive" && onClick !== undefined;
  // Обрабатываем конструкцию: const lively = interactive || hover.
  const lively = interactive || hover;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleKeyDown = useCallback( (event: KeyboardEven….
  const handleKeyDown = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Проверяем бизнес-условие: !interactive || !onClick.
      if (!interactive || !onClick) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // Проверяем бизнес-условие: isActivationKey(event).
      if (isActivationKey(event)) {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Обрабатываем конструкцию: onClick.
        onClick();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [interactive, onClick]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <GlassPanel ref={ref} variant={VARIANT_TO_GLASS[varia….
  return (
    // Обрабатываем конструкцию: <GlassPanel ref={ref} variant={VARIANT_TO_GLASS[variant….
    <GlassPanel
      // Обрабатываем конструкцию: ref.
      ref={ref}
      // Обрабатываем конструкцию: variant.
      variant={VARIANT_TO_GLASS[variant]}
      // Обрабатываем конструкцию: padding.
      padding={padding}
      // Обрабатываем конструкцию: rounded.
      rounded="xl"
      // Обрабатываем конструкцию: role.
      role={interactive ? "button" : undefined}
      // Обрабатываем конструкцию: tabIndex.
      tabIndex={interactive ? 0 : undefined}
      // Обрабатываем конструкцию: onClick.
      onClick={interactive ? onClick : undefined}
      // Обрабатываем конструкцию: onKeyDown.
      onKeyDown={interactive ? handleKeyDown : undefined}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: interactive.
        interactive && "cursor-pointer",
        // Обрабатываем конструкцию: rounded-xl transition-[box-shadow,translate,border-colo….
        "rounded-xl transition-[box-shadow,translate,border-color] duration-200 ease-out",
        // Обрабатываем конструкцию: lively.
        lively && "hover:border-accent-primary/40 hover:-translate-y-0.5",
        // Обрабатываем конструкцию: className.
        className
        // Закрываем выражение или список аргументов.
      )}
      // Обрабатываем конструкцию: {...rest}.
      {...rest}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {children}
      {/* Выводим текстовое содержимое в JSX. */}
    </GlassPanel>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
