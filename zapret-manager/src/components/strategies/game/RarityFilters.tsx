import { useI18n } from "@/i18n";
import { RARITY_ORDER, getRarityLabel } from "@/lib/rarity";
import { cn } from "@/lib/utils";
import type { CollectionSummary, Rarity, ServiceType } from "@/types";

export interface RarityFiltersProps {
  summary: CollectionSummary;
  rarityFilter: Rarity[];
  serviceFilter: string[];
  services: ServiceType[];
  onToggleRarity: (rarity: Rarity) => void;
  onToggleService: (service: string) => void;
  onReset: () => void;
}

const ACTIVE_RARITY =
  "border-accent-primary bg-accent-primary/10 text-accent-primary rounded-full border px-2.5 py-1 text-xs font-medium transition-colors";
const ACTIVE_SERVICE =
  "border-accent-secondary bg-accent-secondary/10 text-accent-secondary rounded-full border px-2.5 py-1 text-xs font-medium transition-colors";
const IDLE =
  "border-glass-border text-text-tertiary hover:text-text-secondary hover:bg-glass-hover rounded-full border px-2.5 py-1 text-xs transition-colors";

function RarityFilters({
  summary,
  rarityFilter,
  serviceFilter,
  services,
  onToggleRarity,
  onToggleService,
  onReset,
}: RarityFiltersProps) {
  const { t } = useI18n();
  const isActive = rarityFilter.length > 0 || serviceFilter.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {RARITY_ORDER.map((rarity) => (
        <button
          key={rarity}
          type="button"
          aria-pressed={rarityFilter.includes(rarity)}
          onClick={() => {
            onToggleRarity(rarity);
          }}
          className={cn(rarityFilter.includes(rarity) ? ACTIVE_RARITY : IDLE)}
        >
          {getRarityLabel(rarity)}
          <span className="ml-1 tabular-nums">{summary[rarity]}</span>
        </button>
      ))}

      {services.map((service) => (
        <button
          key={service}
          type="button"
          aria-pressed={serviceFilter.includes(service)}
          onClick={() => {
            onToggleService(service);
          }}
          className={cn(
            serviceFilter.includes(service) ? ACTIVE_SERVICE : IDLE
          )}
        >
          {service}
        </button>
      ))}

      {isActive ? (
        <button
          type="button"
          onClick={onReset}
          className="text-text-tertiary hover:text-text-primary text-xs transition-colors"
        >
          {t("strategies.empty.resetFilters")}
        </button>
      ) : null}
    </div>
  );
}

export default RarityFilters;
