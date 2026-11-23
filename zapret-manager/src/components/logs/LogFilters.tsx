// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля react.
import { useEffect, useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { Download, Search, Trash2, X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/Dropdown.
import Dropdown from "@/components/ui/Dropdown";
// Импортируем зависимости из модуля @/components/ui.
import {
  // Подключаем именованный импорт Badge.
  Badge,
  // Подключаем именованный импорт Button.
  Button,
  // Подключаем именованный импорт FilterChip.
  FilterChip,
  // Подключаем именованный импорт Input.
  Input,
  // Подключаем именованный импорт Toggle.
  Toggle,
  // Подключаем именованный импорт type FilterChipVariant.
  type FilterChipVariant,
  // Закрываем текущий блок.
} from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useDebounce.
import { useDebounce } from "@/hooks/useDebounce";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт LOG_LEVELS.
  LOG_LEVELS,
  // Подключаем именованный импорт LOG_LEVEL_LABELS.
  LOG_LEVEL_LABELS,
  // Подключаем именованный импорт LOG_SOURCES.
  LOG_SOURCES,
  // Подключаем именованный импорт LOG_SOURCE_LABELS.
  LOG_SOURCE_LABELS,
  // Подключаем именованный импорт SEARCH_DEBOUNCE_MS.
  SEARCH_DEBOUNCE_MS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/selectors/useLogSelectors.
import type {
  // Подключаем именованный импорт LevelCounts.
  LevelCounts,
  // Подключаем именованный импорт SourceCounts.
  SourceCounts,
  // Закрываем текущий блок.
} from "@/stores/selectors/useLogSelectors";
// Импортируем зависимости из модуля @/types.
import type { LogFilter, LogLevel, LogSource } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyOption {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LogFiltersProps {
  // Обрабатываем конструкцию: filter.
  filter: LogFilter;
  // Обрабатываем конструкцию: onChange.
  onChange: (patch: Partial<LogFilter>) => void;
  // Обрабатываем конструкцию: onReset.
  onReset: () => void;
  // Обрабатываем конструкцию: levelCounts.
  levelCounts: LevelCounts;
  // Обрабатываем конструкцию: sourceCounts.
  sourceCounts: SourceCounts;
  // Обрабатываем конструкцию: strategyOptions.
  strategyOptions: StrategyOption[];
  // Обрабатываем конструкцию: autoScroll.
  autoScroll: boolean;
  // Обрабатываем конструкцию: onAutoScrollChange.
  onAutoScrollChange: (value: boolean) => void;
  // Обрабатываем конструкцию: onExport.
  onExport: () => void;
  // Обрабатываем конструкцию: onClear.
  onClear: () => void;
  // Обрабатываем конструкцию: canExport.
  canExport: boolean;
  // Обрабатываем конструкцию: filterActive.
  filterActive: boolean;
  // Обрабатываем конструкцию: totalCount.
  totalCount: number;
  // Обрабатываем конструкцию: shownCount.
  shownCount: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LEVEL_VARIANTS = { debug: debug, info: info, succ….
const LEVEL_VARIANTS = {
  // Обрабатываем конструкцию: debug.
  debug: "debug",
  // Обрабатываем конструкцию: info.
  info: "info",
  // Обрабатываем конструкцию: success.
  success: "success",
  // Обрабатываем конструкцию: warn.
  warn: "warn",
  // Обрабатываем конструкцию: error.
  error: "error",
  // Закрываем текущий блок.
} as const satisfies Record<LogLevel, FilterChipVariant>;
// — разделитель логических блоков —

// Объявляем функцию toggleIn.
function toggleIn<T>(list: T[] | undefined, value: T): T[] | undefined {
  // Обрабатываем конструкцию: const current = list ?? [].
  const current = list ?? [];
  // Обрабатываем конструкцию: const next = current.includes(value) ? current.filter((….
  const next = current.includes(value)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      current.filter((item) => item !== value)
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      [...current, value];
  // — разделитель логических блоков —

  // Возвращаем результат: next.length === 0 ? undefined : next.
  return next.length === 0 ? undefined : next;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию entriesCountKey.
function entriesCountKey(count: number): TranslationKey {
  // Обрабатываем конструкцию: const mod10 = count % 10.
  const mod10 = count % 10;
  // Обрабатываем конструкцию: const mod100 = count % 100.
  const mod100 = count % 100;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 === 1 && mod100 !== 11.
  if (mod10 === 1 && mod100 !== 11) {
    // Возвращаем результат: logs.countOne.
    return "logs.countOne";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14….
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    // Возвращаем результат: logs.countFew.
    return "logs.countFew";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: logs.countMany.
  return "logs.countMany";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию LogFilters.
function LogFilters({
  // Обрабатываем конструкцию: filter.
  filter,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: onReset.
  onReset,
  // Обрабатываем конструкцию: levelCounts.
  levelCounts,
  // Обрабатываем конструкцию: sourceCounts.
  sourceCounts,
  // Обрабатываем конструкцию: strategyOptions.
  strategyOptions,
  // Обрабатываем конструкцию: autoScroll.
  autoScroll,
  // Обрабатываем конструкцию: onAutoScrollChange.
  onAutoScrollChange,
  // Обрабатываем конструкцию: onExport.
  onExport,
  // Обрабатываем конструкцию: onClear.
  onClear,
  // Обрабатываем конструкцию: canExport.
  canExport,
  // Обрабатываем конструкцию: filterActive.
  filterActive,
  // Обрабатываем конструкцию: totalCount.
  totalCount,
  // Обрабатываем конструкцию: shownCount.
  shownCount,
  // Закрываем текущий блок.
}: LogFiltersProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [searchDraft, setSearchDraft] = useState(filter.s….
  const [searchDraft, setSearchDraft] = useState(filter.search ?? "");
  // Обрабатываем конструкцию: const debouncedSearch = useDebounce(searchDraft, SEARCH….
  const debouncedSearch = useDebounce(searchDraft, SEARCH_DEBOUNCE_MS);
  // Обрабатываем конструкцию: const committedSearch = filter.search ??.
  const committedSearch = filter.search ?? "";
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const trimmed = debouncedSearch.trim().
    const trimmed = debouncedSearch.trim();
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: trimmed === committedSearch.
    if (trimmed === committedSearch) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: onChange.
    onChange({ search: trimmed === "" ? undefined : trimmed });
    // Закрываем текущий блок.
  }, [debouncedSearch, committedSearch, onChange]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const strategyValue = filter.strategyId ??.
  const strategyValue = filter.strategyId ?? "";
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-2.5> <div className=….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-2.5>.
    <div className="flex flex-col gap-2.5">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <Input
          // Задаём атрибут data-focus-quiet элемента.
          data-focus-quiet
          // Обрабатываем конструкцию: variant.
          variant="filled"
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: className.
          className="w-full max-w-xs"
          // Обрабатываем конструкцию: icon.
          icon={<Search className="size-3.5" />}
          // Обрабатываем конструкцию: placeholder.
          placeholder={t("logs.searchPlaceholder")}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("logs.searchPlaceholder")}
          // Обрабатываем конструкцию: value.
          value={searchDraft}
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: setSearchDraft.
            setSearchDraft(event.target.value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Dropdown
          // Обрабатываем конструкцию: label.
          label={t("logs.filterStrategy")}
          // Обрабатываем конструкцию: value.
          value={strategyValue}
          // Обрабатываем конструкцию: options.
          options={[
            // Открываем объектный литерал.
            { value: "", label: t("logs.allStrategies") },
            // Разворачиваем ...strategyOptions.map((option) => ({ value: … в коллекцию.
            ...strategyOptions.map((option) => ({
              // Обрабатываем конструкцию: value.
              value: option.id,
              // Обрабатываем конструкцию: label.
              label: option.name,
              // Закрываем текущий блок.
            })),
            // Закрываем массив или список.
          ]}
          // Обрабатываем конструкцию: onChange.
          onChange={(value) => {
            // Обрабатываем конструкцию: onChange.
            onChange({ strategyId: value === "" ? undefined : value });
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="flex items-center gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-secondary text-xs">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("logs.autoScroll")}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
            <Toggle
              // Обрабатываем конструкцию: size.
              size="sm"
              // Обрабатываем конструкцию: checked.
              checked={autoScroll}
              // Обрабатываем конструкцию: onChange.
              onChange={onAutoScrollChange}
              // Обрабатываем конструкцию: label.
              label={t("logs.autoScroll")}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="secondary"
            // Обрабатываем конструкцию: onClick.
            onClick={onExport}
            // Обрабатываем конструкцию: disabled.
            disabled={!canExport}
            // Обрабатываем конструкцию: icon.
            icon={<Download className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("logs.export")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: onClick.
            onClick={onClear}
            // Обрабатываем конструкцию: disabled.
            disabled={totalCount === 0}
            // Обрабатываем конструкцию: icon.
            icon={<Trash2 className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("logs.clear")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-center gap-1.5">
        {/* Выводим текстовое содержимое в JSX. */}
        {LOG_LEVELS.map((level: LogLevel) => (
          // Рендерим самозакрывающийся элемент FilterChip.
          <FilterChip
            // Обрабатываем конструкцию: key.
            key={level}
            // Обрабатываем конструкцию: label.
            label={t(LOG_LEVEL_LABELS[level])}
            // Обрабатываем конструкцию: count.
            count={levelCounts[level]}
            // Обрабатываем конструкцию: variant.
            variant={LEVEL_VARIANTS[level]}
            // Обрабатываем конструкцию: active.
            active={
              // Обрабатываем конструкцию: filter.
              filter.levels === undefined || filter.levels.includes(level)
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: onToggle.
            onToggle={() => {
              // Обрабатываем конструкцию: onChange.
              onChange({ levels: toggleIn(filter.levels, level) });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем выражение или список аргументов.
        ))}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <span aria-hidden="true" className="bg-glass-hover mx-1 h-4 w-px" />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {LOG_SOURCES.map((source: LogSource) => (
          // Рендерим самозакрывающийся элемент FilterChip.
          <FilterChip
            // Обрабатываем конструкцию: key.
            key={source}
            // Обрабатываем конструкцию: label.
            label={t(LOG_SOURCE_LABELS[source])}
            // Обрабатываем конструкцию: count.
            count={sourceCounts[source]}
            // Обрабатываем конструкцию: variant.
            variant="neutral"
            // Обрабатываем конструкцию: active.
            active={
              // Обрабатываем конструкцию: filter.
              filter.sources === undefined || filter.sources.includes(source)
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: onToggle.
            onToggle={() => {
              // Обрабатываем конструкцию: onChange.
              onChange({ sources: toggleIn(filter.sources, source) });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем выражение или список аргументов.
        ))}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="ml-auto flex items-center gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          {filterActive ? (
            // Обрабатываем конструкцию: <button type=button onClick={onReset} className=text-te….
            <button
              // Обрабатываем конструкцию: type.
              type="button"
              // Обрабатываем конструкцию: onClick.
              onClick={onReset}
              // Обрабатываем конструкцию: className.
              className="text-text-tertiary hover:text-text-primary flex items-center gap-1 text-xs transition-colors"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <X className="size-3" />
              {/* Выводим текстовое содержимое в JSX. */}
              {t("logs.resetFilters")}
              {/* Выводим текстовое содержимое в JSX. */}
            </button>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Badge variant="neutral">
            {/* Выводим текстовое содержимое в JSX. */}
            {shownCount === totalCount
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t(entriesCountKey(totalCount), { count: totalCount })
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("logs.countShown", { shown: shownCount, total: totalCount })}
            {/* Выводим текстовое содержимое в JSX. */}
          </Badge>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LogFilters;.
export default LogFilters;
// — разделитель логических блоков —
