// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useMemo, useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { FolderOpen, FolderSearch, RefreshCw, Search } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/strategies/game/ScanErrorBanner.
import { ScanErrorBanner } from "@/components/strategies/game/ScanErrorBanner";
// Импортируем зависимости из модуля @/components/strategies/game/RatingFilters.
import RatingFilters from "@/components/strategies/game/RatingFilters";
// Импортируем зависимости из модуля @/components/strategies/game/StrategyCollection.
import StrategyCollection from "@/components/strategies/game/StrategyCollection";
// Импортируем зависимости из модуля @/components/strategies/game/SortDropdown.
import SortDropdown from "@/components/strategies/game/SortDropdown";
// Импортируем зависимости из модуля @/components/shared/EmptyState.
import EmptyState from "@/components/shared/EmptyState";
// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Heading, Input, Spinner, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useDebounce.
import { useDebounce } from "@/hooks/useDebounce";
// Импортируем зависимости из модуля @/hooks/useDeviceTier.
import { useDeviceTier } from "@/hooks/useDeviceTier";
// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/hooks/useFolderPicker.
import { useFolderPicker } from "@/hooks/useFolderPicker";
// Импортируем зависимости из модуля @/hooks/useMediaQuery.
import { useMediaQuery } from "@/hooks/useMediaQuery";
// Импортируем зависимости из модуля @/hooks/useProcessWatcher.
import { useProcessWatcher } from "@/hooks/useProcessWatcher";
// Импортируем зависимости из модуля @/hooks/useStrategies.
import { useStrategies } from "@/hooks/useStrategies";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/hooks/useStrategyRunner.
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { loadStrategyRatings } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/lib/constants.
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/selectors.
import { useCollectionStats, useFilteredCards } from "@/stores/selectors";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию strategiesCountKey.
function strategiesCountKey(count: number): TranslationKey {
  // Обрабатываем конструкцию: const mod10 = count % 10.
  const mod10 = count % 10;
  // Обрабатываем конструкцию: const mod100 = count % 100.
  const mod100 = count % 100;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 === 1 && mod100 !== 11.
  if (mod10 === 1 && mod100 !== 11) {
    // Возвращаем результат: strategies.page.countOne.
    return "strategies.page.countOne";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14….
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    // Возвращаем результат: strategies.page.countFew.
    return "strategies.page.countFew";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: strategies.page.countMany.
  return "strategies.page.countMany";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Strategies() {
  // Обрабатываем конструкцию: const { t, language } = useI18n().
  const { t, language } = useI18n();
  // Обрабатываем конструкцию: const strategies = useStrategiesStore((state) => state.….
  const strategies = useStrategiesStore((state) => state.strategies);
  // Обрабатываем конструкцию: const folder = useSettingsStore((state) => state.settin….
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  // Обрабатываем конструкцию: const { pickFolder } = useFolderPicker().
  const { pickFolder } = useFolderPicker();
  // Обрабатываем конструкцию: const { isLoading, error, lastScanAt, refresh } = useSt….
  const { isLoading, error, lastScanAt, refresh } = useStrategies();
  // Обрабатываем конструкцию: const { run, stop, checkStatus } = useStrategyRunner().
  const { run, stop, checkStatus } = useStrategyRunner();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const sortMode = useAppStore((state) => state.strategie….
  const sortMode = useAppStore((state) => state.strategiesSortMode);
  // Обрабатываем конструкцию: const ratingFilter = useAppStore((state) => state.strat….
  const ratingFilter = useAppStore((state) => state.strategiesRatingFilter);
  // Обрабатываем конструкцию: const serviceFilter = useAppStore((state) => state.stra….
  const serviceFilter = useAppStore((state) => state.strategiesServiceFilter);
  // Обрабатываем конструкцию: const setSortMode = useAppStore((state) => state.setStr….
  const setSortMode = useAppStore((state) => state.setStrategiesSortMode);
  // Обрабатываем конструкцию: const setRatingFilter = useAppStore( (state) => state.s….
  const setRatingFilter = useAppStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.setStrategiesRatingFilter
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const toggleService = useAppStore((state) => state.togg….
  const toggleService = useAppStore((state) => state.toggleStrategiesService);
  // Обрабатываем конструкцию: const resetFilters = useAppStore((state) => state.reset….
  const resetFilters = useAppStore((state) => state.resetStrategyFilters);
  // Обрабатываем конструкцию: const removeStrategy = useAppStore((state) => state.rem….
  const removeStrategy = useAppStore((state) => state.removeStrategy);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [search, setSearch] = useState().
  const [search, setSearch] = useState("");
  // Обрабатываем конструкцию: const [flippedId, setFlippedId] = useState<string | nul….
  const [flippedId, setFlippedId] = useState<string | null>(null);
  // Обрабатываем конструкцию: const debouncedSearch = useDebounce(search, SEARCH_DEBO….
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const cards = useFilteredCards(debouncedSearch).
  const cards = useFilteredCards(debouncedSearch);
  // Обрабатываем конструкцию: const summary = useCollectionStats().
  const summary = useCollectionStats();
  // Обрабатываем конструкцию: const tier = useDeviceTier().
  const tier = useDeviceTier();
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // Обрабатываем конструкцию: const canHover = useMediaQuery((hover: hover)).
  const canHover = useMediaQuery("(hover: hover)");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useProcessWatcher.
  useProcessWatcher(checkStatus);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const handleKeyDown = (event: KeyboardEvent): void => {….
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Проверяем бизнес-условие: event.key === Escape.
      if (event.key === "Escape") {
        // Обрабатываем конструкцию: setFlippedId.
        setFlippedId(null);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document.addEventListener("keydown", handleKeyDown);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { document.removeEventListener(keydown, handleKey….
    return () => {
      // Обрабатываем конструкцию: document.
      document.removeEventListener("keydown", handleKeyDown);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRun = useCallback( (strategy: Strategy) => ….
  const handleRun = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (strategy: Strategy) => {
      // Обрабатываем конструкцию: void run(strategy.id, strategy.path).
      void run(strategy.id, strategy.path);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [run]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleStop = useCallback( (strategy: Strategy) =>….
  const handleStop = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (strategy: Strategy) => {
      // Обрабатываем конструкцию: void stop(strategy.id, strategy.path).
      void stop(strategy.id, strategy.path);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [stop]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleFlip = useCallback((id: string) => { setFli….
  const handleFlip = useCallback((id: string) => {
    // Обрабатываем конструкцию: setFlippedId.
    setFlippedId((current) => (current === id ? null : id));
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRemove = useCallback( (id: string) => { rem….
  const handleRemove = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (id: string) => {
      // Обрабатываем конструкцию: removeStrategy.
      removeStrategy(id);
      // Обрабатываем конструкцию: setFlippedId.
      setFlippedId((current) => (current === id ? null : current));
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [removeStrategy]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleOpenFolder = useCallback(() => { if (folder….
  const handleOpenFolder = useCallback(() => {
    // Проверяем бизнес-условие: folder ===.
    if (folder === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void pickFolder().
    void pickFolder();
    // Закрываем текущий блок.
  }, [folder, pickFolder]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const showSkeletons = isLoading && strategies.length ==….
  const showSkeletons = isLoading && strategies.length === 0;
  // Обрабатываем конструкцию: const motionDisabled = reducedMotion || tier === low ||….
  const motionDisabled = reducedMotion || tier === "low" || canHover === false;
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Список сервисов для фильтра пересчитывается только при см…
  // Список сервисов для фильтра пересчитывается только при смене
  // Сохраняем пояснение разработчика: // списка стратегий, а не на каждом рендере страницы. Удалён…
  // списка стратегий, а не на каждом рендере страницы. Удалённые
  // Сохраняем пояснение разработчика: // карточки в списке сервисов не участвуют: их чипы исчезают…
  // карточки в списке сервисов не участвуют: их чипы исчезают вместе
  // Сохраняем пояснение разработчика: // с карточками, а пустые фильтры сбрасываются эффектом ниже…
  // с карточками, а пустые фильтры сбрасываются эффектом ниже.
  // Обрабатываем конструкцию: const removedIds = useAppStore((state) => state.removed….
  const removedIds = useAppStore((state) => state.removedStrategyIds);
  // Обрабатываем конструкцию: const services = useMemo( () => Array.from( new Set( st….
  const services = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: Array.
      Array.from(
        // Создаём экземпляр Set.
        new Set(
          // Обрабатываем конструкцию: strategies.
          strategies
            // Продолжаем цепочку вызовов.
            .filter((strategy) => !removedIds.includes(strategy.id))
            // Продолжаем цепочку вызовов.
            .flatMap((strategy) => strategy.services)
          // Закрываем выражение или список аргументов.
        )
        // Закрываем выражение или список аргументов.
      ),
    // Открываем массив.
    [strategies, removedIds]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Сервисный фильтр, оставшийся без единой стратегии (карточ…
  // Сервисный фильтр, оставшийся без единой стратегии (карточку удалили),
  // Сохраняем пояснение разработчика: // сбрасывается сам: иначе пустой экран «ничего не найдено» …
  // сбрасывается сам: иначе пустой экран «ничего не найдено» держится,
  // Сохраняем пояснение разработчика: // пока пользователь не догадается нажать «Сбросить фильтры»…
  // пока пользователь не догадается нажать «Сбросить фильтры».
  // Обрабатываем конструкцию: const pruneService = useAppStore((state) => state.prune….
  const pruneService = useAppStore((state) => state.pruneStrategiesService);
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: pruneService.
    pruneService(services);
    // Закрываем текущий блок.
  }, [pruneService, services]);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Загружаем рейтинги после первого сканирования и потом — к…
  // Загружаем рейтинги после первого сканирования и потом — когда
  // Сохраняем пояснение разработчика: // список стратегий меняется (например, после добавления пап…
  // список стратегий меняется (например, после добавления папки).
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: strategies.length === 0.
    if (strategies.length === 0) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void loadStrategyRatings( strategies.map((strategy) => ….
    void loadStrategyRatings(
      // Обрабатываем конструкцию: strategies.
      strategies.map((strategy) => ({
        // Обрабатываем конструкцию: id.
        id: strategy.id,
        // Обрабатываем конструкцию: path.
        path: strategy.path,
        // Закрываем текущий блок.
      }))
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }, [strategies]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <section className=flex flex-col gap-6> <header class….
  return (
    // Обрабатываем конструкцию: <section className=flex flex-col gap-6>.
    <section className="flex flex-col gap-6">
      {/* Выводим текстовое содержимое в JSX. */}
      <header className="flex flex-col gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Heading level={1}>{t("strategies.page.title")}</Heading>
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="lg" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("strategies.page.subtitle")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </header>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: variant.
            variant="secondary"
            // Обрабатываем конструкцию: icon.
            icon={
              // Рендерим самозакрывающийся элемент FolderOpen.
              <FolderOpen
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-4"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: void pickFolder().
              void pickFolder();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.page.chooseFolder")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: variant.
            variant="ghost"
            // Обрабатываем конструкцию: icon.
            icon={
              // Рендерим самозакрывающийся элемент RefreshCw.
              <RefreshCw
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-4"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: disabled.
            disabled={isLoading || folder === ""}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: void refresh().
              void refresh();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.page.refresh")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Input
            // Задаём атрибут data-focus-quiet элемента.
            data-focus-quiet
            // Обрабатываем конструкцию: variant.
            variant="filled"
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: className.
            className="max-w-xs"
            // Обрабатываем конструкцию: icon.
            icon={<Search className="size-3.5" />}
            // Обрабатываем конструкцию: placeholder.
            placeholder={t("strategies.page.searchPlaceholder")}
            // Обрабатываем конструкцию: aria-label.
            aria-label={t("strategies.page.searchAria")}
            // Обрабатываем конструкцию: value.
            value={search}
            // Обрабатываем конструкцию: onChange.
            onChange={(event) => {
              // Обрабатываем конструкцию: setSearch.
              setSearch(event.target.value);
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <SortDropdown value={sortMode} onChange={setSortMode} />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Badge variant={strategies.length > 0 ? "neutral" : "warning"}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t(strategiesCountKey(strategies.length), {
              // Обрабатываем конструкцию: count.
              count: strategies.length,
              // Закрываем текущий блок.
            })}
            {/* Выводим текстовое содержимое в JSX. */}
          </Badge>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {isLoading && strategies.length > 0 ? <Spinner size="sm" /> : null}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <RatingFilters
            // Обрабатываем конструкцию: summary.
            summary={summary}
            // Обрабатываем конструкцию: ratingFilter.
            ratingFilter={ratingFilter}
            // Обрабатываем конструкцию: serviceFilter.
            serviceFilter={serviceFilter}
            // Обрабатываем конструкцию: services.
            services={services}
            // Обрабатываем конструкцию: onFilterChange.
            onFilterChange={setRatingFilter}
            // Обрабатываем конструкцию: onToggleService.
            onToggleService={toggleService}
            // Обрабатываем конструкцию: onReset.
            onReset={resetFilters}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          {lastScanAt !== null && !isLoading ? (
            // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-text-terti….
            <Text
              // Обрабатываем конструкцию: variant.
              variant="caption"
              // Обрабатываем конструкцию: size.
              size="sm"
              // Обрабатываем конструкцию: className.
              className="text-text-tertiary ml-auto"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("strategies.page.updatedAt", {
                // Обрабатываем конструкцию: time.
                time: new Date(lastScanAt).toLocaleTimeString(
                  // Обрабатываем конструкцию: language.
                  language === "ru" ? "ru-RU" : "en-US"
                  // Закрываем выражение или список аргументов.
                ),
                // Закрываем текущий блок.
              })}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {folder !== "" ? (
          // Обрабатываем конструкцию: <Text variant=mono size=sm className=text-text-tertiary….
          <Text
            // Обрабатываем конструкцию: variant.
            variant="mono"
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: className.
            className="text-text-tertiary block truncate"
            // Обрабатываем конструкцию: title.
            title={folder}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {folder}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {error !== null ? (
          // Рендерим самозакрывающийся элемент ScanErrorBanner.
          <ScanErrorBanner
            // Обрабатываем конструкцию: message.
            message={error}
            // Обрабатываем конструкцию: onRetry.
            onRetry={() => {
              // Обрабатываем конструкцию: void refresh().
              void refresh();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
      {showSkeletons ? (
        // Обрабатываем конструкцию: <div className=grid grid-cols-1 gap-4 sm:grid-cols-2 lg….
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Выводим текстовое содержимое в JSX. */}
          {Array.from({ length: 8 }, (_, index) => (
            // Рендерим самозакрывающийся элемент div.
            <div
              // Обрабатываем конструкцию: key.
              key={index}
              // Обрабатываем конструкцию: className.
              className="border-glass-border bg-glass-bg h-[400px] animate-pulse rounded-xl border"
              // Продолжаем выражение.
            />
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {!showSkeletons && strategies.length === 0 && error === null ? (
        // Рендерим самозакрывающийся элемент EmptyState.
        <EmptyState
          // Обрабатываем конструкцию: icon.
          icon={
            // Обрабатываем конструкцию: folder.
            folder === "" ? (
              // Рендерим самозакрывающийся элемент FolderOpen.
              <FolderOpen
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-7"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
            ) : (
              // Продолжаем предыдущую конструкцию.
              // Закрываем выражение или список аргументов.
              // Рендерим самозакрывающийся элемент FolderSearch.
              <FolderSearch
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="size-7"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
              // Закрываем выражение или список аргументов.
            )
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: title.
          title={
            // Обрабатываем конструкцию: folder.
            folder === ""
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("strategies.empty.noFolderTitle")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("strategies.empty.noBatsTitle")
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: description.
          description={
            // Обрабатываем конструкцию: folder.
            folder === ""
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("strategies.empty.noFolderDesc")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("strategies.empty.noBatsDesc", { folder })
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: action.
          action={{
            // Обрабатываем конструкцию: label.
            label:
              // Обрабатываем конструкцию: folder.
              folder === ""
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  t("strategies.empty.chooseFolder")
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("strategies.empty.chooseAnother"),
            // Обрабатываем конструкцию: onClick.
            onClick: () => {
              // Обрабатываем конструкцию: void pickFolder().
              void pickFolder();
              // Закрываем текущий блок.
            },
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {!showSkeletons && strategies.length > 0 && cards.length === 0 ? (
        // Рендерим самозакрывающийся элемент EmptyState.
        <EmptyState
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Search.
            <Search aria-hidden="true" className="size-7" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: title.
          title={t("strategies.empty.notFoundTitle")}
          // Обрабатываем конструкцию: description.
          description={t("strategies.empty.notFoundDesc")}
          // Обрабатываем конструкцию: action.
          action={{
            // Обрабатываем конструкцию: label.
            label: t("strategies.empty.resetFilters"),
            // Обрабатываем конструкцию: onClick.
            onClick: () => {
              // Обрабатываем конструкцию: setSearch.
              setSearch("");
              // Обрабатываем конструкцию: resetFilters.
              resetFilters();
              // Закрываем текущий блок.
            },
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <StrategyCollection
        // Обрабатываем конструкцию: cards.
        cards={cards}
        // Обрабатываем конструкцию: flippedId.
        flippedId={flippedId}
        // Обрабатываем конструкцию: motionDisabled.
        motionDisabled={motionDisabled}
        // Обрабатываем конструкцию: onFlip.
        onFlip={handleFlip}
        // Обрабатываем конструкцию: onRun.
        onRun={handleRun}
        // Обрабатываем конструкцию: onStop.
        onStop={handleStop}
        // Обрабатываем конструкцию: onOpenFolder.
        onOpenFolder={handleOpenFolder}
        // Обрабатываем конструкцию: onRemove.
        onRemove={handleRemove}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
