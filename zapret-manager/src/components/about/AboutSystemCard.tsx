import { Card, Text } from "@/components/ui";
import { formatOsLabel } from "@/lib/systemInfo";
import type { Translate } from "@/i18n";
import type { SystemInfo } from "@/types";

export interface AboutSystemCardProps {
  info: SystemInfo | null;
  t: Translate;
}

export default function AboutSystemCard({ info, t }: AboutSystemCardProps) {
  const rows =
    info === null
      ? []
      : [
          [t("about.os"), formatOsLabel(info)],
          [t("about.arch"), info.arch],
        ];

  return (
    <Card className="flex flex-col gap-3" padding="lg">
      <Text variant="label" className="text-text-primary">
        {t("about.system")}
      </Text>

      {rows.length === 0 ? (
        <Text variant="body" size="sm" className="text-text-tertiary">
          {t("about.systemLoading")}
        </Text>
      ) : (
        <dl className="flex flex-col gap-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-text-secondary text-sm">{label}</dt>
              <dd className="text-text-primary truncate font-mono text-sm">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}
