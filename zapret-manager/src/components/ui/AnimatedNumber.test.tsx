import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AnimatedNumber from "@/components/ui/AnimatedNumber";
import { formatBytes } from "@/lib/trafficUtils";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("@/hooks/useDeviceTier", () => ({
  usePrefersReducedMotion: () => reducedMotion.value,
}));

describe("AnimatedNumber", () => {
  beforeEach(() => {
    reducedMotion.value = false;
  });

  it("renders the formatted initial value", () => {
    render(<AnimatedNumber value={1234} />);

    expect(screen.getByText("1234")).toBeInTheDocument();
  });

  // Раньше проверялось только начальное значение: пружина никогда не
  // доводила число до нового, и счётчики монитора навсегда оставались нулями,
  // хотя события сети приходили с реальными данными.
  it("доводит число до нового значения после обновления", async () => {
    const { rerender } = render(
      <AnimatedNumber value={0} format={formatBytes} />
    );

    rerender(<AnimatedNumber value={5_242_880} format={formatBytes} />);

    await waitFor(() => expect(screen.getByText("5 МБ")).toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it("uses a custom formatter", () => {
    render(<AnimatedNumber value={512} format={(value) => `${value} мс`} />);

    expect(screen.getByText("512 мс")).toBeInTheDocument();
  });

  it("renders a plain string when reduced motion is preferred", () => {
    reducedMotion.value = true;

    const { container } = render(
      <AnimatedNumber value={42} className="tabular-nums" />
    );

    expect(container.querySelector("span")?.textContent).toBe("42");
    expect(container.querySelector("span")?.className).toContain(
      "tabular-nums"
    );
  });
});
