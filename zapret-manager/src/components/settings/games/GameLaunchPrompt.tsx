import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import type { LaunchPrompt } from "@/hooks/useGameLauncher";

export interface GameLaunchPromptProps {
  prompt: LaunchPrompt | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function GameLaunchPrompt({
  prompt,
  onConfirm,
  onCancel,
}: GameLaunchPromptProps) {
  const { t } = useI18n();

  if (prompt === null) {
    return null;
  }

  const title =
    prompt.kind === "anticheat"
      ? t("settings.games.installed.prompt.anticheatTitle")
      : prompt.kind === "bypass"
        ? t("settings.games.installed.prompt.bypassTitle")
        : t("settings.games.installed.prompt.noStrategyTitle");
  const body =
    prompt.kind === "anticheat"
      ? t("settings.games.installed.prompt.anticheatBody", {
          name: prompt.game?.name ?? "",
          anticheat: prompt.game?.anticheat ?? "anticheat",
        })
      : prompt.kind === "bypass"
        ? t("settings.games.installed.prompt.bypassBody", {
            name: prompt.game?.name ?? "",
          })
        : t("settings.games.installed.prompt.noStrategyBody");

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
          {prompt.kind === "noStrategy" ? null : (
            <Button onClick={onConfirm}>
              {t("settings.games.installed.prompt.confirm")}
            </Button>
          )}
        </>
      }
    />
  );
}
