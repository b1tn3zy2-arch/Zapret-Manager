// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { ClipboardPaste, SquareArrowOutUpRight } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Input, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/vpnCommands.
import { openPaymentWindow } from "@/lib/vpnCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/lib/subscriptionInput.
import { parseSubscriptionInput } from "@/lib/subscriptionInput";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AddSubscriptionModalProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: isSaving.
  isSaving: boolean;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Обрабатываем конструкцию: onSubmit.
  onSubmit: (url: string) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Модалка добавления подписки.
 * Модалка добавления подписки.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Пользователь вставляет что угодно: ссылку из письма или пи…
 * Пользователь вставляет что угодно: ссылку из письма или письмо целиком —
 // Сохраняем пояснение разработчика: * из текста извлекается первая ссылка с путём (это токен под…
 * из текста извлекается первая ссылка с путём (это токен подписки), адрес
 // Сохраняем пояснение разработчика: * сайта без пути и пустая вставка получают отдельную подсказ…
 * сайта без пути и пустая вставка получают отдельную подсказку. Страница
 // Сохраняем пояснение разработчика: * веб-почты (адрес из адресной строки) тоже не подписка — на…
 * веб-почты (адрес из адресной строки) тоже не подписка — настоящая ссылка
 // Сохраняем пояснение разработчика: * внутри текста письма, и для такой вставки есть своя подска…
 * внутри текста письма, и для такой вставки есть своя подсказка.
 // Сохраняем пояснение разработчика: * Приветственное письмо Maxima содержит только ссылку на лич…
 * Приветственное письмо Maxima содержит только ссылку на личный кабинет —
 // Сохраняем пояснение разработчика: * модалка открывает кабинет во встроенном окне, где пользова…
 * модалка открывает кабинет во встроенном окне, где пользователь копирует
 // Сохраняем пояснение разработчика: * ссылку подписки. Проверки хоста и формата делает backend: …
 * ссылку подписки. Проверки хоста и формата делает backend: ссылка не
 // Сохраняем пояснение разработчика: * валидируется здесь дважды.
 * валидируется здесь дважды.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function AddSubscriptionModal({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: isSaving.
  isSaving,
  // Обрабатываем конструкцию: error.
  error,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: onSubmit.
  onSubmit,
  // Закрываем текущий блок.
}: AddSubscriptionModalProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [raw, setRaw] = useState().
  const [raw, setRaw] = useState("");
  // Обрабатываем конструкцию: const [localError, setLocalError] = useState<string | n….
  const [localError, setLocalError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Разбор не мемоизируется: регулярки по короткой строке деш…
  // Разбор не мемоизируется: регулярки по короткой строке дешевле,
  // Сохраняем пояснение разработчика: // чем согласование зависимостей useMemo с ранним возвратом …
  // чем согласование зависимостей useMemo с ранним возвратом модалки.
  // Обрабатываем конструкцию: const parsed = open ? parseSubscriptionInput(raw) : nul….
  const parsed = open ? parseSubscriptionInput(raw) : null;
  // Обрабатываем конструкцию: const cabinetUrl = parsed?.kind === cabinet ? parsed.ur….
  const cabinetUrl = parsed?.kind === "cabinet" ? parsed.url : null;
  // Обрабатываем конструкцию: const mailbox = parsed?.kind === mailbox.
  const mailbox = parsed?.kind === "mailbox";
  // Обрабатываем конструкцию: const canSubmit = !isSaving && parsed?.kind === link.
  const canSubmit = !isSaving && parsed?.kind === "link";
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !open.
  if (!open) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const submit = (): void => { if (parsed?.kind === link ….
  const submit = (): void => {
    // Проверяем бизнес-условие: parsed?.kind === link && parsed.url !== null.
    if (parsed?.kind === "link" && parsed.url !== null) {
      // Обрабатываем конструкцию: onSubmit.
      onSubmit(parsed.url);
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setLocalError.
    setLocalError(
      // Обрабатываем конструкцию: parsed.
      parsed?.kind === "site-root"
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          t("dashboard.vpn.addSubscription.siteRoot")
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          t("dashboard.vpn.addSubscription.empty")
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const openCabinet = async (): Promise<void> => { if (ca….
  const openCabinet = async (): Promise<void> => {
    // Проверяем бизнес-условие: cabinetUrl === null.
    if (cabinetUrl === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await openPaymentWindow( cabinetUrl, t(dashbo….
      await openPaymentWindow(
        // Обрабатываем конструкцию: cabinetUrl.
        cabinetUrl,
        // Обрабатываем конструкцию: t.
        t("dashboard.vpn.payment.cabinetTitle")
        // Закрываем выражение или список аргументов.
      );
      // Обрабатываем конструкцию: setLocalError.
      setLocalError(null);
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setLocalError.
      setLocalError(
        // Обрабатываем конструкцию: t.
        t("dashboard.vpn.addSubscription.cabinetFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        })
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Modal open onClose={onClose} title={t(dashboard.vpn.….
  return (
    // Обрабатываем конструкцию: <Modal open onClose={onClose} title={t(dashboard.vpn.ad….
    <Modal
      // Задаём атрибут open элемента.
      open
      // Обрабатываем конструкцию: onClose.
      onClose={onClose}
      // Обрабатываем конструкцию: title.
      title={t("dashboard.vpn.addSubscription.title")}
      // Обрабатываем конструкцию: description.
      description={t("dashboard.vpn.addSubscription.hint")}
      // Обрабатываем конструкцию: size.
      size="sm"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <Input
          // Задаём атрибут data-focus-quiet элемента.
          data-focus-quiet
          // Обрабатываем конструкцию: type.
          type="text"
          // Обрабатываем конструкцию: label.
          label={t("dashboard.vpn.addSubscription.url")}
          // Обрабатываем конструкцию: placeholder.
          placeholder={t("dashboard.vpn.addSubscription.placeholder")}
          // Обрабатываем конструкцию: value.
          value={raw}
          // Обрабатываем конструкцию: error.
          error={error !== null || localError !== null}
          // Обрабатываем конструкцию: errorMessage.
          errorMessage={error ?? localError ?? undefined}
          // Обрабатываем конструкцию: onKeyDown.
          onKeyDown={(event) => {
            // Проверяем бизнес-условие: event.key === Enter && canSubmit.
            if (event.key === "Enter" && canSubmit) {
              // Обрабатываем конструкцию: void submit().
              void submit();
              // Закрываем текущий блок.
            }
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: setRaw.
            setRaw(event.target.value);
            // Обрабатываем конструкцию: setLocalError.
            setLocalError(null);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {mailbox ? (
          // Обрабатываем конструкцию: <div className=border-glass-border bg-bg-tertiary/60 fl….
          <div className="border-glass-border bg-bg-tertiary/60 flex flex-col gap-2 rounded-xl border p-3">
            {/* Выводим текстовое содержимое в JSX. */}
            <Text variant="caption" size="sm" className="text-text-secondary">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("dashboard.vpn.addSubscription.mailboxHint")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {cabinetUrl !== null ? (
          // Обрабатываем конструкцию: <div className=border-glass-border bg-bg-tertiary/60 fl….
          <div className="border-glass-border bg-bg-tertiary/60 flex flex-col gap-2 rounded-xl border p-3">
            {/* Выводим текстовое содержимое в JSX. */}
            <Text variant="caption" size="sm" className="text-text-secondary">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("dashboard.vpn.addSubscription.cabinetHint")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: size.
              size="sm"
              // Обрабатываем конструкцию: variant.
              variant="secondary"
              // Обрабатываем конструкцию: icon.
              icon={
                // Рендерим самозакрывающийся элемент SquareArrowOutUpRight.
                <SquareArrowOutUpRight aria-hidden="true" className="size-4" />
                // Закрываем текущий блок.
              }
              // Обрабатываем конструкцию: disabled.
              disabled={isSaving}
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: void openCabinet().
                void openCabinet();
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("dashboard.vpn.addSubscription.cabinetOpen")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: icon.
          icon={<ClipboardPaste aria-hidden="true" className="size-4" />}
          // Обрабатываем конструкцию: disabled.
          disabled={isSaving}
          // Обрабатываем конструкцию: onClick.
          onClick={async () => {
            // Пробуем выполнить блок с обработкой ошибок.
            try {
              // Обрабатываем конструкцию: const value = await window.navigator.clipboard.readText….
              const value = await window.navigator.clipboard.readText();
              // — разделитель логических блоков —

              // Обрабатываем конструкцию: setRaw.
              setRaw(value);
              // Обрабатываем конструкцию: setLocalError.
              setLocalError(null);
              // Закрываем текущий блок.
            } catch {
              // Сохраняем пояснение разработчика: // Отсутствие доступа к буферу — спокойно: пользователь
              // Отсутствие доступа к буферу — спокойно: пользователь
              // Сохраняем пояснение разработчика: // может вставить значение вручную.
              // может вставить значение вручную.
              // Закрываем текущий блок.
            }
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("dashboard.vpn.addSubscription.paste")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex justify-end gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <Button size="sm" variant="ghost" onClick={onClose}>
            {/* Выводим текстовое содержимое в JSX. */}
            {t("dashboard.vpn.addSubscription.cancel")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="primary"
            // Обрабатываем конструкцию: disabled.
            disabled={!canSubmit}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: submit.
              submit();
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {isSaving
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                t("dashboard.vpn.addSubscription.checking")
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                t("dashboard.vpn.addSubscription.submit")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Modal>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
