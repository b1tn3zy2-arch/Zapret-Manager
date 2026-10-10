import { Download, Upload } from "lucide-react";

import EditableList from "@/components/settings/EditableList";
import { Button, Input, Toggle } from "@/components/ui";
import { useI18n } from "@/i18n";
import { isValidDomain, isValidIpRange } from "@/lib/gameValidation";
import type { GameSettings } from "@/types";

export interface GameEditorProps {
  game: GameSettings;
  onChange: (patch: Partial<GameSettings>) => void;
  onImport: () => void;
  onExport: () => void;
}

const PORT_MIN = 1;
const PORT_MAX = 65535;

function validatePort(value: string): string | null {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed >= PORT_MIN && parsed <= PORT_MAX ? null : "1…65535";
}

export default function GameEditor({
  game,
  onChange,
  onImport,
  onExport,
}: GameEditorProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col gap-4 pt-3">
      <Input
        label={t("settings.games.name")}
        value={game.name}
        maxLength={64}
        onChange={(event) => {
          onChange({ name: event.target.value });
        }}
      />

      <EditableList
        label={t("settings.games.domains")}
        placeholder="steampowered.com"
        addLabel={t("settings.games.addDomain")}
        emptyMessage={t("settings.games.noDomains")}
        items={game.domains}
        validate={isValidDomain}
        onChange={(domains) => {
          onChange({ domains });
        }}
      />

      <EditableList
        label={t("settings.games.ipRanges")}
        placeholder="203.0.113.0/24"
        addLabel={t("settings.games.addIpRange")}
        emptyMessage={t("settings.games.noIpRanges")}
        items={game.ipRanges}
        validate={isValidIpRange}
        onChange={(ipRanges) => {
          onChange({ ipRanges });
        }}
      />

      <EditableList
        type="number"
        label={t("settings.games.ports")}
        placeholder="27015"
        addLabel={t("settings.games.addPort")}
        emptyMessage={t("settings.games.noPorts")}
        items={game.ports.map(String)}
        validate={validatePort}
        onChange={(items) => {
          onChange({
            ports: items
              .map((item) => Number.parseInt(item, 10))
              .filter((port) => Number.isFinite(port)),
          });
        }}
      />

      <Toggle
        size="md"
        checked={game.createBackup}
        label={t("settings.games.createBackup")}
        onChange={(value) => {
          onChange({ createBackup: value });
        }}
      />

      <Toggle
        size="md"
        checked={game.autoRestore}
        label={t("settings.games.autoRestore")}
        onChange={(value) => {
          onChange({ autoRestore: value });
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onImport}
          icon={
            <Upload aria-hidden="true" className="size-4" strokeWidth={2} />
          }
        >
          {t("settings.games.import")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onExport}
          icon={
            <Download aria-hidden="true" className="size-4" strokeWidth={2} />
          }
        >
          {t("settings.games.export")}
        </Button>
      </div>
    </div>
  );
}
