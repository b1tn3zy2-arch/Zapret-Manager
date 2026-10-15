import { useI18n } from "@/i18n";

import { Text } from "@/components/ui";
import { useSystemInfo } from "@/hooks/useSystemInfo";
import { formatVersion } from "@/lib/updateUtils";

/**
 * Подвал главной страницы с версией приложения.
 *
 * Версия берётся из живого get_system_info, а не из константы APP_VERSION:
 * константа может разойтись с сборкой, и пользователь видит не то, что запущено.
 */
export default function DashboardFooter() {
  const { t } = useI18n();
  const { info } = useSystemInfo();
  const version = info?.appVersion ?? null;

  if (version === null || version === undefined || version === "") {
    return null;
  }

  return (
    <footer className="dashboard-footer">
      <Text
        variant="caption"
        className="text-text-tertiary text-center font-mono"
      >
        {t("dashboard.version", { version: formatVersion(version) })}
      </Text>
    </footer>
  );
}
