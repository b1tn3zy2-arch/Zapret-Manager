import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { useEffect, useState } from "react";
import { Download, Search, Trash2, X } from "lucide-react";

import Dropdown from "@/components/settings/Dropdown";
import {
  Badge,
  Button,
  FilterChip,
  Input,
  Toggle,
  type FilterChipVariant,
} from "@/components/ui";
import { useDebounce } from "@/hooks/useDebounce";
import {
  LOG_LEVELS,
  LOG_LEVEL_LABELS,
  LOG_SOURCES,
  LOG_SOURCE_LABELS,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/constants";
import type {
  LevelCounts,
  SourceCounts,
} from "@/stores/selectors/useLogSelectors";
import type { LogFilter, LogLevel, LogSource } from "@/types";

export interface StrategyOption {
  id: string;
  name: string;
}

export interface LogFiltersProps {
  filter: LogFilter;
  onChange: (patch: Partial<LogFilter>) => void;
  onReset: () => void;
  levelCounts: LevelCounts;
  sourceCounts: SourceCounts;
  strategyOptions: StrategyOption[];
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  onExport: () => void;
  onClear: () => void;
  canExport: boolean;
  filterActive: boolean;
  totalCount: number;
  shownCount: number;
}

const LEVEL_VARIANTS = {
  debug: "debug",
  info: "info",
  success: "success",
  warn: "warn",
  error: "error",
} as const satisfies Record<LogLevel, FilterChipVariant>;

function toggleIn<T>(list: T[] | undefined, value: T): T[] | undefined {
  const current = list ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return next.length === 0 ? undefined : next;
}

function entriesCountKey(count: number): TranslationKey {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "logs.countOne";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return "logs.countFew";
  }

  return "logs.countMany";
}

function LogFilters({
  filter,
  onChange,
  onReset,
  levelCounts,
  sourceCounts,
  strategyOptions,
  autoScroll,
  onAutoScrollChange,
  onExport,
  onClear,
  canExport,
  filterActive,
  totalCount,
  shownCount,
}: LogFiltersProps) {
  const { t } = useI18n();
  const [searchDraft, setSearchDraft] = useState(filter.search ?? "");
  const debouncedSearch = useDebounce(searchDraft, SEARCH_DEBOUNCE_MS);
  const committedSearch = filter.search ?? "";

  useEffect(() => {
    const trimmed = debouncedSearch.trim();

    if (trimmed === committedSearch) {
      return;
    }

    onChange({ search: trimmed === "" ? undefined : trimmed });
  }, [debouncedSearch, committedSearch, onChange]);

  const strategyValue = filter.strategyId ?? "";

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          data-focus-quiet
          variant="filled"
          size="sm"
          className="w-full max-w-xs"
          icon={<Search className="size-3.5" />}
          placeholder={t("logs.searchPlaceholder")}
          aria-label={t("logs.searchPlaceholder")}
          value={searchDraft}
          onChange={(event) => {
            setSearchDraft(event.target.value);
          }}
        />

        <Dropdown
          label={t("logs.filterStrategy")}
          value={strategyValue}
          options={[
            { value: "", label: t("logs.allStrategies") },
            ...strategyOptions.map((option) => ({
              value: option.id,
              label: option.name,
            })),
          ]}
          onChange={(value) => {
            onChange({ strategyId: value === "" ? undefined : value });
          }}
        />

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="text-text-secondary text-xs">
              {t("logs.autoScroll")}
            </span>
            <Toggle
              size="sm"
              checked={autoScroll}
              onChange={onAutoScrollChange}
              label={t("logs.autoScroll")}
            />
          </span>

          <Button
            size="sm"
            variant="secondary"
            onClick={onExport}
            disabled={!canExport}
            icon={<Download className="size-3.5" />}
          >
            {t("logs.export")}
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={onClear}
            disabled={totalCount === 0}
            icon={<Trash2 className="size-3.5" />}
          >
            {t("logs.clear")}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {LOG_LEVELS.map((level: LogLevel) => (
          <FilterChip
            key={level}
            label={t(LOG_LEVEL_LABELS[level])}
            count={levelCounts[level]}
            variant={LEVEL_VARIANTS[level]}
            active={
              filter.levels === undefined || filter.levels.includes(level)
            }
            onToggle={() => {
              onChange({ levels: toggleIn(filter.levels, level) });
            }}
          />
        ))}

        <span aria-hidden="true" className="bg-glass-hover mx-1 h-4 w-px" />

        {LOG_SOURCES.map((source: LogSource) => (
          <FilterChip
            key={source}
            label={t(LOG_SOURCE_LABELS[source])}
            count={sourceCounts[source]}
            variant="neutral"
            active={
              filter.sources === undefined || filter.sources.includes(source)
            }
            onToggle={() => {
              onChange({ sources: toggleIn(filter.sources, source) });
            }}
          />
        ))}

        <div className="ml-auto flex items-center gap-2">
          {filterActive ? (
            <button
              type="button"
              onClick={onReset}
              className="text-text-tertiary hover:text-text-primary flex items-center gap-1 text-xs transition-colors"
            >
              <X className="size-3" />
              {t("logs.resetFilters")}
            </button>
          ) : null}

          <Badge variant="neutral">
            {shownCount === totalCount
              ? t(entriesCountKey(totalCount), { count: totalCount })
              : t("logs.countShown", { shown: shownCount, total: totalCount })}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default LogFilters;
