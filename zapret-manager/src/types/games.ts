export interface GameSettings {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  priority: boolean;
  builtin: boolean;
  domains: string[];
  ipRanges: string[];
  ports: number[];
  autoRestore: boolean;
  createBackup: boolean;
  createdAt: number;
}

export type GameIconName =
  | "Gamepad2"
  | "Crosshair"
  | "Sword"
  | "Target"
  | "Shield"
  | "Joystick"
  | "Rocket";
