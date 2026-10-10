import { useCallback, useEffect, useState } from "react";
import { FolderOpen, FolderSearch, RefreshCw, Search } from "lucide-react";

import CollectionStats from "@/components/strategies/game/CollectionStats";
import { ScanErrorBanner } from "@/components/strategies/game/ScanErrorBanner";
import RarityFilters from "@/components/strategies/game/RarityFilters";
import StrategyCollection from "@/components/strategies/game/StrategyCollection";
import SortDropdown from "@/components/strategies/game/SortDropdown";
import ViewModeToggle from "@/components/strategies/game/ViewModeToggle";
import EmptyState from "@/components/strategies/EmptyState";
import { Badge, Button, Heading, Input, Spinner, Text } from "@/components/ui";
import { useCardDealAnimation } from "@/hooks/useCardDealAnimation";
import { useDebounce } from "@/hooks/useDebounce";
import { useDeviceTier, usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import { useFolderPicker } from "@/hooks/useFolderPicker";
import { useProcessWatcher } from "@/hooks/useProcessWatcher";
import { useStrategies } from "@/hooks/useStrategies";
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
import { CARD_TILT_CARD_LIMIT, SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { formatCount } from "@/lib/format";
import { useAppStore } from "@/stores/useAppStore";
import { useCollectionStats, useFilteredCards } from "@/stores/selectors";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import type { Strategy } from "@/types";

export default function Strategies() {
  const strategies = useStrategiesStore((state) => state.strategies);
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const { pickFolder } = useFolderPicker();
  const { isLoading, error, lastScanAt, refresh } = useStrategies();
  const { run, stop, checkStatus } = useStrategyRunner();

  const viewMode = useAppStore((state) => state.strategiesViewMode);
  const sortMode = useAppStore((state) => state.strategiesSortMode);
  const rarityFilter = useAppStore((state) => state.strategiesRarityFilter);
  const serviceFilter = useAppStore((state) => state.strategiesServiceFilter);
  const setViewMode = useAppStore((state) => state.setStrategiesViewMode);
  const setSortMode = useAppStore((state) => state.setStrategiesSortMode);
  const toggleRarity = useAppStore((state) => state.toggleStrategiesRarity);
  const toggleService = useAppStore((state) => state.toggleStrategiesService);
  const resetFilters = useAppStore((state) => state.resetStrategyFilters);

  const [search, setSearch] = useState("");
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);

  const cards = useFilteredCards(debouncedSearch);
  const summary = useCollectionStats();
  const tier = useDeviceTier();
  const reducedMotion = usePrefersReducedMotion();
  const { containerVariants, cardVariants } =
    useCardDealAnimation(reducedMotion);

  useProcessWatcher(checkStatus);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setFlippedId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRun = useCallback(
    (strategy: Strategy) => {
      void run(strategy.id, strategy.path);
    },
    [run]
  );

  const handleStop = useCallback(
    (strategy: Strategy) => {
      void stop(strategy.id, strategy.path);
    },
    [stop]
  );

  const handleFlip = useCallback((id: string) => {
    setFlippedId((current) => (current === id ? null : id));
  }, []);

  const handleOpenFolder = useCallback(() => {
    if (folder === "") {
      return;
    }

    void pickFolder();
  }, [folder, pickFolder]);

  const showSkeletons = isLoading && strategies.length === 0;
  const tiltDisabled =
    reducedMotion || tier === "low" || cards.length > CARD_TILT_CARD_LIMIT;
  const particlesDisabled = reducedMotion || tier !== "high";

  const services = Array.from(
    new Set(strategies.flatMap((strategy) => strategy.services))
  );

  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <Heading level={1}>Стратегии</Heading>
        <Text variant="body" size="lg" className="text-text-secondary">
          Коллекция карт обхода блокировок
        </Text>
      </header>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            icon={
              <FolderOpen
                aria-hidden="true"
                className="size-4"
                strokeWidth={2}
              />
            }
            onClick={() => {
              void pickFolder();
            }}
          >
            Выбрать папку
          </Button>

          <Button
            variant="ghost"
            icon={
              <RefreshCw
                aria-hidden="true"
                className="size-4"
                strokeWidth={2}
              />
            }
            disabled={isLoading || folder === ""}
            onClick={() => {
              void refresh();
            }}
          >
            Обновить
          </Button>

          <Input
            variant="filled"
            size="sm"
            className="max-w-xs"
            icon={<Search className="size-3.5" />}
            placeholder="Поиск по названию"
            aria-label="Поиск стратегии по названию"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
            }}
          />

          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <SortDropdown value={sortMode} onChange={setSortMode} />

          <Badge variant={strategies.length > 0 ? "neutral" : "warning"}>
            {formatCount(
              strategies.length,
              "стратегия",
              "стратегии",
              "стратегий"
            )}
          </Badge>

          {isLoading && strategies.length > 0 ? <Spinner size="sm" /> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <RarityFilters
            summary={summary}
            rarityFilter={rarityFilter}
            serviceFilter={serviceFilter}
            services={services}
            onToggleRarity={toggleRarity}
            onToggleService={toggleService}
            onReset={resetFilters}
          />
          {lastScanAt !== null && !isLoading ? (
            <Text
              variant="caption"
              size="sm"
              className="text-text-tertiary ml-auto"
            >
              Обновлено в {new Date(lastScanAt).toLocaleTimeString("ru-RU")}
            </Text>
          ) : null}
        </div>

        {folder !== "" ? (
          <Text
            variant="mono"
            size="sm"
            className="text-text-tertiary block truncate"
            title={folder}
          >
            {folder}
          </Text>
        ) : null}

        {error !== null ? (
          <ScanErrorBanner
            message={error}
            onRetry={() => {
              void refresh();
            }}
          />
        ) : null}

        {strategies.length > 0 ? <CollectionStats summary={summary} /> : null}
      </div>
      {showSkeletons ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="border-glass-border bg-glass-bg h-[400px] animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : null}

      {!showSkeletons && strategies.length === 0 && error === null ? (
        <EmptyState
          icon={
            folder === "" ? (
              <FolderOpen
                aria-hidden="true"
                className="size-7"
                strokeWidth={2}
              />
            ) : (
              <FolderSearch
                aria-hidden="true"
                className="size-7"
                strokeWidth={2}
              />
            )
          }
          title={folder === "" ? "Папка не выбрана" : "В папке нет .bat файлов"}
          description={
            folder === ""
              ? "Укажите папку с .bat-файлами zapret, чтобы собрать коллекцию карт."
              : `По пути ${folder} не найдено ни одного .bat файла. Проверьте папку или выберите другую.`
          }
          action={{
            label: folder === "" ? "Выбрать папку" : "Выбрать другую папку",
            onClick: () => {
              void pickFolder();
            },
          }}
        />
      ) : null}

      {!showSkeletons && strategies.length > 0 && cards.length === 0 ? (
        <EmptyState
          icon={
            <Search aria-hidden="true" className="size-7" strokeWidth={2} />
          }
          title="Ничего не найдено"
          description="Под текущие фильтры не подошла ни одна карта"
          action={{
            label: "Сбросить фильтры",
            onClick: () => {
              setSearch("");
              resetFilters();
            },
          }}
        />
      ) : null}
      <StrategyCollection
        cards={cards}
        viewMode={viewMode}
        flippedId={flippedId}
        tiltDisabled={tiltDisabled}
        particlesDisabled={particlesDisabled}
        motionDisabled={reducedMotion}
        containerVariants={containerVariants}
        cardVariants={cardVariants}
        onFlip={handleFlip}
        onRun={handleRun}
        onStop={handleStop}
        onOpenFolder={handleOpenFolder}
      />
    </section>
  );
}
