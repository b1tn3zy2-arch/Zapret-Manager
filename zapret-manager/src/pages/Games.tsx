import { invoke } from "@tauri-apps/api/core";
import { useMemo, useState } from "react";
import { FolderPlus, Plus, RefreshCw, Undo2 } from "lucide-react";

import AddGameDialog from "@/components/settings/games/AddGameDialog";
import GameBypassSettings from "@/components/settings/games/GameBypassSettings";
import GameFoldersDialog from "@/components/settings/games/GameFoldersDialog";
import GameLaunchPrompt from "@/components/settings/games/GameLaunchPrompt";
import GameScanIndicator from "@/components/settings/games/GameScanIndicator";
import InstalledGamesGrid from "@/components/settings/games/InstalledGamesGrid";
import { Button, Heading, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { useGameLauncher } from "@/hooks/useGameLauncher";
import { useInstalledGames } from "@/hooks/useInstalledGames";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { isBypassEnabled } from "@/lib/installedGames";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { InstalledGame } from "@/types";

const TRAFFIC_VERDICT_KEYS: Record<string, TranslationKey> = {
  "no-log": "settings.games.installed.diagnose.verdict.no-log",
  "no-outbound": "settings.games.installed.diagnose.verdict.no-outbound",
  "no-inbound": "settings.games.installed.diagnose.verdict.no-inbound",
  tampered: "settings.games.installed.diagnose.verdict.tampered",
  clean: "settings.games.installed.diagnose.verdict.clean",
};

export default function Games() {
  const { t } = useI18n();
  const {
    games,
    folders,
    scanStatus,
    progress,
    hiddenCount,
    addManualGame,
    removeGame,
    restoreHiddenGames,
    addFolder,
    removeFolder,
    rescan,
  } = useInstalledGames();
  const {
    launchingId,
    prompt,
    toast,
    runningGames,
    diagnosis,
    launch,
    closeGame,
    confirmPrompt,
    dismissPrompt,
    diagnose,
    dismissDiagnosis,
  } = useGameLauncher();
  const bypassGames = useSettingsStore((state) => state.settings.games);
  const animationsOn = useSettingsStore(
    (state) => state.settings.appearance.animations
  );
  const canHover = useMediaQuery("(hover: hover)");
  const [addOpen, setAddOpen] = useState(false);
  const [foldersOpen, setFoldersOpen] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<InstalledGame | null>(
    null
  );
  const motionDisabled = !animationsOn || !canHover;
  const scanning = scanStatus === "scanning";

  const bypassByGameId = useMemo(
    () =>
      Object.fromEntries(
        games.map((game) => [game.id, isBypassEnabled(game, bypassGames)])
      ),
    [bypassGames, games]
  );

  const handleRemove = (game: InstalledGame): void => {
    // найденную игру сканер увидит снова, поэтому спрашиваем подтверждение;
    // добавленную вручную просто убираем — вернуть её можно только вручную
    if (game.manual === true) {
      removeGame(game.id);

      return;
    }

    setPendingRemove(game);
  };

  return (
    <section className="flex flex-col gap-6 pb-8">
      <header className="flex flex-col gap-2">
        <Heading level={1}>{t("settings.games.title")}</Heading>
        <Text variant="body" size="lg" className="text-text-secondary">
          {t("settings.games.description")}
        </Text>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <GameScanIndicator
          scanning={scanning}
          found={games.length}
          progress={progress}
        />
        <Button
          size="sm"
          variant="secondary"
          icon={<Plus aria-hidden="true" className="size-4" />}
          onClick={() => {
            setAddOpen(true);
          }}
        >
          {t("settings.games.installed.add.action")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={<FolderPlus aria-hidden="true" className="size-4" />}
          onClick={() => {
            setFoldersOpen(true);
          }}
        >
          {t("settings.games.installed.folders.add")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={scanning}
          onClick={() => {
            void rescan();
          }}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {t("settings.games.installed.rescan")}
        </Button>
        {hiddenCount > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={scanning}
            onClick={() => {
              void restoreHiddenGames();
            }}
            icon={<Undo2 aria-hidden="true" className="size-4" />}
          >
            {t("settings.games.installed.restoreHidden", {
              count: hiddenCount,
            })}
          </Button>
        ) : null}
        {toast === null ? null : (
          <span role="status" className="text-text-secondary text-sm">
            {toast}
          </span>
        )}
      </div>

      {games.length === 0 ? (
        <Text variant="body" size="sm" className="text-text-tertiary">
          {t("settings.games.installed.empty.title")} —{" "}
          {t("settings.games.installed.empty.body")}
        </Text>
      ) : (
        <InstalledGamesGrid
          games={games}
          bypassByGameId={bypassByGameId}
          launchingId={launchingId}
          motionDisabled={motionDisabled}
          onLaunch={(game) => {
            void launch(game);
          }}
          onRemove={(game) => {
            handleRemove(game);
          }}
          onCloseGame={(game) => {
            void closeGame(game);
          }}
          onDiagnose={(game) => {
            void diagnose(game);
          }}
          runningGameIds={runningGames}
        />
      )}

      <GameBypassSettings
        focusId={focusId}
        onFocusHandled={() => {
          setFocusId(null);
        }}
      />

      <AddGameDialog
        open={addOpen}
        bypassOptions={bypassGames}
        onClose={() => {
          setAddOpen(false);
        }}
        onAdd={(game) => {
          addManualGame(game);
          setFocusId(game.gameSettingsId ?? null);
        }}
      />
      <GameFoldersDialog
        open={foldersOpen}
        folders={folders}
        scanning={scanning}
        onClose={() => {
          setFoldersOpen(false);
        }}
        onAdd={addFolder}
        onRemove={removeFolder}
      />
      <GameLaunchPrompt
        prompt={prompt}
        onConfirm={() => {
          void confirmPrompt();
        }}
        onCancel={dismissPrompt}
      />

      <Modal
        open={diagnosis !== null}
        onClose={dismissDiagnosis}
        title={t("settings.games.installed.diagnose.title", {
          name: diagnosis?.gameName ?? "",
        })}
        size="sm"
        footer={
          <>
            {diagnosis !== null && diagnosis.logPaths.length > 0 ? (
              <Button
                variant="ghost"
                onClick={() => {
                  void invoke("open_folder", {
                    kind: "logs",
                    strategiesDir: diagnosis.logPaths[0] ?? "",
                  }).catch(() => undefined);
                }}
              >
                {t("settings.games.installed.diagnose.logs")}
              </Button>
            ) : null}
            <Button variant="secondary" onClick={dismissDiagnosis}>
              {t("settings.games.installed.diagnose.close")}
            </Button>
          </>
        }
      >
        {diagnosis === null ? null : (
          <div className="flex flex-col gap-3 text-sm">
            <Text variant="caption">
              {diagnosis.loading
                ? t("settings.games.installed.diagnose.loading")
                : (diagnosis.message ?? "")}
            </Text>
            {diagnosis.recommendation === null ? null : (
              <Text>{diagnosis.recommendation}</Text>
            )}
            {diagnosis.applied.length > 0 ? (
              <div className="flex flex-col gap-1">
                <Text variant="caption" className="text-xs">
                  {t("settings.games.installed.diagnose.applied")}
                </Text>
                {diagnosis.applied.map((note) => (
                  <Text key={note} className="text-xs">
                    • {note}
                  </Text>
                ))}
              </div>
            ) : null}
            <div className="border-glass-border flex flex-col gap-2 border-t pt-3">
              <div className="flex items-center justify-between gap-2">
                <Text variant="caption" className="text-xs">
                  {t("settings.games.installed.diagnose.endpoints")}
                </Text>
                <Button
                  variant="ghost"
                  disabled={diagnosis.checkingEndpoints}
                  onClick={() => {
                    void diagnosis.recheckEndpoints();
                  }}
                >
                  {diagnosis.checkingEndpoints
                    ? t("settings.games.installed.diagnose.checking")
                    : t("settings.games.installed.diagnose.recheck")}
                </Button>
              </div>
              {diagnosis.endpoints.map((endpoint) => (
                <div
                  key={endpoint.host}
                  className="flex flex-col gap-0.5 text-xs"
                >
                  <span
                    className={cn(
                      "font-medium",
                      endpoint.ok ? "text-status-success" : "text-accent-danger"
                    )}
                  >
                    {endpoint.ok
                      ? t("settings.games.installed.diagnose.reachable")
                      : t("settings.games.installed.diagnose.blocked")}
                    {" · "}
                    {endpoint.host}
                    {endpoint.latencyMs === null
                      ? ""
                      : ` · ${endpoint.latencyMs} ms`}
                  </span>
                  <span className="text-text-tertiary">{endpoint.hint}</span>
                </div>
              ))}
              <div className="mt-1 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <Text variant="caption" className="text-xs">
                    {t("settings.games.installed.diagnose.traffic")}
                  </Text>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      void diagnosis.checkTraffic();
                    }}
                  >
                    {t("settings.games.installed.diagnose.checkTraffic")}
                  </Button>
                </div>
                {diagnosis.servers.length === 0 ? (
                  <span className="text-text-tertiary text-xs">
                    {t("settings.games.installed.diagnose.noServer")}
                  </span>
                ) : (
                  diagnosis.servers.slice(0, 3).map((server) => (
                    <span
                      key={`${server.ip}:${server.port}`}
                      className="text-xs"
                    >
                      <span className="text-text-secondary font-medium">
                        {server.ip}:{server.port}
                      </span>
                      {server.region === null ? null : (
                        <span className="text-text-tertiary">
                          {" "}
                          · {server.region}
                        </span>
                      )}
                    </span>
                  ))
                )}
                {diagnosis.traffic === null ? null : (
                  <div className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        diagnosis.traffic.verdict === "clean"
                          ? "text-status-success"
                          : "text-accent-danger"
                      )}
                    >
                      {t(
                        TRAFFIC_VERDICT_KEYS[diagnosis.traffic.verdict] ??
                          "settings.games.installed.diagnose.verdict.no-log"
                      )}
                    </span>
                    <span className="text-text-tertiary text-xs">
                      {diagnosis.traffic.message}
                    </span>
                    <span className="text-text-tertiary text-xs">
                      {t("settings.games.installed.diagnose.trafficCounts", {
                        out: diagnosis.traffic.outbound,
                        in: diagnosis.traffic.inbound,
                        drop: diagnosis.traffic.dropped,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={pendingRemove !== null}
        onClose={() => {
          setPendingRemove(null);
        }}
        title={t("settings.games.installed.removeTitle")}
        {...(pendingRemove === null
          ? {}
          : {
              description: t("settings.games.installed.removeBody", {
                name: pendingRemove.name,
              }),
            })}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setPendingRemove(null);
              }}
            >
              {t("settings.common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingRemove !== null) {
                  removeGame(pendingRemove.id);
                }

                setPendingRemove(null);
              }}
            >
              {t("settings.games.installed.removeConfirm")}
            </Button>
          </>
        }
      >
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.games.installed.removeBody", {
            name: pendingRemove?.name ?? "",
          })}
        </Text>
      </Modal>
    </section>
  );
}
