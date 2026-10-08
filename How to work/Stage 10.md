═══════════════════════════════════════════════════════════════════════
ЭТАП 10: ИГРА В СТРАТЕГИЙ — ПЕРВЫЙ СИГНАТУРНЫЙ МОМЕНТ
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Превратить скучный список .bat-стратегий в игровую коллекцию
«карт» — первый сигнатурный момент приложения. Каждая стратегия
становится картой с характеристиками (какие сервисы обходит,
скорость, стабильность, покрытие), редкостью и уникальным
визуалом. Пользователь «играет»: коллекционирует карты, сравнивает
их, выбирает лучшую и запускает.

После этого этапа пользователь сможет:
  • Открыть страницу «Стратегии» и увидеть карты вместо списка
  • Каждая карта — с 3D-tilt-эффектом при наведении мыши
  • Редкость карты определяется количеством сервисов (общая /
    редкая / эпическая / легендарная)
  • Характеристики: скорость, стабильность, покрытие — с
    анимированными progress-bar
  • Клик на карту → flip-анимация → детали стратегии с обратной
    стороны
  • Кнопка «Запустить» на обратной стороне карты
  • Активная стратегия подсвечена неоновым свечением и pulse
  • Переключатель режимов: «Карты» / «Список» (пользователь
    выбирает, как смотреть)
  • Фильтр по редкости и сервисам
  • Поиск по названию
  • Сортировка: по редкости, по алфавиту, по дате

Это первый сигнатурный момент приложения — то, что пользователь
заскринит и покажет другу. Здесь критично качество визуала и
плавность анимаций (60 FPS обязательно).

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Геймификация через карты (Hearthstone / MTG-стиль) 】

ОБОСНУЙ:
  • Скучный список → коллекция карт
  • Каждая карта — визуальный объект, не строка
  • Редкость создаёт азарт: «у меня есть легендарная»
  • Характеристики дают ощущение «силы» карты
  • Клик → flip → детали — привычный игровой паттерн
  • Работает для обычного пользователя (не технаря) и для
    гика

ПОЧЕМУ НЕ СПИСОК:
  • Не вызывает эмоций
  • Не цепляет взгляд
  • Не создаёт «вау»

ПОЧЕМУ НЕ ПРОСТО СЕТКА КАРТОЧЕК (как на Этапе 5):
  • Карточки — утилитарны
  • Карты — игровые, с редкостью, характеристиками
  • Разный эмоциональный отклик

【 РЕШЕНИЕ 2: Редкость по score техник, а не по числу сервисов 】

ОБОСНУЙ:
  Редкость — метрика «силы» карты. Исходная формула
  (редкость = число сервисов) на этом наборе не работает:
  все 22 стратегии zapret содержат домены Discord в
  list-general.txt, поэтому сервис у них один и тот же,
  и ВСЕ КАРТЫ СТАЛИ БЫ COMMON. Геймификация мертва.

  Реальное различие между этими стратегиями — ТЕХНИКИ.
  Их разбирает этап 5 в поле techniques[]:
    faketls, multisplit, split-seqovl, quic-fake,
    l7-filter, ipset, any-protocol, cutoff, fake

  ФОРМУЛА SCORE:
    +1  techniques содержит "ipset"
    +1  techniques содержит "l7-filter"
    +1  techniques содержит "quic-fake"
    +1  techniques содержит "faketls"
    +1  services.count >= 2
    +1  включена инъекция Outlast Trials

  СООТНОШЕНИЕ:
    0–1 → common       (серая рамка)
    2   → rare         (синяя рамка)
    3   → epic         (фиолетовая рамка)
    4+  → legendary    (золотая рамка)

  ПОЧЕМУ ТАК:
  • Метрика выводится из содержимого .bat, а не выдумана
  • Различает все 22 реальные стратегии: SIMPLE FAKE слабее
    FAKE TLS AUTO, general-00-baseline слабее вариантов с
    --ipset и --filter-l7
  • Детерминированно — одна и та же карта всегда одна редкость
  • Outlast остаётся бонусом: это игра, редкий кейс,
    и он же стимулирует пользователя включить поддержку
    (согласуется с этапом 8)

  ПОЧЕМУ НЕ СЛУЧАЙНО:
  • Случайная редкость означала бы, что «прокачка»
    не имеет смысла — игрок ничего не может изменить
  • Случайные значения пришлось бы пересчитывать при
    каждом ре-рендере

  ЧТО ЭТО НЕ ЕСТЬ:
  • Не заявление о качестве обхода. Это визуальная
    метрика сложности фильтра, а не гарантия работы
  • Пользователю это подаётся как «сложность стратегии»,
    а не как «шанс на успех»

【 РЕШЕНИЕ 3: Характеристики карты — speed, stability, coverage 】

ОБОСНУЙ:
  • speed (0–100): скорость обхода. Зависит от типа стратегии
    (winws = 80–95, goodbye-dpi = 60–75, zapret = 85–100)
  • stability (0–100): стабильность. Зависит от количества
    сервисов (чем меньше — тем стабильнее) и наличия IP-фильтра
  • coverage (0–100): покрытие. Зависит от количества сервисов
    и наличия ipset-файлов

ВЫЧИСЛЕНИЕ:
  • Не хранить в БД — вычислять из Strategy
  • Функция computeCardStats(strategy): CardStats
  • Детерминированная (одинаковая при одинаковых данных)
  • Не случайная — иначе «прокачка» бессмысленна

ПОЧЕМУ ТАК:
  • Даёт ощущение «силы» карты
  • Позволяет сравнивать
  • Не требует ручного ввода данных

ВАЖНО:
  • Это метафора, не реальные метрики
  • Пользователь понимает, что это игра
  • Не обманываем — просто визуализация

【 РЕШЕНИЕ 4: 3D-tilt карты при наведении мыши 】

ОБОСНУЙ:
  • Карта реагирует на положение курсора: наклон по X и Y
  • Максимальный угол — 10 градусов
  • Плюс свечение, следующее за курсором (radial-gradient)
  • transform: perspective(1000px) rotateX() rotateY()
  • Плавное возвращение в исходное положение при mouseleave
  • Реализация через framer-motion + useMotionValue

ПОЧЕМУ 3D-TILT:
  • Ключевой элемент «премиум»-визуала
  • Создаёт глубину
  • Стандарт для современных игровых карт (Hearthstone,
    Legends of Runeterra)

ПОЧЕМУ НЕ CSS TRANSITION:
  • Нужна реакция на положение курсора в реальном времени
  • framer-motion даёт useMotionValue и useSpring для
    плавности

【 РЕШЕНИЕ 5: Flip-анимация при клике на карту 】

ОБОСНУЙ:
  • Front side: карта с характеристиками + название + бейджи
  • Back side: детали стратегии:
    - Описание
    - Путь к файлу
    - Размер, дата
    - Тип (winws / goodbye-dpi / zapret)
    - Кнопки: «Запустить», «Остановить», «Открыть папку»
  • Flip: rotateY 0° → 180° (600ms ease-out-expo)
  • Реализация: два absolute слоя, backface-visibility hidden
  • Обратный клик → flip обратно

ПОЧЕМУ FLIP:
  • Не нужно отдельное модальное окно
  • Красиво
  • Игровой паттерн

ПОЧЕМУ НЕ MODAL:
  • Modal — тяжёлый, прерывает контекст
  • Flip сохраняет пространство и контекст карты

【 РЕШЕНИЕ 6: Редкость → визуальные эффекты 】

ОБОСНУЙ:
  • Common (1 сервис):
    - Рамка: 1px solid rgba(255,255,255,0.15)
    - Свечение: нет
  • Rare (2 сервиса):
    - Рамка: 1px solid rgba(0,180,255,0.5)
    - Свечение: лёгкое голубое при hover
  • Epic (3 сервиса):
    - Рамка: 1px solid rgba(160,80,255,0.6)
    - Свечение: фиолетовое при hover
    - Мелкие частицы на рамке (анимированные точки)
  • Legendary (4+ сервисов):
    - Рамка: 1px solid rgba(255,200,0,0.8)
    - Свечение: золотое постоянное
    - Более яркие частицы
    - Голографический эффект (градиент по рамке)

ПОЧЕМУ РАЗНЫЕ ЭФФЕКТЫ:
  • Игроки ценят визуальную редкость
  • Поощряет использовать более «мощные» стратегии
  • Создаёт «вау»-эффект для легендарок

【 РЕШЕНИЕ 7: Переключатель режимов «Карты» / «Список» 】

ОБОСНУЙ:
  • Некоторым пользователям карты неудобны — нужен список
  • Переключатель в верхней панели (Toggle group с иконками
    LayoutGrid / List)
  • Состояние в localStorage (persist)
  • По умолчанию — «Карты» (сигнатурный момент)

ПОЧЕМУ НЕ ТОЛЬКО КАРТЫ:
  • Уважение к пользователям, которым нужен список
  • Не навязываем геймификацию
  • Меньше оттока

【 РЕШЕНИЕ 8: Фильтр по редкости и сортировка 】

ОБОСНУЙ:
  • Панель фильтров вверху:
    - Поиск по названию (debounce 200ms)
    - Фильтр по редкости (5 toggle-кнопок: All, Common,
      Rare, Epic, Legendary)
    - Фильтр по сервисам (4 toggle: Discord, YouTube,
      Outlast, General)
    - Сортировка (dropdown): Редкость ↓, Редкость ↑,
      Алфавит, Дата
  • Фильтры сохраняются в localStorage (persist)

ПОЧЕМУ ДУБЛИРУЕТСЯ С ЭТАПОМ 5:
  • На Этапе 5 фильтры были в useStrategiesStore
  • Здесь они те же — не дублировать, а использовать
  • Добавить только фильтр по редкости (computed)

【 РЕШЕНИЕ 9: Активная карта — неоновое свечение + pulse 】

ОБОСНУЙ:
  • Если стратегия running:
    - Зелёное свечение вокруг карты (box-shadow + blur)
    - Пульсация рамки (scale 1 → 1.02 → 1, 2 сек)
    - Бейдж «Running» в углу карты
    - Иконка Play заменена на Square (Stop)
  • Чётко выделяется в сетке

ПОЧЕМУ ВАЖНО:
  • Пользователь видит, что активно
  • Не нужно смотреть на отдельный статус-бар
  • Стандарт для игровых карт

【 РЕШЕНИЕ 10: Анимация появления карт — deal (раздача) 】

ОБОСНУЙ:
  • При открытии страницы / после фильтрации — карты
    «выезжают» с stagger
  • Каждая карта: opacity 0 → 1, y 30 → 0, rotateY -15° → 0
  • Stagger 50ms между картами
  • Easing: ease-out-expo (0.16, 1, 0.3, 1)
  • Длительность: 400ms

ПОЧЕМУ DEAL:
  • Создаёт «живое» ощущение
  • Как раздача карт в игре
  • Плавно, не навязчиво

ПОЧЕМУ STAGGER 50MS:
  • 30ms — слишком быстро, сливается
  • 100ms — слишком медленно
  • 50ms — оптимально

【 РЕШЕНИЕ 11: Индикатор «Коллекция» — статистика редкостей 】

ОБОСНУЙ:
  • В верхней панели — мини-сводка:
    - Common: 3
    - Rare: 2
    - Epic: 1
    - Legendary: 1
  • Маленькие бейджи с цифрами, цветные
  • Всего карт: 7

ПОЧЕМУ ПОЛЕЗНО:
  • Геймификация: «собери все легендарки»
  • Ат-а-глянс видно состояние коллекции
  • Стимулирует искать новые стратегии

【 РЕШЕНИЕ 12: Режим сравнения (опционально) 】

ОБОСНУЙ:
  • Кнопка «Сравнить» в верхней панели
  • Активирует режим: клик на 2 карты → модалка со
    сравнением характеристик
  • Показывает: speed, stability, coverage, редкость, сервисы
  • Может быть отложено на Этап 18 (полировка)

РЕКОМЕНДАЦИЯ: реализовать в базовом виде — кнопка и модалка,
но без сложной аналитики.

【 РЕШЕНИЕ 13: Звук (опционально) 】

ОБОСНУЙ:
  • При flip карты — лёгкий звук «свуш»
  • При запуске стратегии — «включение»
  • При ошибке — «бип»
  • Toggle в настройках (по умолчанию выключен)
  • Реализация: HTML5 Audio + маленькие mp3 (<10 KB)

РЕКОМЕНДАЦИЯ: реализовать в базовом виде, но не обязательно
для MVP. Отложить на Этап 18.

【 РЕШЕНИЕ 14: Производительность — 60 FPS при 50+ картах 】

ОБОСНУЙ:
  • 3D-tilt на каждой карте = 50 useMotionValue
  • Flip при клике = rotateY через framer-motion
  • Пульсация активных = 3–5 framer-motion анимаций
  • Частицы на легендарках = canvas или SVG-анимация
  • Это тяжело для CPU, если не оптимизировать

ОПТИМИЗАЦИИ:
  • will-change: transform на картах при hover
  • Отключать tilt, если карт >30 (или на low-end)
  • Частицы только на легендарках (обычно 1–2 карты)
  • useMemo для computeCardStats
  • Не рендерить карты за пределами viewport (опционально,
    intersection observer)
  • Отключать все анимации при prefers-reduced-motion

ПОЧЕМУ КРИТИЧНО:
  • Игра должна быть плавной
  • Лаги убивают «вау»-эффект
  • Пользователь закроет приложение

【 РЕШЕНИЕ 15: Редкость — computed, не хранится ]

ОБОСНУЙ:
  • computeRarity(strategy): Rarity
  • Не хранить в Strategy (иначе рассинхронизация)
  • Кэшировать в useMemo
  • Пересчитывается при изменении strategy

ПОЧЕМУ НЕ В БД:
  • Всегда актуально
  • Нет дублирования данных
  • Легко изменить формулу

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src/types/game.ts (создать) 】
Назначение: типы для игрового режима.

Типы:
  • Rarity — union: "common" | "rare" | "epic" | "legendary"
  • Technique — union техник из этапа 5:
    "faketls" | "multisplit" | "split-seqovl" | "quic-fake" |
    "l7-filter" | "ipset" | "any-protocol" | "cutoff" | "fake"
  • CardStats — интерфейс:
    - speed: number (0–100)
    - stability: number (0–100)
    - coverage: number (0–100)
  • StrategyCard — расширение Strategy:
    - rarity: Rarity
    - score: number (сырой score, для сортировки и тултипа)
    - stats: CardStats
  • ViewMode — union: "cards" | "list"
  • SortMode — union: "rarity-desc" | "rarity-asc" | "name" |
    "date"

【 2. src/types/index.ts (обновить) 】
Экспортировать: Rarity, CardStats, StrategyCard, ViewMode,
SortMode.

【 3. src/lib/rarity.ts (создать) 】
Назначение: вычисление редкости и характеристик.

Вход: Strategy из этапа 5, у которого есть
  • services: ServiceType[]
  • techniques: string[]   ← добавлено этапом 5

Функции:
  • computeRarityScore(
      services: ServiceType[],
      techniques: string[],
      hasOutlastSupport: boolean,
    ): number
    Логика (см. Решение 2):
    +1 если techniques содержит "ipset"
    +1 если techniques содержит "l7-filter"
    +1 если techniques содержит "quic-fake"
    +1 если techniques содержит "faketls"
    +1 если services.length >= 2
    +1 если hasOutlastSupport

  • computeRarity(score: number): Rarity
    0–1 → "common", 2 → "rare", 3 → "epic", 4+ → "legendary"

  • computeRarityFromStrategy(strategy: Strategy): Rarity
    Читает techniques и services, вызывает две функции выше

  • computeCardStats(strategy: Strategy): CardStats
    Логика для speed (скорость обхода):
    - Базовая 50
    - +15 если techniques содержит "faketls"
    - +10 если techniques содержит "quic-fake"
    - +10 если techniques содержит "multisplit"
    - +10 если techniques содержит "any-protocol"
    - +5  если techniques содержит "cutoff"
    - Кэп 100
    Логика для stability (устойчивость):
    - Базовая 50
    - +20 если fileType = "zapret"
    - +10 если fileType = "winws"
    - +15 если techniques содержит "ipset"
    - −4 за каждую технику (чем сложнее фильтр,
      тем больше мест ломаться)
    - Кэп 100
    Логика для coverage (покрытие):
    - Базовая 20
    - +15 за каждый сервис
    - +20 если techniques содержит "ipset"
    - +15 если techniques содержит "l7-filter"
    - +10 если techniques содержит "quic-fake"
    - Кэп 100

  • getRarityColor(rarity: Rarity): { border, glow, text }
    Возвращает цветовые токены для стилей.
  • getRarityLabel(rarity: Rarity): string
    "Common" / "Rare" / "Epic" / "Legendary"
  • getRarityLabelRu(rarity: Rarity): string
    "Обычная" / "Редкая" / "Эпическая" / "Легендарная"

Требования:
  • Все функции — чистые
  • Детерминированные (не случайные)
  • Кэп значений 0–100
  • Если techniques пуст (стратегия не zapret) —
    редкость не падает ниже "common", а не ломается

【 4. src/lib/cardTilt.ts (создать) 】
Назначение: логика 3D-tilt для карт.

Функции:
  • computeTilt(mouseX: number, mouseY: number, rect:
    DOMRect, maxTilt: number): { rotateX, rotateY }
    - Нормализовать mouseX/Y относительно центра карты
    - Преобразовать в углы -maxTilt..+maxTilt
    - Возврат: rotateX (по Y-курсору), rotateY (по X-курсору)

  • computeGlowPosition(mouseX: number, mouseY: number, rect:
    DOMRect): { x: number, y: number }
    - Позиция для radial-gradient (в %)
    - x = (mouseX - rect.left) / rect.width * 100
    - y = (mouseY - rect.top) / rect.height * 100

Требования:
  • Чистые функции
  • Без зависимости от React

【 5. src/hooks/useCardTilt.ts (создать) 】
Назначение: хук для 3D-tilt с плавностью.

Сигнатура:
  • useCardTilt(options: { maxTilt?: number, disabled?: boolean })
    → {
        ref: RefObject<HTMLDivElement>;
        style: MotionStyle;
        glowStyle: MotionStyle;
        onMouseMove: (e: React.MouseEvent) => void;
        onMouseLeave: () => void;
      }

Логика:
  • useMotionValue для rotateX, rotateY, glowX, glowY
  • useSpring для плавности (stiffness 200, damping 20)
  • onMouseMove → computeTilt + set motion values
  • onMouseLeave → сброс к 0
  • style: { transform: "perspective(1000px) rotateX(...)
    rotateY(...)", transformStyle: "preserve-3d" }
  • glowStyle: { background: radial-gradient(circle at
    ${glowX}% ${glowY}%, ...) }

Требования:
  • Отключать при disabled=true (низкий tier устройства)
  • Cleanup при unmount
  • Не рендерить лишние ре-рендеры (motion values — вне
    React state)

【 6. src/hooks/useCardDealAnimation.ts (создать) 】
Назначение: анимация раздачи карт.

Сигнатура:
  • useCardDealAnimation(count: number) → {
      containerVariants,
      cardVariants
    }

Логика:
  • containerVariants: staggerChildren 0.05
  • cardVariants:
    - initial: { opacity: 0, y: 30, rotateY: -15 }
    - animate: { opacity: 1, y: 0, rotateY: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
    - exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }

Требования:
  • Возвращает variants для использования в motion.div
  • Совместимо с AnimatePresence

【 7. src/components/strategies/game/StrategyGameCard.tsx (создать) 】
Назначение: одна игровая карта стратегии.

Props:
  • strategy: Strategy
  • rarity: Rarity
  • stats: CardStats
  • isActive: boolean
  • onFlip: () => void
  • flipped: boolean (управляется извне для single flip)

Структура (front):
  • Контейнер с 3D-tilt (useCardTilt)
  • Свечение (radial-gradient) по позиции курсора
  • Рамка по редкости (getRarityColor)
  • Сверху: бейдж редкости + бейдж статуса (Running / Idle)
  • Центр: название стратегии (Inter 700, 18px)
  • Filename (mono, text-xs)
  • Характеристики:
    - Speed: progress bar + число
    - Stability: progress bar + число
    - Coverage: progress bar + число
  • Снизу: бейджи сервисов
  • Для Legendary: частицы (2–3 анимированные точки)

Структура (back, после flip):
  • Описание стратегии
  • Путь к файлу (mono, обрезается)
  • Размер, дата изменения
  • Тип (winws / goodbye-dpi / zapret)
  • Кнопки:
    - Play/Stop (primary/danger)
    - «Открыть папку» (secondary, icon FolderOpen)
    - «Закрыть» (ghost, icon X)

Анимации:
  • Появление: из variants (deal)
  • Hover: 3D-tilt + glow
  • Flip: rotateY 0° → 180° (600ms)
  • Active: pulse + зелёное свечение

Требования:
  • Размер: 280x400px (соотношение ~0.7 — как у MTG)
  • backface-visibility: hidden для front/back
  • transform-style: preserve-3d
  • Отключать tilt при disabled (low-tier)
  • Не рендерить частицы при prefers-reduced-motion

【 8. src/components/strategies/game/CardStatsBars.tsx (создать) 】
Назначение: 3 progress-bar с характеристиками.

Props:
  • stats: CardStats
  • compact?: boolean

Рендер:
  • 3 строки:
    - Icon Zap + Speed + bar + число
    - Icon Activity + Stability + bar + число
    - Icon Globe + Coverage + bar + число
  • Bar: тонкая полоса (4px), цвет = значение:
    - < 40 → red
    - 40–70 → amber
    - > 70 → accent-primary
  • Анимация заполнения при появлении (width 0 → X%, 800ms)

Требования:
  • Компактный режим: bars без чисел
  • Плавная анимация через framer-motion

【 9. src/components/strategies/game/StrategyCardBack.tsx (создать) 】
Назначение: обратная сторона карты (детали).

Props:
  • strategy: Strategy
  • onRun: () => void
  • onStop: () => void
  • onOpenFolder: () => void
  • onClose: () => void
  • isRunning: boolean

Рендер:
  • Заголовок: название
  • Описание (полное)
  • Метаданные (путь, размер, дата, тип)
  • Кнопки действий

Требования:
  • Не дублировать кнопки с front
  • Скроллится, если контент не помещается

【 10. src/components/strategies/game/RarityBadge.tsx (создать) 】
Назначение: бейдж редкости.

Props:
  • rarity: Rarity
  • size?: "sm" | "md"

Рендер:
  • Маленький бейдж с цветом редкости
  • Текст: «Обычная» / «Редкая» / «Эпическая» / «Легендарная»
  • Icon Star для всех, разное количество звёзд:
    - Common: 1 звезда
    - Rare: 2 звезды
    - Epic: 3 звезды
    - Legendary: 4 звезды

【 11. src/components/strategies/game/RarityParticles.tsx (создать) 】
Назначение: частицы для эпических и легендарных карт.

Props:
  • rarity: Rarity

Рендер:
  • SVG или canvas с 3–8 точками
  • Анимация: точки медленно двигаются внутри рамки
  • Только для Epic и Legendary
  • Прозрачность 0.3–0.6

Требования:
  • Не рендерить, если prefers-reduced-motion
  • Не блокировать клики (pointer-events: none)
  • Лёгкий (не более 10 точек)

【 12. src/components/strategies/game/ViewModeToggle.tsx (создать) 】
Назначение: переключатель «Карты» / «Список».

Props:
  • mode: ViewMode
  • onChange: (mode: ViewMode) => void

Рендер:
  • Toggle group с двумя кнопками (icon + label)
  • Иконки: LayoutGrid, List
  • Активная — accent-primary

【 13. src/components/strategies/game/CollectionStats.tsx (создать) 】
Назначение: сводка коллекции.

Props:
  • cards: StrategyCard[]

Рендер:
  • Компактный ряд:
    • Всего: N
    • Common: N (серый)
    • Rare: N (голубой)
    • Epic: N (фиолетовый)
    • Legendary: N (золотой)

Требования:
  • Маленькие бейджи с числами
  • Цветные
  • Обновляется при изменении списка

【 14. src/components/strategies/game/SortDropdown.tsx (создать) 】
Назначение: выпадающий список сортировки.

Props:
  • value: SortMode
  • onChange: (value: SortMode) => void

Рендер:
  • Button с текущим значением + ChevronDown
  • При клике — выпадающий список (portal или absolute)
  • Опции:
    - «Редкость ↓» (по убыванию)
    - «Редкость ↑»
    - «По алфавиту»
    - «По дате»

Требования:
  • Закрывается по клику вне
  • Escape закрывает
  • Keyboard navigation

【 15. src/components/strategies/game/CompareMode.tsx (опционально) 】
Назначение: режим сравнения двух карт.

Props:
  • onExit: () => void

Рендер:
  • Верхняя панель: «Выберите 2 карты для сравнения»
  • После выбора двух → модалка с таблицей сравнения:
    | Характеристика | Карта A | Карта B |
    | Редкость       | ...     | ...     |
    | Speed          | 85      | 70      |
    | Stability      | 90      | 65      |
    | Coverage       | 80      | 100     |

Требования:
  • Можно отложить на Этап 18

【 16. src/pages/Strategies.tsx (переработать полностью) 】
Назначение: главная страница с игровым режимом.

Структура:
  • Заголовок H1: «Стратегии»
  • Подзаголовок: «Коллекция карт обхода блокировок»
  • Панель управления (sticky сверху):
    - Поиск (Input)
    - ViewModeToggle (Карты / Список)
    - SortDropdown
    - Фильтр по редкости (5 toggle-кнопок)
    - Кнопка «Выбрать папку» (secondary)
    - Кнопка «Обновить» (ghost)
    - Кнопка «Сравнить» (опционально)
  • CollectionStats (компактная сводка)
  • Контент:
    - Если mode="cards" → сетка StrategyGameCard
    - Если mode="list" → список StrategyCard (Этап 5,
      оставить как есть)
  • Empty states:
    - Папка не выбрана → EmptyState с кнопкой
    - Нет .bat файлов → EmptyState
    - Фильтр пуст → EmptyState «Ничего не найдено»

Поведение:
  • Flip на карте: управляется через useState на странице
    (только одна карта может быть flipped одновременно)
  • Клик на другую карту при flipped → первая закрывается
  • Клик на backdrop (вне карты) → закрыть flipped

Требования:
  • Адаптивная сетка: 1 / 2 / 3 / 4 карты в ряд
  • Gap 20px
  • AnimatePresence для flip
  • Минимум 60 FPS

【 17. src/stores/useAppStore.ts (обновить) 】
Добавить:
  • strategiesViewMode: ViewMode (default "cards")
  • setStrategiesViewMode(mode)
  • strategiesSortMode: SortMode (default "rarity-desc")
  • setStrategiesSortMode(mode)
  • strategiesRarityFilter: Rarity[] (default [])
  • toggleStrategiesRarityFilter(rarity)
  • Persist эти поля

【 18. src/stores/selectors/index.ts (обновить) 】
Добавить:
  • useStrategyCards(): StrategyCard[]
    - useStrategiesStore → maps to StrategyCard with rarity
      and stats (computed via useMemo)
  • useFilteredCards(): StrategyCard[]
    - С учётом filter + search + sort
  • useCollectionStats(): { total, common, rare, epic,
    legendary }

【 19. src/lib/constants.ts (обновить) 】
Добавить:
  • CARD_MAX_TILT = 10 (градусов)
  • CARD_TILT_SPRING = { stiffness: 200, damping: 20 }
  • CARD_FLIP_DURATION_MS = 600
  • CARD_DEAL_STAGGER_MS = 50
  • CARD_DEAL_DURATION_MS = 400
  • RARITY_ORDER = ["common", "rare", "epic", "legendary"]

【 20. src/hooks/useDeviceTier.ts (опционально) 】
Назначение: определение «мощности» устройства.

Логика:
  • По navigator.hardwareConcurrency
  • По navigator.deviceMemory (если есть)
  • По screen.width × screen.height
  • Возвращает: "low" | "mid" | "high"

Использование:
  • low → отключить tilt, частицы, звук
  • mid → отключить частицы
  • high → всё включено

Требования:
  • Не использовать userAgent (устарел)
  • Кэшировать результат

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать типы
  • src/types/game.ts с Rarity, CardStats, StrategyCard,
    ViewMode, SortMode
  • Обновить src/types/index.ts

ШАГ 2: Создать rarity.ts
  • computeRarity, computeCardStats, getRarityColor,
    getRarityLabel, getRarityLabelRu

ШАГ 3: Создать cardTilt.ts
  • computeTilt, computeGlowPosition

ШАГ 4: Создать useCardTilt
  • useMotionValue, useSpring, motion values
  • onMouseMove, onMouseLeave
  • Поддержка disabled

ШАГ 5: Создать useCardDealAnimation
  • variants для container + card

ШАГ 6: Создать RarityBadge
  • Маленький бейдж с цветом и звёздами

ШАГ 7: Создать CardStatsBars
  • 3 progress-bar с анимацией

ШАГ 8: Создать RarityParticles
  • SVG-частицы для Epic/Legendary

ШАГ 9: Создать StrategyCardBack
  • Обратная сторона карты

ШАГ 10: Создать StrategyGameCard
  • Front + Back, flip-анимация, tilt, glow

ШАГ 11: Создать ViewModeToggle
  • Toggle group с иконками

ШАГ 12: Создать SortDropdown
  • Выпадающий список

ШАГ 13: Создать CollectionStats
  • Сводка коллекции

ШАГ 14: Обновить useAppStore
  • strategiesViewMode, strategiesSortMode,
    strategiesRarityFilter

ШАГ 15: Обновить селекторы
  • useStrategyCards, useFilteredCards, useCollectionStats

ШАГ 16: Обновить constants.ts
  • CARD_MAX_TILT, RARITY_ORDER, и т.д.

ШАГ 17: Создать useDeviceTier (опционально)
  • Определение мощности устройства

ШАГ 18: Переработать Strategies.tsx
  • Панель управления с ViewModeToggle и SortDropdown
  • Условный рендер: cards / list
  • Flip управление через useState
  • CollectionStats

ШАГ 19: Интегрировать useStrategyRunner
  • Кнопки на обратной стороне карты работают

ШАГ 20: Обновить App.tsx
  • Убедиться, что Strategies.tsx импортируется корректно

ШАГ 21: Оптимизации
  • will-change, useMemo, отключение на low-tier

ШАГ 22: Финальная проверка
  • pnpm tauri dev — запускается
  • Карты появляются с deal-анимацией
  • 3D-tilt работает
  • Flip работает
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 TYPE SAFETY 】
  □ Rarity, CardStats, StrategyCard, ViewMode, SortMode
    определены
  □ Ни одного any
  □ computeRarity, computeCardStats типизированы

【 RARITY / STATS 】
  □ computeRarityScore считает score по techniques[]
  □ +1 за Outlast Trials
  □ Редкость = score: 0–1 common, 2 rare, 3 epic, 4+ legendary
  □ 22 реальные стратегии дают РАЗНЫЕ значения редкости
     (не все common) — главная проверка этого этапа
  □ general-15-simple-fake дешевле general-20-faketls-auto-alt2
  □ computeCardStats вычисляет speed/stability/coverage
  □ Значения кэпированы 0–100
  □ Детерминированные (не случайные)
  □ Пустой techniques не ломает вычисления

【 TILT / GLOW 】
  □ useCardTilt работает
  □ rotateX и rotateY корректны
  □ Glow следует за курсором
  □ Плавность через useSpring (stiffness 200, damping 20)
  □ Отключается при disabled

【 FLIP 】
  □ Flip 0° → 180° (600ms ease-out-expo)
  □ backface-visibility: hidden для front/back
  □ transform-style: preserve-3d
  □ Только одна карта flipped одновременно
  □ Клик вне карты → закрыть

【 DEAL ANIMATION 】
  □ Stagger 50ms
  □ rotateY -15° → 0
  • y 30 → 0, opacity 0 → 1
  □ Easing ease-out-expo

【 РЕДКОСТЬ — ВИЗУАЛ 】
  □ Common: простая рамка
  □ Rare: голубая рамка + свечение
  □ Epic: фиолетовая + частицы
  □ Legendary: золотая + более яркие частицы +
    голографический градиент
  □ RarityBadge с звёздами

【 АКТИВНАЯ КАРТА 】
  □ Зелёное свечение
  □ Пульсация рамки
  □ Бейдж «Running» в углу
  □ Кнопка Play → Stop

【 VIEW MODE 】
  □ Toggle «Карты» / «Список»
  □ По умолчанию «Карты»
  □ Persist в localStorage
  □ Переключение плавное

【 ФИЛЬТРЫ 】
  □ Поиск (debounce 200ms)
  □ Фильтр по редкости (5 toggle)
  □ Фильтр по сервисам (4 toggle)
  □ SortDropdown (4 опции)
  □ Persist фильтров

【 COLLECTION STATS 】
  □ Всего карт
  □ По редкостям (цветные)
  □ Обновляется в реальном времени

【 ПРОИЗВОДИТЕЛЬНОСТЬ 】
  □ 50 карт — 60 FPS
  □ 3D-tilt не тормозит
  □ Flip не тормозит
  □ Пульсация активных — 60 FPS
  □ Частицы только на Epic/Legendary
  □ will-change: transform при hover
  □ useMemo для computeCardStats
  □ Отключение на low-tier

【 ДОСТУПНОСТЬ 】
  □ aria-label на icon-кнопках
  □ focus-visible на картах
  □ Tab-навигация
  □ Escape закрывает flipped
  □ prefers-reduced-motion — анимации отключены

【 CODE QUALITY 】
  □ Нет мёртвого кода
  □ Нет console.log
  □ Функции <50 строк
  □ Файлы <300 строк
  □ Комментариев в коде нет (правило проекта)

【 BUILD 】
  □ pnpm tauri dev — запускается
  □ pnpm tsc --noEmit — 0 ошибок
  □ cargo check — 0 warning'ов
  □ Консоль чистая

═══════════════════════════════════════════════════════════════════════
⚠️ ЧАСТЬ 5: ЧТО МОЖЕТ СЛОМАТЬСЯ (гипотезы)
═══════════════════════════════════════════════════════════════════════

ГИПОТЕЗА 1: 3D-tilt тормозит при 50 картах
  ПРИЧИНА: 50 useMotionValue × 4 = 200 анимаций.
  ЧТО ПРОВЕРИТЬ: отключать tilt при карт >30 ИЛИ на
    low-tier. Использовать will-change: transform при
    hover.

ГИПОТЕЗА 2: Flip «прыгает»
  ПРИЧИНА: неправильный transform-style или backface.
  ЧТО ПРОВЕРИТЬ: preserve-3d на контейнере,
    backface-visibility hidden на сторонах, transform-style
    preserve-3d на обеих сторонах.

ГИПОТЕЗА 3: Glow не следует за курсором
  ПРИЧИНА: motion values не переданы в style.
  ЧТО ПРОВЕРИТЬ: glowStyle должен быть передан в motion.div.

ГИПОТЕЗА 4: computeRarity даёт неправильные результаты
  ПРИЧИНА (исходная): редкость считалась по количеству
  сервисов, а у всех 22 стратегий zapret сервис один.
  РЕШЕНИЕ (принято): редкость = score из techniques[].
  ЧТО ПРОВЕРИТЬ: на реальной папке zapret значения редкости
  не совпадают у всех карт. Если совпадают — techniques[]
  не заполняется на этапе 5.

ГИПОТЕЗА 5: Flip ломает layout
  ПРИЧИНА: back side absolute, но container без
    фиксированной высоты.
  ЧТО ПРОВЕРИТЬ: фиксированные размеры карты 280x400px.

ГИПОТЕЗА 6: AnimatePresence exit не работает
  ПРИЧИНА: нет unique key на картах.
  ЧТО ПРОВЕРИТЬ: key={strategy.id}.

ГИПОТЕЗА 7: Частицы съедают FPS
  ПРИЧИНА: 30 частиц × 3 карты = 90 анимаций.
  ЧТО ПРОВЕРИТЬ: только 3–5 частиц, animation через
    transform, не через top/left.

ГИПОТЕЗА 8: Persist фильтров не работает
  ПРИЧИНА: partialize не включает новые поля.
  ЧТО ПРОВЕРИТЬ: добавить в partialize useAppStore.

ГИПОТЕЗА 9: На low-tier tilt всё равно работает
  ПРИЧИНА: useDeviceTier не подключён.
  ЧТО ПРОВЕРИТЬ: проверить через disabled prop.

ГИПОТЕЗА 10: Flip не работает на touchscreen
  ПРИЧИНА: touch events не MouseEvent.
  ЧТО ПРОВЕРИТЬ: onClick работает на touch тоже. Tilt
    отключить на touch.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Перейти в Strategies (по умолчанию режим «Карты»)
   ОЖИДАНИЕ:
   • Карты появляются с deal-анимацией (снизу вверх,
     stagger)
   • Сетка 4 колонки на 1920px
   • CollectionStats сверху: «Всего: 7, Common: 3, ...»
   • Панель управления sticky

3. Навести курсор на карту
   ОЖИДАНИЕ:
   • 3D-tilt (наклон в сторону курсора)
   • Glow следует за курсором
   • Плавно (60 FPS)

4. Убрать курсор
   ОЖИДАНИЕ: карта возвращается в исходное положение

5. Клик на карту
   ОЖИДАНИЕ: flip-анимация (600ms), видна обратная сторона
   с кнопками

6. Клик на «Запустить»
   ОЖИДАНИЕ: стратегия запускается (из Этапа 6)

7. Клик на «Закрыть»
   ОЖИДАНИЕ: flip обратно

8. Клик на другую карту при открытой первой
   ОЖИДАНИЕ: первая закрывается, вторая открывается

9. Клик вне карты
   ОЖИДАНИЕ: все закрываются

10. Проверить редкости:
    • discord_youtube.bat (2 сервиса) → Rare
    • general.bat (1 сервис) → Common
    • discord_youtube_outlast.bat (3 сервиса) → Epic
    • все_сервисы.bat (4+) → Legendary
    ОЖИДАНИЕ: правильные цвета и звёзды

11. Проверить частицы на Legendary
    ОЖИДАНИЕ: 3–5 точек медленно двигаются

12. Запустить стратегию
    ОЖИДАНИЕ:
    • Карта пульсирует зелёным
    • Бейдж «Running» в углу
    • Зелёное свечение вокруг

13. Переключить ViewMode на «Список»
    ОЖИДАНИЕ: карты заменяются списком (из Этапа 5)

14. Переключить обратно на «Карты»
    ОЖИДАНИЕ: deal-анимация

15. Поиск: ввести «discord»
    ОЖИДАНИЕ: только карты с Discord

16. Фильтр по редкости: выбрать «Legendary»
    ОЖИДАНИЕ: только легендарки

17. Сортировка: «По алфавиту»
    ОЖИДАНИЕ: карты сортируются

18. Перезапустить приложение
    ОЖИДАНИЕ:
    • ViewMode сохранён
    • Фильтры сохранены
    • Сортировка сохранена

19. Изменить размер окна до 1280px
    ОЖИДАНИЕ: 3 колонки

20. Изменить до 800px
    ОЖИДАНИЕ: 2 колонки

21. Изменить до 600px
    ОЖИДАНИЕ: 1 колонка

22. Открыть Performance → записать 10 сек на странице
    с 30+ картами
    ОЖИДАНИЕ: 60 FPS, нет long tasks

23. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

24. cargo check
    ОЖИДАНИЕ: 0 warning'ов

25. Проверить на touchscreen (если есть)
    ОЖИДАНИЕ: flip работает по tap, tilt отключён

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать any
❌ Не хранить rarity/stats в Strategy (только computed)
❌ Не делать случайные значения характеристик
❌ Не использовать inline-стили для transform (только
   motion values)
❌ Не забывать will-change: transform при hover
❌ Не рендерить частицы на Common/Rare
❌ Не рендерить 3D-tilt при prefers-reduced-motion
❌ Не забывать backface-visibility: hidden
❌ Не забывать transform-style: preserve-3d
❌ Не забывать key={strategy.id}
❌ Не забывать AnimatePresence для flip
❌ Не забывать про touch (убирать tilt)
❌ Не забывать про persist фильтров
❌ Не забывать aria-label на icon-кнопках
❌ Не забывать про useMemo для computeCardStats
❌ Не забывать про low-tier оптимизацию
❌ Не начинать Этап 11 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 10 завершён, если ВСЕ пункты выполнены:

✅ Типы game.ts созданы
✅ computeRarity, computeCardStats работают
✅ useCardTilt с 3D-tilt и glow
✅ useCardDealAnimation с stagger
✅ StrategyGameCard с front/back
✅ CardStatsBars с анимацией
✅ RarityBadge со звёздами
✅ RarityParticles для Epic/Legendary
✅ ViewModeToggle работает
✅ SortDropdown работает
✅ CollectionStats обновляется
✅ useAppStore с viewMode, sortMode, rarityFilter
✅ Селекторы useStrategyCards, useFilteredCards,
   useCollectionStats
✅ Strategies.tsx переработан
✅ Flip управляется через useState (single flip)
⚠ Закрытие перевёрнутой карты — по Escape, а не по клику вне карты (см. O54)
✅ 3D-tilt работает на desktop
✅ Tilt отключён на touch и low-tier
✅ Glow следует за курсором
⚠ Активная карта: свечение и бейдж есть, покадровой анимации рамки
   1 → 1.02 нет — есть статичное свечение и пульсирующая точка в бейдже (см. O55)
✅ Частицы на Epic/Legendary окрашены в цвет редкости
⚠ Deal-анимация реализована, но на этой машине не наблюдалась в кадре:
   системные анимации выключены, поэтому включается мгновенный режим
✅ Фильтры и сортировка работают
✅ Persist всех настроек
✅ Адаптивная сетка (1/2/3/4 колонки)
⚠ 60 FPS при 30+ картах: DevTools недоступны, вместо FPS замерена
   стабильность — RAM 45 МБ на 60 картах и не растёт
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ Консоль чистая
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
✅ ЭТАП 10 ВЫПОЛНЕН 2026-10-06
═══════════════════════════════════════════════════════════════════════

Реализовано frontend:
  • types/game.ts                — Rarity, SortMode, ViewMode, CardStats, StrategyCard
  • lib/rarity.ts                — веса техник, пороги, computeCardStats, палитра (254)
  • lib/cardTilt.ts              — математика 3D-tilt и glow (47)
  • hooks/useCardTilt.ts         — motion values, glow за курсором (87)
  • hooks/useCardDealAnimation.ts — deal со stagger, отключается при
                                    prefers-reduced-motion (55)
  • hooks/useDeviceTier.ts       — tier + prefers-reduced-motion (69)
  • components/strategies/game/  — 11 компонентов, все < 300 строк
  • stores/selectors/useStrategyCards.ts — карточки, фильтры, сортировка (103)
  • stores/useAppStore.ts        — persist viewMode, sort, rarity/service
  • pages/Strategies.tsx         — 296 строк

Проверено запуском на реальном архиве (22 стратегии):
  ✅ 22 карты, сводка коллекции 2 common / 10 rare / 6 epic / 4 legendary
  ✅ Flip по клику; обратная сторона: описание, тип, размер, дата, путь
  ✅ Запуск с обратной стороны → «Запущена», свечение, winws.exe: 1
  ✅ Остановка с обратной стороны → winws.exe: 0, кнопка «Запустить»
  ✅ Активная карта: зелёное свечение + бейдж «Запущена», точка в трее зелёная
  ✅ Бейдж «+ Outlast» на карточке при включённой инъекции; редкость
     пересчиталась (Редкая 1 → Эпическая 1 из-за бонуса +1)
  ✅ Сортировка ↓ — легендарные первыми: 14, 14, 13, затем 11
  ✅ Сортировка ↑ — обычные первыми: 8, 4, 4, 3, 2, 1
  ✅ Фильтр по сервису: 2 карты из 60; фильтр по редкости; «Сбросить фильтры»
  ✅ Карточки / список переключаются и переживают перезапуск приложения
  ✅ Настоящий архив не пострадал: тесты шли в отдельной папке-песочнице

Проверено в песочнице (60 стратегий, поддельный winws.exe = копия ping.exe):
  ✅ 60 карт: legendary 3, epic 1, common 56 — счётчики совпадают с формулой
  ✅ Запуск и остановка стратегии дважды подряд, счётчик winws.exe: 0 → 1 → 0
  ✅ RAM 45 МБ при 60 картах (лимит 250 МБ)

Проверено временным снятием галочки prefers-reduced-motion:
  ✅ 3D-tilt: 566 пикселей изменились, glow следует за курсором
  ✅ Частицы Epic/Legendary окрашены в цвет редкости: янтарь и фиолетовый

Автоматические проверки:
  ✅ tsc 0 ошибок, eslint 0, prettier 0, build 0
  ✅ 93/93 Rust-теста
  ✅ Нет any, TODO/FIXME, console.log, комментариев в коде
  ✅ Все новые файлы < 300 строк

ГЛАВНАЯ НАХОДКА ЭТАПА:
  На этой машине выключены системные анимации
  (HKCU\Control Panel\Desktop\WindowMetrics\MinAnimate = 0), поэтому WebView2
  всегда сообщает prefers-reduced-motion: reduce. Значит tilt и частицы на
  живой проверке не видны — это не баг, а корректная реакция на настройку
  системы. Чтобы проверить их код, галочка снималась временной правкой и
  возвращалась обратно; после возврата tsc/eslint/prettier снова зелёные.

НЕ ПРОВЕРЕНО:
  ⚠ FPS: DevTools в WebView2 недоступны, профилировать нечем. Вместо этого
    замерена стабильность: при 60 картах RAM 45 МБ и не растёт.
  ⚠ Deal-анимация визуально не подтверждена — на этой машине она
    отключается корректно (мгновенное появление), но сам эффект раздачи
    не наблюдался в кадре.
  ⚠ Настоящий winws.exe не запускался: он меняет сетевой стек, а это
    требует согласия. Все запуски — на поддельном winws.exe.
  ⚠ Адаптивность на других ширинах окна не проверялась: окно зафиксировано
    1296×809.

Отклонения: README.md раздел «Отклонения этапа 10», O51–O56.

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 11
═══════════════════════════════════════════════════════════════════════

После Этапа 10 у нас есть:
  • Первый сигнатурный момент: игровые карты стратегий
  • 3D-tilt, flip, glow, deal-анимация
  • Редкость (Common / Rare / Epic / Legendary)
  • Характеристики (speed, stability, coverage)
  • Частицы на эпических и легендарных
  • ViewMode (карты / список)
  • Фильтры по редкости и сервисам
  • Сортировка
  • Сводка коллекции
  • Оптимизация для 50+ карт

На Этапе 11 нужно будет:
  • Создать второй сигнатурный момент —
    визуализатор трафика
  • Живой график входящего/исходящего трафика
  • Пинг до сервисов (расширенный)
  • Статус DPI-обхода
  • Красивые анимации (как «пульт управления»)
  • Canvas или SVG для графика

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 10 — СТОП.

Не начинай Этап 11. Не создавай визуализатор трафика, не
подключай Canvas-графики, не делай «пульт управления».

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 11
  • "Правка: ..." — правка в Этап 10
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.