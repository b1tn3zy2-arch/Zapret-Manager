export interface SmoothPathPoint {
  x: number;
  y: number;
}

export function buildSmoothPath(
  points: readonly SmoothPathPoint[],
  tension = 0.4
): string {
  if (points.length < 2) {
    return "";
  }

  const first = points[0];

  if (first === undefined) {
    return "";
  }

  const factor = tension / 6;
  let path = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;

  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;

    if (
      p0 === undefined ||
      p1 === undefined ||
      p2 === undefined ||
      p3 === undefined
    ) {
      break;
    }

    const cp1x = p1.x + (p2.x - p0.x) * factor;
    const cp1y = p1.y + (p2.y - p0.y) * factor;
    const cp2x = p2.x - (p3.x - p1.x) * factor;
    const cp2y = p2.y - (p3.y - p1.y) * factor;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  return path;
}

export function buildAreaPath(
  points: readonly SmoothPathPoint[],
  height: number,
  tension = 0.4
): string {
  if (points.length === 0) {
    return "";
  }

  const line = buildSmoothPath(points, tension);

  if (line === "") {
    return "";
  }

  const first = points[0];
  const last = points[points.length - 1];

  if (first === undefined || last === undefined) {
    return "";
  }

  return `${line} L ${last.x.toFixed(2)} ${height.toFixed(2)} L ${first.x.toFixed(2)} ${height.toFixed(2)} Z`;
}
