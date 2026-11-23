// Импортируем зависимости из модуля @testing-library/react.
import { fireEvent, render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/vpn/PaymentModal.
import PaymentModal from "@/components/dashboard/vpn/PaymentModal";
// Импортируем зависимости из модуля @/lib/vpnCommands.
import { createPaymentOrder, openPaymentWindow } from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/types.
import type { CreatedOrder, TariffMatrix } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/lib/vpnCommands", () => ({
  // Обрабатываем конструкцию: createPaymentOrder.
  createPaymentOrder: vi.fn(async () => ({
    // Обрабатываем конструкцию: url.
    url: "https://pay.example/fresh-order",
    // Обрабатываем конструкцию: guid.
    guid: "fresh-guid",
    // Обрабатываем конструкцию: amount.
    amount: 200,
    // Закрываем текущий блок.
  })),
  // Обрабатываем конструкцию: openPaymentWindow.
  openPaymentWindow: vi.fn(async () => undefined),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: const mockedOpen = vi.mocked(openPaymentWindow).
const mockedOpen = vi.mocked(openPaymentWindow);
// Обрабатываем конструкцию: const mockedCreate = vi.mocked(createPaymentOrder).
const mockedCreate = vi.mocked(createPaymentOrder);
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MATRIX: TariffMatrix = { plans: [ { id: 1m, month….
const MATRIX: TariffMatrix = {
  // Обрабатываем конструкцию: plans.
  plans: [
    // Открываем объектный литерал.
    { id: "1m", months: 1, days: 30, basePrice: 200, highlight: "none" },
    // Открываем объектный литерал.
    { id: "3m", months: 3, days: 90, basePrice: 500, highlight: "popular" },
    // Закрываем массив или список.
  ],
  // Обрабатываем конструкцию: deviceCounts.
  deviceCounts: [1, 3],
  // Обрабатываем конструкцию: prices.
  prices: [
    // Открываем объектный литерал.
    { planId: "1m", devices: 1, total: 200, perMonth: 200 },
    // Открываем объектный литерал.
    { planId: "1m", devices: 3, total: 450, perMonth: 150 },
    // Открываем объектный литерал.
    { planId: "3m", devices: 1, total: 540, perMonth: 180 },
    // Открываем объектный литерал.
    { planId: "3m", devices: 3, total: 1200, perMonth: 400 },
    // Закрываем массив или список.
  ],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EMAIL_FIELD = Email для подписки.
const EMAIL_FIELD = "Email для подписки";
// — разделитель логических блоков —

// Объявляем функцию renderModal.
function renderModal(
  // Обрабатываем конструкцию: overrides.
  overrides: Partial<Parameters<typeof PaymentModal>[0]> = {}
  // Закрываем выражение или список аргументов.
) {
  // Обрабатываем конструкцию: const onClose = vi.fn().
  const onClose = vi.fn();
  // Обрабатываем конструкцию: const onPaid = vi.fn().
  const onPaid = vi.fn();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: render.
  render(
    // Рендерим самозакрывающийся элемент PaymentModal.
    <PaymentModal
      // Задаём атрибут open элемента.
      open
      // Обрабатываем конструкцию: matrix.
      matrix={MATRIX}
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: onPaid.
      onPaid={onPaid}
      // Обрабатываем конструкцию: {...overrides}.
      {...overrides}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { onClose, onPaid }.
  return { onClose, onPaid };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const DEVICES_SLIDER = Сколько устройств охватывает под….
const DEVICES_SLIDER = "Сколько устройств охватывает подписка";
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function fillEmail(): Promise<void> {
  // Ожидаем завершение асинхронной операции await userEvent.type(screen.getByLabelText(EM….
  await userEvent.type(screen.getByLabelText(EMAIL_FIELD), "user@example.com");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("PaymentModal", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: window.
    window.localStorage.removeItem("zapret-manager:payment-email");
    // Обрабатываем конструкцию: mockedOpen.
    mockedOpen.mockResolvedValue(undefined);
    // Обрабатываем конструкцию: mockedCreate.
    mockedCreate.mockClear();
    // Обрабатываем конструкцию: mockedCreate.
    mockedCreate.mockResolvedValue({
      // Обрабатываем конструкцию: url.
      url: "https://pay.example/fresh-order",
      // Обрабатываем конструкцию: guid.
      guid: "fresh-guid",
      // Обрабатываем конструкцию: amount.
      amount: 200,
      // Закрываем текущий блок.
    } satisfies CreatedOrder);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не монтирует содержимое при open=false", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент PaymentModal.
      <PaymentModal
        // Обрабатываем конструкцию: open.
        open={false}
        // Обрабатываем конструкцию: matrix.
        matrix={MATRIX}
        // Обрабатываем конструкцию: onClose.
        onClose={vi.fn()}
        // Обрабатываем конструкцию: onPaid.
        onPaid={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает цену выбранного тарифа и устройств", () => {
    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Покупка VPN")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить 200 ₽" })
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Три устройства — своя цена из матрицы.
    // Три устройства — своя цена из матрицы.
    // Обрабатываем конструкцию: fireEvent.
    fireEvent.change(screen.getByRole("slider", { name: DEVICES_SLIDER }), {
      // Обрабатываем конструкцию: target.
      target: { value: "1" },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Выбрано: 3")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить 450 ₽" })
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: fireEvent.
    fireEvent.click(screen.getByRole("button", { name: /3 месяца/ }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить 1200 ₽" })
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокирует оплату без email и без согласия с условиями", async () => {
    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const pay = screen.getByRole(button, { name: Оплатить 2….
    const pay = screen.getByRole("button", { name: "Оплатить 200 ₽" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pay).toBeDisabled();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(checkb….
    await userEvent.click(screen.getByRole("checkbox"));
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Email пуст: оплаты всё ещё нет.
    // Email пуст: оплаты всё ещё нет.
    // Обрабатываем конструкцию: expect.
    expect(pay).toBeDisabled();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await fillEmail().
    await fillEmail();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pay).toBeEnabled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("создаёт свежий заказ и открывает его во встроенном окне", async () => {
    // Обрабатываем конструкцию: const { onPaid } = renderModal().
    const { onPaid } = renderModal();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await fillEmail().
    await fillEmail();
    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(checkb….
    await userEvent.click(screen.getByRole("checkbox"));
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить 200 ₽" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mockedCreate).toHaveBeenCalledWith("1m", 1, "user@example.com");
    // Обрабатываем конструкцию: expect.
    expect(mockedOpen).toHaveBeenCalledWith(
      // Обрабатываем конструкцию: https://pay.example/fresh-order.
      "https://pay.example/fresh-order",
      // Обрабатываем конструкцию: Оплата.
      "Оплата"
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: expect.
    expect(onPaid).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет email последнего заказа", async () => {
    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await fillEmail().
    await fillEmail();
    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(checkb….
    await userEvent.click(screen.getByRole("checkbox"));
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить 200 ₽" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await vi.waitFor(() => { expect(window.localS….
    await vi.waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(window.localStorage.getItem("zapret-manager:payment-email")).toBe(
        // Обрабатываем конструкцию: user@example.com.
        "user@example.com"
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("подставляет email последнего заказа при повторной оплате", () => {
    // Обрабатываем конструкцию: window.
    window.localStorage.setItem(
      // Обрабатываем конструкцию: zapret-manager:payment-email.
      "zapret-manager:payment-email",
      // Обрабатываем конструкцию: again@example.com.
      "again@example.com"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByLabelText(EMAIL_FIELD) as HTMLInputElement).toHaveValue(
      // Обрабатываем конструкцию: again@example.com.
      "again@example.com"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: window.
    window.localStorage.removeItem("zapret-manager:payment-email");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("плохой email держит оплату заблокированной", async () => {
    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.type(screen.getByLabelText(EM….
    await userEvent.type(screen.getByLabelText(EMAIL_FIELD), "broken mail");
    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(checkb….
    await userEvent.click(screen.getByRole("checkbox"));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const pay = screen.getByRole(button, { name: Оплатить 2….
    const pay = screen.getByRole("button", { name: "Оплатить 200 ₽" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pay).toBeDisabled();
    // Обрабатываем конструкцию: expect.
    expect(mockedCreate).not.toHaveBeenCalled();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Введите корректный email")).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ошибка создания заказа остаётся внутри модалки", async () => {
    // Обрабатываем конструкцию: mockedCreate.
    mockedCreate.mockRejectedValue(new Error("Нет подключения к интернету"));
    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await fillEmail().
    await fillEmail();
    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(checkb….
    await userEvent.click(screen.getByRole("checkbox"));
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить 200 ₽" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Ожидаем завершение асинхронной операции await screen.findByText(Нет подключения к инт….
      await screen.findByText("Нет подключения к интернету")
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(mockedOpen).not.toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("кнопки сайта провайдера в модалке нет", () => {
    // Сохраняем пояснение разработчика: // Покупка начинается с карточки подписки: дубль кнопки в мо…
    // Покупка начинается с карточки подписки: дубль кнопки в модалке
    // Сохраняем пояснение разработчика: // оплаты только путает.
    // оплаты только путает.
    // Обрабатываем конструкцию: renderModal.
    renderModal();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.queryByRole("button", { name: "Открыть сайт провайдера" })
      // Закрываем выражение или список аргументов.
    ).not.toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
