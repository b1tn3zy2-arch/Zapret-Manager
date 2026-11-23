// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/vpn/SubscriptionCard.
import SubscriptionCard from "@/components/dashboard/vpn/SubscriptionCard";
// Импортируем зависимости из модуля @/lib/constants.
import { MAXIMA_TRAFFIC_RESET_URL } from "@/lib/constants";
// Импортируем зависимости из модуля @/types.
import type { SubscriptionInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/lib/vpnCommands", () => ({
  // Обрабатываем конструкцию: openPaymentWindow.
  openPaymentWindow: vi.fn(async () => undefined),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: const INFO: SubscriptionInfo = { trafficUsedGb: 45.2, t….
const INFO: SubscriptionInfo = {
  // Обрабатываем конструкцию: trafficUsedGb.
  trafficUsedGb: 45.2,
  // Обрабатываем конструкцию: trafficLimitGb.
  trafficLimitGb: 100,
  // Обрабатываем конструкцию: trafficPercent.
  trafficPercent: 45.2,
  // Обрабатываем конструкцию: daysRemaining.
  daysRemaining: 14,
  // Обрабатываем конструкцию: isActive.
  isActive: true,
  // Обрабатываем конструкцию: isLinked.
  isLinked: true,
  // Обрабатываем конструкцию: title.
  title: "Профиль 3 месяца",
  // Обрабатываем конструкцию: serverCount.
  serverCount: 3,
  // Обрабатываем конструкцию: expiresAt.
  expiresAt: 1_798_782_953,
  // Обрабатываем конструкцию: lastCheckedAt.
  lastCheckedAt: 1_798_712_953,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Объявляем функцию renderCard.
function renderCard(
  // Обрабатываем конструкцию: overrides.
  overrides: Partial<SubscriptionInfo> = {},
  // Обрабатываем конструкцию: handlers.
  handlers?: {
    // Обрабатываем конструкцию: onAdd.
    onAdd?: () => void;
    // Обрабатываем конструкцию: onRemove.
    onRemove?: () => void;
    // Обрабатываем конструкцию: onRefresh.
    onRefresh?: () => void;
    // Обрабатываем конструкцию: onPay.
    onPay?: () => void;
    // Обрабатываем конструкцию: error.
    error?: string | null;
    // Закрываем текущий блок.
  }
  // Закрываем выражение или список аргументов.
) {
  // Обрабатываем конструкцию: const onAdd = handlers?.onAdd ?? vi.fn<() => void>().
  const onAdd = handlers?.onAdd ?? vi.fn<() => void>();
  // Обрабатываем конструкцию: const onRemove = handlers?.onRemove ?? vi.fn<() => void….
  const onRemove = handlers?.onRemove ?? vi.fn<() => void>();
  // Обрабатываем конструкцию: const onRefresh = handlers?.onRefresh ?? vi.fn<() => vo….
  const onRefresh = handlers?.onRefresh ?? vi.fn<() => void>();
  // Обрабатываем конструкцию: const onPay = handlers?.onPay ?? vi.fn<() => void>().
  const onPay = handlers?.onPay ?? vi.fn<() => void>();
  // Обрабатываем конструкцию: const info = { ...INFO, ...overrides }.
  const info = { ...INFO, ...overrides };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: render.
  render(
    // Рендерим самозакрывающийся элемент SubscriptionCard.
    <SubscriptionCard
      // Обрабатываем конструкцию: info.
      info={info}
      // Обрабатываем конструкцию: isLoading.
      isLoading={false}
      // Обрабатываем конструкцию: isSaving.
      isSaving={false}
      // Обрабатываем конструкцию: isRefreshing.
      isRefreshing={false}
      // Обрабатываем конструкцию: error.
      error={handlers?.error ?? null}
      // Обрабатываем конструкцию: onAdd.
      onAdd={onAdd}
      // Обрабатываем конструкцию: onRemove.
      onRemove={onRemove}
      // Обрабатываем конструкцию: onRefresh.
      onRefresh={onRefresh}
      // Обрабатываем конструкцию: onPay.
      onPay={onPay}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { onAdd, onRemove, onRefresh, onPay }.
  return { onAdd, onRemove, onRefresh, onPay };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("SubscriptionCard", () => {
  // Обрабатываем конструкцию: it.
  it("показывает трафик, срок, серверы и дату", () => {
    // Обрабатываем конструкцию: renderCard.
    renderCard();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Моя подписка")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Активна")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("45.2 ГБ / 100.0 ГБ")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Осталось 14 дней")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Профиль 3 месяца")).toBeInTheDocument();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const expectedDate = new Date(1_798_782_953 * 1000).toL….
    const expectedDate = new Date(1_798_782_953 * 1000).toLocaleDateString();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText(expectedDate)).toBeInTheDocument();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      // Обрабатываем конструкцию: aria-valuenow.
      "aria-valuenow",
      // Обрабатываем конструкцию: 45.
      "45"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("склоняет дни по правилам русского языка", () => {
    // Обрабатываем конструкцию: const cases: Array<[number, string]> = [ [1, Осталось 1….
    const cases: Array<[number, string]> = [
      // Открываем массив.
      [1, "Осталось 1 день"],
      // Открываем массив.
      [3, "Осталось 3 дня"],
      // Открываем массив.
      [11, "Осталось 11 дней"],
      // Открываем массив.
      [21, "Осталось 21 день"],
      // Открываем массив.
      [71, "Осталось 71 день"],
      // Открываем массив.
      [14, "Осталось 14 дней"],
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Перебираем элементы коллекции cases.
    for (const [days, expected] of cases) {
      // Обрабатываем конструкцию: const { unmount } = render( <SubscriptionCard info={{ .….
      const { unmount } = render(
        // Рендерим самозакрывающийся элемент SubscriptionCard.
        <SubscriptionCard
          // Обрабатываем конструкцию: info.
          info={{ ...INFO, daysRemaining: days }}
          // Обрабатываем конструкцию: isLoading.
          isLoading={false}
          // Обрабатываем конструкцию: isSaving.
          isSaving={false}
          // Обрабатываем конструкцию: isRefreshing.
          isRefreshing={false}
          // Обрабатываем конструкцию: error.
          error={null}
          // Обрабатываем конструкцию: onAdd.
          onAdd={vi.fn()}
          // Обрабатываем конструкцию: onRemove.
          onRemove={vi.fn()}
          // Обрабатываем конструкцию: onRefresh.
          onRefresh={vi.fn()}
          // Обрабатываем конструкцию: onPay.
          onPay={vi.fn()}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: expect.
      expect(screen.getByText(expected)).toBeInTheDocument();
      // Обрабатываем конструкцию: unmount.
      unmount();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает истёкшую подписку", () => {
    // Обрабатываем конструкцию: renderCard.
    renderCard({ isActive: false });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Истекла")).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает действия карточки", async () => {
    // Обрабатываем конструкцию: const handlers = renderCard().
    const handlers = renderCard();
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(button….
    await userEvent.click(screen.getByRole("button", { name: "Убрать" }));
    // Сохраняем пояснение разработчика: // Активная подписка продлевается — кнопка называется «Продл…
    // Активная подписка продлевается — кнопка называется «Продлить подписку».
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Продлить подписку" })
      // Закрываем выражение или список аргументов.
    );
    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(button….
    await userEvent.click(screen.getByRole("button", { name: "Обновить" }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(handlers.onRemove).toHaveBeenCalledTimes(1);
    // Обрабатываем конструкцию: expect.
    expect(handlers.onPay).toHaveBeenCalledTimes(1);
    // Обрабатываем конструкцию: expect.
    expect(handlers.onRefresh).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("истёкшая подписка снова предлагает оплату", () => {
    // Обрабатываем конструкцию: renderCard.
    renderCard({ isActive: false });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить" })
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.queryByRole("button", { name: "Продлить подписку" })
      // Закрываем выражение или список аргументов.
    ).not.toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("без подписки показывает состояние и место для ссылки", async () => {
    // Обрабатываем конструкцию: const onAdd = vi.fn().
    const onAdd = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const handlers = renderCard( { trafficUsedGb: null, tra….
    const handlers = renderCard(
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: trafficUsedGb.
        trafficUsedGb: null,
        // Обрабатываем конструкцию: trafficLimitGb.
        trafficLimitGb: null,
        // Обрабатываем конструкцию: trafficPercent.
        trafficPercent: null,
        // Обрабатываем конструкцию: daysRemaining.
        daysRemaining: null,
        // Обрабатываем конструкцию: isActive.
        isActive: false,
        // Обрабатываем конструкцию: isLinked.
        isLinked: false,
        // Обрабатываем конструкцию: title.
        title: null,
        // Обрабатываем конструкцию: serverCount.
        serverCount: null,
        // Обрабатываем конструкцию: expiresAt.
        expiresAt: null,
        // Обрабатываем конструкцию: lastCheckedAt.
        lastCheckedAt: null,
        // Закрываем текущий блок.
      },
      // Открываем объектный литерал.
      { onAdd }
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Подписки нет")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByText(
        // Обрабатываем конструкцию: Добавьте ссылку на подписку — серверы подтянутся автома….
        "Добавьте ссылку на подписку — серверы подтянутся автоматически. VPN включается после этого."
        // Закрываем выражение или список аргументов.
      )
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // «Обновить» без подписки не нужен, а «Убрать» вообще не от…
    // «Обновить» без подписки не нужен, а «Убрать» вообще не отрисовывается.
    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: "Обновить" })).toBeDisabled();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.queryByRole("button", { name: "Убрать" })
      // Закрываем выражение или список аргументов.
    ).not.toBeInTheDocument();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const add = screen.getByRole(button, { name: Добавить п….
    const add = screen.getByRole("button", { name: "Добавить подписку" });
    // Ожидаем завершение асинхронной операции await userEvent.click(add).
    await userEvent.click(add);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onAdd).toHaveBeenCalledTimes(1);
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Покупка через приложение доступна прямо с главной: «Оплат…
    // Покупка через приложение доступна прямо с главной: «Оплатить»
    // Сохраняем пояснение разработчика: // открывает модалку с тарифами.
    // открывает модалку с тарифами.
    // Обрабатываем конструкцию: const pay = screen.getByRole(button, { name: Оплатить }….
    const pay = screen.getByRole("button", { name: "Оплатить" });
    // Ожидаем завершение асинхронной операции await userEvent.click(pay).
    await userEvent.click(pay);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(handlers.onPay).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("кнопки сайта провайдера в пустом состоянии нет", () => {
    // Сохраняем пояснение разработчика: // Оплата идёт через модалку приложения: дублирующая кнопка
    // Оплата идёт через модалку приложения: дублирующая кнопка
    // Сохраняем пояснение разработчика: // «Купить на Maxima VPS» рядом с «Оплатить» только путала.
    // «Купить на Maxima VPS» рядом с «Оплатить» только путала.
    // Обрабатываем конструкцию: renderCard.
    renderCard({
      // Обрабатываем конструкцию: isLinked.
      isLinked: false,
      // Обрабатываем конструкцию: isActive.
      isActive: false,
      // Обрабатываем конструкцию: trafficUsedGb.
      trafficUsedGb: null,
      // Обрабатываем конструкцию: trafficLimitGb.
      trafficLimitGb: null,
      // Обрабатываем конструкцию: trafficPercent.
      trafficPercent: null,
      // Обрабатываем конструкцию: daysRemaining.
      daysRemaining: null,
      // Обрабатываем конструкцию: title.
      title: null,
      // Обрабатываем конструкцию: serverCount.
      serverCount: null,
      // Обрабатываем конструкцию: expiresAt.
      expiresAt: null,
      // Обрабатываем конструкцию: lastCheckedAt.
      lastCheckedAt: null,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.queryByRole("button", { name: "Купить на Maxima VPS" })
      // Закрываем выражение или список аргументов.
    ).not.toBeInTheDocument();
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Единственная кнопка покупки — «Оплатить».
    // Единственная кнопка покупки — «Оплатить».
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Оплатить" })
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("кнопка сброса трафика открывает страницу сброса в окне оплаты", async () => {
    // Обрабатываем конструкцию: const { openPaymentWindow } = await import(@/lib/vpnCom….
    const { openPaymentWindow } = await import("@/lib/vpnCommands");
    // Обрабатываем конструкцию: const mockedOpen = vi.mocked(openPaymentWindow).
    const mockedOpen = vi.mocked(openPaymentWindow);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: mockedOpen.
    mockedOpen.mockClear();
    // Обрабатываем конструкцию: renderCard.
    renderCard({ isActive: true });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const reset = screen.getByRole(button, { name: Сбросить….
    const reset = screen.getByRole("button", { name: "Сбросить трафик" });
    // Ожидаем завершение асинхронной операции await userEvent.click(reset).
    await userEvent.click(reset);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mockedOpen).toHaveBeenCalledWith(MAXIMA_TRAFFIC_RESET_URL, "Оплата");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("кнопка сброса трафика скрыта у истёкшей подписки", () => {
    // Обрабатываем конструкцию: renderCard.
    renderCard({ isActive: false });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.queryByRole("button", { name: "Сбросить трафик" })
      // Закрываем выражение или список аргументов.
    ).not.toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ошибка сети заменяет подсказку в состоянии без подписки", () => {
    // Обрабатываем конструкцию: renderCard.
    renderCard(
      // Открываем объектный литерал.
      {
        // Обрабатываем конструкцию: isLinked.
        isLinked: false,
        // Обрабатываем конструкцию: isActive.
        isActive: false,
        // Обрабатываем конструкцию: trafficUsedGb.
        trafficUsedGb: null,
        // Обрабатываем конструкцию: trafficLimitGb.
        trafficLimitGb: null,
        // Обрабатываем конструкцию: trafficPercent.
        trafficPercent: null,
        // Обрабатываем конструкцию: daysRemaining.
        daysRemaining: null,
        // Обрабатываем конструкцию: title.
        title: null,
        // Обрабатываем конструкцию: serverCount.
        serverCount: null,
        // Обрабатываем конструкцию: expiresAt.
        expiresAt: null,
        // Обрабатываем конструкцию: lastCheckedAt.
        lastCheckedAt: null,
        // Закрываем текущий блок.
      },
      // Открываем объектный литерал.
      { error: "Нет подключения к интернету" }
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Нет подключения к интернету")).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
