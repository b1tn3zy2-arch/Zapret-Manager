import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AnimatedNumber from "@/components/ui/AnimatedNumber";

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
