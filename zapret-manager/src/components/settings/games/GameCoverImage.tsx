// Импортируем зависимости из модуля @tauri-apps/api/core.
import { convertFileSrc } from "@tauri-apps/api/core";
// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/components/settings/games/GameCoverPlaceholder.
import GameCoverPlaceholder from "@/components/settings/games/GameCoverPlaceholder";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameCoverImageProps {
  // Обрабатываем конструкцию: game.
  game: InstalledGame;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Обрабатываем конструкцию: alt.
  alt: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс CoverSource с контрактом данных.
interface CoverSource {
  // Обрабатываем конструкцию: src.
  src: string;
  // Обрабатываем конструкцию: kind.
  kind: "cover" | "icon";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс CoverFallbackProps с контрактом данных.
interface CoverFallbackProps {
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: className.
  className?: string | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const BASE64_MARKER = base64,.
const BASE64_MARKER = "base64,";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Сколько ждём один источник, прежде чем перейти к следующем…
 * Сколько ждём один источник, прежде чем перейти к следующему.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Без предела карточка могла часами оставаться пустой: поиск…
 * Без предела карточка могла часами оставаться пустой: поиск в Steam — это
 // Сохраняем пояснение разработчика: * сетевой запрос, который на плохом интернете или без сети в…
 * сетевой запрос, который на плохом интернете или без сети висит минутами, и
 // Сохраняем пояснение разработчика: * заглушка так и не показывалась. Таймаут делает поведение п…
 * заглушка так и не показывалась. Таймаут делает поведение предсказуемым —
 // Сохраняем пояснение разработчика: * лучше обложка из названия через пару секунд, чем пустой чё…
 * лучше обложка из названия через пару секунд, чем пустой чёрный квадрат.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: const SOURCE_TIMEOUT_MS = 2500.
const SOURCE_TIMEOUT_MS = 2500;
// — разделитель логических блоков —

// Объявляем функцию decodePngSize.
function decodePngSize(
  // Обрабатываем конструкцию: source.
  source: string
  // Закрываем выражение или список аргументов.
): { width: number; height: number } | null {
  // Обрабатываем конструкцию: const index = source.indexOf(BASE64_MARKER).
  const index = source.indexOf(BASE64_MARKER);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: index === -1 || !source.startsWith(data:image/png).
  if (index === -1 || !source.startsWith("data:image/png")) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const start = index + BASE64_MARKER.length.
    const start = index + BASE64_MARKER.length;
    // Обрабатываем конструкцию: const head = atob(source.slice(start, start + 32)).
    const head = atob(source.slice(start, start + 32));
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: head.length < 24.
    if (head.length < 24) {
      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const width = (head.charCodeAt(16) << 24) | (head.charC….
    const width =
      // Обрабатываем конструкцию: (head.charCodeAt(16) << 24).
      (head.charCodeAt(16) << 24) |
      // Обрабатываем конструкцию: (head.charCodeAt(17) << 16).
      (head.charCodeAt(17) << 16) |
      // Обрабатываем конструкцию: (head.charCodeAt(18) << 8).
      (head.charCodeAt(18) << 8) |
      // Обрабатываем конструкцию: head.
      head.charCodeAt(19);
    // Обрабатываем конструкцию: const height = (head.charCodeAt(20) << 24) | (head.char….
    const height =
      // Обрабатываем конструкцию: (head.charCodeAt(20) << 24).
      (head.charCodeAt(20) << 24) |
      // Обрабатываем конструкцию: (head.charCodeAt(21) << 16).
      (head.charCodeAt(21) << 16) |
      // Обрабатываем конструкцию: (head.charCodeAt(22) << 8).
      (head.charCodeAt(22) << 8) |
      // Обрабатываем конструкцию: head.
      head.charCodeAt(23);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: width <= 0 || height <= 0.
    if (width <= 0 || height <= 0) {
      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: { width, height }.
    return { width, height };
    // Закрываем текущий блок.
  } catch {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function GameCoverImage({ game, className, alt }: GameCoverImageProps) {
  // Обрабатываем конструкцию: const [sources, setSources] = useState<Record<string, C….
  const [sources, setSources] = useState<Record<string, CoverSource>>({});
  // Обрабатываем конструкцию: const [useFallback, setUseFallback] = useState(false).
  const [useFallback, setUseFallback] = useState(false);
  // Обрабатываем конструкцию: const source = sources[game.id] ?? null.
  const source = sources[game.id] ?? null;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let active = true.
    let active = true;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const store = (next: CoverSource): void => { setSources….
    const store = (next: CoverSource): void => {
      // Обрабатываем конструкцию: setSources.
      setSources(
        // Продолжаем предыдущую конструкцию.
        (previous) =>
          // Обрабатываем конструкцию: previous.
          previous[game.id]?.src === next.src
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              previous
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              { ...previous, [game.id]: next }
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const attempt = async ( command: string, args: Record<s….
    const attempt = async (
      // Обрабатываем конструкцию: command.
      command: string,
      // Обрабатываем конструкцию: args.
      args: Record<string, unknown>
      // Закрываем выражение или список аргументов.
    ): Promise<string | null> => {
      // Обрабатываем конструкцию: const request = secureInvoke<string | null>(command, ar….
      const request = secureInvoke<string | null>(command, args).catch(
        // Объявляем функцию-обработчик или стрелочную функцию.
        () => null
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: let timer: number | undefined.
      let timer: number | undefined;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const timeout = new Promise<null>((resolve) => { timer ….
      const timeout = new Promise<null>((resolve) => {
        // Обрабатываем конструкцию: timer.
        timer = window.setTimeout(() => {
          // Обрабатываем конструкцию: resolve.
          resolve(null);
          // Закрываем текущий блок.
        }, SOURCE_TIMEOUT_MS);
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Возвращаем результат: await Promise.race([request, timeout]).
        return await Promise.race([request, timeout]);
        // Закрываем текущий блок.
      } finally {
        // Проверяем бизнес-условие: timer !== undefined.
        if (timer !== undefined) {
          // Обрабатываем конструкцию: window.
          window.clearTimeout(timer);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика:
    /**
     // Сохраняем пояснение разработчика: * Ищет обложку по источникам.
     * Ищет обложку по источникам.
     // Сохраняем пояснение разработчика: *
     *
     // Сохраняем пояснение разработчика: * Порядок выбран из соображений «скорость и надёжность»:
     * Порядок выбран из соображений «скорость и надёжность»:
     // Сохраняем пояснение разработчика: * 1) обложка, уже скачанная при сканировании (лежит в кэше и
     * 1) обложка, уже скачанная при сканировании (лежит в кэше и
     // Сохраняем пояснение разработчика: * грузится файлом через asset-протокол);
     *    грузится файлом через asset-протокол);
     // Сохраняем пояснение разработчика: * 2) та же обложка, прочитанная Rust, — если файл не открылс…
     * 2) та же обложка, прочитанная Rust, — если файл не открылся;
     // Сохраняем пояснение разработчика: * 3) обложка, известная приложению (точное совпадение по app…
     * 3) обложка, известная приложению (точное совпадение по appid);
     // Сохраняем пояснение разработчика: * 4) картинка из папки игры — работает офлайн и не врёт по н…
     * 4) картинка из папки игры — работает офлайн и не врёт по названию;
     // Сохраняем пояснение разработчика: * 5) иконка exe — тоже офлайн;
     * 5) иконка exe — тоже офлайн;
     // Сохраняем пояснение разработчика: * 6) поиск в Steam по названию — единственный вариант, котор…
     * 6) поиск в Steam по названию — единственный вариант, который ходит в
     // Сохраняем пояснение разработчика: * сеть, поэтому идёт последним и не блокирует остальные.
     *    сеть, поэтому идёт последним и не блокирует остальные.
     // Сохраняем пояснение разработчика: 
     */
    // Обрабатываем конструкцию: const resolveCover = async (): Promise<CoverSource | nu….
    const resolveCover = async (): Promise<CoverSource | null> => {
      // Проверяем бизнес-условие: game.coverPath.
      if (game.coverPath) {
        // Проверяем бизнес-условие: useFallback.
        if (useFallback) {
          // Обрабатываем конструкцию: const cached = await attempt(game_cover_file, { path: g….
          const cached = await attempt("game_cover_file", {
            // Обрабатываем конструкцию: path.
            path: game.coverPath,
            // Закрываем текущий блок.
          });
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: cached !== null.
          if (cached !== null) {
            // Возвращаем результат: { src: cached, kind: cover }.
            return { src: cached, kind: "cover" };
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        } else {
          // Возвращаем результат: { src: convertFileSrc(game.coverPath), kind: cover }.
          return { src: convertFileSrc(game.coverPath), kind: "cover" };
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const known = await attempt(game_cover, { appid: game.a….
      const known = await attempt("game_cover", {
        // Обрабатываем конструкцию: appid.
        appid: game.appid ?? null,
        // Обрабатываем конструкцию: cover.
        cover: game.coverUrl ?? null,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: known !== null.
      if (known !== null) {
        // Возвращаем результат: { src: known, kind: cover }.
        return { src: known, kind: "cover" };
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const fromFolder = await attempt(game_folder_cover, { d….
      const fromFolder = await attempt("game_folder_cover", {
        // Обрабатываем конструкцию: dir.
        dir: game.installPath,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: fromFolder !== null.
      if (fromFolder !== null) {
        // Возвращаем результат: { src: fromFolder, kind: cover }.
        return { src: fromFolder, kind: "cover" };
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const icon = await attempt(game_exe_icon, { path: game.….
      const icon = await attempt("game_exe_icon", {
        // Обрабатываем конструкцию: path.
        path: game.executablePath,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: icon !== null.
      if (icon !== null) {
        // Возвращаем результат: { src: icon, kind: icon }.
        return { src: icon, kind: "icon" };
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const fromSteam = await attempt(game_steam_cover, { nam….
      const fromSteam = await attempt("game_steam_cover", {
        // Обрабатываем конструкцию: name.
        name: game.name,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: fromSteam !== null.
      if (fromSteam !== null) {
        // Возвращаем результат: { src: fromSteam, kind: cover }.
        return { src: fromSteam, kind: "cover" };
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void resolveCover().then((resolved) => { if (!active ||….
    void resolveCover().then((resolved) => {
      // Проверяем бизнес-условие: !active || resolved === null.
      if (!active || resolved === null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: store.
      store(resolved);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { active = false; }.
    return () => {
      // Обрабатываем конструкцию: active.
      active = false;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [
    // Обрабатываем конструкцию: game.
    game.appid,
    // Обрабатываем конструкцию: game.
    game.coverPath,
    // Обрабатываем конструкцию: game.
    game.coverUrl,
    // Обрабатываем конструкцию: game.
    game.executablePath,
    // Обрабатываем конструкцию: game.
    game.id,
    // Обрабатываем конструкцию: game.
    game.installPath,
    // Обрабатываем конструкцию: game.
    game.name,
    // Обрабатываем конструкцию: useFallback.
    useFallback,
    // Закрываем массив или список.
  ]);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: source === null.
  if (source === null) {
    // Возвращаем результат: <CoverFallback name={game.name} className={className} /….
    return <CoverFallback name={game.name} className={className} />;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: source.kind === icon.
  if (source.kind === "icon") {
    // Сохраняем пояснение разработчика: // Иконка exe — офлайн-источник последней надежды. Она мален…
    // Иконка exe — офлайн-источник последней надежды. Она маленькая, и
    // Сохраняем пояснение разработчика: // раньше её растягивали на всю карточку с размытым дублем ф…
    // раньше её растягивали на всю карточку с размытым дублем фоном:
    // Сохраняем пояснение разработчика: // получался нечитаемый клякса-квадрат. Теперь иконка держит…
    // получался нечитаемый клякса-квадрат. Теперь иконка держится в
    // Сохраняем пояснение разработчика: // разумном размере в центре аккуратной плитки, и мелкие (≤3…
    // разумном размере в центре аккуратной плитки, и мелкие (≤32 px)
    // Сохраняем пояснение разработчика: // не растягиваются сверх трёх размеров — иначе пиксели гибн…
    // не растягиваются сверх трёх размеров — иначе пиксели гибнут.
    // Обрабатываем конструкцию: const size = decodePngSize(source.src).
    const size = decodePngSize(source.src);
    // Обрабатываем конструкцию: const tiny = size !== null && Math.max(size.width, size….
    const tiny = size !== null && Math.max(size.width, size.height) <= 32;
    // — разделитель логических блоков —

    // Возвращаем результат: ( <span className={cn( from-glass-bg border-glass-borde….
    return (
      // Обрабатываем конструкцию: <span className={cn( from-glass-bg border-glass-border ….
      <span
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: from-glass-bg border-glass-border relative flex size-fu….
          "from-glass-bg border-glass-border relative flex size-full items-center justify-center overflow-hidden border bg-gradient-to-b to-transparent",
          // Обрабатываем конструкцию: className.
          className
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <img
          // Обрабатываем конструкцию: alt.
          alt={alt}
          // Обрабатываем конструкцию: src.
          src={source.src}
          // Обрабатываем конструкцию: loading.
          loading="lazy"
          // Обрабатываем конструкцию: decoding.
          decoding="async"
          // Обрабатываем конструкцию: className.
          className="drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]"
          // Обрабатываем конструкцию: style.
          style={{
            // Обрабатываем конструкцию: width.
            width: tiny ? "48px" : "38%",
            // Обрабатываем конструкцию: maxWidth.
            maxWidth: "min(38%, 220px)",
            // Обрабатываем конструкцию: height.
            height: "auto",
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <img alt={alt} src={source.src} loading=lazy decoding….
  return (
    // Рендерим самозакрывающийся элемент img.
    <img
      // Обрабатываем конструкцию: alt.
      alt={alt}
      // Обрабатываем конструкцию: src.
      src={source.src}
      // Обрабатываем конструкцию: loading.
      loading="lazy"
      // Обрабатываем конструкцию: decoding.
      decoding="async"
      // Обрабатываем конструкцию: onError.
      onError={() => {
        // Сохраняем пояснение разработчика: // Файл не открылся: пробуем запасной путь, а если и он
        // Файл не открылся: пробуем запасной путь, а если и он
        // Сохраняем пояснение разработчика: // недоступен — покажем заглушку.
        // недоступен — покажем заглушку.
        // Обрабатываем конструкцию: setUseFallback.
        setUseFallback(true);
        // Обрабатываем конструкцию: setSources.
        setSources((previous) => {
          // Обрабатываем конструкцию: const next = { ...previous }.
          const next = { ...previous };
          // — разделитель логических блоков —

          // Обрабатываем конструкцию: delete next[game.id].
          delete next[game.id];
          // — разделитель логических блоков —

          // Возвращаем результат: next.
          return next;
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: className.
      className={cn("size-full object-cover", className)}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Заглушка на время поиска картинки.
 * Заглушка на время поиска картинки.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше она появлялась только после того, как ответили все …
 * Раньше она появлялась только после того, как ответили все источники, и игры
 // Сохраняем пояснение разработчика: * без обложки несколько секунд — а без сети и минутами — вис…
 * без обложки несколько секунд — а без сети и минутами — висели чёрными
 // Сохраняем пояснение разработчика: * квадратами. Теперь заглушка рисуется сразу, а настоящая ка…
 * квадратами. Теперь заглушка рисуется сразу, а настоящая картинка просто
 // Сохраняем пояснение разработчика: * подменяет её, когда найдётся.
 * подменяет её, когда найдётся.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию CoverFallback.
function CoverFallback({ name, className }: CoverFallbackProps) {
  // Возвращаем результат: <GameCoverPlaceholder name={name} className={className}….
  return <GameCoverPlaceholder name={name} className={className} />;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
