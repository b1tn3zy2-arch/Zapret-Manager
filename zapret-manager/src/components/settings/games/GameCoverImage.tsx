import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import type { InstalledGame } from "@/types";

export interface GameCoverImageProps {
  game: InstalledGame;
  className?: string;
  alt: string;
}

interface CoverFallbackProps {
  name: string;
  className?: string | undefined;
}

export function GameCoverImage({ game, className, alt }: GameCoverImageProps) {
  const [covers, setCovers] = useState<Record<string, string>>({});
  const source = covers[game.id] ?? null;

  useEffect(() => {
    let active = true;

    void invoke<string | null>("game_cover", {
      appid: game.appid ?? null,
      cover: game.coverUrl ?? null,
    })
      .then((value) => {
        if (active && value !== null) {
          setCovers((previous) =>
            previous[game.id] === value
              ? previous
              : { ...previous, [game.id]: value }
          );
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [game.appid, game.coverUrl, game.id]);

  if (source === null) {
    return <CoverFallback name={game.name} className={className} />;
  }

  return (
    <img
      alt={alt}
      src={source}
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
