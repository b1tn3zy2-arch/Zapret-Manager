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

export function GameCoverImage({ game, className, alt }: GameCoverImageProps) {
  const [sources, setSources] = useState<Record<string, CoverSource>>({});
  const source = sources[game.id] ?? null;

  useEffect(() => {
    let active = true;

    void invoke<string | null>("game_cover", {
      appid: game.appid ?? null,
      cover: game.coverUrl ?? null,
    })
      .then(async (value) => {
        if (!active) {
          return;
        }

        if (value !== null) {
          setSources((previous) =>
            previous[game.id]?.src === value
              ? previous
              : { ...previous, [game.id]: { src: value, kind: "cover" } }
          );

          return;
        }

        const icon = await invoke<string | null>("game_exe_icon", {
          path: game.executablePath,
        }).catch(() => null);

        if (active && icon !== null) {
          setSources((previous) =>
            previous[game.id]?.src === icon
              ? previous
              : { ...previous, [game.id]: { src: icon, kind: "icon" } }
          );
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [game.appid, game.coverUrl, game.executablePath, game.id]);

  if (source === null) {
    return <CoverFallback name={game.name} className={className} />;
  }

  if (source.kind === "icon") {
    return (
      <span
        className={cn("relative block size-full overflow-hidden", className)}
      >
        <img
          aria-hidden="true"
          alt=""
          src={source.src}
          className="absolute inset-0 size-full scale-125 object-cover opacity-40 blur-2xl"
        />
        <span className="from-bg-secondary/70 via-bg-primary/40 to-bg-primary/85 absolute inset-0 bg-gradient-to-b" />
        <img
          alt={alt}
          src={source.src}
          loading="lazy"
          decoding="async"
          className="relative z-10 size-full object-contain p-[20%] drop-shadow-[0_10px_24px_rgba(0,0,0,0.55)]"
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
