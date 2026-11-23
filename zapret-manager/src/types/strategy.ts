// Импортируем зависимости из модуля ./strategy-config.
import type { StrategyConfig } from "./strategy-config";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Списки значений хранятся константами-массивами, а не тольк…
 * Списки значений хранятся константами-массивами, а не только типами:
 // Сохраняем пояснение разработчика: * по ним строятся zod-схемы проверки ответа IPC. Списки долж…
 * по ним строятся zod-схемы проверки ответа IPC. Списки должны
 // Сохраняем пояснение разработчика: * совпадать с SERVICE_KEYWORDS и TECHNIQUE_KEYWORDS в Rust.
 * совпадать с `SERVICE_KEYWORDS` и `TECHNIQUE_KEYWORDS` в Rust.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export const SERVICE_TYPES = [
  // Обрабатываем конструкцию: discord.
  "discord",
  // Обрабатываем конструкцию: youtube.
  "youtube",
  // Обрабатываем конструкцию: outlast-trials.
  "outlast-trials",
  // Обрабатываем конструкцию: general.
  "general",
  // Закрываем массив или список.
] as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type ServiceType = (typeof SERVICE_TYPES)[number];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const STRATEGY_STATUSES = [
  // Обрабатываем конструкцию: idle.
  "idle",
  // Обрабатываем конструкцию: running.
  "running",
  // Обрабатываем конструкцию: error.
  "error",
  // Обрабатываем конструкцию: stopped.
  "stopped",
  // Обрабатываем конструкцию: starting.
  "starting",
  // Обрабатываем конструкцию: stopping.
  "stopping",
  // Закрываем массив или список.
] as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type StrategyStatus = (typeof STRATEGY_STATUSES)[number];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const STRATEGY_FILE_TYPES = [
  // Обрабатываем конструкцию: winws.
  "winws",
  // Обрабатываем конструкцию: goodbye-dpi.
  "goodbye-dpi",
  // Обрабатываем конструкцию: zapret.
  "zapret",
  // Обрабатываем конструкцию: unknown.
  "unknown",
  // Закрываем массив или список.
] as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type StrategyFileType = (typeof STRATEGY_FILE_TYPES)[number];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const TECHNIQUE_IDS = [
  // Обрабатываем конструкцию: faketls.
  "faketls",
  // Обрабатываем конструкцию: multisplit.
  "multisplit",
  // Обрабатываем конструкцию: split-seqovl.
  "split-seqovl",
  // Обрабатываем конструкцию: quic-fake.
  "quic-fake",
  // Обрабатываем конструкцию: l7-filter.
  "l7-filter",
  // Обрабатываем конструкцию: ipset.
  "ipset",
  // Обрабатываем конструкцию: any-protocol.
  "any-protocol",
  // Обрабатываем конструкцию: cutoff.
  "cutoff",
  // Обрабатываем конструкцию: fakedsplit.
  "fakedsplit",
  // Обрабатываем конструкцию: hostfakesplit.
  "hostfakesplit",
  // Обрабатываем конструкцию: multidisorder.
  "multidisorder",
  // Обрабатываем конструкцию: syndata.
  "syndata",
  // Обрабатываем конструкцию: fake.
  "fake",
  // Закрываем массив или список.
] as const;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type TechniqueId = (typeof TECHNIQUE_IDS)[number];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface Strategy {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: filename.
  filename: string;
  // Обрабатываем конструкцию: path.
  path: string;
  // Обрабатываем конструкцию: description.
  description: string;
  // Обрабатываем конструкцию: services.
  services: ServiceType[];
  // Обрабатываем конструкцию: techniques.
  techniques: TechniqueId[];
  // Обрабатываем конструкцию: fileType.
  fileType: StrategyFileType;
  // Обрабатываем конструкцию: status.
  status: StrategyStatus;
  // Обрабатываем конструкцию: lastRun.
  lastRun?: number | undefined;
  // Обрабатываем конструкцию: pid.
  pid?: number | undefined;
  // Обрабатываем конструкцию: error.
  error?: string | undefined;
  // Обрабатываем конструкцию: version.
  version?: string | null;
  // Обрабатываем конструкцию: size.
  size: number;
  // Обрабатываем конструкцию: modifiedAt.
  modifiedAt?: number | null;
  // Обрабатываем конструкцию: config.
  config?: StrategyConfig | null | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type StrategyInput = Omit<
  // Обрабатываем конструкцию: Strategy.
  Strategy,
  // Обрабатываем конструкцию: id.
  "id" | "status" | "pid" | "error" | "lastRun"
  // Продолжаем выражение.
>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyFilter {
  // Обрабатываем конструкцию: services.
  services?: ServiceType[];
  // Обрабатываем конструкцию: status.
  status?: StrategyStatus[];
  // Обрабатываем конструкцию: search.
  search?: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
