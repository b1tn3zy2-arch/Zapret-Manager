import { beforeEach, describe, expect, it } from "vitest";

import {
  migratePersistedGames,
  useInstalledGamesStore,
} from "@/stores/useInstalledGamesStore";
import type { InstalledGame } from "@/types";

function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  return {
    id: "steam-portal",
    name: "Portal",
    platform: "steam",
    source: "steam",
    installPath: "D:\\Steam\\Portal",
    executablePath: "D:\\Steam\\Portal\\portal.exe",
    launchCount: 0,
    ...patch,
  };
}

describe("стор установленных игр", () => {
  beforeEach(() => {
    useInstalledGamesStore.setState({
      games: [],
      folders: [],
      scanStatus: "idle",
      scanProgress: null,
      lastScannedAt: null,
      error: null,
    });
  });

  it("добавляет и обновляет игры", () => {
    const store = useInstalledGamesStore.getState();

    store.addGame(game());
    store.updateGame("steam-portal", { launchCount: 2 });

    expect(useInstalledGamesStore.getState().games[0]?.launchCount).toBe(2);
  });

  it("не добавляет игру дважды", () => {
    const store = useInstalledGamesStore.getState();

    store.addGame(game());
    store.addGame(game({ name: "Portal 2" }));

    expect(useInstalledGamesStore.getState().games).toHaveLength(1);
  });

  it("удаляет игру по id", () => {
    const store = useInstalledGamesStore.getState();

    store.addGame(game());
    store.removeGame("steam-portal");

    expect(useInstalledGamesStore.getState().games).toHaveLength(0);
  });

  it("хранит папки без дублей", () => {
    const store = useInstalledGamesStore.getState();

    store.addFolder("C:\\Games");
    store.addFolder("c:\\games");

    expect(useInstalledGamesStore.getState().folders).toEqual(["C:\\Games"]);

    store.removeFolder("C:\\GAMES");

    expect(useInstalledGamesStore.getState().folders).toHaveLength(0);
  });

  it("фиксирует статус сканирования и время", () => {
    const store = useInstalledGamesStore.getState();

    store.setScanStatus("scanning");
    store.setGames([game()]);

    expect(useInstalledGamesStore.getState().scanStatus).toBe("done");
    expect(useInstalledGamesStore.getState().lastScannedAt).not.toBeNull();
  });

  it("переводит ошибку в статус error", () => {
    useInstalledGamesStore.getState().setError("сбой");

    expect(useInstalledGamesStore.getState().scanStatus).toBe("error");
  });
});

describe("миграция сохранённых игр", () => {
  it("отбрасывает битые записи", () => {
    const migrated = migratePersistedGames({
      games: [{ id: 5 }, game()] as unknown as InstalledGame[],
    });

    expect(migrated.games).toHaveLength(1);
    expect(migrated.games[0]?.name).toBe("Portal");
  });

  it("восстанавливает счётчик запусков по умолчанию", () => {
    const migrated = migratePersistedGames({
      games: [
        {
          id: "x",
          name: "Игра",
          platform: "custom",
          source: "userFolder",
          installPath: "C:\\Games",
          executablePath: "C:\\Games\\g.exe",
        } as InstalledGame,
      ],
    });

    expect(migrated.games[0]?.launchCount).toBe(0);
    expect(migrated.folders).toEqual([]);
  });

  it("устойчив к пустому хранилищу", () => {
    expect(migratePersistedGames(undefined).games).toEqual([]);
  });
});
