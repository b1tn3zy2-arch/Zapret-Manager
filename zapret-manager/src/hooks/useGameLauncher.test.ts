// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useGameLauncher.
import { pickStrategy } from "@/hooks/useGameLauncher";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию strategy.
function strategy(patch: Partial<Strategy>): Strategy {
  // Возвращаем результат: { id: alt-1, name: ALT 1, filename: alt-1.bat, path: C:….
  return {
    // Обрабатываем конструкцию: id.
    id: "alt-1",
    // Обрабатываем конструкцию: name.
    name: "ALT 1",
    // Обрабатываем конструкцию: filename.
    filename: "alt-1.bat",
    // Обрабатываем конструкцию: path.
    path: "C:\\strategies\\alt-1.bat",
    // Обрабатываем конструкцию: description.
    description: "",
    // Обрабатываем конструкцию: services.
    services: [],
    // Обрабатываем конструкцию: techniques.
    techniques: [],
    // Обрабатываем конструкцию: fileType.
    fileType: "zapret",
    // Обрабатываем конструкцию: status.
    status: "idle",
    // Обрабатываем конструкцию: size.
    size: 1,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("выбор стратегии для запуска игры", () => {
  // Обрабатываем конструкцию: it.
  it("берёт последнюю использованную", () => {
    // Обрабатываем конструкцию: const strategies = [ strategy({ id: a }), strategy({ id….
    const strategies = [
      // Обрабатываем конструкцию: strategy.
      strategy({ id: "a" }),
      // Обрабатываем конструкцию: strategy.
      strategy({ id: "b" }),
      // Обрабатываем конструкцию: strategy.
      strategy({ id: "c" }),
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pickStrategy(strategies, "c")?.id).toBe("c");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("падает на первую рабочую, если последней нет", () => {
    // Обрабатываем конструкцию: const strategies = [strategy({ id: a }), strategy({ id:….
    const strategies = [strategy({ id: "a" }), strategy({ id: "b" })];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pickStrategy(strategies, "missing")?.id).toBe("a");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает undefined, когда стратегий нет", () => {
    // Обрабатываем конструкцию: expect.
    expect(pickStrategy([], "a")).toBeUndefined();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
