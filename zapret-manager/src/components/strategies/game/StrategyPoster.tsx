// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { Gamepad2, Globe, MessagesSquare, MonitorPlay } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/types.
import type { ServiceType } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const OUTLAST_APPID = 1304930.
const OUTLAST_APPID = "1304930";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SERVICE_GRADIENTS: Record<ServiceType, string> = ….
const SERVICE_GRADIENTS: Record<ServiceType, string> = {
  // Обрабатываем конструкцию: discord.
  discord:
    // Обрабатываем конструкцию: linear-gradient(150deg, rgb(88 101 242 / 0.55) 0%, rgb(….
    "linear-gradient(150deg, rgb(88 101 242 / 0.55) 0%, rgb(20 20 28 / 0.9) 65%)",
  // Обрабатываем конструкцию: youtube.
  youtube:
    // Обрабатываем конструкцию: linear-gradient(150deg, rgb(255 0 0 / 0.5) 0%, rgb(20 2….
    "linear-gradient(150deg, rgb(255 0 0 / 0.5) 0%, rgb(20 20 28 / 0.9) 65%)",
  // Обрабатываем конструкцию: outlast-trials.
  "outlast-trials":
    // Обрабатываем конструкцию: linear-gradient(150deg, rgb(255 59 92 / 0.45) 0%, rgb(2….
    "linear-gradient(150deg, rgb(255 59 92 / 0.45) 0%, rgb(20 20 28 / 0.9) 65%)",
  // Обрабатываем конструкцию: general.
  general:
    // Обрабатываем конструкцию: linear-gradient(150deg, rgb(0 255 136 / 0.22) 0%, rgb(2….
    "linear-gradient(150deg, rgb(0 255 136 / 0.22) 0%, rgb(20 20 28 / 0.9) 65%)",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SERVICE_ICONS = { discord: MessagesSquare, youtub….
const SERVICE_ICONS = {
  // Обрабатываем конструкцию: discord.
  discord: MessagesSquare,
  // Обрабатываем конструкцию: youtube.
  youtube: MonitorPlay,
  // Обрабатываем конструкцию: outlast-trials.
  "outlast-trials": Gamepad2,
  // Обрабатываем конструкцию: general.
  general: Globe,
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyPosterProps {
  // Обрабатываем конструкцию: services.
  services: readonly ServiceType[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function StrategyPoster({ services }: StrategyPosterProps) {
  // Обрабатываем конструкцию: const primary = services[0] ?? general.
  const primary = services[0] ?? "general";
  // Обрабатываем конструкцию: const [cover, setCover] = useState<string | null>(null).
  const [cover, setCover] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: primary !== outlast-trials.
    if (primary !== "outlast-trials") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: let active = true.
    let active = true;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void secureInvoke<string | null>(game_cover, { appid: O….
    void secureInvoke<string | null>("game_cover", {
      // Обрабатываем конструкцию: appid.
      appid: OUTLAST_APPID,
      // Обрабатываем конструкцию: cover.
      cover: null,
      // Закрываем текущий блок.
    })
      // Продолжаем цепочку вызовов.
      .then((value) => {
        // Проверяем бизнес-условие: active && value !== null.
        if (active && value !== null) {
          // Обрабатываем конструкцию: setCover.
          setCover(value);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch(() => undefined);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { active = false; }.
    return () => {
      // Обрабатываем конструкцию: active.
      active = false;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [primary]);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: cover !== null.
  if (cover !== null) {
    // Возвращаем результат: ( <img alt= aria-hidden=true src={cover} loading=lazy d….
    return (
      // Рендерим самозакрывающийся элемент img.
      <img
        // Обрабатываем конструкцию: alt.
        alt=""
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: src.
        src={cover}
        // Обрабатываем конструкцию: loading.
        loading="lazy"
        // Обрабатываем конструкцию: decoding.
        decoding="async"
        // Обрабатываем конструкцию: className.
        className="absolute inset-0 size-full object-cover"
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> <span aria-hidden=true className=absolute inset-0 ….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <span
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="absolute inset-0"
        // Обрабатываем конструкцию: style.
        style={{ background: SERVICE_GRADIENTS[primary] }}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <span aria-hidden="true" className="absolute inset-0">
        {/* Выводим текстовое содержимое в JSX. */}
        {services.map((service, index) => {
          // Обрабатываем конструкцию: const Icon = SERVICE_ICONS[service].
          const Icon = SERVICE_ICONS[service];
          // — разделитель логических блоков —

          // Возвращаем результат: ( <Icon key={service} className=text-text-primary/10 ab….
          return (
            // Рендерим самозакрывающийся элемент Icon.
            <Icon
              // Обрабатываем конструкцию: key.
              key={service}
              // Обрабатываем конструкцию: className.
              className="text-text-primary/10 absolute"
              // Обрабатываем конструкцию: strokeWidth.
              strokeWidth={1}
              // Обрабатываем конструкцию: style.
              style={{
                // Обрабатываем конструкцию: width.
                width: `${120 - index * 28}px`,
                // Обрабатываем конструкцию: height.
                height: `${120 - index * 28}px`,
                // Обрабатываем конструкцию: right.
                right: `${-18 + index * 34}px`,
                // Обрабатываем конструкцию: bottom.
                bottom: `${-14 + index * 30}px`,
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            />
            // Закрываем выражение или список аргументов.
          );
          // Закрываем текущий блок.
        })}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
