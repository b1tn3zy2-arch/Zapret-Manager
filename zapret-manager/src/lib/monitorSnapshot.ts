// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/format.
import { currentLanguage } from "@/lib/format";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PADDING = 24.
const PADDING = 24;
// Обрабатываем конструкцию: const GAP = 16.
const GAP = 16;
// Обрабатываем конструкцию: const LABEL_HEIGHT = 28.
const LABEL_HEIGHT = 28;
// Обрабатываем конструкцию: const BACKGROUND = #0b0d12.
const BACKGROUND = "#0b0d12";
// Обрабатываем конструкцию: const TITLE_COLOR = #f4f4f5.
const TITLE_COLOR = "#f4f4f5";
// Обрабатываем конструкцию: const SUBTITLE_COLOR = #a1a1aa.
const SUBTITLE_COLOR = "#a1a1aa";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SnapshotPanel {
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: canvas.
  canvas: HTMLCanvasElement | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию drawPanel.
function drawPanel(
  // Обрабатываем конструкцию: context.
  context: CanvasRenderingContext2D,
  // Обрабатываем конструкцию: panel.
  panel: SnapshotPanel,
  // Обрабатываем конструкцию: x.
  x: number,
  // Обрабатываем конструкцию: y.
  y: number,
  // Обрабатываем конструкцию: width.
  width: number,
  // Обрабатываем конструкцию: height.
  height: number
  // Закрываем выражение или список аргументов.
): void {
  // Обрабатываем конструкцию: context.
  context.fillStyle = SUBTITLE_COLOR;
  // Обрабатываем конструкцию: context.
  context.font = "600 14px Inter, sans-serif";
  // Обрабатываем конструкцию: context.
  context.textBaseline = "top";
  // Обрабатываем конструкцию: context.
  context.fillText(panel.label, x, y);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const source = panel.canvas.
  const source = panel.canvas;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: source === null || source.width === 0 || source.height ….
  if (source === null || source.width === 0 || source.height === 0) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: context.
  context.drawImage(source, x, y + LABEL_HEIGHT, width, height);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function snapshotFileName(): string {
  // Обрабатываем конструкцию: const now = new Date().
  const now = new Date();
  // Обрабатываем конструкцию: const pad = (value: number): string => value.toString()….
  const pad = (value: number): string => value.toString().padStart(2, "0");
  // — разделитель логических блоков —

  // Возвращаем результат: zapret-monitor-${now.getFullYear()}-${pad(now.getMonth(….
  return `zapret-monitor-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    // Продолжаем предыдущую конструкцию.
    now.getDate()
    // Продолжаем предыдущую конструкцию.
  )}-${pad(now.getHours())}-${pad(now.getMinutes())}.png`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function composeSnapshot(
  // Обрабатываем конструкцию: panels.
  panels: readonly SnapshotPanel[],
  // Обрабатываем конструкцию: width.
  width: number
  // Закрываем выражение или список аргументов.
): string {
  // Обрабатываем конструкцию: const canvas = document.createElement(canvas).
  const canvas = document.createElement("canvas");
  // Обрабатываем конструкцию: const bodyWidth = Math.max(width - PADDING * 2, 1).
  const bodyWidth = Math.max(width - PADDING * 2, 1);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Снимок повторяет разрешение графиков: они рисуются с учёт…
  // Снимок повторяет разрешение графиков: они рисуются с учётом
  // Сохраняем пояснение разработчика: // devicePixelRatio, а раньше композиция сохранялась в логич…
  // devicePixelRatio, а раньше композиция сохранялась в логических
  // Сохраняем пояснение разработчика: // пикселях — PNG получался в полтора-два раза мыльнее, чем …
  // пикселях — PNG получался в полтора-два раза мыльнее, чем выглядел
  // Сохраняем пояснение разработчика: // на экране.
  // на экране.
  // Обрабатываем конструкцию: const ratio = Math.min( Math.max( ...panels.map((panel)….
  const ratio = Math.min(
    // Обрабатываем конструкцию: Math.
    Math.max(
      // Разворачиваем ...panels.map((panel) => panel.canvas !== nul… в коллекцию.
      ...panels.map(
        // Продолжаем предыдущую конструкцию.
        (panel) =>
          // Обрабатываем конструкцию: panel.
          panel.canvas !== null && bodyWidth > 0
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              panel.canvas.width / bodyWidth
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              1
        // Закрываем выражение или список аргументов.
      ),
      // Обрабатываем конструкцию: 1.
      1
      // Закрываем выражение или список аргументов.
    ),
    // Обрабатываем конструкцию: 4.
    4
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const panelHeight = Math.max( // Логическая высота граф….
  const panelHeight = Math.max(
    // Сохраняем пояснение разработчика: // Логическая высота графика: это высота backstore, делённая…
    // Логическая высота графика: это высота backstore, делённая на
    // Сохраняем пояснение разработчика: // коэффициент масштаба самого графика.
    // коэффициент масштаба самого графика.
    // Разворачиваем ...panels.map((panel) => panel.canvas !== nul… в коллекцию.
    ...panels.map(
      // Продолжаем предыдущую конструкцию.
      (panel) =>
        // Обрабатываем конструкцию: panel.
        panel.canvas !== null && ratio > 0 ? panel.canvas.height / ratio : 0
      // Закрываем выражение или список аргументов.
    ),
    // Обрабатываем конструкцию: 80.
    80
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const bodyHeight = LABEL_HEIGHT + panelHeight.
  const bodyHeight = LABEL_HEIGHT + panelHeight;
  // Обрабатываем конструкцию: const height = PADDING * 2 + LABEL_HEIGHT + bodyHeight ….
  const height =
    // Обрабатываем конструкцию: PADDING.
    PADDING * 2 +
    // Обрабатываем конструкцию: LABEL_HEIGHT.
    LABEL_HEIGHT +
    // Обрабатываем конструкцию: bodyHeight.
    bodyHeight * panels.length +
    // Обрабатываем конструкцию: GAP.
    GAP * (panels.length - 1);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: canvas.
  canvas.width = Math.round(width * ratio);
  // Обрабатываем конструкцию: canvas.
  canvas.height = Math.round(height * ratio);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const context = canvas.getContext(2d).
  const context = canvas.getContext("2d");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: context === null.
  if (context === null) {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: context.
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  // Обрабатываем конструкцию: context.
  context.fillStyle = BACKGROUND;
  // Обрабатываем конструкцию: context.
  context.fillRect(0, 0, width, height);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: context.
  context.fillStyle = TITLE_COLOR;
  // Обрабатываем конструкцию: context.
  context.font = "700 20px Inter, sans-serif";
  // Обрабатываем конструкцию: context.
  context.textBaseline = "top";
  // Обрабатываем конструкцию: context.
  context.fillText(translateKey("trafficMonitor.title"), PADDING, PADDING);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: context.
  context.fillStyle = SUBTITLE_COLOR;
  // Обрабатываем конструкцию: context.
  context.font = "400 13px Inter, sans-serif";
  // Обрабатываем конструкцию: context.
  context.fillText(
    // Создаём экземпляр Date.
    new Date().toLocaleString(currentLanguage() === "ru" ? "ru-RU" : "en-US"),
    // Обрабатываем конструкцию: PADDING.
    PADDING,
    // Обрабатываем конструкцию: PADDING.
    PADDING + 24
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: panels.
  panels.forEach((panel, index) => {
    // Обрабатываем конструкцию: drawPanel.
    drawPanel(
      // Обрабатываем конструкцию: context.
      context,
      // Обрабатываем конструкцию: panel.
      panel,
      // Обрабатываем конструкцию: PADDING.
      PADDING,
      // Обрабатываем конструкцию: PADDING.
      PADDING * 2 + LABEL_HEIGHT + index * (bodyHeight + GAP),
      // Обрабатываем конструкцию: width.
      width - PADDING * 2,
      // Обрабатываем конструкцию: panelHeight.
      panelHeight
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Возвращаем результат: canvas.toDataURL(image/png).
  return canvas.toDataURL("image/png");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
