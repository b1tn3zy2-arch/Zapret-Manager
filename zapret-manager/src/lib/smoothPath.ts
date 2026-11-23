// Обрабатываем конструкцию: export.
export interface SmoothPathPoint {
  // Обрабатываем конструкцию: x.
  x: number;
  // Обрабатываем конструкцию: y.
  y: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildSmoothPath(
  // Обрабатываем конструкцию: points.
  points: readonly SmoothPathPoint[],
  // Обрабатываем конструкцию: tension.
  tension = 0.4
  // Закрываем выражение или список аргументов.
): string {
  // Проверяем бизнес-условие: points.length < 2.
  if (points.length < 2) {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const first = points[0].
  const first = points[0];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: first === undefined.
  if (first === undefined) {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const factor = tension / 6.
  const factor = tension / 6;
  // Обрабатываем конструкцию: let path = M ${first.x.toFixed(2)} ${first.y.toFixed(2)….
  let path = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  // — разделитель логических блоков —

  // Запускаем цикл с инициализацией, условием и шагом.
  for (let index = 0; index < points.length - 1; index += 1) {
    // Обрабатываем конструкцию: const p0 = points[index - 1] ?? points[index].
    const p0 = points[index - 1] ?? points[index];
    // Обрабатываем конструкцию: const p1 = points[index].
    const p1 = points[index];
    // Обрабатываем конструкцию: const p2 = points[index + 1].
    const p2 = points[index + 1];
    // Обрабатываем конструкцию: const p3 = points[index + 2] ?? p2.
    const p3 = points[index + 2] ?? p2;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: p0 === undefined || p1 === undefined || p2 === undefine….
    if (
      // Обрабатываем конструкцию: p0.
      p0 === undefined ||
      // Обрабатываем конструкцию: p1.
      p1 === undefined ||
      // Обрабатываем конструкцию: p2.
      p2 === undefined ||
      // Обрабатываем конструкцию: p3.
      p3 === undefined
      // Закрываем выражение или список аргументов.
    ) {
      // Прерываем текущий цикл или переключатель.
      break;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const cp1x = p1.x + (p2.x - p0.x) * factor.
    const cp1x = p1.x + (p2.x - p0.x) * factor;
    // Обрабатываем конструкцию: const cp1y = p1.y + (p2.y - p0.y) * factor.
    const cp1y = p1.y + (p2.y - p0.y) * factor;
    // Обрабатываем конструкцию: const cp2x = p2.x - (p3.x - p1.x) * factor.
    const cp2x = p2.x - (p3.x - p1.x) * factor;
    // Обрабатываем конструкцию: const cp2y = p2.y - (p3.y - p1.y) * factor.
    const cp2y = p2.y - (p3.y - p1.y) * factor;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: path.
    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: path.
  return path;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildAreaPath(
  // Обрабатываем конструкцию: points.
  points: readonly SmoothPathPoint[],
  // Обрабатываем конструкцию: height.
  height: number,
  // Обрабатываем конструкцию: tension.
  tension = 0.4
  // Закрываем выражение или список аргументов.
): string {
  // Проверяем бизнес-условие: points.length === 0.
  if (points.length === 0) {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const line = buildSmoothPath(points, tension).
  const line = buildSmoothPath(points, tension);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: line ===.
  if (line === "") {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const first = points[0].
  const first = points[0];
  // Обрабатываем конструкцию: const last = points[points.length - 1].
  const last = points[points.length - 1];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: first === undefined || last === undefined.
  if (first === undefined || last === undefined) {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ${line} L ${last.x.toFixed(2)} ${height.toFixed(2)} L $….
  return `${line} L ${last.x.toFixed(2)} ${height.toFixed(2)} L ${first.x.toFixed(2)} ${height.toFixed(2)} Z`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
