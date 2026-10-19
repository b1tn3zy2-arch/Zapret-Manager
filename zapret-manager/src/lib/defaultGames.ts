import {
  MAX_GAME_PORTS,
  MAX_GAMES,
  MAX_INJECTED_ENTRIES,
} from "@/lib/settingsLimits";
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

const GAME_LIFT_PORTS: readonly number[] = Array.from(
  { length: 54 },
  (_, index) => 7777 + index
);

/**
 * Домены, которые убираются из профиля при слиянии.
 *
 * Обычно слияние только дополняет список, но здесь домен приходится
 * вычищать: `rbg-services.com` без обхода отвечает за 0.4 с, а под десинком
 * TLS-хендшейк к нему обрывается — игра получала «не удаётся обратиться в
 * службу поддержки Red Barrels» (f0c5). Проверено напрямую: при работающем
 * winws домен уходит в таймаут по всем четырём IP, после удаления из
 * хостлиста отдаёт 404 за 0.38 с при том же обходе.
 *
 * Тот же случай с `cloudfront.net`: подписанные ссылки на картинки новостей
 * под десинком отваливаются с `libcurl error: 35 (SSL connect error)` —
 * SSL-хендшейк не проходит. На игру это не влияет (виден только баннер
 * новостей), но рвущееся соединение хуже отсутствующей картинки, поэтому
 * домен тоже вычищается.
 */
const BUILTIN_DOMAIN_DROPS: Record<string, readonly string[]> = {
  "outlast-trials": ["rbg-services.com", "cloudfront.net"],
};
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
      "cloudfront.net",
    ],
    ipRanges: [],
    ports: [
      27015,
      27016,
      27017,
      27018,
      27019,
      27020,
      27031,
      27036,
      3478,
      4379,
      4380,
      ...GAME_LIFT_PORTS,
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
  return mergeBuiltinGames([]);
}

function findBuiltin(id: string): GameSettings | undefined {
  return BUILTIN_GAMES.find((item) => item.id === id);
}

/**
 * Склеивает сохранённую копию встроенной игры с актуальным пресетом.
 *
 * Зачем: settings.json переживает обновления приложения. Без склейки копия,
 * сохранённая до появления новых доменов или портов, навсегда оставалась бы
 * старой — и обход не покрывал бы реальный трафик игры. Именно так Outlast
 * больше нет: домен доступен без обхода (404 за 0.5 с), а под десинком
 * TLS-хендшейк к нему рвётся — именно это давало f0c5 в игре. Остальное (красные
 * баррелы, GameLift 7777-7830) остаётся.
 *
 * Настройки пользователя (enabled/autoRestore/createBackup) сохраняются,
 * добавленные им домены и порты не теряются. Встроенные значения при этом
 * всегда присутствуют: если пользователь удалит домен из встроенной игры,
 * он вернётся при следующей загрузке — это осознанный компромисс в пользу
 * рабочего обхода, отмеченный в интерфейсе подсказкой про обновление.
 */
export function mergeBuiltinGame(game: GameSettings): GameSettings {
  const builtin = findBuiltin(game.id);

  if (builtin === undefined) {
    return game;
  }

  const drop = new Set(BUILTIN_DOMAIN_DROPS[game.id] ?? []);

  return {
    ...game,
    domains: unionValues(
      builtin.domains,
      game.domains,
      MAX_INJECTED_ENTRIES
    ).filter((domain) => !drop.has(domain)),
    ipRanges: unionValues(
      builtin.ipRanges,
      game.ipRanges,
      MAX_INJECTED_ENTRIES
    ),
    ports: unionPorts(builtin.ports, game.ports),
  };
}

function unionValues(
  base: readonly string[],
  extra: readonly string[],
  limit: number
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of [...base, ...extra]) {
    const key = value.trim();

    if (key === "" || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(key);

    if (result.length >= limit) {
      break;
    }
  }

  return result;
}

function unionPorts(
  base: readonly number[],
  extra: readonly number[]
): number[] {
  const unique = new Set<number>();

  for (const port of [...base, ...extra]) {
    if (Number.isInteger(port) && port > 0 && port <= 65535) {
      unique.add(port);
    }
  }

  return [...unique]
    .sort((left, right) => left - right)
    .slice(0, MAX_GAME_PORTS);
}

/**
 * Полный проход по сохранённым играм: склейка встроенных + добавление тех
 * встроенных игр, которых в файле ещё нет (новые пресеты релиза).
 * Новые игры добавляются выключенными, чтобы включение обхода не менялось
 * само по себе после обновления.
 */
export function mergeBuiltinGames(
  games: readonly GameSettings[]
): GameSettings[] {
  const merged = games.map(mergeBuiltinGame);
  const known = new Set(merged.map((game) => game.id));

  for (const builtin of BUILTIN_GAMES) {
    if (known.has(builtin.id) || merged.length >= MAX_GAMES) {
      continue;
    }

    merged.push(
      mergeBuiltinGame({
        ...builtin,
        enabled: false,
        domains: [...builtin.domains],
        ipRanges: [...builtin.ipRanges],
        ports: [...builtin.ports],
      })
    );
  }

  return merged;
}
