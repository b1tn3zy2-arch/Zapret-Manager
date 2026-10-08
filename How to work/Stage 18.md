# ЭТАП 18: POSTPROCESSING — ВИЗУАЛЬНАЯ ПОЛИРОВКА

═══════════════════════════════════════════════════════════════════════
ЭТАП 18: POSTPROCESSING — ВИЗУАЛЬНАЯ ПОЛИРОВКА
ПРОЕКТ: Zapret Manager — десктопное приложение для управления
стратегиями обхода блокировок (Discord, YouTube, Outlast Trials)
═══════════════════════════════════════════════════════════════════════

🎯 ЦЕЛЬ ЭТАПА

Добавить финальный слой визуальной полировки — глобальные эффекты
поверх всего интерфейса, которые превращают «хорошо сделанное
приложение» в «премиум-продукт уровня Awwwards». Реализовать:
bloom (мягкое свечение акцентных элементов), vignette (тёмные
углы для фокуса), chromatic aberration (лёгкое смещение цветовых
каналов на акцентах), film grain (зернистость для «плёночного»
ощущения), subtle scanlines (опционально), motion blur на быстрых
переходах, glow trails при движении карт и depth-of-field
эффект при модалках.

После этого этапа пользователь увидит:
  • Мягкое свечение вокруг неоновых акцентов (кнопки, индикаторы,
    активные карты) — эффект «неоновой вывески»
  • Тёмные углы по периметру окна (vignette) — фокус на центре
  • Едва заметную зернистость (film grain) — «плёночная» текстура
  • Хроматические аберрации на hover карт — премиум-эффект
  • Motion blur при раздаче карт — плавность движения
  • Затемнение фона при открытии модалок (уже есть) + blur всей
    подложки (depth-of-field)
  • Свечение, следующее за курсором по акцентным элементам
  • Всё это — при 60 FPS и без утечек памяти

Это финальный визуальный штрих. Эффекты должны быть SUBTLE —
пользователь не должен их «видеть» напрямую, он должен
ощущать, что приложение выглядит «дорого». Если эффекты
заметны слишком сильно — они мешают.

═══════════════════════════════════════════════════════════════════════
🏗️ ЧАСТЬ 1: АРХИТЕКТУРНЫЕ РЕШЕНИЯ (обосновать перед реализацией)
═══════════════════════════════════════════════════════════════════════

【 РЕШЕНИЕ 1: Postprocessing через CSS + SVG filters, не через WebGL 】

ОБОСНУЙ:
  • Приложение — 2D-интерфейс, не 3D-сцена
  • WebGL-пайплайн (Three.js postprocessing) — избыточен:
    +500 KB бандла, отдельный canvas поверх DOM
  • CSS filters (blur, saturate, contrast) — нативно в WebView2,
    GPU-ускорены
  • SVG filters (feGaussianBlur, feTurbulence) — для сложных
    эффектов (glow, grain)
  • mix-blend-mode — для наложения слоёв без потери производительности
  • Все эффекты — декларативные, легко включать/выключать

ПОЧЕМУ НЕ WEBGL:
  • Overkill для 2D
  • +500 KB бандла
  • Нет прямой интеграции с DOM-элементами
  • Меньше контроля над текстом

ПОЧЕМУ НЕ CANVAS 2D ПОВЕРХ ВСЕГО:
  • Дорого (рендер всего окна каждый кадр)
  • Нет доступа к DOM
  • Теряется текстовый рендеринг

【 РЕШЕНИЕ 2: Глобальный PostProcessingLayer поверх Layout 】

ОБОСНУЙ:
  • Отдельный компонент рендерится поверх всего Layout
  • pointer-events: none — не мешает кликам
  • z-index выше NoiseOverlay (9999), но ниже модалок
    (используем 9998)
  • Содержит:
    - Vignette (radial-gradient)
    - Film grain (SVG feTurbulence)
    - Scanlines (опционально, отключены по умолчанию)
    - Chromatic aberration (только на hover-элементах через
      CSS-переменные)
  • Не мешает рендерингу контента (composited layer)

ПОЧЕМУ ОТДЕЛЬНЫЙ СЛОЙ:
  • Легко включать/выключать всё вместе
  • Не размазано по компонентам
  • Единый контроль производительности

【 РЕШЕНИЕ 3: Bloom через box-shadow + filter: drop-shadow 】

ОБОСНУЙ:
  • Каждый акцентный элемент имеет мягкое свечение
  • Реализация: несколько слоёв box-shadow с размытием
  • Например, для кнопки primary:
    ```
    box-shadow:
      0 0 12px rgba(0,255,136,0.4),
      0 0 24px rgba(0,255,136,0.2),
      0 0 48px rgba(0,255,136,0.1);
    ```
  • Для иконок/текста — filter: drop-shadow
  • Интенсивность зависит от контекста (hover → ярче)

ПОЧЕМУ НЕ SVG FILTER:
  • Дорого при рендере
  • box-shadow GPU-ускорен
  • Проще настраивать

ПОЧЕМУ НЕ ТОЛЬКО CSS filter: blur:
  • Размывает сам элемент
  • box-shadow не размывает содержимое

【 РЕШЕНИЕ 4: Vignette через radial-gradient на отдельном слое 】

ОБОСНУЙ:
  • Классический эффект — тёмные углы, светлый центр
  • Реализация:
    ```
    background: radial-gradient(
      ellipse at center,
      transparent 0%,
      transparent 40%,
      rgba(0,0,0,0.3) 80%,
      rgba(0,0,0,0.5) 100%
    );
    ```
  • pointer-events: none
  • position: fixed, inset: 0
  • Интенсивность настраивается (default 0.4)
  • Можно отключить в Settings → Внешний вид

ПОЧЕМУ НЕ ЧЕРЕЗ box-shadow inset:
  • Нет эллиптической формы
  • Ограничен

ПОЧЕМУ НЕ ЧЕРЕЗ SVG:
  • CSS-градиент быстрее
  • Проще

【 РЕШЕНИЕ 5: Film grain через SVG feTurbulence с анимацией opacity 】

ОБОСНУЙ:
  • NoiseOverlay (Этап 2) уже есть — статичный шум opacity 0.03
  • Film grain — тот же эффект, но с лёгкой анимацией:
    - SVG feTurbulence с seed, меняющимся через JS каждые
      100ms (или через CSS-анимацию)
    - Opacity колеблется от 0.02 до 0.04
  • Создаёт «живое» ощущение плёнки
  • Не мешает, но добавляет премиум-ощущение

ПОЧЕМУ АНИМИРОВАННЫЙ:
  • Статичный шум — просто текстура
  • Анимированный — «пульс» изображения
  • Едва заметно глазу

ПОЧЕМУ НЕ ПОСТОЯННО:
  • Меняем seed раз в 100ms — не грузит CPU
  • SVG-фильтр пересчитывается быстро

РЕКОМЕНДАЦИЯ: сделать выключенным по умолчанию,
включать только на мощных системах. Или анимировать
через CSS keyframes с изменением opacity (дешевле).

【 РЕШЕНИЕ 6: Chromatic aberration на hover карт через CSS filter 】

ОБОСНУЙ:
  • При hover на карту — лёгкое смещение RGB-каналов
  • Реализация: filter с drop-shadow в красном и голубом
    цвете с небольшим offset
  • Например:
    ```
    filter: drop-shadow(1px 0 0 rgba(255,0,0,0.3))
            drop-shadow(-1px 0 0 rgba(0,255,255,0.3));
    ```
  • Применяется только к рамке карты, не к содержимому
  • Интенсивность: 1-2px, opacity 0.3

ПОЧЕМУ НА HOVER, А НЕ ПОСТОЯННО:
  • Постоянно — раздражает и снижает читаемость
  • На hover — приятный «пик» эффекта

ПОЧЕМУ ТОЛЬКО НА КАРТАХ:
  • Кнопки — слишком часто используются
  • Карты — визуальный акцент

【 РЕШЕНИЕ 7: Motion blur при deal-анимации карт через CSS filter: blur 】

ОБОСНУЙ:
  • Когда карта «выезжает» снизу — лёгкое размытие в начале
  • Реализация в framer-motion:
    ```
    initial: { opacity: 0, y: 30, filter: "blur(8px)" }
    animate: { opacity: 1, y: 0, filter: "blur(0px)" }
    ```
  • Размытие уменьшается по мере появления
  • Эффект «проявления из ниоткуда»

ПОЧЕМУ РАБОТАЕТ:
  • GPU-ускорено (filter: blur на transform-анимируемом
    элементе)
  • Плавно и быстро

ПОЧЕМУ НЕ БОЛЬШОЙ BLUR:
  • 8px — максимум, иначе тормозит
  • Оптимально 4–6px

【 РЕШЕНИЕ 8: Depth-of-Field при модалках через backdrop-filter: blur ]

ОБОСНУЙ:
  • Уже реализовано на Этапе 3 (Modal с backdrop-blur-md)
  • Улучшение: увеличить blur до xl (24px) при открытии
  • Плюс: применение saturate(0.8) — контент под модалкой
    менее насыщенный
  • Создаёт эффект «фокус на модалке»

РЕАЛИЗАЦИЯ:
  ```css
  backdrop-filter: blur(24px) saturate(0.8);
  background: rgba(0, 0, 0, 0.5);
  ```

ПОЧЕМУ ВАЖНО:
  • Модалка «выпрыгивает» из фона
  • Фокус пользователя — на модалке

【 РЕШЕНИЕ 9: Glow trails при движении курсора по акцентным элементам 】

ОБОСНУЙ:
  • При наведении на кнопку/карту — свечение следует за
    курсором
  • Уже реализовано на Этапе 10 (3D-tilt + glow на картах)
  • Расширить: на кнопки primary и на активный индикатор
    Sidebar
  • Реализация: CSS-переменные --mouse-x, --mouse-y
    обновляются через JS на mousemove
  • radial-gradient следует за позицией

ПОЧЕМУ CSS-ПЕРЕМЕННЫЕ:
  • Не вызывают ре-рендер
  • GPU-ускорено
  • Плавно

ПОЧЕМУ НЕ FRAMER MOTION В КАЖДОЙ КНОПКЕ:
  • Много motion values = много overhead
  • CSS-переменные дешевле

【 РЕШЕНИЕ 10: Тонкие Scanlines (опционально, отключены) 】

ОБОСНУЙ:
  • Горизонтальные линии каждые 2–3 px
  • Opacity 0.02–0.03
  • Создаёт «CRT-монитор» эффект
  • На современных экранах может быть «мусором»
  • Отключено по умолчанию, включается в Settings →
    Внешний вид → «Ретро-эффекты»

ПОЧЕМУ ОПЦИОНАЛЬНО:
  • Спорный эффект
  • Некоторым нравится, некоторым — нет
  • Пользователь решает

РЕАЛИЗАЦИЯ:
  ```css
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(255,255,255,0.02) 2px,
    rgba(255,255,255,0.02) 3px
  );
  ```

【 РЕШЕНИЕ 11: Настройки эффектов в Settings → Внешний вид 】

ОБОСНУЙ:
  • Пользователь должен контролировать интенсивность
  • Настройки:
    - Bloom: off / subtle / normal / strong (default: normal)
    - Vignette: off / subtle / normal / strong (default: subtle)
    - Film grain: off / on (default: off)
    - Scanlines: off / on (default: off)
    - Chromatic aberration: off / on (default: on)
    - Motion blur: off / on (default: on)
  • Сохраняются в settings.appearance

ПОЧЕМУ НЕ ХАРДКОД:
  • Разные системы — разная производительность
  • Разные пользователи — разные предпочтения

【 РЕШЕНИЕ 12: Производительность — все эффекты GPU-ускорены 】

ОБОСНУЙ:
  • CSS filters, box-shadow, backdrop-filter — GPU
  • SVG filters (feTurbulence) — рендерятся один раз
  • Нет JS в анимационном цикле
  • Нет layout thrashing
  • 60 FPS при всех эффектах на i5 8-го поколения

ОПТИМИЗАЦИИ:
  • Включение только на GPU с поддержкой (проверка через
    CSS.supports)
  • Отключение на low-tier устройствах (useDeviceTier с
    Этапа 10)
  • prefers-reduced-motion → отключить всё

【 РЕШЕНИЕ 13: prefers-reduced-motion → отключить все эффекты 】

ОБОСНУЙ:
  • Пользователи с эпилепсией, motion sickness
  • Уважение к настройкам ОС
  • Проверка через window.matchMedia('(prefers-reduced-motion:
    reduce)')
  • При true — все эффекты отключены, кроме статичных
    (vignette)

ПОЧЕМУ ВАЖНО:
  • Стандарт доступности
  • Не навязываем эффекты

【 РЕШЕНИЕ 14: Единый PostProcessingContext для управления эффектами 】

ОБОСНУЙ:
  • Не все эффекты должны быть включены всегда
  • Контекст даёт:
    - isEnabled(effect): boolean
    - setIntensity(effect, value)
    - globalQuality: "low" | "medium" | "high"
  • Все компоненты читают из контекста
  • Настройки синхронизированы с settings.appearance

ПОЧЕМУ КОНТЕКСТ, А НЕ ПРОПСЫ:
  • Много компонентов используют эффекты
  • Пропс-дриллинг — боль
  • Контекст с селекторами — чисто

【 РЕШЕНИЕ 15: Hooks usePostProcessing для точечного применения 】

ОБОСНУЙ:
  • Хук возвращает готовые CSS-строки для box-shadow,
    filter и т.д.
  • Пример:
    ```
    const bloom = useBloom("primary"); // → CSS box-shadow
    <button style={{ boxShadow: bloom }}>...</button>
    ```
  • Меньше дублирования
  • Легко менять глобально

ПОЧЕМУ ХУКИ, А НЕ КЛАССЫ:
  • CSS-классы не параметризуются интенсивностью
  • Инлайн-стили через хук — гибко
  • Легко добавить новые эффекты

═══════════════════════════════════════════════════════════════════════
📂 ЧАСТЬ 2: ФАЙЛЫ, КОТОРЫЕ НУЖНО СОЗДАТЬ/РЕАЛИЗОВАТЬ
═══════════════════════════════════════════════════════════════════════

【 1. src/types/appearance.ts (создать) 】
Назначение: типы для эффектов.

Типы:
  • EffectIntensity — union: "off" | "subtle" | "normal" | "strong"
  • PostProcessingSettings:
    - bloom: EffectIntensity
    - vignette: EffectIntensity
    - filmGrain: boolean
    - scanlines: boolean
    - chromaticAberration: boolean
    - motionBlur: boolean
    - globalQuality: "low" | "medium" | "high"
  • BloomColor — union: "primary" | "secondary" | "danger" | "warning" | "neutral"

【 2. src/types/settings.ts (обновить) 】
Дополнить AppearanceSettings:
  • postProcessing: PostProcessingSettings

【 3. src/lib/defaults.ts (обновить) 】
DEFAULT_APPEARANCE.postProcessing:
  • bloom: "normal"
  • vignette: "subtle"
  • filmGrain: false
  • scanlines: false
  • chromaticAberration: true
  • motionBlur: true
  • globalQuality: "high"

【 4. src/lib/postProcessingTokens.ts (создать) 】
Назначение: константы интенсивности эффектов.

Содержит:
  • BLOOM_INTENSITY: Record<EffectIntensity, {
      blur1, blur2, blur3, alpha1, alpha2, alpha3
    }>
    Пример для "normal":
    ```
    { blur1: 12, alpha1: 0.4,
      blur2: 24, alpha2: 0.2,
      blur3: 48, alpha3: 0.1 }
    ```
  • VIGNETTE_GRADIENTS: Record<EffectIntensity, string>
  • CHROMATIC_OFFSET_PX: Record<EffectIntensity, number>
  • MOTION_BLUR_MAX_PX: Record<EffectIntensity, number>

【 5. src/lib/bloom.ts (создать) 】
Назначение: генерация CSS box-shadow для bloom.

Функции:
  • getBloomShadow(color: BloomColor, intensity: EffectIntensity): string
    - Возвращает готовую строку CSS для boxShadow
    - Пример: "0 0 12px rgba(0,255,136,0.4), 0 0 24px rgba(0,255,136,0.2), ..."
    - "off" → ""
  • getBloomFilter(color: BloomColor, intensity: EffectIntensity): string
    - Для drop-shadow на иконках/тексте
  • getTextGlow(color: BloomColor, intensity: EffectIntensity): string
    - Для text-shadow

Требования:
  • Все цвета — из CSS-переменных (не хардкод hex)
  • Использовать color-mix() или CSS-переменные с alpha

【 6. src/lib/chromatic.ts (создать) 】
Функции:
  • getChromaticFilter(intensity: EffectIntensity): string
    - "drop-shadow(1px 0 0 rgba(255,0,80,0.3)) drop-shadow(-1px 0 0 rgba(0,200,255,0.3))"
    - "off" → ""

【 7. src/lib/vignette.ts (создать) 】
Функции:
  • getVignetteGradient(intensity: EffectIntensity): string
    - Возвращает radial-gradient для background

【 8. src/lib/motionBlur.ts (создать) 】
Функции:
  • getMotionBlurVariants(intensity: EffectIntensity):
    { initial, animate, exit }
    - Для framer-motion variants
    - Initial: filter: "blur(6px)"
    - Animate: filter: "blur(0px)"

【 9. src/contexts/PostProcessingContext.tsx (создать) 】
Назначение: контекст для управления эффектами.

API:
  • usePostProcessing():
    - settings: PostProcessingSettings
    - isEnabled(effect: keyof PostProcessingSettings): boolean
    - getIntensity(effect): EffectIntensity
    - globalQuality: "low" | "medium" | "high"
    - isReducedMotion: boolean
  • Provider читает из useSettingsStore.appearance.postProcessing
  • При reduced-motion — принудительно отключает всё

Требования:
  • Не хранит состояние сам — только читает из стора
  • Мемоизирует значение контекста
  • Не вызывает ре-рендер при изменении одной настройки

【 10. src/hooks/useBloom.ts (создать) 】
Назначение: хук для bloom.

Сигнатура:
  • useBloom(color: BloomColor, intensityOverride?: EffectIntensity)
    → {
        boxShadow: string,
        filter: string,
        textShadow: string,
      }

Логика:
  • Читает из PostProcessingContext
  • Если отключено → все пустые строки
  • Возвращает мемоизированный объект (useMemo)

【 11. src/hooks/useChromatic.ts (создать) 】
  • useChromatic(enabled: boolean) → { filter: string }

【 12. src/hooks/useMotionBlur.ts (создать) 】
  • useMotionBlur() → { variants: Variants, transition: Transition }

【 13. src/components/shared/PostProcessingLayer.tsx (создать) 】
Назначение: глобальный слой пост-обработки.

Структура:
  • position: fixed, inset: 0
  • pointer-events: none
  • z-index: 9998
  • Содержит:
    - Vignette (div с radial-gradient)
    - Scanlines (div с repeating-linear-gradient) — опционально
    - Film grain (SVG feTurbulence с анимацией) — опционально
  • Не содержит chromatic aberration (она на компонентах)

Требования:
  • Все слои — отдельные div
  • Opacity — из настроек
  • При отключении — не рендерить слои

【 14. src/components/shared/AnimatedGrain.tsx (создать) 】
Назначение: анимированный film grain.

Реализация:
  • SVG с feTurbulence, baseFrequency 0.8, numOctaves 4
  • Seed меняется через JS каждые 100ms
  • Или: 3 предрендеренных SVG с разными seed, переключаются
    через CSS animation (дешевле)

РЕКОМЕНДАЦИЯ: 3 SVG-варианта с CSS animation-переключением
(step-end) — ноль JS в runtime.

【 15. src/components/ui/Button.tsx (обновить) 】
Добавить:
  • Для variant="primary" — bloom box-shadow из useBloom("primary")
  • На hover — усиление bloom (intensity normal → strong)
  • Плавный transition 200ms

Требования:
  • Не ломать существующий API
  • Bloom только если context.isEnabled("bloom")
  • При disabled/loading — bloom отключён

【 16. src/components/ui/Card.tsx (обновить) 】
Добавить:
  • Для interactive — лёгкий bloom на hover
  • Bloom цвет — accent

【 17. src/components/ui/Badge.tsx (обновить) 】
Добавить:
  • Для пульсирующих бейджей (success с pulse) — bloom
  • Синхронизирован с pulse

【 18. src/components/ui/Modal.tsx (обновить) 】
Обновить backdrop:
  • backdrop-filter: blur(24px) saturate(0.8)
  • Проверить, что transition на backdrop плавный

【 19. src/components/dashboard/StatusOrb.tsx (обновить) 】
Добавить:
  • Bloom на внешних кольцах
  • Интенсивность — strong для connected
  • Bloom синхронизирован с пульсацией

【 20. src/components/strategies/game/StrategyGameCard.tsx (обновить) 】
Добавить:
  • Motion blur при deal-анимации
  • Chromatic aberration на hover
  • Bloom на рамке для Legendary (уже есть свечение —
    усилить)

【 21. src/components/layout/Sidebar.tsx (обновить) 】
Добавить:
  • Bloom на активном индикаторе (неоновая полоска слева)
  • Мягкое свечение цвета accent-primary

【 22. src/components/settings/AppearanceSection.tsx (обновить) 】
Добавить секцию «Пост-обработка»:
  • Dropdown «Bloom»: off / subtle / normal / strong
  • Dropdown «Vignette»: off / subtle / normal / strong
  • Toggle «Film grain»
  • Toggle «Scanlines»
  • Toggle «Chromatic aberration»
  • Toggle «Motion blur»
  • Dropdown «Global quality»: low / medium / high
  • Кнопка «Сбросить к дефолтным»

Требования:
  • При изменении — мгновенное применение
  • Сохранение в settings.appearance.postProcessing

【 23. src/hooks/useDeviceTier.ts (обновить с Этапа 10) 】
Добавить:
  • Определение поддержки CSS backdrop-filter
  • Если низкая — globalQuality = "low" автоматически

【 24. src/app/App.tsx (обновить) 】
Добавить:
  • Обернуть в PostProcessingProvider
  • Подключить PostProcessingLayer после NoiseOverlay

【 25. src/lib/constants.ts (обновить) 】
Добавить:
  • GRAIN_ANIMATION_INTERVAL_MS = 100
  • BLUR_MAX_PX = 8
  • VIGNETTE_DEFAULT = "subtle"

═══════════════════════════════════════════════════════════════════════
💻 ЧАСТЬ 3: ЧТО ДОЛЖНО БЫТЬ СДЕЛАНО (пошагово)
═══════════════════════════════════════════════════════════════════════

ШАГ 1: Создать типы
  • src/types/appearance.ts — EffectIntensity,
    PostProcessingSettings, BloomColor
  • Обновить src/types/settings.ts
  • Обновить src/types/index.ts

ШАГ 2: Обновить defaults.ts
  • DEFAULT_APPEARANCE.postProcessing

ШАГ 3: Создать токены и утилиты
  • postProcessingTokens.ts — константы
  • bloom.ts — генерация box-shadow
  • chromatic.ts — фильтры
  • vignette.ts — градиенты
  • motionBlur.ts — variants

ШАГ 4: Создать PostProcessingContext
  • Provider + usePostProcessing
  • Читает настройки из стора
  • Обрабатывает prefers-reduced-motion

ШАГ 5: Создать хуки
  • useBloom, useChromatic, useMotionBlur

ШАГ 6: Создать PostProcessingLayer
  • Vignette + Scanlines + Film grain
  • Условный рендер по настройкам

ШАГ 7: Создать AnimatedGrain
  • 3 SVG с CSS animation

ШАГ 8: Обновить Button
  • Bloom для primary
  • Усиление на hover

ШАГ 9: Обновить Card
  • Bloom для interactive

ШАГ 10: Обновить Badge
  • Bloom для pulse-вариантов

ШАГ 11: Обновить Modal
  • Backdrop-filter blur(24px) saturate(0.8)

ШАГ 12: Обновить StatusOrb
  • Bloom на кольцах

ШАГ 13: Обновить StrategyGameCard
  • Motion blur при deal
  • Chromatic aberration на hover
  • Усиленный bloom для Legendary

ШАГ 14: Обновить Sidebar
  • Bloom на активном индикаторе

ШАГ 15: Обновить AppearanceSection
  • Секция «Пост-обработка»
  • 6 контролов + quality dropdown

ШАГ 16: Обновить useDeviceTier
  • Проверка backdrop-filter
  • Автоустановка quality

ШАГ 17: Обновить App.tsx
  • PostProcessingProvider + Layer

ШАГ 18: Обновить constants.ts
  • Константы

ШАГ 19: Финальная проверка
  • pnpm tauri dev — запускается
  • Все эффекты видны
  • 60 FPS при всех включённых эффектах
  • prefers-reduced-motion работает
  • pnpm tsc --noEmit — 0 ошибок
  • cargo check — 0 warning'ов
  • Пройти чек-лист

═══════════════════════════════════════════════════════════════════════
✅ ЧАСТЬ 4: ЧЕК-ЛИСТ САМОПРОВЕРКИ
═══════════════════════════════════════════════════════════════════════

【 TYPE SAFETY 】
  □ EffectIntensity, PostProcessingSettings, BloomColor
    определены
  □ Ни одного any
  □ Все хуки типизированы

【 CONTEXT 】
  □ PostProcessingContext создан
  □ usePostProcessing работает
  □ isEnabled(effect) корректен
  □ prefers-reduced-motion обрабатывается
  □ Мемоизация значения

【 BLOOM 】
  □ useBloom работает
  □ Button primary — bloom
  □ Card interactive — bloom на hover
  □ Badge pulse — bloom
  □ StatusOrb — bloom (strong для connected)
  □ Sidebar активный индикатор — bloom
  □ Legendary карты — усиленный bloom

【 VIGNETTE 】
  □ PostProcessingLayer рендерит vignette
  □ Интенсивность из настроек
  □ pointer-events: none
  □ Отключается при "off"

【 FILM GRAIN 】
  □ AnimatedGrain с 3 SVG
  □ CSS animation (не JS)
  □ Опционально (off по умолчанию)

【 SCANLINES 】
  □ Опционально (off по умолчанию)
  □ Отключаются

【 CHROMATIC ABERRATION 】
  □ useChromatic работает
  □ На hover карт
  □ Отключается

【 MOTION BLUR 】
  □ useMotionBlur работает
  □ При deal-анимации карт
  □ На модалках при открытии

【 DEPTH-OF-FIELD 】
  □ Modal backdrop-filter blur(24px) saturate(0.8)
  □ Плавная анимация

【 НАСТРОЙКИ 】
  □ AppearanceSection: секция «Пост-обработка»
  □ 6 контролов + quality
  □ Сохраняются в settings
  □ Мгновенное применение
  □ Кнопка сброса

【 PERFORMANCE 】
  □ 60 FPS при всех эффектах
  □ Нет ре-рендеров от PostProcessingLayer
  □ Bloom не тормозит Button hover
  □ Vignette — статичный (не грузит)
  □ Film grain — CSS animation (дешевле JS)
  □ RAM <200 MB

【 ДОСТУПНОСТЬ 】
  □ prefers-reduced-motion → все эффекты off
  □ Автопроверка при старте
  □ Обновление при смене настройки ОС

【 LOW-TIER 】
  □ useDeviceTier определяет tier
  □ low → quality = "low", effects отключены
  □ medium → film grain, scanlines off

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

ГИПОТЕЗА 1: Box-shadow bloom тормозит при hover
  ПРИЧИНА: пересчёт тени на каждом кадре.
  ЧТО ПРОВЕРИТЬ: transition 200ms (не мгновенно). GPU
    ускоряет box-shadow в WebView2.

ГИПОТЕЗА 2: Film grain грузит CPU
  ПРИЧИНА: JS-анимация seed каждые 100ms.
  ЧТО ПРОВЕРИТЬ: использовать 3 SVG с CSS animation
    (step-end), ноль JS в runtime.

ГИПОТЕЗА 3: Vignette перекрывает модалки
  ПРИЧИНА: неправильный z-index.
  ЧТО ПРОВЕРИТЬ: PostProcessingLayer z-index 9998,
    Modal z-index 10000+.

ГИПОТЕЗА 4: Chromatic aberration не работает
  ПРИЧИНА: drop-shadow не поддерживается или filter
    конфликтует с transform.
  ЧТО ПРОВЕРИТЬ: filter и transform на разных элементах
    или filter применён к wrapper.

ГИПОТЕЗА 5: Motion blur не плавный
  ПРИЧИНА: filter: blur анимируется через layout (не GPU).
  ЧТО ПРОВЕРИТЬ: shouldComponentUpdate или useMemo на
    variants. Filter должен быть на will-change: filter.

ГИПОТЕЗА 6: prefers-reduced-motion не работает
  ПРИЧИНА: проверка только при mount, не подписка на
    изменения.
  ЧТО ПРОВЕРИТЬ: matchMedia.addEventListener("change",
    handler).

ГИПОТЕЗА 7: Настройки не сохраняются
  ПРИЧИНА: updateAppearance не вызывается или partialize
    не включает postProcessing.
  ЧТО ПРОВЕРИТЬ: useSettingsStore → partialize.

ГИПОТЕЗА 8: Modal backdrop-filter не работает
  ПРИЧИНА: WebView2 не поддерживает backdrop-filter.
  ЧТО ПРОВЕРИТЬ: Chrome 76+ поддерживает. WebView2 —
    Chromium-based. Работает.

ГИПОТЕЗА 9: PostProcessingLayer перекрывает клики
  ПРИЧИНА: pointer-events не установлен в none.
  ЧТО ПРОВЕРИТЬ: style="pointer-events: none".

ГИПОТЕЗА 10: Bloom выходит за границы кнопки
  ПРИЧИНА: overflow: hidden на родителе обрезает тень.
  ЧТО ПРОВЕРИТЬ: убрать overflow: hidden или padding
    на родителе.

ГИПОТЕЗА 11: Chromatic aberration виден на тексте
  ПРИЧИНА: filter применяется ко всему элементу.
  ЧТО ПРОВЕРИТЬ: применять filter только к рамке (border
    через ::before).

ГИПОТЕЗА 12: Настройки quality "low" не работают
  ПРИЧИНА: useDeviceTier не вызывает обновление.
  ЧТО ПРОВЕРИТЬ: useEffect в PostProcessingContext для
    автоматического обновления при low tier.

ГИПОТЕЗА 13: Film grain виден слишком сильно
  ПРИЧИНА: opacity слишком высокая.
  ЧТО ПРОВЕРИТЬ: opacity 0.02-0.04, едва заметно.

ГИПОТЕЗА 14: StatusOrb bloom мерцает
  ПРИЧИНА: конфликт с framer-motion pulse.
  ЧТО ПРОВЕРИТЬ: bloom на отдельном слое (не на motion.div).

ГИПОТЕЗА 15: Тени на тёмном фоне не видны
  ПРИЧИНА: неправильная alpha.
  ЧТО ПРОВЕРИТЬ: alpha 0.3-0.6, использовать цвет
    акцента, не чёрный.

═══════════════════════════════════════════════════════════════════════
🧪 ЧАСТЬ 6: КАК ПРОВЕРИТЬ ЭТАП (пошагово)
═══════════════════════════════════════════════════════════════════════

1. Запустить pnpm tauri dev

2. Открыть Dashboard
   ОЖИДАНИЕ:
   • StatusOrb имеет мягкое зелёное свечение (если connected)
   • Vignette видна (тёмные углы)
   • Кнопки primary светятся

3. Перейти в Strategies (карты)
   ОЖИДАНИЕ:
   • Карты появляются с motion blur (лёгкое размытие в начале)
   • Легендарные карты имеют усиленный bloom
   • Hover → chromatic aberration (лёгкое RGB-смещение)

4. Клик на карту (flip)
   ОЖИДАНИЕ: плавная анимация, без размытия после появления

5. Открыть модалку
   ОЖИДАНИЕ:
   • Backdrop имеет blur 24px
   • Фон менее насыщен (saturate 0.8)
   • Фокус на модалке

6. Открыть Sidebar → активный индикатор
   ОЖИДАНИЕ: неоновая полоска с мягким свечением

7. Перейти в Settings → Внешний вид → Пост-обработка
   ОЖИДАНИЕ:
   • Dropdown «Bloom»
   • Dropdown «Vignette»
   • Toggle «Film grain»
   • Toggle «Scanlines»
   • Toggle «Chromatic aberration»
   • Toggle «Motion blur»
   • Dropdown «Global quality»

8. Изменить «Bloom» на "off"
   ОЖИДАНИЕ: свечение исчезает мгновенно

9. Изменить «Bloom» на "strong"
   ОЖИДАНИЕ: свечение усиливается

10. Включить «Film grain»
    ОЖИДАНИЕ: лёгкая зернистость (едва заметна)

11. Включить «Scanlines»
    ОЖИДАНИЕ: тонкие горизонтальные линии

12. Изменить «Vignette» на "strong"
    ОЖИДАНИЕ: тёмные углы усилились

13. Настроить «Global quality» на "low"
    ОЖИДАНИЕ: film grain и scanlines отключены
    автоматически, bloom слабее

14. Перезапустить приложение
    ОЖИДАНИЕ: настройки сохранены

15. Проверить prefers-reduced-motion:
    • Windows Settings → Специальные возможности →
      Визуальные эффекты → Отключить анимации
    ОЖИДАНИЕ:
    • Все эффекты отключены
    • Vignette остаётся (статичный)
    • Приложение не падает

16. Вернуть настройки ОС

17. Проверить производительность:
    • Открыть Performance → записать 20 сек
    • Переключать карты, hover, открывать модалки
    ОЖИДАНИЕ:
    • 60 FPS
    • CPU < 10%
    • Нет long tasks > 50ms

18. Проверить RAM
    ОЖИДАНИЕ: <200 MB

19. Проверить на low-tier:
    • В DevTools → Performance → CPU throttle 4x
    • Открыть приложение
    ОЖИДАНИЕ: quality автоматически "low", 30+ FPS

20. pnpm tsc --noEmit
    ОЖИДАНИЕ: 0 ошибок

21. cargo check
    ОЖИДАНИЕ: 0 warning'ов

22. Открыть React DevTools → Profiler
    ОЖИДАНИЕ:
    • PostProcessingLayer не ре-рендерится при hover
    • Bloom не вызывает ре-рендер Button

═══════════════════════════════════════════════════════════════════════
🚫 ЧАСТЬ 7: ЗАПРЕТЫ
═══════════════════════════════════════════════════════════════════════

❌ Не использовать JS-анимации для grain (только CSS)
❌ Не забывать pointer-events: none на PostProcessingLayer
❌ Не забывать prefers-reduced-motion
❌ Не забывать low-tier автоотключение
❌ Не использовать any
❌ Не хардкодить цвета (только CSS-переменные)
❌ Не забывать cleanup listeners на matchMedia
❌ Не перекрывать модалки (z-index)
❌ Не делать эффекты слишком сильными (subtle)
❌ Не забывать про DEV-режим (не портить перф)
❌ Не забывать про Settings сброс
❌ Не забывать memo на контекст
❌ Не применять filter: blur к тексту напрямую
    (использовать только на декоративных слоях)
❌ Не использовать will-change на всех элементах
❌ Не начинать Этап 19 без подтверждения

═══════════════════════════════════════════════════════════════════════
🏁 ЧАСТЬ 8: КРИТЕРИИ ГОТОВНОСТИ
═══════════════════════════════════════════════════════════════════════

Этап 18 завершён, если ВСЕ пункты выполнены:

✅ EffectIntensity, PostProcessingSettings, BloomColor
✅ DEFAULT_APPEARANCE.postProcessing
✅ postProcessingTokens.ts с константами
✅ bloom.ts — генерация box-shadow
✅ chromatic.ts, vignette.ts, motionBlur.ts
✅ PostProcessingContext + usePostProcessing
✅ useBloom, useChromatic, useMotionBlur
✅ PostProcessingLayer с vignette + scanlines
✅ AnimatedGrain с CSS animation
✅ Button: bloom + hover усиление
✅ Card: bloom interactive
✅ Badge: bloom для pulse
✅ Modal: backdrop-filter blur(24px)
✅ StatusOrb: bloom на кольцах
✅ StrategyGameCard: motion blur + chromatic + bloom
✅ Sidebar: bloom на индикаторе
✅ AppearanceSection: 6 контролов + quality
✅ useDeviceTier: авто-определение
✅ prefers-reduced-motion работает
✅ 60 FPS при всех эффектах
✅ RAM <200 MB
✅ Настройки сохраняются
✅ Ни одного any
✅ pnpm tsc --noEmit — 0 ошибок
✅ cargo check — 0 warning'ов
✅ Консоль чистая
✅ Комментариев в коде нет

═══════════════════════════════════════════════════════════════════════
⏭️ ЧАСТЬ 9: ЧТО ПЕРЕДАЁТСЯ ЭТАПУ 19
═══════════════════════════════════════════════════════════════════════

После Этапа 18 у нас есть:
  • Полный пост-обработка pipeline
  • Bloom, vignette, film grain, scanlines
  • Chromatic aberration, motion blur
  • Depth-of-field в модалках
  • Настройки эффектов в Settings
  • prefers-reduced-motion + low-tier
  • Готовность к Этапу 19 — «Адаптивность»

На Этапе 19 нужно будет:
  • Проверить работу на разных разрешениях (1280x720 до 4K)
  • DPI scaling (100% / 125% / 150% / 200%)
  • Мультимонитор (разные DPI)
  • Настройка размеров шрифтов при масштабировании
  • Адаптив для узких окон (min 800x600)
  • Работа в полноэкранном режиме
  • Проверка на 4:3, 16:9, 16:10, 21:9

═══════════════════════════════════════════════════════════════════════
🛑 ЧАСТЬ 10: СТОП
═══════════════════════════════════════════════════════════════════════

После завершения Этапа 18 — СТОП.

Не начинай Этап 19. Не тестируй адаптивность, не настраивай
DPI scaling, не работай с мультимонитором.

Жди одну из команд:
  • "ОК, дальше" — переход к Этапу 19
  • "Правка: ..." — правка в Этап 18
  • "Покажи Этап N" — возврат
  • "Проверка" — повторная самопроверка
  • "Объясни" — раскрыть решение подробнее

Если развилка — ЗАДАЙ ВОПРОС, не додумывай.

---
