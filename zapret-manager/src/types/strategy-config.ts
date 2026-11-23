// Обрабатываем конструкцию: export.
export interface StrategyFilterGroup {
  // Обрабатываем конструкцию: args.
  args: string[];
  // Обрабатываем конструкцию: usesGeneralHostlist.
  usesGeneralHostlist: boolean;
  // Обрабатываем конструкцию: usesAllIpset.
  usesAllIpset: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyConfig {
  // Обрабатываем конструкцию: sourceFilename.
  sourceFilename: string;
  // Обрабатываем конструкцию: winwsPath.
  winwsPath: string;
  // Обрабатываем конструкцию: wfTcp.
  wfTcp: string | null;
  // Обрабатываем конструкцию: wfUdp.
  wfUdp: string | null;
  // Обрабатываем конструкцию: groups.
  groups: StrategyFilterGroup[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
