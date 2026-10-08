import { useEffect, useState } from "react";
import { Download, Search, Trash2, X } from "lucide-react";

import { useDebounce } from "@/hooks/useDebounce";
import { Badge, Button, Input, Toggle } from "@/components/ui";
import {
  LOG_LEVEL_DOT_CLASSES,
  LOG_LEVEL_LABELS,
  LOG_LEVELS,
  LOG_SOURCES,
  LOG_SOURCE_LABELS,
  SEARCH_DEBOUNCE_MS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
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

interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  accent?: string;
  onToggle: () => void;
}

function FilterChip({
  label,
  count,
  active,
  accent,
  onToggle,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onToggle}
      className={cn(
        "flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs",
        "transition-colors duration-200 ease-out focus-visible:outline-none",
        "focus-visible:ring-accent-primary focus-visible:ring-1",
        active
          ? "text-text-primary border-white/20 bg-white/10"
          : "text-text-tertiary hover:text-text-secondary border-white/5 hover:bg-white/5"
      )}
    >
      {accent !== undefined ? (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 rounded-full",
            active ? accent : "bg-white/20"
          )}
        />
      ) : null}
      {label}
      <span className="text-text-tertiary tabular-nums">{count}</span>
    </button>
  );
}

function toggleIn<T>(list: T[] | undefined, value: T): T[] | undefined {
  const current = list ?? [];
  const next = current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];

  return next.length === 0 ? undefined : next;
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

  return (
    <div className="bg-bg-secondary/85 sticky top-0 z-10 flex flex-col gap-2.5 border-b border-white/10 px-1 py-3 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          variant="filled"
          size="sm"
          className="w-full max-w-xs"
          icon={<Search className="size-3.5" />}
          placeholder="Поиск по тексту лога"
          aria-label="Поиск по тексту лога"
          value={searchDraft}
          onChange={(event) => {
            setSearchDraft(event.target.value);
          }}
        />

        <select
          aria-label="Фильтр по стратегии"
          value={filter.strategyId ?? ""}
          onChange={(event) => {
            onChange({
              strategyId:
                event.target.value === "" ? undefined : event.target.value,
            });
          }}
          className="text-text-secondary focus-visible:border-accent-primary h-8 rounded-lg border border-white/10 bg-transparent px-2 text-xs outline-none hover:border-white/20"
        >
          <option value="">Все стратегии</option>
          {strategyOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2">
            <span className="text-text-secondary text-xs">Автоскролл</span>
            <Toggle
              size="sm"
              checked={autoScroll}
              onChange={onAutoScrollChange}
              label="Автоскролл"
            />
          </span>

          <Button
            size="sm"
            variant="secondary"
            onClick={onExport}
            disabled={!canExport}
            icon={<Download className="size-3.5" />}
          >
            Экспорт
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={onClear}
            disabled={totalCount === 0}
            icon={<Trash2 className="size-3.5" />}
          >
            Очистить
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {LOG_LEVELS.map((level: LogLevel) => (
          <FilterChip
            key={level}
            label={LOG_LEVEL_LABELS[level]}
            count={levelCounts[level]}
            active={
              filter.levels === undefined || filter.levels.includes(level)
            }
            accent={LOG_LEVEL_DOT_CLASSES[level]}
            onToggle={() => {
              onChange({ levels: toggleIn(filter.levels, level) });
            }}
          />
        ))}

        <span aria-hidden="true" className="mx-1 h-4 w-px bg-white/10" />

        {LOG_SOURCES.map((source: LogSource) => (
          <FilterChip
            key={source}
            label={LOG_SOURCE_LABELS[source]}
            count={sourceCounts[source]}
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
              Сбросить фильтры
            </button>
          ) : null}

          <Badge variant="neutral">
            {shownCount === totalCount
              ? `${totalCount} записей`
              : `${shownCount} из ${totalCount}`}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default LogFilters;
