// Импортируем зависимости из модуля @testing-library/react.
import { render, screen, waitFor } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/AnimatedNumber.
import AnimatedNumber from "@/components/ui/AnimatedNumber";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatBytes } from "@/lib/trafficUtils";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const reducedMotion = vi.hoisted(() => ({ value: false ….
const reducedMotion = vi.hoisted(() => ({ value: false }));
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/hooks/useDeviceTier", () => ({
  // Обрабатываем конструкцию: usePrefersReducedMotion.
  usePrefersReducedMotion: () => reducedMotion.value,
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AnimatedNumber", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: reducedMotion.
    reducedMotion.value = false;
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("renders the formatted initial value", () => {
    // Обрабатываем конструкцию: render.
    render(<AnimatedNumber value={1234} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("1234")).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Раньше проверялось только начальное значение: пружина ник…
  // Раньше проверялось только начальное значение: пружина никогда не
  // Сохраняем пояснение разработчика: // доводила число до нового, и счётчики монитора навсегда ос…
  // доводила число до нового, и счётчики монитора навсегда оставались нулями,
  // Сохраняем пояснение разработчика: // хотя события сети приходили с реальными данными.
  // хотя события сети приходили с реальными данными.
  // Обрабатываем конструкцию: it.
  it("доводит число до нового значения после обновления", async () => {
    // Обрабатываем конструкцию: const { rerender } = render( <AnimatedNumber value={0} ….
    const { rerender } = render(
      // Рендерим самозакрывающийся элемент AnimatedNumber.
      <AnimatedNumber value={0} format={formatBytes} />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: rerender.
    rerender(<AnimatedNumber value={5_242_880} format={formatBytes} />);
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => expect(screen.getByText(5….
    await waitFor(() => expect(screen.getByText("5 МБ")).toBeInTheDocument(), {
      // Обрабатываем конструкцию: timeout.
      timeout: 3000,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("uses a custom formatter", () => {
    // Обрабатываем конструкцию: render.
    render(<AnimatedNumber value={512} format={(value) => `${value} мс`} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("512 мс")).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("renders a plain string when reduced motion is preferred", () => {
    // Обрабатываем конструкцию: reducedMotion.
    reducedMotion.value = true;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { container } = render( <AnimatedNumber value={42….
    const { container } = render(
      // Рендерим самозакрывающийся элемент AnimatedNumber.
      <AnimatedNumber value={42} className="tabular-nums" />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(container.querySelector("span")?.textContent).toBe("42");
    // Обрабатываем конструкцию: expect.
    expect(container.querySelector("span")?.className).toContain(
      // Обрабатываем конструкцию: tabular-nums.
      "tabular-nums"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
