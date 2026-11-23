// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import {
  // Подключаем именованный импорт filterRemovedGames.
  filterRemovedGames,
  // Подключаем именованный импорт migratePersistedGames.
  migratePersistedGames,
  // Подключаем именованный импорт useInstalledGamesStore.
  useInstalledGamesStore,
  // Закрываем текущий блок.
} from "@/stores/useInstalledGamesStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию game.
function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  // Возвращаем результат: { id: steam-portal, name: Portal, platform: steam, sour….
  return {
    // Обрабатываем конструкцию: id.
    id: "steam-portal",
    // Обрабатываем конструкцию: name.
    name: "Portal",
    // Обрабатываем конструкцию: platform.
    platform: "steam",
    // Обрабатываем конструкцию: source.
    source: "steam",
    // Обрабатываем конструкцию: installPath.
    installPath: "D:\\Steam\\Portal",
    // Обрабатываем конструкцию: executablePath.
    executablePath: "D:\\Steam\\Portal\\portal.exe",
    // Обрабатываем конструкцию: launchCount.
    launchCount: 0,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("стор установленных игр", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.setState({
      // Обрабатываем конструкцию: games.
      games: [],
      // Обрабатываем конструкцию: folders.
      folders: [],
      // Обрабатываем конструкцию: removedIds.
      removedIds: [],
      // Обрабатываем конструкцию: scanStatus.
      scanStatus: "idle",
      // Обрабатываем конструкцию: scanProgress.
      scanProgress: null,
      // Обрабатываем конструкцию: lastScannedAt.
      lastScannedAt: null,
      // Обрабатываем конструкцию: error.
      error: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет и обновляет игры", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame(game());
    // Обрабатываем конструкцию: store.
    store.updateGame("steam-portal", { launchCount: 2 });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().games[0]?.launchCount).toBe(2);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не добавляет игру дважды", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame(game());
    // Обрабатываем конструкцию: store.
    store.addGame(game({ name: "Portal 2" }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().games).toHaveLength(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("удаляет игру по id", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame(game());
    // Обрабатываем конструкцию: store.
    store.removeGame("steam-portal");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().games).toHaveLength(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("хранит папки без дублей", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addFolder("C:\\Games");
    // Обрабатываем конструкцию: store.
    store.addFolder("c:\\games");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().folders).toEqual(["C:\\Games"]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.removeFolder("C:\\GAMES");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().folders).toHaveLength(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("фиксирует статус сканирования и время", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setScanStatus("scanning");
    // Обрабатываем конструкцию: store.
    store.setGames([game()]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().scanStatus).toBe("done");
    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().lastScannedAt).not.toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не затирает обложку и AppID, добытые раньше скана", () => {
    // Сохраняем пояснение разработчика: // Событие докачки обновило карточку, а ответ скана пришёл п…
    // Событие докачки обновило карточку, а ответ скана пришёл позже
    // Сохраняем пояснение разработчика: // и в нём этих данных ещё нет: сканер не должен их потерять…
    // и в нём этих данных ещё нет: сканер не должен их потерять.
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setGames([
      // Обрабатываем конструкцию: game.
      game({
        // Обрабатываем конструкцию: appid.
        appid: "1942120",
        // Обрабатываем конструкцию: coverPath.
        coverPath: "C:\\covers\\1942120.jpg",
        // Закрываем текущий блок.
      }),
      // Закрываем массив или список.
    ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setGames([game()]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const kept = useInstalledGamesStore.getState().games[0].
    const kept = useInstalledGamesStore.getState().games[0];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(kept?.appid).toBe("1942120");
    // Обрабатываем конструкцию: expect.
    expect(kept?.coverPath).toBe("C:\\covers\\1942120.jpg");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("берёт свежие обложку и AppID, если сканер их прислал", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setGames([game({ appid: "1", coverPath: "C:\\covers\\1.jpg" })]);
    // Обрабатываем конструкцию: store.
    store.setGames([game({ appid: "2", coverPath: "C:\\covers\\2.jpg" })]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const kept = useInstalledGamesStore.getState().games[0].
    const kept = useInstalledGamesStore.getState().games[0];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(kept?.appid).toBe("2");
    // Обрабатываем конструкцию: expect.
    expect(kept?.coverPath).toBe("C:\\covers\\2.jpg");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переводит ошибку в статус error", () => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.getState().setError("сбой");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().scanStatus).toBe("error");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("удаляет найденную сканером игру и не возвращает её при рескане", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame(game());
    // Обрабатываем конструкцию: store.
    store.removeGame("steam-portal");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useInstalledGamesStore.getState().
    const state = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(state.games).toHaveLength(0);
    // Обрабатываем конструкцию: expect.
    expect(state.removedIds).toEqual(["steam-portal"]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("удаляет игру, добавленную вручную, с записью в удалённые", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame(game({ id: "manual-x", manual: true }));
    // Обрабатываем конструкцию: store.
    store.removeGame("manual-x");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useInstalledGamesStore.getState().
    const state = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(state.games).toHaveLength(0);
    // Обрабатываем конструкцию: expect.
    expect(state.removedIds).toEqual(["manual-x"]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не записывает удаление дважды", () => {
    // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
    const store = useInstalledGamesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.addGame(game());
    // Обрабатываем конструкцию: store.
    store.removeGame("steam-portal");
    // Обрабатываем конструкцию: store.
    store.addGame(game());
    // Обрабатываем конструкцию: store.
    store.removeGame("steam-portal");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().removedIds).toEqual([
      // Обрабатываем конструкцию: steam-portal.
      "steam-portal",
      // Закрываем массив или список.
    ]);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("удалённые игры при пересканировании", () => {
  // Обрабатываем конструкцию: it.
  it("оставляет удалённые игры удалёнными", () => {
    // Обрабатываем конструкцию: const result = filterRemovedGames( [game(), game({ id: ….
    const result = filterRemovedGames(
      // Открываем массив.
      [game(), game({ id: "steam-doom", name: "Doom" })],
      // Открываем массив.
      ["steam-portal"]
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result).toHaveLength(1);
    // Обрабатываем конструкцию: expect.
    expect(result[0]?.name).toBe("Doom");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("без удалений отдаёт список как есть", () => {
    // Обрабатываем конструкцию: const games = [game()].
    const games = [game()];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(filterRemovedGames(games, [])).toBe(games);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("миграция сохранённых игр", () => {
  // Обрабатываем конструкцию: it.
  it("отбрасывает битые записи", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedGames({ games: [{ id: ….
    const migrated = migratePersistedGames({
      // Обрабатываем конструкцию: games.
      games: [{ id: 5 }, game()] as unknown as InstalledGame[],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.games).toHaveLength(1);
    // Обрабатываем конструкцию: expect.
    expect(migrated.games[0]?.name).toBe("Portal");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("восстанавливает счётчик запусков по умолчанию", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedGames({ games: [ { id:….
    const migrated = migratePersistedGames({
      // Обрабатываем конструкцию: games.
      games: [
        // Открываем объектный литерал.
        {
          // Обрабатываем конструкцию: id.
          id: "x",
          // Обрабатываем конструкцию: name.
          name: "Игра",
          // Обрабатываем конструкцию: platform.
          platform: "custom",
          // Обрабатываем конструкцию: source.
          source: "userFolder",
          // Обрабатываем конструкцию: installPath.
          installPath: "C:\\Games",
          // Обрабатываем конструкцию: executablePath.
          executablePath: "C:\\Games\\g.exe",
          // Закрываем текущий блок.
        } as InstalledGame,
        // Закрываем массив или список.
      ],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.games[0]?.launchCount).toBe(0);
    // Обрабатываем конструкцию: expect.
    expect(migrated.folders).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("устойчив к пустому хранилищу", () => {
    // Обрабатываем конструкцию: expect.
    expect(migratePersistedGames(undefined).games).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("аннулирует удаления из эпохи старого сканера", () => {
    // Сохраняем пояснение разработчика: // Версия 4: старые удаления делались против сканера, путавш…
    // Версия 4: старые удаления делались против сканера, путавшего игры
    // Сохраняем пояснение разработчика: // с мусором, и против id с платформой в префиксе. Они не пе…
    // с мусором, и против id с платформой в префиксе. Они не переносятся.
    // Обрабатываем конструкцию: const migrated = migratePersistedGames({ removedIds: [ ….
    const migrated = migratePersistedGames({
      // Обрабатываем конструкцию: removedIds.
      removedIds: [
        // Обрабатываем конструкцию: steam-portal.
        "steam-portal",
        // Обрабатываем конструкцию: steam-portal.
        "steam-portal",
        // Обрабатываем конструкцию: 7.
        7,
        // Обрабатываем конструкцию: unknown-c-the-long-dark-unitycrashhandler64-exe.
        "unknown-c-the-long-dark-unitycrashhandler64-exe",
        // Закрываем массив или список.
      ],
      // Обрабатываем конструкцию: hiddenIds.
      hiddenIds: ["manual-x"],
      // Закрываем текущий блок.
    } as unknown as Parameters<typeof migratePersistedGames>[0]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.removedIds).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("для свежего хранилища без удалений отдаёт пустой список", () => {
    // Обрабатываем конструкцию: expect.
    expect(migratePersistedGames({ games: [game()] }).removedIds).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пересобирает id игры по пути к exe", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedGames({ games: [ game(….
    const migrated = migratePersistedGames({
      // Обрабатываем конструкцию: games.
      games: [
        // Обрабатываем конструкцию: game.
        game({ id: "unknown-d-steam-portal-portal-exe" }),
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "manual-c-games-indie-indie-exe",
          // Обрабатываем конструкцию: executablePath.
          executablePath: "C:\\Games\\Indie\\indie.exe",
          // Закрываем текущий блок.
        }),
        // Закрываем массив или список.
      ],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.games[0]?.id).toBe("g-d-steam-portal-portal-exe");
    // Обрабатываем конструкцию: expect.
    expect(migrated.games[1]?.id).toBe("g-c-games-indie-indie-exe");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет поля игры при пересборке id", () => {
    // Обрабатываем конструкцию: const migrated = migratePersistedGames({ games: [ game(….
    const migrated = migratePersistedGames({
      // Обрабатываем конструкцию: games.
      games: [
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "old-id",
          // Обрабатываем конструкцию: manual.
          manual: true,
          // Обрабатываем конструкцию: launchCount.
          launchCount: 4,
          // Обрабатываем конструкцию: lastLaunchedAt.
          lastLaunchedAt: 100,
          // Закрываем текущий блок.
        }),
        // Закрываем массив или список.
      ],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(migrated.games[0]).toEqual({
      // Разворачиваем ...game({ id: old-id, manual: true, launchCou… в коллекцию.
      ...game({
        // Обрабатываем конструкцию: id.
        id: "old-id",
        // Обрабатываем конструкцию: manual.
        manual: true,
        // Обрабатываем конструкцию: launchCount.
        launchCount: 4,
        // Обрабатываем конструкцию: lastLaunchedAt.
        lastLaunchedAt: 100,
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: id.
      id: "g-d-steam-portal-portal-exe",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
