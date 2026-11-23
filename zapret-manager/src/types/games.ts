// Обрабатываем конструкцию: export.
export interface GameSettings {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: icon.
  icon: string;
  // Обрабатываем конструкцию: enabled.
  enabled: boolean;
  // Обрабатываем конструкцию: builtin.
  builtin: boolean;
  // Обрабатываем конструкцию: domains.
  domains: string[];
  // Обрабатываем конструкцию: ipRanges.
  ipRanges: string[];
  // Обрабатываем конструкцию: ports.
  ports: number[];
  // Обрабатываем конструкцию: autoRestore.
  autoRestore: boolean;
  // Обрабатываем конструкцию: createBackup.
  createBackup: boolean;
  // Обрабатываем конструкцию: createdAt.
  createdAt: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type GameIconName =
  // Обрабатываем конструкцию: | Gamepad2 | Crosshair | Sword | Target | Shield | Joys….
  | "Gamepad2"
  // Продолжаем выражение.
  | "Crosshair"
  // Продолжаем выражение.
  | "Sword"
  // Продолжаем выражение.
  | "Target"
  // Продолжаем выражение.
  | "Shield"
  // Продолжаем выражение.
  | "Joystick"
  // Продолжаем выражение.
  | "Rocket";
// — разделитель логических блоков —
