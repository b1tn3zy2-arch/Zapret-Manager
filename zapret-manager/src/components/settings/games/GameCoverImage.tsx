import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

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

    void invoke<string | null>("game_cover", {
      appid: game.appid ?? null,
      cover: game.coverUrl ?? null,
    })
      .then(async (value) => {
        if (!active) {
          return;
        }

        if (value !== null) {
          store({ src: value, kind: "cover" });

          return;
        }

        const steamCover = await invoke<string | null>("game_steam_cover", {
          name: game.name,
        }).catch(() => null);

        if (!active) {
          return;
        }

        if (steamCover !== null) {
          store({ src: steamCover, kind: "cover" });

          return;
        }

        const icon = await invoke<string | null>("game_exe_icon", {
          path: game.executablePath,
        }).catch(() => null);

        if (active && icon !== null) {
          store({ src: icon, kind: "icon" });
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [game.appid, game.coverUrl, game.executablePath, game.id, game.name]);

  if (source === null) {
    return <CoverFallback name={game.name} className={className} />;
  }

  if (source.kind === "icon") {
    const size = decodePngSize(source.src);
    const small = size !== null && Math.max(size.width, size.height) <= 72;

    return (
      <span
        className={cn("relative block size-full overflow-hidden", className)}
      >
        <span className="from-bg-secondary via-bg-secondary/60 to-bg-primary absolute inset-0 bg-gradient-to-b" />
        <img
          alt={alt}
          src={source.src}
          loading="lazy"
          decoding="async"
          style={
            small && size !== null
              ? {
                  width: size.width * 2,
                  height: size.height * 2,
                  imageRendering: "pixelated",
                }
              : undefined
          }
          className={cn(
            "absolute inset-0 m-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.55)]",
            small
              ? "max-h-[42%] max-w-[42%] object-contain"
              : "size-full object-contain p-[16%]"
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

function CoverFallback({ name, className }: CoverFallbackProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "from-accent-primary/25 via-accent-secondary/20 to-bg-secondary flex size-full items-end",
        "bg-gradient-to-br p-3",
        className
      )}
    >
      <span className="text-text-secondary text-sm font-semibold">
        {name.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}
