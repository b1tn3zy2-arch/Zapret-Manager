import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import {
  BattlEyeIcon,
  type BrandGlyphProps,
} from "@/assets/icons/BattlEyeIcon";
import { DiscordIcon } from "@/assets/icons/DiscordIcon";
import { GithubIcon } from "@/assets/icons/GithubIcon";
import { SteamIcon } from "@/assets/icons/SteamIcon";
import { YouTubeIcon } from "@/assets/icons/YouTubeIcon";

export type BrandIconName =
  "discord" | "youtube" | "steam" | "github" | "battlEye";

const REGISTRY = {
  discord: DiscordIcon,
  youtube: YouTubeIcon,
  steam: SteamIcon,
  github: GithubIcon,
  battlEye: BattlEyeIcon,
} as const satisfies Record<BrandIconName, ComponentType<BrandGlyphProps>>;

export interface BrandIconProps {
  name: BrandIconName;
  className?: string;
}

export default function BrandIcon({ name, className }: BrandIconProps) {
  const Glyph = REGISTRY[name];

  return <Glyph className={cn("size-5 shrink-0 fill-current", className)} />;
}
