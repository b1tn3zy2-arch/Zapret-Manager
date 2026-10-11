import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { Gamepad2, Globe, MessagesSquare, MonitorPlay } from "lucide-react";

import type { ServiceType } from "@/types";

const OUTLAST_APPID = "1304930";

const SERVICE_GRADIENTS: Record<ServiceType, string> = {
  discord:
    "linear-gradient(150deg, rgb(88 101 242 / 0.55) 0%, rgb(20 20 28 / 0.9) 65%)",
  youtube:
    "linear-gradient(150deg, rgb(255 0 0 / 0.5) 0%, rgb(20 20 28 / 0.9) 65%)",
  "outlast-trials":
    "linear-gradient(150deg, rgb(255 59 92 / 0.45) 0%, rgb(20 20 28 / 0.9) 65%)",
  general:
    "linear-gradient(150deg, rgb(0 255 136 / 0.22) 0%, rgb(20 20 28 / 0.9) 65%)",
};

const SERVICE_ICONS = {
  discord: MessagesSquare,
  youtube: MonitorPlay,
  "outlast-trials": Gamepad2,
  general: Globe,
} as const;

export interface StrategyPosterProps {
  services: readonly ServiceType[];
}

export default function StrategyPoster({ services }: StrategyPosterProps) {
  const primary = services[0] ?? "general";
  const [cover, setCover] = useState<string | null>(null);

  useEffect(() => {
    if (primary !== "outlast-trials") {
      return;
    }

    let active = true;

    void invoke<string | null>("game_cover", {
      appid: OUTLAST_APPID,
      cover: null,
    })
      .then((value) => {
        if (active && value !== null) {
          setCover(value);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [primary]);

  if (cover !== null) {
    return (
      <img
        alt=""
        aria-hidden="true"
        src={cover}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
    );
  }

  return (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: SERVICE_GRADIENTS[primary] }}
      />
      <span aria-hidden="true" className="absolute inset-0">
        {services.map((service, index) => {
          const Icon = SERVICE_ICONS[service];

          return (
            <Icon
              key={service}
              className="text-text-primary/10 absolute"
              strokeWidth={1}
              style={{
                width: `${120 - index * 28}px`,
                height: `${120 - index * 28}px`,
                right: `${-18 + index * 34}px`,
                bottom: `${-14 + index * 30}px`,
              }}
            />
          );
        })}
      </span>
    </>
  );
}
