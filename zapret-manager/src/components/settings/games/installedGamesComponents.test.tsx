import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import InstalledGamesGrid from "@/components/settings/games/InstalledGamesGrid";
import GamePlayOverlay from "@/components/settings/games/GamePlayOverlay";
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
import type { InstalledGame } from "@/types";

vi.mock("@/lib/gameScan", () => ({
  scanInstalledGames: vi.fn(async () => []),
  startInstalledGamesScan: vi.fn(),
}));

vi.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "ru",
    setLanguage: vi.fn(),
  }),
}));

const mockInvoke = vi.fn(
  async (_command: string, _args?: unknown): Promise<string | null> => null
);

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (command: string, args?: unknown) => mockInvoke(command, args),
}));

function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  return {
    id: "steam-portal",
    name: "Portal",
    appid: "620",
    platform: "steam",
    source: "steam",
    installPath: "D:\\Steam\\Portal",
    executablePath: "D:\\Steam\\Portal\\portal.exe",
    anticheat: "none",
    launchCount: 0,
    ...patch,
  };
}

/** игра, у которой сканер не нашёл appid — обложка ищется по папке и exe */
function withoutAppid(): InstalledGame {
  const value = game();
  const { appid: _appid, ...rest } = value;

  return { ...rest };
}

describe("InstalledGamesGrid", () => {
  it("рисует карточку с названием и бейджами", () => {
    render(
      <InstalledGamesGrid
        games={[game()]}
        bypassByGameId={{ "steam-portal": true }}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    expect(screen.getByTestId("installed-games-grid")).toBeInTheDocument();
    expect(screen.getByText("Portal")).toBeInTheDocument();
    expect(
      screen.getByText("settings.games.installed.badge.bypassOn")
    ).toBeInTheDocument();
  });

  it("показывает бейдж «без обхода» для выключенного обхода", () => {
    render(
      <InstalledGamesGrid
        games={[game()]}
        bypassByGameId={{ "steam-portal": false }}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    expect(
      screen.getByText("settings.games.installed.badge.bypassOff")
    ).toBeInTheDocument();
  });

  it("запрашивает обложку через команду game_cover", () => {
    render(
      <InstalledGamesGrid
        games={[game()]}
        bypassByGameId={{}}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    expect(mockInvoke).toHaveBeenCalledWith("game_cover", {
      appid: "620",
      cover: null,
    });
  });

  it("берёт обложку из папки игры, если у игры нет appid", async () => {
    render(
      <InstalledGamesGrid
        games={[withoutAppid()]}
        bypassByGameId={{}}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith("game_folder_cover", {
        dir: "D:\\Steam\\Portal",
      });
    });
  });

  it("не ходит в сеть, если нашлась иконка exe", async () => {
    mockInvoke.mockImplementation(async (command: string) => {
      if (command === "game_exe_icon") {
        return "data:image/png;base64,iVBORw0KGgo=";
      }

      return null;
    });

    render(
      <InstalledGamesGrid
        games={[withoutAppid()]}
        bypassByGameId={{}}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
    });

    expect(mockInvoke).not.toHaveBeenCalledWith(
      "game_steam_cover",
      expect.anything()
    );
  });

  it("позволяет убрать найденную игру, а не только добавленную вручную", async () => {
    const onRemove = vi.fn();

    render(
      <InstalledGamesGrid
        games={[game()]}
        bypassByGameId={{}}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={onRemove}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    await userEvent.click(
      screen.getByLabelText("settings.games.installed.removeGame")
    );

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("передаёт игру в обработчик запуска", async () => {
    const onLaunch = vi.fn();
    const target = game();

    render(
      <InstalledGamesGrid
        games={[target]}
        bypassByGameId={{}}
        launchingId={null}
        motionDisabled
        onLaunch={onLaunch}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    await userEvent.hover(screen.getByTestId("installed-game-card"));
    await userEvent.click(
      screen.getByLabelText("settings.games.installed.launch.action")
    );

    expect(onLaunch).toHaveBeenCalledWith(target);
  });

  it("рисует по карточке на каждую игру", () => {
    render(
      <InstalledGamesGrid
        games={[
          game(),
          game({
            id: "custom-x",
            name: "Second",
            executablePath: "C:\\B\\b.exe",
          }),
        ]}
        bypassByGameId={{}}
        launchingId={null}
        motionDisabled
        onLaunch={vi.fn()}
        onRemove={vi.fn()}
        onCloseGame={vi.fn()}
        onDiagnose={vi.fn()}
        runningGameIds={{}}
      />
    );

    expect(screen.getAllByTestId("installed-game-card")).toHaveLength(2);
  });
});

describe("GamePlayOverlay", () => {
  it("не показывает кнопку вне hover", () => {
    render(
      <GamePlayOverlay
        visible={false}
        busy={false}
        label="Запустить"
        motionDisabled
        onLaunch={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Запустить")).toHaveAttribute("disabled");
  });

  it("вызывает onLaunch по клику", async () => {
    const onLaunch = vi.fn();

    render(
      <GamePlayOverlay
        visible
        busy={false}
        label="Запустить"
        motionDisabled
        onLaunch={onLaunch}
      />
    );

    await userEvent.click(screen.getByLabelText("Запустить"));

    expect(onLaunch).toHaveBeenCalledTimes(1);
  });

  it("блокирует кнопку во время запуска", () => {
    render(
      <GamePlayOverlay
        visible
        busy
        label="Запустить"
        motionDisabled
        onLaunch={vi.fn()}
      />
    );

    expect(screen.getByLabelText("Запустить")).toBeDisabled();
  });
});

describe("стор установленных игр в связке с сеткой", () => {
  it("отдаёт сохранённые игры в пропсы", () => {
    useInstalledGamesStore.getState().addGame(game());

    expect(useInstalledGamesStore.getState().games).toHaveLength(1);
    useInstalledGamesStore.setState({ games: [] });
  });
});
