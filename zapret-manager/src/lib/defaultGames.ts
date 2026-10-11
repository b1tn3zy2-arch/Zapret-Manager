import type { GameSettings } from "@/types";

const STEAM_DOMAINS = [
  "steampowered.com",
  "steamcontent.com",
  "steamcommunity.com",
  "steamstatic.com",
  "steamusercontent.com",
  "cloudfront.net",
];

const ANTI_CHEAT_DOMAINS = [
  "easyanticheat.net",
  "battleye.com",
  "battleye.net",
];

function game(
  seed: Omit<GameSettings, "createdAt"> & { createdAt?: number }
): GameSettings {
  return { createdAt: seed.createdAt ?? 0, ...seed };
}

export const BUILTIN_GAMES: readonly GameSettings[] = [
  game({
    id: "outlast-trials",
    name: "Outlast Trials",
    icon: "Gamepad2",
    enabled: false,
    builtin: true,
    domains: [
      ...STEAM_DOMAINS,
      ...ANTI_CHEAT_DOMAINS,
      "gamelift.amazonaws.com",
      "epicgames.com",
      "epicgames.dev",
      "redbarrelsgames.com",
      "outlasttrials.com",
      "rbg-services.com",
      "cloudfront.net",
    ],
    ipRanges: [],
    ports: [
      27015, 27016, 27017, 27018, 27019, 27020, 27031, 27036, 3478, 4379, 4380,
    ],
    autoRestore: true,
    createBackup: true,
  }),
  game({
    id: "escape-from-tarkov",
    name: "Escape from Tarkov",
    icon: "Target",
    enabled: false,
    builtin: true,
    domains: [...STEAM_DOMAINS, ...ANTI_CHEAT_DOMAINS, "escapefromtarkov.com"],
    ipRanges: [],
    ports: [27015, 27017, 27018, 27036, 29900],
    autoRestore: true,
    createBackup: true,
  }),
  game({
    id: "counter-strike-2",
    name: "Counter-Strike 2",
    icon: "Crosshair",
    enabled: false,
    builtin: true,
    domains: [...STEAM_DOMAINS, ...ANTI_CHEAT_DOMAINS, "counter-strike.net"],
    ipRanges: [],
    ports: [27015, 27017, 27018, 27020, 27036],
    autoRestore: true,
    createBackup: true,
  }),
  game({
    id: "dota-2",
    name: "Dota 2",
    icon: "Sword",
    enabled: false,
    builtin: true,
    domains: [...STEAM_DOMAINS, "valvesoftware.com", "perfectworld.com"],
    ipRanges: [],
    ports: [27015, 27017, 27018, 27036],
    autoRestore: true,
    createBackup: true,
  }),
  game({
    id: "valorant",
    name: "Valorant",
    icon: "Joystick",
    enabled: false,
    builtin: true,
    domains: ["riotgames.com", "pvp.net", "valorant.riotgames.com"],
    ipRanges: [],
    ports: [7000, 8080, 8393, 2099, 27015, 27031],
    autoRestore: true,
    createBackup: true,
  }),
  game({
    id: "gta-online",
    name: "GTA Online",
    icon: "Rocket",
    enabled: false,
    builtin: true,
    domains: [
      ...STEAM_DOMAINS,
      ...ANTI_CHEAT_DOMAINS,
      "rockstargames.com",
      "socialclub.rockstargames.com",
    ],
    ipRanges: [],
    ports: [22000, 27015, 27018, 27036],
    autoRestore: true,
    createBackup: true,
  }),
];

export function getDefaultGames(): GameSettings[] {
  return BUILTIN_GAMES.map((item) => ({
    ...item,
    domains: [...item.domains],
    ipRanges: [...item.ipRanges],
    ports: [...item.ports],
  }));
}
