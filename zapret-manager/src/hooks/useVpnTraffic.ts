// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/vpnConstants.
import { VPN_TRAFFIC_INTERVAL_MS } from "@/lib/vpnConstants";
// Импортируем зависимости из модуля @/types.
import type { XrayStatus } from "@/types";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { NetworkStatsSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvokeValidated } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface VpnTraffic {
  // Обрабатываем конструкцию: speedIn.
  speedIn: number;
  // Обрабатываем конструкцию: speedOut.
  speedOut: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Скорость трафика подключения.
 * Скорость трафика подключения.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Источник — счётчики сетевых адаптеров из монитора: при VPN…
 * Источник — счётчики сетевых адаптеров из монитора: при VPN через
 // Сохраняем пояснение разработчика: * системный прокси весь трафик приложений идёт через туннель…
 * системный прокси весь трафик приложений идёт через туннель, поэтому эти
 // Сохраняем пояснение разработчика: * цифры и есть скорость подключения. Отдельного счётчика у я…
 * цифры и есть скорость подключения. Отдельного счётчика у ядра Xray нет.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useVpnTraffic(enabled: boolean): VpnTraffic {
  // Обрабатываем конструкцию: const [traffic, setTraffic] = useState<VpnTraffic>({ sp….
  const [traffic, setTraffic] = useState<VpnTraffic>({
    // Обрабатываем конструкцию: speedIn.
    speedIn: 0,
    // Обрабатываем конструкцию: speedOut.
    speedOut: 0,
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !enabled.
    if (!enabled) {
      // Сохраняем пояснение разработчика: // сброс делаем через микрозадачу, а не прямо в теле эффекта…
      // сброс делаем через микрозадачу, а не прямо в теле эффекта:
      // Сохраняем пояснение разработчика: // синхронный setState в эффекте запускает лишний цикл ренде…
      // синхронный setState в эффекте запускает лишний цикл рендера
      // Обрабатываем конструкцию: queueMicrotask.
      queueMicrotask(() => {
        // Обрабатываем конструкцию: setTraffic.
        setTraffic({ speedIn: 0, speedOut: 0 });
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const read = async (): Promise<void> => { try { const s….
    const read = async (): Promise<void> => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const stats = await secureInvokeValidated( get_network_….
        const stats = await secureInvokeValidated(
          // Обрабатываем конструкцию: get_network_stats.
          "get_network_stats",
          // Обрабатываем конструкцию: NetworkStatsSchema.
          NetworkStatsSchema
          // Закрываем выражение или список аргументов.
        );
        // Обрабатываем конструкцию: setTraffic.
        setTraffic({ speedIn: stats.speedIn, speedOut: stats.speedOut });
        // Закрываем текущий блок.
      } catch {
        // Обрабатываем конструкцию: setTraffic.
        setTraffic({ speedIn: 0, speedOut: 0 });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void read().
    void read();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { void read(); }….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: void read().
      void read();
      // Закрываем текущий блок.
    }, VPN_TRAFFIC_INTERVAL_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [enabled]);
  // — разделитель логических блоков —

  // Возвращаем результат: traffic.
  return traffic;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Время работы подключения.
 * Время работы подключения.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Статус отдаёт uptime один раз при подключении, поэтому сек…
 * Статус отдаёт uptime один раз при подключении, поэтому секунды считаются
 // Сохраняем пояснение разработчика: * здесь: иначе в панели часами стояло бы «00:00:00».
 * здесь: иначе в панели часами стояло бы «00:00:00».
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useVpnUptime(status: XrayStatus | null): number | null {
  // Обрабатываем конструкцию: const running = status?.running === true.
  const running = status?.running === true;
  // Обрабатываем конструкцию: const base = status?.uptimeSec ?? 0.
  const base = status?.uptimeSec ?? 0;
  // Обрабатываем конструкцию: const [uptime, setUptime] = useState<number | null>(run….
  const [uptime, setUptime] = useState<number | null>(running ? base : null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !running.
    if (!running) {
      // Обрабатываем конструкцию: queueMicrotask.
      queueMicrotask(() => {
        // Обрабатываем конструкцию: setUptime.
        setUptime(null);
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: queueMicrotask.
    queueMicrotask(() => {
      // Обрабатываем конструкцию: setUptime.
      setUptime((current) => (current === null ? base : current));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { setUptime((cur….
    const timer = window.setInterval(() => {
      // Обрабатываем конструкцию: setUptime.
      setUptime((current) => (current ?? base) + 1);
      // Закрываем текущий блок.
    }, 1000);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [running, base]);
  // — разделитель логических блоков —

  // Возвращаем результат: uptime.
  return uptime;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
