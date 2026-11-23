// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Play, Square } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GamePlayOverlayProps {
  // Обрабатываем конструкцию: visible.
  visible: boolean;
  // Обрабатываем конструкцию: busy.
  busy: boolean;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: mode.
  mode?: "play" | "stop";
  // Обрабатываем конструкцию: onLaunch.
  onLaunch: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function GamePlayOverlay({
  // Обрабатываем конструкцию: visible.
  visible,
  // Обрабатываем конструкцию: busy.
  busy,
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: mode.
  mode = "play",
  // Обрабатываем конструкцию: onLaunch.
  onLaunch,
  // Закрываем текущий блок.
}: GamePlayOverlayProps) {
  // Обрабатываем конструкцию: const isStop = mode === stop.
  const isStop = mode === "stop";
  // Обрабатываем конструкцию: const Icon = isStop ? Square : Play.
  const Icon = isStop ? Square : Play;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> {/* Blur живёт отдельным слоем и включается мгнове….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      {/*
        // Продолжаем выражение.
        Blur живёт отдельным слоем и включается мгновенно, без ramp:
        // Продолжаем выражение.
        плавно проявляющийся blur читался как «догоняющий». Сам он
        // Продолжаем выражение.
        слабее прежнего (2px вместо 4px+виньетка). Слой вне плавного
        // Продолжаем выражение.
        wrapper'а — иначе родительская opacity тянула его проявление.
      // Сохраняем пояснение разработчика: * /}
      */}
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="pointer-events-none absolute inset-0 z-20 rounded-xl opacity-0 backdrop-blur-[2px] group-hover:opacity-100"
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden={!visible}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: pointer-events-none absolute inset-0 z-20 flex items-ce….
          "pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-xl",
          // Сохраняем пояснение разработчика: // Градиент затемнения и кнопка проявляются плавно, как у
          // Градиент затемнения и кнопка проявляются плавно, как у
          // Сохраняем пояснение разработчика: // карточек стратегий.
          // карточек стратегий.
          // Обрабатываем конструкцию: opacity-0 transition-opacity duration-300 ease-out grou….
          "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        {/* Выводим текстовое содержимое в JSX. */}
        {/*
          // Продолжаем выражение.
          Обёртка для CSS-«прыжка» кнопки: сам button управляется framer'ом
          // Продолжаем выражение.
          (whileHover/whileTap пишет inline transform и перекрыл бы классы),
          // Продолжаем выражение.
          а масштаб появления мягко цепляет эта span-обёртка.
        // Сохраняем пояснение разработчика: * /}
        */}
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="flex scale-[0.85] items-center justify-center transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-100">
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.button
            // Обрабатываем конструкцию: type.
            type="button"
            // Обрабатываем конструкцию: disabled.
            disabled={busy || !visible}
            // Обрабатываем конструкцию: tabIndex.
            tabIndex={visible ? 0 : -1}
            // Обрабатываем конструкцию: aria-label.
            aria-label={label}
            // Обрабатываем конструкцию: onClick.
            onClick={(event) => {
              // Обрабатываем конструкцию: event.
              event.stopPropagation();
              // Обрабатываем конструкцию: onLaunch.
              onLaunch();
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: {...(motionDisabled ? {} : { whileHover: { scale: 1.08 ….
            {...(motionDisabled
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                {}
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                { whileHover: { scale: 1.08 }, whileTap: { scale: 0.95 } })}
            // Обрабатываем конструкцию: transition.
            transition={
              // Обрабатываем конструкцию: motionDisabled.
              motionDisabled
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  { duration: 0 }
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  { type: "spring", stiffness: 340, damping: 24 }
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: pointer-events-auto relative flex size-[72px] items-cen….
              "pointer-events-auto relative flex size-[72px] items-center justify-center rounded-full",
              // Обрабатываем конструкцию: text-on-accent border-2 border-white/20 backdrop-blur-s….
              "text-on-accent border-2 border-white/20 backdrop-blur-sm",
              // Обрабатываем конструкцию: isStop.
              isStop
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  "bg-accent-danger/90 shadow-[0_0_40px_rgb(var(--color-accent-danger-rgb)/0.45)]"
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  "bg-accent-primary/85 shadow-[0_0_40px_rgb(var(--color-accent-primary-rgb)/0.45)]",
              // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-60.
              "disabled:cursor-not-allowed disabled:opacity-60"
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Icon
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className={isStop ? "size-7" : "size-8 translate-x-0.5"}
              // Обрабатываем конструкцию: strokeWidth.
              strokeWidth={2.5}
              // Обрабатываем конструкцию: fill.
              fill="currentColor"
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.button>
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
