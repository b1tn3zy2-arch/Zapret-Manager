// Импортируем зависимости из модуля @/components/ui/FilterChip.
import FilterChip from "@/components/ui/FilterChip";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/format.
import { capitalizeService } from "@/lib/format";
// Импортируем зависимости из модуля @/types.
import type { RatingFilterMode, ServiceType } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface RatingFiltersProps {
  // Обрабатываем конструкцию: summary.
  summary: { total: number; measured: number; unmeasured: number };
  // Обрабатываем конструкцию: ratingFilter.
  ratingFilter: RatingFilterMode;
  // Обрабатываем конструкцию: serviceFilter.
  serviceFilter: string[];
  // Обрабатываем конструкцию: services.
  services: ServiceType[];
  // Обрабатываем конструкцию: onFilterChange.
  onFilterChange: (mode: RatingFilterMode) => void;
  // Обрабатываем конструкцию: onToggleService.
  onToggleService: (service: string) => void;
  // Обрабатываем конструкцию: onReset.
  onReset: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const RATINGS: readonly { value: RatingFilterMode; key:….
const RATINGS: readonly {
  // Обрабатываем конструкцию: value.
  value: RatingFilterMode;
  // Обрабатываем конструкцию: key.
  key: TranslationKey;
  // Закрываем текущий блок.
}[] = [
  // Открываем объектный литерал.
  { value: "all", key: "strategies.filters.ratingAll" },
  // Открываем объектный литерал.
  { value: "measured", key: "strategies.filters.ratingMeasured" },
  // Открываем объектный литерал.
  { value: "unmeasured", key: "strategies.filters.ratingUnmeasured" },
  // Закрываем массив или список.
];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function RatingFilters({
  // Обрабатываем конструкцию: summary.
  summary,
  // Обрабатываем конструкцию: ratingFilter.
  ratingFilter,
  // Обрабатываем конструкцию: serviceFilter.
  serviceFilter,
  // Обрабатываем конструкцию: services.
  services,
  // Обрабатываем конструкцию: onFilterChange.
  onFilterChange,
  // Обрабатываем конструкцию: onToggleService.
  onToggleService,
  // Обрабатываем конструкцию: onReset.
  onReset,
  // Закрываем текущий блок.
}: RatingFiltersProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const counts = { all: summary.total, measured: summary.….
  const counts = {
    // Обрабатываем конструкцию: all.
    all: summary.total,
    // Обрабатываем конструкцию: measured.
    measured: summary.measured,
    // Обрабатываем конструкцию: unmeasured.
    unmeasured: summary.unmeasured,
    // Закрываем текущий блок.
  } satisfies Record<RatingFilterMode, number>;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-wrap items-center gap-2> {RA….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-wrap items-center gap-2>.
    <div className="flex flex-wrap items-center gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      {RATINGS.map((item) => (
        // Рендерим самозакрывающийся элемент FilterChip.
        <FilterChip
          // Обрабатываем конструкцию: key.
          key={item.value}
          // Обрабатываем конструкцию: label.
          label={t(item.key)}
          // Обрабатываем конструкцию: count.
          count={counts[item.value]}
          // Обрабатываем конструкцию: active.
          active={ratingFilter === item.value}
          // Обрабатываем конструкцию: onToggle.
          onToggle={() => {
            // Обрабатываем конструкцию: onFilterChange.
            onFilterChange(item.value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      ))}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {services.map((service) => (
        // Рендерим самозакрывающийся элемент FilterChip.
        <FilterChip
          // Обрабатываем конструкцию: key.
          key={service}
          // Обрабатываем конструкцию: label.
          label={capitalizeService(service)}
          // Обрабатываем конструкцию: active.
          active={serviceFilter.includes(service)}
          // Обрабатываем конструкцию: onToggle.
          onToggle={() => {
            // Обрабатываем конструкцию: onToggleService.
            onToggleService(service);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      ))}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {ratingFilter !== "all" || serviceFilter.length > 0 ? (
        // Рендерим самозакрывающийся элемент FilterChip.
        <FilterChip
          // Обрабатываем конструкцию: label.
          label={t("strategies.filters.reset")}
          // Обрабатываем конструкцию: active.
          active={false}
          // Обрабатываем конструкцию: onToggle.
          onToggle={onReset}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
