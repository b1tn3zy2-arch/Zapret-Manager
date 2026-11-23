// Обрабатываем конструкцию: export.
export type InitStage =
  // Обрабатываем конструкцию: | copying-zapret | copying-strategies | copying-vpn | f….
  | "copying-zapret"
  // Продолжаем выражение.
  | "copying-strategies"
  // Продолжаем выражение.
  | "copying-vpn"
  // Продолжаем выражение.
  | "finalizing"
  // Продолжаем выражение.
  | "idle";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InitReport {
  // Обрабатываем конструкцию: firstRun.
  firstRun: boolean;
  // Обрабатываем конструкцию: updated.
  updated: boolean;
  // Обрабатываем конструкцию: strategiesCount.
  strategiesCount: number;
  // Обрабатываем конструкцию: resourcesVersion.
  resourcesVersion: string;
  // Обрабатываем конструкцию: extractedBytes.
  extractedBytes: number;
  // Обрабатываем конструкцию: available.
  available: boolean;
  // Обрабатываем конструкцию: vpnCoreIncluded.
  vpnCoreIncluded: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InitProgress {
  // Обрабатываем конструкцию: stage.
  stage: InitStage;
  // Обрабатываем конструкцию: percent.
  percent: number;
  // Обрабатываем конструкцию: currentFile.
  currentFile: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface IntegrityReport {
  // Обрабатываем конструкцию: total.
  total: number;
  // Обрабатываем конструкцию: missing.
  missing: string[];
  // Обрабатываем конструкцию: modified.
  modified: string[];
  // Обрабатываем конструкцию: ok.
  ok: boolean;
  // Обрабатываем конструкцию: resourcesVersion.
  resourcesVersion: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface RestoreReport {
  // Обрабатываем конструкцию: restored.
  restored: number;
  // Обрабатываем конструкцию: skipped.
  skipped: number;
  // Обрабатываем конструкцию: resourcesVersion.
  resourcesVersion: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
