// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля lucide-react.
import { Info, X } from "lucide-react";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/strategies/game/CardStatsBars.
import CardStatsBars from "@/components/strategies/game/CardStatsBars";
// Импортируем зависимости из модуля @/components/strategies/game/PlayOverlay.
import PlayOverlay from "@/components/strategies/game/PlayOverlay";
// Импортируем зависимости из модуля @/components/strategies/game/StrategyPoster.
import StrategyPoster from "@/components/strategies/game/StrategyPoster";
// Импортируем зависимости из модуля @/components/strategies/EngineBadge.
import EngineBadge from "@/components/strategies/EngineBadge";
// Импортируем зависимости из модуля @/components/strategies/GameBadges.
import GameBadges from "@/components/strategies/GameBadges";
// Импортируем зависимости из модуля @/lib/format.
import { capitalizeService } from "@/lib/format";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { useStrategyRatingStore } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { StrategyCard } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyCardFrontProps {
  // Обрабатываем конструкцию: card.
  card: StrategyCard;
  // Обрабатываем конструкцию: flipped.
  flipped: boolean;
  // Обрабатываем конструкцию: isRunning.
  isRunning: boolean;
  // Обрабатываем конструкцию: isBusy.
  isBusy: boolean;
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled: boolean;
  // Обрабатываем конструкцию: onFlip.
  onFlip: () => void;
  // Обрабатываем конструкцию: onRun.
  onRun: () => void;
  // Обрабатываем конструкцию: onStop.
  onStop: () => void;
  // Обрабатываем конструкцию: onRemove.
  onRemove: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию ratingText.
function ratingText(sample: {
  // Обрабатываем конструкцию: ratingScore.
  ratingScore: number | null;
  // Обрабатываем конструкцию: samples.
  samples: number;
  // Закрываем текущий блок.
}): string {
  // Проверяем бизнес-условие: sample.samples === 0.
  if (sample.samples === 0) {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: sample.ratingScore === null ? : sample.ratingScore.toFi….
  return sample.ratingScore === null ? "" : sample.ratingScore.toFixed(1);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function StrategyCardFront({
  // Обрабатываем конструкцию: card.
  card,
  // Обрабатываем конструкцию: flipped.
  flipped,
  // Обрабатываем конструкцию: isRunning.
  isRunning,
  // Обрабатываем конструкцию: isBusy.
  isBusy,
  // Обрабатываем конструкцию: motionDisabled.
  motionDisabled,
  // Обрабатываем конструкцию: onFlip.
  onFlip,
  // Обрабатываем конструкцию: onRun.
  onRun,
  // Обрабатываем конструкцию: onStop.
  onStop,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Закрываем текущий блок.
}: StrategyCardFrontProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { strategy } = card.
  const { strategy } = card;
  // Обрабатываем конструкцию: const rating = useStrategyRatingStore( (state) => state….
  const rating = useStrategyRatingStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.records[strategy.id] ?? null
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className={cn( bg-bg-secondary/80 @container abs….
  return (
    // Обрабатываем конструкцию: <div className={cn( bg-bg-secondary/80 @container absol….
    <div
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: bg-bg-secondary/80 @container absolute inset-0 overflow….
        "bg-bg-secondary/80 @container absolute inset-0 overflow-hidden rounded-xl border",
        // Обрабатываем конструкцию: backface-hidden.
        "backface-hidden",
        // Сохраняем пояснение разработчика: // пока карточка перевёрнута, передняя грань невидима и не д…
        // пока карточка перевёрнута, передняя грань невидима и не должна принимать клики
        // Обрабатываем конструкцию: flipped.
        flipped && "pointer-events-none"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {/*
        // Продолжаем выражение.
        Постер размывается сам — filter: blur на собственном слое, а не
        // Продолжаем выражение.
        backdrop-фильтром: Chromium отбрасывает backdrop-filter внутри
        // Продолжаем выражение.
        3D-контекста переворота, поэтому «настоящий» blur на карточках
        // Продолжаем выражение.
        пропадал целиком. Self-фильтр применяется к отрисовке слоя до
        // Продолжаем выражение.
        композиции и в preserve-3d работает. В покое фильтра нет —
        // Продолжаем выражение.
        прокрутка списка не платит за дюжины blur-слоёв, а лёгкий
        // Продолжаем выражение.
        масштаб прячет потемнение краёв от блюра.
      // Сохраняем пояснение разработчика: * /}
      */}
      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: className.
        className={cn(
          // Сохраняем пояснение разработчика: // pointer-events-none: при hover фильтр+масштаб выводят сло…
          // pointer-events-none: при hover фильтр+масштаб выводят слой вперёд
          // Сохраняем пояснение разработчика: // в 3D-композиции Chromium, и без этого градиенты постера
          // в 3D-композиции Chromium, и без этого градиенты постера
          // Сохраняем пояснение разработчика: // перехватывают клики у кнопок наверху карточки.
          // перехватывают клики у кнопок наверху карточки.
          // Обрабатываем конструкцию: pointer-events-none absolute inset-0 transition-[filter….
          "pointer-events-none absolute inset-0 transition-[filter,transform] duration-300 ease-out",
          // Изменяем значение выражения !isRunning.
          !isRunning &&
            // Изменяем значение выражения !flipped.
            !flipped &&
            // Обрабатываем конструкцию: group-hover:scale-[1.03] group-hover:blur-[3px].
            "group-hover:scale-[1.03] group-hover:blur-[3px]"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <StrategyPoster services={strategy.services} />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="from-bg-primary via-bg-primary/55 pointer-events-none absolute inset-0 bg-gradient-to-t to-transparent" />
      {/* Выводим текстовое содержимое в JSX. */}
      {/*
        // Продолжаем выражение.
        Затемнение при наведении проявляется плавно; размывание постера
        // Продолжаем выражение.
        едёт с ним в одной анимации.
      // Сохраняем пояснение разработчика: * /}
      */}
      {/* Выводим текстовое содержимое в JSX. */}
      {!isRunning && !flipped ? (
        // Рендерим самозакрывающийся элемент span.
        <span
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: pointer-events-none absolute inset-0.
            "pointer-events-none absolute inset-0",
            // Обрабатываем конструкцию: bg-gradient-to-t from-black/40 via-black/10 to-transpar….
            "bg-gradient-to-t from-black/40 via-black/10 to-transparent",
            // Обрабатываем конструкцию: opacity-0 transition-opacity duration-300 ease-out grou….
            "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
      {/*
        // Продолжаем выражение.
        Бейдж «работает» — статичная рамка без пульсации. Индикатор
        // Продолжаем выражение.
        состояния живёт в Dashboard; здесь он только визуально
        // Продолжаем выражение.
        отмечает запущенную стратегию.
      // Сохраняем пояснение разработчика: * /}
      */}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: rounded-full border px-2.5 py-1 text-[10px] font-medium.
            "rounded-full border px-2.5 py-1 text-[10px] font-medium",
            // Обрабатываем конструкцию: isRunning.
            isRunning
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "border-accent-primary/40 bg-bg-primary/90 text-accent-primary"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "border-glass-border bg-bg-primary/90 text-text-secondary"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {isRunning
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("strategies.card.runningBadge")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              t("strategies.card.idleBadge")}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <span className="flex gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <button
            // Обрабатываем конструкцию: type.
            type="button"
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("strategies.card.detailsAria", {
              // Обрабатываем конструкцию: name.
              name: strategy.name,
              // Закрываем текущий блок.
            })}
            // Обрабатываем конструкцию: aria-expanded.
            aria-expanded={flipped}
            // Обрабатываем конструкцию: onClick.
            onClick={(event) => {
              // Обрабатываем конструкцию: event.
              event.stopPropagation();
              // Обрабатываем конструкцию: onFlip.
              onFlip();
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: className.
            className="bg-bg-primary/90 text-text-secondary hover:text-text-primary rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Info aria-hidden="true" className="size-3.5" />
            {/* Выводим текстовое содержимое в JSX. */}
          </button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <button
            // Обрабатываем конструкцию: type.
            type="button"
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("strategies.card.removeAria", {
              // Обрабатываем конструкцию: name.
              name: strategy.name,
              // Закрываем текущий блок.
            })}
            // Обрабатываем конструкцию: title.
            title={t("strategies.card.removeTitle")}
            // Обрабатываем конструкцию: onClick.
            onClick={(event) => {
              // Обрабатываем конструкцию: event.
              event.stopPropagation();
              // Обрабатываем конструкцию: onRemove.
              onRemove();
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: className.
            className="bg-bg-primary/90 text-text-secondary hover:text-accent-danger rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <X aria-hidden="true" className="size-3.5" />
            {/* Выводим текстовое содержимое в JSX. */}
          </button>
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="absolute inset-x-0 bottom-0 flex max-h-full min-w-0 flex-col gap-2 overflow-hidden p-3">
        {/* Выводим текстовое содержимое в JSX. */}
        {/*
          // Продолжаем выражение.
          Название ограничено двумя строками: на узкой карточке длинное имя
          // Продолжаем выражение.
          раньше доходило до верхнего края и налезало само на себя и на бейдж
          // Продолжаем выражение.
          редкости. Ниже шрифт уменьшается по ширине самой карточки, а не окна.
        // Сохраняем пояснение разработчика: * /}
        */}
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-primary line-clamp-2 text-lg leading-snug font-bold break-words @max-[240px]:text-base">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.name}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-tertiary w-full truncate font-mono text-[10px]">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.filename}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <span className="border-glass-border bg-bg-primary/85 flex items-center justify-between gap-2 rounded-lg border px-2 py-1.5">
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-secondary text-[11px] font-medium">
            {/* Выводим текстовое содержимое в JSX. */}
            {rating !== null && rating.samples > 0
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                rating.ratingScore === null
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  t("strategies.rating.pending", {
                    // Обрабатываем конструкцию: samples.
                    samples: rating.samples,
                    // Закрываем текущий блок.
                  })
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("strategies.rating.score", {
                    // Обрабатываем конструкцию: score.
                    score: ratingText(rating),
                    // Обрабатываем конструкцию: samples.
                    samples: rating.samples,
                    // Закрываем текущий блок.
                  })
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("strategies.rating.noData")}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {rating?.providerLabel ? (
            // Обрабатываем конструкцию: <span className=text-text-tertiary max-w-[9ch] truncate….
            <span className="text-text-tertiary max-w-[9ch] truncate text-[10px]">
              {/* Выводим текстовое содержимое в JSX. */}
              {rating.providerLabel}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: className.
          className="border-glass-border bg-bg-primary/85 block rounded-lg border p-2"
          // Обрабатываем конструкцию: title.
          title={t("strategies.rating.statsHint")}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <CardStatsBars stats={card.stats} />
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <span className="flex flex-wrap gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          {strategy.services.map((service) => (
            // Обрабатываем конструкцию: <span key={service} className=text-text-secondary borde….
            <span
              // Обрабатываем конструкцию: key.
              key={service}
              // Обрабатываем конструкцию: className.
              className="text-text-secondary border-glass-border bg-bg-primary/85 rounded-full border px-2 py-0.5 text-[10px]"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {capitalizeService(service)}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
          <GameBadges compact />
          {/* Выводим текстовое содержимое в JSX. */}
          <EngineBadge strategy={strategy} />
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <AnimatePresence>
        {/* Выводим текстовое содержимое в JSX. */}
        <PlayOverlay
          // Обрабатываем конструкцию: key.
          key="play-overlay"
          // Обрабатываем конструкцию: isRunning.
          isRunning={isRunning}
          // Обрабатываем конструкцию: isBusy.
          isBusy={isBusy}
          // Обрабатываем конструкцию: motionDisabled.
          motionDisabled={motionDisabled}
          // Обрабатываем конструкцию: onRun.
          onRun={onRun}
          // Обрабатываем конструкцию: onStop.
          onStop={onStop}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
