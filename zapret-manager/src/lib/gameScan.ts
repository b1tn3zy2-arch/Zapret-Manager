import { invoke } from "@tauri-apps/api/core";

import { GAME_SCAN_START_DELAY_MS } from "@/lib/constants";
import { mergeScannedGames } from "@/lib/installedGames";
import {
  filterHiddenGames,
  useInstalledGamesStore,
} from "@/stores/useInstalledGamesStore";
import type { InstalledGame } from "@/types";

let started = false;

export async function scanInstalledGames(): Promise<InstalledGame[]> {
  const store = useInstalledGamesStore.getState();

  store.setScanStatus("scanning");
  store.setError(null);

  try {
    const scanned = await invoke<InstalledGame[]>("scan_installed_games", {
      userFolders: store.folders,
    });
    // игры, которые пользователь убрал с экрана, остаются убранными и после
    // пересканирования — иначе карточка возвращалась бы через пару секунд
    const merged = filterHiddenGames(
      mergeScannedGames(scanned.map(normalizeGame), store.games),
      store.hiddenIds
    );

    store.setGames(merged);

    return merged;
  } catch (caught) {
    store.setError(caught instanceof Error ? caught.message : String(caught));

    return store.games;
  }
}

function normalizeGame(game: InstalledGame): InstalledGame {
  return {
    ...game,
    ...(game.lastLaunchedAt === null || game.lastLaunchedAt === undefined
      ? {}
      : { lastLaunchedAt: game.lastLaunchedAt }),
    launchCount: game.launchCount ?? 0,
  };
}

export function startInstalledGamesScan(): void {
  if (started) {
    return;
  }

  started = true;
  window.setTimeout(() => {
    void scanInstalledGames();
  }, GAME_SCAN_START_DELAY_MS);
}
