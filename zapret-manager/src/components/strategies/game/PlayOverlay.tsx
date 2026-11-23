// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { Play, Square } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { ANIMATION } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface PlayOverlayProps {
  // Обрабатываем конструкцию: isRunning.
  isRunning: boolean;
  // Обрабатываем конструкцию: isBusy.
  isBusy: boolean;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: onRun.
  onRun: () => void;
  // Обрабатываем конструкцию: onStop.
  onStop: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Слой поверх карточки с главной кнопкой.
 * Слой поверх карточки с главной кнопкой.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Для работающей стратегии кнопка видна постоянно (это единс…
 * Для работающей стратегии кнопка видна постоянно (это единственный
 // Сохраняем пояснение разработчика: * способ её остановить), а для простой — появляется при наве…
 * способ её остановить), а для простой — появляется при наведении:
 // Сохраняем пояснение разработчика: * раньше на простой карточке вообще не было запуска, и она в…
 * раньше на простой карточке вообще не было запуска, и она выглядела
 // Сохраняем пояснение разработчика: * «мёртвой» мебелью.
 * «мёртвой» мебелью.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function PlayOverlay({
  // Обрабатываем конструкцию: isRunning.
  isRunning,
  // Обрабатываем конструкцию: isBusy.
  isBusy,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: onRun.
  onRun,
  // Обрабатываем конструкцию: onStop.
  onStop,
  // Закрываем текущий блок.
}: PlayOverlayProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const persistent = isRunning || isBusy.
  const persistent = isRunning || isBusy;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleClick = (event: React.MouseEvent): void => ….
  const handleClick = (event: React.MouseEvent): void => {
    // Обрабатываем конструкцию: event.
    event.stopPropagation();
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: isBusy.
    if (isBusy) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: isRunning.
    if (isRunning) {
      // Обрабатываем конструкцию: onStop.
      onStop();
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: onRun.
    onRun();
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const button = ( <motion.button type=button disabled={i….
  const button = (
    // Обрабатываем конструкцию: <motion.button type=button disabled={isBusy} aria-label….
    <motion.button
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: disabled.
      disabled={isBusy}
      // Обрабатываем конструкцию: aria-label.
      aria-label={
        // Обрабатываем конструкцию: isRunning.
        isRunning
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            t("strategies.overlay.stopAria")
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            t("strategies.overlay.runAria")
        // Закрываем текущий блок.
      }
      // Обрабатываем конструкцию: onClick.
      onClick={handleClick}
      // Обрабатываем конструкцию: whileHover.
      whileHover={motionDisabled ? { scale: 1 } : { scale: 1.08 }}
      // Обрабатываем конструкцию: whileTap.
      whileTap={motionDisabled ? { scale: 1 } : { scale: 0.94 }}
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
        // Обрабатываем конструкцию: pointer-events-auto flex size-16 items-center justify-c….
        "pointer-events-auto flex size-16 items-center justify-center rounded-full",
        // Обрабатываем конструкцию: text-on-accent shadow-lg transition-colors duration-200.
        "text-on-accent shadow-lg transition-colors duration-200",
        // Обрабатываем конструкцию: disabled:cursor-not-allowed disabled:opacity-60.
        "disabled:cursor-not-allowed disabled:opacity-60",
        // Обрабатываем конструкцию: isRunning.
        isRunning ? "bg-accent-danger" : "bg-accent-primary"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {isRunning ? (
        // Рендерим самозакрывающийся элемент Square.
        <Square
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="size-6"
          // Обрабатываем конструкцию: strokeWidth.
          strokeWidth={2.5}
          // Обрабатываем конструкцию: fill.
          fill="currentColor"
          // Продолжаем выражение.
        />
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Рендерим самозакрывающийся элемент Play.
        <Play
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="size-6 translate-x-0.5"
          // Обрабатываем конструкцию: strokeWidth.
          strokeWidth={2.5}
          // Обрабатываем конструкцию: fill.
          fill="currentColor"
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.button>
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Постоянно видимый слой (работает/переключается): затемнен…
  // Постоянно видимый слой (работает/переключается): затемнение + кнопка.
  // Сохраняем пояснение разработчика: // Ховер-слой простой карточки: только кнопка, без затемнени…
  // Ховер-слой простой карточки: только кнопка, без затемнения, всякой
  // Сохраняем пояснение разработчика: // видимости добивается группа карточки, а не framer — иначе…
  // видимости добивается группа карточки, а не framer — иначе inline-стили
  // Сохраняем пояснение разработчика: // framerа перебивали бы hover-прозрачность.
  // framer'а перебивали бы hover-прозрачность.
  // Проверяем бизнес-условие: persistent.
  if (persistent) {
    // Возвращаем результат: ( <motion.span initial={motionDisabled ? false : { opac….
    return (
      // Обрабатываем конструкцию: <motion.span initial={motionDisabled ? false : { opacit….
      <motion.span
        // Обрабатываем конструкцию: initial.
        initial={motionDisabled ? false : { opacity: 0 }}
        // Обрабатываем конструкцию: animate.
        animate={{ opacity: 1 }}
        // Обрабатываем конструкцию: exit.
        exit={{ opacity: 0 }}
        // Обрабатываем конструкцию: transition.
        transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: pointer-events-none absolute inset-0 z-10 flex items-ce….
          "pointer-events-none absolute inset-0 z-10 flex items-center justify-center",
          // Обрабатываем конструкцию: rounded-xl bg-gradient-to-t from-black/70 via-black/20 ….
          "rounded-xl bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {button}
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.span>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <span className=pointer-events-none absolute inset-0 ….
  return (
    // Обрабатываем конструкцию: <span className=pointer-events-none absolute inset-0 z-….
    <span className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center rounded-xl opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
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
      <span
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: flex items-center justify-center.
          "flex items-center justify-center",
          // Обрабатываем конструкцию: scale-[0.85] transition-transform duration-300 ease-[va….
          "scale-[0.85] transition-transform duration-300 ease-[var(--ease-out-expo)]",
          // Обрабатываем конструкцию: group-hover:scale-100.
          "group-hover:scale-100"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {button}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </span>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
