const PADDING = 24;
const GAP = 16;
const LABEL_HEIGHT = 28;
const BACKGROUND = "#0b0d12";
const TITLE_COLOR = "#f4f4f5";
const SUBTITLE_COLOR = "#a1a1aa";

export interface SnapshotPanel {
  label: string;
  canvas: HTMLCanvasElement | null;
}

function drawPanel(
  context: CanvasRenderingContext2D,
  panel: SnapshotPanel,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  context.fillStyle = SUBTITLE_COLOR;
  context.font = "600 14px Inter, sans-serif";
  context.textBaseline = "top";
  context.fillText(panel.label, x, y);

  const source = panel.canvas;

  if (source === null || source.width === 0 || source.height === 0) {
    return;
  }

  context.drawImage(source, x, y + LABEL_HEIGHT, width, height);
}

export function snapshotFileName(): string {
  const now = new Date();
  const pad = (value: number): string => value.toString().padStart(2, "0");

  return `zapret-monitor-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate()
  )}-${pad(now.getHours())}-${pad(now.getMinutes())}.png`;
}

export function composeSnapshot(
  panels: readonly SnapshotPanel[],
  width: number
): string {
  const canvas = document.createElement("canvas");
  const panelHeight = Math.max(
    ...panels.map((panel) => panel.canvas?.height ?? 0),
    80
  );
  const bodyHeight = LABEL_HEIGHT + panelHeight;
  const height =
    PADDING * 2 +
    LABEL_HEIGHT +
    bodyHeight * panels.length +
    GAP * (panels.length - 1);

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  if (context === null) {
    return "";
  }

  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, width, height);

  context.fillStyle = TITLE_COLOR;
  context.font = "700 20px Inter, sans-serif";
  context.textBaseline = "top";
  context.fillText("Zapret Manager — монитор трафика", PADDING, PADDING);

  context.fillStyle = SUBTITLE_COLOR;
  context.font = "400 13px Inter, sans-serif";
  context.fillText(new Date().toLocaleString("ru-RU"), PADDING, PADDING + 24);

  panels.forEach((panel, index) => {
    drawPanel(
      context,
      panel,
      PADDING,
      PADDING * 2 + LABEL_HEIGHT + index * (bodyHeight + GAP),
      width - PADDING * 2,
      panelHeight
    );
  });

  return canvas.toDataURL("image/png");
}
