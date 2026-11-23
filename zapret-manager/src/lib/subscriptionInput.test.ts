// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./subscriptionInput.
import {
  // Подключаем именованный импорт isValidPaymentEmail.
  isValidPaymentEmail,
  // Подключаем именованный импорт parseSubscriptionInput.
  parseSubscriptionInput,
  // Закрываем текущий блок.
} from "./subscriptionInput";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("parseSubscriptionInput", () => {
  // Обрабатываем конструкцию: it.
  it("извлекает ссылку из письма целиком", () => {
    // Обрабатываем конструкцию: const letter = [ Здравствуйте!, Ваша подписка активна.,….
    const letter = [
      // Обрабатываем конструкцию: Здравствуйте!.
      "Здравствуйте!",
      // Обрабатываем конструкцию: Ваша подписка активна..
      "Ваша подписка активна.",
      // Обрабатываем конструкцию: Личный кабинет: https://maximavps.cloud/api/v1/client/s….
      "Личный кабинет: https://maximavps.cloud/api/v1/client/subscribe?token=abc123",
      // Обрабатываем конструкцию: Приятной игры!.
      "Приятной игры!",
      // Закрываем массив или список.
    ].join("\n");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput(letter)).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/api/v1/client/subscribe?token=abc123",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("предпочитает ссылку с путём адресу сайта", () => {
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( Сайт: https://ma….
    const parsed = parseSubscriptionInput(
      // Обрабатываем конструкцию: Сайт: https://maxima-vps.online/ Кабинет: https://maxim….
      "Сайт: https://maxima-vps.online/ Кабинет: https://maximavps.cloud/sub/tok"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/sub/tok",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("восстанавливает схему у адреса с путём", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("maximavps.cloud/sub/токен")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/sub/токен",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("голый адрес сайта опознаётся как сайт", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("https://maxima-vps.online/")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "site-root",
      // Обрабатываем конструкцию: url.
      url: "https://maxima-vps.online/",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пустая вставка — нет ссылки", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("   ")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "none",
      // Обрабатываем конструкцию: url.
      url: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("текст без ссылок — сайт без адреса", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("У меня не работает программа")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "site-root",
      // Обрабатываем конструкцию: url.
      url: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("страница почты — не подписка, нужна подсказка", () => {
    // Сохраняем пояснение разработчика: // Пользователь копирует адрес письма из адресной строки поч…
    // Пользователь копирует адрес письма из адресной строки почты:
    // Сохраняем пояснение разработчика: // внутри него нет ничего о подписке — настоящий адрес в тек…
    // внутри него нет ничего о подписке — настоящий адрес в тексте.
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( https://app.mail….
    const parsed = parseSubscriptionInput(
      // Обрабатываем конструкцию: https://app.mail.ru/mail/search/inbox/1:e46d2f478c9ffd0….
      "https://app.mail.ru/mail/search/inbox/1:e46d2f478c9ffd0/?back=1&q=maximavps.cloud"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed.kind).toBe("mailbox");
    // Обрабатываем конструкцию: expect.
    expect(parsed.url).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("почта без схемы тоже распознаётся как почта", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("mail.yandex.ru/messages/inbox")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "mailbox",
      // Обрабатываем конструкцию: url.
      url: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("если в письме есть и почта, и Maxima — побеждает Maxima", () => {
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( [ https://app.ma….
    const parsed = parseSubscriptionInput(
      // Открываем массив.
      [
        // Обрабатываем конструкцию: https://app.mail.ru/mail/search/inbox/1:e46d2f478c9ffd0….
        "https://app.mail.ru/mail/search/inbox/1:e46d2f478c9ffd0/?back=1",
        // Обрабатываем конструкцию: Кабинет: https://maximavps.cloud/?autologin=user@mail.r….
        "Кабинет: https://maximavps.cloud/?autologin=user@mail.ru",
        // Закрываем массив или список.
      ].join("\n")
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed.kind).toBe("cabinet");
    // Обрабатываем конструкцию: expect.
    expect(parsed.url).toBe("https://maximavps.cloud/?autologin=user@mail.ru");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обрезает знаки препинания вокруг ссылки", () => {
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( Ссылка: (https:/….
    const parsed = parseSubscriptionInput(
      // Обрабатываем конструкцию: Ссылка: (https://maximavps.cloud/sub/tok), око.
      "Ссылка: (https://maximavps.cloud/sub/tok), око"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed.kind).toBe("link");
    // Обрабатываем конструкцию: expect.
    expect(parsed.url).toBe("https://maximavps.cloud/sub/tok");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("приветственное письмо распознаётся как личный кабинет", () => {
    // Обрабатываем конструкцию: const letter = [ Добро пожаловать в MaximaVPS!, Войти в….
    const letter = [
      // Обрабатываем конструкцию: Добро пожаловать в MaximaVPS!.
      "Добро пожаловать в MaximaVPS!",
      // Обрабатываем конструкцию: Войти в личный кабинет: https://maximavps.cloud/ru/dash….
      "Войти в личный кабинет: https://maximavps.cloud/ru/dashboard",
      // Обрабатываем конструкцию: Открыть инструкции: https://maximavps.cloud/help/first-….
      "Открыть инструкции: https://maximavps.cloud/help/first-steps",
      // Обрабатываем конструкцию: Привязать Telegram: https://maximavps.cloud/telegram/li….
      "Привязать Telegram: https://maximavps.cloud/telegram/link",
      // Закрываем массив или список.
    ].join("\n");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput(letter)).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "cabinet",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/ru/dashboard",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ссылка с токеном подписки не считается кабинетом", () => {
    // Перебираем элементы коллекции [ https://maximavps.cloud/sub/tok123, https:/….
    for (const url of [
      // Обрабатываем конструкцию: https://maximavps.cloud/sub/tok123.
      "https://maximavps.cloud/sub/tok123",
      // Обрабатываем конструкцию: https://maximacloud.online/subscribe?token=abc.
      "https://maximacloud.online/subscribe?token=abc",
      // Обрабатываем конструкцию: https://panel.maxima-vps.online/api/v1/client/subscribe….
      "https://panel.maxima-vps.online/api/v1/client/subscribe?token=z",
      // Закрываем массив или список.
    ]) {
      // Обрабатываем конструкцию: expect.
      expect(parseSubscriptionInput(url).kind, url).toBe("link");
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("кабинет на поддомене Maxima тоже распознаётся", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: parseSubscriptionInput.
      parseSubscriptionInput("https://cabinet.maximacloud.online/ru")
      // Закрываем выражение или список аргументов.
    ).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "cabinet",
      // Обрабатываем конструкцию: url.
      url: "https://cabinet.maximacloud.online/ru",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ссылка со знаком вопроса token= считается подпиской", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: parseSubscriptionInput.
      parseSubscriptionInput("https://maximavps.cloud/get-sub?token=key")
      // Закрываем выражение или список аргументов.
    ).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/get-sub?token=key",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("короткий домен подписок maxima.run — это подписка", () => {
    // Сохраняем пояснение разработчика: // Настоящая ссылка подписки из кабинета: кнопка «Скопироват…
    // Настоящая ссылка подписки из кабинета: кнопка «Скопировать
    // Сохраняем пояснение разработчика: // ссылку подписки» отдаёт адрес именно короткого домена max…
    // ссылку подписки» отдаёт адрес именно короткого домена maxima.run.
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("https://maxima.run/PCDqYMIF")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maxima.run/PCDqYMIF",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("поддомен maxima.run с токеном тоже подписка", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("https://sub.maxima.run/PCDqYMIF")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://sub.maxima.run/PCDqYMIF",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("марзбан-путь на maxima.run считается подпиской", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("https://maxima.run/sub/tok123")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maxima.run/sub/tok123",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("страница сайта maxima.run подпиской не считается", () => {
    // Сохраняем пояснение разработчика: // Слово-путь сайта — не токен подписки: открываем как кабин…
    // Слово-путь сайта — не токен подписки: открываем как кабинет,
    // Сохраняем пояснение разработчика: // а не пытаемся добавить.
    // а не пытаемся добавить.
    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput("https://maxima.run/dashboard")).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "cabinet",
      // Обрабатываем конструкцию: url.
      url: "https://maxima.run/dashboard",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("трекер Mail.ru/Яндекса разворачивается до autologin-кабинета", () => {
    // Сохраняем пояснение разработчика: // Настоящая кнопка «Войти в личный кабинет» из письма Maxim…
    // Настоящая кнопка «Войти в личный кабинет» из письма MaximaVPS:
    // Сохраняем пояснение разработчика: // почтовики прячут настоящий адрес в параметре s своего ред…
    // почтовики прячут настоящий адрес в параметре s своего редиректа.
    // Обрабатываем конструкцию: const letter = [ <a, href=https://postbox.yandexcloud.n….
    const letter = [
      // Обрабатываем конструкцию: <a.
      "<a",
      // Обрабатываем конструкцию: href=https://postbox.yandexcloud.net/tracking/v2/click?….
      ' href="https://postbox.yandexcloud.net/tracking/v2/click?h=d8f7ac054c61e1280d260e28437fa0de&amp;i=0&amp;s=https%3A%2F%2Fmaximavps.cloud%2F%3Fautologin%3Di-grafovi%2540list.ru&amp;sig=QqQJrHx1zF43"',
      // Обрабатываем конструкцию: class=btn_mr_css_attr rel=noopener noreferrer.
      ' class="btn_mr_css_attr" rel="noopener noreferrer"',
      // Обрабатываем конструкцию: >Войти в личный кабинет</a>.
      ">Войти в личный кабинет</a>",
      // Закрываем массив или список.
    ].join("");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parseSubscriptionInput(letter)).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "cabinet",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/?autologin=i-grafovi%40list.ru",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("трекер с сырой не-процентной ссылкой разворачивается тоже", () => {
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( https://click.ma….
    const parsed = parseSubscriptionInput(
      // Обрабатываем конструкцию: https://click.mail.ru/redirect?url=https://maximavps.cl….
      "https://click.mail.ru/redirect?url=https://maximavps.cloud/?autologin=user@mail.ru"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed.kind).toBe("cabinet");
    // Обрабатываем конструкцию: expect.
    expect(parsed.url).toBe("https://maximavps.cloud/?autologin=user@mail.ru");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("трекер вокруг настоящей подписки отдаёт подписку", () => {
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( https://postbox.….
    const parsed = parseSubscriptionInput(
      // Обрабатываем конструкцию: https://postbox.yandexcloud.net/tracking/v2/click?i=0&s….
      "https://postbox.yandexcloud.net/tracking/v2/click?i=0&s=https%3A%2F%2Fmaximavps.cloud%2Fsub%2Ftok12345"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "link",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/sub/tok12345",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("двойная процентная кодировка трекера разворачивается", () => {
    // Обрабатываем конструкцию: const parsed = parseSubscriptionInput( https://t.exampl….
    const parsed = parseSubscriptionInput(
      // Обрабатываем конструкцию: https://t.example.com/c?u=https%3a%2f%2fmaximavps.cloud….
      "https://t.example.com/c?u=https%3a%2f%2fmaximavps.cloud%3fautologin%3dme%2540list.ru"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "cabinet",
      // Обрабатываем конструкцию: url.
      url: "https://maximavps.cloud/?autologin=me%40list.ru",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidPaymentEmail", () => {
  // Обрабатываем конструкцию: it.
  it("принимает обычные адреса и обрезает пробелы", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@example.com")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("  spaced@example.com  ")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("a.b-c_d+tag@sub.domain.ru")).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет мусор так же, как backend", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("no-at-sign")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("@example.com")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@nodot")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@.example.com")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@example..com")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@exa mple.com")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPaymentEmail("user@two@example.com")).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
