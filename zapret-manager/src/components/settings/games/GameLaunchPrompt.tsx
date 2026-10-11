import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import type { LaunchPrompt } from "@/hooks/useGameLauncher";

export interface GameLaunchPromptProps {
  prompt: LaunchPrompt | null;
  killSwitchActive: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GameLaunchPrompt({
  prompt,
  killSwitchActive,
  onConfirm,
  onCancel,
}: GameLaunchPromptProps) {
  const { t } = useI18n();

  if (prompt === null) {
    return null;
  }

  const title = titleFor(prompt, t);
  const body = bodyFor(prompt, killSwitchActive, t);
  const closableOnly = prompt.kind === "noStrategy" || prompt.kind === "noVpn";

  return (
    <Modal
      open
      onClose={onCancel}
      title={title}
      description={body}
      size="sm"
      children={null}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            {t("settings.games.installed.prompt.cancel")}
          </Button>
          {closableOnly ? null : (
            <Button onClick={onConfirm}>
              {t("settings.games.installed.prompt.confirm")}
            </Button>
          )}
        </>
      }
    />
  );
}

type Translate = ReturnType<typeof useI18n>["t"];

function titleFor(prompt: LaunchPrompt, t: Translate): string {
  switch (prompt.kind) {
    case "anticheat":
      return t("settings.games.installed.prompt.anticheatTitle");
    case "bypass":
      return t("settings.games.installed.prompt.bypassTitle");
    case "noStrategy":
      return t("settings.games.installed.prompt.noStrategyTitle");
    case "vpn":
      return t("settings.games.installed.prompt.vpnTitle");
    case "noVpn":
      return t("settings.games.installed.prompt.noVpnTitle");
  }
}

function bodyFor(
  prompt: LaunchPrompt,
  killSwitchActive: boolean,
  t: Translate
): string {
  const name = prompt.game?.name ?? "";

  switch (prompt.kind) {
    case "anticheat":
      return t("settings.games.installed.prompt.anticheatBody", {
        name,
        anticheat: prompt.game?.anticheat ?? "anticheat",
      });
    case "bypass":
      return t("settings.games.installed.prompt.bypassBody", { name });
    case "noStrategy":
      return t("settings.games.installed.prompt.noStrategyBody");
    case "vpn":
      return t(
        killSwitchActive
          ? "settings.games.installed.prompt.vpnKillSwitchBody"
          : "settings.games.installed.prompt.vpnBody",
        { name }
      );
    case "noVpn":
      return t("settings.games.installed.prompt.noVpnBody", { name });
  }
}
