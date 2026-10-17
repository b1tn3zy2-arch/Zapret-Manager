import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { coverHueFromName } from "@/lib/gameUtils";
import { cn } from "@/lib/utils";
import type { InstalledGame } from "@/types";

export interface GameCoverImageProps {
  game: InstalledGame;
  className?: string;
  alt: string;
}

interface CoverSource {
  src: string;
  kind: "cover" | "icon";
}

interface CoverFallbackProps {
  name: string;
  className?: string | undefined;
}

const BASE64_MARKER = "base64,";

/**
 * Сколько ждём один источник, прежде чем перейти к следующему.
 *
 * Без предела карточка могла часами оставаться пустой: поиск в Steam — это
 * сетевой запрос, который на плохом интернете или без сети висит минутами, и
 * заглушка так и не показывалась. Таймаут делает поведение предсказуемым —
 * лучше обложка из названия через пару секунд, чем пустой чёрный квадрат.
 */
const SOURCE_TIMEOUT_MS = 2500;

function decodePngSize(
  source: string
): { width: number; height: number } | null {
  const index = source.indexOf(BASE64_MARKER);

  if (index === -1 || !source.startsWith("data:image/png")) {
    return null;
  }

  try {
    const start = index + BASE64_MARKER.length;
    const head = atob(source.slice(start, start + 32));

    if (head.length < 24) {
      return null;
    }

    const width =
      (head.charCodeAt(16) << 24) |
      (head.charCodeAt(17) << 16) |
      (head.charCodeAt(18) << 8) |
      head.charCodeAt(19);
    const height =
      (head.charCodeAt(20) << 24) |
      (head.charCodeAt(21) << 16) |
      (head.charCodeAt(22) << 8) |
      head.charCodeAt(23);

    if (width <= 0 || height <= 0) {
      return null;
    }

    return { width, height };
  } catch {
    return null;
  }
}

export function GameCoverImage({ game, className, alt }: GameCoverImageProps) {
  const [sources, setSources] = useState<Record<string, CoverSource>>({});
  const source = sources[game.id] ?? null;

  useEffect(() => {
    let active = true;

    const store = (next: CoverSource): void => {
      setSources((previous) =>
        previous[game.id]?.src === next.src
          ? previous
          : { ...previous, [game.id]: next }
      );
    };

    const attempt = async (
      command: string,
      args: Record<string, unknown>
    ): Promise<string | null> => {
      const request = invoke<string | null>(command, args).catch(() => null);

      let timer: number | undefined;

      const timeout = new Promise<null>((resolve) => {
        timer = window.setTimeout(() => {
          resolve(null);
        }, SOURCE_TIMEOUT_MS);
      });

      try {
        return await Promise.race([request, timeout]);
      } finally {
        if (timer !== undefined) {
          window.clearTimeout(timer);
        }
      }
    };

    /**
     * Порядок источников выбран из соображений «скорость и надёжность»:
     * 1) обложка, уже известная приложению (точное совпадение);
     * 2) картинка из папки игры — работает офлайн и не врёт по названию;
     * 3) иконка exe — тоже офлайн;
     * 4) поиск в Steam по названию — единственный вариант, который ходит в
     *    сеть, поэтому идёт последним и не блокирует остальные.
     */
    void (async () => {
      const known = await attempt("game_cover", {
        appid: game.appid ?? null,
        cover: game.coverUrl ?? null,
      });

      if (!active) {
        return;
      }

      if (known !== null) {
        store({ src: known, kind: "cover" });

        return;
      }

      const fromFolder = await attempt("game_folder_cover", {
        dir: game.installPath,
      });

      if (!active) {
        return;
      }

      if (fromFolder !== null) {
        store({ src: fromFolder, kind: "cover" });

        return;
      }

      const icon = await attempt("game_exe_icon", {
        path: game.executablePath,
      });

      if (!active) {
        return;
      }

      if (icon !== null) {
        store({ src: icon, kind: "icon" });

        return;
      }

      const fromSteam = await attempt("game_steam_cover", {
        name: game.name,
      });

      if (!active) {
        return;
      }

      if (fromSteam !== null) {
        store({ src: fromSteam, kind: "cover" });
      }
    })();

    return () => {
      active = false;
    };
  }, [
    game.appid,
    game.coverUrl,
    game.executablePath,
    game.id,
    game.installPath,
    game.name,
  ]);

  if (source === null) {
    return <CoverFallback name={game.name} className={className} />;
  }

  if (source.kind === "icon") {
    const size = decodePngSize(source.src);
    // Пикселизация упиралась в 72 px и превращала нормальную иконку 48 px в
    // кашу из квадратов. Теперь огрубляем только по-настоящему мелкие (≤32 px),
    // а между ними доверяем сглаживанию браузера.
    const tiny = size !== null && Math.max(size.width, size.height) <= 32;

    return (
      <span
        className={cn("relative block size-full overflow-hidden", className)}
      >
        <img
          aria-hidden="true"
          alt=""
          src={source.src}
          className="absolute inset-0 size-full scale-150 object-cover opacity-70 blur-2xl"
        />
        <span className="from-bg-primary/30 via-bg-primary/35 to-bg-primary/70 absolute inset-0 bg-gradient-to-b" />
        <img
          alt={alt}
          src={source.src}
          loading="lazy"
          decoding="async"
          style={tiny ? { imageRendering: "pixelated" } : undefined}
          className={cn(
            "relative z-10 size-full object-contain drop-shadow-[0_10px_28px_rgba(0,0,0,0.6)]",
            tiny ? "p-[22%]" : "p-[8%]"
          )}
        />
      </span>
    );
  }

  return (
    <img
      alt={alt}
      src={source.src}
      loading="lazy"
      decoding="async"
      className={cn("size-full object-cover", className)}
    />
  );
}

/**
 * Заглушка на время поиска картинки.
 *
 * Раньше она появлялась только после того, как ответили все источники, и игры
 * без обложки несколько секунд — а без сети и минутами — висели чёрными
 * квадратами. Теперь обложка из названия рисуется сразу, а настоящая картинка
 * просто подменяет её, когда найдётся.
 */
function CoverFallback({ name, className }: CoverFallbackProps) {
  const hue = coverHueFromName(name);

  return (
    <span
      aria-hidden="true"
      className={cn("flex size-full items-center justify-center", className)}
      style={{
        background: `linear-gradient(150deg, hsl(${hue} 58% 32%) 0%, hsl(${(hue + 38) % 360} 52% 14%) 78%)`,
      }}
    >
      <span className="text-text-primary/80 text-2xl font-bold tracking-wide">
        {name.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}
