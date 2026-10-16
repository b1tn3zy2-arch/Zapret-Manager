import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

import { VPN_TRAFFIC_INTERVAL_MS } from "@/lib/vpnConstants";
import type { NetworkStats, XrayStatus } from "@/types";

export interface VpnTraffic {
  speedIn: number;
  speedOut: number;
}

/**
 * Скорость трафика подключения.
 *
 * Источник — счётчики сетевых адаптеров из монитора: при VPN через
 * системный прокси весь трафик приложений идёт через туннель, поэтому эти
 * цифры и есть скорость подключения. Отдельного счётчика у ядра Xray нет.
 */
export function useVpnTraffic(enabled: boolean): VpnTraffic {
  const [traffic, setTraffic] = useState<VpnTraffic>({
    speedIn: 0,
    speedOut: 0,
  });

  useEffect(() => {
    if (!enabled) {
      // сброс делаем через микрозадачу, а не прямо в теле эффекта:
      // синхронный setState в эффекте запускает лишний цикл рендера
      queueMicrotask(() => {
        setTraffic({ speedIn: 0, speedOut: 0 });
      });

      return;
    }

    const read = async (): Promise<void> => {
      try {
        const stats = await invoke<NetworkStats>("get_network_stats");
        setTraffic({ speedIn: stats.speedIn, speedOut: stats.speedOut });
      } catch {
        setTraffic({ speedIn: 0, speedOut: 0 });
      }
    };

    void read();

    const timer = window.setInterval(() => {
      void read();
    }, VPN_TRAFFIC_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [enabled]);

  return traffic;
}

/**
 * Время работы подключения.
 *
 * Статус отдаёт uptime один раз при подключении, поэтому секунды считаются
 * здесь: иначе в панели часами стояло бы «00:00:00».
 */
export function useVpnUptime(status: XrayStatus | null): number | null {
  const running = status?.running === true;
  const base = status?.uptimeSec ?? 0;
  const [uptime, setUptime] = useState<number | null>(running ? base : null);

  useEffect(() => {
    if (!running) {
      queueMicrotask(() => {
        setUptime(null);
      });

      return;
    }

    queueMicrotask(() => {
      setUptime((current) => (current === null ? base : current));
    });

    const timer = window.setInterval(() => {
      setUptime((current) => (current ?? base) + 1);
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [running, base]);

  return uptime;
}
