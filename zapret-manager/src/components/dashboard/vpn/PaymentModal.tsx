// Импортируем зависимости из модуля lucide-react.
import { Check, Sparkles } from "lucide-react";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Badge, Button, Input, Modal, Slider, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/vpnCommands.
import {
  // Подключаем именованный импорт createPaymentOrder.
  createPaymentOrder,
  // Подключаем именованный импорт findSubscriptionInMaximaPage.
  findSubscriptionInMaximaPage,
  // Подключаем именованный импорт openPaymentWindow.
  openPaymentWindow,
  // Подключаем именованный импорт paymentWindowUrl.
  paymentWindowUrl,
  // Закрываем текущий блок.
} from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/subscriptionInput.
import {
  // Подключаем именованный импорт isMaximaCabinetUrl.
  isMaximaCabinetUrl,
  // Подключаем именованный импорт isMaximaSubscriptionUrl.
  isMaximaSubscriptionUrl,
  // Подключаем именованный импорт isValidPaymentEmail.
  isValidPaymentEmail,
  // Закрываем текущий блок.
} from "@/lib/subscriptionInput";
// Импортируем зависимости из модуля @/lib/constants.
import { PAYMENT_EMAIL_CACHE_KEY } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/vpnConstants.
import { TARIFF_PLAN_LABELS } from "@/lib/vpnConstants";
// Импортируем зависимости из модуля @/stores/useToastsStore.
import { useToastsStore } from "@/stores/useToastsStore";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { TariffMatrix, TariffPlan } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface PaymentModalProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: matrix.
  matrix: TariffMatrix | null;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Сохраняем пояснение разработчика: Оплата прошла: подписку пора обновить.
  /** Оплата прошла: подписку пора обновить. */
  // Обрабатываем конструкцию: onPaid.
  onPaid: () => void;
  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Автоматическое добавление подписки: когда сайт после оплат…
   * Автоматическое добавление подписки: когда сайт после оплаты
   // Сохраняем пояснение разработчика: * перекинет окно на адрес с токеном подписки (или в кабинет)…
   * перекинет окно на адрес с токеном подписки (или в кабинет),
   // Сохраняем пояснение разработчика: * приложение само добавит её, без письма из почты.
   * приложение само добавит её, без письма из почты.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: onAutoAdded.
  onAutoAdded?: (url: string) => Promise<boolean>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Шаг опроса адреса окна оплаты: сайт перекидывает не мгновенн…
/** Шаг опроса адреса окна оплаты: сайт перекидывает не мгновенно. */
// Обрабатываем конструкцию: const PAYMENT_POLL_INTERVAL_MS = 2500.
const PAYMENT_POLL_INTERVAL_MS = 2500;
// Сохраняем пояснение разработчика: Верхний предел следилки: полчаса оплаты — нормальный срок.
/** Верхний предел следилки: полчаса оплаты — нормальный срок. */
// Обрабатываем конструкцию: const PAYMENT_POLL_MAX_MS = 30 * 60 * 1000.
const PAYMENT_POLL_MAX_MS = 30 * 60 * 1000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const HIGHLIGHT_LABELS: Record<string, TranslationKey> ….
const HIGHLIGHT_LABELS: Record<string, TranslationKey> = {
  // Обрабатываем конструкцию: popular.
  popular: "dashboard.vpn.tariff.popular",
  // Обрабатываем конструкцию: profitable.
  profitable: "dashboard.vpn.tariff.profitable",
  // Обрабатываем конструкцию: best.
  best: "dashboard.vpn.tariff.best",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FALLBACK_PLAN_LABEL: TranslationKey = dashboard.v….
const FALLBACK_PLAN_LABEL: TranslationKey = "dashboard.vpn.tariff.month1";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FALLBACK_DEVICE_COUNTS = [1, 3, 5, 7, 10].
const FALLBACK_DEVICE_COUNTS = [1, 3, 5, 7, 10];
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Первый элемент fallback-only списка — константа, чтобы не та…
/** Первый элемент fallback-only списка — константа, чтобы не тащить `| undefined`. */
// Обрабатываем конструкцию: const FALLBACK_DEVICE_COUNT = 1.
const FALLBACK_DEVICE_COUNT = 1;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Читает email последнего успешного заказа из кэша.
/** Читает email последнего успешного заказа из кэша. */
// Объявляем функцию readCachedEmail.
function readCachedEmail(): string {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const raw = window.localStorage.getItem(PAYMENT_EMAIL_C….
    const raw = window.localStorage.getItem(PAYMENT_EMAIL_CACHE_KEY);
    // — разделитель логических блоков —

    // Возвращаем результат: typeof raw === string ? raw :.
    return typeof raw === "string" ? raw : "";
    // Закрываем текущий блок.
  } catch {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Запоминает email успешного заказа.
/** Запоминает email успешного заказа. */
// Объявляем функцию writeCachedEmail.
function writeCachedEmail(email: string): void {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: window.
    window.localStorage.setItem(PAYMENT_EMAIL_CACHE_KEY, email);
    // Закрываем текущий блок.
  } catch {
    // Сохраняем пояснение разработчика: // Кэш не критичен: пользователь введёт email заново.
    // Кэш не критичен: пользователь введёт email заново.
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Модалка выбора тарифа и оплаты.
 * Модалка выбора тарифа и оплаты.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Оплата открывается внутри приложения: отдельное окно не по…
 * Оплата открывается внутри приложения: отдельное окно не получает
 // Сохраняем пояснение разработчика: * Tauri-команд и не даёт сайту доступ к настольному приложен…
 * Tauri-команд и не даёт сайту доступ к настольному приложению.
 // Сохраняем пояснение разработчика: * Состояния платежа по guid здесь нет: как только пользовате…
 * Состояния платежа по `guid` здесь нет: как только пользователь
 // Сохраняем пояснение разработчика: * закрыл окно, подписку обновляет фронт, и это единственная …
 * закрыл окно, подписку обновляет фронт, и это единственная точка
 // Сохраняем пояснение разработчика: * правды.
 * правды.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function PaymentModal({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: matrix.
  matrix,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onPaid.
  onPaid,
  // Обрабатываем конструкцию: onAutoAdded.
  onAutoAdded,
  // Закрываем текущий блок.
}: PaymentModalProps) {
  // Проверяем бизнес-условие: !open.
  if (!open) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <PaymentModalContent matrix={matrix} onClose={onClose….
  return (
    // Рендерим самозакрывающийся элемент PaymentModalContent.
    <PaymentModalContent
      // Обрабатываем конструкцию: matrix.
      matrix={matrix}
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: onPaid.
      onPaid={onPaid}
      // Обрабатываем конструкцию: onAutoAdded.
      onAutoAdded={onAutoAdded}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PaymentModalContentProps с контрактом данных.
interface PaymentModalContentProps {
  // Обрабатываем конструкцию: matrix.
  matrix: TariffMatrix | null;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Обрабатываем конструкцию: onPaid.
  onPaid: () => void;
  // Обрабатываем конструкцию: onAutoAdded.
  onAutoAdded?: ((url: string) => Promise<boolean>) | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию PaymentModalContent.
function PaymentModalContent({
  // Обрабатываем конструкцию: matrix.
  matrix,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onPaid.
  onPaid,
  // Обрабатываем конструкцию: onAutoAdded.
  onAutoAdded,
  // Закрываем текущий блок.
}: PaymentModalContentProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const deviceCounts = useMemo( () => matrix?.deviceCount….
  const deviceCounts = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => matrix?.deviceCounts ?? FALLBACK_DEVICE_COUNTS,
    // Открываем массив.
    [matrix]
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const [deviceIndex, setDeviceIndex] = useState(0).
  const [deviceIndex, setDeviceIndex] = useState(0);
  // Обрабатываем конструкцию: const [selectedPlanId, setSelectedPlanId] = useState<st….
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [accepted, setAccepted] = useState(false).
  const [accepted, setAccepted] = useState(false);
  // Обрабатываем конструкцию: const [email, setEmail] = useState(() => readCachedEmai….
  const [email, setEmail] = useState(() => readCachedEmail());
  // Обрабатываем конструкцию: const [isCreating, setIsCreating] = useState(false).
  const [isCreating, setIsCreating] = useState(false);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Подсветка неверного адреса — производное состояние: поле …
  // Подсветка неверного адреса — производное состояние: поле красное,
  // Сохраняем пояснение разработчика: // когда пользователь успел что-то ввести, а адрес ещё не го…
  // когда пользователь успел что-то ввести, а адрес ещё не годится.
  // Обрабатываем конструкцию: const emailIsBad = email.trim() !== && !isValidPaymentE….
  const emailIsBad = email.trim() !== "" && !isValidPaymentEmail(email);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const plans = useMemo(() => matrix?.plans ?? [], [matri….
  const plans = useMemo(() => matrix?.plans ?? [], [matrix]);
  // Обрабатываем конструкцию: const devices = deviceCounts[deviceIndex] ?? FALLBACK_D….
  const devices = deviceCounts[deviceIndex] ?? FALLBACK_DEVICE_COUNT;
  // Обрабатываем конструкцию: const selectedPlan = plans.find((plan) => plan.id === s….
  const selectedPlan =
    // Обрабатываем конструкцию: plans.
    plans.find((plan) => plan.id === selectedPlanId) ?? plans[0] ?? null;
  // Обрабатываем конструкцию: const activePlanId = selectedPlan?.id ?? null.
  const activePlanId = selectedPlan?.id ?? null;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const currentPrice = useMemo( () => matrix?.prices.find….
  const currentPrice = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: matrix.
      matrix?.prices.find(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (price) => price.planId === activePlanId && price.devices === devices
        // Закрываем выражение или список аргументов.
      ) ?? null,
    // Открываем массив.
    [activePlanId, devices, matrix]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const openUrl = useCallback( async (url: string): Promi….
  const openUrl = useCallback(
    // Обрабатываем конструкцию: async.
    async (url: string): Promise<boolean> => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Ожидаем завершение асинхронной операции await openPaymentWindow(url, t(dashboard.vpn.….
        await openPaymentWindow(url, t("dashboard.vpn.payment.windowTitle"));
        // Обрабатываем конструкцию: setError.
        setError(null);
        // — разделитель логических блоков —

        // Возвращаем результат: true.
        return true;
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: setError.
        setError(toErrorMessage(caught));
        // — разделитель логических блоков —

        // Возвращаем результат: false.
        return false;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const pollTimerRef = useRef<number | null>(null).
  const pollTimerRef = useRef<number | null>(null);
  // Обрабатываем конструкцию: const scrapedUrlRef = useRef<string | null>(null).
  const scrapedUrlRef = useRef<string | null>(null);
  // Обрабатываем конструкцию: const [watching, setWatching] = useState(false).
  const [watching, setWatching] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const stopWatch = useCallback((): void => { if (pollTim….
  const stopWatch = useCallback((): void => {
    // Проверяем бизнес-условие: pollTimerRef.current !== null.
    if (pollTimerRef.current !== null) {
      // Обрабатываем конструкцию: window.
      window.clearInterval(pollTimerRef.current);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: pollTimerRef.
      pollTimerRef.current = null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setWatching.
    setWatching(false);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Окно оплаты закрывается вместе с модалкой — следилка умир…
  // Окно оплаты закрывается вместе с модалкой — следилка умирает с ней.
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => stopWatch, [stopWatch]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const autoAdd = useCallback( async (url: string): Promi….
  const autoAdd = useCallback(
    // Обрабатываем конструкцию: async.
    async (url: string): Promise<boolean> => {
      // Проверяем бизнес-условие: onAutoAdded === undefined.
      if (onAutoAdded === undefined) {
        // Возвращаем результат: false.
        return false;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: stopWatch.
      stopWatch();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const added = await onAutoAdded(url).
      const added = await onAutoAdded(url);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: added.
      if (added) {
        // Обрабатываем конструкцию: useToastsStore.
        useToastsStore
          // Продолжаем цепочку вызовов.
          .getState()
          // Продолжаем цепочку вызовов.
          .push(
            // Обрабатываем конструкцию: success.
            "success",
            // Обрабатываем конструкцию: t.
            t("dashboard.vpn.payment.autoAddedTitle"),
            // Обрабатываем конструкцию: t.
            t("dashboard.vpn.payment.autoAddedBody")
            // Закрываем выражение или список аргументов.
          );
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: onPaid.
        onPaid();
        // — разделитель логических блоков —

        // Возвращаем результат: true.
        return true;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setError.
      setError(t("dashboard.vpn.payment.autoAddFailed"));
      // — разделитель логических блоков —

      // Возвращаем результат: false.
      return false;
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [onAutoAdded, onPaid, stopWatch, t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Опрос адреса окна оплаты.
   * Опрос адреса окна оплаты.
   // Сохраняем пояснение разработчика: *
   *
   // Сохраняем пояснение разработчика: * Сайт после платежа перекидывает браузер на кабинет или сра…
   * Сайт после платежа перекидывает браузер на кабинет или сразу на
   // Сохраняем пояснение разработчика: * страницу с токеном подписки: как только в адресе появляетс…
   * страницу с токеном подписки: как только в адресе появляется
   // Сохраняем пояснение разработчика: * подписка — она добавляется сама; если открылся autologin-к…
   * подписка — она добавляется сама; если открылся autologin-кабинет,
   // Сохраняем пояснение разработчика: * backend один раз заглядывает в его разметку за тем же токе…
   * backend один раз заглядывает в его разметку за тем же токеном.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: const watchPage = useCallback((): void => { if (pollTim….
  const watchPage = useCallback((): void => {
    // Проверяем бизнес-условие: pollTimerRef.current !== null.
    if (pollTimerRef.current !== null) {
      // Обрабатываем конструкцию: window.
      window.clearInterval(pollTimerRef.current);
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const startedAt = Date.now().
    const startedAt = Date.now();
    // Обрабатываем конструкцию: setWatching.
    setWatching(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: pollTimerRef.
    pollTimerRef.current = window.setInterval(() => {
      // Обрабатываем конструкцию: void (async () => { if (Date.now() - startedAt > PAYMEN….
      void (async () => {
        // Проверяем бизнес-условие: Date.now() - startedAt > PAYMENT_POLL_MAX_MS.
        if (Date.now() - startedAt > PAYMENT_POLL_MAX_MS) {
          // Обрабатываем конструкцию: stopWatch.
          stopWatch();
          // — разделитель логических блоков —

          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: let raw: string | null.
        let raw: string | null;
        // — разделитель логических блоков —

        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Обрабатываем конструкцию: raw.
          raw = await paymentWindowUrl();
          // Закрываем текущий блок.
        } catch {
          // Обрабатываем конструкцию: raw.
          raw = null;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: raw === null.
        if (raw === null) {
          // Сохраняем пояснение разработчика: // Окно оплаты закрыли: следить больше не за чем, повторный
          // Окно оплаты закрыли: следить больше не за чем, повторный
          // Сохраняем пояснение разработчика: // клик запустит следилку заново.
          // клик запустит следилку заново.
          // Обрабатываем конструкцию: stopWatch.
          stopWatch();
          // — разделитель логических блоков —

          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: isMaximaSubscriptionUrl(raw).
        if (isMaximaSubscriptionUrl(raw)) {
          // Ожидаем завершение асинхронной операции await autoAdd(raw).
          await autoAdd(raw);
          // — разделитель логических блоков —

          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: !isMaximaCabinetUrl(raw) || scrapedUrlRef.current === r….
        if (!isMaximaCabinetUrl(raw) || scrapedUrlRef.current === raw) {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: scrapedUrlRef.
        scrapedUrlRef.current = raw;
        // — разделитель логических блоков —

        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Обрабатываем конструкцию: const found = await findSubscriptionInMaximaPage(raw).
          const found = await findSubscriptionInMaximaPage(raw);
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: found !== null && isMaximaSubscriptionUrl(found).
          if (found !== null && isMaximaSubscriptionUrl(found)) {
            // Ожидаем завершение асинхронной операции await autoAdd(found).
            await autoAdd(found);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        } catch {
          // Сохраняем пояснение разработчика: // Кабинет не отдал разметку — подписка добавится вручную.
          // Кабинет не отдал разметку — подписка добавится вручную.
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })();
      // Закрываем текущий блок.
    }, PAYMENT_POLL_INTERVAL_MS);
    // Закрываем текущий блок.
  }, [autoAdd, stopWatch]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handlePay = useCallback(async (): Promise<void> =….
  const handlePay = useCallback(async (): Promise<void> => {
    // Проверяем бизнес-условие: currentPrice === null.
    if (currentPrice === null) return;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const planId = activePlanId.
    const planId = activePlanId;
    // Обрабатываем конструкцию: const trimmedEmail = email.trim().
    const trimmedEmail = email.trim();
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: planId === null.
    if (planId === null) return;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !isValidPaymentEmail(trimmedEmail).
    if (!isValidPaymentEmail(trimmedEmail)) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setIsCreating.
    setIsCreating(true);
    // Обрабатываем конструкцию: setError.
    setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Сохраняем пояснение разработчика: // Заказ создаётся при каждом клике: ссылки оплаты живут
      // Заказ создаётся при каждом клике: ссылки оплаты живут
      // Сохраняем пояснение разработчика: // недолго, вшитые протухали, пока пользователь выбирал тари…
      // недолго, вшитые протухали, пока пользователь выбирал тариф.
      // Обрабатываем конструкцию: const order = await createPaymentOrder(planId, devices,….
      const order = await createPaymentOrder(planId, devices, trimmedEmail);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: writeCachedEmail.
      writeCachedEmail(trimmedEmail);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: await openUrl(order.url).
      if (await openUrl(order.url)) {
        // Обрабатываем конструкцию: onPaid.
        onPaid();
        // Обрабатываем конструкцию: watchPage.
        watchPage();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsCreating.
      setIsCreating(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [activePlanId, currentPrice, devices, email, onPaid, openUrl, watchPage]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open onClose={onClose} title={t(dashboard.vpn.….
  return (
    // Обрабатываем конструкцию: <Modal open onClose={onClose} title={t(dashboard.vpn.pa….
    <Modal
      // Задаём атрибут open элемента.
      open
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: title.
      title={t("dashboard.vpn.payment.title")}
      // Обрабатываем конструкцию: description.
      description={t("dashboard.vpn.payment.subtitle")}
      // Обрабатываем конструкцию: size.
      size="lg"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-5">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="label" className="text-text-primary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.vpn.payment.devices")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Slider
            // Задаём атрибут headroom элемента.
            headroom
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("dashboard.vpn.payment.devicesAria")}
            // Обрабатываем конструкцию: min.
            min={0}
            // Обрабатываем конструкцию: max.
            max={deviceCounts.length - 1}
            // Обрабатываем конструкцию: step.
            step={1}
            // Обрабатываем конструкцию: value.
            value={deviceIndex}
            // Обрабатываем конструкцию: formatValue.
            formatValue={
              // Продолжаем предыдущую конструкцию.
              (index) =>
                // Обрабатываем конструкцию: (deviceCounts[index] ?? FALLBACK_DEVICE_COUNT).
                (deviceCounts[index] ?? FALLBACK_DEVICE_COUNT).toString()
              // Закрываем текущий блок.
            }
            // Обрабатываем конструкцию: onCommit.
            onCommit={(index) => setDeviceIndex(index)}
            // Обрабатываем конструкцию: onChange.
            onChange={(index) => setDeviceIndex(index)}
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <p className="text-text-tertiary text-xs">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.vpn.payment.devicesHint", { devices })}
            {/* Выводим текстовое содержимое в JSX. */}
          </p>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* Выводим текстовое содержимое в JSX. */}
          {plans.map((plan) => {
            // Обрабатываем конструкцию: const price = matrix?.prices.find( (item) => item.planI….
            const price = matrix?.prices.find(
              // Объявляем функцию-обработчик или стрелочную функцию.
              (item) => item.planId === plan.id && item.devices === devices
              // Закрываем выражение или список аргументов.
            );
            // Обрабатываем конструкцию: const isActive = plan.id === activePlanId.
            const isActive = plan.id === activePlanId;
            // — разделитель логических блоков —

            // Возвращаем результат: ( <TariffCard key={plan.id} plan={plan} total={price?.t….
            return (
              // Рендерим самозакрывающийся элемент TariffCard.
              <TariffCard
                // Обрабатываем конструкцию: key.
                key={plan.id}
                // Обрабатываем конструкцию: plan.
                plan={plan}
                // Обрабатываем конструкцию: total.
                total={price?.total ?? plan.basePrice}
                // Обрабатываем конструкцию: perMonth.
                perMonth={price?.perMonth ?? plan.basePrice}
                // Обрабатываем конструкцию: isActive.
                isActive={isActive}
                // Обрабатываем конструкцию: onSelect.
                onSelect={() => {
                  // Обрабатываем конструкцию: setSelectedPlanId.
                  setSelectedPlanId(plan.id);
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              />
              // Закрываем выражение или список аргументов.
            );
            // Закрываем текущий блок.
          })}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Input
          // Задаём атрибут data-focus-quiet элемента.
          data-focus-quiet
          // Обрабатываем конструкцию: type.
          type="email"
          // Обрабатываем конструкцию: label.
          label={t("dashboard.vpn.payment.email")}
          // Обрабатываем конструкцию: placeholder.
          placeholder={t("dashboard.vpn.payment.emailPlaceholder")}
          // Обрабатываем конструкцию: hint.
          hint={emailIsBad ? undefined : t("dashboard.vpn.payment.emailHint")}
          // Обрабатываем конструкцию: value.
          value={email}
          // Обрабатываем конструкцию: autoComplete.
          autoComplete="email"
          // Обрабатываем конструкцию: spellCheck.
          spellCheck={false}
          // Обрабатываем конструкцию: disabled.
          disabled={isCreating}
          // Обрабатываем конструкцию: error.
          error={emailIsBad}
          // Обрабатываем конструкцию: errorMessage.
          errorMessage={
            // Обрабатываем конструкцию: emailIsBad.
            emailIsBad ? t("dashboard.vpn.payment.emailInvalid") : undefined
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: setEmail.
            setEmail(event.target.value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <label className="text-text-secondary flex cursor-pointer items-start gap-2 text-xs">
          {/* Выводим текстовое содержимое в JSX. */}
          <input
            // Обрабатываем конструкцию: type.
            type="checkbox"
            // Обрабатываем конструкцию: checked.
            checked={accepted}
            // Обрабатываем конструкцию: onChange.
            onChange={(event) => {
              // Обрабатываем конструкцию: setAccepted.
              setAccepted(event.target.checked);
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: className.
            className="accent-accent-primary mt-0.5 size-4 shrink-0 rounded"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <span>{t("dashboard.vpn.payment.terms")}</span>
          {/* Выводим текстовое содержимое в JSX. */}
        </label>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {error !== null ? (
          // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-dan….
          <Text variant="caption" size="sm" className="text-accent-danger">
            {/* Выводим текстовое содержимое в JSX. */}
            {error}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {watching && error === null ? (
          // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-pri….
          <Text variant="caption" size="sm" className="text-accent-primary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.vpn.payment.watchHint")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: variant.
          variant="primary"
          // Задаём атрибут fullWidth элемента.
          fullWidth
          // Обрабатываем конструкцию: disabled.
          disabled={
            // Изменяем значение выражения !accepted.
            !accepted ||
            // Обрабатываем конструкцию: currentPrice.
            currentPrice === null ||
            // Обрабатываем конструкцию: isCreating.
            isCreating ||
            // Изменяем значение выражения !isValidPaymentEmail(email).
            !isValidPaymentEmail(email)
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: aria-busy.
          aria-busy={isCreating}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void handlePay().
            void handlePay();
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.vpn.payment.pay", {
            // Обрабатываем конструкцию: price.
            price: currentPrice?.total ?? 0,
            // Закрываем текущий блок.
          })}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.vpn.payment.inAppHint")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс TariffCardProps с контрактом данных.
interface TariffCardProps {
  // Обрабатываем конструкцию: plan.
  plan: TariffPlan;
  // Обрабатываем конструкцию: total.
  total: number;
  // Обрабатываем конструкцию: perMonth.
  perMonth: number;
  // Обрабатываем конструкцию: isActive.
  isActive: boolean;
  // Обрабатываем конструкцию: onSelect.
  onSelect: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию TariffCard.
function TariffCard({
  // Обрабатываем конструкцию: plan.
  plan,
  // Обрабатываем конструкцию: total.
  total,
  // Обрабатываем конструкцию: perMonth.
  perMonth,
  // Обрабатываем конструкцию: isActive.
  isActive,
  // Обрабатываем конструкцию: onSelect.
  onSelect,
  // Закрываем текущий блок.
}: TariffCardProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const label = TARIFF_PLAN_LABELS[plan.id] ?? FALLBACK_P….
  const label = TARIFF_PLAN_LABELS[plan.id] ?? FALLBACK_PLAN_LABEL;
  // Обрабатываем конструкцию: const highlight = HIGHLIGHT_LABELS[plan.highlight] ?? n….
  const highlight = HIGHLIGHT_LABELS[plan.highlight] ?? null;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <button type=button onClick={onSelect} aria-pressed={….
  return (
    // Обрабатываем конструкцию: <button type=button onClick={onSelect} aria-pressed={is….
    <button
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: onClick.
      onClick={onSelect}
      // Обрабатываем конструкцию: aria-pressed.
      aria-pressed={isActive}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: relative flex flex-col items-start gap-1 rounded-lg bor….
        "relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left",
        // Обрабатываем конструкцию: transition-colors duration-200 ease-out.
        "transition-colors duration-200 ease-out",
        // Обрабатываем конструкцию: isActive.
        isActive
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            "border-accent-primary bg-accent-primary/10"
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            "border-glass-border bg-glass-bg hover:border-accent-primary/50"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {highlight !== null ? (
        // Обрабатываем конструкцию: <Badge variant={plan.highlight === best ? accent : info….
        <Badge
          // Обрабатываем конструкцию: variant.
          variant={plan.highlight === "best" ? "accent" : "info"}
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: className.
          className="absolute -top-2 right-2"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Sparkles aria-hidden="true" className="size-3" />
          {/* Выводим текстовое содержимое в JSX. */}
          {t(highlight)}
          {/* Выводим текстовое содержимое в JSX. */}
        </Badge>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-primary text-sm font-medium">{t(label)}</span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-primary text-lg font-semibold">{total} ₽</span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary text-xs">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("dashboard.vpn.payment.perMonth", { price: perMonth })}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {isActive ? (
        // Рендерим самозакрывающийся элемент Check.
        <Check
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="text-accent-primary absolute right-2 bottom-2 size-4"
          // Продолжаем выражение.
        />
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </button>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
